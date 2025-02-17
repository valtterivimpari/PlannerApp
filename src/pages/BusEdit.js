// BusEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusDetails.css'; // Reuse BusDetails.css for styling

const BusEdit = () => {
  const navigate = useNavigate();
  const [busDetails, setBusDetails] = useState(null);

  useEffect(() => {
    const fetchBusDetails = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/buses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setBusDetails(data[data.length - 1]); // load latest bus record
        }
      } else {
        alert('Failed to load bus details.');
      }
    };
    fetchBusDetails();
  }, []);

  const handleChange = (e) => {
    setBusDetails({ ...busDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/buses/${busDetails.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(busDetails)
    });
    const updatedBus = await response.json();
    console.log("Updated bus response:", updatedBus);
    if (response.ok) {
      navigate('/bus-summary');
    } else {
      alert('Failed to update bus details.');
    }
  };

  if (!busDetails) {
    return <p>Loading bus details...</p>;
  }

  // Exclude fields that should not be edited
  const excludeFields = ["id", "user_id", "origin", "destination", "date", "custom_inputs"];
  const labelMap = {
    "notes": "Notes",
    "departure_station": "Departure Station",
    "arrival_station": "Arrival Station",
    "link": "Link",
    "operator": "Operator",
    "seatNumber": "Seat Number",
    "bookingNumber": "Booking Number",
    "platform": "Platform",
    "vehicleNumber": "Vehicle Number"
  };

  return (
    <div className="bus-details-container">
      <h2>Edit Bus Details</h2>
      {Object.entries(busDetails)
        .filter(([key]) => !excludeFields.includes(key))
        .map(([key, value]) => {
          const lowerKey = key.toLowerCase();
          const isTimeField = (lowerKey === "departuretime" || lowerKey === "departure_time" ||
                               lowerKey === "arrivaltime" || lowerKey === "arrival_time");
          let labelText = "";
          if (lowerKey === "departuretime" || lowerKey === "departure_time") {
            labelText = "Departure Time";
          } else if (lowerKey === "arrivaltime" || lowerKey === "arrival_time") {
            labelText = "Arrival Time";
          } else {
            labelText = labelMap[key] || key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          }
          return (
            <div key={key} className="input-group">
              <label>{labelText}</label>
              {isTimeField ? (
                <input type="time" name={key} value={value} onChange={handleChange} />
              ) : (
                <input type="text" name={key} value={value} onChange={handleChange} />
              )}
            </div>
          );
        })}
      <button className="save-button" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default BusEdit;
