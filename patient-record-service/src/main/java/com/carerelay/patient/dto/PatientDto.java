package com.carerelay.patient.dto;

import com.carerelay.patient.entity.Patient;
import java.time.LocalDate;
import java.util.UUID;

public record PatientDto(
    UUID id,
    String mrn,
    String firstName,
    String lastName,
    LocalDate dateOfBirth,
    String bloodGroup,
    String allergies,
    UUID primaryDoctorId
) {
    public static PatientDto fromEntity(Patient p) {
        return new PatientDto(
            p.getId(),
            p.getMrn(),
            p.getFirstName(),
            p.getLastName(),
            p.getDateOfBirth(),
            p.getBloodGroup(),
            p.getAllergies(),
            p.getPrimaryDoctorId()
        );
    }
}
