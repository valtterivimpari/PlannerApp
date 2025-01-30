import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Flights.css';
import { useFlightContext } from './FlightContext';

const Flights = () => {
    const { origin = 'Unknown Departure', destination = 'Unknown Destination', date } = useParams();
    const navigate = useNavigate();
    const formattedDate = date ? new Date(date).toLocaleDateString('fi-FI') : 'Unknown Date';
    const { flightDetails, setFlightDetails, fetchFlightDetails } = useFlightContext();
    const [token, setToken] = useState(localStorage.getItem('token'));

    const [departureTime, setDepartureTime] = useState(flightDetails.departureTime || '');
    const [arrivalTime, setArrivalTime] = useState(flightDetails.arrivalTime || '');
    const [notes, setNotes] = useState(flightDetails.notes || '');
    const [customInputs, setCustomInputs] = useState(
        flightDetails.customInputs && flightDetails.customInputs.length > 0
            ? flightDetails.customInputs
            : [
                { id: 1, label: 'Link', placeholder: 'Enter link...', value: '' },
                { id: 2, label: 'Departure Airport', placeholder: 'Enter departure location...', value: '' },
                { id: 3, label: 'Arrival Airport', placeholder: 'Enter arrival location...', value: '' },
                { id: 4, label: 'Booking number', placeholder: 'Enter booking number...', value: '' },
                { id: 5, label: 'Flight number', placeholder: 'Enter flight number...', value: '' },
                { id: 6, label: 'Operator', placeholder: 'Enter operator...', value: '' },
                { id: 7, label: 'Seat number', placeholder: 'Enter seat number...', value: '' },
            ]
    );

    const [savedDetails, setSavedDetails] = useState(null);

    const handleCustomInputChange = (id, value) => {
        setCustomInputs((prevInputs) =>
            prevInputs.map((input) => (input.id === id ? { ...input, value } : input))
        );
    };

    useEffect(() => {
        if (!token) {
            console.error("User is not authenticated. Cannot fetch flights.");
            return;
        }
        
        fetchFlightDetails(token);
    }, [token, fetchFlightDetails]);
    
    useEffect(() => {
        if (flightDetails && Object.keys(flightDetails).length > 0) {
            setSavedDetails(flightDetails);
        }
    }, [flightDetails]);
    

    const handleSaveDetails = async () => {
        if (!token) {
            console.error("No token found. Please log in.");
            return;
        }
    
        try {
            console.log("Saving flight details:", {
                origin, destination, date, departureTime, arrivalTime, notes, customInputs
            });
    
            const response = await axios.post('/api/flights', {
                origin, destination, date, departureTime, arrivalTime, notes, customInputs
            }, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
    
            console.log("Server response:", response.data);
            setFlightDetails(response.data);
            setSavedDetails(response.data);
    
            // Fetch updated flight details from backend
            fetchFlightDetails(token);
    
        } catch (error) {
            console.error('Error saving flight details:', error.response ? error.response.data : error);
        }
    };
    
    
    
    const handleEditDetails = () => {
        setSavedDetails(null);
    };

    const handleDeleteDetails = () => {
        setSavedDetails(null);
        setFlightDetails({});
    };

    const handleReadyToGo = () => {
        navigate(`/transport/${origin}/${destination}/2025-01-08T22:00:00.000Z`);
    };

    return (
        <div className="flights-page">
            <div className="flight-header">
                <h1>Flight Details</h1>
                <p>
                    Travel by plane from <strong>{origin}</strong> to <strong>{destination}</strong> on <strong>{formattedDate}</strong>.
                </p>
            </div>

            {!savedDetails ? (
                <>
                    <div className="time-inputs">
                        <div>
                            <label htmlFor="departure-time">Departure Time:</label>
                            <input
                                type="time"
                                id="departure-time"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="arrival-time">Arrival Time:</label>
                            <input
                                type="time"
                                id="arrival-time"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="notes-section">
                        <label htmlFor="notes">Notes:</label>
                        <textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes here..."
                        ></textarea>
                    </div>

                    <div className="custom-inputs">
                        <h2>Additional Information</h2>
                        {customInputs.map((input) => (
                            <div key={input.id} className="custom-input">
                                <label>{input.label}:</label>
                                <input
                                    type="text"
                                    placeholder={input.placeholder}
                                    value={input.value || ''}
                                    onChange={(e) => handleCustomInputChange(input.id, e.target.value)}
                                />
                                <button
                                    onClick={() =>
                                        setCustomInputs((prevInputs) =>
                                            prevInputs.filter((item) => item.id !== input.id)
                                        )
                                    }
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={() =>
                                setCustomInputs([...customInputs, { id: Date.now(), label: 'Custom Field', placeholder: 'Enter value...' }])
                            }
                            className="add-button"
                        >
                            Add Custom Field
                        </button>
                    </div>

                    <button onClick={handleSaveDetails} className="add-button">
                        Save Flight Details
                    </button>
                </>
            ) : (
                <div className="saved-details">
                    <h2>Saved Flight Details</h2>
                    <p><strong>Departure Time:</strong> {savedDetails.departureTime}</p>
                    <p><strong>Arrival Time:</strong> {savedDetails.arrivalTime}</p>
                    <p><strong>Notes:</strong> {savedDetails.notes}</p>
                    <h3>Additional Information:</h3>
                    <ul>
                        {savedDetails.customInputs.map((input, index) => (
                            <li key={index}>
                                <strong>{input.label}:</strong> {input.value}
                            </li>
                        ))}
                    </ul>
                    <div className="action-buttons">
                        <button onClick={handleEditDetails} className="edit-button">Edit</button>
                        <button onClick={handleDeleteDetails} className="delete-button">Delete</button>
                        <button onClick={handleReadyToGo} className="ready-button">Ready to go!</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Flights;