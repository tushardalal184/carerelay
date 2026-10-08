package com.carerelay.ai.dto;

import java.time.Instant;
import java.util.UUID;

public record HandoffSummaryResponse(
    UUID referralId,
    String patientName,
    String mrn,
    String urgency,
    String summaryMarkdown,
    String generationSource, // 'LOCAL_DETERMINISTIC_ENGINE' (free) or 'CLAUDE_API'
    Instant generatedAt
) {}
