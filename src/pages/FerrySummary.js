import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FerrySummary.css';

const FerrySummary = () => {
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
          setFerryDetails(data[data.length - 1]);
        }
      } else {
        alert('Failed to load ferry details.');
      }
    };

    fetchFerryDetails();
  }, []);

  const handleEditFerry = () => {
    navigate('/ferry-edit');
  };

  const handleReadyToGoFerry = () => {
     if (!ferryDetails) {
          alert('Ferry details are missing.');
         return;
        }
        const origin = localStorage.getItem("originalOrigin") || "Unknown";
        const destination = localStorage.getItem("originalDestination") || "Unknown";
        const date = localStorage.getItem("originalDate") || new Date().toISOString();
        if (origin === "Unknown" || destination === "Unknown") {
          alert("Missing valid ferry details for navigation.");
          return;
        }
        const transportUrl = `/transport/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/${encodeURIComponent(date)}`;
        navigate(transportUrl, { state: { activeSection: "Ferry" } });
      };

  if (!ferryDetails) {
    return <p>Loading ferry details...</p>;
  }

  const excludeFields = ["id", "user_id", "custom_inputs", "created_at"];
  const labelMap = {
    "departure_time": "Departure Time",
    "arrival_time": "Arrival Time",
    "notes": "Notes",
    "departure_port": "Departure Port",
    "arrival_port": "Arrival Port",
    "link": "Link",
    "operator": "Operator",
    "seat_number": "Seat Number",
    "booking_number": "Booking Number",
    "vehicle_number": "Vehicle Number"
  };

  return (
    <div className="ferry-summary-container">
      <h2>Ferry Summary</h2>
      {Object.entries(ferryDetails)
        .filter(([key]) => !excludeFields.includes(key))
        .map(([key, value]) => (
          <p key={key}>
            <strong>{labelMap[key] || key}:</strong> {value}
          </p>
        ))}
      <button onClick={handleEditFerry} className="edit-button">Edit</button>
      <button onClick={handleReadyToGoFerry} className="ready-button">Ready to Go!</button>
    </div>
  );
};

export default FerrySummary;
