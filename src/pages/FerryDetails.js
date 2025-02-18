import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FerryDetails.css';

const FerryDetails = () => {
  const navigate = useNavigate();
  const [ferryDetails, setFerryDetails] = useState({
    departureTime: '',
    arrivalTime: '',
    notes: '',
    departurePort: '',
    arrivalPort: '',
    link: '',
    operator: '',
    seatNumber: '',
    bookingNumber: '',
    vehicleNumber: ''
  });

  const handleChange = (e) => {
    setFerryDetails({ ...ferryDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to save ferry details.");
      return;
    }
    console.log("Sending ferry data to server:", ferryDetails);
    const response = await fetch('http://localhost:5000/api/ferries', {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ferryDetails)
    });
    const responseData = await response.json();
    console.log("Response from server after saving ferry:", responseData);
    if (response.ok) {
      navigate('/ferry-summary');
    } else {
      alert('Failed to save ferry details: ' + responseData.error);
    }
  };

  return (
    <div className="ferry-details-container">
      <h2>Ferry Details</h2>
      <div className="input-group">
        <label>Departure Time</label>
        <input type="time" name="departureTime" value={ferryDetails.departureTime} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Arrival Time</label>
        <input type="time" name="arrivalTime" value={ferryDetails.arrivalTime} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Notes</label>
        <input type="text" name="notes" value={ferryDetails.notes} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Departure Port</label>
        <input type="text" name="departurePort" value={ferryDetails.departurePort} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Arrival Port</label>
        <input type="text" name="arrivalPort" value={ferryDetails.arrivalPort} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Link</label>
        <input type="text" name="link" value={ferryDetails.link} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Operator</label>
        <input type="text" name="operator" value={ferryDetails.operator} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Seat Number</label>
        <input type="text" name="seatNumber" value={ferryDetails.seatNumber} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Booking Number</label>
        <input type="text" name="bookingNumber" value={ferryDetails.bookingNumber} onChange={handleChange} />
      </div>
      <div className="input-group">
        <label>Vehicle Number</label>
        <input type="text" name="vehicleNumber" value={ferryDetails.vehicleNumber} onChange={handleChange} />
      </div>
      <button className="save-button" onClick={handleSave}>Save</button>
    </div>
  );
};

export default FerryDetails;
