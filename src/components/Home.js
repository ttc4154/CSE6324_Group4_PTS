import React from 'react';
import '../styles/styles.css';

const Home = () => {
  return (
    <div className="home-container">
      <h2 className="section-title">About Our Subject Services</h2>
      <div className="subject-grid">
        <div className="subject-item">
          <h3>Math Tutoring</h3>
          <p>Our tutors provide personalized support in algebra, calculus, and more.</p>
          <a href="/math" className="subject-link">Learn More</a>
        </div>
        <div className="subject-item">
          <h3>Science Tutoring</h3>
          <p>Get help with biology, chemistry, physics, and other sciences.</p>
          <a href="/science" className="subject-link">Learn More</a>
        </div>
        <div className="subject-item">
          <h3>Writing Support</h3>
          <p>Improve your writing skills with our expert tutors.</p>
          <a href="/writing" className="subject-link">Learn More</a>
        </div>
        <div className="subject-item">
          <h3>Tennis Coaching</h3>
          <p>Learn the fundamentals of tennis and improve your game with our expert coaches.</p>
          <a href="/tennis" className="subject-link">Learn More</a>
        </div>
        <div className="subject-item">
          <h3>Piano Lessons</h3>
          <p>Whether you're a beginner or advanced, our piano teachers can help you excel.</p>
          <a href="/piano" className="subject-link">Learn More</a>
        </div>
        <div className="subject-item">
          <h3>English Tutoring</h3>
          <p>Enhance your reading, writing, and speaking skills in English.</p>
          <a href="/english" className="subject-link">Learn More</a>
        </div>
        <div className="subject-item">
          <h3>Programming Classes</h3>
          <p>Learn to code with our comprehensive programming courses tailored for all levels.</p>
          <a href="/programming" className="subject-link">Learn More</a>
        </div>
      </div>
    </div>
  );
};

export default Home;
