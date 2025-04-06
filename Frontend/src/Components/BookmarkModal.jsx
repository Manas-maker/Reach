import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useAuth } from './services/AuthProvider';

Modal.setAppElement("#root"); // Ensure accessibility

const BookmarksModal = ({ collections, setCollections, listingid, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const handleCollectionClick = async (collid, colltitle, colllistings) => {
    if (!colllistings.includes(listingid)) {
      const updatedListings = [...colllistings, listingid];
      try {
        const response = await fetch(`http://localhost:8000/bookmarks/${collid}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            title: colltitle,
            listings: updatedListings
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const text = await response.text();
        const result = text ? JSON.parse(text) : {};

        window.alert("Listing successfully saved!");
      } catch (error) {
        console.error("Error sending request:", error);
        window.alert("Failed to add listing to collection.");
      }
    } else {
      window.alert("Listing already in collection!");
    }
  };
  const handleDeleteCollection = async (collid) => {
    if (!window.confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await fetch(`http://localhost:8000/bookmarks/${user.id}/${collid}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        window.alert(`Error: ${errorData.error}`);
        return;
      }

      window.alert("Collection deleted successfully!");
      setCollections(prev => prev.filter(coll => coll._id !== collid));
    } catch (error) {
      console.error("Error deleting collection:", error);
      window.alert("Failed to delete collection.");
    }
  };
  const handleAddCollection = async () => {
    const userInput = window.prompt("Enter collection name:");
    if (!userInput) {
      alert("Collection name is required!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: user.id,
          title: userInput,
          listings: [listingid]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      const newCollection = await response.json();
      setCollections(prevCollections => [...prevCollections, newCollection]);

      alert("Collection created! Listing successfully added!");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Failed to create collection.");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Manage Bookmarks"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2 id="bookmarkSaving" className="listingh2">Save to</h2>
      <ul className="collection-list">
        {collections.length > 0 ? (
          collections.map((collection) => (
            <li key={collection._id} className="collection-item">
              <button 
                className="listbutton bookmarkTitle" 
                onClick={() => handleCollectionClick(collection._id, collection.title, collection.listings)}
              >
                {collection.title}
              </button>
              {/* Delete button for the collection */}
              <button 
                className="listbutton delete-btn" 
                onClick={() => handleDeleteCollection(collection._id)}
              >
                Delete Collection
              </button>
              <br/><br/>
            </li>
          ))
        ) : (
          <p>No collections found.</p>
        )}
      </ul>
      <button onClick={handleAddCollection} className="listbutton">+Add Collection</button>
      <button onClick={onClose} className="listbutton close-btn">Close</button>
    </Modal>
  );
};

export default BookmarksModal;
