import { useEffect, useRef, useState } from "react";

const RevImageUpload = ({ setImages, images }) => {
    const widgetRef = useRef(null);
    const [alert, setAlert] = useState(null);
    
    useEffect(() => {
        if (!window.cloudinary) return;
        widgetRef.current = window.cloudinary.createUploadWidget(
            {cloudName: import.meta.env.VITE_CLOUDINARY_CLOUDNAME, uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOADPRESET},
            (error, result) => {
                if (error) {
                    console.error("Upload Error:", error);
                    return;
                }
                if (result.event === "success") {
                    setImages((prevImages) => {
                        if (prevImages.length >= 3) {
                            showAlert("You can only upload up to 3 images.", "warning");
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

    const handleDeleteImage = (index) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        cloudinary.api.delete_resources(images,)
    };

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    if (images.length < 3) {
                        widgetRef.current.open();
                    } else {
                        showAlert("A maximum of 3 images can be uploaded.", "warning");
                    }
                }}
                className="cloudinary-button"
                disabled={images.length >= 3}
            >
                Upload
            </button>

            <div className="uploaded-images">
                {images.map((url, index) => (
                    <div key={index} className="image-preview">
                        <img src={url} alt={`Uploaded ${index + 1}`} />
                        <div className="remove-image-button">
                            <button onClick={(e) => {
                                e.preventDefault()
                                handleDeleteImage(index)
                            }} className="cre-rev-rem-button" type="Button">Remove</button>
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

export default RevImageUpload;