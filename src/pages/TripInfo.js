import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './TripInfo.css';
import axios from 'axios';

function TripInfo() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchTripDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/trips/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                setTrip(response.data);
            } catch (err) {
                console.error('Error fetching trip details:', err);
                console.log('Trip ID from URL:', id);
                
                

                setError('Failed to fetch trip details.');
            }
        };
    
        fetchTripDetails();
    }, [id]);
    

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!trip) return <p>Loading...</p>;

    return (
        <div className="trip-info">
            <div className="trip-header">
                <h1>{trip.tripName}</h1>
                <p>
                    <span>{trip.startDate}</span> - <span>{trip.endDate}</span>
                </p>
            </div>
            <div className="trip-body">
                <h2>Country: {trip.selectedCountry}</h2>
                {trip.notes && <p>Notes: {trip.notes}</p>}
                <div className="trip-destinations">
                    <h3>Destinations</h3>
                    {trip.destinations?.map((destination, index) => (
                        <div key={index} className="destination-item">
                            <h4>{destination.name}</h4>
                            <p>{destination.startDate} - {destination.endDate}</p>
                        </div>
                    ))}
                    <button className="add-destination-button">+ Add New Destination</button>
                </div>
            </div>
        </div>
    );
}

export default TripInfo;
