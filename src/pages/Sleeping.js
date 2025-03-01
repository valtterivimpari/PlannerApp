import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sleeping.css';
import bookingImage from '../assets/booking.png';

function Sleeping() {
  // Use dynamic URL parameters if defined in the route (optional)
  const { city: urlCity, date: urlDate } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Extract values from location.state
  const { tripId, sleeping: sleepingState, city: stateCity, startDate, nights, destinationIndex } = location.state || {};

  // Local state for trip details
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch trip data from the server
  useEffect(() => {
    async function fetchTrip() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
        // Ensure destinations is an array
        if (data.destinations && typeof data.destinations === 'string') {
          data.destinations = JSON.parse(data.destinations);
        }
        setTrip(data);
      } catch (error) {
        console.error('Error fetching trip:', error);
      } finally {
        setLoading(false);
      }
    }
    if (!sleepingState) {
      fetchTrip();
    } else {
      setTrip({ sleeping: sleepingState, city: stateCity });
      setLoading(false);
    }
  }, [tripId, sleepingState, stateCity]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Determine sleeping details:
  // If a destinationIndex is provided and trip.destinations exist, use that destination's sleeping details.
  let sleepingDetails = null;
  if (destinationIndex !== undefined && trip && trip.destinations) {
    sleepingDetails = trip.destinations[destinationIndex]?.sleeping || null;
  } else {
    sleepingDetails = trip.sleeping;
  }

  const isCustom = sleepingDetails && sleepingDetails.custom;
  // Prefer stateCity if provided; otherwise fallback to URL parameter.
  const displayCity = isCustom ? sleepingDetails.city : (stateCity || urlCity);
  const displayNights = isCustom ? sleepingDetails.nights : (nights || 1);

  let formattedCheckin, formattedCheckout;
  if (isCustom) {
    formattedCheckin = sleepingDetails.checkinDate;
    formattedCheckout = sleepingDetails.checkoutDate || '—';
  } else {
    const numNights = nights || 1;
    const validStartDate = startDate && !isNaN(new Date(startDate))
      ? startDate
      : new Date().toISOString();
    const checkinDateObj = new Date(validStartDate);
    const checkoutDateObj = new Date(checkinDateObj);
    checkoutDateObj.setDate(checkinDateObj.getDate() + numNights);
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    formattedCheckin = isNaN(checkinDateObj) ? 'Invalid Date' : checkinDateObj.toLocaleDateString('fi-FI', options);
    formattedCheckout = isNaN(checkoutDateObj) ? 'Invalid Date' : checkoutDateObj.toLocaleDateString('fi-FI', options);
  }

  // Build the booking.com URL dynamically using displayCity.
  const bookingLink = `https://www.booking.com/searchresults.fi.html?ss=${encodeURIComponent(displayCity)}`;

  const handleEditCustom = () => {
    const newStartDate = (sleepingDetails && sleepingDetails.rawCheckin) ? sleepingDetails.rawCheckin : startDate;
    navigate('/add-custom', {
      state: { tripId, city: displayCity, startDate: newStartDate, nights, sleeping: sleepingDetails, destinationIndex },
    });
  };

  const handleDeleteCustom = async () => {
    try {
      const token = localStorage.getItem('token');
      if (destinationIndex !== undefined) {
        // Fetch the latest trip details.
        const tripResponse = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentTrip = tripResponse.data;
        let destinations = currentTrip.destinations || [];
        // Update the specific destination.
        if (destinations[destinationIndex]) {
          destinations[destinationIndex].sleeping = null;
        }
        // Save updated destinations.
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Also clear the top-level sleeping field.
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { sleeping: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Sleeping details deleted for destination index', destinationIndex);
        navigate('/trip-info', { state: { tripId } });
      } else {
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { sleeping: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Custom sleeping details deleted');
        navigate(`/sleeping/${encodeURIComponent(displayCity)}/${startDate}`, {
          state: { tripId, city: displayCity, startDate, nights },
        });
      }
    } catch (error) {
      console.error('Error deleting custom sleeping details:', error);
    }
  };

  return (
    <div className="sleeping-container">
      <div className="sleeping-info">
        <h2>
          {displayNights} {displayNights === 1 ? 'night' : 'nights'} in <span className="city-name">{displayCity}</span>
        </h2>
        <p>
          {formattedCheckin} - {formattedCheckout}
        </p>
      </div>
      <div className="booking-link">
        <a href={bookingLink} target="_blank" rel="noopener noreferrer">
          <img src={bookingImage} alt="Booking.com" className="booking-logo" />
          Find Hotels on Booking.com
        </a>
      </div>
      <div className="custom-button">
        <button
          className="add-custom-button"
          onClick={() => {
            navigate('/add-custom', {
              state: { tripId, city: displayCity, startDate, nights, destinationIndex },
            });
          }}
        >
          <span className="plus-icon">+</span>
          Add custom
        </button>
      </div>
      {isCustom && (
        <div className="custom-summary">
          <h3>Custom Accommodation Details</h3>
          <p><strong>Type:</strong> {sleepingDetails.type}</p>
          <p><strong>Name:</strong> {sleepingDetails.name}</p>
          <p>
            <strong>Breakfast:</strong> {sleepingDetails.breakfast === 'yes' ? 'Included' : 'Not included'}
          </p>
          <p><strong>Link:</strong> {sleepingDetails.link}</p>
          <p><strong>Notes:</strong> {sleepingDetails.notes}</p>
          <div className="summary-buttons">
            <button className="edit-button" onClick={handleEditCustom}>
              Edit
            </button>
            <button className="delete-button" onClick={handleDeleteCustom}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sleeping;



