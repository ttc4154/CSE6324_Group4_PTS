import { useState } from "react"
import "./chatList.css"
import plus from "./plus.png"
import search from "./search.png"
import minus from "./minus.png"
const ChatList = () => {
    const [addMode, setAddMode]=useState(false)
    return(
        <div className="chatList">
            <div className="search">
                <div className="searchBar">
                    <img src={search} alt=""></img>
                    <input type="text" placeholder="Search"></input>
                </div>
                <img 
                    src={addMode? minus : plus} 
                    alt="" 
                    className="add"
                    onClick={()=> setAddMode((prev)=> !prev)}
                />
            </div>
            <div className="item">
                <div className="texts">
                    <span>Jane Doe</span>
                    <p>hello</p>
                </div>
            </div>
        </div>
    )
}

export default ChatList