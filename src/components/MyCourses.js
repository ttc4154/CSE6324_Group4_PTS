import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDoc, getDocs, updateDoc, doc, query, where, deleteDoc, writeBatch } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import TutorRating from './TutorRating';
import Payment from './Payment'; // Import the Payment component
import '../styles/MyCourses.css';

function MyCourses() {
    const navigate = useNavigate();
    const [availableCourses, setAvailableCourses] = useState([]);
    const [signedUpCourses, setSignedUpCourses] = useState([]);
    const [tutorCourses, setTutorCourses] = useState([]);
    const [tutorNames, setTutorNames] = useState({});
    const [studentID, setstudentID] = useState(0);
    const [tutorID, settutorID] = useState(0);
    const [courseID, setCourseID] = useState(null);
    const [courseName, setCourseName] = useState('');
    const [courseSubject, setCourseSubject] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courseLocation, setCourseLocation] = useState('');
    const [error, setError] = useState('');
    const [userType, setUserType] = useState('');
    const [selectedTab, setSelectedTab] = useState('available');
    const [search, setSearch] = useState('');
    const [subjects, setSubjects] = useState([]); // Store subjects from Firestore
    const [showModal, setShowModal] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [courseToPayFor, setCourseToPayFor] = useState(null); // Store the ad to pay for

    useEffect(() => {    
        const fetchSubjects = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'subjects'));
                const subjectList = querySnapshot.docs.map((doc) => doc.data().name);
                setSubjects(subjectList); // Set the subjects list only once
                console.log('Fetched subjects:', subjectList);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };
        
        fetchSubjects();
    }, []); // Empty dependency array ensures this runs only once on component mount
    

    useEffect(() => {
        const checkUserType = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const studentDoc = await getDoc(doc(db, 'students', user.uid));
                    if (studentDoc.exists()) {
                        const userType = studentDoc.data().userType;
                        setUserType(userType);
                        setstudentID(auth.currentUser.uid)
                        setUserPoints(auth.currentUser.points || 1000); // Default to 1000 if no points
                    } else {
                        const tutorDoc = await getDoc(doc(db, 'tutors', user.uid));
                        if (tutorDoc.exists() && !tutorDoc.data().isAdmin) {
                            const userType = tutorDoc.data().userType;
                            setUserType(userType);
                            settutorID(auth.currentUser.uid);
                        } else {
                            setUserType('admin');
                            settutorID(auth.currentUser.uid)
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
                // get all tutor names
                const tutorsCollection = await getDocs(collection(db, 'tutors'));
                const tutorsMap = tutorsCollection.docs.reduce((acc, doc) => {
                    acc[doc.id] = doc.data().displayName;
                    return acc;
                }, {});
                console.log(tutorsMap);
                setTutorNames(tutorsMap);
            } catch (err) {
                setError(err);
            }
        };
        fetchAvailableCourses();
    }, []);

    useEffect(() => {
        const fetchTutorCourses = async () => {
            try {
                const coursesQuery = query(
                    collection(db, 'courses'),
                    where('createdBy', '==', tutorID)
                );
                const querySnapshot = await getDocs(coursesQuery);
                const courses = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTutorCourses(courses);
                console.log(courses);
            } catch (err) {
                setError(err.message);
                console.log(err);
            }
        };
        
        if (tutorID) {
            fetchTutorCourses();
        }
    }, [tutorID]);

    const handlePaymentSuccess = () => {
        alert("Payment Successful! You have registered for the course.");
        setUserPoints(prevPoints => prevPoints - 10); // Deduct points after successful payment
        setShowModal(false); // Close the modal after payment
    };

    const handlePaymentError = (message) => {
        alert(message);
    };

    // Edit and Delete Courses
    const handleEditCourse = (course) => {
        setCourseID(course.id);
        setCourseName(course.courseName);
        setCourseSubject(course.courseSubject);
        setCourseDescription(course.courseDescription);
        setCourseLocation(course.courseLocation);
        navigate('/my-courses');
    };
    const handleDeleteCourse = async (courseID) => {
        try {
            const studentsQuery = query(
                collection(db, 'students'),
                where('signedUpCourses', 'array-contains', courseID)
            );
            const studentsDocs = await getDocs(studentsQuery);
            const batch = writeBatch(db);
            studentsDocs.docs.forEach(studentDoc => {
                const studentRef = doc(db, 'students', studentDoc.id);
                const updatedCourses = studentDoc.data().signedUpCourses.filter(course => course !== courseID);
                batch.update(studentRef, { signedUpCourses: updatedCourses });
            });
            await deleteDoc(doc(db, 'courses', courseID));
            await batch.commit();
            setTutorCourses(tutorCourses.filter(course => course.id !== courseID));
            alert('Course deleted successfully!');
        } catch (err) {
            setError(err);
            console.log(err);
        }
    };

    // Save the updated course
    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            const courseRef = doc(db, 'courses', courseID);
            await updateDoc(courseRef, {
                courseName,
                courseSubject,
                courseDescription,
                courseLocation,
                updatedAt: new Date(),
            });
            setCourseID(null);
            alert('Course updated successfully!');
            const updatedCourses = tutorCourses.map(course => 
                course.id === courseID ? { ...course, courseName, courseSubject, courseLocation } : course
            );
            setTutorCourses(updatedCourses);
        } catch (err) {
            setError('Error updating course: ' + err.message);
        }
    };

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
                setCourseToPayFor(courseID); // Set the ad to pay for
                setShowModal(true); // Show the payment modal
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
            <h1>My Courses</h1>
            {userType === 'student' && (
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
            )}
            {((userType === "tutor") || (userType === "admin")) && (
                <div classname="myCourses-container">
                    <h3>Create a Course</h3>
                    <button onClick={() => navigate('/create-course')}>
                        Create Course
                    </button>
                </div>
            )
            }
            {selectedTab === 'available' && userType === 'student' && (
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
                                    <p className="course-description">
                                        <p className="course-card-title">Course Description</p>
                                        {course.courseDescription}
                                    </p>
                                    <p className="course-offered-by">
                                        <p className="course-card-title">Course Instructor</p>
                                        {tutorNames[course.createdBy]}
                                    </p>
                                    <p className="course-location">
                                        <p className="course-card-title">Course Location</p>
                                        {course.courseLocation}
                                    </p>
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
                        {/* Payment Modal */}
                        {showModal && (
                            <div className="modal">
                                <div className="modal-content">
                                    <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
                                    <Payment
                                        currentPoints={userPoints}
                                        price={10}
                                        onSuccess={handlePaymentSuccess}
                                        onError={handlePaymentError}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {userType === 'tutor' && (
                <div>
                    <h3>Your Courses</h3>
                    {(tutorCourses.length === 0 ) ? (
                        <p>No courses found. Please create a course.</p>
                        ) : (
                            <div className="courses-grid">
                                {tutorCourses.map(course => (
                                    <div key={course.id} className="course-card">
                                        <h3 className="course-title">{course.courseName}</h3>
                                        <p className="course-subject">
                                            <p className="course-card-title">Course Subject</p>
                                            {course.courseSubject}
                                        </p>
                                        <p className="course-description">
                                            <p className="course-card-title">Course Description</p>
                                            {course.courseDescription}
                                        </p>
                                        <p className="course-description">
                                            <p className="course-card-title">Course Location</p>
                                            {course.courseLocation}
                                        </p>
                                        <button 
                                            onClick={() => handleEditCourse(course)}
                                            className="edit-course-btn">
                                            Edit Course
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCourse(course.id)} 
                                            className="delete-course-btn">
                                            Delete Course
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                        )
                    }
                </div>
            )}
            {courseID && userType === 'tutor' && (
                <div className="edit-course-form">
                    <h3>Edit Course</h3>
                    <form onSubmit={handleSaveCourse}>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="Course Name"
                            required
                        />
                        <select
                            value={courseSubject}
                            onChange={(e) => setCourseSubject(e.target.value)}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                                <option key={subject} value={subject}>
                                    {subject}
                                </option>
                            ))}
                        </select>
                        <textarea
                            value={courseDescription}
                            onChange={(e) => setCourseDescription(e.target.value)}
                            placeholder="Course Description"
                            required
                        />
                        <textarea
                            value={courseLocation}
                            onChange={(e) => setCourseLocation(e.target.value)}
                            placeholder="Course Location"
                            required
                        />
                        <button type="submit">Save</button>
                        <button
                            type="button"
                            onClick={() => setCourseID(null)} // Cancel editing
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}
            {selectedTab === 'yourCourses' && userType === 'student' && (
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
                                            <p className="course-card-title">Course Description</p>
                                            {course.courseDescription}
                                        </p>
                                        <p className="course-location">
                                            <p className="course-card-title">Course Location</p>
                                            {course.courseLocation}
                                        </p>
                                        <p className="course-offered-by">
                                            <p className="course-card-title">Course Instructor</p>
                                            {tutorNames[course.createdBy]}
                                        </p>
                                        <button
                                            className="unregister-btn"
                                            onClick={() => handleCourseUnregister(courseID)}
                                        >
                                            Unregister
                                        </button>
                                        <TutorRating
                                            tutorId={course.createdBy}
                                            onSubmitRating={async (rating) => {
                                                try {
                                                    const tutorRef = doc(db, 'tutors', course.createdBy);
                                                    const tutorDoc = await getDoc(tutorRef);
                                                    if (tutorDoc.exists()) {
                                                        const ratings = tutorDoc.data().ratings || [];
                                                        const updatedRatings = [...ratings, rating];
                                                        const averageRating =
                                                            updatedRatings.reduce((sum, r) => sum + r, 0) /
                                                            updatedRatings.length;

                                                        await updateDoc(tutorRef, {
                                                            ratings: updatedRatings,
                                                            averageRating: averageRating.toFixed(1),
                                                        });

                                                        alert('Your rating has been submitted!');
                                                    }
                                                } catch (err) {
                                                    console.error('Error submitting rating:', err);
                                                    alert('Failed to submit rating.');
                                                }
                                            }}
                                        />
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
