import { useEffect, useState } from "react"
import "./chatList.css"
import plus from "./plus.png"
import search from "./search.png"
import minus from "./minus.png"
import NewChat from "./newChat/newChat"
import { useUserStore } from "../../lib/userStore"
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore"
import { db } from "../../../firebase"
import { useChatStore } from "../../lib/chatStore"
const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [addMode, setAddMode] = useState(false);
    const [input, setInput] = useState("");

    const { currentUser } = useUserStore();
    const { chatId, changeChat } = useChatStore();

    useEffect(() => {
        const unSub = onSnapshot(
        doc(db, "userchats", currentUser.id),
        async (res) => {
            const items = res.data().chats;

            const promises = items.map(async (item) => {
            const userDocRef = doc(db, "students", item.receiverId);
            const userDocSnap = await getDoc(userDocRef);
            
            if(!userDocSnap.exists()){
                console.log("Did not find user")
            }
            const user = userDocSnap.data();

            return { ...item, user };
            });

            const chatData = await Promise.all(promises);

            setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        }
        );

        return () => {
        unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {
        const userChats = chats.map((item) => {
        const { user, ...rest } = item;
        return rest;
        });
  
        const chatIndex = userChats.findIndex(
        (item) => item.chatId === chat.chatId
        );

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);

        try {
        await updateDoc(userChatsRef, {
            chats: userChats,
        });
        changeChat(chat.chatId, chat.user);
        } catch (err) {
        console.log(err);
        }
    };

    const filteredChats = chats.filter((c) =>
        c.user.username.toLowerCase().includes(input.toLowerCase())
    );

    return (
        <div className="chatList">
        <div className="search">
            <div className="searchBar">
            <img src={search} alt="" />
            <input
                type="text"
                placeholder="Search"
                onChange={(e) => setInput(e.target.value)}
            />
            </div>
            <img
            src={addMode ? minus : plus}
            alt=""
            className="add"
            onClick={() => setAddMode((prev) => !prev)}
            />
        </div>
        {filteredChats.map((chat) => (
            <div
            className="item"
            key={chat.chatId}
            onClick={() => handleSelect(chat)}
            style={{
                backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
            }}
            >
            <div className="texts">
                <span>
                    {chat.user.username}
                </span>
                <p>{chat.lastMessage}</p>
                </div>
            </div>
        ))}

        {addMode && <NewChat />}
        </div>
    );
};
  
  export default ChatList;