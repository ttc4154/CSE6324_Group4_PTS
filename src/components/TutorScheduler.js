import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import '../styles/TutorScheduler.css';

const TutorScheduler = () => {
    const { userId: tutorId } = useParams();
    console.log("Tutor ID from URL params:", tutorId);

    const [newSlot, setNewSlot] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [editingSlot, setEditingSlot] = useState(null); // To track which slot is being edited

    // Fetch available slots from Firestore
    useEffect(() => {
        const fetchSlots = async () => {
            if (!tutorId) {
                console.error("No tutorId provided");
                return;
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
            if (!newSlot) {
                console.error("newSlot must be a valid date string");
                return;
            }

            if (!tutorId) {
                console.error("TutorId is undefined or invalid");
                return;
            }

            const tutorRef = doc(db, 'tutors', tutorId);
            const tutorDoc = await getDoc(tutorRef);

            if (!tutorDoc.exists()) {
                console.error("Tutor document does not exist.");
                return;
            }

            const availableSlots = tutorDoc.data().availableSlots || [];

            await updateDoc(tutorRef, {
                availableSlots: arrayUnion(newSlot)
            });

            console.log('Slot added successfully!');
            setAvailableSlots(prevSlots => [...prevSlots, newSlot]);
            setNewSlot(''); // Reset the newSlot input
        } catch (error) {
            console.error('Error adding slot:', error);
        }
    };

    // Function to delete a slot
    const deleteSlot = async (slotToDelete) => {
        try {
            const tutorRef = doc(db, 'tutors', tutorId);
            const tutorDoc = await getDoc(tutorRef);

            if (!tutorDoc.exists()) {
                console.error("Tutor document does not exist.");
                return;
            }

            const availableSlots = tutorDoc.data().availableSlots || [];
            const updatedSlots = availableSlots.filter(slot => slot !== slotToDelete);

            await updateDoc(tutorRef, {
                availableSlots: updatedSlots
            });

            console.log('Slot deleted successfully!');
            setAvailableSlots(updatedSlots); // Update local state to reflect changes
        } catch (error) {
            console.error('Error deleting slot:', error);
        }
    };

    // Function to start editing a slot
    const startEditingSlot = (slot) => {
        setEditingSlot(slot);
        setNewSlot(slot); // Populate the input with the selected slot for editing
    };

    // Function to save the edited slot
    const saveEditedSlot = async () => {
        if (!newSlot || !editingSlot) return;

        try {
            const tutorRef = doc(db, 'tutors', tutorId);
            const tutorDoc = await getDoc(tutorRef);

            if (!tutorDoc.exists()) {
                console.error("Tutor document does not exist.");
                return;
            }

            const availableSlots = tutorDoc.data().availableSlots || [];

            // Remove the old slot and add the new slot
            const updatedSlots = availableSlots.filter(slot => slot !== editingSlot);
            updatedSlots.push(newSlot);

            await updateDoc(tutorRef, {
                availableSlots: updatedSlots
            });

            console.log('Slot updated successfully!');
            setAvailableSlots(updatedSlots); // Update local state to reflect changes
            setNewSlot('');
            setEditingSlot(null); // Reset the editing state
        } catch (error) {
            console.error('Error updating slot:', error);
        }
    };

    // Handle date-time change
    const handleDateTimeChange = (e) => {
        setNewSlot(e.target.value);
    };

    // Function to format the slot date
    const formatSlotDate = (slot) => {
        const date = new Date(slot);
        const formattedDate = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });

        return `${dayOfWeek}, ${formattedDate}, ${formattedTime}`;
    };

    return (
        <div className="tutor-scheduler">
            <h1>Schedules</h1>
            <h4>Manage Available Slots</h4>
            <label htmlFor="newSlot">Pick a date and time:</label>
            <input
                type="datetime-local"
                id="newSlot"
                value={newSlot}
                onChange={handleDateTimeChange}
            />
            {editingSlot ? (
                <button onClick={saveEditedSlot}>Save Edited Slot</button>
            ) : (
                <button onClick={addSlot}>Add Slot</button>
            )}

            <h4>Available Slots:</h4>
            <ul>
                {availableSlots.map((slot, index) => (
                    <li key={index}>
                        {slot ? formatSlotDate(slot) : "Invalid Date"}
                        <button onClick={() => startEditingSlot(slot)}>Edit</button>
                        <button onClick={() => deleteSlot(slot)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TutorScheduler;
