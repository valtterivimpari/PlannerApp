import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Discover.css';

// Logos for the main links
import tripadvisorLogo from '../assets/tripadvisor.png';
import getYourGuideLogo from '../assets/getyourguide.png';
import viatorLogo from '../assets/viator.png';

// Icons for the custom menu items (placeholders—replace with your own)
import todoIcon from '../assets/todo.png';        // e.g., camera icon or activity icon
import eatDrinkIcon from '../assets/eatdrink.png'; // e.g., fork & knife icon

function Discover() {
  const { city: urlCity, date: urlDate } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { tripId, discover: discoverState, city: stateCity, startDate, nights, destinationIndex } = location.state || {};

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false); // controls the custom menu visibility


  // Fetch trip details from server
  useEffect(() => {
    async function fetchTrip() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = response.data;
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

    if (!discoverState) {
      fetchTrip();
    } else {
      setTrip({ discover: discoverState, city: stateCity });
      setLoading(false);
    }
  }, [tripId, discoverState, stateCity]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Determine discover details
  // Determine discover details
let discoverDetails = null;
if (destinationIndex !== undefined && trip?.destinations) {
  discoverDetails = trip.destinations[destinationIndex]?.discover || null;
} else {
  discoverDetails = trip.discover;
}

// Determine discover details for the current destination or top-level field:
let discoverEntries = [];
if (destinationIndex !== undefined && trip?.destinations) {
  discoverEntries = trip.destinations[destinationIndex]?.discover || [];
} else {
  discoverEntries = trip.discover || [];
}

// Ensure discoverEntries is always an array
if (!Array.isArray(discoverEntries)) {
  discoverEntries = [discoverEntries];
}

// Now you can filter safely:
const todoEntries = discoverEntries.filter(entry => entry.type === 'todo');
const eatDrinkEntries = discoverEntries.filter(entry => entry.type === 'eatdrink');


// Define isCustom before using it
const isCustom = discoverDetails ? discoverDetails.custom : false;

// Prefer city from custom discover details; then check location.state; then fall back to trip data
const displayCity = isCustom 
  ? discoverDetails.city 
  : (stateCity || urlCity || (trip && trip.selected_country) || 'Unknown City');

// Compute date range using location.state or fallback to trip.start_date
let formattedCheckin, formattedCheckout;
if (isCustom) {
  formattedCheckin = discoverDetails.checkinDate;
  formattedCheckout = discoverDetails.checkoutDate || '—';
} else {
    const baseStartDate = startDate || (trip && trip.start_date) || new Date().toISOString();
  const numNights = nights || 1;
  const checkinDateObj = new Date(baseStartDate);
  const checkoutDateObj = new Date(checkinDateObj);
  checkoutDateObj.setDate(checkinDateObj.getDate() + numNights);
  const options = { day: 'numeric', month: 'short', weekday: 'short' };
  formattedCheckin = isNaN(checkinDateObj) ? 'Invalid Date' : checkinDateObj.toLocaleDateString('fi-FI', options);
  formattedCheckout = isNaN(checkoutDateObj) ? 'Invalid Date' : checkoutDateObj.toLocaleDateString('fi-FI', options);
}


  // Example external links
  const tripAdvisorLink = `https://www.tripadvisor.com/Search?q=${encodeURIComponent(displayCity)}`;
  const getYourGuideLink = `https://www.getyourguide.com/search?q=${encodeURIComponent(displayCity)}`;
  const viatorLink = `https://www.viator.com/searchResults/all?text=${encodeURIComponent(displayCity)}`;

  // Menu item handlers
  const handleAddToDo = () => {
    navigate('/add-todo', {
      state: {
        tripId,
        city: displayCity,
        startDate,
        nights,
        destinationIndex,
        discover: discoverDetails,
        type: 'todo'
      },
    });
  };
  

  const handleAddEatDrink = () => {
    // Navigate to Add Custom with type 'eatdrink'
    navigate('/add-eatdrink', {
      state: {
        tripId,
        city: displayCity,
        startDate,
        nights,
        destinationIndex,
        discover: discoverDetails,
      },
    });
  };

  // Deletion logic remains unchanged
  const handleDeleteCustom = async () => {
    try {
      const token = localStorage.getItem('token');
      if (destinationIndex !== undefined) {
        const tripResponse = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentTrip = tripResponse.data;
        let destinations = currentTrip.destinations || [];
        if (destinations[destinationIndex]) {
          destinations[destinationIndex].discover = null;
        }
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { discover: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/discover/${encodeURIComponent(displayCity)}/${startDate}`, {
          state: { tripId, city: displayCity, startDate, nights, destinationIndex },
        });
      } else {
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { discover: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate(`/discover/${encodeURIComponent(displayCity)}/${startDate}`, {
          state: { tripId, city: displayCity, startDate, nights },
        });
      }
    } catch (error) {
      console.error('Error deleting custom discover details:', error);
    }
  };

  return (
    <div className="discover-container">
      <div className="discover-info">
        <h2>
          Discover <span className="discover-city-name">{displayCity}</span>
        </h2>
        <p>{formattedCheckin} - {formattedCheckout}</p>
      </div>

      {/* Stacked external links */}
      <div className="discover-extra-links">
        <div className="discover-link">
          <a href={tripAdvisorLink} target="_blank" rel="noopener noreferrer">
            <img src={tripadvisorLogo} alt="TripAdvisor" className="discover-logo" />
            TripAdvisor
          </a>
        </div>
        <div className="discover-link">
          <a href={getYourGuideLink} target="_blank" rel="noopener noreferrer">
            <img src={getYourGuideLogo} alt="GetYourGuide" className="discover-logo" />
            GetYourGuide
          </a>
        </div>
        <div className="discover-link">
          <a href={viatorLink} target="_blank" rel="noopener noreferrer">
            <img src={viatorLogo} alt="Viator" className="discover-logo" />
            Viator
          </a>
        </div>
      </div>

      {/* Toggle button for the custom menu */}
      <div className="custom-button">
        <button
          className="discover-add-custom-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <span className="discover-plus-icon">+</span>
          Add Custom
        </button>
      </div>

      {/* The small menu with two options: "Add to do" and "Add eat & drink" */}
      {showMenu && (
      <div className="custom-menu">
        <div className="custom-menu-item" onClick={handleAddToDo}>
          <img src={todoIcon} alt="Add to do" className="custom-menu-icon" />
          <span>Add to do</span>
        </div>
        <div className="custom-menu-item" onClick={handleAddEatDrink}>
          <img src={eatDrinkIcon} alt="Add eat & drink" className="custom-menu-icon" />
          <span>Add eat & drink</span>
        </div>
      </div>
    )}

<div className="discover-custom-summary">
  <div className="custom-entries">
    {todoEntries.length > 0 && (
      <div className="custom-card">
        <h4>To Do</h4>
        {todoEntries.map((entry, index) => (
          <div key={`todo-${index}`}>
            <p><strong>To do:</strong> {entry.description}</p>
            <p>
              <strong>Categories:</strong>{' '}
              {entry.categories && entry.categories.length > 0
                ? entry.categories.join(', ')
                : 'None'}
            </p>
            <p>
            </p>
          </div>
        ))}
      </div>
    )}

<button
  className="discover-calendar-button"
  onClick={() => {
    // Pass the trip's startDate, nights, and the complete custom entries array
    navigate('/calendar', {
      state: {
        tripId,
        startDate,
        nights,
        events: discoverEntries  // this is your array of custom entries (both todo and eatdrink)
      }
    });
  }}
>
  Calendar View
</button>
  </div>
  <div className="discover-summary-buttons">
    {/* Edit and Delete buttons – consider enhancing these later */}
    <button className="discover-edit-button" onClick={handleAddToDo}>
      Edit
    </button>
    <button className="discover-delete-button" onClick={handleDeleteCustom}>
      Delete
    </button>
  </div>
</div>

  </div>
);
}

export default Discover;

