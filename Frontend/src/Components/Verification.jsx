import React, {useState} from 'react';
import { useAuth } from './services/AuthProvider';
import Popup from 'reactjs-popup';
import Login from './Login';

const Verification = ({ verifiedCounter, listingid }) => {
    const { user, loading } = useAuth();
    const [verifiedList, setVerifiedList] = useState(verifiedCounter || []);
    const [openLogin, setOpenLogin] = useState(false);

    const checkVerification = async () => {
        if (loading) return;
        
        // If user is not logged in, show login popup instead of redirecting
        if (!user) {
            setOpenLogin(true);
            return;
        }

        if (verifiedList.includes(user.id)) {
            if (verifiedList[0] === user.id) {
                window.alert("You cannot verify this listing!");
            } else {
                window.alert("You have already verified this listing!");
            }
            return;
        }

        try {
            const updatedVerified = [...verifiedList, user.id];

            await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/updateVerification/${listingid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.token}`
                },
                body: JSON.stringify({ verified: updatedVerified })
            });

            setVerifiedList(updatedVerified); 

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            {verifiedList.length === 4 ? (
                <p className="listingParagraph">Verified✅</p>
            ) : (
                <button className='verifyButton' onClick={checkVerification}>Verify Listing</button>
            )}
            <Popup open={openLogin} onClose={() => setOpenLogin(false)} modal>
                <Login open={openLogin} setOpen={setOpenLogin}/>
            </Popup>
        </>
    );
};

export default Verification;