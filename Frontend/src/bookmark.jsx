import React from "react";
import { Link } from "react-router-dom";

const CatalogBookmark = () => {
  const categories = ["Saved", "Restaurants", "Laundry", "Hangout"];

  return (
    <div style={{ backgroundColor: "#FFF7D4", color: "#3D3B40", fontFamily: "Federant, sans-serif", minHeight: "100vh", padding: "20px" }}>
      <div style={{ background: "white", padding: "20px", maxWidth: "600px", margin: "20px auto", borderRadius: "10px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}>
        <div style={{ textAlign: "right", padding: "10px", fontSize: "14px" }}>
          <span role="img" aria-label="user">👤</span> User
        </div>
        <h2 style={{ textAlign: "center" }}>Bookmarks</h2>
        {categories.map((category, index) => (
          <div key={index} style={{ background: "#FFE69A", padding: "10px", margin: "10px 0", borderRadius: "5px", textAlign: "center" }}>
            {category} <br />
            <Link to={`/bookmarks/${category.toLowerCase().replace(/\s+/g, "-")}`} style={{ color: "blue", textDecoration: "none" }}>
              View All →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogBookmark;
