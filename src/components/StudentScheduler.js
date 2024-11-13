import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';

const StudentScheduler = ({ studentId }) => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedTutor, setSelectedTutor] = useState('');
    const [tutors, setTutors] = useState([]);
    const [studentSubjects, setStudentSubjects] = useState([]);

    // Fetch student's registered subjects
    useEffect(() => {
        const fetchStudentSubjects = async () => {
            const studentRef = doc(db, 'students', studentId);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists()) {
                const subjects = studentDoc.data().selectedSubjects || [];
                setStudentSubjects(subjects);
                console.log("Student subjects:", subjects); // Log student subjects
            }
        };
        if (studentId) fetchStudentSubjects();
    }, [studentId]);

    // Fetch available tutors based on student's subjects
    useEffect(() => {
        const fetchTutors = async () => {
            if (studentSubjects.length === 0) return; // No subjects selected by student
    
            console.log("Fetching tutors for subjects:", studentSubjects);
    
            // Query tutors who offer any of the student's subjects
            const tutorQuery = query(
                collection(db, 'tutors'),
                where('selectedSubjects', 'array-contains-any', studentSubjects)
            );
    
            try {
                const tutorSnap = await getDocs(tutorQuery);
    
                // Check if we have any documents in the snapshot
                if (tutorSnap.empty) {
                    console.log("No tutors found matching the student's subjects");
                    setTutors([]);
                    return;
                }
    
                // Process the documents in the snapshot
                const tutorsList = tutorSnap.docs.map(doc => {
                    return { id: doc.id, ...doc.data() };
                });
    
                console.log("Tutors fetched:", tutorsList);
                setTutors(tutorsList);
            } catch (error) {
                console.error("Error fetching tutors:", error);
            }
        };
    
        fetchTutors();
    }, [studentSubjects]);
    
    

    // Fetch available slots for selected tutor
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!selectedTutor) return; // No tutor selected
            const docRef = doc(db, 'tutors', selectedTutor);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setAvailableSlots(docSnap.data().availableSlots || []);
            }
        };

        fetchAvailableSlots();
    }, [selectedTutor]);

    // Book the selected slot
    const bookSlot = async () => {
        try {
            // Update student's bookedSlot and selected tutorId
            const studentRef = doc(db, 'students', studentId);
            await updateDoc(studentRef, {
                bookedSlot: selectedSlot,
                tutorId: selectedTutor
            });

            // Update tutor's student list
            const tutorRef = doc(db, 'tutors', selectedTutor);
            await updateDoc(tutorRef, {
                students: arrayUnion(studentId)
            });

            alert('Booking confirmed!');
        } catch (err) {
            console.error("Error booking slot:", err);
        }
    };

    return (
        <div>
            <h3>Book a Session</h3>
            <label htmlFor="tutor">Select a Tutor</label>
            <select
                id="tutor"
                value={selectedTutor}
                onChange={(e) => setSelectedTutor(e.target.value)}
            >
                <option value="">Select a tutor</option>
                {tutors.map((tutor) => (
                    <option key={tutor.id} value={tutor.id}>
                        {tutor.name} - {tutor.selectedSubjects.join(', ')}
                    </option>
                ))}
            </select>

            <label htmlFor="slot">Select a Time Slot</label>
            <select
                id="slot"
                onChange={(e) => setSelectedSlot(e.target.value)}
                value={selectedSlot}
                disabled={!selectedTutor}
            >
                <option value="">Select a slot</option>
                {availableSlots.map((slot, index) => (
                    <option key={index} value={slot}>
                        {slot}
                    </option>
                ))}
            </select>

            <button onClick={bookSlot} disabled={!selectedSlot || !selectedTutor}>
                Book Slot
            </button>
        </div>
    );
};

export default StudentScheduler;
