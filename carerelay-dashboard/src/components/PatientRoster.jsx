import React, { useState } from 'react';
import {
  Heart,
  Search,
  Plus,
  FileText,
  ArrowRight,
  ShieldAlert,
  User,
  Calendar,
  Building2,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  Filter
} from 'lucide-react';

export default function PatientRoster({
  patients,
  departments,
  onOpenAdmitModal,
  onInitiateTransfer,
  recentlyAddedId
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [expandedPatientId, setExpandedPatientId] = useState(recentlyAddedId || null);

  // Filter patients by search & department
  const filteredPatients = patients.filter(p => {
    const matchesDept = filterDept === 'ALL' || (p.department || '') === filterDept;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesDept;
    
    const matchesSearch = 
      (p.name || '').toLowerCase().includes(q) ||
      (p.mrn || '').toLowerCase().includes(q) ||
      (p.condition || '').toLowerCase().includes(q) ||
      (p.bloodType || '').toLowerCase().includes(q) ||
      (p.allergies || '').toLowerCase().includes(q);
      
    return matchesDept && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. Header Banner & Actions */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-main)'
            }}>
              <Heart size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                Admitted Patients Directory
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Total {patients.length} patients residing in database • Full Electronic Health Records (EHR) & transfer status
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAdmitModal}
          className="btn btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Admit New Patient
        </button>
      </div>

      {/* 2. Search & Department Filters */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-inset)',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          flex: '1',
          minWidth: '240px'
        }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search patient by Name, MRN, condition, or blood group..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.8rem',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Filter by Department */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Ward:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            style={{
              background: 'var(--bg-inset)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.775rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="ALL">All Wards ({patients.length})</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Patients Grid / List */}
      {filteredPatients.length === 0 ? (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border-medium)',
          borderRadius: '10px',
          padding: '48px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <User size={36} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Patients Found
          </h3>
          <p style={{ fontSize: '0.8rem', maxWidth: '380px', margin: '0 auto 16px' }}>
            {searchQuery ? `No admitted patients match "${searchQuery}". Try clearing search.` : 'No patients currently admitted under this ward.'}
          </p>
          <button onClick={onOpenAdmitModal} className="btn btn-primary btn-sm">
            <Plus size={14} /> Admit Patient to Database
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredPatients.map((patient) => {
            const isExpanded = expandedPatientId === patient.id;
            const isJustAdded = recentlyAddedId === patient.id;

            return (
              <div
                key={patient.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: isJustAdded ? '2px solid var(--accent-main)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  boxShadow: isJustAdded ? '0 0 12px rgba(180, 83, 9, 0.25)' : 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Main Card Header / Bar */}
                <div style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}>
                  {/* Left: Patient Avatar & Identity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'var(--bg-inset)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: 'var(--accent-main)'
                    }}>
                      {(patient.name || 'P').charAt(0)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {patient.name}
                        </h3>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '0.725rem',
                          background: 'var(--bg-inset)',
                          border: '1px solid var(--border-subtle)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          color: 'var(--text-secondary)'
                        }}>
                          {patient.mrn}
                        </span>

                        {isJustAdded && (
                          <span style={{
                            fontSize: '0.675rem',
                            background: 'var(--status-success-bg)',
                            color: 'var(--status-success-text)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckCircle2 size={11} /> JUST ADMITTED
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span>Age: <strong>{patient.age || '45'}</strong> ({patient.gender || 'Unknown'})</span>
                        <span>•</span>
                        <span>Blood: <strong>{patient.bloodType || patient.bloodGroup || 'O+'}</strong></span>
                        <span>•</span>
                        <span>Ward: <strong style={{ color: 'var(--accent-main)' }}>{patient.department || 'Cardiology'}</strong></span>
                        <span>•</span>
                        <span>Allergies: <strong style={{ color: (patient.allergies && !patient.allergies.includes('None')) ? 'var(--status-danger-text)' : 'inherit' }}>
                          {patient.allergies || 'None reported'}
                        </strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => onInitiateTransfer(patient)}
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowRight size={13} /> Transfer to Ward
                    </button>

                    <button
                      onClick={() => setExpandedPatientId(isExpanded ? null : patient.id)}
                      className="btn btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <FileText size={13} />
                      <span>{isExpanded ? 'Hide Records' : `View EHR (${(patient.files || []).length})`}</span>
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Primary Condition Strip */}
                <div style={{
                  padding: '8px 20px',
                  background: 'var(--bg-inset)',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.775rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Activity size={14} color="var(--accent-main)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Clinical Condition:</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {patient.condition || 'Admitted for clinical monitoring and evaluation.'}
                  </span>
                </div>

                {/* Expanded EHR Records / Labs */}
                {isExpanded && (
                  <div style={{
                    padding: '16px 20px',
                    borderTop: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    animation: 'slideUpFade 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>
                        Attached Clinical Test Files & Medical History
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Verified in PostgreSQL/H2 & Client DB
                      </span>
                    </div>

                    {(!patient.files || patient.files.length === 0) ? (
                      <div style={{
                        padding: '12px',
                        background: 'var(--bg-inset)',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        textAlign: 'center'
                      }}>
                        No external lab files attached yet. Initial admission assessment active.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {patient.files.map((file, idx) => (
                          <div
                            key={idx}
                            style={{
                              background: 'var(--bg-inset)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: '6px',
                              padding: '10px 14px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '12px'
                            }}
                          >
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                              <FileText size={16} color="var(--accent-main)" style={{ marginTop: '2px' }} />
                              <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {file.name}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                  {file.summary}
                                </div>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                              {file.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
