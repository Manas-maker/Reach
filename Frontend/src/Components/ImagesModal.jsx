import React, { useState } from "react";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Ensures accessibility


const ImagesModal = ({ imageUrls, isOpen, onClose }) => {
  console.log(isOpen);
  const openImage = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={onClose} style={{ float: "right", cursor: "pointer" }} className="mapsButton">Close</button>
        <div className="image-grid">
          {imageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Image ${index}`}
              onClick={() => openImage(url)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default ImagesModal;
