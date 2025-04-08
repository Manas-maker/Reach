import { useState } from 'react';
import './Register.css'
const Register = ({ open, setOpen }) =>{
    const [alert, setAlert] = useState(null);
    const Alert = ({ message, type }) => {
        return (
          <div className={`alert ${type}`}>
            <span>{message}</span>
          </div>
        );
    };

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 30000);
    };
    const registerSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target); 
    
        const formDataObject = {};
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });
    
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/Register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formDataObject), 
            });
            
            if (response.status === 204) {
                showAlert("User already exists", "error");
                return;
            }
            if (response.ok) {
                const user = await response.json();
                
                showAlert("Registration successful", "success");
                
                if (open !== null) {
                    window.localStorage.setItem('loggedUser', JSON.stringify(user));
                    console.log(user);
                    setTimeout(() => setOpen(false), 2000);
                }
            } else {
                showAlert("Registration failed", "error");
            }
        } catch (error) {
            console.error("Registration error:", error);
            showAlert("An error occurred during registration", "error");
        }
    };
    return (
        <div id="formPopup" className="registerForm">
            <form onSubmit={ registerSubmit }>
                <h2>Register User</h2>
                <fieldset>
                    <input type="text" placeholder="First and Last Name*" name="name" required/>
                    <input type="text" placeholder="User Name*" name="username" required/>
                    <input type="password" placeholder="Password*" name="password" required/>
                </fieldset>
                <fieldset>
                    <h3>Contact Info:(choose one)*</h3>
                    <input type="email" placeholder="Email" name="email" />
                    <input type="text" placeholder="Phone No." name="phoneNo" />
                </fieldset>
                <p className="formDisclaimer">By signing up, confirm that you've read and accepted our <span className="redLink"><a href='/tos' target='_blank'>terms of service</a></span> and <span className="redLink"><a href='privacy' target='_blank'>privacy policy</a></span></p>
                <div className="alert-box">
                    {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
                </div>
                <button type="submit" >Register</button>
            </form>
        </div>
    )
}

export default Register