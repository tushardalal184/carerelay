package com.carerelay.ai.dto;

import java.time.Instant;

public record AskAiResponse(
    String question,
    String answer,
    Instant timestamp
) {}
