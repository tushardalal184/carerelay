package com.carerelay.patient.dto;

import com.carerelay.patient.entity.RecordType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateRecordRequest(
    @NotNull(message = "Record type is required")
    RecordType recordType,

    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Content is required")
    String content,

    String department
) {}
