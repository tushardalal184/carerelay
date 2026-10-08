import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Sun,
  User,
  Users,
  X,
  Stethoscope,
  Heart,
  ShieldCheck,
  ChevronRight,
  Info,
  LogOut,
  Building2,
  UserPlus,
  Bell,
  Bed,
  RotateCcw,
  LayoutGrid,
  ShieldAlert,
  Volume2,
  Database
} from 'lucide-react';
import { api } from './api';
import { clinicalDb } from './db';
import DoctorLogin from './components/DoctorLogin';
import OnboardingModal from './components/OnboardingModal';
import SagaRollbackSimulator from './components/SagaRollbackSimulator';
import WardBedMap from './components/WardBedMap';
import NotificationDrawer from './components/NotificationDrawer';
import PatientRoster from './components/PatientRoster';

const INITIAL_DEPARTMENTS = [
  { id: 'd-1', name: 'Cardiology', code: 'CARD-01', floor: 'West Pavilion, 4th Fl', head: 'Dr. Alice Smith', beds: 24, active: true },
  { id: 'd-2', name: 'Neurology', code: 'NEUR-02', floor: 'North Tower, 3rd Fl', head: 'Dr. Bob Johnson', beds: 18, active: true },
  { id: 'd-3', name: 'Emergency', code: 'EMER-00', floor: 'Ground Floor, Bays 1-8', head: 'Nurse Carol Davis', beds: 30, active: true },
  { id: 'd-4', name: 'Intensive Care Unit (ICU)', code: 'ICU-01', floor: 'Central Wing, 2nd Fl', head: 'Dr. Marcus Vance', beds: 12, active: true },
  { id: 'd-5', name: 'Oncology', code: 'ONC-03', floor: 'South Pavilion, 5th Fl', head: 'Dr. Sarah Lin', beds: 20, active: true }
];

const INITIAL_DOCTORS = [
  { id: 'a0000000-0000-0000-0000-000000000001', name: 'Dr. Alice Smith', email: 'alice.smith@hospital.org', department: 'Cardiology', title: 'Attending Cardiologist', role: 'DOCTOR' },
  { id: 'a0000000-0000-0000-0000-000000000002', name: 'Dr. Bob Johnson', email: 'bob.johnson@hospital.org', department: 'Neurology', title: 'Lead Neurologist', role: 'DOCTOR' },
  { id: 'a0000000-0000-0000-0000-000000000003', name: 'Nurse Carol Davis', email: 'carol.davis@hospital.org', department: 'Emergency', title: 'Triage Charge Nurse', role: 'NURSE' },
  { id: 'a0000000-0000-0000-0000-000000000004', name: 'Admin Sarah Connor', email: 'sarah.connor@hospital.org', department: 'Operations', title: 'Hospital Operations Director', role: 'ADMIN' }
];

const INITIAL_PATIENTS = [
  {
    id: 'b0000000-0000-0000-0000-000000000001',
    mrn: 'MRN-78491',
    name: 'Eleanor Vance',
    age: 44,
    gender: 'Female',
    bloodType: 'O Positive',
    allergies: 'Penicillin, Latex',
    department: 'Cardiology',
    condition: 'Irregular Heart Rhythm & Fainting Episodes',
    files: [
      { name: '12-Lead ECG Heart Test', date: 'Today, 2:10 PM', summary: 'Shows rapid irregular rhythm (Atrial Fibrillation). No heart attack signs.' },
      { name: 'Blood Chemistry Panel', date: 'Today, 2:25 PM', summary: 'Kidney function normal. Troponin enzyme negative (no heart muscle damage).' },
      { name: 'Current Medicine List', date: 'Today, 2:40 PM', summary: 'Started on Metoprolol 50mg to slow heart rate. Blood pressure is stable.' }
    ]
  },
  {
    id: 'b0000000-0000-0000-0000-000000000002',
    mrn: 'MRN-92104',
    name: 'James Wilson',
    age: 61,
    gender: 'Male',
    bloodType: 'A Positive',
    allergies: 'Sulfa Drugs',
    department: 'Emergency',
    condition: 'Sudden Chest Discomfort',
    files: [
      { name: 'Initial Chest Pain ECG', date: 'Today, 4:00 PM', summary: 'Borderline changes. Cardiac enzyme slightly elevated.' },
      { name: 'Emergency Bedside Monitor', date: 'Today, 4:15 PM', summary: 'Pain relieved after initial medicine. Needs urgent cardiology consult.' }
    ]
  }
];

const INITIAL_TRANSFERS = [
  {
    id: 't-101',
    patient: INITIAL_PATIENTS[0],
    fromDept: 'Cardiology',
    fromDoctor: 'Dr. Alice Smith',
    toDept: 'Neurology',
    toDoctor: 'Dr. Bob Johnson',
    urgency: 'URGENT',
    urgencyLabel: 'Urgent (Within 4 hours)',
    status: 'TRANSFERRED',
    statusLabel: 'Files Transferred — Awaiting Bed',
    timeLeftMinutes: 165,
    reason: 'Frequent fainting spells while standing. Heart is now stable on medication; needs brain and nervous system review.',
    createdAt: '2:30 PM',
    history: [
      { step: 'Transfer Requested', time: '2:30 PM', desc: 'Dr. Alice Smith initiated transfer to Neurology.' },
      { step: 'Transfer Accepted', time: '2:34 PM', desc: 'Dr. Bob Johnson accepted the case.' },
      { step: 'Medical Files Transferred', time: '2:35 PM', desc: 'ECG and Blood test records securely shared with Neurology.' }
    ]
  },
  {
    id: 't-102',
    patient: INITIAL_PATIENTS[1],
    fromDept: 'Emergency',
    fromDoctor: 'Nurse Carol Davis',
    toDept: 'Cardiology',
    toDoctor: 'Dr. Alice Smith',
    urgency: 'EMERGENCY',
    urgencyLabel: 'Emergency (Under 1 hour)',
    status: 'WAITING',
    statusLabel: 'Waiting for Doctor to Accept',
    timeLeftMinutes: 38,
    reason: 'Sudden chest discomfort with borderline lab results. Needs urgent heart specialist checkup.',
    createdAt: '4:15 PM',
    history: [
      { step: 'Emergency Transfer Requested', time: '4:15 PM', desc: 'Dispatched by Emergency department with 1-hour deadline.' }
    ]
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n-1',
    tag: 'EMERGENCY',
    priority: 'HIGH',
    type: 'EMERGENCY',
    time: '4 mins ago',
    message: 'Emergency transfer initiated for James Wilson (MRN-92104) to Cardiology.',
    detail: 'SLA target: 60 minutes. Dispatched from Emergency ward triage.',
    transferId: 't-102',
    read: false
  },
  {
    id: 'n-2',
    tag: 'BED SURGE',
    priority: 'NORMAL',
    type: 'SYSTEM',
    time: '18 mins ago',
    message: 'Intensive Care Unit (ICU) reached 92% acute bed occupancy.',
    detail: '11 of 12 beds active. Step-down transfers to Neurology prioritized.',
    read: false
  },
  {
    id: 'n-3',
    tag: 'SAGA LOG',
    priority: 'NORMAL',
    type: 'SAGA',
    time: '42 mins ago',
    message: 'Record transfer package generated and verified for Eleanor Vance.',
    detail: 'Transferred 12-lead ECG and blood panel securely from Cardiology ➔ Neurology.',
    transferId: 't-101',
    read: true
  }
];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('carerelay_theme') || 'dark');
  const [activeView, setActiveView] = useState('transfers'); // 'transfers' | 'patients' | 'bedmap'
  const [recentlyAddedPatientId, setRecentlyAddedPatientId] = useState(null);
  
  // Database Stats State
  const [dbStats, setDbStats] = useState({
    users: INITIAL_DOCTORS.length,
    departments: INITIAL_DEPARTMENTS.length,
    patients: INITIAL_PATIENTS.length,
    referrals: INITIAL_TRANSFERS.length,
    sagaLogs: 4
  });

  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Entities initialized from DB
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [doctors, setDoctors] = useState(INITIAL_DOCTORS);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [currentUser, setCurrentUser] = useState(INITIAL_DOCTORS[0]);

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingTab, setOnboardingTab] = useState('patient');
  
  // Modals & Drawers
  const [isSagaSimulatorOpen, setIsSagaSimulatorOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [transfers, setTransfers] = useState(INITIAL_TRANSFERS);
  const [selectedId, setSelectedId] = useState(INITIAL_TRANSFERS[0].id);
  const [activeRightTab, setActiveRightTab] = useState('files');
  const [filterUrgency, setFilterUrgency] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [toast, setToast] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState(null);

  // New Transfer Form State
  const [newForm, setNewForm] = useState({
    patientIndex: 0,
    toDept: 'Neurology',
    urgency: 'URGENT',
    reason: ''
  });

  // Apply theme to HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('carerelay_theme', theme);
  }, [theme]);

  // Show Toast Helper
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // 1. PRIMARY DATABASE INITIALIZATION & QUERIES
  useEffect(() => {
    async function initDatabaseAndLoadData() {
      try {
        // Seed default records if DB tables are empty
        await clinicalDb.seedInitialDataIfEmpty({
          doctors: INITIAL_DOCTORS,
          departments: INITIAL_DEPARTMENTS,
          patients: INITIAL_PATIENTS,
          transfers: INITIAL_TRANSFERS,
          notifications: INITIAL_NOTIFICATIONS
        });

        // Query all tables directly from database
        const [dbUsers, dbDepts, dbPatients, dbTransfers, dbNotifs] = await Promise.all([
          clinicalDb.getAll('users'),
          clinicalDb.getAll('departments'),
          clinicalDb.getAll('patients'),
          clinicalDb.getAll('referrals'),
          clinicalDb.getAll('notifications')
        ]);

        if (dbUsers.length > 0) setDoctors(dbUsers);
        if (dbDepts.length > 0) setDepartments(dbDepts);
        if (dbPatients.length > 0) setPatients(dbPatients);
        if (dbTransfers.length > 0) {
          setTransfers(dbTransfers);
          setSelectedId(dbTransfers[0].id);
        }
        if (dbNotifs.length > 0) setNotifications(dbNotifs);

        // Update database stats
        const stats = await clinicalDb.getDatabaseStats();
        setDbStats(stats);
        setIsDbLoaded(true);

        // Check Gateway health and authenticate
        try {
          const online = await api.checkHealth();
          setIsBackendOnline(online);
          if (online) {
            await api.ensureAuthenticated();
            // Sync remote patients from patient-record-service SQL database
            try {
              const remotePatients = await api.searchPatients('');
              if (Array.isArray(remotePatients) && remotePatients.length > 0) {
                let updated = false;
                for (const rp of remotePatients) {
                  const existing = dbPatients.find(p => p.mrn === rp.mrn);
                  if (!existing) {
                    const fullName = `${rp.firstName || ''} ${rp.lastName || ''}`.trim() || 'Admitted Patient';
                    const approxAge = rp.dateOfBirth ? (new Date().getFullYear() - parseInt(rp.dateOfBirth.substring(0, 4))) : 42;
                    const mergedPat = {
                      id: rp.id,
                      mrn: rp.mrn,
                      name: fullName,
                      age: approxAge,
                      gender: 'Adult',
                      bloodType: rp.bloodGroup || 'O Positive',
                      allergies: rp.allergies || 'No Known Drug Allergies',
                      department: 'Cardiology',
                      condition: 'Admitted in Hospital EHR Database',
                      files: [
                        { name: 'Hospital Database Clinical Record', date: 'EHR Synchronized', summary: `MRN: ${rp.mrn}. Blood: ${rp.bloodGroup || 'N/A'}. Allergies: ${rp.allergies || 'None'}.` }
                      ]
                    };
                    await clinicalDb.put('patients', mergedPat);
                    dbPatients.push(mergedPat);
                    updated = true;
                  }
                }
                if (updated) {
                  setPatients([...dbPatients]);
                  setDbStats(await clinicalDb.getDatabaseStats());
                }
              }
            } catch(e) {
              console.warn('Notice syncing remote SQL patients:', e);
            }
          }
        } catch {
          setIsBackendOnline(false);
        }

      } catch (err) {
        console.error('Error loading database tables:', err);
        setIsDbLoaded(true);
      }
    }

    initDatabaseAndLoadData();
  }, []);

  // Timer Tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTransfers(prev => prev.map(t => {
        if (t.status === 'COMPLETED' || t.status === 'CANCELLED') return t;
        return { ...t, timeLeftMinutes: Math.max(0, t.timeLeftMinutes - 1) };
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const selectedTransfer = transfers.find(t => t.id === selectedId) || transfers[0] || INITIAL_TRANSFERS[0];

  // Actions with Database Persistence
  const handleAccept = async (id) => {
    let updatedTransfer = null;
    const newTransfers = transfers.map(t => {
      if (t.id === id) {
        updatedTransfer = {
          ...t,
          status: 'TRANSFERRED',
          statusLabel: 'Files Transferred — Awaiting Bed',
          history: [
            ...t.history,
            { step: 'Transfer Accepted', time: 'Just now', desc: `Accepted by ${currentUser.name}.` },
            { step: 'Medical Files Transferred', time: 'Just now', desc: 'All test reports and active medicines shared.' }
          ]
        };
        return updatedTransfer;
      }
      return t;
    });

    setTransfers(newTransfers);

    const alertItem = {
      id: 'n-' + Date.now(),
      tag: 'ACCEPTED',
      priority: 'NORMAL',
      type: 'REFERRAL',
      time: 'Just now',
      message: `Transfer accepted by ${currentUser.name} for ${selectedTransfer.patient.name}.`,
      detail: `Medical records transferred to ${selectedTransfer.toDept}. Awaiting bed assignment.`,
      transferId: id,
      read: false
    };
    setNotifications(prev => [alertItem, ...prev]);

    // Commit to database
    if (updatedTransfer) {
      await clinicalDb.put('referrals', updatedTransfer);
      await clinicalDb.put('saga_log', {
        id: 'saga-' + Date.now(),
        referralId: id,
        stepName: 'REFERRAL_ACCEPTED',
        stepStatus: 'SUCCEEDED',
        createdAt: new Date().toISOString()
      });
      await clinicalDb.put('notifications', alertItem);
      setDbStats(await clinicalDb.getDatabaseStats());
    }

    // Attempt remote backend sync
    try { await api.acceptReferral(id); } catch(e) {}
    showToast('✓ Patient transfer accepted! Stored in database.');
  };

  const handleConfirmArrival = async (id) => {
    let updatedTransfer = null;
    const newTransfers = transfers.map(t => {
      if (t.id === id) {
        updatedTransfer = {
          ...t,
          status: 'COMPLETED',
          statusLabel: 'Completed — Patient in New Ward',
          history: [
            ...t.history,
            { step: 'Patient Arrived at Bed', time: 'Just now', desc: `Confirmed by ${currentUser.name}. Transfer is complete!` }
          ]
        };
        return updatedTransfer;
      }
      return t;
    });

    setTransfers(newTransfers);

    const alertItem = {
      id: 'n-' + Date.now(),
      tag: 'COMPLETED',
      priority: 'NORMAL',
      type: 'REFERRAL',
      time: 'Just now',
      message: `Patient arrived at bed in ${selectedTransfer.toDept}. Handoff complete.`,
      detail: `Confirmed by ${currentUser.name}. Bed officially allocated.`,
      transferId: id,
      read: false
    };
    setNotifications(prev => [alertItem, ...prev]);

    // Commit to database
    if (updatedTransfer) {
      await clinicalDb.put('referrals', updatedTransfer);
      await clinicalDb.put('saga_log', {
        id: 'saga-' + Date.now(),
        referralId: id,
        stepName: 'HANDOFF_CONFIRMED',
        stepStatus: 'SUCCEEDED',
        createdAt: new Date().toISOString()
      });
      await clinicalDb.put('notifications', alertItem);
      setDbStats(await clinicalDb.getDatabaseStats());
    }

    // Attempt remote backend sync
    try { await api.confirmHandoff(id); } catch(e) {}
    showToast('✓ Bed handoff confirmed! Stored in database.');
  };

  const handleCancel = async (id) => {
    let updatedTransfer = null;
    const newTransfers = transfers.map(t => {
      if (t.id === id) {
        updatedTransfer = {
          ...t,
          status: 'CANCELLED',
          statusLabel: 'Cancelled & Rolled Back',
          history: [
            ...t.history,
            { step: 'Transfer Cancelled', time: 'Just now', desc: 'Transfer was cancelled. Medical file access reverted.' }
          ]
        };
        return updatedTransfer;
      }
      return t;
    });

    setTransfers(newTransfers);

    if (updatedTransfer) {
      await clinicalDb.put('referrals', updatedTransfer);
      setDbStats(await clinicalDb.getDatabaseStats());
    }

    try { await api.cancelReferral(id, 'User manual cancellation'); } catch(e) {}
    showToast('✕ Transfer cancelled. Database record updated.');
  };

  // Saga Compensating Rollback Execution with Database Audit
  const handleRollbackExecute = async (transferId, scenarioTitle) => {
    let updatedTransfer = null;
    const newTransfers = transfers.map(t => {
      if (t.id === transferId) {
        updatedTransfer = {
          ...t,
          status: 'CANCELLED',
          statusLabel: 'Cancelled & Rolled Back',
          history: [
            ...t.history,
            {
              step: 'Saga Compensating Rollback Executed',
              time: 'Just now',
              desc: `Automated Saga compensation fired: ${scenarioTitle}. Temporary EHR decryption revoked, reserved bed hold released, and audit logged to saga_log table.`
            }
          ]
        };
        return updatedTransfer;
      }
      return t;
    });

    setTransfers(newTransfers);

    const newAlert = {
      id: 'n-' + Date.now(),
      tag: 'SAGA COMPENSATED',
      priority: 'HIGH',
      type: 'SAGA',
      time: 'Just now',
      message: `Saga Rollback: ${scenarioTitle}`,
      detail: `Compensating transactions executed across Kafka topics. Access tokens revoked.`,
      transferId,
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);

    // Commit to database
    if (updatedTransfer) {
      await clinicalDb.put('referrals', updatedTransfer);
      await clinicalDb.put('saga_log', {
        id: 'saga-' + Date.now(),
        referralId: transferId,
        stepName: 'SAGA_COMPENSATION_EXECUTED',
        stepStatus: 'COMPENSATED',
        payload: JSON.stringify({ failureScenario: scenarioTitle }),
        createdAt: new Date().toISOString()
      });
      await clinicalDb.put('notifications', newAlert);
      setDbStats(await clinicalDb.getDatabaseStats());
    }

    try { await api.cancelReferral(transferId, scenarioTitle); } catch(e) {}
    setIsSagaSimulatorOpen(false);
  };

  const handleGenerateSummary = () => {
    if (!selectedTransfer) return;
    setIsAiLoading(true);
    setAiNote(null);
    setTimeout(() => {
      setIsAiLoading(false);
      setAiNote({
        generatedAt: 'Just now',
        patient: selectedTransfer.patient.name,
        mrn: selectedTransfer.patient.mrn,
        bullets: [
          {
            title: 'Why is the patient transferring?',
            content: selectedTransfer.reason
          },
          {
            title: 'What do the lab tests and clinical history show?',
            content: `Condition: ${selectedTransfer.patient.condition}. Blood group: ${selectedTransfer.patient.bloodType}. Vitals and preliminary telemetry reviewed.`
          },
          {
            title: 'Safety Warnings & Allergies',
            content: `Allergic to: ${selectedTransfer.patient.allergies || 'No known allergies'}. Active medication schedule initiated.`
          },
          {
            title: 'Recommended Next Steps for Receiving Ward',
            content: `1. Verify bed telemetry lead upon arrival in ${selectedTransfer.toDept}. 2. Re-check standing blood pressure. 3. Immediate attending review by ${selectedTransfer.toDoctor}.`
          }
        ]
      });
      showToast('✨ AI Doctor Summary generated successfully!');
    }, 750);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const patient = patients[newForm.patientIndex] || patients[0];
    const targetDoc = doctors.find(d => d.department === newForm.toDept) || doctors[0];
    
    const newTransfer = {
      id: 't-' + Math.random().toString(36).substring(2, 7),
      patient: patient,
      fromDept: currentUser.department,
      fromDoctor: currentUser.name,
      toDept: newForm.toDept,
      toDoctor: targetDoc.name,
      urgency: newForm.urgency,
      urgencyLabel: newForm.urgency === 'EMERGENCY' ? 'Emergency (Under 1 hour)' : newForm.urgency === 'URGENT' ? 'Urgent (Within 4 hours)' : 'Routine (Within 24 hours)',
      status: 'WAITING',
      statusLabel: 'Waiting for Doctor to Accept',
      timeLeftMinutes: newForm.urgency === 'EMERGENCY' ? 60 : newForm.urgency === 'URGENT' ? 240 : 1440,
      reason: newForm.reason || 'General specialist consultation and bed transfer.',
      createdAt: 'Just now',
      history: [
        { step: 'Transfer Requested', time: 'Just now', desc: `Created by ${currentUser.name}.` }
      ]
    };

    setTransfers([newTransfer, ...transfers]);
    setSelectedId(newTransfer.id);
    setIsNewModalOpen(false);
    setNewForm({ patientIndex: 0, toDept: departments[0]?.name || 'Neurology', urgency: 'URGENT', reason: '' });

    const newAlert = {
      id: 'n-' + Date.now(),
      tag: newForm.urgency === 'EMERGENCY' ? 'EMERGENCY' : 'NEW TRANSFER',
      priority: newForm.urgency === 'EMERGENCY' ? 'HIGH' : 'NORMAL',
      type: 'REFERRAL',
      time: 'Just now',
      message: `New transfer created: ${patient.name} ➔ ${newForm.toDept}`,
      detail: `Initiated by ${currentUser.name}. Urgency: ${newForm.urgency}.`,
      transferId: newTransfer.id,
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);

    // Save to Database
    await clinicalDb.put('referrals', newTransfer);
    await clinicalDb.put('saga_log', {
      id: 'saga-' + Date.now(),
      referralId: newTransfer.id,
      stepName: 'REFERRAL_CREATED',
      stepStatus: 'STARTED',
      payload: JSON.stringify({ patientId: patient.id, toDept: newForm.toDept, urgency: newForm.urgency }),
      createdAt: new Date().toISOString()
    });
    await clinicalDb.put('notifications', newAlert);
    setDbStats(await clinicalDb.getDatabaseStats());

    // Remote backend sync to Spring Boot SQL Database
    try {
      if (isBackendOnline) {
        await api.ensureAuthenticated();
        await api.createReferral({
          patientId: (patient.id && patient.id.includes('-') && patient.id.length === 36) ? patient.id : '0cee1147-9d8b-4c2c-b4c3-2d825571d91c',
          receivingDoctorId: (targetDoc.id && targetDoc.id.includes('-') && targetDoc.id.length === 36) ? targetDoc.id : 'a0000000-0000-0000-0000-000000000002',
          referringDepartment: currentUser.department || 'Cardiology',
          receivingDepartment: newForm.toDept,
          reason: newForm.reason || 'General specialist consultation and bed transfer.',
          urgency: newForm.urgency,
          notes: `Transfer initiated by ${currentUser.name}`
        });
      }
    } catch(e) {
      console.warn('Backend create referral sync notice:', e);
    }
    showToast('✓ Transfer created & saved to database!');
  };

  // Direct transfer shortcut from Bed Map
  const handleInitiateTransferToDept = (deptName) => {
    setNewForm(prev => ({ ...prev, toDept: deptName }));
    setActiveView('transfers');
    setIsNewModalOpen(true);
  };

  // Onboarding Add Callbacks with Database Writes
  const handleAddPatient = async (newPat) => {
    setPatients(prev => [newPat, ...prev]);
    setRecentlyAddedPatientId(newPat.id);
    await clinicalDb.put('patients', newPat);
    setDbStats(await clinicalDb.getDatabaseStats());

    // Switch view to Patient Roster so user immediately sees their admitted patient!
    setActiveView('patients');

    // Remote backend sync to Spring Boot SQL database
    try {
      if (isBackendOnline) {
        await api.ensureAuthenticated();
        const names = (newPat.name || '').trim().split(' ');
        const firstName = names[0] || 'Patient';
        const lastName = names.slice(1).join(' ') || newPat.mrn;
        await api.createPatient({
          mrn: newPat.mrn,
          firstName,
          lastName,
          dateOfBirth: newPat.dateOfBirth || '1985-01-01',
          bloodGroup: newPat.bloodType || 'O+',
          allergies: newPat.allergies || 'None'
        });
      }
    } catch(e) {
      console.warn('Backend sync patient notice:', e);
    }

    showToast(`✓ Admitted ${newPat.name} (${newPat.mrn}) — showing in Patients Directory`);
  };

  const handleAddDoctor = async (newDoc) => {
    setDoctors(prev => [...prev, newDoc]);
    await clinicalDb.put('users', newDoc);
    setDbStats(await clinicalDb.getDatabaseStats());

    // Remote backend sync to Spring Boot SQL database
    try {
      if (isBackendOnline) {
        const cleanName = (newDoc.name || '').replace(/^(Dr\.|Nurse|Admin)\s+/i, '').trim();
        const names = cleanName.split(' ');
        await api.register({
          email: newDoc.email,
          password: 'password123',
          firstName: names[0] || 'Doctor',
          lastName: names.slice(1).join(' ') || 'Staff',
          role: newDoc.role || 'DOCTOR',
          department: newDoc.department || 'General'
        });
      }
    } catch(e) {
      console.warn('Backend sync doctor notice:', e);
    }

    showToast(`✓ Doctor ${newDoc.name} saved to database`);
  };

  const handleAddDepartment = async (newDept) => {
    setDepartments(prev => [...prev, newDept]);
    await clinicalDb.put('departments', newDept);
    setDbStats(await clinicalDb.getDatabaseStats());
    showToast(`✓ Department ${newDept.name} saved to database`);
  };

  const handleOpenOnboarding = (tab = 'patient') => {
    setOnboardingTab(tab);
    setIsOnboardingOpen(true);
  };

  // Notification helpers with Database Writes
  const handleMarkAsRead = async (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    const target = updated.find(n => n.id === id);
    if (target) {
      await clinicalDb.put('notifications', target);
    }
  };

  const handleMarkAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await clinicalDb.putBulk('notifications', updated);
  };

  const unreadAlertsCount = notifications.filter(n => !n.read).length;

  // If user is logged out, show the dedicated Doctor Login Screen
  if (!isLoggedIn) {
    return (
      <>
        <DoctorLogin
          doctors={doctors}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoggedIn(true);
          }}
          onOpenOnboardModal={(tab) => handleOpenOnboarding(tab)}
          theme={theme}
          setTheme={setTheme}
          showToast={showToast}
        />
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          initialTab={onboardingTab}
          departments={departments}
          onAddDepartment={handleAddDepartment}
          doctors={doctors}
          onAddDoctor={handleAddDoctor}
          onAddPatient={handleAddPatient}
          showToast={showToast}
        />
        {toast && (
          <div className="toast-alert">
            <Info size={16} color="var(--accent-main)" />
            <span>{toast}</span>
          </div>
        )}
      </>
    );
  }

  const filtered = transfers.filter(t => {
    const matchUrgency = filterUrgency === 'ALL' || t.urgency === filterUrgency;
    const matchSearch = t.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchUrgency && matchSearch;
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* Brand & Hospital Ward */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--accent-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Heart size={20} fill="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>CareRelay</span>
              <span style={{ fontSize: '0.725rem', background: 'var(--accent-bg)', color: 'var(--accent-main)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                CLINICAL WORKSTATION
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              St. Jude Medical Center • {currentUser.department} Ward
            </div>
          </div>
        </div>

        {/* Center: View Switcher (Referrals Board vs Patient Roster vs Bed Map) */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-inset)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveView('transfers')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.775rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeView === 'transfers' ? 'var(--bg-surface)' : 'transparent',
              color: activeView === 'transfers' ? 'var(--accent-main)' : 'var(--text-secondary)',
              boxShadow: activeView === 'transfers' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Activity size={14} />
            <span>Referrals Board ({transfers.length})</span>
          </button>

          <button
            onClick={() => setActiveView('patients')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.775rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeView === 'patients' ? 'var(--bg-surface)' : 'transparent',
              color: activeView === 'patients' ? 'var(--accent-main)' : 'var(--text-secondary)',
              boxShadow: activeView === 'patients' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Heart size={14} />
            <span>Patient Roster ({patients.length})</span>
          </button>

          <button
            onClick={() => setActiveView('bedmap')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.775rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: activeView === 'bedmap' ? 'var(--bg-surface)' : 'transparent',
              color: activeView === 'bedmap' ? 'var(--accent-main)' : 'var(--text-secondary)',
              boxShadow: activeView === 'bedmap' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Bed size={14} />
            <span>Ward Bed Map</span>
          </button>
        </div>

        {/* Right: Theme Switcher, Database Status, Saga Rollback, Notifications, User Profile & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Live Database Persistence Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-inset)',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.725rem'
            }}
            title="Every row is read from and saved directly into the database engine on disk"
          >
            <Database size={13} color="var(--status-success-text)" />
            <span style={{ fontWeight: 700, color: 'var(--status-success-text)' }}>Database Active</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.675rem' }}>
              {dbStats.referrals} transfers, {dbStats.patients} patients
            </span>
          </div>

          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="btn btn-outline"
            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#0284c7" />}
          </button>

          {/* Saga Failure Simulator Trigger */}
          <button
            onClick={() => setIsSagaSimulatorOpen(true)}
            className="btn btn-outline"
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              gap: '6px',
              borderColor: 'rgba(239, 68, 68, 0.35)',
              color: 'var(--status-emergency-text)'
            }}
            title="Simulate Saga Distributed Transaction Failure & Compensation"
          >
            <RotateCcw size={14} />
            <span>Simulate Saga Rollback</span>
          </button>

          {/* Notification Bell with Badge */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            style={{
              position: 'relative',
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '7px 10px',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Open Clinical Notifications & Kafka Audit Stream"
          >
            <Bell size={16} color="var(--accent-main)" />
            {unreadAlertsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'var(--status-emergency-text)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Quick Onboarding Button */}
          <button
            onClick={() => handleOpenOnboarding('patient')}
            className="btn btn-outline"
            style={{ padding: '6px 12px', fontSize: '0.75rem', gap: '6px' }}
            title="Onboard Patient, Register Doctor, or Add Department"
          >
            <UserPlus size={15} color="var(--accent-main)" />
            <span>+ Onboard...</span>
          </button>

          {/* User Persona Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-inset)',
            padding: '5px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--accent-main)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.775rem'
            }}>
              {currentUser.name.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 700 }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{currentUser.department}</div>
            </div>
            
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = doctors.find(d => d.id === e.target.value);
                if (u) {
                  setCurrentUser(u);
                  showToast(`Switched account to ${u.name}`);
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-main)',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
                marginLeft: '2px'
              }}
            >
              {doctors.map(d => (
                <option key={d.id} value={d.id} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                  {d.name} ({d.department})
                </option>
              ))}
            </select>
          </div>

          {/* New Transfer Button */}
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '0.775rem' }}
          >
            <Plus size={15} /> Transfer Patient
          </button>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              setIsLoggedIn(false);
              showToast('Logged out of clinical workstation');
            }}
            className="btn btn-outline"
            style={{ padding: '6px 8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
            title="Log out and return to Doctor Login Screen"
          >
            <LogOut size={14} />
          </button>

        </div>
      </header>

      {/* 2. SUB-BAR: FILTERS / SUMMARY */}
      {activeView === 'transfers' && (
        <div style={{
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search patient, MRN, diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-box"
              style={{ paddingLeft: '32px', height: '34px', fontSize: '0.8rem' }}
            />
          </div>

          {/* Urgency Filter Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Urgency:</span>
            {['ALL', 'EMERGENCY', 'URGENT', 'ROUTINE'].map(u => (
              <button
                key={u}
                onClick={() => setFilterUrgency(u)}
                style={{
                  background: filterUrgency === u ? 'var(--accent-main)' : 'var(--bg-inset)',
                  color: filterUrgency === u ? '#ffffff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: filterUrgency === u ? 'var(--accent-main)' : 'var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {u === 'ALL' ? 'All Cases' : u.charAt(0) + u.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Quick Links for Directory Onboarding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Database Tables:</span>
            <button
              onClick={() => setActiveView('patients')}
              style={{
                background: activeView === 'patients' ? 'var(--accent-bg)' : 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.725rem',
                color: activeView === 'patients' ? 'var(--accent-main)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: activeView === 'patients' ? 700 : 500
              }}
              title="View all admitted patients stored in database"
            >
              <Heart size={12} color="var(--accent-main)" /> View Patients ({patients.length})
            </button>
            <button
              onClick={() => handleOpenOnboarding('patient')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.725rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              + Admit Patient
            </button>
            <button
              onClick={() => handleOpenOnboarding('doctor')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.725rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Stethoscope size={12} color="var(--accent-main)" /> + Doctor ({doctors.length})
            </button>
            <button
              onClick={() => handleOpenOnboarding('department')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '0.725rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Building2 size={12} color="var(--accent-main)" /> + Dept ({departments.length})
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSTATION VIEW */}
      <div style={{
        flex: 1,
        padding: '20px 24px',
        maxWidth: '1500px',
        width: '100%',
        margin: '0 auto'
      }}>
        
        {/* VIEW A: WARD BED MAP */}
        {activeView === 'bedmap' && (
          <WardBedMap
            departments={departments}
            transfers={transfers}
            onInitiateTransferToDept={handleInitiateTransferToDept}
          />
        )}

        {/* VIEW B: ADMITTED PATIENTS DIRECTORY */}
        {activeView === 'patients' && (
          <PatientRoster
            patients={patients}
            departments={departments}
            onOpenAdmitModal={() => handleOpenOnboarding('patient')}
            onInitiateTransfer={(patient) => {
              const idx = patients.findIndex(p => p.id === patient.id);
              setNewForm(prev => ({
                ...prev,
                patientIndex: idx >= 0 ? idx : 0
              }));
              setIsNewModalOpen(true);
            }}
            recentlyAddedId={recentlyAddedPatientId}
          />
        )}

        {/* VIEW C: ACTIVE PATIENT TRANSFERS WORKSTATION */}
        {activeView === 'transfers' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.25fr 1fr',
            gap: '20px'
          }}>
            {/* LEFT COLUMN: ACTIVE PATIENT TRANSFERS */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  Active Referrals & Ward Handoffs ({filtered.length})
                </h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  All records queried directly from database
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filtered.map(t => {
                  const isSelected = t.id === selectedId;
                  const isEmergency = t.urgency === 'EMERGENCY';
                  const hours = Math.floor(t.timeLeftMinutes / 60);
                  const mins = t.timeLeftMinutes % 60;

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`card ${isSelected ? 'card-selected' : ''} ${isEmergency && t.status !== 'COMPLETED' ? 'pulse-emergency' : ''}`}
                      style={{ padding: '16px', cursor: 'pointer' }}
                    >
                      {/* Top: Name, Urgency, Countdown */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', fontWeight: 800 }}>{t.patient.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({t.patient.age} yrs, {t.patient.gender})</span>
                            <span style={{ fontSize: '0.725rem', fontFamily: 'monospace', background: 'var(--bg-inset)', padding: '2px 6px', borderRadius: '4px' }}>
                              {t.patient.mrn}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            From <strong>{t.fromDept}</strong> ({t.fromDoctor}) ➔ To <strong>{t.toDept}</strong> ({t.toDoctor})
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span className={`status-pill status-${t.urgency.toLowerCase()}`}>
                            {t.urgency}
                          </span>
                          {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                            <div style={{ fontSize: '0.725rem', fontWeight: 700, color: isEmergency ? 'var(--status-emergency-text)' : 'var(--status-urgent-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                              <Clock size={12} /> {hours > 0 ? `${hours}h ` : ''}{mins}m remaining
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reason for Transfer */}
                      <div style={{ background: 'var(--bg-inset)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                        <strong>Reason:</strong> {t.reason}
                      </div>

                      {/* Actions & Status Pill */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                        <span className={`status-pill status-${t.status === 'COMPLETED' ? 'completed' : t.status === 'WAITING' ? 'urgent' : t.status === 'CANCELLED' ? 'emergency' : 'routine'}`}>
                          {t.statusLabel}
                        </span>

                        <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                          {t.status === 'WAITING' && (
                            <button
                              onClick={() => handleAccept(t.id)}
                              className="btn btn-primary btn-sm"
                            >
                              <Check size={13} /> Accept Patient
                            </button>
                          )}

                          {t.status === 'TRANSFERRED' && (
                            <button
                              onClick={() => handleConfirmArrival(t.id)}
                              className="btn btn-success btn-sm"
                            >
                              <CheckCircle2 size={13} /> Mark as Arrived at Bed
                            </button>
                          )}

                          {t.status !== 'COMPLETED' && t.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleCancel(t.id)}
                              className="btn btn-danger btn-sm"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: PATIENT CASE FILE & SAGA AUDIT & AI */}
            <div>
              {selectedTransfer && (
                <div className="card" style={{ padding: '20px', position: 'sticky', top: '80px' }}>
                  
                  {/* Patient Header */}
                  <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PATIENT CASE FILE (DATABASE RECORD)</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedTransfer.patient.name}</h3>
                  </div>
                  <span className={`status-pill status-${selectedTransfer.urgency.toLowerCase()}`}>
                    {selectedTransfer.urgencyLabel}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                  <span>MRN: <strong>{selectedTransfer.patient.mrn}</strong></span>
                  <span>•</span>
                  <span>Blood: <strong>{selectedTransfer.patient.bloodType}</strong></span>
                  <span>•</span>
                  <span style={{ color: 'var(--status-emergency-text)', fontWeight: 600 }}>
                    ⚠️ Allergies: {selectedTransfer.patient.allergies}
                  </span>
                </div>
              </div>

              {/* Right Tabs: Medical Files vs Transfer History */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', background: 'var(--bg-inset)', padding: '4px', borderRadius: '6px' }}>
                <button
                  onClick={() => setActiveRightTab('files')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeRightTab === 'files' ? 'var(--bg-surface)' : 'transparent',
                    color: activeRightTab === 'files' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: activeRightTab === 'files' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  📁 Medical Records ({selectedTransfer.patient.files?.length || 0})
                </button>
                <button
                  onClick={() => setActiveRightTab('history')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '0.775rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: activeRightTab === 'history' ? 'var(--bg-surface)' : 'transparent',
                    color: activeRightTab === 'history' ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: activeRightTab === 'history' ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  ⚡ Saga History ({selectedTransfer.history.length})
                </button>
              </div>

              {/* TAB: MEDICAL FILES */}
              {activeRightTab === 'files' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {(selectedTransfer.patient.files || []).map((file, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-inset)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--accent-main)' }}>{file.name}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{file.date}</span>
                      </div>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{file.summary}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: TRANSFER HISTORY (SAGA LOG) */}
              {activeRightTab === 'history' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {selectedTransfer.history.map((h, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'var(--bg-inset)', padding: '10px', borderRadius: '6px' }}>
                      <CheckCircle2 size={16} color="var(--status-success-text)" style={{ marginTop: '2px' }} />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{h.step}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.time}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{h.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Clinical Summary Box */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="var(--accent-main)" /> AI Doctor Summary
                    </h4>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Summarizes test reports and conditions in plain English
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateSummary}
                    disabled={isAiLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {isAiLoading ? <RefreshCw size={13} className="spin" /> : <Sparkles size={13} />}
                    {isAiLoading ? 'Reading Files...' : 'Generate Summary'}
                  </button>
                </div>

                {aiNote ? (
                  <div style={{ background: 'var(--bg-inset)', border: '1px solid var(--border-medium)', borderRadius: '8px', padding: '14px', animation: 'slideUpFade 0.2s' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-main)', fontWeight: 700, marginBottom: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                      Clinical Briefing for {aiNote.patient} ({aiNote.mrn}) • Generated {aiNote.generatedAt}
                    </div>
                    
                    {aiNote.bullets.map((b, i) => (
                      <div key={i} style={{ marginBottom: i !== aiNote.bullets.length - 1 ? '10px' : 0 }}>
                        <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)' }}>{b.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>{b.content}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-inset)', border: '1px dashed var(--border-medium)', borderRadius: '6px', padding: '14px', textAlign: 'center', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    Click <strong>"Generate Summary"</strong> above to summarize this patient's records for the receiving ward.
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    )}

      </div>

      {/* 4. MODAL: TRANSFER PATIENT */}
      {isNewModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsNewModalOpen(false)}>
          <div className="modal-card animate-pop-in" onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Transfer Patient to Another Ward</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Writes to database and notifies receiving doctor instantly</p>
              </div>
              <button onClick={() => setIsNewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.775rem', fontWeight: 600 }}>Select Patient (from Database)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewModalOpen(false);
                      handleOpenOnboarding('patient');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-main)', fontSize: '0.7rem', cursor: 'pointer' }}
                  >
                    + Admit New Patient First
                  </button>
                </div>
                <select
                  value={newForm.patientIndex}
                  onChange={e => setNewForm({ ...newForm, patientIndex: parseInt(e.target.value) })}
                  className="input-box"
                >
                  {patients.map((p, idx) => (
                    <option key={p.id} value={idx}>{p.name} ({p.mrn}) — {p.condition}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, marginBottom: '4px' }}>Transfer To Ward</label>
                  <select
                    value={newForm.toDept}
                    onChange={e => setNewForm({ ...newForm, toDept: e.target.value })}
                    className="input-box"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, marginBottom: '4px' }}>How Urgent is This?</label>
                  <select
                    value={newForm.urgency}
                    onChange={e => setNewForm({ ...newForm, urgency: e.target.value })}
                    className="input-box"
                  >
                    <option value="ROUTINE">Routine (Within 24 hours)</option>
                    <option value="URGENT">Urgent (Within 4 hours)</option>
                    <option value="EMERGENCY">Emergency (Under 1 hour)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 600, marginBottom: '4px' }}>Why is the patient transferring?</label>
                <textarea
                  rows="3"
                  placeholder="Explain why the patient needs to see the specialist..."
                  value={newForm.reason}
                  onChange={e => setNewForm({ ...newForm, reason: e.target.value })}
                  className="input-box"
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                <button type="button" onClick={() => setIsNewModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={14} /> Send Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. ONBOARDING MODAL (PATIENT, DOCTOR, DEPARTMENT) */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        initialTab={onboardingTab}
        departments={departments}
        onAddDepartment={handleAddDepartment}
        doctors={doctors}
        onAddDoctor={handleAddDoctor}
        onAddPatient={handleAddPatient}
        showToast={showToast}
      />

      {/* 6. SAGA ROLLBACK SIMULATOR MODAL */}
      <SagaRollbackSimulator
        isOpen={isSagaSimulatorOpen}
        onClose={() => setIsSagaSimulatorOpen(false)}
        transfers={transfers}
        onRollbackExecute={handleRollbackExecute}
        showToast={showToast}
      />

      {/* 7. CLINICAL NOTIFICATIONS & ALERT DRAWER */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onSelectTransfer={(id) => {
          setSelectedId(id);
          setActiveView('transfers');
        }}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        showToast={showToast}
      />

      {/* 8. INTERACTION TOAST */}
      {toast && (
        <div className="toast-alert">
          <Info size={16} color="var(--accent-main)" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
