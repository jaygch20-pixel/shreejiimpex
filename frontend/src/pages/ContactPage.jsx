import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import { companyContact } from '../data/siteData';
import { publicAPI } from '../services/api';
import './ContactPage.css';

const customRequestInitial = {
  fullName: '',
  companyName: '',
  country: '',
  email: '',
  whatsapp: '',
  requiredQuantity: '',
  preferredColors: '',
  additionalInstructions: '',
};

export function ContactPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
  const [customRequest, setCustomRequest] = useState(customRequestInitial);
  const [artwork, setArtwork] = useState(null);
  const [showCustomRequest, setShowCustomRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await publicAPI.submitEnquiry({
        fullName: form.fullName,
        email: form.email,
        whatsapp: form.phone,
        subject: form.subject,
        additionalMessage: form.message,
      });
      setSuccess(`${data.message} Reference: ${data.referenceId}`);
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Your message could not be sent. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCustomRequestSubmit = async (event) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSubmitting(true);
    setError('');
    setSuccess('');
    const formData = new FormData();
    Object.entries(customRequest).forEach(([key, value]) => formData.append(key, value));
    if (artwork) formData.append('artwork', artwork);

    try {
      const { data } = await publicAPI.submitCustomRequest(formData);
      setSuccess(data.message);
      setCustomRequest(customRequestInitial);
      setArtwork(null);
      formElement.reset();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Your artwork could not be submitted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateCustomRequest = (event) => {
    setCustomRequest((current) => ({ ...current, [event.target.name]: event.target.value }));
  };
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(companyContact.address)}&output=embed`;
  const emailAddresses = companyContact.email.split(',').map((email) => email.trim()).filter(Boolean);

  return (
    <div className="contact-page">
      <div className="contact-shell">
        <section className="contact-top" data-reveal>
          <div className="contact-intro">
            <span className="contact-flower" aria-hidden="true"><Sparkles size={21} /></span>
            <p className="contact-eyebrow">WANT TO TALK?</p>
            <h1>Get in Touch with Shreeji Impex</h1>
            <p className="contact-lead">
              We&apos;re here to answer any questions you may have about our products and services. Whether you&apos;re interested in our fabric collections, placing an order, discussing custom designs, or exploring business opportunities, feel free to reach out. Our team is ready to assist you.
            </p>
          </div>

          <div className="contact-form-panel">
            {error && <p role="alert" className="contact-message contact-error">{error}</p>}
            {success && <p role="status" className="contact-message contact-success">{success}</p>}
            {!showCustomRequest ? (
              <>
                <form onSubmit={handleSubmit} className="contact-form">
                  <label>
                    <span>Full Name</span>
                    <input name="fullName" autoComplete="name" placeholder="Your full name" value={form.fullName} onChange={handleChange} required maxLength={120} />
                  </label>
                  <label>
                    <span>Email Address</span>
                    <input type="email" name="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required maxLength={254} />
                  </label>
                  <label>
                    <span>Phone Number</span>
                    <input type="tel" name="phone" autoComplete="tel" placeholder="Your phone number" value={form.phone} onChange={handleChange} maxLength={40} />
                  </label>
                  <label>
                    <span>Subject</span>
                    <input name="subject" placeholder="How can we help?" value={form.subject} onChange={handleChange} required maxLength={160} />
                  </label>
                  <label className="contact-message-field">
                    <span>Message</span>
                    <textarea name="message" placeholder="Write your message..." value={form.message} onChange={handleChange} required maxLength={5000} rows={6} />
                  </label>
                  <button type="submit" className="contact-submit" disabled={submitting}>
                    <span>{submitting ? 'Sending…' : 'Send a Message'}</span>
                    <Send size={17} aria-hidden="true" />
                  </button>
                </form>
                <button type="button" className="contact-custom-link" onClick={() => { setShowCustomRequest(true); setError(''); setSuccess(''); }}>
                  Sending artwork for a custom design? Submit it here
                </button>
              </>
            ) : (
              <form onSubmit={handleCustomRequestSubmit} className="contact-form contact-custom-form">
                <div className="contact-custom-heading">
                  <h2>Send custom artwork</h2>
                  <p>Share your artwork with our team. No account is needed.</p>
                </div>
                <label>
                  <span>Full Name</span>
                  <input name="fullName" autoComplete="name" placeholder="Your full name" value={customRequest.fullName} onChange={updateCustomRequest} required maxLength={120} />
                </label>
                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" autoComplete="email" placeholder="you@company.com" value={customRequest.email} onChange={updateCustomRequest} required maxLength={254} />
                </label>
                <label>
                  <span>Country</span>
                  <input name="country" autoComplete="country-name" placeholder="Your country" value={customRequest.country} onChange={updateCustomRequest} required maxLength={100} />
                </label>
                <label>
                  <span>Company (optional)</span>
                  <input name="companyName" autoComplete="organization" placeholder="Company name" value={customRequest.companyName} onChange={updateCustomRequest} maxLength={160} />
                </label>
                <label>
                  <span>WhatsApp / Phone (optional)</span>
                  <input type="tel" name="whatsapp" autoComplete="tel" placeholder="Your phone number" value={customRequest.whatsapp} onChange={updateCustomRequest} maxLength={40} />
                </label>
                <label>
                  <span>Estimated quantity (optional)</span>
                  <input name="requiredQuantity" placeholder="For example, 300 meters" value={customRequest.requiredQuantity} onChange={updateCustomRequest} maxLength={100} />
                </label>
                <label className="contact-message-field">
                  <span>Preferred colors (optional)</span>
                  <input name="preferredColors" placeholder="Any preferred colors?" value={customRequest.preferredColors} onChange={updateCustomRequest} maxLength={300} />
                </label>
                <label className="contact-message-field">
                  <span>Artwork (JPG, PNG, WebP or PDF; max 20 MB)</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" onChange={(event) => setArtwork(event.target.files?.[0] || null)} required />
                </label>
                <label className="contact-message-field">
                  <span>Instructions (optional)</span>
                  <textarea name="additionalInstructions" placeholder="Tell us about your design..." value={customRequest.additionalInstructions} onChange={updateCustomRequest} maxLength={5000} rows={4} />
                </label>
                <button type="submit" className="contact-submit" disabled={submitting}>
                  <span>{submitting ? 'Sending…' : 'Submit Artwork'}</span>
                  <Send size={17} aria-hidden="true" />
                </button>
                <button type="button" className="contact-custom-link" onClick={() => { setShowCustomRequest(false); setError(''); setSuccess(''); }}>
                  Back to contact form
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="contact-info-card" aria-label="Contact information" data-reveal>
          <article className="contact-info-item">
            <span className="contact-info-icon"><MapPin aria-hidden="true" /></span>
            <h2>Address</h2>
            <p>{companyContact.address}</p>
          </article>
          <article className="contact-info-item">
            <span className="contact-info-icon"><Phone aria-hidden="true" /></span>
            <h2>Phone Number</h2>
            <a href={`tel:${companyContact.phone.replace(/[^\d+]/g, '')}`}>{companyContact.phone}</a>
          </article>
          <article className="contact-info-item">
            <span className="contact-info-icon"><Mail aria-hidden="true" /></span>
            <h2>Call or Email</h2>
            {emailAddresses.length > 0
              ? emailAddresses.map((email) => <a key={email} href={`mailto:${email}`}>{email}</a>)
              : <p>Email address not provided.</p>}
          </article>
        </section>

        <section className="contact-map-section" aria-label="Factory location" data-reveal>
          <div className="contact-map-heading">
            <p>Find us</p>
            <a href={companyContact.mapUrl} target="_blank" rel="noreferrer">Open factory location in Google Maps</a>
          </div>
          <iframe
            title="Map showing the Shreeji Impex factory location in Jetpur"
            src={mapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </section>
      </div>
    </div>
  );
}
