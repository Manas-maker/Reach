import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import ImagesModal from './ImagesModal';
import BookmarkModal from './BookmarkModal';

const ViewCategories = () =>{
    const { type } = useParams();

    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`http://localhost:8000/search/${type}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [type]);
 

    return (
        <div className="category">
            <header id="heads">
                <h1 className="listingCats">
                    <a href="/search/restaurant" className="listingLink">Restaurants</a> 
                    <span className="tab"></span>
                    <a href="/search/grocery" className="listingLink">Groceries</a> 
                    <span className="tab"></span>
                    <a href="/search/laundromats" className="listingLink">Laundromats</a>  
                    <span className="tab"></span>
                    <a href="/search/pg" className="listingLink">PGs</a> 
                    <span className="tab"></span> 
                    <a href="/search/salon" className="listingLink">Salons</a> 
                </h1>
            </header>
            <article>
            <ul className="cards">
            {data.length > 0 ? (
                    data.map((item, index) => (
                        <li className="card" key={index}>
                        <a href={`/listing/${encodeURIComponent(item._id)}`}  id={item._id}>
                            <figure>
                                <img src='/restaurant.jpg'/>
                            </figure>
                            <div className="cardBody">
                                <h2>{item.name}</h2> 
                                <p> {item.tags} </p>
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

        )

}

const ViewListing = () =>{
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [data, setData] = useState([]);
    const [bookmarkResult, setBookmarkResult] = useState([]);
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`http://localhost:8000/listing/${id}`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [id]);

    const viewMore=(images)=>{
        setSelectedImages(images);
        setIsModalOpen(true);
    }

    const businessHours=(hours)=>{
        return (
            <ol className='hoursList'>
              {hours.map(item => (
                    <li key={item.day}> →{item.day}: {item.time}</li>
              ))}
            </ol>
          );
    };

    const viewBookmarks=async()=>{
        try {
            const response = await fetch(`http://localhost:8000/67bdd3903579e268ca94325d/bookmarks`);
            const result = await response.json();
            setBookmarkResult(result);
            setIsBookmarkModalOpen(true);

        } catch (error) {
            console.error('Error fetching items:', error);
        }
    }
    
    return (
        <div id="listing">
            {data && data.length > 0 ? (
                    data.map((item, index) => (
                        <div key={index}>
                        <header>
                            <h1 id="listingTitle">
                                {item.name}
                            </h1>
                        </header>
                        <div>
                        <a id="listingAddress" href={`https://www.google.com/maps?q=${item.location.coordinates[1]},${item.location.coordinates[0]}`}
                        target='blank'>⤷ {item.address}</a>
                        <button type="button" className="submits" onClick={viewBookmarks}>Bookmark</button>
                        <p id="listingTags">{item.tags}</p>
                        </div>
                        <hr className="line"/>
                        <div className="imageContainer" key={index}>
                            <img className="listingImage" src={item.images[0]}/>
                            <img className="listingImage" src={item.images[1]}/>
                            <div className="listingImageContainer">
                                <img className="listingImage" src={item.images[2]} onClick={() => viewMore(item.images)}/>
                            </div>
                        </div>
                        <hr className="line"/>

                        <h3 className="about">About</h3>
                        <h2>Business Hours</h2>
                        {businessHours(item.hours)}
                        <h2>Business Contact</h2>
                        <p className="phone">+91 {item.phone}</p>
                        </div>
                        
                    ))
            ) : (
                <p>Results not found</p>
                )}

                <ImagesModal imageUrls={selectedImages} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
                <BookmarkModal collections={bookmarkResult} listingid={id} isOpen={isBookmarkModalOpen} onClose={() => setIsBookmarkModalOpen(false)} />    
                
        </div>

        )
}

export {ViewCategories, ViewListing}