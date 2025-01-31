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

    const [link, setLink] = useState('');
const [departureAirport, setDepartureAirport] = useState('');
const [arrivalAirport, setArrivalAirport] = useState('');
const [bookingNumber, setBookingNumber] = useState('');
const [flightNumber, setFlightNumber] = useState('');
const [operator, setOperator] = useState('');
const [seatNumber, setSeatNumber] = useState('');


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
    
        if (!flightDetails || Object.keys(flightDetails).length === 0) { 
            fetchFlightDetails(token, origin, destination, date);
        }
    }, [token, origin, destination, date]); // ✅ Removed `savedDetails` to prevent unnecessary re-fetching
    
    
    useEffect(() => {
        if (flightDetails && Object.keys(flightDetails).length > 0) {
            setSavedDetails({
                departureTime: flightDetails.departure_time || '',
                arrivalTime: flightDetails.arrival_time || '',
                notes: flightDetails.notes || '',
                link: flightDetails.link || '',
                departureAirport: flightDetails.departure_airport || '',
                arrivalAirport: flightDetails.arrival_airport || '',
                bookingNumber: flightDetails.booking_number || '',
                flightNumber: flightDetails.flight_number || '',
                operator: flightDetails.operator || '',
                seatNumber: flightDetails.seat_number || '',
            });
        }
    }, [flightDetails]);
    
    
    
    
    
    
    
    
    
    
    
    const handleSaveDetails = async () => {
        if (!token) {
            console.error("No token found. Please log in.");
            return;
        }
    
        try {
            console.log("Saving flight details:", { 
                origin, destination, date, departureTime, arrivalTime, notes,
                link, departureAirport, arrivalAirport, bookingNumber, flightNumber, operator, seatNumber 
            });
    
            const response = await axios.post('http://localhost:5000/api/flights', {
                origin, destination, date, 
                departureTime, arrivalTime, 
                notes, link, departureAirport, arrivalAirport, 
                bookingNumber, flightNumber, operator, seatNumber
            }, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
    
            console.log("Server response:", response.data);
    
            // ✅ Make sure savedDetails gets updated properly
            setFlightDetails(response.data);
            setSavedDetails(response.data);
    
        } catch (error) {
            console.error('Error saving flight details:', error.response ? error.response.data : error);
        }
    };
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    const handleEditDetails = () => {
        setSavedDetails(null);
        setFlightDetails(prevDetails => ({
            ...prevDetails,
            departureTime: prevDetails.departureTime || '',
            arrivalTime: prevDetails.arrivalTime || '',
            notes: prevDetails.notes || '',
            customInputs: prevDetails.customInputs || []
        }));
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
    <div>
        <label>Link:</label>
        <input type="text" value={link} onChange={(e) => setLink(e.target.value)} />
    </div>
    <div>
        <label>Departure Airport:</label>
        <input type="text" value={departureAirport} onChange={(e) => setDepartureAirport(e.target.value)} />
    </div>
    <div>
        <label>Arrival Airport:</label>
        <input type="text" value={arrivalAirport} onChange={(e) => setArrivalAirport(e.target.value)} />
    </div>
    <div>
        <label>Booking Number:</label>
        <input type="text" value={bookingNumber} onChange={(e) => setBookingNumber(e.target.value)} />
    </div>
    <div>
        <label>Flight Number:</label>
        <input type="text" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} />
    </div>
    <div>
        <label>Operator:</label>
        <input type="text" value={operator} onChange={(e) => setOperator(e.target.value)} />
    </div>
    <div>
        <label>Seat Number:</label>
        <input type="text" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
    </div>
</div>

<h3>Additional Information:</h3>
<ul>
    {savedDetails.link && <li><strong>Link:</strong> {savedDetails.link}</li>}
    {savedDetails.departureAirport && <li><strong>Departure Airport:</strong> {savedDetails.departureAirport}</li>}
    {savedDetails.arrivalAirport && <li><strong>Arrival Airport:</strong> {savedDetails.arrivalAirport}</li>}
    {savedDetails.bookingNumber && <li><strong>Booking Number:</strong> {savedDetails.bookingNumber}</li>}
    {savedDetails.flightNumber && <li><strong>Flight Number:</strong> {savedDetails.flightNumber}</li>}
    {savedDetails.operator && <li><strong>Operator:</strong> {savedDetails.operator}</li>}
    {savedDetails.seatNumber && <li><strong>Seat Number:</strong> {savedDetails.seatNumber}</li>}
</ul>


    
                    <button onClick={handleSaveDetails} className="add-button">
                        Save Flight Details
                    </button>
                </>
            ) : (
                <div className="saved-details">
                <h2>Saved Flight Details</h2>
                <p><strong>Departure Time:</strong> {savedDetails?.departureTime || 'N/A'}</p>
                <p><strong>Arrival Time:</strong> {savedDetails?.arrivalTime || 'N/A'}</p>
                <p><strong>Notes:</strong> {savedDetails?.notes || 'N/A'}</p>
            
                <h3>Additional Information:</h3>
                <p><strong>Link:</strong> {savedDetails?.link || 'N/A'}</p>
                <p><strong>Departure Airport:</strong> {savedDetails?.departureAirport || 'N/A'}</p>
                <p><strong>Arrival Airport:</strong> {savedDetails?.arrivalAirport || 'N/A'}</p>
                <p><strong>Booking Number:</strong> {savedDetails?.bookingNumber || 'N/A'}</p>
                <p><strong>Flight Number:</strong> {savedDetails?.flightNumber || 'N/A'}</p>
                <p><strong>Operator:</strong> {savedDetails?.operator || 'N/A'}</p>
                <p><strong>Seat Number:</strong> {savedDetails?.seatNumber || 'N/A'}</p>
            
                <div className="action-buttons">
                    <button onClick={handleEditDetails} className="edit-button">Edit</button>
                    <button onClick={handleDeleteDetails} className="delete-button">Delete</button>
                    <button onClick={handleReadyToGo} className="ready-button">Ready to go!</button>
                </div>
            </div>
            

            )}
        </div>
    );
    }
    

export default Flights;