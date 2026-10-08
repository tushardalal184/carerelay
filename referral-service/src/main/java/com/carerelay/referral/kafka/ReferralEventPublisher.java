package com.carerelay.referral.kafka;

import com.carerelay.referral.event.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class ReferralEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ReferralEventPublisher.class);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public ReferralEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishReferralCreated(ReferralCreatedEvent event) {
        log.info("Publishing referral.created event for referral: {}", event.referralId());
        try {
            kafkaTemplate.send("referral.created", event.referralId().toString(), event);
        } catch (Exception e) {
            log.warn("Kafka broker unreachable; skipping async event publication: {}", e.getMessage());
        }
    }

    public void publishReferralAccepted(ReferralAcceptedEvent event) {
        log.info("Publishing referral.accepted event for referral: {}", event.referralId());
        try {
            kafkaTemplate.send("referral.accepted", event.referralId().toString(), event);
        } catch (Exception e) {
            log.warn("Kafka broker unreachable; skipping async event publication: {}", e.getMessage());
        }
    }

    public void publishHandoffConfirmed(HandoffConfirmedEvent event) {
        log.info("Publishing handoff.confirmed event for referral: {}", event.referralId());
        try {
            kafkaTemplate.send("handoff.confirmed", event.referralId().toString(), event);
        } catch (Exception e) {
            log.warn("Kafka broker unreachable; skipping async event publication: {}", e.getMessage());
        }
    }

    public void publishReferralCancelled(ReferralCancelledEvent event) {
        log.info("Publishing compensation referral.cancelled event for referral: {}", event.referralId());
        try {
            kafkaTemplate.send("referral.cancelled", event.referralId().toString(), event);
        } catch (Exception e) {
            log.warn("Kafka broker unreachable; skipping async event publication: {}", e.getMessage());
        }
    }
}
