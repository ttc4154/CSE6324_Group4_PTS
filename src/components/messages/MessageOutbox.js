import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase'; // Your Firebase configuration
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const MessageOutbox = () => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const uid = user.uid; // Use the current user's UID for querying sent messages

            const fetchMessages = async () => {
                try {
                    const messagesCollection = collection(db, 'messages');
                    const q = query(
                        messagesCollection,
                        where('senderId', '==', uid),
                        orderBy('timestamp', 'desc')
                    );
                    const messagesSnapshot = await getDocs(q);
                    const messagesList = messagesSnapshot.docs.map(doc => doc.data());
                    setMessages(messagesList);
                } catch (error) {
                    setError('Error fetching messages: ' + error.message);
                }
            };

            fetchMessages();
        } else {
            setError('User is not authenticated.');
        }
    }, []);

    return (
        <div>
            {error && <p>{error}</p>}
            <div>
                {messages.map((message, index) => (
                    <div key={index}>
                        <p>{message.receiverId}: {message.messageBody}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageOutbox;
