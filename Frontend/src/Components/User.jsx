import { useState } from 'react'
import { Navigate } from 'react-router-dom';
import { useAuth } from './services/AuthProvider'
import 'reactjs-popup/dist/index.css';
import './Register.css'
import './User.css'
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header'

const User = ({ open, setOpen }) =>{
    const navigate = useNavigate()
    const {user, loading, login, logout} = useAuth();
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNo, setPhoneNo] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [profileImage, setProfileImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)


        // Redirect if user is null and not loading
        useEffect(() => {
            if (!loading && user === null) {
                console.log("Redirecting due to null user");
                    navigate('/'); 
            }
        }, [loading, user,navigate]);
    
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
            
            // If user has a profile image URL, fetch and set it as preview
            if (user.profileImageUrl) {
                // For images served from our backend
                // We add a timestamp to prevent caching when the image is updated
                setImagePreview(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}${user.profileImageUrl}`);
            }
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            // Create preview URL for the selected image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const userUpdate = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        const token = user.token;
        
        // Create FormData object to handle file upload
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phoneNo', phoneNo);
        if (currentPassword) formData.append('currentPassword', currentPassword);
        if (newPassword) formData.append('newPassword', newPassword);
        if (profileImage) formData.append('profileImage', profileImage);
        
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/users`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // Don't set Content-Type when using FormData
                },
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update user');
            }
            
            const updatedUser = await response.json();
            login(updatedUser);
            
            // Clear sensitive fields
            setCurrentPassword('');
            setNewPassword('');
            setProfileImage(null);
            
            // Update image preview with the new URL if available
            if (updatedUser.profileImageUrl) {
                setImagePreview(`http://localhost:8000${updatedUser.profileImageUrl}?t=${new Date().getTime()}`);
            }
            
            // Show success message
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert(`Update failed: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const userDelete = async (e) => {
        e.preventDefault();
        const token = user.token;
        const username = user.username;
        const confirmation = window.prompt("Type DELETE to delete your account");
        
        if (confirmation === "DELETE") {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/users`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({username}), 
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete user');
                }
                
                await response.json();
                logout();
                navigate('/');
            } catch (error) {
                console.error('Error deleting user:', error);
                alert(`Delete failed: ${error.message}`);
            }
        }
    };
    
    return (
        <>
        <Header />

        <div className="userFormPopup" id='formPopup'>
            <form onSubmit={userUpdate}>
                <div className="userFormCont">
                    <div id='userFormLeft'>
                        <h2>{user ? user.username : "Loading..."}</h2>
                        <fieldset>
                            <label htmlFor="userFullName">First and Last Name</label>
                            <input type="text" value={name} onChange={({target}) => setName(target.value)} name="userFullName" />
                            <label htmlFor="userEmail">Email</label>
                            <input type="text" placeholder="Email" value={email} onChange={({target}) => setEmail(target.value)} name="userEmail" />
                            <label htmlFor="userPhone">Phone No.</label>
                            <input type="text" placeholder="Phone No." value={phoneNo} onChange={({target}) => setPhoneNo(target.value)} name="userPhone" />
                        </fieldset>
                        <fieldset>
                            <h3>Change Password</h3>
                            <label htmlFor="currentPassword">Current Password</label>
                            <input type="password" name="currentPassword" value={currentPassword} onChange={({target}) => setCurrentPassword(target.value)} id="currentPassword" />
                            <label htmlFor="newPassword">New Password</label>
                            <input type="password" name="newPassword" value={newPassword} onChange={({target}) => setNewPassword(target.value)} id="newPassword" />
                        </fieldset>
                    </div>
                    <div id='userFormRight'>
                        <div className='imageUploadContainer'>
                            {imagePreview ? (
                                <div className="profileImagePreview">
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile Preview" 
                                        className="profileImage"
                                    />
                                </div>
                            ) : (
                                <div className='imagePlaceholder'></div>
                            )}
                            <div className="imageInputContainer">
                                <label htmlFor="profileImage" className="imageInputLabel">Choose Profile Image</label>
                                <input 
                                    type="file" 
                                    id="profileImage" 
                                    name="profileImage" 
                                    accept="image/*" 
                                    onChange={handleImageChange} 
                                    className="imageInput"
                                    style={{width:"0px"}}
                                />
                            </div>
                            <button type='button' onClick={()=>{user?navigate(`/${user.id}/bookmarks`):null}}>Bookmarks</button>
                        </div>
                    </div>
                </div>
                <div style={{display:"flex", justifyContent:"center", columnGap:"24px"}}>
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update User'}
                    </button>
                    <button type="button" onClick={userDelete} disabled={isSubmitting}>Delete User</button>

                </div>
            </form>
        </div>
        </>
    );
};

export default User;