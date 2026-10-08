package com.carerelay.ai.controller;

import com.carerelay.ai.dto.AskAiRequest;
import com.carerelay.ai.dto.AskAiResponse;
import com.carerelay.ai.dto.HandoffSummaryResponse;
import com.carerelay.ai.service.ClinicalSummaryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
public class AiInsightsController {

    private final ClinicalSummaryService service;

    public AiInsightsController(ClinicalSummaryService service) {
        this.service = service;
    }

    @PostMapping("/handoff-summary/{referralId}")
    public ResponseEntity<HandoffSummaryResponse> generateSummary(@PathVariable UUID referralId) {
        return ResponseEntity.ok(service.getOrGenerateSummary(referralId));
    }

    @GetMapping("/handoff-summary/{referralId}")
    public ResponseEntity<HandoffSummaryResponse> getSummary(@PathVariable UUID referralId) {
        return ResponseEntity.ok(service.getOrGenerateSummary(referralId));
    }

    @PostMapping("/ask")
    public ResponseEntity<AskAiResponse> askQuestion(@Valid @RequestBody AskAiRequest req) {
        return ResponseEntity.ok(service.askQuestion(req));
    }
}
