import { useState } from 'react';

// Icon helpers 
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const CheckIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none"
    stroke="var(--brand-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

/*Field wrapper*/
function Field({ label, error, icon, children }) {
  return (
    <div className="rt-field">
      <label className="rt-label">
        <span className="rt-label-icon" aria-hidden="true">
          <Icon d={icon} size={14} />
        </span>
        {label}
      </label>
      {children}
      {error && <p className="rt-error" role="alert">{error}</p>}
    </div>
  );
}

/* ── Validation ──────────────────────────────────────────── */
function validate(form) {
  const errs = {};
  if (!form.name.trim())        errs.name    = 'Please enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Please enter a valid email.';
  if (!/^\+?[\d\s\-()]{7,}$/.test(form.phone)) errs.phone = 'Please enter a valid phone number.';
  if (!form.date)               errs.date    = 'Please select a date.';
  if (!form.time)               errs.time    = 'Please select a time.';
  if (!form.guests)             errs.guests  = 'Please select number of guests.';
  return errs;
}

/* ── Today's date string for min attr ───────────────────── */
const todayStr = () => new Date().toISOString().split('T')[0];

/* ── Time slots ─────────────────────────────────────────── */
const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '1:00 PM',  '1:30 PM',
  '2:00 PM',  '6:00 PM',  '6:30 PM',  '7:00 PM',
  '7:30 PM',  '8:00 PM',  '8:30 PM',  '9:00 PM',
];

const GUEST_OPTIONS = ['1 Guest', '2 Guests', '3 Guests', '4 Guests',
  '5 Guests', '6 Guests', '7 Guests', '8+ Guests'];

const OCCASIONS = ['', 'Birthday', 'Anniversary', 'Business Dinner',
  'Date Night', 'Family Gathering', 'Other'];

/* ── Main component ──────────────────────────────────────── */
export default function ReserveTable() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    date: '', time: '', guests: '',
    occasion: '', requests: '',
  });
  const [errors, setErrors]   = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);

    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          email: form.email,
          phone: form.phone,
          date: form.date,
          time: form.time,
          guests: form.guests,
          specialRequests: `${form.occasion ? form.occasion + ': ' : ''}${form.requests}`
        })
      });
    } catch {
      // Silent fail - reservation still shows success
    }

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1400);
  };

  const handleReset = () => {
    setForm({ name:'', email:'', phone:'', date:'', time:'', guests:'', occasion:'', requests:'' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <section className="rt-section" id="reserve" aria-labelledby="reserve-heading">
      {/* ── Decorative background blobs ── */}
      <div className="rt-blob rt-blob--1" aria-hidden="true" />
      <div className="rt-blob rt-blob--2" aria-hidden="true" />

      <div className="rt-container">
        {/* Left – info panel */}
        <div className="rt-info">
          <span className="section-eyebrow">
            <span aria-hidden="true">✦</span> Reservations
          </span>
          <h2 className="section-title" id="reserve-heading">
            Reserve Your<br />
            <span className="gold-text">Perfect Evening</span>
          </h2>
          <p className="rt-description">
            Join us for an unforgettable dining experience at Aurum &amp; Ember.
            Complete the form and we'll confirm your reservation within 2 hours.
          </p>

          {/* Info cards */}
          <div className="rt-info-cards">
            {[
              {
                icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z',
                title: 'Opening Hours',
                lines: ['Mon – Fri: 12pm – 10pm', 'Sat – Sun: 11am – 11pm'],
              },
              {
                icon: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.5 16z',
                title: 'Call Us',
                lines: ['+234 800 AURUM', 'reservations@aurumember.ng'],
              },
              {
                icon: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
                title: 'Location',
                lines: ['14 Victoria Island Boulevard', 'Lagos, Nigeria'],
              },
            ].map(({ icon, title, lines }) => (
              <div key={title} className="rt-info-card">
                <div className="rt-info-card-icon" aria-hidden="true">
                  <Icon d={icon} size={16} />
                </div>
                <div>
                  <p className="rt-info-card-title">{title}</p>
                  {lines.map((l) => <p key={l} className="rt-info-card-line">{l}</p>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – form / success */}
        <div className="rt-form-wrap">
          {submitted ? (
            /* ── Success state ── */
            <div className="rt-success" role="status" aria-live="polite">
              <div className="rt-success-icon"><CheckIcon /></div>
              <h3 className="rt-success-title">Reservation Received!</h3>
              <p className="rt-success-msg">
                Thank you, <strong>{form.name.split(' ')[0]}</strong>! We've received your
                reservation request for <strong>{form.date}</strong> at <strong>{form.time}</strong>{' '}
                for <strong>{form.guests}</strong>. A confirmation will be sent to{' '}
                <strong>{form.email}</strong> within 2 hours.
              </p>
              <div className="flex flex-col gap-3 mt-8">
                <button className="btn-reserve w-full" onClick={handleReset}>
                  Make Another Reservation
                </button>
                <button className="btn-outline w-full" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-primary)' }} onClick={() => window.location.href = '/'}>
                  Back to Home
                </button>
              </div>
            </div>
          ) : (
            /* ── Reservation form ── */
            <form className="rt-form" onSubmit={handleSubmit} noValidate aria-label="Table reservation form">
              <div className="rt-form-header">
                <h3 className="rt-form-title">Book a Table</h3>
                <p className="rt-form-subtitle">All fields marked * are required</p>
              </div>

              {/* Row 1 */}
              <div className="rt-row">
                <Field label="Full Name *" error={errors.name}
                  icon="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z">
                  <input
                    id="res-name"
                    className={`rt-input${errors.name ? ' rt-input--error' : ''}`}
                    type="text"
                    placeholder="John Adeyemi"
                    value={form.name}
                    onChange={set('name')}
                    autoComplete="name"
                    aria-required="true"
                    aria-describedby={errors.name ? 'err-name' : undefined}
                  />
                </Field>

                <Field label="Email *" error={errors.email}
                  icon="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6">
                  <input
                    id="res-email"
                    className={`rt-input${errors.email ? ' rt-input--error' : ''}`}
                    type="email"
                    placeholder="john@email.com"
                    value={form.email}
                    onChange={set('email')}
                    autoComplete="email"
                    aria-required="true"
                  />
                </Field>
              </div>

              {/* Row 2 */}
              <div className="rt-row">
                <Field label="Phone Number *" error={errors.phone}
                  icon="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.64 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.5 16z">
                  <input
                    id="res-phone"
                    className={`rt-input${errors.phone ? ' rt-input--error' : ''}`}
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={set('phone')}
                    autoComplete="tel"
                    aria-required="true"
                  />
                </Field>

                <Field label="Number of Guests *" error={errors.guests}
                  icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75">
                  <select
                    id="res-guests"
                    className={`rt-input rt-select${errors.guests ? ' rt-input--error' : ''}`}
                    value={form.guests}
                    onChange={set('guests')}
                    aria-required="true"
                  >
                    <option value="" disabled>Select guests</option>
                    {GUEST_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>

              {/* Row 3 */}
              <div className="rt-row">
                <Field label="Date *" error={errors.date}
                  icon="M8 2v4 M16 2v4 M3 8h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z">
                  <input
                    id="res-date"
                    className={`rt-input${errors.date ? ' rt-input--error' : ''}`}
                    type="date"
                    min={todayStr()}
                    value={form.date}
                    onChange={set('date')}
                    aria-required="true"
                  />
                </Field>

                <Field label="Time *" error={errors.time}
                  icon="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M12 6v6l4 2">
                  <select
                    id="res-time"
                    className={`rt-input rt-select${errors.time ? ' rt-input--error' : ''}`}
                    value={form.time}
                    onChange={set('time')}
                    aria-required="true"
                  >
                    <option value="" disabled>Select time</option>
                    {TIME_SLOTS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>

              {/* Occasion */}
              <Field label="Special Occasion"
                icon="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z">
                <select
                  id="res-occasion"
                  className="rt-input rt-select"
                  value={form.occasion}
                  onChange={set('occasion')}
                >
                  {OCCASIONS.map((o) => <option key={o} value={o}>{o || 'No special occasion'}</option>)}
                </select>
              </Field>

              {/* Special requests */}
              <Field label="Special Requests or Dietary Requirements"
                icon="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
                <textarea
                  id="res-requests"
                  className="rt-input rt-textarea"
                  rows="3"
                  placeholder="Allergies, accessibility needs, special setup requests…"
                  value={form.requests}
                  onChange={set('requests')}
                />
              </Field>

              <button
                type="submit"
                className="btn-reserve rt-submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="rt-spinner" aria-hidden="true" />
                    Confirming…
                  </>
                ) : (
                  <>
                    <Icon d="M8 2v4 M16 2v4 M3 8h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" size={16} />
                    Confirm Reservation
                  </>
                )}
              </button>

              <p className="rt-privacy">
                🔒 Your details are kept private and used solely for your reservation.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
