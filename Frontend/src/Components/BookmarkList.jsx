import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import { Bookmark } from "lucide-react"; 
import { useAuth } from "./services/AuthProvider";

const BookmarkList = () => {
  const { id } = useParams(); 
  const { user } = useAuth();

  const [data, setData] = useState([]); 
  const [bookmarkedListings, setBookmarkedListings] = useState({}); 

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const response = await fetch(`http://localhost:8000/bookmarks/${id}`);
        const result = await response.json();
        setData(result);
        const inCollection = {};
        if (result && result.listings) {
          result.listings.forEach((listing) => {
            inCollection[listing._id] = true;
          });
        }
        setBookmarkedListings(inCollection);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };
    fetchCollection();
  }, [id]);

  const handleToggleBookmark = async (listing) => {
    const listingId = listing._id;
    const isCurrentlyBookmarked = bookmarkedListings[listingId] === true;

    if (!isCurrentlyBookmarked) {
      try {
        const updatedListings = [...(data.listings || []), listingId];
        await fetch(`http://localhost:8000/bookmarks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            title: data.title,
            listings: updatedListings 
          }),
        });

        setBookmarkedListings((prev) => ({ ...prev, [listingId]: true }));
      } catch (error) {
        console.error("Error bookmarking listing:", error);
      }
    } else {
      const confirmRemove = window.confirm("Do you want to remove this bookmark?");
      if (!confirmRemove) return;

      try {
        const updatedListings = (data.listings || [])
          .filter((l) => l._id !== listingId && l !== listingId); 

        await fetch(`http://localhost:8000/bookmarks/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: data.title,
            listings: updatedListings,
          }),
        });

        setBookmarkedListings((prev) => ({ ...prev, [listingId]: false }));
      } catch (error) {
        console.error("Error removing bookmark:", error);
      }
    }
  };

  return (
    <div className="category">
      <Header />
      <header id="heads">
        {data.title && <h1 id="bookmarkName">{data.title}</h1>}
      </header>

      <article>
        <ul className="cards">
          {data.listings && data.listings.length > 0 ? (
            data.listings.map((item, index) => {
              const listingId = item._id;
              const isBookmarked = bookmarkedListings[listingId] === true;

              return (
                <li className="card" key={index} style={{ position: "relative" }}>
                  <a
                    href={`/listing/${encodeURIComponent(listingId)}`}
                    style={{ textDecoration: "none" }}
                  >
                    <figure className="listingFigure">
                      <img src={item.images[0]} alt="listing" />
                    </figure>
                    <div className="cardBody">
                      <h2 className="listingh2">{item.name}</h2>
                      <p className="listingParagraph">{item.tags}</p>
                    </div>
                  </a>

                  <div
                    style={{
                      margin: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      onClick={() => handleToggleBookmark(item)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      title={
                        isBookmarked
                          ? "Click to remove bookmark"
                          : "Click to bookmark"
                      }
                    >
                      <Bookmark
                        size={24}
                        color={isBookmarked ? "#e93a36" : "#343333"}
                        fill={isBookmarked ? "#e93a36" : "none"}
                      />
                    </button>
                  </div>
                </li>
              );
            })
          ) : (
            <h1 id="notFound">You ain't bookmarked nothin</h1>
          )}
        </ul>
      </article>
    </div>
  );
};

export default BookmarkList;
