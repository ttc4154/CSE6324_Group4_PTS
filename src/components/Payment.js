import React, { useState } from 'react';
import '../styles/Payment.css';

const Payment = ({ currentPoints, price, onSuccess, onError }) => {
    const [creditCard, setCreditCard] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePayment = () => {
        if (creditCard.length !== 16) {
            onError("Invalid credit card number. Please enter a 16-digit card number.");
            return;
        }

        if (currentPoints < price) {
            onError("You do not have enough points to complete this transaction.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            // Simulate a successful payment
            onSuccess();
            setLoading(false);
        }, 2000);
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
            />
            <button onClick={handlePayment} disabled={loading}>
                {loading ? 'Processing Payment...' : 'Pay Now'}
            </button>
        </div>
    );
};

export default Payment;
