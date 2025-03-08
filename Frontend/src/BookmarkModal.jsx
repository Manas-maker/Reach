import React, {useState} from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Ensure accessibility

const BookmarksModal = ({ collections, setCollections, listingid, userid, isOpen, onClose }) => {
  // Handle collection click


  const handleCollectionClick = async (collid, colltitle, colllistings) => {
    if (!colllistings.includes(listingid)){
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
    const result = text ? JSON.parse(text): {};

      window.alert("Listing successfully saved!");
    } catch (error) {
            console.error("Error sending request:", error);
    }
    } else {
        window.alert("Listing already in collection!")
       
    }
  };

  const handleAddCollection = async()=>{

    const userInput = window.prompt("Enter collection name:");

    // Check if the user entered something (or pressed cancel)
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
            userid: userid,
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
  
        // Update the collections list with the new collection
        setCollections(prevCollections => [...prevCollections, newCollection]);
  
        alert("Collection created! Listing successfully added!");
      } catch (error) {
        console.error("Error sending request:", error);
      }
    
}

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Manage Bookmarks"
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>Save to</h2>
      <ul className="collection-list">
        {collections.length > 0 ? (
          collections.map((collection) => (
            <li key={collection._id} className="collection-item">
              <button onClick={() => handleCollectionClick(collection._id, collection.title, collection.listings)}>
                {collection.title}
              </button>
              <br/>
              <br/>
            </li>
          ))
        ) : (
          <p>No collections found.</p>
        )}
      </ul>
      <button onClick={handleAddCollection}>+Add Collection</button>
      <button onClick={onClose} className="close-btn">Close</button>
    </Modal>
  );
};

export default BookmarksModal;
