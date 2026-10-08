package com.carerelay.referral.service;

import com.carerelay.referral.entity.*;
import com.carerelay.referral.event.*;
import com.carerelay.referral.kafka.ReferralEventPublisher;
import com.carerelay.referral.repository.ReferralRepository;
import com.carerelay.referral.repository.SagaLogRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SagaOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(SagaOrchestrator.class);

    private final ReferralRepository referralRepository;
    private final SagaLogRepository sagaLogRepository;
    private final ReferralEventPublisher eventPublisher;

    public SagaOrchestrator(ReferralRepository referralRepository,
                            SagaLogRepository sagaLogRepository,
                            ReferralEventPublisher eventPublisher) {
        this.referralRepository = referralRepository;
        this.sagaLogRepository = sagaLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void executeStep1Initiate(Referral referral) {
        log.info("Saga Step 1: Initiating referral {}", referral.getId());
        referral.setStatus(ReferralStatus.PENDING);
        referral.setSagaStep(SagaStep.AWAITING_ACCEPTANCE);
        referralRepository.save(referral);

        sagaLogRepository.save(new SagaLog(
                referral.getId(),
                "INITIATE_REFERRAL",
                SagaStepStatus.SUCCEEDED,
                "Referral initiated with urgency " + referral.getUrgency()
        ));

        eventPublisher.publishReferralCreated(ReferralCreatedEvent.of(
                referral.getId(),
                referral.getPatientId(),
                referral.getReferringDoctorId(),
                referral.getReceivingDoctorId(),
                referral.getReferringDepartment(),
                referral.getReceivingDepartment(),
                referral.getUrgency().name(),
                referral.getSlaDeadline()
        ));
    }

    @Transactional
    @CircuitBreaker(name = "patientRecordService", fallbackMethod = "handleStep2Fallback")
    @Retry(name = "patientRecordService")
    public Referral executeStep2Accept(UUID referralId, UUID acceptingDoctorId) {
        log.info("Saga Step 2: Accepting referral {}", referralId);
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new IllegalArgumentException("Referral not found: " + referralId));

        if (referral.getStatus() != ReferralStatus.PENDING) {
            throw new IllegalStateException("Only PENDING referrals can be accepted. Current: " + referral.getStatus());
        }

        referral.setStatus(ReferralStatus.ACCEPTED);
        referral.setSagaStep(SagaStep.RECORD_TRANSFER_REQUESTED);
        Referral updated = referralRepository.save(referral);

        sagaLogRepository.save(new SagaLog(
                referralId,
                "ACCEPT_REFERRAL",
                SagaStepStatus.SUCCEEDED,
                "Doctor " + acceptingDoctorId + " accepted referral"
        ));

        eventPublisher.publishReferralAccepted(ReferralAcceptedEvent.of(referralId, acceptingDoctorId));
        return updated;
    }

    public Referral handleStep2Fallback(UUID referralId, UUID acceptingDoctorId, Throwable t) {
        log.error("Circuit breaker triggered on accept for referral {}: {}", referralId, t.getMessage());
        compensateSaga(referralId, "Circuit breaker open: downstream services unavailable (" + t.getMessage() + ")");
        throw new IllegalStateException("Failed to accept referral due to downstream service outage. Compensation initiated.");
    }

    @Transactional
    public void executeStep3RecordTransferCompleted(UUID referralId, List<UUID> recordIds) {
        log.info("Saga Step 3: Record transfer completed for referral {}", referralId);
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new IllegalArgumentException("Referral not found: " + referralId));

        referral.setStatus(ReferralStatus.RECORD_TRANSFERRED);
        referral.setSagaStep(SagaStep.HANDOFF_CONFIRMED);
        referralRepository.save(referral);

        sagaLogRepository.save(new SagaLog(
                referralId,
                "TRANSFER_RECORDS",
                SagaStepStatus.SUCCEEDED,
                "Transferred " + (recordIds != null ? recordIds.size() : 0) + " medical records"
        ));
    }

    @Transactional
    public Referral executeStep4ConfirmHandoff(UUID referralId, UUID confirmingDoctorId) {
        log.info("Saga Step 4: Confirming final clinical handoff for referral {}", referralId);
        Referral referral = referralRepository.findById(referralId)
                .orElseThrow(() -> new IllegalArgumentException("Referral not found: " + referralId));

        if (referral.getStatus() != ReferralStatus.RECORD_TRANSFERRED && referral.getStatus() != ReferralStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot confirm handoff in status: " + referral.getStatus());
        }

        referral.setStatus(ReferralStatus.COMPLETED);
        referral.setSagaStep(SagaStep.HANDOFF_CONFIRMED);
        Referral updated = referralRepository.save(referral);

        sagaLogRepository.save(new SagaLog(
                referralId,
                "CONFIRM_HANDOFF",
                SagaStepStatus.SUCCEEDED,
                "Handoff confirmed by doctor " + confirmingDoctorId + ". Referral completed."
        ));

        eventPublisher.publishHandoffConfirmed(HandoffConfirmedEvent.of(referralId, confirmingDoctorId));
        return updated;
    }

    @Transactional
    public void compensateSaga(UUID referralId, String reason) {
        log.warn("SAGA COMPENSATION TRIGGERED for referral {}: {}", referralId, reason);
        Referral referral = referralRepository.findById(referralId).orElse(null);
        if (referral == null) return;

        String priorStep = referral.getSagaStep().name();
        referral.setStatus(ReferralStatus.CANCELLED);
        referral.setSagaStep(SagaStep.COMPENSATING);
        referralRepository.save(referral);

        sagaLogRepository.save(new SagaLog(
                referralId,
                "COMPENSATION",
                SagaStepStatus.COMPENSATED,
                "Saga rolled back from step " + priorStep + ". Reason: " + reason
        ));

        eventPublisher.publishReferralCancelled(ReferralCancelledEvent.of(
                referralId,
                priorStep,
                reason,
                List.of("REVOKE_RECORD_TRANSFER", "NOTIFY_CLINICAL_PARTIES")
        ));
    }
}
