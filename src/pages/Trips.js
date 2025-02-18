import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Trips.css';

function Trips() {
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [countryImages, setCountryImages] = useState({}); // Store country-to-image mapping


    const UNSPLASH_API_KEY = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
    console.log('Unsplash API Key:', UNSPLASH_API_KEY);    
    console.log('Test Variable:', process.env.REACT_APP_TEST_VARIABLE);
    console.log('Test Variable:', process.env.REACT_APP_TEST_VARIABLE);
    console.log(process.env); // Log all environment variables to check if it's loaded correctly.
    console.log('All Environment Variables:', process.env);






    const formatDateToDDMMYYYY = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Fetch a random image for a country using Unsplash API
    const fetchCountryImage = async (country) => {
        if (!country || countryImages[country]) return; 

        try {
            const response = await axios.get(`https://api.unsplash.com/search/photos`, {
                params: {
                    query: country,
                    client_id: UNSPLASH_API_KEY, // now defined!
                    per_page: 1,
                },
            });
            

            const imageUrl =
                response.data.results.length > 0
                    ? response.data.results[0].urls.regular
                    : '/images/fallback.jpg'; // Fallback image

            setCountryImages((prev) => ({ ...prev, [country]: imageUrl }));
        } catch (error) {
            console.error(`Error fetching image for ${country}:`, error);
            setCountryImages((prev) => ({ ...prev, [country]: '/images/fallback.jpg' }));
        }
    };

    useEffect(() => {
        const fetchTrips = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found, redirecting to login...');
                navigate('/login');
                return;
            }
    
            try {
                const response = await axios.get('http://localhost:5000/api/trips', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Fetched trips:', response.data);
                console.log('Number of trips:', trips.length);
console.log('Trips:', trips);

                setTrips(response.data);
            } catch (error) {
                console.error('Error fetching trips:', error.response || error.message);
            }
        };
        fetchTrips();
    }, [navigate]);
    
    useEffect(() => {
        trips.forEach((trip) => {
          if (trip.selected_country) {
            fetchCountryImage(trip.selected_country);
          }
        });
      }, [trips]);
      
    

    const handleDeleteTrip = async (tripId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found, redirecting to login...');
            navigate('/login');
            return;
        }
    
        try {
            await axios.delete(`http://localhost:5000/api/trips/${tripId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTrips((prevTrips) => prevTrips.filter((trip) => trip.id !== tripId)); // Remove the deleted trip from the state
            console.log('Trip deleted successfully');
        } catch (error) {
            console.error('Error deleting trip:', error.response || error.message);
        }
    };
    
   // Trips.js
return (
    <div className="trips-container">
      <h2>Your Trips</h2>
      {trips.length > 0 ? (
        trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <h3>📍 {trip.trip_name || 'Unnamed Trip'}</h3>
            <p>Country: {trip.selected_country || 'Unknown'}</p>
            <p>
              📅 {trip.start_date ? formatDateToDDMMYYYY(trip.start_date) : 'N/A'} -
              {trip.end_date ? formatDateToDDMMYYYY(trip.end_date) : 'N/A'}
            </p>
            <button
              className="details-button"
              onClick={() => navigate(`/destination/${trip.id}`)}
            >
              View Details
            </button>
            <button
              className="delete-button"
              onClick={() => handleDeleteTrip(trip.id)}
            >
              Delete Trip
            </button>
          </div>
        ))
      ) : (
        <p>No trips yet. Create your first trip!</p>
      )}
    </div>
  );
  
      
    
}

export default Trips;
