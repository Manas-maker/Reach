import { useEffect, useRef, useState } from "react";

const AddImage = ({ listingid, onUploadSuccess }) => {
    const widgetRef = useRef(null);
    const [alert, setAlert] = useState(null);

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

            const fetchResponse = await fetch(`http://localhost:8000/listing/${listingid}`);
            if (!fetchResponse.ok) {
                throw new Error("Failed to fetch existing images.");
            }
            const listingData = await fetchResponse.json();

            const existingImages = listingData[0].images;
    
            const updatedImages = [...existingImages, newImageUrl];
            console.log(updatedImages)
    
            const updateResponse = await fetch(`http://localhost:8000/listing/${listingid}`, {
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
        widgetRef.current.open();
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleUploadClick}
                className="cloudinaryButton addImagesButton"
            >
                Add Images
            </button>
            <div className="alert-box">
                {alert && <div className={`alert ${alert.type}`}>{alert.message}</div>}
            </div>
        </div>
    );
};

export default AddImage;