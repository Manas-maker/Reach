import "./header.css"
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
const Header =  ()=>{
    const user = null;
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('')
    const submitHandler = (e) =>{
        if (e.key === 'Enter' ){
            navigate(`/search?query=${searchQuery}`)
        }
    }
    return (
        <div id="headerContainer">
            <div id="headerLeft"><input 
                            type="text" 
                            name="search" id="search" placeholder="Search" 
                            value={searchQuery} 
                            onChange={({target})=>setSearchQuery(target.value)}
                            onKeyUp={submitHandler}/>
            </div>
            <ul id="headerRight">
                <li>About Us</li>
                {user === null?<><li>Login</li><li>Sign Up</li></>:<li>User</li>}
            </ul>
        </div>
    )
}

export default Header