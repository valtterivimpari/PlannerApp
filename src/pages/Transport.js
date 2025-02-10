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
            <h1>{`${origin} → ${destination}`}</h1>
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

            {activeSection && !['Drive', 'Flights'].includes(activeSection) && (
                <div className="transport-details">
                    <p>{`${activeSection} information coming soon...`}</p>
                </div>
            )}
        </div>
    );
};

export default Transport;
