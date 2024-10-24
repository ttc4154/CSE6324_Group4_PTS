import React from 'react';
import '../styles/Services.css'; // Import the CSS file for styling

const Services = () => {
  return (
    <div className="services-container">
      <h1 className="services-title">Our Tutoring Services</h1>
      <div className="services-list">
        <div className="service-item">
          <h2 className="service-name">One-on-One Tutoring</h2>
          <p className="service-description">
            Personalized tutoring sessions tailored to meet the individual needs of each student.
          </p>
        </div>
        <div className="service-item">
          <h2 className="service-name">Group Tutoring</h2>
          <p className="service-description">
            Collaborative learning in small groups to encourage teamwork and discussion.
          </p>
        </div>
        <div className="service-item">
          <h2 className="service-name">Online Tutoring</h2>
          <p className="service-description">
            Flexible online sessions that allow students to learn from the comfort of their homes.
          </p>
        </div>
        <div className="service-item">
          <h2 className="service-name">Test Preparation</h2>
          <p className="service-description">
            Focused sessions designed to help students prepare for exams such as SAT, ACT, and more.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Services;
