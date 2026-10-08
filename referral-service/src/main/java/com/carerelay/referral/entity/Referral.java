package com.carerelay.referral.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "referrals")
public class Referral {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "patient_id", nullable = false)
    private UUID patientId;

    @Column(name = "referring_doctor_id", nullable = false)
    private UUID referringDoctorId;

    @Column(name = "receiving_doctor_id", nullable = false)
    private UUID receivingDoctorId;

    @Column(name = "referring_department", nullable = false, length = 100)
    private String referringDepartment;

    @Column(name = "receiving_department", nullable = false, length = 100)
    private String receivingDepartment;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReferralUrgency urgency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReferralStatus status = ReferralStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "saga_step", nullable = false, length = 50)
    private SagaStep sagaStep = SagaStep.INITIATED;

    @Column(name = "sla_deadline")
    private Instant slaDeadline;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Referral() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPatientId() { return patientId; }
    public void setPatientId(UUID patientId) { this.patientId = patientId; }

    public UUID getReferringDoctorId() { return referringDoctorId; }
    public void setReferringDoctorId(UUID referringDoctorId) { this.referringDoctorId = referringDoctorId; }

    public UUID getReceivingDoctorId() { return receivingDoctorId; }
    public void setReceivingDoctorId(UUID receivingDoctorId) { this.receivingDoctorId = receivingDoctorId; }

    public String getReferringDepartment() { return referringDepartment; }
    public void setReferringDepartment(String referringDepartment) { this.referringDepartment = referringDepartment; }

    public String getReceivingDepartment() { return receivingDepartment; }
    public void setReceivingDepartment(String receivingDepartment) { this.receivingDepartment = receivingDepartment; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public ReferralUrgency getUrgency() { return urgency; }
    public void setUrgency(ReferralUrgency urgency) { this.urgency = urgency; }

    public ReferralStatus getStatus() { return status; }
    public void setStatus(ReferralStatus status) { this.status = status; }

    public SagaStep getSagaStep() { return sagaStep; }
    public void setSagaStep(SagaStep sagaStep) { this.sagaStep = sagaStep; }

    public Instant getSlaDeadline() { return slaDeadline; }
    public void setSlaDeadline(Instant slaDeadline) { this.slaDeadline = slaDeadline; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
