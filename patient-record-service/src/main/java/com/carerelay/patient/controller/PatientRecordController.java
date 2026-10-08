package com.carerelay.patient.controller;

import com.carerelay.patient.dto.*;
import com.carerelay.patient.service.PatientRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PatientRecordController {

    private final PatientRecordService service;

    public PatientRecordController(PatientRecordService service) {
        this.service = service;
    }

    @PostMapping("/patients")
    public ResponseEntity<PatientDto> createPatient(@Valid @RequestBody CreatePatientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createPatient(request));
    }

    @GetMapping("/patients/{id}")
    public ResponseEntity<PatientDto> getPatientById(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.getPatientById(id));
    }

    @GetMapping("/patients/search")
    public ResponseEntity<List<PatientDto>> searchPatients(@RequestParam(value = "query", defaultValue = "") String query) {
        return ResponseEntity.ok(service.searchPatients(query));
    }

    @PostMapping("/patients/{id}/records")
    public ResponseEntity<MedicalRecordDto> addRecord(
            @PathVariable("id") UUID id,
            @Valid @RequestBody CreateRecordRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        UUID doctorId = parseUserIdOrDefault(userIdHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(service.addMedicalRecord(id, request, doctorId));
    }

    @GetMapping("/patients/{id}/records")
    public ResponseEntity<List<MedicalRecordDto>> getPatientRecords(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(service.getPatientRecords(id));
    }

    @PostMapping("/records/transfer-request")
    public ResponseEntity<TransferPackageResponse> initiateTransfer(@Valid @RequestBody TransferRequestDto req) {
        return ResponseEntity.ok(service.initiateTransferPackage(req));
    }

    @GetMapping("/records/transfer/{referralId}")
    public ResponseEntity<TransferPackageResponse> getTransferPackage(@PathVariable("referralId") UUID referralId) {
        return ResponseEntity.ok(service.getTransferPackage(referralId));
    }

    @DeleteMapping("/records/transfer/{referralId}")
    public ResponseEntity<?> revokeTransfer(@PathVariable("referralId") UUID referralId) {
        service.revokeTransfer(referralId);
        return ResponseEntity.ok(Map.of("message", "Record transfer revoked as part of Saga compensation"));
    }

    private UUID parseUserIdOrDefault(String header) {
        if (header != null && !header.isBlank()) {
            try {
                return UUID.fromString(header);
            } catch (IllegalArgumentException ignored) {}
        }
        return UUID.fromString("a0000000-0000-0000-0000-000000000001");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
