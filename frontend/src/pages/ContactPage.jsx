import { useState } from 'react';
import { Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react';
import { companyContact } from '../data/siteData';
import { publicAPI } from '../services/api';
import './ContactPage.css';

export function ContactPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', subject: '', message: '' });
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

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(companyContact.address)}&output=embed`;

  return (
    <div className="contact-page">
      <div className="contact-shell">
        <section className="contact-top" data-reveal>
          <div className="contact-intro">
            <span className="contact-flower" aria-hidden="true"><Sparkles size={21} /></span>
            <p className="contact-eyebrow">WANT TO TALK?</p>
            <h1>Let&apos;s Connect</h1>
            <div className="contact-lead">
              <p>Looking for quality printed fabrics or customized textile solutions for your business? We would love to hear from you.</p>
              <p>Whether you are a wholesale buyer, distributor, or business looking for customized fabric designs, our team is ready to understand your requirements and assist you.</p>
              <p>Get in touch with us to discuss your product requirements, fabric specifications, and business enquiries. Let&apos;s build a successful partnership together.</p>
            </div>
          </div>

          <div className="contact-form-panel">
            {error && <p role="alert" className="contact-message contact-error">{error}</p>}
            {success && <p role="status" className="contact-message contact-success">{success}</p>}
            <form id="enquiry-form" onSubmit={handleSubmit} className="contact-form">
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
            {companyContact.phoneNumbers.map((phone) => (
              <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
            ))}
          </article>
          <article className="contact-info-item">
            <span className="contact-info-icon"><Mail aria-hidden="true" /></span>
            <h2>Email</h2>
            <a href={`mailto:${companyContact.email}`}>{companyContact.email}</a>
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
