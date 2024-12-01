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
    const [editingAd, setEditingAd] = useState(null);

    useEffect(() => {
        if (!tutorId) {
            console.error("No tutorId provided in URL params");
            return;
        }

        const fetchAds = async () => {
            const docRef = doc(db, 'tutors', tutorId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
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

    const addAd = async () => {
        if (!newAd.trim()) {
            console.error("Ad content cannot be empty");
            return;
        }

        const tutorRef = doc(db, 'tutors', tutorId);
        try {
            await updateDoc(tutorRef, {
                ads: arrayUnion(newAd)
            });
            setAds(prevAds => [...prevAds, newAd]);
            setNewAd('');
        } catch (error) {
            console.error('Error adding ad:', error);
        }
    };

    const deleteAd = async (adToDelete) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete this ad: "${adToDelete}"?`);
        if (!confirmDelete) return;

        try {
            const tutorRef = doc(db, 'tutors', tutorId);
            await updateDoc(tutorRef, {
                ads: arrayRemove(adToDelete)
            });
            setAds(prevAds => prevAds.filter(ad => ad !== adToDelete));
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    };

    const startEditingAd = (ad) => {
        setEditingAd(ad);
        setNewAd(ad);
    };

    const saveEditedAd = async () => {
        if (!newAd || !editingAd) return;

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

        setAds(updatedAds);
        setNewAd('');
        setEditingAd(null);
    };

    const cancelEditing = () => {
        setNewAd('');
        setEditingAd(null);
    };

    const handleInputChange = (e) => {
        setNewAd(e.target.value);
    };

    return (
        <div className="my-tutor-ads">
            <h1>My Tutor Ads</h1>
            <label htmlFor="newAd">Write a new ad:</label>
            <textarea
                id="newAd"
                value={newAd}
                onChange={handleInputChange}
                placeholder="Type your ad content here..."
                rows="5" // You can adjust the number of visible rows
            />
            {editingAd ? (
                <div>
                    <button onClick={saveEditedAd}>Save Edit</button>
                    <button onClick={cancelEditing}>Cancel</button>
                </div>
            ) : (
                <button onClick={addAd}>Add Ad</button>
            )}
    
            <ul>
                {ads.map((ad, index) => (
                    <li key={index}>
                        <pre>{ad}</pre> {/* Use <pre> to preserve formatting for displaying ads */}
                        <button onClick={() => startEditingAd(ad)}>Edit</button>
                        <button onClick={() => deleteAd(ad)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyTutorAds;
