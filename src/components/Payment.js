
import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import '../styles/Payment.css';

const Payment = ({ price, onSuccess, onError, isNavbarVersion, type }) => {
	const [creditCard, setCreditCard] = useState('');
	const [loading, setLoading] = useState(false);
	const [selectedAmount, setSelectedAmount] = useState(price);
	const [usdPrice, setUsdPrice] = useState(0.99);
	const [user] = useAuthState(auth);
	const [currentPoints, setCurrentPoints] = useState(0);

	const PAYMENT_TYPE_ADD = 'add';
	const PAYMENT_TYPE_SPEND = 'spend';

	// Fetch current points on component load
	useEffect(() => {
    	const fetchUserPoints = async () => {
        	if (user) {
            	try {
                	const userDocRef = doc(db, 'students', user.uid);
                	const userDocSnap = await getDoc(userDocRef);

                	if (userDocSnap.exists()) {
                    	setCurrentPoints(userDocSnap.data().money || 0);
                	} else {
                    	console.error('User document does not exist.');
                	}
            	} catch (error) {
                	console.error('Error fetching user points:', error);
            	}
        	}
    	};

    	fetchUserPoints();
	}, [user]);

	const handlePayment = async () => {
    	if (type === PAYMENT_TYPE_ADD) {
        	if (creditCard.length !== 16) {
            	onError('Invalid credit card number. Please enter a 16-digit card number.');
            	return;
        	}
        	if (isNavbarVersion && selectedAmount === 0) {
            	onError('Please select an amount to add.');
            	return;
        	}
    	}

    	if (type === PAYMENT_TYPE_SPEND && currentPoints < price) {
        	onError('Insufficient funds. Buy more points please!');
        	return;
    	}

    	setLoading(true);

    	try {
        	if (user) {
            	const userDocRef = doc(db, 'students', user.uid);
            	const userDocSnap = await getDoc(userDocRef);

            	if (userDocSnap.exists()) {
                	const currentMoney = userDocSnap.data().money || 0;

                	let newMoney;
                	if (type === PAYMENT_TYPE_ADD) {
                    	newMoney = currentMoney + selectedAmount;
                	} else if (type === PAYMENT_TYPE_SPEND) {
                    	newMoney = currentMoney - price;
                	}

                	await updateDoc(userDocRef, { money: newMoney });
                	setCurrentPoints(newMoney); // Update local state
                	onSuccess(type === PAYMENT_TYPE_ADD ? selectedAmount : price);
            	} else {
                	console.error('User document does not exist.');
                	onError('User not found.');
            	}
        	}
    	} catch (error) {
        	console.error('Error processing payment:', error);
        	onError('Payment failed. Please try again.');
    	} finally {
        	setLoading(false);
    	}
	};

	const handleAmountSelection = (amount) => {
    	setSelectedAmount(amount);
	};

	const containerStyle = isNavbarVersion
    	? { backgroundColor: 'white', padding: '20px', borderRadius: '10px' }
    	: {};

    if(window.location.pathname === '/my-courses')
        {
            type = PAYMENT_TYPE_SPEND;
            return (
                <div className="payment-container" style={containerStyle}>
                    <h3>Spend Points</h3>
                    <p>Current Points: {currentPoints}</p>
                    <p>Cost: {price} Points</p>
                    <button onClick={handlePayment} disabled={loading}>
                        {loading ? 'Processing...' : 'Spend Points'}
                    </button>
                </div>
            );
        }
        else if (window.location.pathname === '/Payment')
        {
            type = PAYMENT_TYPE_ADD;
            return (
                <div className="payment-container" style={containerStyle}>
                    <h3>Buy Points</h3>
                    <p>Current Points: {currentPoints}</p>
                    <p>Points to Add: {selectedAmount || price} Points</p>
                    <p>Price: ${usdPrice}</p>
                    {isNavbarVersion && (
                        <div>
                            <button
                                className={`amount-button ${selectedAmount === 100 ? 'selected' : ''}`}
                                onClick={() => {
                                    handleAmountSelection(100);
                                    setUsdPrice(0.99);
                                }}>
                                $0.99 for 100 Points
                            </button>
                            <button
                                className={`amount-button ${selectedAmount === 300 ? 'selected' : ''}`}
                                onClick={() => {
                                    handleAmountSelection(300);
                                    setUsdPrice(1.99);
                                }}>
                                $1.99 for 300 Points
                            </button>
                            <button
                                className={`amount-button ${selectedAmount === 500 ? 'selected' : ''}`}
                                onClick={() => {
                                    handleAmountSelection(500);
                                    setUsdPrice(2.99);
                                }}>
                                $2.99 for 500 Points
                            </button>
                        </div>
                    )}
                    {/* Show credit card input only for purchasing */}
                    <input
                        type="text"
                        value={creditCard}
                        onChange={(e) => setCreditCard(e.target.value)}
                        placeholder="Enter 16-digit card number"
                        maxLength="16"
                    />
                    <button onClick={handlePayment} disabled={loading}>
                        {loading ? 'Processing...' : 'Buy Now'}
                    </button>
                </div>
            );  
        }    
        else{
            
        }  
};

export default Payment;
