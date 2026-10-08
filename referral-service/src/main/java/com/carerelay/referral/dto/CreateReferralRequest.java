package com.carerelay.referral.dto;

import com.carerelay.referral.entity.ReferralUrgency;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateReferralRequest(
    @NotNull(message = "Patient ID is required")
    UUID patientId,

    @NotNull(message = "Receiving doctor ID is required")
    UUID receivingDoctorId,

    @NotBlank(message = "Referring department is required")
    String referringDepartment,

    @NotBlank(message = "Receiving department is required")
    String receivingDepartment,

    @NotBlank(message = "Clinical reason is required")
    String reason,

    @NotNull(message = "Urgency level is required")
    ReferralUrgency urgency,

    String notes
) {}
