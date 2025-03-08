import { useState } from 'react'
import { useAuth } from './services/AuthProvider'
import 'reactjs-popup/dist/index.css';
import './Register.css'
import './User.css'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const User = ({ open, setOpen }) =>{
    const navigate = useNavigate()
    const {user, loading} = useAuth();
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNo, setPhoneNo] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')

        // Redirect if user is null and not loading
        useEffect(() => {
            if (!loading && user === null) {
                navigate('/'); // Redirect to landing page
            }
        }, [user, loading, navigate]);
    
        // Set form values once user data is available
        useEffect(() => {
            if (user) {
                setName(user.name || '');
                setEmail(user.email || '');
                setPhoneNo(user.phoneNo || '');
            }
        }, [user]);

    const userUpdate = async (e)=>{
        e.preventDefault();
        try {
            const user = await fetch("http://localhost:8000/User", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, email, phoneNo, currentPassword, newPassword}), 
            }).then((res) => res.json());
            if ( (open !== null) && (user.username != null)){
                window.localStorage.setItem('loggedUser', JSON.stringify(user))
                setOpen(false);
                console.log(user)
            }
        } catch (exception) {
            console.log(exception)
        }
    }
    
    return (
        <div id='formPopup'>
            <form onSubmit={ userUpdate }>
                <div className="userFormCont"><div>
                <h2>{user?user.username:"Loading..."}</h2>
                <fieldset>
                    <label htmlFor="userFullName">First and Last Name</label>
                    <input type="text" value={ name } onChange={({target})=>setName(target.value)} name="userFullName" />
                    <label htmlFor="userEmail">Email</label>
                    <input type="text" placeholder="Email" value={ email } onChange={({target})=>setEmail(target.value)}name="userEmail" />
                    <label htmlFor="userPhone">Phone No.</label>
                    <input type="text" placeholder="Phone No." value={ phoneNo } onChange={({target})=>setPhoneNo(target.value)}name="userPhone" />
                </fieldset>
                <fieldset>
                    <h4>Change Password</h4>
                    <label htmlFor="currentPassword">Current Password</label>
                    <input type="password" name="currentPassword" value={ currentPassword } onChange={({target})=>setCurrentPassword(target.value)} id="currentPassword" />
                    <label htmlFor="newPassword">New Password</label>
                    <input type="password" name="newPassword" value={ newPassword } onChange={({target})=>setNewPassword(target.value)} id="newPassword" />
                </fieldset></div><div id='userFormRight'><div className='imagePlaceholder' ></div></div>
                </div>
                <button type="click">Update User</button>

            </form>
        </div>

    )
}

export default User