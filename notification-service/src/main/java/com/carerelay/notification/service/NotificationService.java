package com.carerelay.notification.service;

import com.carerelay.notification.dto.NotificationDto;
import com.carerelay.notification.entity.Notification;
import com.carerelay.notification.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository repository;

    public NotificationService(NotificationRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public NotificationDto createNotification(UUID recipientId, UUID referralId, String eventType, String title, String body) {
        Notification n = new Notification(recipientId, referralId, eventType, title, body);
        return NotificationDto.fromEntity(repository.save(n));
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(UUID userId, Pageable pageable) {
        return repository.findByRecipientUserIdOrderBySentAtDesc(userId, pageable)
                .map(NotificationDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UUID userId) {
        return repository.countByRecipientUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(UUID notificationId) {
        repository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        repository.markAllAsReadForUser(userId);
    }
}
