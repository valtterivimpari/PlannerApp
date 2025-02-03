import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightSummary.css';

const FlightSummary = () => {
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
                    setFlightDetails(data[data.length - 1]); // Show latest flight
                }
            } else {
                alert('Failed to load flight details.');
            }
        };

        fetchFlightDetails();
    }, []);

    if (!flightDetails) {
        return <p>Loading flight details...</p>;
    }

    // Fields to exclude from display
    const excludeFields = ["id", "user_id", "origin", "destination", "date", "custom_inputs"];

    // Map for renaming fields properly
    const labelMap = {
        "departure_time": "Departure Time",
        "arrival_time": "Arrival Time",
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
        <div className="flight-summary-container">
            <h2>Flight Summary</h2>
            {Object.entries(flightDetails)
                .filter(([key]) => !excludeFields.includes(key))
                .map(([key, value]) => (
                    <p key={key}><strong>{labelMap[key] || key}:</strong> {value}</p>
                ))}
            <button onClick={() => navigate('/flight-edit')} className="edit-button">Edit</button>
        </div>
    );
};

export default FlightSummary;


