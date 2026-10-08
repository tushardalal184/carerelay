package com.carerelay.patient.kafka;

import com.carerelay.patient.event.RecordTransferredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class PatientEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PatientEventPublisher.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public PatientEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishRecordTransferred(RecordTransferredEvent event) {
        log.info("Publishing record.transferred event for referral {}", event.referralId());
        try {
            kafkaTemplate.send("record.transferred", event.referralId().toString(), event);
        } catch (Exception e) {
            log.warn("Kafka unreachable, skipping async event: {}", e.getMessage());
        }
    }
}
