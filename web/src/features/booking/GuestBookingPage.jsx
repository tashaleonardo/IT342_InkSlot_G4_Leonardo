// src/pages/GuestBookingPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Calendar from 'react-calendar';
import { format, isSameDay, addDays, isBefore, startOfToday } from 'date-fns';
import { createBooking, getAvailableTimeSlots } from './bookingService';
import 'react-calendar/dist/Calendar.css';
import '../../styles/BookingCalendar.css';

const SIZES = [
  { value: 'SMALL', label: 'Small (2×2 in)', duration: '1–2 hours', priceRange: '₱1,500 - ₱3,000', icon: 'fa-ruler' },
  { value: 'MEDIUM', label: 'Medium (4×4 in)', duration: '2–3 hours', priceRange: '₱3,000 - ₱6,000', icon: 'fa-ruler-combined' },
  { value: 'LARGE', label: 'Large (6×6 in+)', duration: '3–5 hours', priceRange: '₱6,000 - ₱12,000', icon: 'fa-draw-polygon' },
  { value: 'UNDECIDED', label: 'Undecided / Consultation', duration: 'TBD', priceRange: 'Discuss with artist', icon: 'fa-comments' },
];

// Philippine time slots (12-hour format)
const TIME_SLOTS = [
  { value: '09:00', display: '9:00 AM', period: 'Morning' },
  { value: '10:00', display: '10:00 AM', period: 'Morning' },
  { value: '11:00', display: '11:00 AM', period: 'Morning' },
  { value: '12:00', display: '12:00 PM', period: 'Afternoon' },
  { value: '13:00', display: '1:00 PM', period: 'Afternoon' },
  { value: '14:00', display: '2:00 PM', period: 'Afternoon' },
  { value: '15:00', display: '3:00 PM', period: 'Afternoon' },
  { value: '16:00', display: '4:00 PM', period: 'Afternoon' },
  { value: '17:00', display: '5:00 PM', period: 'Evening' },
];

export default function GuestBookingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const artistId = Number(params.get('artistId'));
  const artistName = params.get('artistName') || 'the artist';

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    appointmentDate: '',
    appointmentTime: '',
    approximateSize: '',
    designPreference: '',
    additionalNotes: '',
  });

  const [refNumber, setRefNumber] = useState('');

  // Fetch available dates (next 30 days, excluding Sundays)
  useEffect(() => {
    const generateAvailableDates = () => {
      const dates = [];
      const today = startOfToday();
      for (let i = 1; i <= 30; i++) {
        const date = addDays(today, i);
        const dayOfWeek = format(date, 'EEEE');
        // Exclude Sundays
        if (dayOfWeek !== 'Sunday') {
          dates.push(date);
        }
      }
      setAvailableDates(dates);
    };
    generateAvailableDates();
  }, []);

  // Fetch available time slots when date is selected
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedDate && artistId) {
        setCheckingAvailability(true);
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        try {
          const slots = await getAvailableTimeSlots(artistId, dateStr);
          const availableSlotObjects = TIME_SLOTS.filter(slot =>
            slots.includes(slot.value)
          );
          setAvailableTimes(availableSlotObjects);
          // Clear selected time if no longer available
          if (form.appointmentTime && !slots.includes(form.appointmentTime)) {
            setForm(prev => ({ ...prev, appointmentTime: '' }));
          }
        } catch (err) {
          console.error('Failed to fetch available slots:', err);
          setAvailableTimes(TIME_SLOTS);
        } finally {
          setCheckingAvailability(false);
        }
      }
    };
    fetchAvailableSlots();
  }, [selectedDate, artistId]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    updateField('appointmentDate', format(date, 'yyyy-MM-dd'));
  };

  const selectedSize = SIZES.find(s => s.value === form.approximateSize);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone) || phone.length >= 10;
  };

  const validateStep1 = () => {
    if (!form.clientName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!form.clientEmail.trim()) {
      setError('Please enter your email address');
      return false;
    }
    if (!validateEmail(form.clientEmail)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!form.clientPhone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    if (!validatePhone(form.clientPhone)) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    if (!form.appointmentDate) {
      setError('Please select an appointment date from the calendar');
      return false;
    }
    if (!form.appointmentTime) {
      setError('Please select an appointment time');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!form.approximateSize) {
      setError('Please select a tattoo size');
      return false;
    }
    return true;
  };

  const next = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setStep(s => s - 1);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await createBooking({ ...form, artistId });
      setRefNumber(result.referenceNumber);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateDisplay = (date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      // Disable past dates and Sundays
      return isBefore(date, startOfToday()) || format(date, 'EEEE') === 'Sunday';
    }
    return false;
  };

  const getTileClassName = ({ date, view }) => {
    if (view === 'month' && selectedDate && isSameDay(date, selectedDate)) {
      return 'selected-date';
    }
    return '';
  };

  return (
    <div className="auth-page">
      <div className="bubble-field">
        <div className="bubble bubble1"></div>
        <div className="bubble bubble2"></div>
        <div className="bubble bubble3"></div>
        <div className="bubble bubble4"></div>
        <div className="bubble bubble5"></div>
        <div className="bubble bubble6"></div>
      </div>

      <div className="auth-container">
        <div style={{ width: '100%', maxWidth: '700px', marginBottom: '1rem' }}>
          <Link to="/artists" className="login-back-link">
            <i className="fas fa-arrow-left"></i> Back to Artists
          </Link>
        </div>

        {/* Stepper */}
        {step < 4 && (
          <div className="booking-stepper">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Details</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Design</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Review</span>
            </div>
          </div>
        )}

        <div className="booking-card">
          <div className="booking-header">
            <h2>
              {step === 1 && 'Book an Appointment'}
              {step === 2 && 'Tattoo Details'}
              {step === 3 && 'Review Your Booking'}
              {step === 4 && 'Booking Confirmed!'}
            </h2>
            <p>
              {step === 1 && `Booking with ${artistName}`}
              {step === 2 && 'Tell us about your tattoo idea'}
              {step === 3 && 'Please review your details before submitting'}
              {step === 4 && 'Your appointment request has been sent'}
            </p>
          </div>

          {error && (
            <div className="booking-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Appointment Details */}
          {step === 1 && (
            <div className="booking-step">
              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    value={form.clientName}
                    onChange={e => updateField('clientName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.clientEmail}
                    onChange={e => updateField('clientEmail', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  className="form-input"
                  value={form.clientPhone}
                  onChange={e => updateField('clientPhone', e.target.value)}
                  placeholder="+63 912 345 6789"
                />
              </div>

              <div className="form-row-split">
                <div className="form-group">
                  <label className="form-label">Select Date *</label>
                  <div className="calendar-wrapper">
                    <Calendar
                      onChange={handleDateChange}
                      value={selectedDate}
                      tileDisabled={tileDisabled}
                      tileClassName={getTileClassName}
                      minDate={addDays(new Date(), 1)}
                      className="booking-calendar"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Select Time *
                    {checkingAvailability && (
                      <span className="availability-check">
                        <i className="fas fa-spinner fa-spin"></i> Checking...
                      </span>
                    )}
                  </label>
                  <div className="time-slots">
                    {!selectedDate ? (
                      <div className="no-date-selected">
                        <i className="fas fa-calendar-day"></i>
                        <p>Please select a date first</p>
                      </div>
                    ) : availableTimes.length === 0 && !checkingAvailability ? (
                      <div className="no-slots">
                        <i className="fas fa-clock"></i>
                        <p>No available slots for this date</p>
                        <p className="small">Please select another date</p>
                      </div>
                    ) : (
                      <>
                        {['Morning', 'Afternoon', 'Evening'].map(period => {
                          const periodSlots = availableTimes.filter(t => t.period === period);
                          if (periodSlots.length === 0) return null;
                          return (
                            <div key={period} className="time-period">
                              <div className="period-label">{period}</div>
                              <div className="time-buttons">
                                {periodSlots.map(slot => (
                                  <button
                                    key={slot.value}
                                    type="button"
                                    onClick={() => updateField('appointmentTime', slot.value)}
                                    className={`time-btn ${form.appointmentTime === slot.value ? 'selected' : ''}`}
                                  >
                                    {slot.display}
                                  </button>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button className="btn-primary-booking" onClick={next}>
                Continue to Design Details <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          )}

          {/* Step 2: Design Details */}
          {step === 2 && (
            <div className="booking-step">
              <div className="form-group">
                <label className="form-label">Tattoo Size *</label>
                <div className="size-options">
                  {SIZES.map(s => (
                    <div
                      key={s.value}
                      onClick={() => updateField('approximateSize', s.value)}
                      className={`size-card ${form.approximateSize === s.value ? 'selected' : ''}`}
                    >
                      <i className={`fas ${s.icon}`}></i>
                      <div className="size-info">
                        <div className="size-label">{s.label}</div>
                        <div className="size-duration">{s.duration}</div>
                        <div className="size-price">{s.priceRange}</div>
                      </div>
                      {form.approximateSize === s.value && (
                        <i className="fas fa-check-circle check-icon"></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Design Preference</label>
                <select
                  className="form-input"
                  value={form.designPreference}
                  onChange={e => updateField('designPreference', e.target.value)}
                >
                  <option value="">Select an option...</option>
                  <option value="Still Deciding">Still Deciding / Consultation</option>
                  <option value="Reference Image">I have a reference image</option>
                  <option value="Artist Design">I want the artist to design</option>
                  <option value="Custom Design">I have a custom design</option>
                  <option value="Walk In">Walk-in / Flash design</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes (Optional)</label>
                <textarea
                  className="form-input"
                  rows={4}
                  value={form.additionalNotes}
                  onChange={e => updateField('additionalNotes', e.target.value)}
                  placeholder="Describe your tattoo idea, placement, colors, or any special requests..."
                />
              </div>

              <div className="booking-actions">
                <button className="btn-outline-booking" onClick={prev}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button className="btn-primary-booking" onClick={next}>
                  Review Booking <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="booking-step">
              <div className="review-card">
                <h3>Appointment Details</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Client Name</span>
                    <span className="review-value">{form.clientName}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Email</span>
                    <span className="review-value">{form.clientEmail}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Phone</span>
                    <span className="review-value">{form.clientPhone}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Date</span>
                    <span className="review-value">{selectedDate && formatDateDisplay(selectedDate)}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Time</span>
                    <span className="review-value">
                      {TIME_SLOTS.find(t => t.value === form.appointmentTime)?.display || form.appointmentTime}
                    </span>
                  </div>
                </div>

                <h3>Tattoo Details</h3>
                <div className="review-grid">
                  <div className="review-item">
                    <span className="review-label">Size</span>
                    <span className="review-value">{selectedSize?.label || '—'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Est. Duration</span>
                    <span className="review-value">{selectedSize?.duration || '—'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Est. Price Range</span>
                    <span className="review-value">{selectedSize?.priceRange || '—'}</span>
                  </div>
                  <div className="review-item">
                    <span className="review-label">Design Preference</span>
                    <span className="review-value">{form.designPreference || '—'}</span>
                  </div>
                  <div className="review-item full-width">
                    <span className="review-label">Additional Notes</span>
                    <span className="review-value">{form.additionalNotes || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="booking-actions">
                <button className="btn-outline-booking" onClick={prev}>
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button className="btn-primary-booking" onClick={submit} disabled={loading}>
                  {loading ? (
                    <><span className="spinner-small"></span> Submitting...</>
                  ) : (
                    <>Confirm Booking <i className="fas fa-check"></i></>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="booking-success">
              <div className="success-animation">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
                  <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                </svg>
              </div>
              <h2 className="success-title">Booking Confirmed!</h2>
              <p className="success-message">
                Your appointment request has been sent to <strong>{artistName}</strong>.<br />
                The artist will review and confirm your booking within 24-48 hours.
              </p>
              <div className="reference-card">
                <p className="reference-label">Booking Reference</p>
                <p className="reference-value">{refNumber}</p>
                <button onClick={() => navigator.clipboard.writeText(refNumber)} className="copy-btn">
                  <i className="fas fa-copy"></i> Copy
                </button>
              </div>
              <div className="success-actions">
                <Link to="/" className="btn-icon-only">
                  <i className="fas fa-home"></i>
                </Link>
                <Link to={`/booking-status?ref=${refNumber}`} className="btn-primary-booking no-underline">
                  Check Status <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
