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
            console.log("Fetching flights with token:", token);
            const response = await axios.get('/api/flights', {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log("Fetched flights:", response.data);
    
            // If flights exist, set the most recent one
            if (response.data.length > 0) {
                setFlightDetails(response.data[0]); // Set the latest flight
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
