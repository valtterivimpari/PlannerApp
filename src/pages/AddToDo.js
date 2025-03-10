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

// Static list of recommendations based on guiding temperature ranges.
const recommendations = [
  {
    activity: "City Exploration & Sightseeing",
    idealTemp: "15°C to 24°C (60°F to 75°F)",
    message: "Mild temperatures make walking around and exploring local neighborhoods comfortable."
  },
  {
    activity: "Hiking & Outdoor Adventures",
    idealTemp: "10°C to 21°C (50°F to 70°F)",
    message: "Cooler temperatures help prevent overheating during strenuous activities."
  },
  {
    activity: "Beach & Water Activities",
    idealTemp: "24°C to 29°C (75°F to 85°F)",
    message: "Warm weather is perfect for sunbathing and comfortable swimming."
  },
  {
    activity: "Winter Sports (Skiing, Snowboarding)",
    idealTemp: "-6°C to -1°C (20°F to 30°F)",
    message: "Cold conditions help maintain good snow quality for winter sports."
  },
];

function AddToDo() {
  const navigate = useNavigate();
  const location = useLocation();
  // Expecting these from location.state (set when navigating from Discover menu)
  const { tripId, city, startDate, nights, destinationIndex } = location.state || {};
  
  const initialTodo =
  location.state?.discover && location.state.discover.type === 'todo'
    ? location.state.discover
    : {};

// Now use initialTodo in state hooks
const [time, setTime] = useState(initialTodo.time || '');
const [description, setDescription] = useState(initialTodo.description || '');
const [selectedCategories, setSelectedCategories] = useState(initialTodo.categories || []);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Compute the date range (check-in and checkout)
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

    // Create custom to do object including the date range
    const customTodo = {
      custom: true,
      type: 'todo',
      description,
      categories: selectedCategories,
      city,  
      checkinDate: checkinDateFormatted,
      checkoutDate: checkoutDateFormatted,
      time  // added time property
    };

    try {
      // Replace your existing PUT logic with something like this:
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
  // Push new entry
  currentEntries.push(customTodo);
  // Save updated entries back to the destination
  tripData.destinations[destinationIndex].discover = currentEntries;
  await axios.put(
    `http://localhost:5000/api/trips/${tripId}/destinations`,
    { destinations: tripData.destinations },
    { headers: { Authorization: `Bearer ${token}` } }
  );
} else {
  // Top-level discover field
  let currentEntries = tripData.discover;
  if (!currentEntries) {
    currentEntries = [];
  } else if (!Array.isArray(currentEntries)) {
    currentEntries = [currentEntries];
  }
  currentEntries.push(customTodo);
  await axios.put(
    `http://localhost:5000/api/trips/${tripId}`,
    { discover: currentEntries },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

      // Navigate back to Discover page with updated details
      navigate(`/discover/${encodeURIComponent(city)}/${startDate}`, {
        state: { tripId, city, startDate, nights, destinationIndex, discover: customTodo }
      });
    } catch (error) {
      console.error("Error saving custom to do:", error);
    }
  };

  return (
    <div className="addtodo-container">
      <h1>Custom to do</h1>
      
      {/* Weather Recommendations Section */}
      <div className="weather-forecast">
        <h2>Weather Recommendations for {city}</h2>
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

      {/* To do Form */}
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

<label>Select Time:</label>
<input 
  type="time" 
  value={time} 
  onChange={(e) => setTime(e.target.value)} 
  required 
/>
          </div>
        </fieldset>
        <button type="submit" className="addtodo-submit-button">Save</button>
      </form>
    </div>
  );
}

export default AddToDo;


