import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AddToDo.css';

const categoriesList = [
  "Sights & Landmarks",
  "Nature & Outdoors",
  "Tours & Attractions",
  "Culture & Entertainment",
  "Sports & Wellness",
  "Beaches & Lakes",
  "Shopping & Souvenirs"
];

const recommendations = [
 
];


function AddToDo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId, city, startDate, nights, destinationIndex } = location.state || {};
  
  // Load any initial todo from discover state (for editing)
  const initialTodo =
    location.state?.discover && location.state.discover.type === 'todo'
      ? location.state.discover
      : {};
  
  // Compute available dates from startDate and nights
  const availableDates = [];
  const tripStart = new Date(startDate);
  for (let i = 0; i <= nights; i++) {
    const d = new Date(tripStart);
    d.setDate(tripStart.getDate() + i);
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    availableDates.push(d.toLocaleDateString('fi-FI', options));
  }
  // State hooks including eventDate (selected date for this event)
  const [time, setTime] = useState(initialTodo.time || '');
  const [description, setDescription] = useState(initialTodo.description || '');
  const [selectedCategories, setSelectedCategories] = useState(initialTodo.categories || []);
  const [eventDate, setEventDate] = useState(initialTodo.eventDate || availableDates[0]);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Compute the overall trip date range (for display purposes)
    const baseStartDate = startDate || new Date().toISOString();
    const numNights = nights || 1;
    const checkinDateObj = new Date(baseStartDate);
    const checkoutDateObj = new Date(checkinDateObj);
    checkoutDateObj.setDate(checkinDateObj.getDate() + numNights);
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    const checkinDateFormatted = isNaN(checkinDateObj)
      ? 'Invalid Date'
      : checkinDateObj.toLocaleDateString('fi-FI', options);
    const checkoutDateFormatted = isNaN(checkoutDateObj)
      ? 'Invalid Date'
      : checkoutDateObj.toLocaleDateString('fi-FI', options);

    // Create custom to do object including the selected eventDate
    const customTodo = {
      custom: true,
      type: 'todo',
      description,
      categories: selectedCategories,
      city,  
      checkinDate: checkinDateFormatted,
      checkoutDate: checkoutDateFormatted,
      time,
      eventDate
    };

    try {
      const token = localStorage.getItem('token');
      if (destinationIndex !== undefined) {
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let tripData = response.data;
        if (tripData.destinations && typeof tripData.destinations === 'string') {
          tripData.destinations = JSON.parse(tripData.destinations);
        }
        if (tripData.destinations[destinationIndex]) {
          // If there are already custom entries, push the new one (ensure it's an array)
          let currentEntries = tripData.destinations[destinationIndex].discover;
          if (!currentEntries) currentEntries = [];
          else if (!Array.isArray(currentEntries)) currentEntries = [currentEntries];
          currentEntries.push(customTodo);
          tripData.destinations[destinationIndex].discover = currentEntries;
        } else {
          tripData.destinations = tripData.destinations || [];
          tripData.destinations[destinationIndex] = { discover: customTodo };
        }
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations: tripData.destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { discover: customTodo },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Navigate back to Discover page. Make sure you pass back the required state.
      navigate(`/discover/${encodeURIComponent(city)}/${startDate}`, {
        state: { tripId, city, startDate, nights, destinationIndex }
      });
    } catch (error) {
      console.error("Error saving custom to do:", error);
    }
  };

  return (
    <div className="addtodo-container">
      <h1>Custom to do</h1>
      <div className="weather-forecast">
        <ul>
          {recommendations.map((rec, index) => (
            <li key={index}>
              <p><strong>{rec.activity}</strong></p>
              <p>Ideal Temperature: {rec.idealTemp}</p>
              <p>{rec.message}</p>
            </li>
          ))}
        </ul>
      </div>
      <form onSubmit={handleSubmit} className="addtodo-form">
        <label>Say what you want to do:</label>
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter your custom to do..."
          required
        />
        <fieldset>
          <legend>Select Categories:</legend>
          <div className="categories-container">
            {categoriesList.map((cat, idx) => (
              <div key={idx} className="category-item">
                <input 
                  type="checkbox"
                  id={`cat-${idx}`}
                  value={cat}
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                <label htmlFor={`cat-${idx}`}>{cat}</label>
              </div>
            ))}
          </div>
        </fieldset>
        <label>Select Time:</label>
        <input 
          type="time" 
          value={time} 
          onChange={(e) => setTime(e.target.value)} 
          required 
        />
        <label>Choose Date:</label>
        <select value={eventDate} onChange={(e) => setEventDate(e.target.value)} required>
          {availableDates.map((d, idx) => (
            <option key={idx} value={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="addtodo-submit-button">Save</button>
      </form>
    </div>
  );
}

export default AddToDo;




