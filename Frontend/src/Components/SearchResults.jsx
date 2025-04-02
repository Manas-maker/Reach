import React, {useState, useEffect} from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from './Header'

const SearchResults = () =>{

    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    
    const [data, setData] = useState([]);
    
        useEffect(() => {
            const fetchItems = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/search?query=${query}`);
                    const result = await response.json();
                    setData(result);
                } catch (error) {
                    console.error('Error fetching items:', error);
                }
            };
    
            fetchItems();
        }, [query]);

    return (
        <div className="category">
        <Header />
        <header>
            <h1 id="searchTitle"> Search results for "{query}"</h1>
        </header>
        <article>
        <ul className="cards">
        {data.length > 0 ? (
                data.map((item, index) => (
                    <li className="card" key={index}>
                    <a href={`/listing/${encodeURIComponent(item._id)}`}  id={item._id}>
                        <figure className='listingFigure'>
                            <img src="/restaurant.jpg"/>
                        </figure>
                        <div className="cardBody">
                        <div className='listingTop'>
                                <h2 className="listingh2">{item.name}</h2> 
                                <span className='spanRating'>{item.rating?`${item.rating}★`:"--"}</span>
                                </div>
                            <p className='listingParagraph'> {item.tags} </p>
                        </div>
                    </a>
                    </li>
                    
                ))
        ) : (
            <p>Nothing found</p>
            )}
        </ul>
        </article>
        </div>
    )


}

export default SearchResults;

