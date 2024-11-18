import React, { useEffect } from 'react';
import { auth } from '../firebase';
import '../styles/Chat.css';
import Chat from './chat/chat';
import List from './list/list';
import { useUserStore } from './lib/userStore';
import { onAuthStateChanged } from 'firebase/auth';
import { useChatStore } from './lib/chatStore';


const LiveChat = () => {
    const {isLoading, fetchUserInfo} = useUserStore();
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