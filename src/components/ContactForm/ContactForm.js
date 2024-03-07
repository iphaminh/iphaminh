// ContactForm.js
import React from 'react';
import './ContactForm.css';

const ContactForm = () => {
  return (
    
    <form action="https://formspree.io/f/xnqezqow" method="POST" className="contact-form">
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
        <option value="wedding_video">Elopement Videography</option>
        <option value="wedding_photography">Elopement Photography</option>
        <option value="engagement_photography">Engagement Photography</option>
        <option value="engagement_video">Engagement Videography</option>
        <option value="senior">Senior Photography</option>
        <option value="other">Other</option>
      </select>

      <div className="input-group relative">
  <span className="absolute left-0 pl-2 flex items-center pointer-events-none">
    <span className="currency-symbol">$</span>
  </span>
  <input
  type="text"
  id="budget"
  name="budget"
  placeholder="2,700"
  className="w-full border-2 border-gray-300 p-2 pl-8 rounded-md placeholder-gray-900"/>
        </div>

      <label htmlFor="find_us">How'd you find us?</label>
      <input type="text" id="find_us" name="find_us" />

      <input type="submit" value="Send" />
    </form>
  );
};

export default ContactForm;
