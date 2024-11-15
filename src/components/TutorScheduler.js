import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { useParams } from 'react-router-dom'; // Import useParams
import '../styles/TutorScheduler.css';  // Import the CSS file for styling

const TutorScheduler = () => {
    const { userId: tutorId } = useParams(); // Use useParams to get tutorId from URL params
    console.log("Tutor ID from URL params:", tutorId); // Debug: Check if tutorId is passed

    const [newSlot, setNewSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);

    // Fetch available slots from Firestore
    useEffect(() => {
        const fetchSlots = async () => {
            if (!tutorId) {
                console.error("No tutorId provided");
                return; // Exit if tutorId is not available
            }

            const docRef = doc(db, 'tutors', tutorId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log('Fetched slots:', docSnap.data().availableSlots);
                    setAvailableSlots(docSnap.data().availableSlots || []);
                } else {
                    console.log("No document found for tutorId:", tutorId);
                }
            } catch (err) {
                console.error("Error fetching slots:", err);
            }
        };

        fetchSlots();
    }, [tutorId]);

    // Function to add a new slot to Firestore
    const addSlot = async () => {
        try {
            console.log("Adding slot:", newSlot); // Debug: check if newSlot is correct
            console.log("TutorId:", tutorId); // Debug: check if tutorId is passed correctly

            // Ensure newSlot is a valid date string
            if (!newSlot) {
                console.error("newSlot must be a valid date string");
                return;
            }

            // Ensure tutorId is valid
            if (!tutorId) {
                console.error("TutorId is undefined or invalid");
                return;
            }

            // Get tutor document reference
            const tutorRef = doc(db, 'tutors', tutorId);
            const tutorDoc = await getDoc(tutorRef);

            if (!tutorDoc.exists()) {
                console.error("Tutor document does not exist.");
                return;
            }

            // Check if availableSlots exists and initialize if not
            const availableSlots = tutorDoc.data().availableSlots || [];

            // Add the new slot to availableSlots
            await updateDoc(tutorRef, {
                availableSlots: arrayUnion(newSlot)
            });

            console.log('Slot added successfully!');
            // Update availableSlots in local state to reflect changes immediately
            setAvailableSlots(prevSlots => [...prevSlots, newSlot]);
        } catch (error) {
            console.error('Error adding slot:', error);
        }
    };

    // Handle date-time change
    const handleDateTimeChange = (e) => {
        setNewSlot(e.target.value);
    };

    // Function to format the slot date with the day of the week and time
    const formatSlotDate = (slot) => {
        const date = new Date(slot);

        // Format the date in mm/dd/yyyy
        const formattedDate = date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
        });

        // Format the time (including day of the week)
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });

        // Get the day of the week
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });

        return `${dayOfWeek}, ${formattedDate}, ${formattedTime}`;
    };

    return (
        <div className="tutor-scheduler">
            <h3>Manage Available Slots</h3>
            <label htmlFor="newSlot">Pick a date and time:</label>
            <input
                type="datetime-local"
                id="newSlot"
                value={newSlot}
                onChange={handleDateTimeChange}
            />
            <button onClick={addSlot}>Add Slot</button>
    
            <h4>Available Slots:</h4>
            <ul>
                {availableSlots.map((slot, index) => (
                    // Ensure slot is a valid date before attempting to format it
                    <li key={index}>
                        {slot ? formatSlotDate(slot) : "Invalid Date"}
                    </li>
                ))}
            </ul>
        </div>
    );
    
};

export default TutorScheduler;
