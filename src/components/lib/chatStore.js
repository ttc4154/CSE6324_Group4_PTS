import {create} from 'zustand'
import {db} from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useUserStore } from './userStore';


export const useChatStore = create((set) =>({
    chatId: null,
    user: null,
    changeChat: (chatId, user)=>{
        const currentuser = useUserStore.getState().currentUser

        return set({
            chatId,
            user,
        })
    }

}));
