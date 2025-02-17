// BusSummary.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BusSummary.css';

const BusSummary = () => {
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
          setBusDetails(data[data.length - 1]);
        }
      } else {
        alert('Failed to load bus details.');
      }
    };

    fetchBusDetails();
  }, []);

  const handleEditBus = () => {
    navigate('/bus-edit');
  };

  const handleReadyToGoBus = () => {
    if (!busDetails) {
      alert('Bus details are missing.');
      return;
    }
    const origin = localStorage.getItem('originalOrigin') || 'Unknown';
    const destination = localStorage.getItem('originalDestination') || 'Unknown';
    const date = localStorage.getItem('originalDate') || new Date().toISOString();
    if (origin === 'Unknown' || destination === 'Unknown') {
      alert('Missing valid bus details for navigation.');
      return;
    }
    const transportUrl = `/transport/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/${encodeURIComponent(date)}`;
    navigate(transportUrl, { state: { activeSection: 'Bus' } });
  };

  if (!busDetails) {
    return <p>Loading bus details...</p>;
  }

  const excludeFields = ["id", "user_id", "custom_inputs", "created_at"];
  const labelMap = {
    "departure_time": "Departure Time",
    "arrival_time": "Arrival Time",
    "notes": "Notes",
    "departure_station": "Departure Station",
    "arrival_station": "Arrival Station",
    "link": "Link",
    "operator": "Operator",
    "seat_number": "Seat Number",
    "booking_number": "Booking Number",
    "platform": "Platform",
    "vehicle_number": "Vehicle Number"
  };

  return (
    <div className="bus-summary-container">
      <h2>Bus Summary</h2>
      {Object.entries(busDetails)
        .filter(([key]) => !excludeFields.includes(key))
        .map(([key, value]) => (
          <p key={key}>
            <strong>{labelMap[key] || key}:</strong> {value}
          </p>
        ))}
      <button onClick={handleEditBus} className="edit-button">Edit</button>
      <button onClick={handleReadyToGoBus} className="ready-button">Ready to Go!</button>
    </div>
  );
};

export default BusSummary;
