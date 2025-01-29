import React, { useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import './Transport.css';
import skyscannerIcon from '../assets/skyscanner-icon.png'; // Skyscanner icon
import planeIcon from '../assets/icon-symbol-plane_419328-2705.avif'; // Plane icon
import { useFlightContext } from './FlightContext';

const Transport = () => {
    const { origin, destination } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { flightDetails, setFlightDetails } = useFlightContext();
    const [activeSection, setActiveSection] = useState(null); // Track active section

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
    };
    

    return (
        <div className="transport-page">
            <h1>{`${origin} → ${destination}`}</h1>
            <p><strong>Travel Date:</strong> {travelDate}</p>


            <div className="transport-options">
                <button
                    className="transport-option"
                    onClick={() => setActiveSection('Drive')}
                >
                    Drive
                </button>
                <button
                    className="transport-option"
                    onClick={() => setActiveSection('Flights')}
                >
                    Flights
                </button>
                <button
                    className="transport-option"
                    onClick={() => setActiveSection('Train')}
                >
                    Train
                </button>
                <button
                    className="transport-option"
                    onClick={() => setActiveSection('Bus')}
                >
                    Bus
                </button>
                <button
                    className="transport-option"
                    onClick={() => setActiveSection('Ferry')}
                >
                    Ferry
                </button>
            </div>

            {/* Drive Section */}
            {activeSection === 'Drive' && (
                <div className="transport-details">
                    <p><strong>Distance:</strong> {`${distance} km`}</p>
                    <p><strong>Duration:</strong> {duration}</p>
                </div>
            )}

            {/* Flights Section */}
            {activeSection === 'Flights' && (
    <div className="flights-info">
        {/* Skyscanner link is now separate */}
        <div className="flights-link-container">
            <a
                href="https://www.skyscanner.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flights-link"
            >
                <img src={skyscannerIcon} alt="Skyscanner Icon" className="flights-icon" />
                Find flights on Skyscanner
            </a>
        </div>

        <div className="transport-details">
            <h2>Flight Details</h2>
            {flightDetails.origin === origin && flightDetails.destination === destination ? (
                <>
                    <p><strong>Date:</strong> {flightDetails.date}</p>
                    <p><strong>Departure Time:</strong> {flightDetails.departureTime}</p>
                    <p><strong>Arrival Time:</strong> {flightDetails.arrivalTime}</p>
                    <p><strong>Notes:</strong> {flightDetails.notes}</p>
                    <ul>
                        {flightDetails.customInputs.map((input, index) => (
                            <li key={index}>
                                <strong>{input.label}:</strong> {input.value}
                            </li>
                        ))}
                    </ul>

                    {/* Buttons are now separate from the Skyscanner link */}
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
            <>
                {(() => {
                    const updatedDate = new Date(date);
                    updatedDate.setDate(updatedDate.getDate() + 1); // Increment the date
                    return (
                        <Link
                            to={`/flights/${origin}/${destination}/${updatedDate.toISOString().split('T')[0]}`}
                            className="add-flight-link"
                        >
                            <img
                                src={planeIcon}
                                alt="Add your flight"
                                className="add-flight-icon"
                            />
                            Add your flight
                        </Link>
                    );
                })()}
            </>
        )}
    </div>
)}

            {/* Placeholder for Other Sections */}
            {activeSection && !['Drive', 'Flights'].includes(activeSection) && (
                <div className="transport-details">
                    <p>{`${activeSection} information coming soon...`}</p>
                </div>
            )}
        </div>
    );
};

export default Transport;
