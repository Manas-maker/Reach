import React, {useState} from "react";
import Modal from "react-modal";
import { GoogleMap, LoadScriptNext, Marker } from "@react-google-maps/api";

Modal.setAppElement("#root"); // Required for accessibility

const MapModal = ({ isOpen, onClose, onSelectLocation }) => {

    const center = { lat: 12.962255603029178, lng: 77.59722767692797 };
    const [selectedPosition, setSelectedPosition] = useState(null);
  
    const handleMapClick = (event) => {
        const newLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        }
        setSelectedPosition(newLocation);
        onSelectLocation(newLocation);
    };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          width: "80%", height: "80%", margin: "auto", padding: "20px", borderRadius: "10px"
        },
      }}
    >
      <button onClick={onClose} style={{ float: "right", cursor: "pointer" }} className="mapsButton">
        Close
      </button>
      <LoadScriptNext googleMapsApiKey="AIzaSyACoHZjNSJdT7Im2_8m2rbCoDoMn3ErmxU">
            <GoogleMap key={center.lat+center.lng} center={center} zoom={10} onClick={handleMapClick}
                mapContainerStyle={{ width: "80%", height: "80%", alignContent:"center"}}>
                {selectedPosition && <Marker position={selectedPosition} />}
            </GoogleMap>
            {selectedPosition && (
                <p>
                Selected Coordinates: {selectedPosition.lat}, {selectedPosition.lng}
                </p>
            )}
      </LoadScriptNext>
      <br/>
      <button onClick={onClose} className="mapsButton">Submit</button>
    </Modal>
  );
};

export default MapModal;
