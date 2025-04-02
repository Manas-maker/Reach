import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Popup } from "reactjs-popup";
import './create-rev.css';
import RevImageUpload from "./RevImageUpload";
import { useAuth } from './services/AuthProvider'
import Header from './Header'
import Login from "./Login";

const CreateReview = () => {
    const { user, loading } = useAuth();

    console.log(user);
        
    const { listingid } = useParams();
    const navigate = useNavigate();
    const [listingName, setListingName] = useState('');
    const [rating, setRating] = useState(0);
    const [header, setHeader] = useState("");
    const [body, setBody] = useState("");
    const [images, setImages] = useState([]);
    const [agree, setAgree] = useState(false);
    const [existingReviewId, setExistingReviewId] = useState(null);
    const [alert, setAlert] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    
    useEffect(() => {
        const fetchListingName = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listings/${listingid}`);
                if (!res.ok) throw new Error(`Error! Status: ${res.status}`);
                const data = await res.json();
                setListingName(data.listingName);
            } catch (error) {
                console.error("Error fetching listing name:", error);
            }
        };
    
        fetchListingName();
    }, [listingid]); // Runs when `listingid` changes
    
         // Redirect if user is null and not loading
        useEffect(() => {
            if (!loading && user === null) {
                navigate('/'); // Redirect to landing page
            }
        }, [user, loading, navigate]);
    
    const fetchUserReview = async () => {
        if (!user) return; // Prevent running if user is not loaded
    
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/reviews/${listingid}/user/${user.id}`);
            if (res.ok) {
                const review = await res.json();
                setRating(review.rating);
                setHeader(review.header);
                setBody(review.body);
                setExistingReviewId(review._id);
                setImages(review.images || []);
            }
        } catch (error) {
            console.error("Error fetching user review:", error);
        }
    };
    
    useEffect(() => {
        if (user) {
            fetchUserReview();
        }
    }, [user]); // Runs when `user` is available    
    
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
    
    const handleRating = (value) => {
        setRating(value);
    };

    const calcRating = (reviews) => {
        const totalVotes = reviews.length;
        const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
        const averageRating = totalVotes > 0 ? (totalRating / totalVotes).toFixed(1) : 0;
        return { averageRating };
    };

    const handleSubmit = async (e) => {
        console.log(e)
        e.preventDefault();
        if(!user?.id) {
            setShowLoginPopup(true);
            return;
        }
        if (!agree) {
            showAlert("You must agree to the review guidelines.", "warning");
            return;
        }
    
        const reviewData = {
            userid: user.id,
            username: user.username,
            listingid: listingid,
            header,
            body,
            images,
            rating
        };
        console.log("Final review data:", reviewData);
    
        try {

            const url = existingReviewId
                ? `http://localhost:8000/update-review/${existingReviewId}`
                : `http://localhost:8000/create-review/${listingid}`;
    
            const method = existingReviewId ? "PATCH" : "POST";
    
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user.token}` },
                body: JSON.stringify(reviewData),
            });
    
            if (response.ok) {
                showAlert(existingReviewId ? "Review Updated" : "Review Posted");
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/reviews/${listingid}`);
                const data = await res.json();
                console.log("Fetched data:", data);
                const averageRating = calcRating(data.reviews);

                const updateResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/updateRating/${listingid}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ rating: averageRating}),
                });
                setTimeout(() => {
                    navigate(`/reviews/${listingid}`);
                }, 2000);
            } else {
                showAlert("Please provide a rating.", "error");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };    

    const handleDelete = () => {
        if (!existingReviewId){
            return;
        }
        setShowPopup(true);
    };

    const confirmDelete = async () => {
        setShowPopup(false);
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/delete-review/${existingReviewId}`, {
                method: "DELETE",
            });
    
            if (response.ok) {
                showAlert("Review deleted.", "success");
                setExistingReviewId(null);
                setRating(0);
                setHeader("");
                setBody("");
                setTimeout(() => {
                    navigate(`/reviews/${listingid}`);
                }, 3000);
            } else {
                showAlert("Failed to delete review.", "error");
            }
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    return (
        <div className="review-container">
            <Header />
            <form className="review-form" onSubmit={handleSubmit}>
                <h1 className="title">{listingName || "Listing"}</h1>
                <h3 className="cre-rev-h3">Rate your experience *</h3>
                <div className="stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= rating ? "filled" : ""} onClick={() => handleRating(star)}>★</span>
                    ))}
                </div>

                <h3 className="cre-rev-h3">Title Your Review</h3>
                <input
                    type="text"
                    placeholder="Reach your review heading here..."
                    value={header}
                    onChange={(e) => setHeader(e.target.value)}
                    className="cre-rev-input"
                />

                <h3 className="cre-rev-h3">Write Your Review</h3>
                <textarea
                    placeholder="Reach your review body here (maximum 250 characters)..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={250}
                    className="cre-rev-textarea"
                ></textarea>

                <div className="image-upload">
                    <h3 className="cre-rev-h3">Add Images (Up to 3)</h3>
                    <RevImageUpload setImages={setImages} images={images} />
                </div>

                <div className="agreement">
                    <div className="checkbox-wrapper-31">
                        <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} />
                        <svg viewBox="0 0 35.6 35.6">
                            <circle className="background" cx="17.8" cy="17.8" r="17.8"></circle>
                            <circle className="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
                            <polyline className="check" points="11.78 18.12 15.55 22.23 25.17 12.87"></polyline>
                        </svg>
                    </div>
                    <div>
                        <span>
                            I certify that my review follows <span style= {{width : "1px"}}/>
                        </span>
                        <Popup className="guide-pop" overlayStyle={{ background: '#34333386' }} trigger= {<a href="#">Reach's review guidelines</a>} position="right center">
                            <div className="guidelines">
                                <h2 className="rev-gui-h2">Reach's Review Guidelines: </h2>
                                <h3 className="rev-gui-h3">1. Reach relevance!</h3>
                                <p className="cre-rev-p">
                                    Accounts placing irrelevant, inappropriate or promotional content, reviews with server names, reviews with similar digital signatures that spam listings or are based on any already disclaimed or informed policies and practices of a listing may be deleted without notice.
                                </p>
                                <h3 className="rev-gui-h3">2. Reach cleanliness!</h3>
                                <p className="cre-rev-p">
                                    Keep foul/abusive/hateful language and threats out of your review. This also includes derogatory comments or indication of a personal vendetta against a business and its associates.
                                </p>
                                <h3 className="rev-gui-h3">3. Reach realness!</h3>
                                <p className="cre-rev-p">
                                    Only one review per listing can be submitted. Kindly don't exaggerate or falsify your experience. Copying others' reviews or photos from Reach or other platforms, will not be tolerated and may be removed/ moderated.
                                </p>
                            </div>
                        </Popup>.
                    </div>
                </div>
                {existingReviewId ? (
                    <div className="button-group">
                        <button className="cre-rev-button" type="submit">UPDATE REVIEW</button>
                        <button type="button" onClick={handleDelete} className="delete-button">DELETE REVIEW</button>
                    </div>
                ) : (
                    <button className="cre-rev-button" type="submit">POST REVIEW</button>
                )}
            </form>
            <Popup open={showPopup} onClose={() => setShowPopup(false)}>
                <div className="delete-popup">
                    <p className="cre-rev-p">Are you sure you want to delete your review? <br /> We'll be sad to see it go!</p>
                    <button className="del-sure" onClick={confirmDelete}>Yes</button>
                    <button className="del-sure" onClick={() => setShowPopup(false)}>No</button>
                </div>
            </Popup>
            <div className="alert-box">
                {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </div>
            <Popup open={showLoginPopup} onClose={() => setShowLoginPopup(false)} modal>
                <Login open={showLoginPopup} setOpen={setShowLoginPopup} />
            </Popup>
        </div>
    );
};

export default CreateReview;