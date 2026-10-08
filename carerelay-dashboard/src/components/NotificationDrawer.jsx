import React, { useState } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  Clock,
  Sparkles,
  Bed,
  FileText,
  RotateCcw,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onSelectTransfer,
  soundEnabled,
  setSoundEnabled,
  showToast
}) {
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'EMERGENCY' | 'SAGA'

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterType === 'EMERGENCY') return n.priority === 'HIGH' || n.type === 'EMERGENCY';
    if (filterType === 'SAGA') return n.type === 'SAGA' || n.type === 'SYSTEM';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const playChime = () => {
    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    }
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bell size={18} color="var(--accent-main)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Clinical Alert Center</h3>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: '0.675rem',
                  background: 'var(--status-emergency-bg)',
                  color: 'var(--status-emergency-text)',
                  border: '1px solid var(--status-emergency-border)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontWeight: 700
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Live stream from notification-service (Kafka event bus)
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playChime();
                showToast(next ? '🔔 Audio alerts enabled' : '🔕 Audio alerts muted');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: soundEnabled ? 'var(--accent-main)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              title={soundEnabled ? 'Mute alert chime' : 'Enable alert chime'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close Drawer */}
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
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--bg-inset)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'EMERGENCY', 'SAGA'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                style={{
                  background: filterType === f ? 'var(--bg-surface)' : 'transparent',
                  color: filterType === f ? 'var(--accent-main)' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: filterType === f ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {f === 'ALL' ? 'All' : f === 'EMERGENCY' ? '🚨 Urgent' : '⚡ Saga Logs'}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => {
                onMarkAllAsRead();
                showToast('Marked all alerts as read');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-main)',
                fontSize: '0.7rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <CheckCheck size={12} /> Mark all read
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              No notifications matching this filter.
            </div>
          ) : (
            filtered.map(alert => {
              const isUrgent = alert.priority === 'HIGH';
              const isSaga = alert.type === 'SAGA';

              return (
                <div
                  key={alert.id}
                  onClick={() => onMarkAsRead(alert.id)}
                  style={{
                    background: alert.read ? 'var(--bg-card)' : 'var(--bg-inset)',
                    border: '1px solid',
                    borderColor: !alert.read ? 'var(--accent-main)' : 'var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                >
                  {/* Top: Type badge & Time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {!alert.read && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-main)' }} />
                      )}
                      <span className={`status-pill ${isUrgent ? 'status-emergency' : isSaga ? 'status-urgent' : 'status-routine'}`}>
                        {alert.tag || 'ALERT'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                  </div>

                  {/* Body Text */}
                  <div style={{ fontSize: '0.8rem', fontWeight: alert.read ? 500 : 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {alert.message}
                  </div>

                  {/* Detail Context if present */}
                  {alert.detail && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', background: 'var(--bg-app)', padding: '6px 8px', borderRadius: '4px' }}>
                      {alert.detail}
                    </div>
                  )}

                  {/* Bottom: Transfer Link if associated */}
                  {alert.transferId && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransfer(alert.transferId);
                          onClose();
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-main)',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>Focus Case File</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
