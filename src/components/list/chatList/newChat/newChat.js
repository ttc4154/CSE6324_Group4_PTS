import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import "./newChat.css"
import { db } from "../../../../firebase";
import { useState } from "react";
import { useUserStore } from "../../../lib/userStore";
const NewChat = () => {
    const {currentUser} = useUserStore();
    const [user, setUser] = useState(null);

    const handleSearch = async (e) =>{
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");

        try{
            const userRef = collection(db, "students");
            const q = query(userRef, where("displayName", "==", username));

            const querySnapShot = await getDocs(q);

            if(!querySnapShot.empty){
                setUser(querySnapShot.docs[0].data());
            }
            else{
                const userRefT = collection(db, "tutors");
                const qT = query(userRefT, where("displayName", "==", username));
                const queryTSnapShot = await getDocs(qT);
                if(!queryTSnapShot.empty){
                    setUser(queryTSnapShot.docs[0].data());
                    
                }
                console.log("Could not find user");
            }
        }catch(err){
            console.log(err);
        }
    };

    const handleAdd = async () => {
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");

        try{
            const newChatRef = doc(chatRef);

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                }),
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                }),
            });
        }catch(err){
            console.log(err);
        }
    };


    return (
        <div className="newChat">
            <form onSubmit={handleSearch}>
                <input type="text" placeholder="Username" name="username"/>
                <button>Search</button>
            </form>
            {user && ( <div className="user">
                <div className="detail">
                    <span>{user.displayName}</span>
                </div>
                <button onClick={handleAdd}>Add User</button>
            </div>)}
        </div>
    );
};

export default NewChat;