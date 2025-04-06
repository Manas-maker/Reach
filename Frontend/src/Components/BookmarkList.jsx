import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from './Header';
import BookmarksModal from "./BookmarkModal"; 
import { useAuth } from "./services/AuthProvider"; 
import { Bookmark } from "lucide-react"; // lucide-react icon

const BookmarkList = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [data, setData] = useState([]);
  const [collections, setCollections] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);

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

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`http://localhost:8000/${user.id}/bookmarks`);
        const result = await response.json();
        setCollections(result);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    if (user && modalOpen) {
      fetchCollections();
    }
  }, [user, modalOpen]);

  const openBookmarkModal = (listingId) => {
    setSelectedListingId(listingId);
    setModalOpen(true);
  };

  const closeBookmarkModal = () => {
    setModalOpen(false);
    setSelectedListingId(null);
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
                <button
                  className="bookmark-icon"
                  onClick={() => openBookmarkModal(item._id)}
                  title="Save to bookmarks"
                >
                  <Bookmark size={20} />
                </button>
              </li>
            ))
          ) : (
            <h1 id='notFound'>No results found!</h1>
          )}
        </ul>
      </article>

      {/* Bookmark Modal */}
      <BookmarksModal
        collections={collections}
        setCollections={setCollections}
        listingid={selectedListingId}
        isOpen={modalOpen}
        onClose={closeBookmarkModal}
      />
    </div>
  );
};

export default BookmarkList;
