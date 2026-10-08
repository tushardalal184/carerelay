package com.carerelay.referral.config;

import com.carerelay.referral.entity.*;
import com.carerelay.referral.repository.ReferralRepository;
import com.carerelay.referral.repository.SagaLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ReferralRepository referralRepository;
    private final SagaLogRepository sagaLogRepository;

    public DataInitializer(ReferralRepository referralRepository, SagaLogRepository sagaLogRepository) {
        this.referralRepository = referralRepository;
        this.sagaLogRepository = sagaLogRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (referralRepository.count() == 0) {
            log.info("Database referrals table is empty. Seeding initial clinical transfers...");

            UUID docAlice = UUID.fromString("a0000000-0000-0000-0000-000000000001");
            UUID docBob = UUID.fromString("a0000000-0000-0000-0000-000000000002");
            UUID nurseCarol = UUID.fromString("a0000000-0000-0000-0000-000000000003");
            UUID patEleanor = UUID.fromString("b0000000-0000-0000-0000-000000000001");
            UUID patJames = UUID.fromString("b0000000-0000-0000-0000-000000000002");

            // Referral 1: Eleanor Vance (Cardiology -> Neurology)
            Referral r1 = new Referral();
            r1.setPatientId(patEleanor);
            r1.setReferringDoctorId(docAlice);
            r1.setReceivingDoctorId(docBob);
            r1.setReferringDepartment("Cardiology");
            r1.setReceivingDepartment("Neurology");
            r1.setReason("Frequent fainting spells while standing. Heart is stable on Metoprolol; neurology consult required.");
            r1.setUrgency(ReferralUrgency.URGENT);
            r1.setStatus(ReferralStatus.ACCEPTED);
            r1.setSagaStep(SagaStep.RECORD_TRANSFER_REQUESTED);
            r1.setSlaDeadline(Instant.now().plus(Duration.ofMinutes(165)));
            Referral saved1 = referralRepository.save(r1);

            SagaLog s1 = new SagaLog();
            s1.setReferralId(saved1.getId());
            s1.setStepName("REFERRAL_INITIATED");
            s1.setStepStatus(SagaStepStatus.SUCCEEDED);
            s1.setPayload("Referral created by Dr. Alice Smith");
            sagaLogRepository.save(s1);

            SagaLog s2 = new SagaLog();
            s2.setReferralId(saved1.getId());
            s2.setStepName("RECORDS_TRANSFERRED");
            s2.setStepStatus(SagaStepStatus.SUCCEEDED);
            s2.setPayload("12-Lead ECG and blood panel transferred to Neurology");
            sagaLogRepository.save(s2);

            // Referral 2: James Wilson (Emergency -> Cardiology)
            Referral r2 = new Referral();
            r2.setPatientId(patJames);
            r2.setReferringDoctorId(nurseCarol);
            r2.setReceivingDoctorId(docAlice);
            r2.setReferringDepartment("Emergency");
            r2.setReceivingDepartment("Cardiology");
            r2.setReason("Sudden chest discomfort with borderline lab results. Needs urgent cardiology checkup.");
            r2.setUrgency(ReferralUrgency.EMERGENCY);
            r2.setStatus(ReferralStatus.PENDING);
            r2.setSagaStep(SagaStep.INITIATED);
            r2.setSlaDeadline(Instant.now().plus(Duration.ofMinutes(38)));
            Referral saved2 = referralRepository.save(r2);

            SagaLog s3 = new SagaLog();
            s3.setReferralId(saved2.getId());
            s3.setStepName("EMERGENCY_INITIATED");
            s3.setStepStatus(SagaStepStatus.STARTED);
            s3.setPayload("Emergency referral initiated with 1-hour SLA");
            sagaLogRepository.save(s3);

            log.info("Pre-seeded 2 active referrals and Saga audit trail into database.");
        }
    }
}
