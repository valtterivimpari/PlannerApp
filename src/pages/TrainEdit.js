// TrainEdit.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainDetails.css';

const TrainEdit = () => {
  const navigate = useNavigate();
  const [trainDetails, setTrainDetails] = useState(null);

  useEffect(() => {
    const fetchTrainDetails = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/trains', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setTrainDetails(data[data.length - 1]); // Load the latest train record
        }
      } else {
        alert('Failed to load train details.');
      }
    };

    fetchTrainDetails();
  }, []);

  const handleChange = (e) => {
    setTrainDetails({ ...trainDetails, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:5000/api/trains/${trainDetails.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(trainDetails)
    });

    const updatedTrain = await response.json();
    console.log("Updated train response:", updatedTrain);

    if (response.ok) {
      navigate('/train-summary');
    } else {
      alert('Failed to update train details.');
    }
  };

  if (!trainDetails) {
    return <p>Loading train details...</p>;
  }

  // Exclude fields that you do not wish to edit
  const excludeFields = ["id", "user_id", "origin", "destination", "date", "custom_inputs", "overnight_transport", "created_at"];

  // Map field names to labels for better display.
  // We'll handle departure/arrival time separately.
  const labelMap = {
    "notes": "Notes",
    "departure_station": "Departure Station",
    "arrival_station": "Arrival Station",
    "link": "Link",
    "operator": "Operator",
    "seatNumber": "Seat Number",
    "bookingNumber": "Booking Number",
    "track": "Track",
    "vehicleNumber": "Vehicle Number"
  };

  return (
    <div className="train-details-container">
      <h2>Edit Train Details</h2>
      {Object.entries(trainDetails)
        .filter(([key]) => !excludeFields.includes(key))
        .map(([key, value]) => {
          const lowerKey = key.toLowerCase();
          // Check if key indicates a time field
          const isTimeField = (lowerKey === "departuretime" || lowerKey === "departure_time" ||
                               lowerKey === "arrivaltime" || lowerKey === "arrival_time");
          // Determine the label: if it's a time field, use the proper title case.
          let labelText = "";
          if (lowerKey === "departuretime" || lowerKey === "departure_time") {
            labelText = "Departure Time";
          } else if (lowerKey === "arrivaltime" || lowerKey === "arrival_time") {
            labelText = "Arrival Time";
          } else {
            // Use the labelMap if available, or convert underscore names
            labelText = labelMap[key] || key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
          }

          return (
            <div key={key} className="input-group">
              <label>{labelText}</label>
              {isTimeField ? (
                <input
                  type="time"
                  name={key}
                  value={value}
                  onChange={handleChange}
                />
              ) : (
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                />
              )}
            </div>
          );
        })}
      <button className="save-button" onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default TrainEdit;


