package com.carerelay.patient.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "record_transfers")
public class RecordTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "referral_id", nullable = false, unique = true)
    private UUID referralId;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "transferred_record_ids", columnDefinition = "TEXT")
    private String transferredRecordIds; // Comma separated UUIDs

    @Enumerated(EnumType.STRING)
    @Column(name = "transfer_status", nullable = false, length = 20)
    private TransferStatus transferStatus = TransferStatus.PENDING;

    @Column(name = "transferred_at")
    private Instant transferredAt;

    public RecordTransfer() {}

    public RecordTransfer(UUID referralId, UUID patientId, String transferredRecordIds) {
        this.referralId = referralId;
        this.patientId = patientId;
        this.transferredRecordIds = transferredRecordIds;
        this.transferStatus = TransferStatus.COMPLETED;
        this.transferredAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getReferralId() { return referralId; }
    public void setReferralId(UUID referralId) { this.referralId = referralId; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public String getTransferredRecordIds() { return transferredRecordIds; }
    public void setTransferredRecordIds(String transferredRecordIds) { this.transferredRecordIds = transferredRecordIds; }

    public TransferStatus getTransferStatus() { return transferStatus; }
    public void setTransferStatus(TransferStatus transferStatus) { this.transferStatus = transferStatus; }

    public Instant getTransferredAt() { return transferredAt; }
    public void setTransferredAt(Instant transferredAt) { this.transferredAt = transferredAt; }
}
