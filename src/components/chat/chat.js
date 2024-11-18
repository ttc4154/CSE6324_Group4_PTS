import "./chat.css"
import { useEffect, useState, useRef } from "react"
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"
import { useChatStore } from "../lib/chatStore"
import { useUserStore } from "../lib/userStore"
import { format } from "timeago.js";

const Chat = () => {
    const[chat, setChat] = useState();
    const [text, setText] = useState("");

    const endRef = useRef(null);

    const {chatId, user} = useChatStore();
    const {currentUser} = useUserStore();

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res)=> {
            setChat(res.data());
        });
        return()=>{
            unSub();
        }
    }, [chatId]);

    useEffect(()=> {
        endRef.current?.scrollIntoView({behavior:"smooth"})
    }, []);

    const handleSend = async () =>{
        if (text === ""){
            return;
        } 

        try{
            await updateDoc(doc(db, "chats", chatId),{
                messages:arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                }),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async (id)=>{
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if(userChatsSnapshot.exists()){
                    const userChatsData = userChatsSnapshot.data();

                    const chatIndex = userChatsData.chats.findIndex((c)=> c.chatId === chatId);

                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = 
                        id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });
            
        }catch(err){
            console.log(err);
        }
    };
    return(
        <div className="chat">
            <div className="top">
                <div className="user">
                    <div className="texts">
                        <span>{user?.displayName}</span>
                    </div>
                </div>
            </div>
            <div className="center">
                { chat?.messages?.map((message) => (
                    <div 
                        className= {
                            message.senderId === currentUser?.id ? "message own" : "message"
                        }
                            key = {message?.createAt}>
                        <div className="texts">
                            <p>{message.text}</p>
                            <span>{format(message.createdAt.toDate())}</span>
                        </div>
                    </div>
                ))}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <input type="text" placeholder="Type a message..."
                    onChange={(e)=>setText(e.target.value)}/>
                <button className="sendButton" onClick={handleSend}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
