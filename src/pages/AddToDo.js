import React, { useState, useEffect } from 'react';
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

function AddToDo() {
  const navigate = useNavigate();
  const location = useLocation();
  // Expecting these from location.state (set when navigating from Discover menu)
  const { tripId, city, startDate, nights, destinationIndex } = location.state || {};
  
  // If there's an existing discover object of type "todo", prepopulate the form.
  const initialTodo =
    location.state?.discover && location.state.discover.type === 'todo'
      ? location.state.discover
      : {};

  const [description, setDescription] = useState(initialTodo.description || '');
  const [selectedCategories, setSelectedCategories] = useState(initialTodo.categories || []);
  
  // State to hold daily forecast data (from 3-hour forecast)
  const [forecast, setForecast] = useState(null);

  // Your API key from OpenWeatherMap
  const apiKey = '5c8e64efeaf184ad78600be9b5ea78ad';

  // Fetch the 3-hour forecast for the selected city
  useEffect(() => {
    async function fetchWeather() {
      try {
        const forecastResponse = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        const forecasts = forecastResponse.data.list;
        // Filter out forecast items that are at noon (12:00:00) to represent each day
        const dailyForecasts = forecasts.filter(item => item.dt_txt.includes("12:00:00"));
        setForecast(dailyForecasts);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    }
    if (city) {
      fetchWeather();
    }
  }, [city, apiKey]);

  // Helper function to get a recommended activity based on weather conditions
  const getRecommendedActivity = (dayWeather) => {
    const condition = dayWeather.weather[0].main.toLowerCase();
    const temp = dayWeather.main.temp;
    if (condition.includes("rain")) {
      return "Visit a museum or indoor attractions";
    } else if (temp > 25 && condition.includes("clear")) {
      return "Great for outdoor activities like hiking or biking";
    } else if (condition.includes("cloud")) {
      return "Perfect for a city tour or exploring local spots";
    }
    return "Enjoy your day!";
  };

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
      city: city,  // include the city from location.state
      checkinDate: checkinDateFormatted,
      checkoutDate: checkoutDateFormatted
    };

    try {
      const token = localStorage.getItem('token');
      if (destinationIndex !== undefined) {
        // Update the destination's discover details
        const response = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let tripData = response.data;
        if (tripData.destinations && typeof tripData.destinations === 'string') {
          tripData.destinations = JSON.parse(tripData.destinations);
        }
        if (tripData.destinations[destinationIndex]) {
          tripData.destinations[destinationIndex].discover = customTodo;
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
        // Update top-level discover field
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { discover: customTodo },
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
      
      {/* Weather Forecast Section */}
      <div className="weather-forecast">
        <h2>5-Day Weather Forecast for {city}</h2>
        {forecast ? (
          <ul>
            {forecast.map((day, index) => (
              <li key={index}>
                <p>{new Date(day.dt * 1000).toLocaleDateString()}</p>
                <p>Temp: {day.main.temp}°C</p>
                <p>Condition: {day.weather[0].description}</p>
                <p>
                  <strong>Recommended:</strong> {getRecommendedActivity(day)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading weather forecast...</p>
        )}
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
          </div>
        </fieldset>
        <button type="submit" className="addtodo-submit-button">Save</button>
      </form>
    </div>
  );
}

export default AddToDo;


