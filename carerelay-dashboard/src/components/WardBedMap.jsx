import React, { useState } from 'react';
import {
  Bed,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
  UserCheck,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function WardBedMap({
  departments,
  transfers,
  onInitiateTransferToDept
}) {
  const [selectedDeptId, setSelectedDeptId] = useState('ALL');
  const [selectedBedInfo, setSelectedBedInfo] = useState(null);

  // Compute dynamic bed metrics
  // Each department has base beds and dynamic reservations from transfers
  const wardData = departments.map(d => {
    const totalBeds = d.beds || 20;
    // Count inbound pending transfers to this department
    const inboundTransfers = transfers.filter(
      t => t.toDept === d.name && (t.status === 'WAITING' || t.status === 'TRANSFERRED')
    );
    const reservedCount = inboundTransfers.length;
    // Base occupied count (simulated between 60% and 85%)
    const baseOccupied = Math.min(totalBeds - reservedCount, Math.floor(totalBeds * 0.72));
    const availableCount = Math.max(0, totalBeds - baseOccupied - reservedCount);
    const occupancyRate = Math.round(((baseOccupied + reservedCount) / totalBeds) * 100);

    // Generate individual bed array
    const beds = [];
    for (let i = 1; i <= totalBeds; i++) {
      let state = 'AVAILABLE';
      let patientDesc = 'Unoccupied • Ready for Admission';

      if (i <= baseOccupied) {
        state = 'OCCUPIED';
        patientDesc = `Patient Inpatient Unit #${i} • Monitored`;
      } else if (i <= baseOccupied + reservedCount) {
        state = 'RESERVED';
        const reservedTransfer = inboundTransfers[i - baseOccupied - 1];
        patientDesc = reservedTransfer
          ? `Reserved for ${reservedTransfer.patient.name} (${reservedTransfer.patient.mrn}) from ${reservedTransfer.fromDept}`
          : 'Reserved for incoming transfer handoff';
      }

      beds.push({
        number: i,
        code: `${d.code || 'WARD'}-${i < 10 ? '0' + i : i}`,
        state,
        patientDesc
      });
    }

    return {
      ...d,
      totalBeds,
      baseOccupied,
      reservedCount,
      availableCount,
      occupancyRate,
      beds,
      inboundTransfers
    };
  });

  // Global KPIs
  const totalHospitalBeds = wardData.reduce((acc, w) => acc + w.totalBeds, 0);
  const totalOccupiedBeds = wardData.reduce((acc, w) => acc + w.baseOccupied + w.reservedCount, 0);
  const globalOccupancy = Math.round((totalOccupiedBeds / totalHospitalBeds) * 100);
  const surgeWards = wardData.filter(w => w.occupancyRate >= 88);

  const displayedWards = selectedDeptId === 'ALL'
    ? wardData
    : wardData.filter(w => w.id === selectedDeptId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP KPI SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ACUTE BEDS</span>
            <Bed size={16} color="var(--accent-main)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>{totalHospitalBeds} Beds</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across {departments.length} clinical wards
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OCCUPIED & RESERVED</span>
            <UserCheck size={16} color="var(--status-urgent-text)" />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>{totalOccupiedBeds} Beds</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {totalHospitalBeds - totalOccupiedBeds} beds currently open
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HOSPITAL OCCUPANCY</span>
            <TrendingUp size={16} color={globalOccupancy > 80 ? 'var(--status-emergency-text)' : 'var(--status-success-text)'} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>{globalOccupancy}%</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {globalOccupancy > 85 ? 'Near capacity threshold' : 'Optimal capacity range'}
          </div>
        </div>

        <div className="card" style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SURGE ALERT STATUS</span>
            <ShieldAlert size={16} color={surgeWards.length > 0 ? 'var(--status-emergency-text)' : 'var(--status-success-text)'} />
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: surgeWards.length > 0 ? 'var(--status-emergency-text)' : 'var(--status-success-text)' }}>
            {surgeWards.length > 0 ? `${surgeWards.length} Ward Surge` : 'Normal'}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {surgeWards.length > 0 ? surgeWards.map(w => w.name).join(', ') : 'All wards operating below 88%'}
          </div>
        </div>
      </div>

      {/* 2. FILTER TABS & LEGEND */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '10px 14px',
        background: 'var(--bg-surface)',
        borderRadius: '8px',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Ward Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px' }}>Filter Ward:</span>
          <button
            onClick={() => setSelectedDeptId('ALL')}
            style={{
              background: selectedDeptId === 'ALL' ? 'var(--accent-main)' : 'var(--bg-inset)',
              color: selectedDeptId === 'ALL' ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid',
              borderColor: selectedDeptId === 'ALL' ? 'var(--accent-main)' : 'var(--border-subtle)',
              borderRadius: '5px',
              padding: '4px 10px',
              fontSize: '0.725rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Wards ({departments.length})
          </button>

          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDeptId(d.id)}
              style={{
                background: selectedDeptId === d.id ? 'var(--accent-main)' : 'var(--bg-inset)',
                color: selectedDeptId === d.id ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: selectedDeptId === d.id ? 'var(--accent-main)' : 'var(--border-subtle)',
                borderRadius: '5px',
                padding: '4px 10px',
                fontSize: '0.725rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {d.name}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(239, 68, 68, 0.4)' }} />
            <span>Occupied</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(245, 158, 11, 0.4)' }} />
            <span>Reserved for Transfer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.4)' }} />
            <span>Available Bed</span>
          </div>
        </div>
      </div>

      {/* 3. WARD CARDS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: '16px' }}>
        {displayedWards.map(ward => {
          const isCritical = ward.occupancyRate >= 88;

          return (
            <div
              key={ward.id}
              className="card"
              style={{
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderColor: isCritical ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'
              }}
            >
              <div>
                {/* Header: Name, Floor, Occupancy Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{ward.name}</h3>
                      <span style={{
                        fontSize: '0.675rem',
                        background: 'var(--bg-inset)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                      }}>
                        {ward.code}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ward.floor} • Head: {ward.head}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className={`status-pill ${isCritical ? 'status-emergency' : ward.occupancyRate > 75 ? 'status-urgent' : 'status-routine'}`}>
                      {ward.occupancyRate}% Occupied
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {ward.availableCount} of {ward.totalBeds} beds open
                    </div>
                  </div>
                </div>

                {/* Occupancy Meter Bar */}
                <div style={{
                  height: '6px',
                  background: 'var(--bg-inset)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: '14px'
                }}>
                  <div
                    style={{
                      width: `${Math.round((ward.baseOccupied / ward.totalBeds) * 100)}%`,
                      background: isCritical ? 'var(--status-emergency-text)' : 'var(--accent-main)',
                      transition: 'width 0.3s ease'
                    }}
                    title={`Occupied: ${ward.baseOccupied}`}
                  />
                  <div
                    style={{
                      width: `${Math.round((ward.reservedCount / ward.totalBeds) * 100)}%`,
                      background: 'var(--status-urgent-text)',
                      transition: 'width 0.3s ease'
                    }}
                    title={`Reserved: ${ward.reservedCount}`}
                  />
                </div>

                {/* Interactive Bed Visualizer Matrix */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      BED MATRIX (CLICK A BED FOR STATUS)
                    </span>
                    {ward.reservedCount > 0 && (
                      <span style={{ fontSize: '0.675rem', color: 'var(--status-urgent-text)', fontWeight: 600 }}>
                        ⏳ {ward.reservedCount} transfer hold in queue
                      </span>
                    )}
                  </div>

                  <div className="bed-grid">
                    {ward.beds.map(bed => (
                      <div
                        key={bed.number}
                        onClick={() => setSelectedBedInfo({ ...bed, wardName: ward.name })}
                        className={`bed-unit ${bed.state === 'OCCUPIED' ? 'bed-unit-occupied' : bed.state === 'RESERVED' ? 'bed-unit-reserved' : 'bed-unit-available'}`}
                        title={`${bed.code}: ${bed.state} — ${bed.patientDesc}`}
                      >
                        {bed.number}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom: Transfer Action */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '10px'
              }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {ward.availableCount === 0 ? (
                    <span style={{ color: 'var(--status-emergency-text)', fontWeight: 700 }}>⚠️ Zero open beds</span>
                  ) : (
                    <span>Ready for direct transfer</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onInitiateTransferToDept(ward.name)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.725rem', gap: '4px' }}
                >
                  <span>Transfer Patient Here</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. BED DETAIL POPUP MODAL (WHEN A BED IS CLICKED) */}
      {selectedBedInfo && (
        <div className="modal-backdrop" onClick={() => setSelectedBedInfo(null)}>
          <div className="modal-card animate-pop-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>Bed Unit {selectedBedInfo.code}</h4>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{selectedBedInfo.wardName}</div>
              </div>
              <span className={`status-pill ${selectedBedInfo.state === 'OCCUPIED' ? 'status-emergency' : selectedBedInfo.state === 'RESERVED' ? 'status-urgent' : 'status-routine'}`}>
                {selectedBedInfo.state}
              </span>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'var(--bg-inset)', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <strong>Current Unit Assignment:</strong>
                <p style={{ marginTop: '4px', lineHeight: 1.4 }}>{selectedBedInfo.patientDesc}</p>
              </div>

              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Equipped with: 3-lead continuous ECG, pulse oximetry telemetry, bedside IV infusion pump.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedBedInfo(null)}
                  className="btn btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
