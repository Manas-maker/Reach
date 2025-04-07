import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "./Header";
import { Bookmark } from "lucide-react"; 
import { useAuth } from "./services/AuthProvider";
import { faObjectGroup } from "@fortawesome/free-solid-svg-icons";
import LoadingScreen from "./LoadingScreen";

const BookmarkList = () => {
  const { id } = useParams(); 
  const { user } = useAuth();

  const [data, setData] = useState({ title: "", listings: [] });
  const [bookmarkedListings, setBookmarkedListings] = useState({}); 
  const [listingIds, setListingIds] = useState([])
  const [loading, setLoading] = useState(true);

  
    const fetchCollection = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/bookmarks/${id}`);
        const result = await response.json();
        setData(result);
        console.log(data);
        setLoading(false);
        const inCollection = {};
        const ids = [];
        if (result && result.listings) {
          result.listings.forEach((listing) => {
            inCollection[listing._id] = true;
            ids.push(listing._id);
          });
        }
        setBookmarkedListings(inCollection);
        setListingIds(ids);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    useEffect(() => {
      fetchCollection();
    }, [id]);

    if (loading){
      return <LoadingScreen/>
    }

  const handleToggleBookmark = async (listing) => {
    const listingId = listing._id;
    const isCurrentlyBookmarked = bookmarkedListings[listingId] === true;

    if (!isCurrentlyBookmarked) {
      try {
        const updatedListings = [...(data.listings || []), listingId];
        await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/bookmarks/${id}`, {
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
        const updatedListings = listingIds.filter((id) => id !== listingId);

        console.log(bookmarkedListings);
        console.log(updatedListings);
          await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/bookmarks/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: data.title,
              listings: updatedListings,
            }),
          });

          if (data.title=="Saved"){
          await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/bookmarks/saved/${user.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              listingid: listingId,
            }),
          });
        }

        setBookmarkedListings((prev) => ({ ...prev, [listingId]: false }));
        setLoading(true);
        await fetchCollection();
        setLoading(false);
      } catch (error) {
        console.error("Error removing bookmark:", error);
      }
    }
  };
  console.log("test");
  console.log(data);
  return (
    <div className="category">
      <Header />
      <header id="heads">
        <h1 id="bookmarkName">{data.title}</h1>
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
            <h2 id="notFound">You haven't bookmarked anything yet!</h2>
          )}
        </ul>
      </article>
    </div>
  );
};

export default BookmarkList;
