import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightDetails.css';

const FlightEdit = () => {
    const navigate = useNavigate();
    const [flightDetails, setFlightDetails] = useState(null);

    useEffect(() => {
        const fetchFlightDetails = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/flights', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setFlightDetails(data[data.length - 1]); // Load the latest flight
                }
            } else {
                alert('Failed to load flight details.');
            }
        };

        fetchFlightDetails();
    }, []);

    const handleChange = (e) => {
        setFlightDetails({ ...flightDetails, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/api/flights/${flightDetails.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(flightDetails)
        });

        if (response.ok) {
            navigate('/flight-summary');
        } else {
            alert('Failed to update flight details.');
        }
    };

    if (!flightDetails) {
        return <p>Loading flight details...</p>;
    }

    // Exclude unwanted fields
    const excludeFields = ["id", "user_id", "origin", "destination", "date", "custom_inputs", "departure_time", "arrival_time"];


    // Label mapping to match FlightDetails.js
    const labelMap = {
        "departureTime": "Departure Time",
        "arrivalTime": "Arrival Time",
        "notes": "Notes",
        "departure_airport": "Departure Airport",
        "arrival_airport": "Arrival Airport",
        "flight_number": "Flight Number",
        "link": "Link",
        "operator": "Operator",
        "seat_number": "Seat Number",
        "booking_number": "Booking Number"
    };
    

    return (
        <div className="flight-details-container">
            <h2>Edit Flight Details</h2>
            
            <div className="input-group">
                <label>Departure Time</label>
                <input type="time" name="departureTime" value={flightDetails.departureTime} onChange={handleChange} />
            </div>
            
            <div className="input-group">
                <label>Arrival Time</label>
                <input type="time" name="arrivalTime" value={flightDetails.arrivalTime} onChange={handleChange} />
            </div>

            {Object.entries(flightDetails)
    .filter(([key]) => !excludeFields.includes(key))
    .map(([key, value]) => (
        <div key={key} className="input-group">
            <label>{labelMap[key] || key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}</label>

            <input type="text" name={key} value={value} onChange={handleChange} />
        </div>
    ))}


            <button className="save-button" onClick={handleSave}>Save Changes</button>
        </div>
    );
};

export default FlightEdit;
