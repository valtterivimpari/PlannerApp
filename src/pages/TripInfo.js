import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TripInfo.css';

function TripInfo() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);
    const [nights, setNights] = useState(0); // State for nights
    const [endDate, setEndDate] = useState(''); // State for dynamically updated end_date

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const calculateNights = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const difference = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return difference;
    };

    const calculateEndDate = (startDate, nights) => {
        const start = new Date(startDate);
        const updatedEndDate = new Date(start);
        updatedEndDate.setDate(start.getDate() + nights); // Add the nights to the start date
        return updatedEndDate.toISOString();
    };

    useEffect(() => {
        const fetchTripDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No token found');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/trips/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Trip details:', response.data);
                setTrip(response.data);

                // Calculate initial nights and set the endDate
                const initialNights = calculateNights(response.data.start_date, response.data.end_date);
                setNights(initialNights);
                setEndDate(response.data.end_date);
            } catch (err) {
                console.error('Error fetching trip details:', err);
                setError('Failed to fetch trip details.');
            }
        };

        fetchTripDetails();
    }, [id]);

    const handleIncrement = () => {
        const updatedNights = nights + 1;
        setNights(updatedNights);
        setEndDate(calculateEndDate(trip.start_date, updatedNights));
    };

    const handleDecrement = () => {
        if (nights > 0) {
            const updatedNights = nights - 1;
            setNights(updatedNights);
            setEndDate(calculateEndDate(trip.start_date, updatedNights));
        }
    };

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!trip) return <p>Loading...</p>;

    return (
        <div className="trip-info">
            <div className="trip-header">
                <h1>{trip.trip_name}</h1>
                <p>
                    Selected Dates: <strong>{formatDate(trip.start_date)}</strong> - <strong>{formatDate(endDate)}</strong>
                </p>
            </div>
            <div className="trip-body">
                <div className="trip-summary">
                    <h2>Plan</h2>
                    <div className="summary-grid">
    <div>
        <strong>Country:</strong> {trip.selected_country || 'Unknown'}
    </div>
    <div className="nights-counter">
        <strong>Nights:</strong>
        <div className="counter">
            <button onClick={handleDecrement}>-</button>
            <span>{nights}</span>
            <button onClick={handleIncrement}>+</button>
        </div>
    </div>
    <div>
        <strong>Sleeping:</strong>
        {trip.sleeping ? (
            trip.sleeping
        ) : (
            <button onClick={() => console.log("Add sleeping details")} className="add-sleeping-button">+</button>
        )}
    </div>
    <div>
        <strong>Discover:</strong>
        {trip.discover ? (
            trip.discover
        ) : (
            <button onClick={() => console.log("Add discover details")} className="add-discover-button">+</button>
        )}
    </div>
    <div>
        <strong>Transport:</strong>
        {trip.transport ? (
            trip.transport
        ) : (
            <button onClick={() => console.log("Add transport details")} className="add-transport-button">+</button>
        )}
    </div>
</div>

                </div>
            </div>
        </div>
    );
}

export default TripInfo;
