import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FerryDetails.css';

const FerryEdit = () => {
  const navigate = useNavigate();
  const [ferryDetails, setFerryDetails] = useState(null);

  useEffect(() => {
    const fetchFerryDetails = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ferries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setFerryDetails(data[data.length - 1]); // load latest ferry record
        }
      } else {
        alert('Failed to load ferry details.');
      }
    };
    fetchFerryDetails();
  }, []);

  const handleChange = (e) => {
    setFerryDetails({ ...ferryDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/ferries/${ferryDetails.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(ferryDetails)
    });
    const updatedFerry = await response.json();
    console.log("Updated ferry response:", updatedFerry);
    if (response.ok) {
      navigate('/ferry-summary');
    } else {
      alert('Failed to update ferry details.');
    }
  };

  if (!ferryDetails) {
    return <p>Loading ferry details...</p>;
  }

  const excludeFields = ["id", "user_id", "origin", "destination", "date", "custom_inputs"];
  const labelMap = {
    "notes": "Notes",
    "departure_port": "Departure Port",
    "arrival_port": "Arrival Port",
    "link": "Link",
    "operator": "Operator",
    "seatNumber": "Seat Number",
    "bookingNumber": "Booking Number",
    "vehicleNumber": "Vehicle Number"
  };

  return (
    <div className="ferry-details-container">
      <h2>Edit Ferry Details</h2>
      {Object.entries(ferryDetails)
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

export default FerryEdit;
