import React, { useState, useEffect } from 'react';
import '../styles/Payment.css';

const Payment = ({ currentPoints, price, onSuccess, onError, courseId, onClose }) => {
    const [paymentMethod, setPaymentMethod] = useState('creditCard'); // Default to credit card
    const [creditCard, setCreditCard] = useState('');
    const [nameOnCard, setNameOnCard] = useState('');
    const [address, setAddress] = useState('');
    const [zipcode, setZipcode] = useState('');
    const [cvv, setCvv] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [paypalPassword, setPaypalPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPaid, setIsPaid] = useState(false);

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
        // Mock function. Replace with actual logic
        return false;
    };

    const handlePayment = () => {
        if (paymentMethod === 'creditCard') {
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
            if (!nameOnCard || !address || !zipcode) {
                onError("Please fill in all required fields.");
                return;
            }
        } else if (paymentMethod === 'paypal') {
            if (!paypalEmail || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(paypalEmail)) {
                onError("Invalid PayPal email address.");
                return;
            }
            if (!paypalPassword) {
                onError("Please enter your PayPal password.");
                return;
            }
        }

        if (currentPoints < price) {
            onError("You do not have enough points to complete this transaction.");
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
        if (onClose) {
            onClose();
        } else {
            window.history.back();
        }
    };

    return (
        <div className="payment-container">
            <h3>Virtual Payment</h3>
            <p>Current Points: {currentPoints}</p>
            <p>Price: {price} Points</p>

            <div className="payment-method">
                <label className="radio-label">
                Credit Card
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="creditCard"
                        checked={paymentMethod === 'creditCard'}
                        onChange={() => setPaymentMethod('creditCard')}
                    />
                    
                </label>
                <label className="radio-label">
                PayPal
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                    />
                    
                </label>
            </div>

            {paymentMethod === 'creditCard' && (
                <div className="credit-card-fields">
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
                </div>
            )}

            {paymentMethod === 'paypal' && (
                <div className="paypal-fields">
                    <input
                        type="email"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="PayPal Email"
                        required
                    />
                    <input
                        type="password"
                        value={paypalPassword}
                        onChange={(e) => setPaypalPassword(e.target.value)}
                        placeholder="PayPal Password"
                        required
                    />
                </div>
            )}

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
