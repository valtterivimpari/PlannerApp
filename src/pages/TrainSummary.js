// TrainSummary.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrainSummary.css';

const TrainSummary = () => {
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
                console.log("Fetched train details:", data);
                if (Array.isArray(data) && data.length > 0) {
                    setTrainDetails(data[data.length - 1]); // Show latest train
                }
            } else {
                alert('Failed to load train details.');
            }
        };

        fetchTrainDetails();
    }, []);

    const handleEditTrain = () => {
        navigate('/train-edit');
    };

    const handleReadyToGo = () => {
        if (!trainDetails) {
            alert('Train details are missing.');
            return;
        }

        // Get the original route params from localStorage
        // (These were presumably saved in Transport.js when the user clicked "Add your train")
        const origin = localStorage.getItem('originalOrigin') || 'Unknown';
        const destination = localStorage.getItem('originalDestination') || 'Unknown';
        const date = localStorage.getItem('originalDate') || new Date().toISOString();

        console.log("Navigating with:", { origin, destination, date });

        if (origin === 'Unknown' || destination === 'Unknown') {
            alert('Missing valid train details for navigation.');
            return;
        }

        // Keep the original route for the Transport page
        const transportUrl = `/transport/${encodeURIComponent(origin)}/${encodeURIComponent(destination)}/${encodeURIComponent(date)}`;

        // Optionally pass any needed state, e.g. to keep the "Train" tab active
        navigate(transportUrl, { state: { activeSection: 'Train' } });
    };

    if (!trainDetails) {
        return <p>Loading train details...</p>;
    }

    const excludeFields = ["id", "user_id", "custom_inputs", "created_at", "overnight_transport"];
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
        "track": "Track",
        "vehicle_number": "Vehicle Number"
    };

    return (
        <div className="train-summary-container">
            <h2>Train Summary</h2>
            {Object.entries(trainDetails)
                .filter(([key]) => !excludeFields.includes(key))
                .map(([key, value]) => (
                    <p key={key}>
                        <strong>{labelMap[key] || key}:</strong> {value}
                    </p>
                ))}
            <button onClick={handleEditTrain} className="edit-button">Edit</button>
            <button onClick={handleReadyToGo} className="ready-button">Ready to Go!</button>
        </div>
    );
};

export default TrainSummary;


