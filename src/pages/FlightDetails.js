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
            console.log("Saving flight details:", flightDetails);

            return;
        }
    
        const flightData = {
            ...flightDetails,
            origin: flightDetails.departureAirport,  // Set city names correctly
            destination: flightDetails.arrivalAirport
        };
    
        console.log("Sending flight details:", flightData);
    
        const response = await fetch('http://localhost:5000/api/flights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(flightData)
        });
    
        const responseText = await response.text();
        console.log("Server response:", responseText);
    
        if (response.ok) {
            navigate('/flight-summary');
        } else {
            alert('Failed to save flight details: ' + responseText);
        }
    };
    

    return (
        <div className="flight-details-container">
            <h2>Enter Flight Details</h2>
            
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
