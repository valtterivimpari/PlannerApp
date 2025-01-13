import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import './Flights.css';

const Flights = () => {
    const { origin = 'Unknown Departure', destination = 'Unknown Destination', date } = useParams();
    const formattedDate = date ? new Date(date).toLocaleDateString('fi-FI') : 'Unknown Date';

    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [notes, setNotes] = useState('');
    const [customInputs, setCustomInputs] = useState([
        { id: 1, label: 'Link', placeholder: 'Enter link...' },
        { id: 2, label: 'Departure Airport', placeholder: 'Enter departure location...' },
        { id: 3, label: 'Arrival Airport', placeholder: 'Enter arrival location...' },
        { id: 4, label: 'Booking number', placeholder: 'Enter booking number...' },
        { id: 5, label: 'Flight number', placeholder: 'Enter flight number...' },
        { id: 6, label: 'Operator', placeholder: 'Enter operator...' },
        { id: 7, label: 'Seat number', placeholder: 'Enter seat number...' },
    ]);

    const handleCustomInputChange = (id, value) => {
        setCustomInputs((prevInputs) =>
            prevInputs.map((input) =>
                input.id === id ? { ...input, value } : input
            )
        );
    };

    const handleDeleteCustomInput = (id) => {
        setCustomInputs((prevInputs) =>
            prevInputs.filter((input) => input.id !== id)
        );
    };

    const handleAddCustomInput = () => {
        const newId = customInputs.length + 1;
        setCustomInputs([
            ...customInputs,
            { id: newId, label: `Custom Field ${newId}`, placeholder: 'Enter value...' },
        ]);
    };

    return (
        <div className="flights-page">
            <div className="flight-header">
                <h1>Flight Details</h1>
                <p>
                    Travel by plane from <strong>{origin}</strong> to <strong>{destination}</strong> on <strong>{formattedDate}</strong>.
                </p>
            </div>

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
                            onChange={(e) =>
                                handleCustomInputChange(input.id, e.target.value)
                            }
                        />
                        <button
                            onClick={() => handleDeleteCustomInput(input.id)}
                            className="delete-button"
                        >
                            Delete
                        </button>
                    </div>
                ))}
                <button onClick={handleAddCustomInput} className="add-button">
                    Add Custom Field
                </button>
            </div>
        </div>
    );
};

export default Flights;
