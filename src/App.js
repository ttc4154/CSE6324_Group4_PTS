import React, { useState, useEffect } from 'react';
import './styles/styles.css'; // Import styles
import { UserContext } from './context/UserContext';
import { UserProvider } from './context/UserContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Correct import for Routes and Route in v6
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import About from './components/About';
import Contact from './components/Contact';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import UserProfile from './components/UserProfile';
import CreateCourse from './components/CreateCourse';
import AdminDashboard from './components/AdminDashboard';
import LiveChat from './components/LiveChat';
import Menu from './components/Menu'; // Import the Menu component
import './styles/Services.css';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase'; // Import Firebase auth
import TutorScheduler from './components/TutorScheduler';
import StudentScheduler from './components/StudentScheduler';
import MyCourses from './components/MyCourses';
import Search from './components/Search';
import Messages from './components/messages/Messages';


function App() {
    const [user, setUser] = useState(null); // State to track user
    const [selectedSubjectReturn, setSelectedSubjectReturn] = useState(''); // State for selected subject
    const [tutorIdReturn, setTutorIdReturn] = useState(''); // State for tutor ID

    // Firebase listener for authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser); // Update user state when authentication state changes
        });

        return () => unsubscribe(); // Clean up the listener
    }, []);

    return (
        <UserProvider>
            <Router>
                <div className="App">
                    <Navbar user={user} /> {/* Pass user state to Navbar */}
                    {/* Render Menu only if user is logged in */}
                    {user && <Menu />} 

                    <Routes>
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/create-course" element={<CreateCourse />} /> 
                        <Route path="/user-profile" element={<UserProfile />} />
                        <Route path="/tutor-scheduler/:userId" element={<TutorScheduler />} />
                        <Route path="/student-scheduler/:userId" element={<StudentScheduler />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/chat" element={<LiveChat />} />
                        {/*<Route path="/my-courses" element={<MyCourses />} />*/}
                        <Route path="/my-courses" element={<MyCourses selectedSubjectReturn={selectedSubjectReturn} tutorIdReturn={tutorIdReturn} />} />
                        <Route path="/my-messages" element={<Messages />} />
                        <Route path="/my-messages" element={<Messages />} />
                        {/*<Route path="/search" element={<Search />} />*/}
                        <Route path="/search" element={<Search setSelectedSubjectReturn={setSelectedSubjectReturn} setTutorIdReturn={setTutorIdReturn} />} />
                    </Routes>
                    <Footer />
                </div>
            </Router>
        </UserProvider>
    );
}

export default App;
