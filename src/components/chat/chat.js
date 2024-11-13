import "./chat.css"
import phone from "./phone.png"
import info from "./info.png"
import video from "../list/userInfo/video.png"
import { useState } from "react"
const Chat = () => {
    const [text, setText] = useState("")
    return(
        <div className="chat">
            <div className="top">
                <div className="user">
                    <div className="texts">
                        <span>Jane Doe</span>
                        <p>Hello</p>
                    </div>
                </div>
                <div className="icons">
                    <img src={phone} alt=""></img>
                    <img src={video} alt=""></img>
                    <img src={info} alt=""></img>
                </div>
            </div>
            <div className="center">

            </div>
            <div className="bottom">
                <input type="text" placeholder="Type a message..."
                    onChange={e=>setText(e.target.value)}/>
                <button className="sendButton">Send</button>
            </div>
        </div>
    )
}

export default Chat
