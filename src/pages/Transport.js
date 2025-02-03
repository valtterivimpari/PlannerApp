import React, { useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import './Transport.css';
import skyscannerIcon from '../assets/skyscanner-icon.png';
import planeIcon from '../assets/icon-symbol-plane_419328-2705.avif';

const Transport = () => {
    const { origin, destination } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Use local state instead of useFlightContext
    const [flightDetails, setFlightDetails] = useState({});

    const [activeSection, setActiveSection] = useState(null); 

    const {
        distance = 'Unknown',
        duration = 'Unknown',
        date = new Date().toISOString(),
    } = location.state || {};

    const travelDate = date ? new Date(date).toLocaleDateString('fi-FI') : 'Unknown Date';

    const handleEditFlight = () => {
        navigate(`/flights/${origin}/${destination}/${date.split('T')[0]}`);
    };

    const handleDeleteFlight = () => {
        setFlightDetails({});
        console.log("Flight details deleted");
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
                        {flightDetails.origin && flightDetails.destination ? (
                            <>
                                <p><strong>Date:</strong> {flightDetails.date}</p>
                                <p><strong>Departure Time:</strong> {flightDetails.departureTime}</p>
                                <p><strong>Arrival Time:</strong> {flightDetails.arrivalTime}</p>
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
                        <Link to="/flight-details" className="add-flight-link">
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
