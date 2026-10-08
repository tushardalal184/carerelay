package com.carerelay.referral.dto;

import com.carerelay.referral.entity.SagaLog;
import com.carerelay.referral.entity.SagaStepStatus;

import java.time.Instant;
import java.util.UUID;

public record SagaLogDto(
    UUID id,
    UUID referralId,
    String stepName,
    SagaStepStatus stepStatus,
    String payload,
    Instant createdAt
) {
    public static SagaLogDto fromEntity(SagaLog s) {
        return new SagaLogDto(
            s.getId(),
            s.getReferralId(),
            s.getStepName(),
            s.getStepStatus(),
            s.getPayload(),
            s.getCreatedAt()
        );
    }
}
