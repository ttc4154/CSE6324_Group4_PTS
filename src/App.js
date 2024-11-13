//import React, { useState } from 'react';
import './styles/styles.css'; // Import styles
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import About from './components/About';
import Contact from './components/Contact';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import LiveChat from './components/LiveChat';

//import Services from './components/Services';
// import SearchBox from './components/SearchBox';
//import servicesData from './servicesData';
import './styles/Services.css'; 

function App() {
    //const [filteredServices, setFilteredServices] = useState(servicesData); // State for filtered services

    /*const handleSearch = (searchTerm) => {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filtered = servicesData.filter(service =>
            service.name.toLowerCase().includes(lowercasedTerm) ||
            service.description.toLowerCase().includes(lowercasedTerm)
        );
        setFilteredServices(filtered);
    };*/

    return (
        <Router>
            <div className="App">
                <Navbar />
                <Routes>
                    <Route path="/register" element={<Register />} /> {/* Use element prop */}
                    <Route path="/login" element={<Login />} /> {/* Use element prop */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/user-profile" element={<UserProfile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/chat" element={<LiveChat/>}/>
                    {/*<Route path="/services" element={<Services services={filteredServices} />} /> {/* Pass filtered services */}
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
