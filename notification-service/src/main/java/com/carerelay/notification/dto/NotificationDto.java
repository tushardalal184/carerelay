package com.carerelay.notification.dto;

import com.carerelay.notification.entity.Notification;
import java.time.Instant;
import java.util.UUID;

public record NotificationDto(
    UUID id,
    UUID recipientUserId,
    UUID referralId,
    String eventType,
    String title,
    String body,
    boolean isRead,
    Instant sentAt
) {
    public static NotificationDto fromEntity(Notification n) {
        return new NotificationDto(
            n.getId(),
            n.getRecipientUserId(),
            n.getReferralId(),
            n.getEventType(),
            n.getTitle(),
            n.getBody(),
            n.isRead(),
            n.getSentAt()
        );
    }
}
