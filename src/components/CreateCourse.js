import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateCourse.css';

function CreateCourse() {
    const [courseName, setCourseName] = useState('');
    const [courseSubject, setCourseSubject] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [error, setError] = useState('');
    const [userType, setUserType] = useState('');
    const navigate = useNavigate();

    const subjects = [
        "Math", 
        "Science", 
        "Writing", 
        "Tennis", 
        "Piano", 
        "English", 
        "Programming"
    ];

    // Check the user type student, tutor, admin, or null
    useEffect(() => {
        const checkUserType = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const studentDoc = await getDoc(doc(db, 'students', user.uid));
                    if (studentDoc.exists()) {
                        setUserType('student');
                    } else {
                        const tutorDoc = await getDoc(doc(db, 'tutors', user.uid));
                        if (tutorDoc.exists() && !tutorDoc.data().isAdmin) {
                            setUserType('tutor');
                        } else {
                            setUserType('admin');
                        }
                    }
                } catch (err) {
                    setError('Error checking user type.');
                    console.error(err);
                }
            } else {
                setUserType(null);
            }
        };

        checkUserType();
    }, []);

    useEffect(() => {
        if (userType === 'student') {
            navigate('/my-courses');
        }
    }, [userType, navigate]);

    // Handle course creation
    const handleCourseCreation = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'courses'), {
                courseName,
                courseSubject,
                courseDescription,
                createdAt: new Date(),
                createdBy: auth.currentUser.uid,
            });
            alert("Course successfully created");
            setCourseName('');
            setCourseSubject('');
            setCourseDescription('');
        } catch (err) {
            setError(err.message);
        }
    };

    // If user is a student, show loading message or redirect, otherwise show course creation form
    if (userType === 'student' || userType === null) {
        navigate('/my-courses');
    }

    return (
        <div className="createCourse-container">
            <h2>Create a Course</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleCourseCreation}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Course Name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <p>Course Subject</p>
                    <select 
                        value={courseSubject} 
                        style={{ display: 'inline-flex', alignItems: 'center', marginRight: '10px' }} 
                        onChange={(e) => setCourseSubject(e.target.value)}
                        required
                    >
                        <option value="">
                            Select Course Subject
                        </option>
                        {subjects.map((subject) => (
                            <option 
                                key={subject}
                                value={subject}
                            >
                                {subject}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Course Description"
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Create Course</button>
            </form>
        </div>
    );
}

export default CreateCourse;
