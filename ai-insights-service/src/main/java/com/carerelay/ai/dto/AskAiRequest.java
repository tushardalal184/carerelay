package com.carerelay.ai.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record AskAiRequest(
    UUID referralId,
    @NotBlank(message = "Question is required")
    String question
) {}
