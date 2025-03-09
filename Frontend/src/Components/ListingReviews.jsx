import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import './reviews.css';

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

const Vote = async (reviewId, voteType, userid, setReviews) => {
    try {
        const res = await fetch(`http://localhost:8000/${reviewId}/update-votes`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userid: userid, votetype: voteType }),
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



const ListingReviews = (listingid) =>{
    const [reviews, setReviews] = useState([]);
    const [ratings, setRatings] = useState({});
    const [averageRating, setAverageRating] = useState(0);
    const [totalVotes, setTotalVotes] = useState(0);
    const [userid, setUserId] = useState('');
    const listid = listingid.listingid;
    console.log(typeof(listid))

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`http://localhost:8000/reviews/${listid}`);
                const data = await res.json();
                setReviews(data.reviews);

                const starDistribution = calcStar(data.reviews);
                setRatings(starDistribution);

                const { averageRating, totalVotes } = calcRating(data.reviews);
                setAverageRating(averageRating);
                setTotalVotes(totalVotes);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };

        fetchReviews();
    }, [])

    if (reviews.length === 0) {
        return <p className='listingParagraph' style={{ marginLeft: "180px" }}>No reviews to reach! </p>;
    } else if (reviews.length<=3){
        return (
            <>
                {reviews.map((review) => (
                    <div key={`${review._id}-${review.upvotes.length}-${review.downvotes.length}`} className="listing-review-card review-card">
                        <div className="user-info">
                            <div className="user-avatar">
                                <FontAwesomeIcon icon={faUser} size="2x" />
                            </div>
                            <div className='rev-cards'>
                                <h3 className='rev-cards-h3'>{review.userid}</h3>
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
                            <button className='vote-button' onClick={() => Vote(review._id, "upvote", userid, setReviews)}>
                                👍 {review.upvotes.length}
                            </button>
                            <button className='vote-button' onClick={() => Vote(review._id, "downvote", userid, setReviews)}>
                                👎 {review.downvotes.length}
                            </button>
                        </div>
                    </div>
                ))}
            </>
        );
    } else {
        return (
            <>
            {reviews.slice(0,3).map((review) => (
                <div key={`${review._id}-${review.upvotes.length}-${review.downvotes.length}`} className="listing-review-card review-card">
                    <div className="user-info">
                        <div className="user-avatar">
                            <FontAwesomeIcon icon={faUser} size="2x" />
                        </div>
                        <div className='rev-cards'>
                            <h3 className='rev-cards-h3'>{review.userid}</h3>
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
                        <button className='vote-button' onClick={() => Vote(review._id, "upvote", userid, setReviews)}>
                            👍 {review.upvotes.length}
                        </button>
                        <button className='vote-button' onClick={() => Vote(review._id, "downvote", userid, setReviews)}>
                            👎 {review.downvotes.length}
                        </button>
                    </div>
                </div>
            ))}
            </>
        );
    }
};

export default ListingReviews