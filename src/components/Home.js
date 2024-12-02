import React from 'react';
import '../styles/styles.css';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import ContactUs from './ContactUs'; 
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
const Home = () => {

  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleNavigateToAdmin = () => {
    navigate('/admin');
  };

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 1024 },
      items: 5
    },
    desktop: {
      breakpoint: { max: 1024, min: 768 },
      items: 3
    },
    tablet: {
      breakpoint: { max: 768, min: 464 },
      items: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1
    }
  };

  return (
    <div className="home-container">
        {user && user.isAdmin && ( // Check if the user is an admin
          <button onClick={handleNavigateToAdmin}>Go to Admin Dashboard</button>
        )}
        <div className="advertisement-banner">
          <p>Advertise Here! Get 20% Off Your First Lesson!</p>
        </div>
        <Carousel responsive={responsive} autoPlay={true} infinite={true}>
        {/* First Carousel Item */}
        <div className="carousel-item">
          <a href="https://example.com/service1" target="_blank" rel="noopener noreferrer">
            <img src="/images/join_our_team.png" alt="Service 1" className="carousel-image" />
            <div className="carousel-text">Join Our Team</div>
          </a>
        </div>
        <div className="carousel-item">
          <a href="https://example.com/ad2" target="_blank" rel="noopener noreferrer">
            <img src="/images/ad_2.png" alt="Service 4" className="carousel-image" />
            <div className="carousel-text">First 10 hours FREE</div>
          </a>
        </div>
        {/* Second Carousel Item */}
        <div className="carousel-item">
          <a href="https://example.com/service2" target="_blank" rel="noopener noreferrer">
            <img src="/images/student_guide.png" alt="Service 2" className="carousel-image" />
            <div className="carousel-text">Tutoring</div>
          </a>
        </div>
        {/* Repeat for other items */}
        <div className="carousel-item">
          <a href="https://example.com/service3" target="_blank" rel="noopener noreferrer">
            <img src="/images/writing_center.png" alt="Service 3" className="carousel-image" />
            <div className="carousel-text">Writing Center</div>
          </a>
        </div>
        
        <div className="carousel-item">
          <a href="https://example.com/ad3" target="_blank" rel="noopener noreferrer">
            <img src="/images/ad_3.png" alt="Service 5" className="carousel-image" />
            <div className="carousel-text">50% OFF</div>
          </a>
        </div>
      </Carousel>
        <ContactUs />
      <h2 className="section-title">Our Subject</h2>
      <div className="subject-grid">
        <div className="subject-item">
          <h3>Math Tutoring</h3>
          <p>Our tutors provide personalized support in algebra, calculus, and more.</p>
        </div>
        <div className="subject-item">
          <h3>Science Tutoring</h3>
          <p>Get help with biology, chemistry, physics, and other sciences.</p>
        </div>
        <div className="subject-item">
          <h3>Writing Support</h3>
          <p>Improve your writing skills with our expert tutors.</p>
        </div>
        <div className="subject-item">
          <h3>Tennis Coaching</h3>
          <p>Learn the fundamentals of tennis and improve your game with our expert coaches.</p>
        </div>
        <div className="subject-item">
          <h3>Piano Lessons</h3>
          <p>Whether you're a beginner or advanced, our piano teachers can help you excel.</p>
        </div>
        <div className="subject-item">
          <h3>English Tutoring</h3>
          <p>Enhance your reading, writing, and speaking skills in English.</p>
        </div>
        <div className="subject-item">
          <h3>Programming Classes</h3>
          <p>Learn to code with our comprehensive programming courses tailored for all levels.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
