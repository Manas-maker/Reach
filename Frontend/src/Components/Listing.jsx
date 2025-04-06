import React, {useState, useEffect} from 'react';
import { useNavigate, useParams } from "react-router-dom";
import ImagesModal from './ImagesModal';
import BookmarkModal from './BookmarkModal';
import AddImage from './AddImage';
import ListingReviews from './ListingReviews';
import { useAuth } from './services/AuthProvider'
import Header from './Header'
import Verification from './Verification';
import Login from "./Login";
import Popup from 'reactjs-popup';
import LoadingScreen from './LoadingScreen';

const ViewCategories = () =>{
    
    const { type } = useParams();

    const [data, setData] = useState([]);
    const [listLoading, setListLoading] = useState(true);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/search/${type}`);
                const result = await response.json();
                setData(result);
                setListLoading(false)
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
        
    }, [type]);
 
    while (listLoading) {
        return (<LoadingScreen/>)
    }
    return (
        <>
        <Header/>
        <div className="category">
            <header id="heads">
                <h1 className="listingCats">
                    <a href="/search/restaurant" className="listingLink">Restaurants</a> 
                    <span className="tab"></span>
                    <a href="/search/grocery" className="listingLink">Groceries</a> 
                    <span className="tab"></span>
                    <a href="/search/laundromat" className="listingLink">Laundromats</a>  
                    <span className="tab"></span>
                    <a href="/search/pg" className="listingLink">PGs</a> 
                    <span className="tab"></span> 
                    <a href="/search/salon" className="listingLink">Salons</a> 
                </h1>
            </header>
            <article className='listArticle'>
            <ul className="cards">
            {data.length > 0 ? (
                    data.map((item, index) => (
                        <li className="card" key={index}>
                        <a href={`/listing/${encodeURIComponent(item._id)}`}  id={item._id}>
                            <figure className='listingFigure'>
                                <img src={item.images[0]}/>
                            </figure>
                            <div className="cardBody">
                                <div className='listingTop'>
                                <h2 className="listingh2">{item.name}</h2> 
                                <span className='spanRating'>{item.rating? `${item.rating}★`:"--"}</span>
                                </div>                            
                                <p className='listingParagraph'> {item.tags} </p>
                            </div>
                        </a>
                        </li>
                        
                    ))
            ) : (
                <h1 id='notFound'>No results found!</h1>
                )}
            </ul>
            </article>
        </div>
        </>

        )

}

const ViewListing = () =>{
    const navigate = useNavigate();
    const { user,loading } = useAuth();
    const [listLoading, setListLoading] = useState(true);
    const { listid } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [data, setData] = useState([]);
    const [bookmarkResult, setBookmarkResult] = useState([]);
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
    const [openLogin, setOpenLogin] = useState(false)
    
    console.log(user);
    console.log("check")
    useEffect(()=>{
        console.log(typeof(listid));
        const fetchItems = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listing/${listid}`);
                const result = await response.json();
                console.log(result)
                setListLoading(false);
                setData(result);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    },[]);

    while (listLoading) {
        return (<LoadingScreen/>)
    }

    const viewMore=(images)=>{
        setSelectedImages(images);
        setIsModalOpen(true);
    }

    const businessHours=(hours)=>{
        if (!hours || hours.length === 0) {
            return <p className='listingParagraph'>No business hours available.</p>;
        }
        return (
            <ol className='hoursList'>
              {hours.map(item => (
                    <li key={item.day}> →{item.day}: {item.time}</li>
              ))}
            </ol>
          );
    };

    const viewBookmarks = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!user) {
            setOpenLogin(true); // Open login popup
            return;
        }
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/${user.id}/bookmarks`);
            const result = await response.json();
            setBookmarkResult(result);
            setIsBookmarkModalOpen(true);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };
    

    const getRatingColour = (rating) => {
        if (!rating){
            return 'hsl(0, 0%, 60%)'; 
        }
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

    const handleAddReviewClick = () => {
        if (!user) {
            setOpenLogin(true);
        } else {
            window.open(`/create-review/${listid}`, '_blank');
        }
    };

    const handleSuggestChange = () => {
        if (!user) {
            setOpenLogin(true);
        } else {
            navigate(`/updateListing/${listid}`);
        }
    }

    const deleteListing = async() => {
        if (window.confirm("Do you want to delete this listing?")) {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listing/${listid}`, {
                    method: "DELETE",
                });
        
                if (response.ok) {
                    window.alert("Listing deleted!");
                    navigate('/')
                } else {
                    window.alert("Failed to delete listing!");
                }
            } catch (error) {
                console.error("Error deleting review:", error);
            }
            console.log("Action executed!");
        }
        
    }

    return (
        <div id="listing">
            <Header/>
            {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <div style={{display:"flex", flexDirection:"column"}} key={index}>
                        <header>
                            <div id='titleRating'>
                            <h1 id="listingTitle">
                                {item.name}
                            </h1>
                            <span className="rating-box" style={{ backgroundColor: getRatingColour(item.rating) }}>
                                {item.rating? item.rating:"--"}
                            </span>
                            </div>
                        </header>
                        <div>
                            
                        <a id="listingAddress" href={`https://www.google.com/maps?q=${item.location.coordinates[1]},${item.location.coordinates[0]}`}
                        target='blank'>⤷ {item.address}</a>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                        <p id="listingTags">{item.tags}</p>
                        <button type="button" className="listbutton submits bookmarkButton" onClick={viewBookmarks}>Bookmark</button>
                        </div>
                            <div style={{display:"flex", justifyContent:"space-between"}}>
                        <Verification verifiedCounter={item.verified} listingid={listid}/>
                        <button className='verifyButton' onClick={handleSuggestChange}>Suggest a change</button>
                            </div>
                        </div>
                        <div className='imageSection'>
                        <hr className="line"/>
                        <div className="imageContainer" key={index}>
                            <img className="listingImage" src={item.images[0]}/>
                            <img className="listingImage" src={item.images[1]}/>
                            <div className="listingImageContainer">
                                <img className="listingImage" src={item.images[2]} onClick={() => viewMore(item.images)}/>
                            </div>
                        </div>
                        <AddImage listingid={listid} onUploadSuccess={() => {
                                fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listing/${listid}`)
                                .then(response => response.json())
                                .then(result => setData(result))
                                .catch(error => console.error("Error refetching listing", error))
                            }}/>
                        <hr className="line"/>
                        </div>
                        <h3 className="about">About</h3>
                        <h2 className='listingh2'>Business Hours</h2>
                        {businessHours(item.hours)}
                        <h2 className='listingh2'>Business Contact</h2>
                        <p className="listingParagraph phone">{item.phone? "+91 "+item.phone:"No business contact provided."}</p>
                        <h2 className='listingh2'>Reviews</h2>
                        <ListingReviews listingid={listid}/>
                        <br/>
                        <div className='listReviewButtons'>
                        <button type='button' className='listbutton listAddReview' 
                        onClick={handleAddReviewClick}>Add a review</button>
                        <button type='button' className='listbutton' 
                        onClick={() => window.open(`/reviews/${listid}`, '_blank')}>Reach more reviews</button>
                        {user && user.role=="admin"?<button type='button' className='listbutton delListingButton' onClick={deleteListing}>Delete Listing</button>:console.log("hehe")}
                        </div>
                        
                        </div>
                        
                    ))
            ) : (
                <p>Results not found</p>
                )}

                <ImagesModal imageUrls={selectedImages} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                <BookmarkModal collections={bookmarkResult} setCollections={setBookmarkResult} listingid={listid} isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />   
                <Popup open={openLogin} onClose={() => setOpenLogin(false)} modal>
                    <Login open={openLogin} setOpen={setOpenLogin}/>
                </Popup>
     
                
        </div>

        )
}

export {ViewCategories, ViewListing}