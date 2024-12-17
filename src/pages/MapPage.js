import React from 'react';
import { useParams } from 'react-router-dom';
import MapView from '../components/MapView';


const MapPage = () => {
    const { destination } = useParams(); // Extract destination from the URL

    return (
        <div style={{ padding: '20px' }}>
            <h1>Map View for {destination}</h1>
            <MapView destination={destination} />
            <button
                onClick={() => window.history.back()}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                }}
            >
                Go Back
            </button>
        </div>
    );
};

export default MapPage;
