import React from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useAuth } from "./services/AuthProvider";

Modal.setAppElement("#root"); 

const BookmarksModal = ({ collections, setCollections, listingid, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const updateCollection = async (collid, title, updatedListings) => {
    const response = await fetch(`http://localhost:8000/bookmarks/${collid}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        listings: updatedListings,
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    await response.text();
  };
  const handleCollectionClick = async (collid, colltitle, colllistings) => {
    if (!colllistings.includes(listingid)) {
      const updatedListings = [...colllistings, listingid];
      try {
        await updateCollection(collid, colltitle, updatedListings);
        window.alert(`Listing successfully saved to ${colltitle}!`);

        const savedCollection = collections.find(coll => coll.title === "Saved");
        if (savedCollection && !savedCollection.listings.includes(listingid)) {
          const updatedSavedListings = [...savedCollection.listings, listingid];
          await updateCollection(savedCollection._id, savedCollection.title, updatedSavedListings);
          setCollections(prev =>
            prev.map(coll =>
              coll.title === "Saved" ? { ...coll, listings: updatedSavedListings } : coll
            )
          );
        }
      } catch (error) {
        console.error("Error sending request:", error);
        window.alert("Failed to add listing to collection.");
      }
    } else {
      window.alert("Listing already in this collection!");
    }
  };

  // Create a new collection
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
          listings: [listingid],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      const newCollection = await response.json();
      setCollections(prevCollections => [...prevCollections, newCollection]);
      alert(`Collection "${userInput}" created! Listing successfully added!`);

      const savedCollection = collections.find(coll => coll.title === "Saved");
      if (savedCollection && !savedCollection.listings.includes(listingid)) {
        const updatedSavedListings = [...savedCollection.listings, listingid];
        await updateCollection(savedCollection._id, savedCollection.title, updatedSavedListings);
        setCollections(prev =>
          prev.map(coll =>
            coll.title === "Saved" ? { ...coll, listings: updatedSavedListings } : coll
          )
        );
      }
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
                onClick={() =>
                  handleCollectionClick(
                    collection._id,
                    collection.title,
                    collection.listings
                  )
                }
              >
                {collection.title}
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
