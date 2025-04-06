import { useEffect, useRef, useState } from "react";
import { useAuth } from './services/AuthProvider'; // Import useAuth
import Popup from 'reactjs-popup'; // Import Popup
import Login from './Login'; // Import Login

const AddImage = ({ listingid, onUploadSuccess }) => {
    const widgetRef = useRef(null);
    const [alert, setAlert] = useState(null);
    const { user } = useAuth(); // Get user from AuthContext
    const [openLogin, setOpenLogin] = useState(false); // State for login popup

    useEffect(() => {
        if (!window.cloudinary) return;

        widgetRef.current = window.cloudinary.createUploadWidget(
            {
                cloudName: "dwhfhrczx",
                uploadPreset: "reach-listing-images",
            },
            async (error, result) => {
                if (error) {
                    console.error("Upload Error:", error);
                    return;
                }
                if (result.event === "success") {
                    await updateListingImages(result.info.secure_url);
                    if (onUploadSuccess) {
                        onUploadSuccess();
                    }
                }
            }
        );
    }, []);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const updateListingImages = async (newImageUrl) => {
        try {
            const fetchResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listing/${listingid}`);
            if (!fetchResponse.ok) {
                throw new Error("Failed to fetch existing images.");
            }
            const listingData = await fetchResponse.json();
            const existingImages = listingData[0].images;
            const updatedImages = [...existingImages, newImageUrl];
            console.log(updatedImages);
            const updateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listing/${listingid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ images: updatedImages }),
            });
            if (!updateResponse.ok) {
                throw new Error("Failed to update listing images.");
            }
            console.log("Listing images updated successfully");
        } catch (error) {
            console.error("Error updating images:", error);
        }
    };

    const handleUploadClick = () => {
        if (!user) {
            setOpenLogin(true); // Open login popup if not logged in
        } else {
            widgetRef.current.open(); // Open Cloudinary widget if logged in
        }
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleUploadClick}
                className="listbutton cloudinaryButton addImagesButton"
            >
                Add Images
            </button>
            <Popup open={openLogin} onClose={() => setOpenLogin(false)} modal>
                <Login open={openLogin} setOpen={setOpenLogin} />
            </Popup>
        </div>
    );
};

export default AddImage;