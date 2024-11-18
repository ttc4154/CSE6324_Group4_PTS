import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Chat.css';
import Chat from './chat/chat';
import List from './list/list';
import { useUserStore } from './lib/userStore';
import { onAuthStateChanged } from 'firebase/auth';
import { useChatStore } from './lib/chatStore';


const LiveChat = () => {
    const {currentUser, isLoading, fetchUserInfo} = useUserStore();
    const {chatId} = useChatStore();
    
    useEffect(()=> {
        const unSub = onAuthStateChanged(auth, (user)=> {
            fetchUserInfo(user.uid);
        });

        return() => {
            unSub();
        };
    }, [fetchUserInfo]);
    if(isLoading){
        return (
            <div className='loading'>Loading...</div>
        )
    }
    return (
        <div className="live-chat-container">
            <List/>
            {chatId && <Chat/>}
            
        </div>
    );
};
export default LiveChat;