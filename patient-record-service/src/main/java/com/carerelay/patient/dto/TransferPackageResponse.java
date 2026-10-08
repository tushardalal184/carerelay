package com.carerelay.patient.dto;

import com.carerelay.patient.entity.TransferStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TransferPackageResponse(
    UUID transferId,
    UUID referralId,
    PatientDto patient,
    TransferStatus status,
    Instant transferredAt,
    List<MedicalRecordDto> records
) {}
