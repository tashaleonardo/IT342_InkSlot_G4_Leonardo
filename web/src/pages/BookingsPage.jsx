import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getMyBookings,
  updateBookingStatus,
} from '../services/bookingService';

const STATUS_TABS = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const STATUS_COLOR = {
  PENDING: '#f59e0b',
  CONFIRMED: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

function durationLabel(mins) {
  if (!mins) return '—';
  return mins < 60 ? `${mins} min` : `${Math.round(mins / 60 * 10) / 10} hrs`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export default function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState(searchParams.get('status')?.toUpperCase() || 'ALL');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = async (status) => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings(status === 'ALL' ? undefined : status);
      setBookings(data);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab, refreshKey]);

  // Update URL when tab changes
  useEffect(() => {
    if (tab === 'ALL') {
      setSearchParams({});
    } else {
      setSearchParams({ status: tab.toLowerCase() });
    }
  }, [tab, setSearchParams]);

  const handleStatus = async (newStatus) => {
    if (!selected) return;
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateBookingStatus(
        selected.id, 
        newStatus,
        newStatus === 'CANCELLED' ? cancelReason : undefined
      );
      setBookings(prev => prev.map(b => b.id === updated.id ? updated : b));
      setSelected(updated);
      setSuccess(`Booking ${STATUS_LABELS[newStatus]?.toLowerCase() || newStatus} successfully.`);
      setShowCancel(false);
      setCancelReason('');
      // Refresh after 2 seconds to show updated state
      setTimeout(() => setRefreshKey(prev => prev + 1), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setSelected(null);
    setError('');
    setSuccess('');
    setShowCancel(false);
  };

  const getStatusCount = (status) => {
    if (status === 'ALL') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  return (
    <div style={{ color: '#fff', fontFamily: 'Poppins, sans-serif', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Manage Bookings
        </h1>
        <p style={{ color: '#888', marginTop: '0.25rem', fontSize: '0.95rem' }}>
          Review and update your client appointment requests
        </p>
      </div>

      {/* Error/Success Alerts */}
      {error && (
        <div style={alertStyle('error')}>
          <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
          {error}
        </div>
      )}
      {success && (
        <div style={alertStyle('success')}>
          <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
          {success}
        </div>
      )}

      {/* Tab Filter with Counts */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {STATUS_TABS.map(t => {
          const count = getStatusCount(t);
          return (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              style={{
                padding: '0.45rem 1.2rem',
                borderRadius: '999px',
                border: '1px solid',
                borderColor: tab === t ? '#fff' : '#444',
                background: tab === t ? '#fff' : 'transparent',
                color: tab === t ? '#000' : '#aaa',
                fontWeight: tab === t ? 700 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'Poppins, sans-serif',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {t}
              {count > 0 && tab !== t && (
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.7rem',
                }}>
                  {count}
                </span>
              )}
              {count > 0 && tab === t && (
                <span style={{
                  background: 'rgba(0,0,0,0.1)',
                  borderRadius: '10px',
                  padding: '0.1rem 0.5rem',
                  fontSize: '0.7rem',
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* Booking List */}
        <div style={{ flex: '1 1 340px' }}>
          {loading ? (
            <div style={loadingCardStyle}>
              <div className="spinner" style={{ width: '30px', height: '30px', borderWidth: '3px', marginBottom: '1rem' }}></div>
              <p style={{ color: '#888' }}>Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={emptyCardStyle}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: '#888', margin: 0, fontSize: '1rem' }}>
                No {tab !== 'ALL' ? tab.toLowerCase() : ''} bookings yet.
              </p>
              <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                {tab === 'PENDING' ? 'When clients book appointments, they will appear here.' : ''}
              </p>
            </div>
          ) : (
            bookings.map(b => (
              <div
                key={b.id}
                onClick={() => {
                  setSelected(b);
                  setSuccess('');
                  setError('');
                  setShowCancel(false);
                  setCancelReason('');
                }}
                style={bookingCardStyle(selected?.id === b.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '1rem', color: '#fff' }}>
                      {b.clientName}
                    </div>
                    <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      {formatDate(b.appointmentDate)} · {b.appointmentTime}
                    </div>
                    <div style={{ color: '#777', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                      {b.approximateSize} · {durationLabel(b.estimatedDurationMinutes)}
                    </div>
                  </div>
                  <span style={statusBadge(b.status)}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>
                </div>
                <div style={{ color: '#555', fontSize: '0.78rem', marginTop: '0.4rem' }}>
                  Ref: {b.referenceNumber}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={detailPanelStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                Booking Details
              </h2>
              <button onClick={() => setSelected(null)} style={closeBtnStyle}>✕</button>
            </div>

            <span style={{ ...statusBadge(selected.status), display: 'inline-block', marginBottom: '1rem' }}>
              {STATUS_LABELS[selected.status] || selected.status}
            </span>

            {/* Booking Info Grid */}
            <div style={infoGridStyle}>
              {[
                ['Reference', selected.referenceNumber],
                ['Client', selected.clientName],
                ['Email', selected.clientEmail],
                ['Phone', selected.clientPhone],
                ['Date', formatDate(selected.appointmentDate)],
                ['Time', selected.appointmentTime],
                ['Size', selected.approximateSize],
                ['Est. Duration', durationLabel(selected.estimatedDurationMinutes)],
                ['Preference', selected.designPreference || '—'],
                ['Notes', selected.additionalNotes || '—'],
                ['Created', new Date(selected.createdAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} style={infoRowStyle}>
                  <span style={infoLabelStyle}>{label}</span>
                  <span style={infoValueStyle}>{value}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selected.status === 'PENDING' && (
                <button
                  onClick={() => handleStatus('CONFIRMED')}
                  disabled={actionLoading}
                  style={actionBtn('#fff', '#000')}
                >
                  {actionLoading ? (
                    <><span className="spinner" style={{ width: '14px', height: '14px', marginRight: '8px' }}></span> Updating...</>
                  ) : (
                    '✓ Confirm Booking'
                  )}
                </button>
              )}
              
              {selected.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleStatus('COMPLETED')}
                  disabled={actionLoading}
                  style={actionBtn('#10b981', '#fff')}
                >
                  {actionLoading ? 'Updating...' : '✓ Mark as Completed'}
                </button>
              )}
              
              {(selected.status === 'PENDING' || selected.status === 'CONFIRMED') && (
                <div>
                  {!showCancel ? (
                    <button
                      onClick={() => setShowCancel(true)}
                      style={actionBtn('#2a2a2a', '#ef4444', '1px solid #ef4444')}
                    >
                      ✕ Cancel Booking
                    </button>
                  ) : (
                    <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '1rem' }}>
                      <p style={{ color: '#ef4444', fontWeight: 600, margin: '0 0 0.5rem' }}>
                        Cancel Booking
                      </p>
                      <textarea
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        placeholder="Please provide a reason for cancellation..."
                        rows={3}
                        style={textareaStyle}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                        <button
                          onClick={() => handleStatus('CANCELLED')}
                          disabled={actionLoading}
                          style={actionBtn('#ef4444', '#fff')}
                        >
                          {actionLoading ? 'Cancelling...' : 'Confirm Cancel'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCancel(false);
                            setCancelReason('');
                          }}
                          style={actionBtn('#333', '#aaa')}
                        >
                          Back
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Style helpers ───────────────────────────────────────
const alertStyle = (type) => ({
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  marginBottom: '1rem',
  fontSize: '0.88rem',
  background: type === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
  color: type === 'error' ? '#f87171' : '#34d399',
  border: `1px solid ${type === 'error' ? '#ef444440' : '#10b98140'}`,
  display: 'flex',
  alignItems: 'center',
});

const loadingCardStyle = {
  background: '#111',
  border: '1px solid #222',
  borderRadius: '20px',
  padding: '3rem',
  textAlign: 'center',
  color: '#888',
};

const bookingCardStyle = (active) => ({
  background: active ? '#1a1a1a' : '#111',
  border: `1px solid ${active ? '#555' : '#222'}`,
  borderRadius: '16px',
  padding: '1rem 1.2rem',
  marginBottom: '0.75rem',
  cursor: 'pointer',
  transition: 'all 0.15s',
});

const statusBadge = (status) => ({
  background: STATUS_COLOR[status] + '22',
  color: STATUS_COLOR[status] || '#aaa',
  border: `1px solid ${STATUS_COLOR[status] || '#aaa'}44`,
  borderRadius: '999px',
  padding: '0.25rem 0.75rem',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.5px',
  whiteSpace: 'nowrap',
});

const detailPanelStyle = {
  flex: '0 0 340px',
  background: '#111',
  border: '1px solid #222',
  borderRadius: '20px',
  padding: '1.5rem',
  alignSelf: 'flex-start',
  position: 'sticky',
  top: '1rem',
  maxHeight: 'calc(100vh - 2rem)',
  overflowY: 'auto',
};

const emptyCardStyle = {
  background: '#111',
  border: '1px solid #222',
  borderRadius: '20px',
  padding: '3rem',
  textAlign: 'center',
  color: '#888',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#666',
  fontSize: '1.1rem',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: '8px',
  transition: 'all 0.15s',
};

const actionBtn = (bg, color, border) => ({
  width: '100%',
  padding: '0.75rem',
  borderRadius: '12px',
  background: bg,
  color: color,
  border: border || 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif',
  transition: 'all 0.15s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

const textareaStyle = {
  width: '100%',
  background: '#222',
  border: '1px solid #333',
  borderRadius: '8px',
  color: '#fff',
  padding: '0.5rem 0.75rem',
  fontSize: '0.85rem',
  fontFamily: 'Poppins, sans-serif',
  resize: 'vertical',
  boxSizing: 'border-box',
};

const infoGridStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  marginTop: '1rem',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '0.4rem 0',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const infoLabelStyle = {
  color: '#888',
  fontSize: '0.8rem',
  fontWeight: 500,
  minWidth: '85px',
};

const infoValueStyle = {
  color: '#ddd',
  fontSize: '0.85rem',
  textAlign: 'right',
  wordBreak: 'break-word',
  maxWidth: '220px',
};