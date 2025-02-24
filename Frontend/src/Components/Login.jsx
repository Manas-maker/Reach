import { useState } from 'react'
import './Register.css'
const Login = () =>{
    const [password, setPassword] = useState('')
    const [userName, setUserName] = useState('')
    const loginSubmit = async (e)=>{
        e.preventDefault();

        const user = await fetch("http://localhost:8000/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({username, password}), 
        });
        console.log()
    }
    
    return (
        <div id="formPopup">
            <form onSubmit={ loginSubmit }>
                <h2>Register User</h2>
                <fieldset>
                    <input type="text" placeholder="User Name*" value={ userName } onChange={({target})=>setUserName(target.value)} name="username" />
                    <input type="text" placeholder="Password*" value={ password } onChange={({target})=>setPassword(target.value)}name="password" />
                </fieldset>
                <p className="formDisclaimer">By signing up, confirm that you've read and accepted our <span className="redLink"><a>terms of service</a></span> and <span className="redLink"><a>privacy policy</a></span></p>
                <button type="click" >Login</button>
            </form>
        </div>
    )
}

export default Login 