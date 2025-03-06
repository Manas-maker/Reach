import { useEffect, useRef, useState } from "react";

const ImageUpload = ({ setImages, images }) => {
    const widgetRef = useRef(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (!window.cloudinary) return;

        widgetRef.current = window.cloudinary.createUploadWidget(
            { cloudName: "dwhfhrczx", uploadPreset: "reach-review-images" },
            (error, result) => {
                if (error) {
                    console.error("Upload Error:", error);
                    return;
                }
                if (result.event === "success") {
                    setImages((prevImages) => {
                        if (prevImages.length >= 15) {
                            showAlert("You can only upload up to 15 images.", "warning");
                            return prevImages;
                        }
                        return [...prevImages, result.info.secure_url];
                    });
                }
            }
        );
    }, []);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleUploadClick = () => {
        if (!widgetRef.current) {
            widgetRef.current = window.cloudinary.createUploadWidget(
                { cloudName: "dwhfhrczx", uploadPreset: "reach-listing-images" },
                (error, result) => {
                    if (error) {
                        console.error("Upload Error:", error);
                        return;
                    }
                    if (result.event === "success") {
                        setImages((prevImages) => {
                            if (prevImages.length >= 15) {
                                showAlert("You can only upload up to 15 images.", "warning");
                                return prevImages;
                            }
                            return [...prevImages, result.info.secure_url];
                        });
                    }
                }
            );
        }
    
        if (images.length >= 15) {
            showAlert("A maximum of 15 images can be uploaded.", "warning");
            return;
        }
    
        // Open the widget so users can upload images
        widgetRef.current.open();
    };
    
    

    const handleDeleteImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    return (
        <div>
            <button
                type="button"
                onClick={handleUploadClick}
                className="cloudinaryButton"
                disabled={images.length >= 15}
            >
                Upload Images
            </button>

            <div className="uploaded-listing-images">
                {images.map((url, index) => (
                    <div key={index} className="image-preview">
                        <img src={url} alt={`Uploaded ${index + 1}`} />
                        <div className="remove-image-listing-button">
                            <button onClick={() => handleDeleteImage(index)}>Remove</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="alert-box">
                {alert && <div className={`alert ${alert.type}`}>{alert.message}</div>}
            </div>
        </div>
    );
};

export default ImageUpload;
