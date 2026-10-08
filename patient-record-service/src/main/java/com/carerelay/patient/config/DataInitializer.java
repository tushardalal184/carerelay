package com.carerelay.patient.config;

import com.carerelay.patient.entity.MedicalRecord;
import com.carerelay.patient.entity.Patient;
import com.carerelay.patient.entity.RecordType;
import com.carerelay.patient.repository.MedicalRecordRepository;
import com.carerelay.patient.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.UUID;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final PatientRepository patientRepository;
    private final MedicalRecordRepository recordRepository;

    public DataInitializer(PatientRepository patientRepository, MedicalRecordRepository recordRepository) {
        this.patientRepository = patientRepository;
        this.recordRepository = recordRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (patientRepository.count() == 0) {
            log.info("Database patients table is empty. Seeding initial clinical patient records...");

            UUID doctorId = UUID.fromString("a0000000-0000-0000-0000-000000000001");

            // Patient 1: Eleanor Vance
            Patient p1 = new Patient();
            p1.setId(UUID.fromString("b0000000-0000-0000-0000-000000000001"));
            p1.setMrn("MRN-78491");
            p1.setFirstName("Eleanor");
            p1.setLastName("Vance");
            p1.setDateOfBirth(LocalDate.of(1982, 4, 15));
            p1.setBloodGroup("O Positive");
            p1.setAllergies("Penicillin, Latex");
            p1.setPrimaryDoctorId(doctorId);
            Patient saved1 = patientRepository.save(p1);

            MedicalRecord r1 = new MedicalRecord();
            r1.setPatientId(saved1.getId());
            r1.setRecordType(RecordType.DIAGNOSIS);
            r1.setTitle("12-Lead ECG Heart Test");
            r1.setContent("Shows rapid irregular rhythm (Atrial Fibrillation). No heart attack signs.");
            r1.setAuthoredBy(doctorId);
            r1.setDepartment("Cardiology");
            recordRepository.save(r1);

            MedicalRecord r2 = new MedicalRecord();
            r2.setPatientId(saved1.getId());
            r2.setRecordType(RecordType.LAB_RESULT);
            r2.setTitle("Blood Chemistry Panel");
            r2.setContent("Kidney function normal. Troponin enzyme negative (no heart muscle damage).");
            r2.setAuthoredBy(doctorId);
            r2.setDepartment("Cardiology");
            recordRepository.save(r2);

            // Patient 2: James Wilson
            Patient p2 = new Patient();
            p2.setId(UUID.fromString("b0000000-0000-0000-0000-000000000002"));
            p2.setMrn("MRN-92104");
            p2.setFirstName("James");
            p2.setLastName("Wilson");
            p2.setDateOfBirth(LocalDate.of(1965, 8, 20));
            p2.setBloodGroup("A Positive");
            p2.setAllergies("Sulfa Drugs");
            p2.setPrimaryDoctorId(doctorId);
            Patient saved2 = patientRepository.save(p2);

            MedicalRecord r3 = new MedicalRecord();
            r3.setPatientId(saved2.getId());
            r3.setRecordType(RecordType.DIAGNOSIS);
            r3.setTitle("Initial Chest Pain ECG");
            r3.setContent("Borderline changes. Cardiac enzyme slightly elevated.");
            r3.setAuthoredBy(doctorId);
            r3.setDepartment("Emergency");
            recordRepository.save(r3);

            log.info("Pre-seeded 2 patient records with clinical ECG and lab tests into database.");
        }
    }
}
