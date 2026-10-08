package com.carerelay.referral.dto;

import java.util.Map;

public record ReferralAnalyticsDto(
    long totalReferrals,
    long pendingReferrals,
    long activeTransfers,
    long completedReferrals,
    long cancelledOrFailed,
    long slaBreachesCount,
    Map<String, Long> statusBreakdown
) {}
