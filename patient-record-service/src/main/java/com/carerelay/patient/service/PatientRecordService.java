package com.carerelay.patient.service;

import com.carerelay.patient.dto.*;
import com.carerelay.patient.entity.*;
import com.carerelay.patient.event.RecordTransferredEvent;
import com.carerelay.patient.kafka.PatientEventPublisher;
import com.carerelay.patient.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PatientRecordService {

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository recordRepository;
    private final RecordTransferRepository transferRepository;
    private final PatientEventPublisher eventPublisher;

    public PatientRecordService(PatientRepository patientRepository,
                                MedicalRecordRepository recordRepository,
                                RecordTransferRepository transferRepository,
                                PatientEventPublisher eventPublisher) {
        this.patientRepository = patientRepository;
        this.recordRepository = recordRepository;
        this.transferRepository = transferRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public PatientDto createPatient(CreatePatientRequest req) {
        Optional<Patient> existing = patientRepository.findByMrn(req.mrn());
        if (existing.isPresent()) {
            return PatientDto.fromEntity(existing.get());
        }

        Patient patient = new Patient();
        patient.setMrn(req.mrn());
        patient.setFirstName(req.firstName());
        patient.setLastName(req.lastName());
        patient.setDateOfBirth(req.dateOfBirth());
        patient.setBloodGroup(req.bloodGroup());
        patient.setAllergies(req.allergies());
        patient.setPrimaryDoctorId(req.primaryDoctorId());

        return PatientDto.fromEntity(patientRepository.save(patient));
    }

    @Transactional(readOnly = true)
    public PatientDto getPatientById(UUID id) {
        return patientRepository.findById(id)
                .map(PatientDto::fromEntity)
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<PatientDto> searchPatients(String query) {
        return patientRepository.searchPatients(query).stream()
                .map(PatientDto::fromEntity).toList();
    }

    @Transactional
    public MedicalRecordDto addMedicalRecord(UUID patientId, CreateRecordRequest req, UUID doctorId) {
        if (!patientRepository.existsById(patientId)) {
            throw new IllegalArgumentException("Patient not found: " + patientId);
        }

        MedicalRecord record = new MedicalRecord();
        record.setPatientId(patientId);
        record.setRecordType(req.recordType());
        record.setTitle(req.title());
        record.setContent(req.content());
        record.setDepartment(req.department());
        record.setAuthoredBy(doctorId);

        return MedicalRecordDto.fromEntity(recordRepository.save(record));
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordDto> getPatientRecords(UUID patientId) {
        return recordRepository.findByPatientIdOrderByCreatedAtDesc(patientId).stream()
                .map(MedicalRecordDto::fromEntity).toList();
    }

    @Transactional
    public TransferPackageResponse initiateTransferPackage(TransferRequestDto request) {
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + request.patientId()));

        List<MedicalRecord> records = recordRepository.findByPatientIdOrderByCreatedAtDesc(request.patientId());
        String idString = records.stream().map(r -> r.getId().toString()).collect(Collectors.joining(","));

        RecordTransfer transfer = transferRepository.findByReferralId(request.referralId())
                .orElse(new RecordTransfer(request.referralId(), request.patientId(), idString));

        transfer.setTransferStatus(TransferStatus.COMPLETED);
        transfer.setTransferredRecordIds(idString);
        RecordTransfer saved = transferRepository.save(transfer);

        eventPublisher.publishRecordTransferred(RecordTransferredEvent.of(
                request.referralId(),
                request.patientId(),
                records.stream().map(r -> r.getId().toString()).toList()
        ));

        return new TransferPackageResponse(
                saved.getId(),
                saved.getReferralId(),
                PatientDto.fromEntity(patient),
                saved.getTransferStatus(),
                saved.getTransferredAt(),
                records.stream().map(MedicalRecordDto::fromEntity).toList()
        );
    }

    @Transactional(readOnly = true)
    public TransferPackageResponse getTransferPackage(UUID referralId) {
        RecordTransfer transfer = transferRepository.findByReferralId(referralId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer package not found for referral: " + referralId));

        Patient patient = patientRepository.findById(transfer.getPatientId())
                .orElseThrow(() -> new IllegalStateException("Associated patient not found"));

        List<MedicalRecordDto> records = Collections.emptyList();
        if (transfer.getTransferredRecordIds() != null && !transfer.getTransferredRecordIds().isBlank()) {
            List<UUID> recordUuids = Arrays.stream(transfer.getTransferredRecordIds().split(","))
                    .map(UUID::fromString).toList();
            records = recordRepository.findAllById(recordUuids).stream()
                    .map(MedicalRecordDto::fromEntity).toList();
        }

        return new TransferPackageResponse(
                transfer.getId(),
                transfer.getReferralId(),
                PatientDto.fromEntity(patient),
                transfer.getTransferStatus(),
                transfer.getTransferredAt(),
                records
        );
    }

    @Transactional
    public void revokeTransfer(UUID referralId) {
        transferRepository.findByReferralId(referralId).ifPresent(transfer -> {
            transfer.setTransferStatus(TransferStatus.REVOKED);
            transferRepository.save(transfer);
        });
    }
}
