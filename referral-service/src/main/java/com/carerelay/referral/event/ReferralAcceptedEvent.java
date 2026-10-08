package com.carerelay.referral.event;

import java.time.Instant;
import java.util.UUID;

public record ReferralAcceptedEvent(
    String eventType,
    UUID eventId,
    Instant timestamp,
    UUID referralId,
    UUID acceptedByDoctorId
) {
    public static ReferralAcceptedEvent of(UUID referralId, UUID doctorId) {
        return new ReferralAcceptedEvent("REFERRAL_ACCEPTED", UUID.randomUUID(), Instant.now(), referralId, doctorId);
    }
}
