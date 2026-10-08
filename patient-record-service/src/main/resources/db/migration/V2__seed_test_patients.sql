-- Pre-seeded patients and clinical records for instant testing
INSERT INTO patients (id, mrn, first_name, last_name, date_of_birth, blood_group, allergies, primary_doctor_id, created_at)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'MRN-78491', 'Eleanor', 'Vance', '1982-04-12', 'O+', 'Penicillin, Latex', 'a0000000-0000-0000-0000-000000000001', NOW()),
    ('b0000000-0000-0000-0000-000000000002', 'MRN-92104', 'James', 'Wilson', '1965-11-28', 'A+', 'Sulfa drugs', 'a0000000-0000-0000-0000-000000000002', NOW())
ON CONFLICT (mrn) DO NOTHING;

INSERT INTO medical_records (id, patient_id, record_type, title, content, authored_by, department, created_at)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'DIAGNOSIS', 'Persistent Atrial Fibrillation', 'Patient presented with episodes of palpitations and mild dyspnea on exertion. ECG confirms atrial fibrillation with rapid ventricular response.', 'a0000000-0000-0000-0000-000000000001', 'Cardiology', NOW()),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'LAB_RESULT', 'Complete Metabolic Panel', 'Serum Creatinine: 1.1 mg/dL, Potassium: 4.2 mEq/L, Troponin T: Negative (<0.01 ng/mL). Coagulation panel shows INR 1.2.', 'a0000000-0000-0000-0000-000000000001', 'Cardiology', NOW()),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'PRESCRIPTION', 'Metoprolol Succinate 50mg daily', 'Initiated beta-blocker therapy for rate control. Patient tolerating well without symptomatic bradycardia.', 'a0000000-0000-0000-0000-000000000001', 'Cardiology', NOW())
ON CONFLICT DO NOTHING;
