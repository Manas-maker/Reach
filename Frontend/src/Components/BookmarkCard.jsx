import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './services/AuthProvider';
import Header from './Header';

const BookmarkCard = () => {
  const { user, loading } = useAuth();
  const { id: userid } = useParams();
  const [data, setData] = useState([]);
  const [bookmarkLoading, setBookmarkLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/${userid}/bookmarks`);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [userid]);

  const handleDeleteCollection = async (collid) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/bookmarks/${userid}/${collid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        return;
      }

      alert("Collection deleted successfully!");
      setData(prev => prev.filter(coll => coll._id !== collid));
      fetchItems(); // Auto-refresh after delete
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Failed to delete collection.");
    }
  };

  if (loading || bookmarkLoading) {
    return (
      <h1 style={{ marginTop: "50vh", transform: "translateY(-50%)" }}>
        Loading...
      </h1>
    );
  }

  return (
    <>
      <Header />
      <div className="bookmarkCategory">
        <header>
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
                    <div className="bookmarkCardBody" style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                      <h2 className='listingh2'>{item.title}</h2>
                      {/* show Delete Collection button if the title is not "Saved" */}
                  {item.title.toLowerCase() !== "saved" && (
                    <button
                      className="deleteCollectionButton"
                      onClick={() => handleDeleteCollection(item._id)}
                    >
                      Delete Collection
                    </button>
                  )}
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
