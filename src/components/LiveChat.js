import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Chat.css';
import Chat from './chat/chat';
import List from './list/list';
import Detail from './detail/detail';

const LiveChat = () => {
    return (
        <div className="live-chat-container">
            <List/>
            <Chat/>
            <Detail/>
        </div>
    );
};
export default LiveChat;