import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MapModal from './MapModal';
import BusinessHoursSelector from './BusinessHours';
import ImageUpload from './ImageUpload';
import Header from './Header';

const ChangeListing = () => {
    const navigate = useNavigate();
    const { listid } = useParams();
    const [modalOpen, setModalOpen] = useState(false);
    const [listingName, setListingName] = useState('');
    const [listingAddress, setListingAddress] = useState('');
    const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: '', lng: '' });
    const [tags, setTags] = useState('');
    const [currentBusinessHours, setCurrentBusinessHours] = useState({});
    const [businessHoursModified, setBusinessHoursModified] = useState(false);
    const [businessHours, setBusinessHours] = useState({})
    const [phone, setPhone] = useState('');
    const [images, setImages] = useState([]);
    const [verified, setVerified]=useState([]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/listing/${listid}`);
                const result = await response.json();
                setListingName(result[0].name);
                setListingAddress(result[0].address);
                setSelectedCoordinates({
                    lat: result[0].location.coordinates[1],
                    lng: result[0].location.coordinates[0],
                });
                setTags(result[0].tags);
                setPhone(result[0].phone);
                setImages(result[0].images);
                setVerified(result[0].verified)
                setCurrentBusinessHours(result[0].hours);

                console.log("Fetched business hours:", result[0].hours);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, [listid]);

    const handleLocationSelect = (coords) => {
        setSelectedCoordinates(coords);
    };

    const handleBusinessHoursChange = (updatedHours) => {
        setBusinessHours(updatedHours);
        setBusinessHoursModified(true);
    };

    const handleSubmit =async(e)=>{
        e.preventDefault();
        const hoursToSubmit = businessHoursModified ? Object.entries(businessHours).map(([day, { open, close, isOpen }]) => ({
        day,
        time: isOpen ? `${open} - ${close || "Closing time not set"}` : "Closed"
        }))
        : currentBusinessHours;

        try{
            const result = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"}/updateListing/${listid}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: listingName,
                    location: {
                        type:"Point",
                        coordinates:[selectedCoordinates.lng, selectedCoordinates.lat]
                    },
                    address:listingAddress,
                    hours:hoursToSubmit,
                    tags:tags,
                    phone:phone,
                    images:images,
                    verified:[verified[0]]
                })
            }).then((res) => res.json());
            navigate(`/listing/${listid}`)
        }catch(error){
            console.log(error)
        }
    }

    const viewBusinessHours = (hours) => {
        if (!hours || Object.keys(hours).length === 0) return <p className='listingParagraph margins'>No business hours set.</p>;

        return (
            <ol className="hoursList">
                {hours.map(item => (
                    <li key={item.day}> →{item.day}: {item.time}</li>
              ))}
            </ol>
        );
    };

    return (
        <div>
            <Header/>
            <form className="form">
                <br />
                <label htmlFor="listingFormName" className="listingLabel margins">
                    Listing name:
                </label>
                <br />
                <input
                    type="text"
                    id="listingFormName"
                    className="listingInputText margins"
                    value={listingName}
                    onChange={(e) => setListingName(e.target.value)}
                    required
                />
                <br />
                <br />
                <label htmlFor="listingFormAddress" className="listingLabel margins">
                    Address:
                </label>
                <br />
                <textarea
                    id="listingFormAddress"
                    className="listingTextarea margins"
                    maxLength={200}
                    required
                    value={listingAddress}
                    onChange={(e) => setListingAddress(e.target.value)}
                ></textarea>
                <br />
                <p className="listingParagraph margins">
                    {selectedCoordinates.lat && selectedCoordinates.lng
                        ? `Selected Coordinates are: ${selectedCoordinates.lat}, ${selectedCoordinates.lng}`
                        : ""}
                </p>
                <button type="button" className="margins listbutton" onClick={() => setModalOpen(true)}>
                    Change Location
                </button>
                <MapModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSelectLocation={handleLocationSelect} />
                <br />
                <br />
                <label htmlFor="salonTags" className="listingLabel margins">
                    Tags:
                </label>
                <br />
                <textarea
                    id="salonTags"
                    className="listingTextarea margins"
                    maxLength={200}
                    required
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                ></textarea>
                <br />
                <h1 className='listingLabel margins'>Current Business Hours</h1>
                {viewBusinessHours(currentBusinessHours)}
                <BusinessHoursSelector existingBusinessHours={businessHours} onChange={handleBusinessHoursChange} />
                <br />
                <label htmlFor="phone" className="listingLabel margins">
                    Business Contact:
                </label>
                <br />
                <input
                    type="tel"
                    id="phone"
                    pattern="[0-9]{10}"
                    className="listingInputPhone margins"
                    placeholder="Eg: 0123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <br />
                <br />
                <ImageUpload setImages={setImages} images={images} />
                <br />
                <div style={{display:"flex", justifyContent:"flex-end", width:"83vw"}}>
                <button className="changeListingSubmit listbutton" onClick={handleSubmit}>Submit</button>
                </div>
            </form>
        </div>
    );
};

export default ChangeListing;
