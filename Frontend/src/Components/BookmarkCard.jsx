import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './services/AuthProvider'

const BookmarkCard = () => {
    const { user } = useAuth();
    const { id: userid } = useParams();
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`http://localhost:8000/${userid}/bookmarks`);
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };
        fetchItems();
    }, [userid]);

    return (
      <>
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
                                        <img src='/restaurant.jpg' alt="Bookmark" />
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
