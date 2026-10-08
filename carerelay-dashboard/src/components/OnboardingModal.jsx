import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Stethoscope,
  Building2,
  Check,
  RefreshCw,
  Heart,
  AlertCircle,
  Hash,
  Shield,
  Layers
} from 'lucide-react';
import { api } from '../api';

export default function OnboardingModal({
  isOpen,
  onClose,
  initialTab = 'patient', // 'patient' | 'doctor' | 'department'
  departments,
  onAddDepartment,
  doctors,
  onAddDoctor,
  onAddPatient,
  showToast
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // --- 1. PATIENT FORM STATE ---
  const generateRandomMrn = () => `MRN-${Math.floor(10000 + Math.random() * 90000)}`;
  const [patientForm, setPatientForm] = useState({
    name: '',
    mrn: generateRandomMrn(),
    age: '45',
    gender: 'Female',
    bloodType: 'O Positive',
    allergies: 'None reported',
    department: departments[0]?.name || 'Cardiology',
    condition: '',
    assignedDoctor: doctors[0]?.name || 'Dr. Alice Smith',
    initialNote: ''
  });

  // --- 2. DOCTOR FORM STATE ---
  const [doctorForm, setDoctorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: departments[0]?.name || 'Cardiology',
    title: 'Attending Physician',
    role: 'DOCTOR',
    license: 'MD-' + Math.floor(10000 + Math.random() * 90000),
    password: 'password123'
  });

  // --- 3. DEPARTMENT FORM STATE ---
  const [deptForm, setDeptForm] = useState({
    name: '',
    code: '',
    floor: '',
    head: '',
    beds: '16'
  });

  if (!isOpen) return null;

  // Handle Patient Submission
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (!patientForm.name.trim() || !patientForm.condition.trim()) return;

    const newPatient = {
      id: 'pat-' + Math.random().toString(36).substring(2, 9),
      mrn: patientForm.mrn.trim(),
      name: patientForm.name.trim(),
      age: parseInt(patientForm.age) || 45,
      gender: patientForm.gender,
      bloodType: patientForm.bloodType,
      allergies: patientForm.allergies || 'No Known Drug Allergies (NKDA)',
      department: patientForm.department || 'Cardiology',
      assignedDoctor: patientForm.assignedDoctor || 'Dr. Alice Smith',
      condition: patientForm.condition.trim(),
      files: [
        {
          name: 'Admission Clinical Assessment',
          date: 'Today, Just now',
          summary: patientForm.initialNote || `Admitted under ${patientForm.department} for ${patientForm.condition}. Vitals stable.`
        },
        {
          name: 'Baseline Vitals & Lab Screen',
          date: 'Today, Just now',
          summary: `Blood Type: ${patientForm.bloodType}. Allergies: ${patientForm.allergies}. Basic metabolic panel ordered.`
        }
      ]
    };

    onAddPatient(newPatient);
    onClose();
  };

  // Handle Doctor Submission
  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.firstName.trim() || !doctorForm.lastName.trim() || !doctorForm.email.trim()) return;

    const fullName = `${doctorForm.firstName.startsWith('Dr.') ? '' : 'Dr. '}${doctorForm.firstName.trim()} ${doctorForm.lastName.trim()}`;
    const newDoctor = {
      id: 'doc-' + Math.random().toString(36).substring(2, 9),
      name: fullName,
      email: doctorForm.email.trim().toLowerCase(),
      department: doctorForm.department,
      title: doctorForm.title,
      role: doctorForm.role,
      license: doctorForm.license
    };

    onAddDoctor(newDoctor);
    onClose();
  };

  // Handle Department Submission
  const handleDeptSubmit = (e) => {
    e.preventDefault();
    if (!deptForm.name.trim()) return;

    const newDept = {
      id: 'dept-' + Math.random().toString(36).substring(2, 9),
      name: deptForm.name.trim(),
      code: deptForm.code.trim().toUpperCase() || deptForm.name.substring(0, 4).toUpperCase() + '-01',
      floor: deptForm.floor.trim() || 'Central Wing, Level 2',
      head: deptForm.head.trim() || 'Lead Attending',
      beds: parseInt(deptForm.beds) || 16,
      active: true
    };

    onAddDepartment(newDept);
    showToast(`✓ Activated department: ${newDept.name} (${newDept.beds} beds)`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card animate-pop-in"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '100%' }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Clinical System Onboarding</span>
              <span style={{
                fontSize: '0.675rem',
                background: 'var(--accent-bg)',
                color: 'var(--accent-main)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                PORTAL DIRECTORY
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Onboard a patient, register clinical staff, or activate a hospital ward
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-inset)',
          padding: '6px 12px',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('patient')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'patient' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'patient' ? 'var(--accent-main)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'patient' ? 'var(--shadow-sm)' : 'none',
              borderBottom: activeTab === 'patient' ? '2px solid var(--accent-main)' : '2px solid transparent'
            }}
          >
            <Heart size={15} />
            <span>1. Admit Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('doctor')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'doctor' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'doctor' ? 'var(--accent-main)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'doctor' ? 'var(--shadow-sm)' : 'none',
              borderBottom: activeTab === 'doctor' ? '2px solid var(--accent-main)' : '2px solid transparent'
            }}
          >
            <Stethoscope size={15} />
            <span>2. Register Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('department')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: activeTab === 'department' ? 'var(--bg-surface)' : 'transparent',
              color: activeTab === 'department' ? 'var(--accent-main)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'department' ? 'var(--shadow-sm)' : 'none',
              borderBottom: activeTab === 'department' ? '2px solid var(--accent-main)' : '2px solid transparent'
            }}
          >
            <Building2 size={15} />
            <span>3. Add Department</span>
          </button>
        </div>

        {/* TAB 1: ADMIT PATIENT */}
        {activeTab === 'patient' && (
          <form onSubmit={handlePatientSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Robert Langdon"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  className="input-box"
                  required
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Medical Record # (MRN)</label>
                  <button
                    type="button"
                    onClick={() => setPatientForm({ ...patientForm, mrn: generateRandomMrn() })}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-main)', fontSize: '0.675rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <RefreshCw size={10} /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={patientForm.mrn}
                  onChange={(e) => setPatientForm({ ...patientForm, mrn: e.target.value })}
                  className="input-box"
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Age</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                  className="input-box"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Gender</label>
                <select
                  value={patientForm.gender}
                  onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                  className="input-box"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>Blood Type</label>
                <select
                  value={patientForm.bloodType}
                  onChange={(e) => setPatientForm({ ...patientForm, bloodType: e.target.value })}
                  className="input-box"
                >
                  <option value="O Positive">O Positive (O+)</option>
                  <option value="O Negative">O Negative (O-)</option>
                  <option value="A Positive">A Positive (A+)</option>
                  <option value="A Negative">A Negative (A-)</option>
                  <option value="B Positive">B Positive (B+)</option>
                  <option value="B Negative">B Negative (B-)</option>
                  <option value="AB Positive">AB Positive (AB+)</option>
                  <option value="AB Negative">AB Negative (AB-)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Admitting Ward / Department
                </label>
                <select
                  value={patientForm.department}
                  onChange={(e) => setPatientForm({ ...patientForm, department: e.target.value })}
                  className="input-box"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, None"
                  value={patientForm.allergies}
                  onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                  className="input-box"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Primary Condition / Reason for Admission *
              </label>
              <input
                type="text"
                placeholder="e.g. Severe shortness of breath, acute cardiac chest pain"
                value={patientForm.condition}
                onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })}
                className="input-box"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Initial Clinical Observation / Bedside Note
              </label>
              <textarea
                rows="2"
                placeholder="Initial vitals, symptoms observed upon hospital admission..."
                value={patientForm.initialNote}
                onChange={(e) => setPatientForm({ ...patientForm, initialNote: e.target.value })}
                className="input-box"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Check size={14} /> Admit Patient & Open Record
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: REGISTER DOCTOR */}
        {activeTab === 'doctor' && (
          <form onSubmit={handleDoctorSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus"
                  value={doctorForm.firstName}
                  onChange={(e) => setDoctorForm({ ...doctorForm, firstName: e.target.value })}
                  className="input-box"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vance"
                  value={doctorForm.lastName}
                  onChange={(e) => setDoctorForm({ ...doctorForm, lastName: e.target.value })}
                  className="input-box"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Hospital Email *
                </label>
                <input
                  type="email"
                  placeholder="e.g. marcus.vance@hospital.org"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className="input-box"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Assigned Department
                </label>
                <select
                  value={doctorForm.department}
                  onChange={(e) => setDoctorForm({ ...doctorForm, department: e.target.value })}
                  className="input-box"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Clinical Title / Seniority
                </label>
                <select
                  value={doctorForm.title}
                  onChange={(e) => setDoctorForm({ ...doctorForm, title: e.target.value })}
                  className="input-box"
                >
                  <option value="Attending Physician">Attending Physician</option>
                  <option value="Senior Specialist">Senior Specialist</option>
                  <option value="ICU Intensivist">ICU Intensivist</option>
                  <option value="Fellow">Fellow</option>
                  <option value="Resident Physician">Resident Physician</option>
                  <option value="Charge Nurse">Charge Nurse</option>
                  <option value="Department Head">Department Head</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Medical License / NPI #
                </label>
                <input
                  type="text"
                  placeholder="e.g. MD-98214"
                  value={doctorForm.license}
                  onChange={(e) => setDoctorForm({ ...doctorForm, license: e.target.value })}
                  className="input-box"
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Initial Account Password</label>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>Min. 6 characters</span>
              </div>
              <input
                type="password"
                value={doctorForm.password}
                onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                className="input-box"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Check size={14} /> Register Doctor & Issue ID
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: ADD DEPARTMENT */}
        {activeTab === 'department' && (
          <form onSubmit={handleDeptSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Department Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intensive Care Unit (ICU)"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="input-box"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Department Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICU-01"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  className="input-box"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Hospital Location / Wing & Floor
                </label>
                <input
                  type="text"
                  placeholder="e.g. North Tower, 4th Floor"
                  value={deptForm.floor}
                  onChange={(e) => setDeptForm({ ...deptForm, floor: e.target.value })}
                  className="input-box"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                  Monitored Bed Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  placeholder="e.g. 18"
                  value={deptForm.beds}
                  onChange={(e) => setDeptForm({ ...deptForm, beds: e.target.value })}
                  className="input-box"
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '4px' }}>
                Department Head / Lead Attending
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Helen Cho, Chief of Critical Care"
                value={deptForm.head}
                onChange={(e) => setDeptForm({ ...deptForm, head: e.target.value })}
                className="input-box"
              />
            </div>

            <div style={{
              background: 'var(--bg-inset)',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>Auto-integration:</strong> Once registered, this department immediately becomes an available destination for patient transfers, doctor duty assignments, and emergency handoffs.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
              <button type="submit" className="btn btn-primary">
                <Check size={14} /> Activate Ward Department
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
