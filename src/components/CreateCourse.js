// CreateCourse.js
import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";
import '../styles/CreateCourse.css';

function CreateCourse() {
    const [courseName, setcourseName] = useState('');
    const [courseSubject, setcourseSubject] = useState([]);
    const [courseDescription, setcourseDescription] = useState('');
    const [error, setError] = useState('');
    
    const subjects = [
        "Math", 
        "Science", 
        "Writing", 
        "Tennis", 
        "Piano", 
        "English", 
        "Programming"
    ];

    const handlecourseCreation = async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, 'courses'),
            {
                courseName,
                courseSubject,
                courseDescription,
                createdAt: new Date()
            });
            alert("Course successfully created");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="createCourse-container">
            <h2>Create a Course</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handlecourseCreation}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="text"
                        placeholder="Course Name"
                        value={courseName}
                        onChange={(e) => setcourseName(e.target.value)}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <p>Course Subject</p>
                    <select 
                        value={courseSubject} 
                        style={{ display: 'inline-flex', alignItems: 'center', marginRight: '10px' }} 
                        onChange={(e) => setcourseSubject(e.target.value)}
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
                    onChange={(e) => setcourseDescription(e.target.value)}
                    required
                    />
                </div>

                <button type="submit">Create Course</button>
            </form>
        </div>
    );
}

export default CreateCourse;