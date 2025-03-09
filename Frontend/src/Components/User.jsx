import { useState } from 'react'
import { useAuth } from './services/AuthProvider'
import 'reactjs-popup/dist/index.css';
import './Register.css'
import './User.css'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const User = ({ open, setOpen }) =>{
    const navigate = useNavigate()
    const {user, loading, login} = useAuth();
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
        const token = user.token
        console.log(JSON.stringify({name, email, phoneNo, currentPassword, newPassword, token}))
        try {
            const user = await fetch("http://localhost:8000/users", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({name, email, phoneNo, currentPassword, newPassword, token}), 
            }).then((res) => res.json());
            login(user)
            navigate('/');
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
                    <input type="text" placeholder="Email" value={ email } onChange={({target})=>setEmail(target.value)} name="userEmail" />
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
                <button type="click" onClick={userUpdate}>Update User</button>

            </form>
        </div>

    )
}

export default User