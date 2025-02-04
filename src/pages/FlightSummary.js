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

    const handleReadyToGo = () => {
        if (!flightDetails) {
            alert('Flight details are missing.');
            return;
        }
    
        const origin = flightDetails.origin || flightDetails.departureAirport;
        const destination = flightDetails.destination || flightDetails.arrivalAirport;
        const date = flightDetails.date || new Date().toISOString(); 
    
        if (!origin || !destination || !date) {
            alert('Missing flight details for navigation.');
            console.error('Missing details:', { origin, destination, date });
            return;
        }
    
        const transportUrl = `/transport/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/${encodeURIComponent(date)}`;
    
        navigate(transportUrl, { state: { flightDetails } });
    };
    
    
    

    const handleDeleteFlight = async () => {
        const token = localStorage.getItem('token');
        if (!flightDetails) return;

        const response = await fetch(`http://localhost:5000/api/flights/${flightDetails.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
            setFlightDetails(null);
            alert('Flight deleted successfully');
        } else {
            alert('Failed to delete flight');
        }
    };

    if (!flightDetails) {
        return <p>Loading flight details...</p>;
    }

    const excludeFields = ["id", "user_id", "origin", "destination", "custom_inputs", "date"];

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
            <button onClick={handleReadyToGo} className="ready-button">Ready to Go!</button>
            <button onClick={handleDeleteFlight} className="delete-button">Delete Flight</button>
        </div>
    );
};

export default FlightSummary;



