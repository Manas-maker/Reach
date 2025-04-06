import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from './Header'

const BookmarkList = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
      const fetchItems = async () => {
          try {
              const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/bookmarks/${id}`);
              const result = await response.json();
              setData(result);
          } catch (error) {
              console.error('Error fetching items:', error);
          }
      };
      fetchItems();
  }, [id]);


  return (
    <div className="category">
        <Header />
          <header id="heads">
          {data.title && <h1 id="bookmarkName">{data.title}</h1>}
          </header>
          <article>
              <ul className="cards">
                  {data.listings && data.listings.length > 0 ? (
                      data.listings.map((item, index) => (
                          <li className="card" key={index}>
                              <a href={`/listing/${encodeURIComponent(item._id)}`} id={item._id}>
                                  <figure className='listingFigure'>
                                      <img src={item.images[0]} alt="image" />
                                  </figure>
                                  <div className="cardBody">
                                      <h2 className="listingh2">{item.name}</h2>
                                      <p className="listingParagraph"> {item.tags} </p>
                                  </div>
                              </a>
                                
                          </li>
                      ))
                    ) : (
                        <h1 id='notFound'>You haven't bookmarked anything yet!</h1>
                    )}
                </ul>
            </article>
        </div>
  )
};
export default BookmarkList;
