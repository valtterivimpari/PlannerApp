import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FlightSummary.css';

const FlightSummary = () => {
    const navigate = useNavigate();
    const [flightDetails, setFlightDetails] = useState(null);
    const { origin, destination } = useParams();

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
    
        // Ensure correct mappings
        const origin = flightDetails.origin && flightDetails.origin !== "Unknown" 
    ? flightDetails.origin 
    : localStorage.getItem("originalOrigin") || flightDetails.departureAirport || "Unknown";

const destination = flightDetails.destination && flightDetails.destination !== "Unknown"
    ? flightDetails.destination
    : localStorage.getItem("originalDestination") || flightDetails.arrivalAirport || "Unknown";


        
    const date = flightDetails.date && flightDetails.date !== "Unknown"
    ? flightDetails.date
    : localStorage.getItem("originalDate") || new Date().toISOString();

    
        console.log("Navigating with:", { origin, destination, date, flightDetails });
    
        if (origin === 'Unknown' || destination === 'Unknown') {
            alert('Missing valid flight details for navigation.');
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

    const excludeFields = ["id", "user_id", "custom_inputs", "date","origin", "destination"];


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
        </div>
    );
};

export default FlightSummary;



