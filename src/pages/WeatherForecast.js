// WeatherForecast.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WeatherForecast({ city, travelDate }) {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        // Replace with your chosen API endpoint and API key
        const apiKey = 'YOUR_API_KEY';
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
        );
        // Process the data to extract forecast for the travelDate
        const forecastForDate = response.data.list.find(item => {
          // Example: compare date strings; adjust based on API data structure
          return item.dt_txt.startsWith(travelDate);
        });
        setWeatherData(forecastForDate);
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    }
    if (city && travelDate) fetchWeather();
  }, [city, travelDate]);

  const getActivityRecommendations = () => {
    if (!weatherData) return [];
    const recommendations = [];
    const temp = weatherData.main.temp;
    const weatherCondition = weatherData.weather[0].main.toLowerCase();

    // Basic example logic for recommendations
    if (weatherCondition.includes('rain')) {
      recommendations.push('Visit a museum', 'Indoor shopping');
    } else if (temp > 20 && weatherCondition.includes('clear')) {
      recommendations.push('Go hiking', 'Outdoor biking', 'Visit a park');
    } else {
      recommendations.push('Explore local cafes');
    }
    return recommendations;
  };

  return (
    <div className="weather-forecast">
      {weatherData ? (
        <>
          <h3>Weather for {city} on {travelDate}</h3>
          <p>Temperature: {weatherData.main.temp}°C</p>
          <p>Precipitation: {weatherData.weather[0].description}</p>
          <p>Wind Speed: {weatherData.wind.speed} m/s</p>
          <h4>Recommended Activities:</h4>
          <ul>
            {getActivityRecommendations().map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}

export default WeatherForecast;
