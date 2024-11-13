import "./list.css"
import ChatList from "./chatList/chatList"
import Userinfo from "./userInfo/userInfo"

const List = () => {
    return(
        <div className="list">
            <Userinfo/>
            <ChatList/>
        </div>
    )
}

export default List