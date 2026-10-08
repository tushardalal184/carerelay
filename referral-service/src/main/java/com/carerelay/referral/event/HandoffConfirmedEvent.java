package com.carerelay.referral.event;

import java.time.Instant;
import java.util.UUID;

public record HandoffConfirmedEvent(
    String eventType,
    UUID eventId,
    Instant timestamp,
    UUID referralId,
    UUID confirmedByDoctorId
) {
    public static HandoffConfirmedEvent of(UUID referralId, UUID doctorId) {
        return new HandoffConfirmedEvent("HANDOFF_CONFIRMED", UUID.randomUUID(), Instant.now(), referralId, doctorId);
    }
}
