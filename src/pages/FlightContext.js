import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const FlightContext = createContext();

export const useFlightContext = () => useContext(FlightContext);

export const FlightProvider = ({ children }) => {
    const [flightDetails, setFlightDetails] = useState({});

    const fetchFlightDetails = async (token) => {
        if (!token) {
            console.error('No token found. User is not authenticated.');
            return;
        }
    
        try {
            const response = await axios.get('http://localhost:5000/api/flights', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log("Fetched flights:", response.data);
    
            // ✅ Ensure customInputs is always an array
            if (response.data.length > 0) {
                const latestFlight = response.data[0];
                latestFlight.custom_inputs = latestFlight.custom_inputs || []; // ✅ Default to an empty array
                setFlightDetails(latestFlight);
            }
        } catch (error) {
            console.error('Error fetching flight details:', error.response ? error.response.data : error);
        }
    };
    
    
    
    

    return (
        <FlightContext.Provider value={{ flightDetails, setFlightDetails, fetchFlightDetails }}>
            {children}
        </FlightContext.Provider>
    );
};
