package com.carerelay.referral.controller;

import com.carerelay.referral.dto.*;
import com.carerelay.referral.service.ReferralService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/referrals")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    @PostMapping
    public ResponseEntity<ReferralResponse> createReferral(
            @Valid @RequestBody CreateReferralRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID doctorId = parseUserIdOrDefault(userIdHeader);
        ReferralResponse response = referralService.createReferral(request, doctorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ReferralResponse>> listReferrals(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(referralService.listReferrals(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReferralDetailResponse> getReferralDetail(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(referralService.getReferralDetail(id));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ReferralResponse> acceptReferral(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID doctorId = parseUserIdOrDefault(userIdHeader);
        return ResponseEntity.ok(referralService.acceptReferral(id, doctorId));
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<ReferralResponse> confirmHandoff(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID doctorId = parseUserIdOrDefault(userIdHeader);
        return ResponseEntity.ok(referralService.confirmHandoff(id, doctorId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReferral(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CancelReferralRequest request) {

        referralService.cancelReferral(id, request);
        return ResponseEntity.ok(Map.of("message", "Referral cancelled and compensation saga initiated"));
    }

    @GetMapping("/my-queue")
    public ResponseEntity<List<ReferralResponse>> getMyQueue(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID doctorId = parseUserIdOrDefault(userIdHeader);
        return ResponseEntity.ok(referralService.getMyQueue(doctorId));
    }

    @GetMapping("/sla-breached")
    public ResponseEntity<List<ReferralResponse>> getSlaBreached() {
        return ResponseEntity.ok(referralService.getSlaBreached());
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<ReferralAnalyticsDto> getAnalyticsSummary() {
        return ResponseEntity.ok(referralService.getAnalyticsSummary());
    }

    private UUID parseUserIdOrDefault(String header) {
        if (header != null && !header.isBlank()) {
            try {
                return UUID.fromString(header);
            } catch (IllegalArgumentException ignored) {}
        }
        // Development fallback UUID
        return UUID.fromString("a0000000-0000-0000-0000-000000000001");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    }
}
