import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './TripInfo.css';

function TripInfo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [trip, setTrip] = useState(null);
    const [error, setError] = useState(null);
    const [nights, setNights] = useState(0); // State for nights
    const [endDate, setEndDate] = useState(''); // State for dynamically updated end_date
    const location = useLocation();
    const destinationName = location.state?.selectedDestination || trip?.selected_country || 'Unknown';
    const [destinations, setDestinations] = useState(trip?.destinations || []);
    const [newDestination, setNewDestination] = useState('');
    const selectedDestination = location.state?.selectedDestination;
    const [distances, setDistances] = useState([]);
    const [drivingTimes, setDrivingTimes] = useState([]);



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
                const updatedDestinations = response.data.destinations.map(destination => ({
                    ...destination,
                    nights: destination.nights ?? 1,
                }));
                setTrip({ ...response.data, destinations: updatedDestinations });
                setDestinations(updatedDestinations);
                setEndDate(response.data.end_date);
            } catch (err) {
                console.error('Error fetching trip details:', err);
                setError('Failed to fetch trip details.');
            }
        };
    
        fetchTripDetails();
    }, [id]);


    useEffect(() => {
        const calculateDistances = async () => {
            const coords = [];
            for (const destination of destinations) {
                const coordinates = await fetchCoordinates(destination.name);
                coords.push(coordinates);
            }
    
            const calculatedDistances = [];
            const calculatedDrivingTimes = []; // Use a separate variable
    
            for (let i = 0; i < coords.length - 1; i++) {
                if (coords[i] && coords[i + 1]) {
                    const distance = haversineDistance(coords[i], coords[i + 1]);
                    calculatedDistances.push(distance);
    
                    const drivingTime = await fetchDrivingTime(coords[i], coords[i + 1]);
                    calculatedDrivingTimes.push(drivingTime);
                }
            }
    
            console.log("Distances:", calculatedDistances);
            console.log("Driving Times:", calculatedDrivingTimes);
    
            setDistances(calculatedDistances);
            setDrivingTimes(calculatedDrivingTimes); // Update state
        };
    
        if (destinations.length > 1) {
            calculateDistances();
        }
    }, [destinations]);
    
    
    
    
    const calculateStartDate = (tripStartDate, destinationIndex) => {
        if (!tripStartDate || isNaN(new Date(tripStartDate))) {
            console.error('Invalid tripStartDate:', tripStartDate);
            return 'Invalid Date';
        }
    
        const startDate = new Date(tripStartDate);
        for (let i = 0; i < destinationIndex; i++) {
            if (destinations[i].nights > 0) {
                startDate.setDate(startDate.getDate() + destinations[i].nights);
            }
        }
        return startDate;
    };
    
    
    
    
    
    

    const formatDateRange = (startDate, nights) => {
        if (!startDate || isNaN(new Date(startDate))) {
            console.error('Invalid startDate in formatDateRange:', startDate);
            return 'Invalid Date';
        }
    
        const start = new Date(startDate);
        const options = { day: 'numeric', month: 'short', weekday: 'short' };
    
        if (nights === 0) {
            return start.toLocaleDateString('fi-FI', options);
        } else {
            const end = new Date(start);
            end.setDate(start.getDate() + nights);
            return `${start.toLocaleDateString('fi-FI', options)} - ${end.toLocaleDateString('fi-FI', options)}`;
        }
    };
    
    
    
    
    const handleAddDestination = async () => {
        if (!newDestination.trim()) return;
    
        const destinationObject = {
            name: newDestination,
            startDate: '', // Optional logic to add startDate
            endDate: '',   // Optional logic to add endDate
            nights: 1,     // Default to 1
        };
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/trips/${id}/add-destination`,
                { newDestination: destinationObject },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            if (response.data && response.data.destinations) {
                setDestinations(response.data.destinations);
                setNewDestination('');
            } else {
                console.error('Invalid response from server:', response.data);
            }
        } catch (error) {
            console.error('Error adding destination:', error);
        }
    };
      
    
    const handleRemoveDestination = async (index) => {
        const updatedDestinations = destinations.filter((_, i) => i !== index);
    
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/trips/${id}/destinations`,
                { destinations: updatedDestinations },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDestinations(response.data); // Ensure state syncs with server response
            console.log("Destinations updated successfully:", response.data);
        } catch (error) {
            console.error('Error removing destination:', error);
            console.log('End Date:', trip.end_date);
            console.log('Start Date:', calculateStartDate(trip.start_date, index));
console.log('Formatted Date Range:', formatDateRange(calculateStartDate(trip.start_date, index), destination.nights));


        }
    };
    
    const handleIncrement = (index) => {
        console.log('Incrementing nights for destination at index:', index);
        const updatedDestinations = [...destinations];
        updatedDestinations[index].nights = (updatedDestinations[index].nights || 0) + 1;
        setDestinations(updatedDestinations);
        saveUpdatedDestinations(updatedDestinations);
    };
    
    const handleDecrement = (index) => {
        console.log('Decrementing nights for destination at index:', index);
        const updatedDestinations = [...destinations];
        if ((updatedDestinations[index].nights || 0) > 0) {
            updatedDestinations[index].nights -= 1;
            setDestinations(updatedDestinations);
            saveUpdatedDestinations(updatedDestinations);
        }
    };
    
        

    const saveUpdatedDestinations = async (updatedDestinations) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `http://localhost:5000/api/trips/${id}/destinations`,
                { destinations: updatedDestinations },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('Save response:', response.data);
        } catch (error) {
            console.error('Error saving updated destinations:', error);
        }
    };

    const haversineDistance = (coords1, coords2) => {
        const toRadians = (degrees) => (degrees * Math.PI) / 180;
    
        const [lat1, lon1] = coords1;
        const [lat2, lon2] = coords2;
    
        const R = 6371; // Earth's radius in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
    
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
    
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };
    
    const fetchCoordinates = async (city) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${city}`
            );
            const data = await response.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (error) {
            console.error(`Error fetching coordinates for ${city}:`, error);
        }
        return null;
    };

    const fetchDrivingTime = async (originCoords, destinationCoords) => {
        try {
            console.log("Fetching driving time with:", originCoords, destinationCoords);
    
            const response = await axios.get(`http://localhost:5000/api/directions`, {
                params: {
                    start: `${originCoords[1]},${originCoords[0]}`, // Longitude, Latitude
                    end: `${destinationCoords[1]},${destinationCoords[0]}`,
                },
            });
    
            console.log("API Response:", response.data);
    
            const durationInSeconds = response.data.features[0].properties.segments[0].duration;
            const durationInMinutes = Math.ceil(durationInSeconds / 60);
            const hours = Math.floor(durationInMinutes / 60);
            const minutes = durationInMinutes % 60;
    
            return `${hours}h ${minutes}m`;
        } catch (error) {
            console.error('Error fetching driving time:', error);
            return 'Unknown';
        }
    };
    
    
    
    
    
    

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
if (!trip) return <p>Loading...</p>;

return (
    <div className="trip-info">
        <div className="trip-header">
            <h1>{trip.trip_name || 'Unnamed Trip'}</h1>
            <p>
                    Selected Dates: <strong>{new Date(trip.start_date).toLocaleDateString()}</strong> -
                    <strong>{new Date(endDate).toLocaleDateString()}</strong>
                </p>

        </div>
        <div className="trip-body">
            <div className="trip-summary">
                <h2>Plan</h2>
                <div className="summary-grid">
                    <div>
                        <strong>Destination:</strong> {destinationName || 'Unknown'}

                    </div>
                </div>
                <div className="trip-destinations">
                <h2>Destinations</h2>
                {destinations.map((destination, index) => (
    <div className="destination-item" key={index}>
        <div>
            <h4>{`${index + 1}. ${destination.name}`}</h4>
            <p className={destination.nights === 0 ? 'stopover-text' : ''}>
                {destination.nights === 0 ? 'Stopover' : `${destination.nights} nights`}
            </p>
        </div>
        {index > 0 && distances[index - 1] && (
            <div className="distance-display" onClick={() => {
                const travelDate = calculateStartDate(trip.start_date, index);
                navigate(`/transport/${destinations[index - 1].name}/${destination.name}/${travelDate.toISOString()}`, {
                    state: {
                        distance: distances[index - 1]?.toFixed(1),
                        duration: drivingTimes[index - 1],
                        date: travelDate.toISOString(),
                        index,
                    },
                });
            }}>
                <span>{distances[index - 1].toFixed(1)} km</span>
            </div>
        )}
        <p>
            {calculateStartDate(trip.start_date, index) !== 'Invalid Date'
                ? formatDateRange(
                      calculateStartDate(trip.start_date, index),
                      destination.nights
                  )
                : 'Invalid Date'}
        </p>
        <div className="nights-counter">
            <strong>Nights:</strong>
            <button onClick={() => handleDecrement(index)}>-</button>
            <span>{destination.nights === 0 ? 'Stopover' : destination.nights}</span>
            <button onClick={() => handleIncrement(index)}>+</button>
        </div>
        <div className="destination-buttons">
            <button className="delete-button" onClick={() => handleRemoveDestination(index)}>Delete</button>
            <button className="map-button" onClick={() => navigate(`/map-view/${encodeURIComponent(destination.name)}`)}>Map View</button>
        </div>

        {/* Sleeping Section */}
        <div className="sleeping-section">
            <h4>Sleeping</h4>
            <button
                onClick={() =>
                    navigate(
                        `/sleeping/${encodeURIComponent(destination.name)}/${calculateStartDate(trip.start_date, index).toISOString()}`,
                        {
                            state: {
                                tripId: trip.id,
                                city: destination.name,
                                startDate: calculateStartDate(trip.start_date, index).toISOString(),
                                nights: destination.nights,
                                destinationIndex: index,
                            },
                        }
                    )
                }
                className="add-sleeping-button"
            >
                +
            </button>
        </div>

        {/* Discover Section */}
        <div className="discover-section">
            <h4>Discover</h4>
            <button
                onClick={() =>
                    navigate(
                        `/discover/${encodeURIComponent(destination.name)}/${calculateStartDate(trip.start_date, index).toISOString()}`,
                        {
                            state: {
                                tripId: trip.id,
                                city: destination.name,
                                startDate: calculateStartDate(trip.start_date, index).toISOString(),
                                nights: destination.nights,
                                destinationIndex: index,
                            },
                        }
                    )
                }
                className="add-discover-button"
            >
                +
            </button>

        </div>
    </div>
    ))}
     {/* Keep the add-destination block as provided */}
     <div className="add-destination">
                            <input type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)} placeholder="Add new destination" />
                            <button onClick={handleAddDestination}>Add</button>
                            </div>
                        </div>
                    </div>
<div className="budget-section">
  <button 
    className="budget-button" 
    onClick={() => navigate(`/budget-calculator/${trip.id}`)}>
      Budget Calculator
  </button>
</div>

                </div>
            </div>
    );
}

export default TripInfo;