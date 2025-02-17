import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FlightDetails.css';

const FlightDetails = () => {
    const navigate = useNavigate();
    const [flightDetails, setFlightDetails] = useState({
        departureTime: '',
        arrivalTime: '',
        notes: '',
        departureAirport: '',
        arrivalAirport: '',
        flightNumber: '',
        link: '',
        operator: '',
        seatNumber: '',
        bookingNumber: ''
    });

    const handleChange = (e) => {
        setFlightDetails({ ...flightDetails, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
    
        if (!token) {
            alert("You must be logged in to save flight details.");
            return;
        }
    
        const flightData = {
            ...flightDetails,
            origin: localStorage.getItem("originalOrigin") || flightDetails.departureAirport || "Unknown",
            destination: localStorage.getItem("originalDestination") || flightDetails.arrivalAirport || "Unknown",
            date: localStorage.getItem("originalDate") || new Date().toISOString() // Preserve original date
        };
    
        console.log("Sending flight data to server:", flightData);
    
        const response = await fetch('http://localhost:5000/api/flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(flightData)
        });
    
        const responseData = await response.json(); 
        console.log("Response from server after saving flight:", responseData);
    
        if (response.ok) {
            navigate('/flight-summary');
        } else {
            alert('Failed to save flight details: ' + responseText);
        }
    };
    
    

    return (
        <div className="flight-details-container">
            
            <div className="input-group">
                <label>Departure Time</label>
                <input type="time" name="departureTime" value={flightDetails.departureTime} onChange={handleChange} />
            </div>
            
            <div className="input-group">
                <label>Arrival Time</label>
                <input type="time" name="arrivalTime" value={flightDetails.arrivalTime} onChange={handleChange} />
            </div>

            {Object.entries(flightDetails).map(([field, value]) => 
                field !== "departureTime" && field !== "arrivalTime" ? (
                    <div key={field} className="input-group">
                        <label>{field.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase())}</label>
                        <input type="text" name={field} value={value} onChange={handleChange} />
                    </div>
                ) : null
            )}

            <button className="save-button" onClick={handleSave}>Save</button>
        </div>
    );
};

export default FlightDetails;
