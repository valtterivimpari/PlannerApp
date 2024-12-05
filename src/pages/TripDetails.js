import React from 'react';
import { useParams } from 'react-router-dom';

function TripDetails() {
    const { id } = useParams();
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    const trip = trips[id];

    if (!trip) return <p>Trip not found.</p>;

    return (
        <div className="trip-details">
            <h1>{trip.tripName}</h1>
            <p>Country: {trip.selectedCountry}</p>
            <p>
    Dates: {formatDateToDDMMYYYY(trip.startDate)} - {formatDateToDDMMYYYY(trip.endDate)}
</p>

        </div>
    );
}


export default TripDetails;
