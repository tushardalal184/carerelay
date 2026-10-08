package com.carerelay.patient.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePatientRequest(
    @NotBlank(message = "MRN is required")
    String mrn,

    @NotBlank(message = "First name is required")
    String firstName,

    @NotBlank(message = "Last name is required")
    String lastName,

    @NotNull(message = "Date of birth is required")
    LocalDate dateOfBirth,

    String bloodGroup,
    String allergies,
    UUID primaryDoctorId
) {}
