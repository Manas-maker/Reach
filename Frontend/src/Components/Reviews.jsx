import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './reviews.css';
import Header from './Header'

const calcRating = (reviews) => {
    const totalVotes = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalVotes > 0 ? (totalRating / totalVotes).toFixed(1) : 0;
    return { averageRating, totalVotes };
};

const calcStar = (reviews) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
        if (review.rating) {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
        }
    });
    return distribution;
};

const Vote = async (reviewId, voteType, username, setReviews) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/${reviewId}/update-votes`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, votetype: voteType }),
        });

        if (res.ok) {
            console.log("Vote updated successfully");
            const updatedReview = await res.json();
            setReviews(prevReviews => prevReviews.map(review => review._id === reviewId ? updatedReview : review));
        } else {
            console.error("Failed to update vote.");
        }
    } catch (error) {
        console.error("Error updating vote:", error);
    }
};

const getRatingColour = (rating) => {
    const stops = [
        [0, 0, 36],   // Red
        [2, 25, 50],  // Orange
        [3.5, 50, 50],// Yellow
        [5, 147, 33]  // Green
    ]; 
    let [r1, h1, l1] = stops[0], [r2, h2, l2] = stops.at(-1);
    for (let i = 0; i < stops.length - 1; i++) {
        if (rating <= stops[i + 1][0]) {
            [r1, h1, l1] = stops[i];
            [r2, h2, l2] = stops[i + 1];
            break;
        }
    }
    const t = (rating - r1) / (r2 - r1 || 1);
    return `hsl(${h1 + t * (h2 - h1)}, 100%, ${l1 + t * (l2 - l1)}%)`;
};

const Reviews = () =>{
    const { listingid } = useParams();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [listingName, setListingName] = useState('');
    const [listingAddress, setListingAddress] = useState('')
    const [loading, setLoading] = useState(true);
    const [ratings, setRatings] = useState({});
    const [filter, setFilter] = useState('most-helpful');
    const [averageRating, setAverageRating] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [username, setUserName] = useState('');

    const handleReviewClick = async () => {
        navigate(`/create-review/${listingid}`);
    };

    const sortedReviews = [...reviews].sort((a, b) => {
        if (filter === "most-helpful") {
            return b.upvotes.length - a.upvotes.length || new Date(b.date) - new Date(a.date);
        }
        if (filter === "highest-rating") {
            return b.rating - a.rating || new Date(b.date) - new Date(a.date);
        }
        if (filter === "lowest-rating") {
            return a.rating - b.rating || new Date(b.date) - new Date(a.date);
        }
        if (filter === "most-recent") return new Date(b.date) - new Date(a.date);
    });    
        
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/reviews/${listingid}`);
                const data = await res.json();
                console.log("Fetched data:", data);
    
                setListingName(data.listingName);
                setListingAddress(data.listingAddress);
                setReviews(data.reviews);
    
                const starDistribution = calcStar(data.reviews);
                setRatings(starDistribution);
    
                const { averageRating, totalVotes } = calcRating(data.reviews);
                setAverageRating(averageRating);
                setTotalVotes(totalVotes);
    
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reviews:', error);
                setLoading(false);
            }
        };
    
        fetchReviews();
    }, [listingid]);
    

    if (loading) {
        return <h3 className='loader'>Reaching reviews...</h3>;
    }
    
    if (reviews.length === 0) {
        return (
            <>
            <Header/>
            <p>No reviews to reach! </p>;
            </>
        )
    } else {
        return (
            <>
            <Header />
            <div className='reviews-page'>
                <div className="listing-header">
                    <div className="row">
                        <h1 className='listname'>{listingName}</h1>
                        <div className="rating-container">
                            <span className="rating-box" style={{ backgroundColor: getRatingColour(averageRating) }}>
                                {averageRating}
                            </span>
                        </div>
                    </div>
                    <div className="row">
                        <h3 className='rev-h3'>{listingAddress}</h3>
                        <p className='rev-p'>{totalVotes} ratings</p>
                    </div>
                    
                </div>
                <div className='review-cont'>
                <h2 className='rev-h2'>Reviews</h2>
                <div className="rating-summary">
                    <div className="rating-bar-container">
                        {Object.entries(ratings).map(([star, count]) => {
                            const totalRatings = Object.values(ratings).reduce((sum, val) => sum + val, 0);
                            const percentage = totalRatings ? (count / totalRatings) * 100 : 0;
                            console.log(`Star: ${star}, Count: ${count}, Total Ratings: ${totalRatings}, Percentage: ${percentage}`);
                            return (
                                <div key={star} className="rating-bar">
                                    <div className="rating-bar-info">
                                        <span>{`★ ${star}`}</span>
                                        {count > 0 && (
                                            <div className="rating-bar-filled" style={{ width: `${percentage}%`}}></div>
                                        )}
                                    </div>
                                    <span className="rating-count">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    <button className="review-button" onClick={handleReviewClick}>Review your experience</button>
                </div>
                </div>

                <div className="reviews">
                    <div className="filter-menu">
                        <p className='filter'>Filter by</p>
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="most-helpful">Most Helpful</option>
                            <option value="highest-rating">Highest Rating</option>
                            <option value="lowest-rating">Lowest Rating</option>
                            <option value="most-recent">Most Recent</option>
                        </select>
                    </div>

                    {sortedReviews.map(review => (
                        <div key={`${review._id}-${review.upvotes.length}-${review.downvotes.length}`} className="review-card">
                            <div className="user-info">
                                <div className="user-avatar">
                                    <FontAwesomeIcon icon={faUser} size="2x" />
                                </div>
                                <div className='rev-cards'>
                                    <h3 className='rev-cards-h3'>{review.username}</h3>
                                    <p className='rev-cards-p'>{new Date(review.date).toLocaleDateString()}</p>
                                    <div className="rating-stars">
                                        {[...Array(5)].map((_, index) => (
                                            <span key={index} className={index < review.rating ? 'filled-star' : 'empty-star'}> ★ </span>
                                        ))}
                                    </div>
                                    <div className='review-box'>
                                        <h4 className='rev-cards-h4'>{review.header || ""}</h4>
                                        <p className='rev-cards-p'>{review.body || ""}</p>
                                        {review.images?.length > 0 && (
                                            <div className="image-container">
                                            {review.images.map((imgSrc, index) => (
                                                <img
                                                    key={index} 
                                                    src={imgSrc} 
                                                    alt={`Review image ${index + 1}`} 
                                                    onClick={() => window.open(imgSrc, "_blank")}
                                                />
                                            ))}
                                        </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="votes">
                                <button className='vote-button' onClick={() => Vote(review._id, "upvote", username, setReviews)}>
                                    👍 {review.upvotes.length}
                                </button>
                                <button className='vote-button' onClick={() => Vote(review._id, "downvote", username, setReviews)}>
                                    👎 {review.downvotes.length}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            </>
        );
    }
};
export default Reviews