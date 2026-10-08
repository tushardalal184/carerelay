package com.carerelay.notification.controller;

import com.carerelay.notification.dto.NotificationDto;
import com.carerelay.notification.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/my")
    public ResponseEntity<Page<NotificationDto>> getMyNotifications(
            @PageableDefault(size = 20) Pageable pageable,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID userId = parseUserIdOrDefault(userIdHeader);
        return ResponseEntity.ok(service.getUserNotifications(userId, pageable));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID userId = parseUserIdOrDefault(userIdHeader);
        return ResponseEntity.ok(Map.of("unreadCount", service.getUnreadCount(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable UUID id) {
        service.markAsRead(id);
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID userId = parseUserIdOrDefault(userIdHeader);
        service.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    private UUID parseUserIdOrDefault(String header) {
        if (header != null && !header.isBlank()) {
            try {
                return UUID.fromString(header);
            } catch (IllegalArgumentException ignored) {}
        }
        return UUID.fromString("a0000000-0000-0000-0000-000000000002");
    }
}
