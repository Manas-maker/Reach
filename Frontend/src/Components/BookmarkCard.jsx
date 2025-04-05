import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './services/AuthProvider'
import Header from './Header'

const BookmarkCard = () => {
    const { user, loading } = useAuth();
    const { id: userid } = useParams();
    const [data, setData] = useState([]);
    const [bookmarkLoading, setBookmarkLoading] = useState(true)
    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/${userid}/bookmarks`);
                const result = await response.json();
                setData(result);
                setBookmarkLoading(false)
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, [userid]);
    while (loading||bookmarkLoading) {
        //return (<><div class="tenor-gif-embed" data-postid="15773490" data-share-method="host" data-aspect-ratio="0.99375" data-width="100%"><a href="https://tenor.com/view/bee-cute-adorable-fly-wings-gif-15773490">Bee Cute Sticker</a>from <a href="https://tenor.com/search/bee-stickers">Bee Stickers</a></div> <script type="text/javascript" async src="https://tenor.com/embed.js"></script></>)
        return(<h1 style={{marginTop:"50vh", transform:"translateY(-50%)"}}>Loading...</h1>)
    }

    return (
      <>
      <Header/>
        <div className="category">
            <header >
                <h1 id="bookmarksTitle">Bookmarks</h1>
            </header>
            <article>
                <ul className="cards">
                    {data.length > 0 ? (
                        data.map((item, index) => (
                            <li className="card" key={index}>
                                <a href={`/bookmarks/${encodeURIComponent(item._id)}`} id={item._id}>
                                    <figure className="listingFigure">
                                        <img src={'/restaurant.jpg'} alt="Bookmark" />
                                    </figure>
                                    <div className="cardBody">
                                        <h2 className='listingh2'>{item.title}</h2>
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
    );
};

export default BookmarkCard;
