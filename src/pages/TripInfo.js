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
                    nights: destination.nights || 1, // Default to 1 if null or undefined
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
    
    
     // Function to calculate the start date for each destination
     const calculateStartDate = (tripStartDate, destinationIndex) => {
        if (!tripStartDate || isNaN(new Date(tripStartDate))) {
            console.error('Invalid tripStartDate:', tripStartDate);
            return 'Invalid Date';
        }
    
        const startDate = new Date(tripStartDate);
        destinations.slice(0, destinationIndex).forEach((destination) => {
            startDate.setDate(startDate.getDate() + (destination.nights || 1));
        });
        return startDate; // Return a valid Date object
    };
    
    
    
    

    const formatDateRange = (startDate, nights) => {
        if (!startDate || isNaN(new Date(startDate))) {
            console.error('Invalid startDate in formatDateRange:', startDate);
            return 'Invalid Date';
        }
    
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + nights);
    
        const options = { day: 'numeric', month: 'short', weekday: 'short' };
        return `${start.toLocaleDateString('fi-FI', options)} - ${end.toLocaleDateString('fi-FI', options)}`;
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
        updatedDestinations[index].nights = (updatedDestinations[index].nights || 1) + 1;
        setDestinations(updatedDestinations);
        saveUpdatedDestinations(updatedDestinations);
    };
    
    const handleDecrement = (index) => {
        console.log('Decrementing nights for destination at index:', index);
        const updatedDestinations = [...destinations];
        if ((updatedDestinations[index].nights || 1) > 1) {
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
    
    

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
if (!trip) return <p>Loading...</p>;

return (
    <div className="trip-info">
        <div className="trip-header">
            <h1>{trip.trip_name || 'Unnamed Trip'}</h1>
            <p>
            Selected Dates: <strong>{new Date(trip.start_date).toLocaleDateString()}</strong> -{' '}
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

                    <div>
                        <strong>Sleeping:</strong>
                        {trip.sleeping ? (
                            trip.sleeping
                        ) : (
                            <button onClick={() => console.log('Add sleeping details')} className="add-sleeping-button">
                                +
                            </button>
                        )}
                    </div>
                    <div>
                        <strong>Discover:</strong>
                        {trip.discover ? (
                            trip.discover
                        ) : (
                            <button onClick={() => console.log('Add discover details')} className="add-discover-button">
                                +
                            </button>
                        )}
                    </div>
                    <div>
                        <strong>Transport:</strong>
                        {trip.transport ? (
                            trip.transport
                        ) : (
                            <button onClick={() => console.log('Add transport details')} className="add-transport-button">
                                +
                            </button>
                        )}
                    </div>
                </div>
                <div className="trip-destinations">
    <h2>Destinations</h2>
    {destinations.map((destination, index) => (
        <div className="destination-item" key={index}>
            <div>
                <h4>{`${index + 1}. ${destination.name}`}</h4>
                {/* Display the date range under the city name */}
                <p>
    {calculateStartDate(trip.start_date, index) !== 'Invalid Date'
        ? formatDateRange(calculateStartDate(trip.start_date, index), destination.nights)
        : 'Invalid Date'}
</p>




            </div>
            <div className="nights-counter">
                <strong>Nights:</strong>
                <button onClick={() => handleDecrement(index)}>-</button>
                <span>{destination.nights || 1}</span> {/* Default to 1 */}
                <button onClick={() => handleIncrement(index)}>+</button>
            </div>
            <div className="destination-buttons">
                <button
                    className="delete-button"
                    onClick={() => handleRemoveDestination(index)}
                >
                    Delete
                </button>
                <button
                    className="map-button"
                    onClick={() => navigate(`/map-view/${encodeURIComponent(destination.name)}`)}
                >
                    Map View
                </button>
            </div>
        </div>
    ))}
    <div className="add-destination">
        <input
            type="text"
            value={newDestination}
            onChange={(e) => setNewDestination(e.target.value)}
            placeholder="Add new destination"
        />
        <button onClick={handleAddDestination}>Add</button>
    </div>
</div>

            </div>
        </div>
    </div>
);
}


export default TripInfo;
