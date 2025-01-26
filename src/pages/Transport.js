import React, { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import './Transport.css';
import skyscannerIcon from '../assets/skyscanner-icon.png'; // Skyscanner icon
import planeIcon from '../assets/icon-symbol-plane_419328-2705.avif'; // Plane icon

const Transport = () => {
    const { origin, destination } = useParams();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState(null); // Track active section

    const {
        distance = 'Unknown',
        duration = 'Unknown',
        date = new Date().toISOString(),
        index = -1, // Default value if not provided
    } = location.state || {};
    

    return (
        <div className="transport-page">
            <h1>{`${origin} → ${destination}`}</h1>
            <p>
    {index > 0
        ? `Travel Date: ${new Date(date).toLocaleDateString('fi-FI')}`
        : 'No travel date available'}
</p>


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
                    <a
                        href="https://www.skyscanner.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flights-link"
                    >
                        <img
                            src={skyscannerIcon}
                            alt="Skyscanner Icon"
                            className="flights-icon"
                        />
                        Find flights on Skyscanner
                    </a>
                    <Link to={`/flights/${origin}/${destination}/${new Date(date).toISOString().split('T')[0]}`}
                        className="add-flight-link">
                        <img
                            src={planeIcon}
                            alt="Add your flight"
                            className="add-flight-icon"
                        />
                        Add your flight
                    </Link>
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
