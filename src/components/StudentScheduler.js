import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/StudentScheduler.css'; // Import your CSS file for styling

const localizer = momentLocalizer(moment);

const StudentScheduler = () => {
    const { userId: studentId } = useParams();
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedTutor, setSelectedTutor] = useState('');
    const [tutors, setTutors] = useState([]);
    const [studentSubjects, setStudentSubjects] = useState([]);
    const [tutoringSessions, setTutoringSessions] = useState([]);
    const [calendarDays, setCalendarDays] = useState([]);

    // Fetch student's registered subjects
    // Generate a basic calendar for the current month
    const generateCalendar = () => {
        const daysInMonth = new Date(2024, 11, 0).getDate(); // Get number of days in current month (e.g., December)
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ date: i, available: true }); // Assuming all dates are available by default
        }
        setCalendarDays(days);
    };

    useEffect(() => {
        generateCalendar();
    }, []);
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

    // Fetch booked sessions for the student
    useEffect(() => {
        const fetchTutoringSessions = async () => {
            if (!studentId) return;

            const studentRef = doc(db, 'students', studentId);
            try {
                const studentDoc = await getDoc(studentRef);
                if (studentDoc.exists()) {
                    const bookedSlot = studentDoc.data().bookedSlot || '';
                    const tutorName = tutors.find(t => t.id === studentDoc.data().tutorId)?.name || '';
                    if (bookedSlot) {
                        const sessionDate = moment(bookedSlot, 'YYYY-MM-DDTHH:mm').toDate();
                        setTutoringSessions([
                            {
                                title: `Session with ${tutorName}`,
                                start: sessionDate,
                                end: moment(sessionDate).add(1, 'hour').toDate(),
                            },
                        ]);
                    }
                }
            } catch (error) {
                console.error("Error fetching tutoring sessions:", error);
            }
        };

        fetchTutoringSessions();
    }, [studentId, tutors]);

    // Book the selected slot
    const bookSlot = async () => {
        if (!selectedSlot || !selectedTutor) {
            alert("Please select a tutor and a time slot");
            return;
        }

        try {
            const studentRef = doc(db, 'students', studentId);
            await updateDoc(studentRef, {
                bookedSlot: selectedSlot,
                tutorId: selectedTutor
            });

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
            <label htmlFor="tutor">
                <p>Select a Tutor</p>
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
            <br />
            <label htmlFor="slot">
                <p>Select a Time Slot</p>
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

            <Calendar
                localizer={localizer}
                events={tutoringSessions}
                startAccessor="start"
                endAccessor="end"
                className="rbc-calendar" // Ensure to use the class from CSS
                style={{
                    height: '500px', /* Adjust height dynamically */
                    margin: '50px 0', /* Margin above and below calendar */
                }}
                toolbar={{
                    left: 'today', // Show 'Today' button
                    center: 'month,agendaWeek,agendaDay', // View options
                    right: 'next,prev' // Navigation buttons
                }}
            />
            
        </div>
    );
};

export default StudentScheduler;
