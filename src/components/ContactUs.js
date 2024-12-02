import React from 'react';
import '../styles/ContactUs.css';
import { Link } from 'react-router-dom';

import { FaPhone, FaEnvelope, FaComments } from 'react-icons/fa';  // Import icons from react-icons library

const ContactUs = () => {
  return (
    <div className="contact-us">
      <h3>Questions? Our front desk team is here to help.</h3>
      <ul className="contact-options">
        {/* Phone Contact */}
        <a href="tel:+1234567890" className="contact-option">
          <FaPhone size={24} />
          <span>Phone</span>
        </a>

        {/* Chat Contact */}
        <li><Link to="/my-messages" className="contact-option">
          <FaComments size={24} />
          <span>Chat</span>
        </Link></li>

        {/* Email Contact */}
        <a href="mailto:support@example.com" className="contact-option">
          <FaEnvelope size={24} />
          <span>Email</span>
        </a>
      </ul>
    </div>
  );
};

export default ContactUs;
