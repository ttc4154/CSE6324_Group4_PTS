import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, getDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import Payment from './Payment'; // Import the Payment component
import '../styles/MyTutorAds.css';

const MyTutorAds = () => {
    const { userId: tutorId } = useParams();
    const [newAd, setNewAd] = useState('');
    const [ads, setAds] = useState([]);
    const [editingAd, setEditingAd] = useState(null);
    const [userPoints, setUserPoints] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [adToPayFor, setAdToPayFor] = useState(null); // Store the ad to pay for

    useEffect(() => {
        if (!tutorId) {
            console.error("No tutorId provided in URL params");
            return;
        }

        const fetchTutorData = async () => {
            const docRef = doc(db, 'tutors', tutorId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAds(docSnap.data().ads || []);
                    setUserPoints(docSnap.data().points || 1000); // Default to 1000 if no points
                } else {
                    console.log("No document found for tutorId:", tutorId);
                }
            } catch (err) {
                console.error("Error fetching tutor data:", err);
            }
        };

        fetchTutorData();
    }, [tutorId]);

    const addAd = async () => {
        if (!newAd.trim()) {
            console.error("Ad content cannot be empty");
            return;
        }

        if (userPoints < 10) {
            alert("You do not have enough points to add this ad!");
            return;
        }

        const tutorRef = doc(db, 'tutors', tutorId);
        try {
            await updateDoc(tutorRef, {
                ads: arrayUnion(newAd),
                points: userPoints - 10 // Deduct 10 points for each ad
            });
            setAds(prevAds => [...prevAds, newAd]);
            setUserPoints(prevPoints => prevPoints - 10);
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

    const handlePaymentSuccess = () => {
        alert("Payment Successful! You have added the ad.");
        setUserPoints(prevPoints => prevPoints - 10); // Deduct points after successful payment
        setShowModal(false); // Close the modal after payment
    };

    const handlePaymentError = (message) => {
        alert(message);
    };

    const handlePayNowClick = (ad) => {
        setAdToPayFor(ad); // Set the ad to pay for
        setShowModal(true); // Show the payment modal
    };

    return (
        <div className="my-tutor-ads">
            <h1>My Tutor Ads</h1>

            <div className="new-ad-section">
                <label htmlFor="newAd">Write a new ad:</label>
                <textarea
                    id="newAd"
                    value={newAd}
                    onChange={handleInputChange}
                    placeholder="Type your ad content here..."
                    rows="5"
                />
                {editingAd ? (
                    <div className="action-buttons">
                        <button onClick={saveEditedAd}>Save Edit</button>
                        <button onClick={cancelEditing}>Cancel</button>
                    </div>
                ) : (
                    <button onClick={addAd}>Add Ad</button>
                )}
            </div>

            <h2>Current Points: {userPoints}</h2>

            <ul className="ads-list">
                {ads.map((ad, index) => (
                    <li key={index} className="ad-item">
                        <pre>{ad}</pre>
                        <div className="action-buttons">
                            <button onClick={() => startEditingAd(ad)}>Edit</button>
                            <button onClick={() => deleteAd(ad)}>Delete</button>
                            <button onClick={() => handlePayNowClick(ad)}>Pay Now</button>
                        </div>
                    </li>
                ))}
            </ul>

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
    );
};

export default MyTutorAds;
