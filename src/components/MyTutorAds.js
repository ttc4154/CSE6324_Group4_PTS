import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import '../styles/MyTutorAds.css';

const MyTutorAds = () => {
    const { userId: tutorId } = useParams();
    console.log("Tutor ID from URL params:", tutorId);

    const [newAd, setNewAd] = useState('');
    const [ads, setAds] = useState([]);
    const [editingAd, setEditingAd] = useState(null); // To track which ad is being edited

    // Fetch tutor's ads from Firestore
    useEffect(() => {
        const fetchAds = async () => {
            if (!tutorId) {
                console.error("No tutorId provided");
                return;
            }

            const docRef = doc(db, 'tutors', tutorId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    console.log('Fetched ads:', docSnap.data().ads);
                    setAds(docSnap.data().ads || []);
                } else {
                    console.log("No document found for tutorId:", tutorId);
                }
            } catch (err) {
                console.error("Error fetching ads:", err);
            }
        };

        fetchAds();
    }, [tutorId]);

    // Function to add a new ad to Firestore
    const addAd = async () => {
        try {
            if (!newAd) {
                console.error("Ad content cannot be empty");
                return;
            }

            if (!tutorId) {
                console.error("TutorId is undefined or invalid");
                return;
            }

            const tutorRef = doc(db, 'tutors', tutorId);
            await updateDoc(tutorRef, {
                ads: arrayUnion(newAd)
            });

            console.log('Ad added successfully!');
            setAds(prevAds => [...prevAds, newAd]);
            setNewAd(''); // Reset the newAd input
        } catch (error) {
            console.error('Error adding ad:', error);
        }
    };

    // Function to delete an ad with confirmation
    const deleteAd = async (adToDelete) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this ad: "${adToDelete}"?`);
        if (!confirmDelete) return;

        try {
            const tutorRef = doc(db, 'tutors', tutorId);
            await updateDoc(tutorRef, {
                ads: arrayRemove(adToDelete)
            });

            console.log('Ad deleted successfully!');
            setAds(prevAds => prevAds.filter(ad => ad !== adToDelete)); // Update local state
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    };

    // Function to start editing an ad
    const startEditingAd = (ad) => {
        setEditingAd(ad);
        setNewAd(ad); // Populate the input with the selected ad for editing
    };

    // Function to save the edited ad
    const saveEditedAd = async () => {
        if (!newAd || !editingAd) return;

        try {
            const tutorRef = doc(db, 'tutors', tutorId);
            const tutorDoc = await getDoc(tutorRef);

            if (!tutorDoc.exists()) {
                console.error("Tutor document does not exist.");
                return;
            }

            const updatedAds = ads.map(ad => (ad === editingAd ? newAd : ad));

            await updateDoc(tutorRef, {
                ads: updatedAds
            });

            console.log('Ad updated successfully!');
            setAds(updatedAds); // Update local state
            setNewAd('');
            setEditingAd(null); // Reset the editing state
        } catch (error) {
            console.error('Error updating ad:', error);
        }
    };

    // Function to cancel editing
    const cancelEditing = () => {
        setNewAd('');
        setEditingAd(null);
    };

    // Handle input change
    const handleInputChange = (e) => {
        setNewAd(e.target.value);
    };

    return (
        <div className="my-tutor-ads">
            <h1>My Tutor Ads</h1>
            <h4>Manage Your Advertisements</h4>
            <label htmlFor="newAd">Write a new ad:</label>
            <textarea
                id="newAd"
                value={newAd}
                onChange={handleInputChange}
                placeholder="Type your ad content here..."
            />
            {editingAd ? (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button onClick={saveEditedAd}>Save Edited Ad</button>
                    <button onClick={cancelEditing}>Cancel</button>
                </div>
            ) : (
                <button onClick={addAd}>Add Ad</button>
            )}

            <h4>Your Ads:</h4>
            <ul>
                {ads.map((ad, index) => (
                    <li key={index}>
                        <div>{ad}</div>
                        <div style={{ display: 'flex', justifyContent: 'right', gap: '10px' }}>
                            <button onClick={() => startEditingAd(ad)}>Edit</button>
                            <button onClick={() => deleteAd(ad)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyTutorAds;
