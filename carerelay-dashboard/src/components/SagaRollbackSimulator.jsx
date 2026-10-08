import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Server,
  FileX,
  Bed,
  BellRing,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const FAILURE_SCENARIOS = [
  {
    id: 'BED_UNAVAILABLE',
    title: 'Ward Bed Capacity Exhausted',
    service: 'ward-capacity-service',
    event: 'BED_ALLOCATION_FAILED',
    icon: Bed,
    description: 'Receiving ward reaches 100% acute occupancy. Zero monitored telemetry beds remain.',
    compensationSteps: [
      { step: 'Kafka Event Emitted', detail: 'Event: BedAllocationFailedEvent published to topic clinical.referral.events' },
      { step: 'Revoke Medical Record Access', detail: 'patient-record-service deletes temporary JWT encryption key for transfer package' },
      { step: 'Release Pre-allocated Resources', detail: 'Any reserved transport stretcher and triage nurse slots are released' },
      { step: 'Commit Saga Rollback to DB', detail: 'referral-service writes COMPENSATED state to PostgreSQL saga_log table' },
      { step: 'Clinical Alert Dispatched', detail: 'notification-service alerts sending physician: "Bed unavailable; patient remains in ward"' }
    ]
  },
  {
    id: 'CLINICAL_REJECTION',
    title: 'Receiving Doctor Clinical Rejection',
    service: 'referral-service',
    event: 'REFERRAL_REJECTED',
    icon: ShieldAlert,
    description: 'Receiving specialist reviews patient chart and determines patient is hemodynamically unstable for transfer.',
    compensationSteps: [
      { step: 'Rejection Logged by Clinician', detail: 'POST /api/v1/referrals/{id}/reject with clinical rationale code UNSTABLE_FOR_TRANSFER' },
      { step: 'Revoke EHR Access Token', detail: 'patient-record-service revokes access to ECG and lab test packages' },
      { step: 'Release Inbound Ward Bed', detail: 'Bed reservation cancelled in receiving ward management system' },
      { step: 'Saga State Updated', detail: 'Saga orchestrator transitions state: PENDING ➔ COMPENSATION_EXECUTED' },
      { step: 'Dispatch High-Priority Notification', detail: 'Urgent notification pushed to sending doctor for bedside stabilization' }
    ]
  },
  {
    id: 'EHR_TRANSFER_FAIL',
    title: 'Medical Record Transfer Failure',
    service: 'patient-record-service',
    event: 'RECORD_TRANSFER_FAILED',
    icon: FileX,
    description: 'Cryptographic payload verification failed during transfer package assembly.',
    compensationSteps: [
      { step: 'Transfer Package Exception', detail: 'patient-record-service encounters checksum mismatch on radiological scans' },
      { step: 'Trigger Compensating Saga', detail: 'Kafka consumer in referral-service detects failure and triggers compensation' },
      { step: 'Cancel Inbound Ward Reservation', detail: 'Target ward bed hold is released back into hospital open pool' },
      { step: 'Rollback Database Record', detail: 'Referral status marked as CANCELLED (EHR_TRANSFER_ERROR) in saga_log' },
      { step: 'Hospital IT Alert Emitted', detail: 'Audit event logged in notification-service with trace ID for security compliance' }
    ]
  },
  {
    id: 'RESILIENCE4J_TIMEOUT',
    title: 'Network Partition / Circuit Breaker Open',
    service: 'api-gateway',
    event: 'CIRCUIT_BREAKER_FALLBACK',
    icon: Server,
    description: 'Downstream microservice response exceeded 2000ms SLA. Resilience4j opens circuit.',
    compensationSteps: [
      { step: 'Resilience4j Threshold Tripped', detail: 'CircuitBreaker state transitioned from CLOSED ➔ OPEN (failure rate > 50%)' },
      { step: 'Fallback Method Invoked', detail: 'Fallback handler returns HTTP 503 Service Unavailable with Retry-After header' },
      { step: 'Compensating Kafka Event Sent', detail: 'Orchestrator initiates Saga rollback due to remote invocation timeout' },
      { step: 'Resource Locks Cleaned Up', detail: 'All distributed locks and database holds safely deallocated' },
      { step: 'Staff Workstation Notified', detail: 'Emergency fallback workflow initiated: staff advised to use direct vocera line' }
    ]
  }
];

export default function SagaRollbackSimulator({
  isOpen,
  onClose,
  transfers,
  onRollbackExecute,
  showToast
}) {
  const [selectedTransferId, setSelectedTransferId] = useState(transfers[0]?.id || '');
  const [selectedScenarioId, setSelectedScenarioId] = useState(FAILURE_SCENARIOS[0].id);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState([]);

  if (!isOpen) return null;

  const activeTransfer = transfers.find(t => t.id === selectedTransferId) || transfers[0];
  const scenario = FAILURE_SCENARIOS.find(s => s.id === selectedScenarioId) || FAILURE_SCENARIOS[0];

  const handleStartSimulation = () => {
    if (!activeTransfer) return;
    setIsSimulating(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= scenario.compensationSteps.length) {
        setCurrentStepIndex(step - 1);
        setCompletedSteps(prev => [...prev, step - 1]);
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        onRollbackExecute(activeTransfer.id, scenario.title);
        showToast(`⚡ Saga Compensating Transactions Complete for ${activeTransfer.patient.name}!`);
      }
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={isSimulating ? undefined : onClose}>
      <div
        className="modal-card animate-pop-in"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '720px', width: '100%' }}
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
              <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Saga Failure & Rollback Simulator</span>
              <span style={{
                fontSize: '0.675rem',
                background: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--status-emergency-text)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                DISTRIBUTED TRANSACTIONS
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Simulates real-world microservice failures and verifies automated Saga compensation across Kafka topics
            </p>
          </div>

          {!isSimulating && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Target Transfer & Scenario Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '5px' }}>
                1. Select Target Transfer Case
              </label>
              <select
                disabled={isSimulating}
                value={selectedTransferId}
                onChange={e => setSelectedTransferId(e.target.value)}
                className="input-box"
              >
                {transfers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.patient.name} ({t.patient.mrn}) — {t.fromDept} ➔ {t.toDept} [{t.status}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '5px' }}>
                2. Injected Failure Cause
              </label>
              <select
                disabled={isSimulating}
                value={selectedScenarioId}
                onChange={e => {
                  setSelectedScenarioId(e.target.value);
                  setCompletedSteps([]);
                  setCurrentStepIndex(-1);
                }}
                className="input-box"
              >
                {FAILURE_SCENARIOS.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Scenario Info Box */}
          <div style={{
            background: 'var(--bg-inset)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--status-emergency-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <scenario.icon size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{scenario.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {scenario.description} • Responsible service: <code style={{ color: 'var(--accent-main)' }}>{scenario.service}</code>
              </div>
            </div>
          </div>

          {/* Step-by-Step Compensating Log */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Saga Compensating Execution Steps ({scenario.compensationSteps.length})
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Guaranteed by Saga Orchestrator in referral-service
              </span>
            </div>

            <div style={{
              background: 'var(--bg-inset)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              padding: '14px 16px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}>
              {scenario.compensationSteps.map((c, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={idx} className="saga-log-item">
                    <div className="saga-node-dot" style={{
                      borderColor: isDone ? 'var(--status-success-text)' : isCurrent ? 'var(--accent-main)' : 'var(--border-medium)',
                      background: isDone ? 'var(--status-success-bg)' : isCurrent ? 'var(--accent-bg)' : 'var(--bg-surface)'
                    }}>
                      {isDone ? (
                        <CheckCircle2 size={10} color="var(--status-success-text)" />
                      ) : isCurrent ? (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-main)' }} />
                      ) : (
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{idx + 1}</span>
                      )}
                    </div>

                    <div style={{ paddingLeft: '6px' }}>
                      <div style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: isDone ? 'var(--status-success-text)' : isCurrent ? 'var(--accent-main)' : 'var(--text-primary)'
                      }}>
                        {c.step}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                        {c.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '14px'
          }}>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Executing this will revert the transfer and log compensations to the database.
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                disabled={isSimulating}
                onClick={onClose}
                className="btn btn-outline"
              >
                Close
              </button>
              
              <button
                type="button"
                disabled={isSimulating}
                onClick={handleStartSimulation}
                className="btn btn-danger"
              >
                {isSimulating ? (
                  <>
                    <RotateCcw size={14} className="spin" />
                    <span>Compensating Transactions in Progress...</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Trigger Saga Rollback</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
