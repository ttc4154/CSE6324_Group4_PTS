import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import '../styles/StudentScheduler.css';  // Import the CSS file for styling

const StudentScheduler = () => {
    const { userId: studentId } = useParams();
    console.log('studentId :', studentId);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedTutor, setSelectedTutor] = useState('');
    const [tutors, setTutors] = useState([]);
    const [studentSubjects, setStudentSubjects] = useState([]);

    // Fetch student's registered subjects
    useEffect(() => {
        const fetchStudentSubjects = async () => {
            if (!studentId) {
                console.error("No studentId provided");
                return;
            }

            const studentRef = doc(db, 'students', studentId);
            const studentDoc = await getDoc(studentRef);
            if (studentDoc.exists()) {
                const subjects = studentDoc.data().selectedSubjects || [];
                setStudentSubjects(subjects);
                console.log("Student subjects:", subjects); // Log student subjects
            } else {
                console.error("Student document not found");
            }
        };

        if (studentId) {
            fetchStudentSubjects();
        }
    }, [studentId]);

    // Fetch available tutors based on student's subjects
    useEffect(() => {
        const fetchTutors = async () => {
            if (studentSubjects.length === 0) {
                console.log("No subjects selected by student");
                setTutors([]);
                return; // No subjects selected by student
            }

            console.log("Fetching tutors for subjects:", studentSubjects);

            // Query tutors who offer any of the student's subjects
            const tutorQuery = query(
                collection(db, 'tutors'),
                where('selectedSubjects', 'array-contains-any', studentSubjects)
            );

            try {
                const tutorSnap = await getDocs(tutorQuery);
                if (tutorSnap.empty) {
                    console.log("No tutors found matching the student's subjects");
                    setTutors([]);
                    return;
                }

                const tutorsList = tutorSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                console.log("Tutors fetched:", tutorsList);
                setTutors(tutorsList);
            } catch (error) {
                console.error("Error fetching tutors:", error);
            }
        };

        fetchTutors();
    }, [studentSubjects]);

    // Fetch available slots for the selected tutor
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!selectedTutor) return; // No tutor selected

            const tutorRef = doc(db, 'tutors', selectedTutor);
            try {
                const tutorDoc = await getDoc(tutorRef);
                if (tutorDoc.exists()) {
                    setAvailableSlots(tutorDoc.data().availableSlots || []);
                }
            } catch (error) {
                console.error("Error fetching available slots:", error);
            }
        };

        fetchAvailableSlots();
    }, [selectedTutor]);

    // Book the selected slot
    const bookSlot = async () => {
        if (!selectedSlot || !selectedTutor) {
            alert("Please select a tutor and a time slot");
            return;
        }

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
            alert('Error booking the slot. Please try again.');
        }
    };

    return (
        <div className="student-scheduler">
            <h3>Book a Session</h3>
            <label htmlFor="tutor"><p>Select a Tutor</p>
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
            </label>
            <br></br>
            <label htmlFor="slot"><p>Select a Time Slot</p>
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
            </label>
            <button onClick={bookSlot} disabled={!selectedSlot || !selectedTutor}>
                Book Slot
            </button>
        </div>
    );
};

export default StudentScheduler;
