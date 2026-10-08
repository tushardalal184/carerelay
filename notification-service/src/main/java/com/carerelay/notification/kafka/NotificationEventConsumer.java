package com.carerelay.notification.kafka;

import com.carerelay.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Component
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);
    private final NotificationService notificationService;

    public NotificationEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "referral.created", groupId = "notification-group")
    public void handleReferralCreated(Map<String, Object> event) {
        log.info("Received referral.created event: {}", event);
        try {
            UUID receivingDoctorId = UUID.fromString(event.get("receivingDoctorId").toString());
            UUID referralId = UUID.fromString(event.get("referralId").toString());
            String urgency = (String) event.getOrDefault("urgency", "ROUTINE");

            notificationService.createNotification(
                receivingDoctorId,
                referralId,
                "REFERRAL_CREATED",
                "New " + urgency + " Patient Referral",
                "You have received a new clinical referral requiring your review and acceptance."
            );
        } catch (Exception e) {
            log.warn("Error processing referral.created notification: {}", e.getMessage());
        }
    }

    @KafkaListener(topics = "referral.accepted", groupId = "notification-group")
    public void handleReferralAccepted(Map<String, Object> event) {
        log.info("Received referral.accepted event: {}", event);
        // Generates alert for referring physician
    }

    @KafkaListener(topics = "record.transferred", groupId = "notification-group")
    public void handleRecordTransferred(Map<String, Object> event) {
        log.info("Received record.transferred event: {}", event);
    }

    @KafkaListener(topics = "handoff.confirmed", groupId = "notification-group")
    public void handleHandoffConfirmed(Map<String, Object> event) {
        log.info("Received handoff.confirmed event: {}", event);
    }

    @KafkaListener(topics = "referral.cancelled", groupId = "notification-group")
    public void handleReferralCancelled(Map<String, Object> event) {
        log.info("Received compensation referral.cancelled event: {}", event);
    }
}
