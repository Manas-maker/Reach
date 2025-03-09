import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";


const BookmarkList = () => {
  const { id } = useParams();
  const [data, setData] = useState([]);

  useEffect(() => {
      const fetchItems = async () => {
          try {
              const response = await fetch(`http://localhost:8000/bookmarks/${id}`);
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
                                      <img src='/restaurant.jpg' alt="image" />
                                  </figure>
                                  <div className="cardBody">
                                      <h2 className="listingh2">{item.name}</h2>
                                      <p className="listingParagraph"> {item.tags} </p>
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
};
export default BookmarkList;
