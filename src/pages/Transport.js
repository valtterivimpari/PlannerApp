import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Transport.css';

const Transport = () => {
    const { origin, destination } = useParams();
    const location = useLocation();

    // Fallbacks for undefined state
    const {
        distance = 'Unknown',
        duration = 'Unknown',
        date = new Date().toISOString(),
    } = location.state || {};

    console.log("State received in Transport.js:", {
        origin,
        destination,
        distance,
        duration,
        date,
    });

    return (
        <div className="transport-page">
            <h1>{`${origin} → ${destination}`}</h1>
            <p>{`Travel Date: ${new Date(date).toLocaleDateString()}`}</p>
            <div className="transport-options">
                <button className="transport-option">Drive</button>
                <button className="transport-option">Flights</button>
                <button className="transport-option">Train</button>
                <button className="transport-option">Bus</button>
                <button className="transport-option">Ferry</button>
            </div>
            <div className="transport-details">
                <p><strong>Distance:</strong> {`${distance} km`}</p>
                <p><strong>Duration:</strong> {duration}</p>
            </div>
        </div>
    );
};

export default Transport;

