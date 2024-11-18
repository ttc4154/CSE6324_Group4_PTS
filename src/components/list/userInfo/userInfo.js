import "./userInfo.css"
import { useUserStore } from "../../lib/userStore"

const Userinfo = () => {
    const {currentUser} = useUserStore();
    return(
        <div className="userInfo">
            <div className="user">{currentUser.displayName}</div>
        </div>
    );
};

export default Userinfo;