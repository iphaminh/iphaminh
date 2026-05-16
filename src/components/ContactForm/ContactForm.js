// ContactForm.js
import React, { useState } from 'react';
import './ContactForm.css';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xnqezqow';

const ContactForm = () => {
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');

    const form = e.target;
    const data = new FormData(form);

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="contact-form-feedback contact-form-success">
        <p>Thank you! Your message was sent. I'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <label htmlFor="email">Email</label>
      <input type="email" id="email" name="email" required />

      <label htmlFor="name">Name</label>
      <input type="text" id="name" name="name" required />

      <label htmlFor="event_date">Event Date</label>
      <input type="date" id="event_date" name="event_date" required />

      <label htmlFor="venue">Venue</label>
      <input type="text" id="venue" name="venue" required />

      <label htmlFor="interested_in">Interested In</label>
      <select id="interested_in" name="interested_in" required>
        <option value="wedding_video">Wedding Videography</option>
        <option value="wedding_photography">Wedding Photography</option>
        <option value="elopement_video">Elopement Videography</option>
        <option value="elopement_photography">Elopement Photography</option>
        <option value="engagement_photography">Engagement Photography</option>
        <option value="engagement_video">Engagement Videography</option>
        <option value="senior">Senior Photography</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="budget">Budget</label>
      <div className="input-group relative">
        <span className="absolute left-0 pl-2 flex items-center pointer-events-none">
          <span className="currency-symbol">$</span>
        </span>
        <input
          type="text"
          id="budget"
          name="budget"
          placeholder="2,700"
          className="w-full border-2 border-gray-300 p-2 pl-8 rounded-md placeholder-gray-900"
        />
      </div>

      <label htmlFor="find_us">How'd you find us?</label>
      <input type="text" id="find_us" name="find_us" />

      {status === 'error' && (
        <p className="contact-form-error">
          Something went wrong. Please try again or email us directly.
        </p>
      )}

      <input
        type="submit"
        value={status === 'submitting' ? 'Sending…' : 'Send'}
        disabled={status === 'submitting'}
      />
    </form>
  );
};

export default ContactForm;
