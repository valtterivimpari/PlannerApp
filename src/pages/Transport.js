import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import './Transport.css';
import skyscannerIcon from '../assets/skyscanner-icon.png';
import planeIcon from '../assets/icon-symbol-plane_419328-2705.avif';

const Transport = () => {
    const { origin: paramOrigin, destination: paramDestination, date: paramDate } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [flightDetails, setFlightDetails] = useState(location.state?.flightDetails || null);


    const origin = paramOrigin; 
    const destination = paramDestination; 
    const [trainDetails, setTrainDetails] = useState(location.state?.trainDetails || null);
    
    
    

    const [activeSection, setActiveSection] = useState(null); 

    const {
        distance = 'Unknown',
        duration = 'Unknown',
        date = new Date().toISOString(),
    } = location.state || {};

    const originalDate = paramDate ? new Date(paramDate) : new Date();
const travelDate = originalDate.toLocaleDateString('fi-FI');

    



    useEffect(() => {
        console.log("Transport Page Params:", { origin: paramOrigin, destination: paramDestination });
        console.log("Transport Page State:", location.state);
        console.log("Final Origin & Destination:", { origin: paramOrigin, destination: paramDestination });
        if (!flightDetails) { // Now this will be true if flightDetails is null
            const fetchFlightDetails = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/flights', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setFlightDetails(data[data.length - 1]); // load latest flight
                    }
                }
            };
            fetchFlightDetails();
        }
    }, [flightDetails, paramOrigin, paramDestination]);

    useEffect(() => {
        if (activeSection === 'Train' && !trainDetails) {
            const fetchTrainDetails = async () => {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/trains', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setTrainDetails(data[data.length - 1]);
                    }
                }
            };
            fetchTrainDetails();
        }
    }, [activeSection, trainDetails]);

    const handleDeleteTrain = async () => {
        if (!trainDetails || !trainDetails.id) {
            alert("Error: Train ID is missing. Unable to delete.");
            return;
        }
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/trains/${trainDetails.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            setTrainDetails(null);
            alert('Train details deleted successfully');
            navigate(`/transport/${paramOrigin}/${paramDestination}/${paramDate}`, { replace: true });
            window.location.reload();
        } else {
            const errorText = await response.text();
            alert(`Failed to delete train: ${errorText}`);
        }
    };

    const handleEditFlight = () => {
        navigate('/flight-edit', { state: { flightDetails } });
    };
    
    const handleDeleteFlight = async () => {
        if (!flightDetails || !flightDetails.id) {
            alert("Error: Flight ID is missing. Unable to delete.");
            return;
        }
    
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/flights/${flightDetails.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
    
        if (response.ok) {
            setFlightDetails({});
            
            // Ensure correct redirection using parameters from useParams()
            navigate(`/transport/${paramOrigin}/${paramDestination}/${date}`, { replace: true });
            window.location.reload();
        } else {
            const errorText = await response.text();
            alert(`Failed to delete flight: ${errorText}`);
        
    
    
            // Attempt to fetch latest flight details if deletion fails
            const latestFlightResponse = await fetch('http://localhost:5000/api/flights', {
                headers: { Authorization: `Bearer ${token}` }
            });
    
            if (latestFlightResponse.ok) {
                const data = await latestFlightResponse.json();
                if (Array.isArray(data) && data.length > 0) {
                    setFlightDetails(data[data.length - 1]); // Load latest flight if deletion fails
                    console.log("Updated flight details after failed delete attempt:", data[data.length - 1]);
                    console.log("Transport Page Params:", { origin, destination, date });

                }
            }
        }
    };
    
    
    return (
        <div className="transport-page">
            <h1>{`${paramOrigin} → ${paramDestination}`}</h1>
            <p><strong>Travel Date:</strong> {travelDate}</p>

            <div className="transport-options">
                <button className="transport-option" onClick={() => setActiveSection('Drive')}>Drive</button>
                <button className="transport-option" onClick={() => setActiveSection('Flights')}>Flights</button>
                <button className="transport-option" onClick={() => setActiveSection('Train')}>Train</button>
                <button className="transport-option" onClick={() => setActiveSection('Bus')}>Bus</button>
                <button className="transport-option" onClick={() => setActiveSection('Ferry')}>Ferry</button>
            </div>

            {activeSection === 'Drive' && (
                <div className="transport-details">
                    <p><strong>Distance:</strong> {`${distance} km`}</p>
                    <p><strong>Duration:</strong> {duration}</p>
                </div>
            )}

            {activeSection === 'Flights' && (
                <div className="flights-info">
                    <div className="flights-link-container">
                        <a href="https://www.skyscanner.com" target="_blank" rel="noopener noreferrer" className="flights-link">
                            <img src={skyscannerIcon} alt="Skyscanner Icon" className="flights-icon" />
                            Find flights on Skyscanner
                        </a>
                    </div>

                    <div className="transport-details">
                        <h2>Flight Details</h2>
                        {flightDetails && Object.keys(flightDetails).length > 0 ? (
    <>
        <p><strong>Departure Time:</strong> {flightDetails.departure_time}</p>
        <p><strong>Arrival Time:</strong> {flightDetails.arrival_time}</p>
        <p><strong>Departure Airport:</strong> {flightDetails.departure_airport}</p>
        <p><strong>Arrival Airport:</strong> {flightDetails.arrival_airport}</p>
        <p><strong>Flight Number:</strong> {flightDetails.flight_number}</p>
        <p><strong>Seat Number:</strong> {flightDetails.seat_number}</p>
        <p><strong>Operator:</strong> {flightDetails.operator}</p>
        <p><strong>Booking Number:</strong> {flightDetails.booking_number}</p>
        <p><strong>Link:</strong> <a href={flightDetails.link} target="_blank" rel="noopener noreferrer">{flightDetails.link}</a></p>
        <p><strong>Notes:</strong> {flightDetails.notes}</p>
                                <ul>
                                    {flightDetails.customInputs?.map((input, index) => (
                                        <li key={index}>
                                            <strong>{input.label}:</strong> {input.value}
                                        </li>
                                    ))}
                                </ul>

                                <div className="flight-buttons">
                                    <button onClick={handleEditFlight} className="edit-button">Edit</button>
                                    <button onClick={handleDeleteFlight} className="delete-button">Delete</button>
                                </div>
                            </>
                        ) : (
                            <p>No flight details available for this route.</p>
                        )}
                    </div>

                    {date && (
                    <Link 
                    to="/flight-details" 
                    className="add-flight-link"
                    onClick={() => {
                        localStorage.setItem("originalOrigin", paramOrigin);
                        localStorage.setItem("originalDestination", paramDestination);
                        localStorage.setItem("originalDate", paramDate || new Date().toISOString());
                    }}
                    
                >
                
                     <img src={planeIcon} alt="Add your flight" className="add-flight-icon" />
                     Add your flight
                 </Link>
                 
                  
                   
                    
                    )}
                </div>
            )}


{activeSection === 'Train' && (
                <div className="trains-info">
                    <div className="transport-details">
                        <h2>Train Details</h2>
                        {trainDetails && Object.keys(trainDetails).length > 0 ? (
                            <>
                                <p><strong>Departure Time:</strong> {trainDetails.departure_time}</p>
                                <p><strong>Arrival Time:</strong> {trainDetails.arrival_time}</p>
                                <p><strong>Departure Station:</strong> {trainDetails.departure_station}</p>
                                <p><strong>Arrival Station:</strong> {trainDetails.arrival_station}</p>
                                <p><strong>Seat Number:</strong> {trainDetails.seat_number}</p>
                                <p><strong>Operator:</strong> {trainDetails.operator}</p>
                                <p><strong>Booking Number:</strong> {trainDetails.booking_number}</p>
                                <p><strong>Link:</strong> <a href={trainDetails.link} target="_blank" rel="noopener noreferrer">{trainDetails.link}</a></p>
                                <p><strong>Notes:</strong> {trainDetails.notes}</p>
                                <p><strong>Track:</strong> {trainDetails.track}</p>
                                <p><strong>Vehicle Number:</strong> {trainDetails.vehicle_number}</p>
                                <div className="train-buttons">
                                    <button onClick={() => navigate('/train-edit')} className="edit-button">Edit</button>
                                    <button onClick={handleDeleteTrain} className="delete-button">Delete</button>
                                </div>
                            </>
                        ) : (
                            <p>No train details available for this route.</p>
                        )}
                    </div>
                    {/* Inside the 'Train' section */}
<Link 
  to="/train-details" 
  className="add-train-link"
  onClick={() => {
    // Save the original param-based origin/destination/date so we can restore them
    localStorage.setItem("originalOrigin", paramOrigin);
    localStorage.setItem("originalDestination", paramDestination);
    localStorage.setItem("originalDate", paramDate || new Date().toISOString());
  }}
>
  Add your train
</Link>

                </div>
            )}

            {activeSection && !['Drive', 'Flights', 'Train'].includes(activeSection) && (
                <div className="transport-details">
                    <p>{`${activeSection} information coming soon...`}</p>
                </div>
            )}
        </div>
    );
};

export default Transport;
