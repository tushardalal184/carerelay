package com.carerelay.referral.dto;

import com.carerelay.referral.entity.Referral;
import com.carerelay.referral.entity.ReferralStatus;
import com.carerelay.referral.entity.ReferralUrgency;
import com.carerelay.referral.entity.SagaStep;

import java.time.Instant;
import java.util.UUID;

public record ReferralResponse(
    UUID id,
    UUID patientId,
    UUID referringDoctorId,
    UUID receivingDoctorId,
    String referringDepartment,
    String receivingDepartment,
    String reason,
    ReferralUrgency urgency,
    ReferralStatus status,
    SagaStep sagaStep,
    Instant slaDeadline,
    String notes,
    Instant createdAt,
    Instant updatedAt,
    boolean isSlaBreached
) {
    public static ReferralResponse fromEntity(Referral r) {
        boolean breached = r.getSlaDeadline() != null &&
                Instant.now().isAfter(r.getSlaDeadline()) &&
                r.getStatus() != ReferralStatus.COMPLETED &&
                r.getStatus() != ReferralStatus.CANCELLED &&
                r.getStatus() != ReferralStatus.FAILED;

        return new ReferralResponse(
            r.getId(),
            r.getPatientId(),
            r.getReferringDoctorId(),
            r.getReceivingDoctorId(),
            r.getReferringDepartment(),
            r.getReceivingDepartment(),
            r.getReason(),
            r.getUrgency(),
            r.getStatus(),
            r.getSagaStep(),
            r.getSlaDeadline(),
            r.getNotes(),
            r.getCreatedAt(),
            r.getUpdatedAt(),
            breached
        );
    }
}
