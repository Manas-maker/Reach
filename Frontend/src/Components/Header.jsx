import "./Header.css"
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from './services/AuthProvider'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import Login from "./Login";
import Register from "./Register";
const Header =  ()=>{
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('')
    const [openLogin, setOpenLogin] = useState(false)
    const closeModalLogin = () => setOpenLogin(false)
    const [openRegister, setOpenRegister] = useState(false)
    const closeModalRegister = () => setOpenRegister(false)
    const user = useAuth();
    
    const submitHandler = (e) =>{
        if (e.key === 'Enter' ){
            navigate(`/search?query=${searchQuery}`)
        }
    }
    /*useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedUser')
        if (loggedUserJSON) {
          const user = JSON.parse(loggedUserJSON)
          setUser(user)
        }
      }, [])*/
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
                {(user === null)?<><li onClick={()=> setOpenLogin(o => !o)}>Login</li><li onClick={()=> setOpenRegister(o => !o)} >Sign Up</li></>:<li>{user.username}</li>}
            </ul>
            <Popup open={openLogin} onClose={closeModalLogin} modal><Login open={openLogin} setOpen={setOpenLogin}/></Popup>
            <Popup open={openRegister} onClose={closeModalRegister} modal><Register open={openRegister} setOpen={setOpenRegister}/></Popup>
        </div>
    )
}

export default Header