// BusDetails.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusDetails.css'; // Create this file (you can base it on your TrainDetails.css)

const BusDetails = () => {
  const navigate = useNavigate();
  const [busDetails, setBusDetails] = useState({
    departureTime: '',
    arrivalTime: '',
    notes: '',
    departureStation: '',
    arrivalStation: '',
    link: '',
    operator: '',
    seatNumber: '',
    bookingNumber: '',
    platform: '',
    vehicleNumber: ''
  });

  const handleChange = (e) => {
    setBusDetails({ ...busDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to save bus details.");
      return;
    }
    console.log("Sending bus data to server:", busDetails);
    const response = await fetch('http://localhost:5000/api/buses', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(busDetails)
    });
    const responseData = await response.json();
    console.log("Response from server after saving bus:", responseData);
    if (response.ok) {
      navigate('/bus-summary');
    } else {
      alert('Failed to save bus details: ' + responseData.error);
    }
  };

  return (
    <div className="bus-details-container">
      <h2>Bus Details</h2>
      <div className="input-group">
        <label>Departure Time</label>
        <input type="time" name="departureTime" value={busDetails.departureTime} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Arrival Time</label>
        <input type="time" name="arrivalTime" value={busDetails.arrivalTime} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Notes</label>
        <input type="text" name="notes" value={busDetails.notes} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Departure Station</label>
        <input type="text" name="departureStation" value={busDetails.departureStation} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Arrival Station</label>
        <input type="text" name="arrivalStation" value={busDetails.arrivalStation} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Link</label>
        <input type="text" name="link" value={busDetails.link} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Operator</label>
        <input type="text" name="operator" value={busDetails.operator} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Seat Number</label>
        <input type="text" name="seatNumber" value={busDetails.seatNumber} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Booking Number</label>
        <input type="text" name="bookingNumber" value={busDetails.bookingNumber} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Platform</label>
        <input type="text" name="platform" value={busDetails.platform} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Vehicle Number</label>
        <input type="text" name="vehicleNumber" value={busDetails.vehicleNumber} onChange={handleChange} />
      </div>
      <button className="save-button" onClick={handleSave}>Save</button>
    </div>
  );
};

export default BusDetails;
