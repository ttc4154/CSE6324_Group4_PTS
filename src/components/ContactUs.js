import React from 'react';
import '../styles/ContactUs.css';

import { FaPhone, FaEnvelope, FaComments } from 'react-icons/fa';  // Import icons from react-icons library

const ContactUs = () => {
  return (
    <div className="contact-us">
      <h3>Questions? Our front desk team is here to help.</h3>
      <div className="contact-options">
        {/* Phone Contact */}
        <a href="tel:+1234567890" className="contact-option">
          <FaPhone size={24} />
          <span>Phone</span>
        </a>

        {/* Chat Contact */}
        <a href="#chat" className="contact-option" onClick={() => alert("Chat feature coming soon!")}>
          <FaComments size={24} />
          <span>Chat</span>
        </a>

        {/* Email Contact */}
        <a href="mailto:support@example.com" className="contact-option">
          <FaEnvelope size={24} />
          <span>Email</span>
        </a>
      </div>
    </div>
  );
};

export default ContactUs;
