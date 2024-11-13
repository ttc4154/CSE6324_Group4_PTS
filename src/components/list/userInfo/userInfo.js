import "./userInfo.css"
import edit from "./edit.png"
import more from "./more.png"
import video from "./video.png"

const Userinfo = () => {
    return(
        <div className="userInfo">
            <div className="user">John Doe</div>
                
            <div className="icons">
                <img src={more} alt=""></img>
                <img src={video} alt=""></img>
                <img src={edit} alt=""></img>
            </div>
        </div>
    )
}

export default Userinfo