import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase'; // Your Firebase configuration
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const MessageInbox = () => {
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState('');
    const [senders, setSenders] = useState({}); // State to store senders' displayNames

    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const uid = user.uid; // Use the current user's UID for querying messages

            const fetchMessages = async () => {
                try {
                    // Fetch messages where receiverId is the current user's UID
                    const messagesCollection = collection(db, 'messages');
                    const q = query(
                        messagesCollection,
                        where('receiverId', '==', uid),
                        orderBy('timestamp', 'desc')
                    );
                    const messagesSnapshot = await getDocs(q);
                    const messagesList = messagesSnapshot.docs.map(doc => doc.data());

                    // Log the messages to debug
                    console.log('Fetched Messages:', messagesList);

                    // Fetch senders' displayNames
                    const senderIds = [...new Set(messagesList.map(message => message.senderId))];
                    console.log('Sender Ids to fetch:', senderIds); // Log the unique senderIds

                    const sendersList = await Promise.all(senderIds.map(async (senderId) => {
                        // Log each senderId for debugging
                        console.log('Fetching sender with senderId:', senderId);

                        let senderName = 'Unknown';
                        try {
                            // Query the students collection
                            const studentQuery = query(collection(db, 'students'), where('uid', '==', senderId));
                            const studentSnapshot = await getDocs(studentQuery);
                            console.log('Student Snapshot:', studentSnapshot); // Log the student snapshot
                            if (!studentSnapshot.empty) {
                                senderName = studentSnapshot.docs[0].data().displayName || 'No Name Available';
                                console.log('Found student sender:', senderName);
                            } else {
                                // If not found in students, check the tutors collection
                                const tutorQuery = query(collection(db, 'tutors'), where('uid', '==', senderId));
                                const tutorSnapshot = await getDocs(tutorQuery);
                                console.log('Tutor Snapshot:', tutorSnapshot); // Log the tutor snapshot
                                if (!tutorSnapshot.empty) {
                                    senderName = tutorSnapshot.docs[0].data().displayName || 'No Name Available';
                                    console.log('Found tutor sender:', senderName);
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching sender data:', error);
                        }

                        return { senderId, senderName };
                    }));

                    // Map senders' displayNames to messages
                    const sendersMap = sendersList.reduce((acc, { senderId, senderName }) => {
                        acc[senderId] = senderName;
                        return acc;
                    }, {});

                    setSenders(sendersMap); // Store senders' displayNames in state
                    setMessages(messagesList); // Set messages with the sender's UID
                } catch (error) {
                    setError('Error fetching messages: ' + error.message);
                    console.error(error);
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
                        <p>
                            {/* Display sender's displayName instead of senderId */}
                            {senders[message.senderId] || 'Unknown Sender'}: {message.messageBody}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MessageInbox;
