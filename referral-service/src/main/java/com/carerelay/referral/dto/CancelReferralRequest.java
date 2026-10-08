package com.carerelay.referral.dto;

import jakarta.validation.constraints.NotBlank;

public record CancelReferralRequest(
    @NotBlank(message = "Cancellation reason is required")
    String reason
) {}
