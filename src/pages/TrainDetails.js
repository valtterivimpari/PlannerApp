// TrainDetails.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainDetails.css';

const TrainDetails = () => {
    const navigate = useNavigate();
    const [trainDetails, setTrainDetails] = useState({
        departureTime: '',
        arrivalTime: '',
        overnightTransport: '',
        notes: '',
        departureStation: '',
        arrivalStation: '',
        link: '',
        operator: '',
        seatNumber: '',
        bookingNumber: '',
        track: '',
        vehicleNumber: ''
    });

    const handleChange = (e) => {
        setTrainDetails({ ...trainDetails, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        const token = localStorage.getItem('token');
    
        if (!token) {
            alert("You must be logged in to save train details.");
            return;
        }
    
        console.log("Sending train data to server:", trainDetails);
    
        const response = await fetch('http://localhost:5000/api/trains', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(trainDetails)
        });
    
        const responseData = await response.json();
        console.log("Response from server after saving train:", responseData);
    
        if (response.ok) {
            navigate('/train-summary');
        } else {
            alert('Failed to save train details: ' + responseData.error);
        }
    };

    return (
        <div className="train-details-container">
            <h2>Train Details</h2>
            <div className="input-group">
                <label>Departure Time</label>
                <input type="time" name="departureTime" value={trainDetails.departureTime} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Arrival Time</label>
                <input type="time" name="arrivalTime" value={trainDetails.arrivalTime} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Notes</label>
                <input type="text" name="notes" value={trainDetails.notes} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Departure Station</label>
                <input type="text" name="departureStation" value={trainDetails.departureStation} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Arrival Station</label>
                <input type="text" name="arrivalStation" value={trainDetails.arrivalStation} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Link</label>
                <input type="text" name="link" value={trainDetails.link} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Operator</label>
                <input type="text" name="operator" value={trainDetails.operator} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Seat Number</label>
                <input type="text" name="seatNumber" value={trainDetails.seatNumber} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Booking Number</label>
                <input type="text" name="bookingNumber" value={trainDetails.bookingNumber} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Track</label>
                <input type="text" name="track" value={trainDetails.track} onChange={handleChange} />
            </div>
            <div className="input-group">
                <label>Vehicle Number</label>
                <input type="text" name="vehicleNumber" value={trainDetails.vehicleNumber} onChange={handleChange} />
            </div>
            <button className="save-button" onClick={handleSave}>Save</button>
        </div>
    );
};

export default TrainDetails;
