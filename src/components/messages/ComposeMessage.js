import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase'; // Assuming you have a Firebase config
import { addDoc, collection, getDocs } from 'firebase/firestore';
import '../../styles/Messages.css';

const ComposeMessage = () => {
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [receiverId, setReceiverId] = useState('');  // State to store selected receiver
    const [users, setUsers] = useState([]);  // State to store list of users

    // Fetch users for the dropdown
    useEffect(() => {
        const fetchUsers = async () => {
            const auth = getAuth();
            const user = auth.currentUser;

            if (user) {
                try {
                    // Query to fetch the list of users (for receiver selection)
                    const studentsSnapshot = await getDocs(collection(db, 'students'));
                    const tutorsSnapshot = await getDocs(collection(db, 'tutors'));
                    const usersList = [
                        ...studentsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            name: doc.data().displayName || 'No Name Available',  // Accessing displayName
                        })),
                        ...tutorsSnapshot.docs.map(doc => ({
                            id: doc.id,
                            name: doc.data().displayName || 'No Name Available',  // Accessing displayName
                        }))
                    ];
                    setUsers(usersList);
                } catch (error) {
                    setError('Error fetching users: ' + error.message);
                }
            } else {
                setError('User is not authenticated.');
            }
        };

        fetchUsers();
    }, []);

    // Handle sending message
    const handleSendMessage = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setError('User is not authenticated.');
            return;
        }

        if (!receiverId) {
            setError('Please select a receiver.');
            return;
        }

        if (!newMessage.trim()) {
            setError('Message body cannot be empty.');
            return;
        }

        const uid = user.uid;  // Use the UID for senderId

        try {
            // Send message to Firestore
            await addDoc(collection(db, 'messages'), {
                senderId: uid,
                receiverId: receiverId,
                messageBody: newMessage,
                timestamp: new Date(),
                isRead: false,  // Default to false
            });
            setNewMessage(''); // Clear the message box after sending
            setReceiverId(''); // Clear the receiver selection
        } catch (error) {
            setError('Error sending message: ' + error.message);
        }
    };

    return (
        <div>
            {error && <p>{error}</p>}

            <div>
                <label htmlFor="receiver">Select Receiver</label>
                {users.length === 0 ? (
                    <p>Loading users...</p>  // Or an error message
                ) : (
                    <select
                        id="receiver"
                        value={receiverId}
                        onChange={(e) => setReceiverId(e.target.value)}
                    >
                        <option value="">Select Receiver</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            <div>
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                />
            </div>

            <button onClick={handleSendMessage}>Send</button>
        </div>
    );
};

export default ComposeMessage;
