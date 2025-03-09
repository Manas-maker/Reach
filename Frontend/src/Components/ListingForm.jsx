import React, {useState} from 'react';
import MapModal from './MapModal';
import BusinessHoursSelector from './BusinessHours';
import { useNavigate } from "react-router-dom";
import ImageUpload from './ImageUpload';

const ListingForm = () => {
    const navigate = useNavigate();
    const [selectedOption, setSelectedOption] = useState("");
    const [pageNumber, setPageNumber] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [listingName, setListingName] = useState("");
    const [listingAddress, setListingAddress] = useState("");
    const [selectedCoordinates, setSelectedCoordinates] = useState({ lat: "", lng: "" });

    const [tags, setTags] = useState("");
    const [businessHours, setBusinessHours] = useState({});
    const [phone, setPhone] = useState("");
    const [images, setImages] = useState([]);

    const handleLocationSelect = (coords) => {
        setSelectedCoordinates(coords);
    };

    const handleBusinessHoursChange = (updatedHours) => {
        setBusinessHours(updatedHours);
        console.log(businessHours);
      };
    

    const submitAddress = async(e) => {
        e.preventDefault();

        try {

            const verified = await fetch("http://localhost:8000/verifyListing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: listingName,
                    coordinates: [selectedCoordinates.lng, selectedCoordinates.lat]
                })
            }).then((res) => res.json());
            
            console.log(verified);
            console.log(verified.result);
            console.log(typeof(verified));

            if (verified.result==="Listing Exists!"){
                window.alert("Listing already exists!");
                return;
            }

            if (selectedOption === "Restaurant") {
                setPageNumber(2);
            } else if (selectedOption === "Grocery") {
                setPageNumber(3);
            } else if (selectedOption === "Laundromat") {
                setPageNumber(4);
            } else if (selectedOption === "PG") {
                setPageNumber(5);
            } else if (selectedOption === "Salon") {
                setPageNumber(6);
            }
        } catch(error) {
            console.log(error);
        }
    };

    // Render your form content based on the current state
    const renderFormContent = () => {
        switch (pageNumber) {
            case 1:
                return (
                    <div className="form">
                        <br/>
                        <br/>
                        <label htmlFor="listingFormName" className="listingLabel margins">Enter {selectedOption} name:</label>
                        <br/>
                        <input 
                            type="text" 
                            id="listingFormName" 
                            className="listingInputText margins"  
                            value={listingName} 
                            onChange={(e) => {
                                console.log("Setting listing name to:", e.target.value);
                                setListingName(e.target.value);}}
                            required
                        />
                        <br/>
                        <br/>
                        <label htmlFor="listingFormAddress" className="listingLabel margins">Enter Address:</label>
                        <br/>
                        <textarea 
                            id="listingFormAddress" 
                            className="listingTextarea margins" 
                            placeholder='Maximum 200 characters' 
                            maxLength={200} 
                            required
                            value={listingAddress} 
                            onChange={(e) => {setListingAddress(e.target.value)}}
                        ></textarea>
                        <br/>
                        <br/>
                        <button type="button" className="margins listbutton" onClick={() => setModalOpen(true)}>Select Location</button>
                        <MapModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSelectLocation={handleLocationSelect} />
                        <br/>
                        <p className="listingParagraph margins">
                            {selectedCoordinates.lat && selectedCoordinates.lng ? "Selected Coordinates are:"+
                                `${selectedCoordinates.lat}, ${selectedCoordinates.lng}` : ""}
                        </p>
                    </div>
                );
            case 2:
                return (
                    <div className="form">
                        <br/>
                        <br/>
                        <label htmlFor="restaurantTags" className="listingLabel margins">Enter Tags:</label>
                        <br/>
                        <textarea 
                            id="restaurantTags" 
                            className="listingTextarea margins" 
                            placeholder='Eg: Italian, Outdoor Seating, Great Ambience' 
                            maxLength={200} 
                            required
                            value={tags} 
                            onChange={(e) => {setTags(e.target.value)}}
                        ></textarea>
                        <br/>

                        <BusinessHoursSelector onChange={handleBusinessHoursChange} />
                        <br/>
                        <label htmlFor='phone' className='listingLabel margins'>Enter Business Contact: </label>
                        <br/>
                        <input type='tel' id="phone" pattern="[0-9]{10}" className='listingInputPhone margins' 
                        placeholder='Eg: 0123456789'
                        value={phone} 
                        onChange={(e)=> {setPhone(e.target.value)}}/>
                        <br/>
                        <br/>
                        <ImageUpload setImages={setImages} images={images}/>
                        <br/>

                    </div>
                );
            case 3:
                return (
                    <div className="form">
                        <br/>
                        <br/>
                        <label htmlFor="groceryTags" className="listingLabel margins">Enter Tags:</label>
                        <br/>
                        <textarea 
                            id="groceryTags" 
                            className="listingTextarea margins" 
                            placeholder='Eg: Vegetables, MRP, Drinks' 
                            maxLength={200} 
                            required
                            value={tags} 
                            onChange={(e) => {setTags(e.target.value)}}
                        ></textarea>
                        <br/>

                        <BusinessHoursSelector onChange={handleBusinessHoursChange} />
                        <br/>
                        <label htmlFor='phone' className='listingLabel margins'>Enter Business Contact: </label>
                        <br/>
                        <input type='tel' id="phone" pattern="[0-9]{10}" className='listingInputPhone margins' 
                        placeholder='Eg: 0123456789'
                        value={phone} 
                        onChange={(e)=> {setPhone(e.target.value)}}/>
                        <br/>
                        <br/>
                        <ImageUpload setImages={setImages} images={images}/>
                        <br/>

                    </div>
                )
            case 4:
                return (
                    <div className="form">
                        <br/>
                        <br/>
                        <label htmlFor="laundromatTags" className="listingLabel margins">Enter Tags:</label>
                        <br/>
                        <textarea 
                                id="laundromatTags" 
                                className="listingTextarea margins" 
                                placeholder='Eg: Dry Cleaning, Stain Removal, Affordable' 
                                maxLength={200} 
                                required
                                value={tags} 
                                onChange={(e) => {setTags(e.target.value)}}
                        ></textarea>
                        <br/>
    
                        <BusinessHoursSelector onChange={handleBusinessHoursChange} />
                        <br/>
                        <label htmlFor='phone' className='listingLabel margins'>Enter Business Contact: </label>
                        <br/>
                        <input type='tel' id="phone" length={10} className='listingInputPhone margins' 
                        placeholder='Eg: 0123456789'
                        value={phone} 
                        onChange={(e)=> {setPhone(e.target.value)}}/>
                        <br/>
                        <br/>
                        <ImageUpload setImages={setImages} images={images}/>
                        <br/>
    
                    </div>
                )
                    
            case 5:
                return (
                    <div className="form">
                        <br/>
                        <br/>
                        <label htmlFor="pgTags" className="listingLabel margins">Enter Tags:</label>
                        <br/>
                        <textarea 
                            id="pgTags" 
                            className="listingTextarea margins" 
                            placeholder='Eg: Girls, No Smoking, Double Sharing' 
                            maxLength={200} 
                            required
                            value={tags} 
                            onChange={(e) => {setTags(e.target.value)}}
                        ></textarea>
                        <br/>
        
                        <BusinessHoursSelector onChange={handleBusinessHoursChange} />
                        <br/>
                        <label htmlFor='phone' className='listingLabel margins'>Enter Business Contact: </label>
                        <br/>
                        <input type='tel' id="phone" pattern="[0-9]{10}" className='listingInputPhone margins' 
                        placeholder='Eg: 0123456789'
                        value={phone} 
                        onChange={(e)=> {setPhone(e.target.value)}}/>
                        <br/>
                        <br/>
                        <ImageUpload setImages={setImages} images={images}/>
                        <br/>
        
                    </div>
                )
            case 6:
                return (
                    <div className="form">
                        <br/>
                        <br/>
                        <label htmlFor="salonTags" className="listingLabel margins">Enter Tags:</label>
                        <br/>
                        <textarea 
                            id="salonTags" 
                            className="listingTextarea margins" 
                            placeholder='Eg: Haircut, Waxing, Manicure' 
                            maxLength={200} 
                            required
                            value={tags} 
                            onChange={(e) => {setTags(e.target.value)}}
                        ></textarea>
                        <br/>
            
                        <BusinessHoursSelector onChange={handleBusinessHoursChange} />
                        <br/>
                        <label htmlFor='phone' className='listingLabel margins'>Enter Business Contact: </label>
                        <br/>
                        <input type='tel' id="phone" pattern="[0-9]{10}" className='listingInputPhone margins' 
                        placeholder='Eg: 0123456789'
                        value={phone} 
                        onChange={(e)=> {setPhone(e.target.value)}}/>
                        <br/>
                        <br/>
                        <ImageUpload setImages={setImages} images={images}/>
                        <br/>
            
                    </div>
                    )            
            default:
                return null;
        }
    };

    const handleSubmit=async(e)=>{
        e.preventDefault();
        if (images.length < 3) {
            window.alert("You must upload at least 3 images.");
            return;    
        }
        const extractedHours = Object.entries(businessHours).map(([day, { open, close, isOpen }]) => ({
            day,
            time: isOpen ? `${open} - ${close || "Closing time not set"}` : "Closed"
          }));

        try{
            const lowerType = selectedOption.toLowerCase();
            const verified = await fetch("http://localhost:8000/newListing", {
                method: "POST",
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
                    type: lowerType,
                    hours:extractedHours,
                    tags:tags,
                    phone:phone,
                    images:images
                })
            }).then((res) => res.json());

            navigate('/success')
        }catch(error){
            console.log(error)
        }
    }

    return (
        <>
            <h1 id='listingFormTitle'>Create a Listing</h1>
            <form id="bigForm" onSubmit={handleSubmit}>
                <label htmlFor="listingType" className="listingLabel">Select type of listing: </label>
                <br/>
                <select 
                    id="listingType" 
                    value={selectedOption} 
                    onChange={(e) => setSelectedOption(e.target.value)}
                >
                    <option value="">-- Select an option --</option>
                    <option>Restaurant</option>
                    <option>Grocery</option>
                    <option>Laundromat</option>
                    <option>PG</option>
                    <option>Salon</option>
                </select>

                {selectedOption != "" && (
                        <>
                        {renderFormContent()}
                        {pageNumber === 1 && (
                            <>
                            <button className="listbutton buttonNext" type="submit" onClick={submitAddress}>Next</button>
                            </>
                        )}
                        {pageNumber > 1 && (
                            <div id="formButtons">
                            <button className="submits listbutton" type="button" onClick={()=>setPageNumber(1)}>Prev</button>
                            <button className="buttonSubmit listbutton" type="submit">Submit</button>
                            </div>
                        )}
                    </>
                )}
                
            </form>
        </>
    );
};

export default ListingForm;