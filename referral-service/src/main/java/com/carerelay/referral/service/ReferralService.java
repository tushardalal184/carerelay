package com.carerelay.referral.service;

import com.carerelay.referral.dto.*;
import com.carerelay.referral.entity.Referral;
import com.carerelay.referral.entity.ReferralStatus;
import com.carerelay.referral.entity.ReferralUrgency;
import com.carerelay.referral.repository.ReferralRepository;
import com.carerelay.referral.repository.SagaLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ReferralService {

    private final ReferralRepository referralRepository;
    private final SagaLogRepository sagaLogRepository;
    private final SagaOrchestrator sagaOrchestrator;

    public ReferralService(ReferralRepository referralRepository,
                           SagaLogRepository sagaLogRepository,
                           SagaOrchestrator sagaOrchestrator) {
        this.referralRepository = referralRepository;
        this.sagaLogRepository = sagaLogRepository;
        this.sagaOrchestrator = sagaOrchestrator;
    }

    @Transactional
    public ReferralResponse createReferral(CreateReferralRequest request, UUID referringDoctorId) {
        Referral referral = new Referral();
        referral.setPatientId(request.patientId());
        referral.setReferringDoctorId(referringDoctorId);
        referral.setReceivingDoctorId(request.receivingDoctorId());
        referral.setReferringDepartment(request.referringDepartment());
        referral.setReceivingDepartment(request.receivingDepartment());
        referral.setReason(request.reason());
        referral.setUrgency(request.urgency());
        referral.setNotes(request.notes());

        Instant now = Instant.now();
        Instant deadline = switch (request.urgency()) {
            case EMERGENCY -> now.plus(Duration.ofHours(1));
            case URGENT -> now.plus(Duration.ofHours(4));
            case ROUTINE -> now.plus(Duration.ofHours(24));
        };
        referral.setSlaDeadline(deadline);

        Referral saved = referralRepository.save(referral);
        sagaOrchestrator.executeStep1Initiate(saved);

        return ReferralResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<ReferralResponse> listReferrals(Pageable pageable) {
        return referralRepository.findAll(pageable).map(ReferralResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ReferralDetailResponse getReferralDetail(UUID id) {
        Referral referral = referralRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Referral not found: " + id));

        var logs = sagaLogRepository.findByReferralIdOrderByCreatedAtAsc(id)
                .stream().map(SagaLogDto::fromEntity).toList();

        return new ReferralDetailResponse(ReferralResponse.fromEntity(referral), logs);
    }

    @Transactional
    public ReferralResponse acceptReferral(UUID referralId, UUID doctorId) {
        Referral accepted = sagaOrchestrator.executeStep2Accept(referralId, doctorId);
        return ReferralResponse.fromEntity(accepted);
    }

    @Transactional
    public ReferralResponse confirmHandoff(UUID referralId, UUID doctorId) {
        Referral confirmed = sagaOrchestrator.executeStep4ConfirmHandoff(referralId, doctorId);
        return ReferralResponse.fromEntity(confirmed);
    }

    @Transactional
    public void cancelReferral(UUID referralId, CancelReferralRequest request) {
        sagaOrchestrator.compensateSaga(referralId, request.reason());
    }

    @Transactional(readOnly = true)
    public List<ReferralResponse> getMyQueue(UUID doctorId) {
        return referralRepository.findActiveQueueByDoctor(doctorId).stream()
                .map(ReferralResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<ReferralResponse> getSlaBreached() {
        return referralRepository.findSlaBreached(Instant.now()).stream()
                .map(ReferralResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public ReferralAnalyticsDto getAnalyticsSummary() {
        long total = referralRepository.count();
        long pending = referralRepository.countByStatus(ReferralStatus.PENDING);
        long active = referralRepository.countByStatus(ReferralStatus.ACCEPTED) +
                      referralRepository.countByStatus(ReferralStatus.RECORD_TRANSFERRED);
        long completed = referralRepository.countByStatus(ReferralStatus.COMPLETED);
        long failed = referralRepository.countByStatus(ReferralStatus.CANCELLED) +
                      referralRepository.countByStatus(ReferralStatus.FAILED);
        long breaches = referralRepository.countSlaBreached(Instant.now());

        Map<String, Long> breakdown = new HashMap<>();
        for (ReferralStatus s : ReferralStatus.values()) {
            breakdown.put(s.name(), referralRepository.countByStatus(s));
        }

        return new ReferralAnalyticsDto(total, pending, active, completed, failed, breaches, breakdown);
    }
}
