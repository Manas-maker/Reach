import { useState, useEffect } from "react";
import axios from "axios";
import "./bookmark.css";

const API_BASE_URL = "http://localhost:8000";

const BookmarkButton = ({ userid, item }) => {
    const [bookmarked, setBookmarked] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState("");

    useEffect(() => {
        axios.get(`${API_BASE_URL}/users/${userid}/bookmarks/collections`)
            .then(response => setCollections(response.data))
            .catch(error => console.error("Error fetching collections:", error));
    }, [userid]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/bookmarks/${userid}`)
            .then(response => {
                const isBookmarked = response.data.some(b => b.url === item.url);
                setBookmarked(isBookmarked);
            })
            .catch(error => console.error("Error checking bookmark:", error));
    }, [userid, item.url]);

    const handleSave = async () => {
        if (!selectedCollection) return;

        try {
            const response = await axios.get(`${API_BASE_URL}/collections/${selectedCollection}/bookmarks`);
            const exists = response.data.some(b => b.url === item.url);

            if (exists) {
                alert("This item is already in the selected collection!");
                return;
            }

            // Save bookmark
            await axios.post(`${API_BASE_URL}/bookmarks`, {
                userid,
                title: item.title,
                url: item.url,
                description: item.description || "",
                collection: selectedCollection
            });

            setBookmarked(true);
            setShowModal(false);
        } catch (error) {
            console.error("Error saving to collection:", error);
        }
    };

    return (
        <>
            <button onClick={() => setShowModal(true)} className={`bookmark-btn ${bookmarked ? "bookmarked" : ""}`}>
                {bookmarked ? "🔖 Bookmarked" : "➕ Bookmark"}
            </button>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Select a Collection</h3>
                        <select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
                            <option value="">-- Select Collection --</option>
                            {collections.map((col) => (
                                <option key={col._id} value={col.title}>{col.title}</option>
                            ))}
                        </select>
                        <button onClick={handleSave} disabled={!selectedCollection}>Save</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookmarkButton;
