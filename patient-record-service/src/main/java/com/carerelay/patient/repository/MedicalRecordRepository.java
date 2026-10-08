package com.carerelay.patient.repository;

import com.carerelay.patient.entity.MedicalRecord;
import com.carerelay.patient.entity.RecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, UUID> {
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<MedicalRecord> findByPatientIdAndRecordTypeOrderByCreatedAtDesc(UUID patientId, RecordType recordType);
}
