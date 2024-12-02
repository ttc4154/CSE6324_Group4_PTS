import React, { useState, useEffect } from 'react';
import '../styles/Payment.css';

const Payment = ({ currentPoints, price, onSuccess, onError, courseId, onClose }) => {
    const [creditCard, setCreditCard] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    const [address, setAddress] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [cvv, setCvv] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false); // State to track if payment is completed

    // Simulate checking if the user has already paid for the course
    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                const paymentStatus = await checkIfPaid(courseId);
                setIsPaid(paymentStatus);
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        };

        checkPaymentStatus();
    }, [courseId]);

    const checkIfPaid = async (courseId) => {
        // This is just a mock function. Replace it with your actual logic
        return false;
    };

    const handlePayment = () => {
        if (creditCard.length !== 16) {
            onError("Invalid credit card number. Please enter a 16-digit card number.");
            return;
        }

        if (cvv.length !== 3) {
            onError("Invalid CVV. Please enter a 3-digit CVV.");
            return;
        }

        if (expirationDate.length !== 5 || !/^\d{2}\/\d{2}$/.test(expirationDate)) {
            onError("Invalid expiration date. Format should be MM/YY.");
            return;
        }

        if (currentPoints < price) {
            onError("You do not have enough points to complete this transaction.");
            return;
        }

        if (!nameOnCard || !address || !zipcode) {
            onError("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            onSuccess();
            setIsPaid(true);
            setLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        // Close the modal and return to the previous page
        if (onClose) {
            onClose(); // Close modal by calling onClose callback
        } else {
            window.history.back(); // Navigate back to the previous page if no onClose callback is provided
        }
    };

    return (
        <div className="payment-container">
            <h3>Virtual Credit Payment</h3>
            <p>Current Points: {currentPoints}</p>
            <p>Price: {price} Points</p>

            <input
                type="text"
                value={creditCard}
                onChange={(e) => setCreditCard(e.target.value)}
                placeholder="Enter 16-digit card number"
                maxLength="16"
                required
            />
            <input
                type="text"
                value={nameOnCard}
                onChange={(e) => setNameOnCard(e.target.value)}
                placeholder="Name on Card"
                required
            />
            <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Billing Address"
                required
            />
            <input
                type="text"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="Zipcode"
                required
            />
            <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVV"
                maxLength="3"
                required
            />
            <input
                type="text"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                placeholder="Expiration Date (MM/YY)"
                maxLength="5"
                required
            />

            <div className="payment-buttons">
                <button onClick={handlePayment} disabled={loading || isPaid}>
                    {loading ? 'Processing Payment...' : isPaid ? 'Already Paid' : 'Pay Now'}
                </button>
                <button onClick={handleCancel} disabled={loading}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default Payment;
