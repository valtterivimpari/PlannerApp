import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const FlightContext = createContext();

export const useFlightContext = () => useContext(FlightContext);

export const FlightProvider = ({ children }) => {
    const [flightDetails, setFlightDetails] = useState({});

    const fetchFlightDetails = async (token, origin, destination, date) => {
        if (!token || !origin || !destination || !date) {
            console.error('Missing token or flight details. Cannot fetch.');
            return;
        }
    
        try {
            const response = await axios.get(`http://localhost:5000/api/flights/${origin}/${destination}/${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            console.log("Fetched flight details:", response.data);
    
            if (response.data) {
                setFlightDetails(response.data);
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
