import React from 'react';
import '../styles/Services.css'; // Import the CSS file for styling

const Services = ({ services }) => {
  return (
    <div className="services-container">
      <h1 className="services-title">Our Tutoring Services</h1>
      <div className="services-list">
        {services.length > 0 ? (
          services.map(service => (
            <div className="service-item" key={service.id}>
              <h2 className="service-name">{service.name}</h2>
              <p className="service-description">{service.description}</p>
            </div>
          ))
        ) : (
          <p>No services found.</p> // Message if no services match the search
        )}
      </div>
    </div>
  );
};

export default Services;
