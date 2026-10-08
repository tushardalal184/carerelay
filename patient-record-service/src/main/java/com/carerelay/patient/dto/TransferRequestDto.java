package com.carerelay.patient.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record TransferRequestDto(
    @NotNull UUID referralId,
    @NotNull UUID patientId
) {}
