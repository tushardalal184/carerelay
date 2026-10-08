package com.carerelay.patient.dto;

import com.carerelay.patient.entity.MedicalRecord;
import com.carerelay.patient.entity.RecordType;
import java.time.Instant;
import java.util.UUID;

public record MedicalRecordDto(
    UUID id,
    UUID patientId,
    RecordType recordType,
    String title,
    String content,
    UUID authoredBy,
    String department,
    Instant createdAt
) {
    public static MedicalRecordDto fromEntity(MedicalRecord r) {
        return new MedicalRecordDto(
            r.getId(),
            r.getPatientId(),
            r.getRecordType(),
            r.getTitle(),
            r.getContent(),
            r.getAuthoredBy(),
            r.getDepartment(),
            r.getCreatedAt()
        );
    }
}
