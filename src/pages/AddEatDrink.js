import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AddEatDrink.css';

function AddEatDrink() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId, city, startDate, nights, destinationIndex, discover: discoverState } = location.state || {};

  // Compute available dates from startDate and nights
  const availableDates = [];
  const tripStart = new Date(startDate);
  for (let i = 0; i <= nights; i++) {
    const d = new Date(tripStart);
    d.setDate(tripStart.getDate() + i);
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    availableDates.push(d.toLocaleDateString('fi-FI', options));
  }

  // Form state fields
  const [name, setName] = useState(discoverState?.name || '');
  const [selectedCategories, setSelectedCategories] = useState(discoverState?.categories || []);
  const [comments, setComments] = useState(discoverState?.comments || '');
  const [visitTime, setVisitTime] = useState(discoverState?.visitTime || '');
  const [eventDate, setEventDate] = useState(discoverState?.eventDate || availableDates[0]);

  // List of categories for Eat & Drink
  const categoriesList = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Drinks & Nightlife",
    "Coffee & Tea",
    "Dessert & Sweets"
  ];

  const handleCategoryChange = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(item => item !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Compute overall trip date range for display (if needed)
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
  
    // Build custom object with the computed dates included and the chosen eventDate
    const customEatDrink = {
      custom: true,
      type: 'eatdrink',
      name,
      categories: selectedCategories,
      comments,
      visitTime,
      city,
      checkinDate: checkinDateFormatted,
      checkoutDate: checkoutDateFormatted,
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
        let currentEntries = tripData.destinations[destinationIndex]?.discover;
        if (!currentEntries) {
          currentEntries = [];
        } else if (!Array.isArray(currentEntries)) {
          currentEntries = [currentEntries];
        }
        currentEntries.push(customEatDrink);
        tripData.destinations[destinationIndex].discover = currentEntries;
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations: tripData.destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let tripData = response.data;
        let currentEntries = tripData.discover;
        if (!currentEntries) {
          currentEntries = [];
        } else if (!Array.isArray(currentEntries)) {
          currentEntries = [currentEntries];
        }
        currentEntries.push(customEatDrink);
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { discover: currentEntries },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Navigate back to Discover page (which now will show only the Calendar View button)
      navigate(`/discover/${encodeURIComponent(city)}/${startDate}`, {
        state: { tripId, city, startDate, nights, destinationIndex }
      });
    } catch (error) {
      console.error("Error saving custom eat & drink:", error);
    }
  };

  return (
    <div className="addeatdrink-container">
      <h1>Add Eat & Drink</h1>
      <form onSubmit={handleSubmit} className="addeatdrink-form">
        <label>Name of the Place:</label>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Enter the name of the place" 
          required 
        />
        <label>Select Categories:</label>
        <div className="categories-container">
          {categoriesList.map((cat, idx) => (
            <div key={idx} className="category-item">
              <input 
                type="checkbox" 
                id={`category-${idx}`}
                value={cat}
                checked={selectedCategories.includes(cat)}
                onChange={() => handleCategoryChange(cat)}
              />
              <label htmlFor={`category-${idx}`}>{cat}</label>
            </div>
          ))}
        </div>
        <label>Comments:</label>
        <textarea 
          value={comments} 
          onChange={(e) => setComments(e.target.value)} 
          placeholder="Add your comments..." 
          required 
        />
        <label>Select Time:</label>
        <input 
          type="time" 
          value={visitTime} 
          onChange={(e) => setVisitTime(e.target.value)} 
          required 
        />
        <label>Choose Date:</label>
        <select value={eventDate} onChange={(e) => setEventDate(e.target.value)} required>
          {availableDates.map((d, idx) => (
            <option key={idx} value={d}>{d}</option>
          ))}
        </select>
        <button type="submit" className="addeatdrink-submit-button">Save</button>
      </form>
    </div>
  );
}

export default AddEatDrink;


