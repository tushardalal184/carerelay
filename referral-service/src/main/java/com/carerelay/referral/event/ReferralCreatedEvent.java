package com.carerelay.referral.event;

import java.time.Instant;
import java.util.UUID;

public record ReferralCreatedEvent(
    String eventType,
    UUID eventId,
    Instant timestamp,
    UUID referralId,
    UUID patientId,
    UUID referringDoctorId,
    UUID receivingDoctorId,
    String referringDepartment,
    String receivingDepartment,
    String urgency,
    Instant slaDeadline
) {
    public static ReferralCreatedEvent of(UUID referralId, UUID patientId, UUID referringDoctorId,
                                          UUID receivingDoctorId, String referringDept, String receivingDept,
                                          String urgency, Instant slaDeadline) {
        return new ReferralCreatedEvent(
            "REFERRAL_CREATED",
            UUID.randomUUID(),
            Instant.now(),
            referralId,
            patientId,
            referringDoctorId,
            receivingDoctorId,
            referringDept,
            receivingDept,
            urgency,
            slaDeadline
        );
    }
}
