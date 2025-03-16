import { useState } from 'react'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import './Register.css'
import { useAuth } from './services/AuthProvider'
import Register from './Register'; 

const Login = ({ open, setOpen }) => {
    const [password, setPassword] = useState('')
    const [username, setUserName] = useState('')
    const [showRegister, setShowRegister] = useState(false)
    const { login } = useAuth();

    const loginSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await fetch("http://localhost:8000/Login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({username, password}), 
            }).then((res) => res.json());
            if ((open !== null) && (user.username != null)) {
                login(user)
                setOpen(false);
                console.log(user)
            }
        } catch (exception) {
            console.log(exception)
        }
    }
    
    if (showRegister) {
        return <Register open={open} setOpen={setOpen} />
    }
    
    return (
        <div id='formPopup' className="loginForm">
            <form onSubmit={loginSubmit}>
                <h2>Login</h2>
                <fieldset>
                    <input type="text" placeholder="User Name*" value={username} onChange={({target}) => setUserName(target.value)} name="username" />
                    <input type="password" placeholder="Password*" value={password} onChange={({target}) => setPassword(target.value)} name="password" />
                    <p className='formDisclaimer'>Don't have an account to reach?&nbsp;
                        <a href="#" className="redLink" onClick={(e) => { 
                            e.preventDefault(); 
                            setShowRegister(true);
                        }}>
                            Sign Up!
                        </a>
                    </p>
                </fieldset>
                <p className="formDisclaimer">By signing up, confirm that you've read and accepted our <span className="redLink"><a>terms of service</a></span> and <span className="redLink"><a>privacy policy</a></span></p>
                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login