package com.carerelay.referral.event;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReferralCancelledEvent(
    String eventType,
    UUID eventId,
    Instant timestamp,
    UUID referralId,
    String cancelledAtStep,
    String reason,
    List<String> compensationActions
) {
    public static ReferralCancelledEvent of(UUID referralId, String step, String reason, List<String> actions) {
        return new ReferralCancelledEvent(
            "REFERRAL_CANCELLED",
            UUID.randomUUID(),
            Instant.now(),
            referralId,
            step,
            reason,
            actions
        );
    }
}
