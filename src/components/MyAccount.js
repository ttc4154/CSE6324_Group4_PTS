import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import '../styles/MyAccount.css'; // Import the CSS for styling

const MyReceipts = ({ userId }) => {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('User ID (Tutor ID):', userId);

        const fetchReceipts = async () => {
            setLoading(true);
            setError(null);

            if (!userId) {
                console.error('Tutor ID is missing.');
                setLoading(false);
                return;
            }

            try {
                const receiptsRef = collection(db, 'tutors', userId, 'receipts');
                const querySnapshot = await getDocs(receiptsRef);

                console.log('Query Snapshot Length:', querySnapshot.docs.length);
                querySnapshot.docs.forEach(doc => {
                    console.log('Document ID:', doc.id);
                    console.log('Document Data:', doc.data());
                });

                const receiptsList = querySnapshot.docs.map((doc) => {
                    const data = doc.data();

                    // Convert Firestore Timestamp to a date string if the 'date' field exists
                    if (data.date && data.date.seconds) {
                        data.date = new Date(data.date.seconds * 1000).toLocaleDateString(); // Format as needed
                    }

                    return data;
                });

                console.log('Receipts:', receiptsList);
                setReceipts(receiptsList);
            } catch (err) {
                console.error('Error fetching receipts:', err);
                setError('Failed to fetch receipts.');
            } finally {
                setLoading(false);
            }
        };

        fetchReceipts();
    }, [userId]);

    if (loading) return <p>Loading receipts...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="my-receipts">
            <h3>My Receipts</h3>
            {receipts.length === 0 ? (
                <p>No receipts available.</p>
            ) : (
                <ul>
                    {receipts.map((receipt, index) => (
                        <li key={index}>
                            <p><strong>Date:</strong> {receipt.date || 'N/A'}</p>
                            <p><strong>Amount:</strong> {receipt.amount || 'N/A'}</p>
                            <p><strong>Payment Method:</strong> {receipt.paymentMethod || 'N/A'}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};


// MyPayment component
const MyPayment = ({ userId }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            setLoading(true);
            setError(null);
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                const userRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const paymentData = userDoc.data().paymentDetails;
                    console.log('Payment Details:', paymentData); // Log payment details
                    setPaymentDetails(paymentData);
                } else {
                    setError('Payment details not found.');
                }
            } catch (err) {
                console.error('Error fetching payment details:', err); // Log the error
                setError('Failed to fetch payment details.');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentDetails();
    }, [userId]);

    if (loading) return <p>Loading payment details...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="my-payment">
            <h3>My Payment</h3>
            {paymentDetails ? (
                <div>
                    <p><strong>Current Balance:</strong> {paymentDetails.balance}</p>
                    <button onClick={() => alert("Make payment functionality will be here.")}>Pay Now</button>
                </div>
            ) : (
                <p>No payment details available.</p>
            )}
        </div>
    );
};

const MyAccount = () => {
    const { userId } = useParams();

    return (
        <div className="my-account">
            <h2>My Account</h2>
            <MyReceipts userId={userId} />
            <MyPayment userId={userId} />
        </div>
    );
};

export default MyAccount;
