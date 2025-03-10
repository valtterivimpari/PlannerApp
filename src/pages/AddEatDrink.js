import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './AddEatDrink.css';

function AddEatDrink() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId, city, startDate, nights, destinationIndex, discover: discoverState } = location.state || {};

  // Form state fields
  const [name, setName] = useState(discoverState?.name || '');
  const [selectedCategories, setSelectedCategories] = useState(discoverState?.categories || []);
  const [comments, setComments] = useState(discoverState?.comments || '');
  const [visitTime, setVisitTime] = useState(discoverState?.visitTime || '');

  // List of categories for Eat & Drink
  const categoriesList = [
    "Breakfast",
    "Lunch",
    "Dinner",
    "Drinks & Nightlife",
    "Coffee & Tea",
    "Dessert & Sweets"
  ];

  // Toggle checkbox selection
  const handleCategoryChange = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(item => item !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Compute the date range (check-in and checkout), similar to AddToDo.js
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
  
    // Build custom object with the computed dates included
    const customEatDrink = {
      custom: true,
      type: 'eatdrink',
      name,
      categories: selectedCategories,
      comments,
      visitTime,
      city,
      checkinDate: checkinDateFormatted,
      checkoutDate: checkoutDateFormatted
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
        // Get current custom entries (if any)
        let currentEntries = tripData.destinations[destinationIndex]?.discover;
        if (!currentEntries) {
          currentEntries = [];
        } else if (!Array.isArray(currentEntries)) {
          currentEntries = [currentEntries];
        }
        // Push new entry using customEatDrink (not customTodo)
        currentEntries.push(customEatDrink);
        // Save updated entries back to the destination
        tripData.destinations[destinationIndex].discover = currentEntries;
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations: tripData.destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Top-level discover field
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
      // Navigate back to Discover page with updated details
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
        {/* Wrap all checkboxes in a flex container for horizontal layout */}
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

        <button type="submit" className="addeatdrink-submit-button">Save</button>
      </form>
    </div>
  );
}

export default AddEatDrink;


