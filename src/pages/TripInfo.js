import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Add this import
import axios from 'axios';
import './TripInfo.css';

function TripInfo() {
    const { id } = useParams(); // Extract the trip ID from the URL
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);

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
                setTrip(response.data);
            } catch (err) {
                console.error('Error fetching trip details:', err);
                setError('Failed to fetch trip details.');
            }
        };

        fetchTripDetails();
    }, [id]);

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!trip) return <p>Loading...</p>;

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="trip-info">
            <div className="trip-header">
                <h1>{trip.tripName}</h1>
                <p>
                    Selected Dates: <strong>{formatDate(trip.startDate)}</strong> - <strong>{formatDate(trip.endDate)}</strong>
                </p>
            </div>
            <div className="trip-body">
                <div className="trip-summary">
                    <h2>Plan</h2>
                    <div className="summary-grid">
                    <div>
    <strong>Country:</strong> {trip.selected_country || 'Unknown'}
</div>

                        <div>
                            <strong>Nights:</strong> {trip.nights || 'N/A'}
                        </div>
                        <div>
                            <strong>Sleeping:</strong> {trip.sleeping || 'N/A'}
                        </div>
                        <div>
                            <strong>Discover:</strong> {trip.discover || 'N/A'}
                        </div>
                        <div>
                            <strong>Transport:</strong> {trip.transport || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TripInfo;
