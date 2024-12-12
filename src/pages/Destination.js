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
                setTrip(response.data);
                setSelectedCountry(response.data.selected_country || '');
            } catch (error) {
                console.error('Error fetching trip:', error);
            }
        };

        fetchTrip();
    }, [id]);

    const handleDestinationSelection = (country) => {
        setSelectedCountry(country);
        // Navigate to trip info after selection
        navigate(`/trip-info/${id}`, { state: { selectedCountry: country } });
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
