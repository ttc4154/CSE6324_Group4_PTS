// src/components/Messages.js
import React, { useState, useEffect } from 'react';
import { db } from '../../firebase'; // Firebase Firestore import (make sure you have Firestore setup)
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import ComposeMessage from './ComposeMessage';
import MessageInbox from './MessageInbox';
import MessageOutbox from './MessageOutbox';
import '../../styles/Messages.css';

const Messages = () => {
    const [messages, setMessages] = useState([]);
    const [activeView, setActiveView] = useState('inbox'); // Default to inbox view

    // Fetch all messages on component mount
    useEffect(() => {
        const fetchMessages = async () => {
            const messagesCollection = collection(db, 'messages');
            const messagesSnapshot = await getDocs(query(messagesCollection, orderBy('timestamp')));
            const messagesList = messagesSnapshot.docs.map(doc => doc.data());
            setMessages(messagesList);
        };
        fetchMessages();
    }, []);

    return (
        <div className="messages-container">
            <h1>Messages</h1>
            <div className="messages-nav">
    <Link 
        to="#" 
        onClick={() => setActiveView('inbox')}
        className={activeView === 'inbox' ? 'active' : ''}
    >
        Inbox
    </Link>
    <Link 
        to="#" 
        onClick={() => setActiveView('outbox')}
        className={activeView === 'outbox' ? 'active' : ''}
    >
        Outbox
    </Link>
    <Link 
        to="#" 
        onClick={() => setActiveView('compose')}
        className={activeView === 'compose' ? 'active' : ''}
    >
        Compose
    </Link>
</div>

            {/* Conditional rendering of the active view */}
            {activeView === 'inbox' && <MessageInbox messages={messages} />}
            {activeView === 'outbox' && <MessageOutbox messages={messages} />}
            {activeView === 'compose' && <ComposeMessage />}
        </div>
    );
};

export default Messages;
