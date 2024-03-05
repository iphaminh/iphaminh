import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = () => {
  const [date, setDate] = useState('');

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  // Other handlers can be added for form submission, etc.

  return (
    <div className="contact-form-container">
      <h2>LET'S START HERE</h2>
      <p>Please fill out the contact form below to get more detailed information about the offered wedding collections and services.</p>
      <form className="contact-form">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />

        <label htmlFor="phone">Phone Number</label>
        <input type="tel" id="phone" name="phone" />

        <label htmlFor="event-date">Event Date</label>
        <input type="date" id="event-date" name="event-date" value={date} onChange={handleDateChange} required />

        <label htmlFor="venue">Venue</label>
        <input type="text" id="venue" name="venue" />

        <label htmlFor="interested-in">Interested In</label>
        <select id="interested-in" name="interested-in">
          <option value="wedding">Wedding Video</option>
          <option value="elopement">Elopement Video</option>
          {/* Add more options here */}
        </select>

        <label htmlFor="budget">Estimated Budget</label>
        <input type="text" id="budget" name="budget" placeholder="Wedding collections start at $5,500." />

        <label htmlFor="find-us">How'd you find us?</label>
        <input type="text" id="find-us" name="find-us" />

        <button type="submit" className="submit-button">SEND</button>
      </form>
    </div>
  );
};

export default ContactForm;
