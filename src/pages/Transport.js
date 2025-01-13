import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Transport.css';
import skyscannerIcon from '../assets/skyscanner-icon.png'; // Ensure the icon is in the assets folder

const Transport = () => {
    const { origin, destination } = useParams();
    const location = useLocation();
    const [activeSection, setActiveSection] = useState(null); // Track active section
    const [customFlight, setCustomFlight] = useState(''); // State for custom flight input

    const {
        distance = 'Unknown',
        duration = 'Unknown',
        date = new Date().toISOString(),
    } = location.state || {};

    const handleAddCustomFlight = () => {
        if (customFlight.trim()) {
            console.log(`Added custom flight: ${customFlight}`);
            setCustomFlight('');
        }
    };

    return (
        <div className="transport-page">
            <h1>{`${origin} → ${destination}`}</h1>
            <p>{`Travel Date: ${new Date(date).toLocaleDateString()}`}</p>
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
                    <div className="add-flight">
                        <input
                            type="text"
                            placeholder="Add your flight"
                            value={customFlight}
                            onChange={(e) => setCustomFlight(e.target.value)}
                        />
                        <button onClick={handleAddCustomFlight}>+</button>
                    </div>
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
