import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/MyCourses.css';

function MyCourses() {
    const navigate = useNavigate();
    const [availableCourses, setAvailableCourses] = useState([]);
    const [signedUpCourses, setSignedUpCourses] = useState([]);
    const [error, setError] = useState('');
    const [userType, setUserType] = useState('');
    const [selectedTab, setSelectedTab] = useState('available');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const checkUserType = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const studentDoc = await getDoc(doc(db, 'students', user.uid));
                    if (studentDoc.exists()) {
                        const userType = studentDoc.data().userType;
                        setUserType(userType);
                    } else {
                        const tutorDoc = await getDoc(doc(db, 'tutors', user.uid));
                        if (tutorDoc.exists() && !tutorDoc.data().isAdmin) {
                            const userType = tutorDoc.data().userType;
                            setUserType(userType);
                        } else {
                            setUserType('admin');
                        }
                    }
                } catch (err) {
                    setError(err);
                    setUserType(null);
                }
            } else {
                setUserType(null);
            }
        };
        checkUserType();
    }, []);

    // Fetch available courses
    useEffect(() => {
        const fetchAvailableCourses = async () => {
            try {
                const getCourseCollection = await getDocs(collection(db, 'courses'));
                const coursesMap = getCourseCollection.docs.map(course => ({
                    id: course.id,
                    ...course.data(),
                }));
                setAvailableCourses(coursesMap);
            } catch (err) {
                setError(err);
            }
        };
        fetchAvailableCourses();
    }, []);

    const studentID = auth.currentUser?.uid;

    // Fetch registered courses for student
    useEffect(() => {
        const fetchStudentCourses = async () => {
            if (studentID) {
                try {
                    const studentCourses = await getDoc(doc(db, 'students', studentID));
                    if (studentCourses.exists()) {
                        const studentCourseData = studentCourses.data();
                        setSignedUpCourses(studentCourseData.signedUpCourses || []);
                    }
                } catch (err) {
                    setError(err);
                }
            }
        };
        fetchStudentCourses();
    }, [studentID]);

    // Handle course sign-up
    const handleCourseSignUp = async (courseID) => {
        if (!signedUpCourses.includes(courseID)) {
            try {
                const newSignedUpCourses = [...signedUpCourses, courseID];
                await updateDoc(doc(db, 'students', studentID), {
                    signedUpCourses: newSignedUpCourses,
                });
                setSignedUpCourses(newSignedUpCourses);
            } catch (err) {
                setError(err);
            }
        }
    };

    // Handle course unregistration
    const handleCourseUnregister = async (courseID) => {
        const newSignedUpCourses = signedUpCourses.filter(course => course !== courseID);
        try {
            await updateDoc(doc(db, 'students', studentID), {
                signedUpCourses: newSignedUpCourses,
            });
            setSignedUpCourses(newSignedUpCourses);
        } catch (err) {
            setError(err);
        }
    };

    // Filter courses
    const filteredCourses = availableCourses.filter(course =>
        course.courseName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="myCourses-container">
            <h2>Courses Page</h2>
            <div className="tabs">
                <button
                    className={`tab ${selectedTab === 'available' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('available')}
                >
                    Available Courses
                </button>
                <button
                    className={`tab ${selectedTab === 'yourCourses' ? 'active' : ''}`}
                    onClick={() => setSelectedTab('yourCourses')}
                >
                    Your Courses
                </button>
            </div>

            {selectedTab === 'available' && (
                <div className="signUp-container">
                    <h3>Available Courses</h3>
                    <input
                        type="text"
                        placeholder="Search by course name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <div className="courses-grid">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map(course => (
                                <div key={course.id} className="course-card">
                                    <h4 className="course-title">{course.courseName}</h4>
                                    <p className="course-description">{course.description || 'No description available.'}</p>
                                    <button
                                        className="sign-up-btn"
                                        onClick={() => handleCourseSignUp(course.id)}
                                        disabled={signedUpCourses.includes(course.id)}
                                    >
                                        {signedUpCourses.includes(course.id) ? 'Registered' : 'Sign Up'}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No courses found.</p>
                        )}
                    </div>
                </div>
            )}

            {selectedTab === 'yourCourses' && (
                <div className="yourCourses-container">
                    <h3>Registered Courses</h3>
                    {signedUpCourses.length === 0 ? (
                        <p>No courses registered for yet.</p>
                    ) : (
                        <div className="courses-grid">
                            {signedUpCourses.map(courseID => {
                                const course = availableCourses.find(course => course.id === courseID);
                                return (
                                    <div key={courseID} className="course-card signed-up-course-card">
                                        <h4 className="course-title">{course.courseName}</h4>
                                        <p className="course-description">
                                            {course.courseDescription}
                                        </p>
                                        <button
                                            className="unregister-btn"
                                            onClick={() => handleCourseUnregister(courseID)}
                                        >
                                            Unregister
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default MyCourses;
