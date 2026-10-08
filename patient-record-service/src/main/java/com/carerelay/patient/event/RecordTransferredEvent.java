package com.carerelay.patient.event;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RecordTransferredEvent(
    String eventType,
    UUID eventId,
    Instant timestamp,
    UUID referralId,
    UUID patientId,
    List<String> transferredRecordIds,
    Instant transferredAt
) {
    public static RecordTransferredEvent of(UUID referralId, UUID patientId, List<String> recordIds) {
        return new RecordTransferredEvent(
            "RECORD_TRANSFERRED",
            UUID.randomUUID(),
            Instant.now(),
            referralId,
            patientId,
            recordIds,
            Instant.now()
        );
    }
}
