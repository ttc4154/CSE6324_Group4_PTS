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
import { auth, db } from './firebase'; // Import Firebase auth
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { useAuthState } from 'react-firebase-hooks/auth'
import TutorScheduler from './components/TutorScheduler';
import StudentScheduler from './components/StudentScheduler';
import MyCourses from './components/MyCourses';
import Search from './components/Search';
import Messages from './components/messages/Messages';
import MyTutorAds from './components/MyTutorAds';
import Payment from './components/Payment';

function App() {
  const [user, setUser] = useState(null); // State to track user
  const [selectedSubjectReturn, setSelectedSubjectReturn] = useState(''); // State for selected subject
  const [tutorIdReturn, setTutorIdReturn] = useState(''); // State for tutor ID
  const [currentPoints, setCurrentPoints] = useState(null); // State for user money
  const [price, setPrice] = useState(100);
  const [userMoney, setUserMoney] = useState(0);

  // Firebase listener for authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserMoney(currentUser.uid); // Fetch user money on login
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  const fetchUserMoney = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setCurrentPoints(userDoc.data().money);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user money:', error);
    }
  };

  const handleSuccess = async (amount) => {
    alert('Payment Successful!');
    setCurrentPoints(currentPoints + amount);
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, { userMoney: currentPoints + amount });
        console.log("UserMoney updated successfully!");
      } catch (error) {
        console.error("Did not add money to user. Error:", error);
      }
    }
  };

  const handleError = (msg) => {
    alert(msg);
  };

  const isPaymentURL = window.location.pathname === '/Payment';
  let paymentType = isPaymentURL ? 'add' : 'spend';
//   alert(paymentType)

//   const isMyCoursesURL = window.location.pathname === '/my-courses';
//   paymentType = isPaymentURL ? 'spend' : 'add';


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
            <Route path="/my-tutor-ads/:userId" element={<MyTutorAds />} />
            <Route path="/payment" element={
              <Payment 
                user={user} 
                db={db} 
                currentPoints={currentPoints} 
                price={price} 
                onSuccess={handleSuccess} 
                onError={handleError} 
                isNavbarVersion={true} 
                type={paymentType} 
              />
            } />
            <Route path="/search" element={<Search setSelectedSubjectReturn={setSelectedSubjectReturn} setTutorIdReturn={setTutorIdReturn} />} />
        </Routes>
        <Footer />
        </div>
    </Router>
</UserProvider>
    );
}

export default App;
