package com.carerelay.referral.dto;

import java.util.List;

public record ReferralDetailResponse(
    ReferralResponse referral,
    List<SagaLogDto> auditTrail
) {}
