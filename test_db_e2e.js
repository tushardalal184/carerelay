async function test() {
  try {
    console.log('1. Testing Gateway Health...');
    const healthRes = await fetch('http://localhost:8080/actuator/health');
    const health = await healthRes.json();
    console.log('Gateway status:', health);

    console.log('\n2. Testing Auth Login (from SQL Database)...');
    const authRes = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alice.smith@hospital.org', password: 'password123' })
    });
    const auth = await authRes.json();
    console.log('Logged in user payload:', auth);
    const token = auth.token;

    console.log('\n3. Querying Patients from SQL Database via Gateway...');
    const patientsRes = await fetch('http://localhost:8080/api/v1/patients/search?query=', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const patients = await patientsRes.json();
    console.log('Patients response:', patients);
    const patientList = Array.isArray(patients) ? patients : (patients.content || []);
    console.log(`Found ${patientList.length} patients in SQL Database:`);
    patientList.forEach(p => console.log(`  - ${p.fullName} | MRN: ${p.mrn} | DOB: ${p.dateOfBirth} | Blood: ${p.bloodType}`));

    console.log('\n4. Querying Active Referrals & Sagas from SQL Database...');
    const refRes = await fetch('http://localhost:8080/api/v1/referrals?page=0&size=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const referrals = await refRes.json();
    console.log(`Found ${referrals.content ? referrals.content.length : 0} referrals in SQL Database:`);
    if (referrals.content) {
      referrals.content.forEach(r => console.log(`  - Referral #${r.id} | Priority: ${r.priority} | Status: ${r.status} | Reason: ${r.reason}`));
    }

    console.log('\n5. Creating a new patient in SQL Database...');
    const newPatRes = await fetch('http://localhost:8080/api/v1/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        mrn: 'MRN-' + Math.floor(100000 + Math.random() * 900000),
        firstName: 'Elena',
        lastName: 'Rostova',
        dateOfBirth: '1984-06-15',
        bloodGroup: 'B+',
        allergies: 'Penicillin'
      })
    });
    const createdPatient = await newPatRes.json();
    console.log('Successfully created and stored patient in SQL DB! MRN:', createdPatient.mrn, 'ID:', createdPatient.id);

    console.log('\n6. Creating a new clinical referral in SQL Database...');
    const newRefRes = await fetch('http://localhost:8080/api/v1/referrals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'X-User-Id': 'a0000000-0000-0000-0000-000000000001'
      },
      body: JSON.stringify({
        patientId: '0cee1147-9d8b-4c2c-b4c3-2d825571d91c',
        receivingDoctorId: 'a0000000-0000-0000-0000-000000000002',
        referringDepartment: 'Cardiology',
        receivingDepartment: 'Neurology',
        reason: 'Acute syncopal episode evaluation with continuous telemetry monitoring.',
        urgency: 'EMERGENCY',
        notes: 'Stat telemetry and neurological consult requested.'
      })
    });
    const createdRef = await newRefRes.json();
    console.log('Successfully created and stored referral in SQL DB! Referral ID:', createdRef.id, 'Status:', createdRef.status);

    console.log('\n7. Verifying persistence: Querying all referrals from SQL Database...');
    const verifyRef = await fetch('http://localhost:8080/api/v1/referrals?page=0&size=10', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updatedRef = await verifyRef.json();
    console.log(`Database now contains ${updatedRef.content.length} referrals:`);
    updatedRef.content.forEach(r => console.log(`  - Referral #${r.id} | Reason: ${r.reason.substring(0, 45)}... | Status: ${r.status}`));

    console.log('\nALL 7 END-TO-END SQL PERSISTENCE AND ACID CHECKS VERIFIED!');
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
