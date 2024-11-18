import {create} from 'zustand'
import {db} from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';


export const useUserStore = create((set) =>({
    currentUser: null,
    isLoading: true,
    fetchUserInfo: async(uid) => {
        if(!uid){
            return set({currentUser:null});
        }
        try{
            let docRef = doc(db, "students", uid);
            let docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                set({currentUser: docSnap.data(), isLoading: false})
            }
            else{
                docRef = doc(db, "tutors", uid);
                docSnap = await getDoc(docRef);
                if(docSnap.exists()){
                    set({currentUser: docSnap.data(), isLoading: false})
                }
                else{
                    set ({currentUser: null, isLoading: true});
                }
            }
        }catch(err){
            console.log(err)
            return set ({currentUser: null, isLoading: true});
        }
    }
}));
