import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Destination.css';
import axios from 'axios'; // Ensure axios is installed and imported

function Destination() {
    const { id } = useParams();
    const [trip, setTrip] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTrip = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token found');
                return;
            }
    
            try {
                const response = await axios.get(`http://localhost:5000/api/trips/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
    
                if (response.data.destinations && response.data.destinations.length > 0) {
                    navigate(`/trip-info/${id}`);
                } else {
                    setTrip(response.data);
                    setSelectedCountry(response.data.selected_country || '');
                }
            } catch (error) {
                console.error('Error fetching trip:', error);
            }
        };
    
        fetchTrip();
    }, [id, navigate]);
    

    const handleDestinationSelection = async (country) => {
        setSelectedCountry(country);
    
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }
    
        try {
            // Send the selected destination to the server and update trip info
            const response = await axios.put(
                `http://localhost:5000/api/trips/${id}/add-destination`,
                { newDestination: { name: country, nights: 1 } },
                { headers: { Authorization: `Bearer ${token}` } }
            );
    
            if (response.status === 200) {
                console.log('Destination added successfully');
                navigate(`/trip-info/${id}`);
            } else {
                console.error('Failed to add destination');
            }
        } catch (error) {
            console.error('Error adding destination:', error);
        }
    };
    
    

    if (!trip) return <p>Loading...</p>;

    return (
        <div className="destination-container">
            <h1>Your trip to {selectedCountry || 'Select a country'}</h1>
            <div className="destination-input-container">
            <input
    type="text"
    className="destination-input"
    placeholder="Search any place in the world..."
    onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            handleDestinationSelection(e.target.value.trim());
        }
    }}
/>
            </div>
        </div>
    );
}

export default Destination;
