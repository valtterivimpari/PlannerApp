import React, { createContext, useState, useContext } from 'react';

const FlightContext = createContext();

export const useFlightContext = () => useContext(FlightContext);

export const FlightProvider = ({ children }) => {
    const [flightDetails, setFlightDetails] = useState({});

    return (
        <FlightContext.Provider value={{ flightDetails, setFlightDetails }}>
            {children}
        </FlightContext.Provider>
    );
};
