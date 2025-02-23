import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sleeping.css';
import bookingImage from '../assets/booking.png';

function Sleeping() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, city, startDate, nights } = location.state || {};

    // Ensure default values and check for a valid start date
    const numNights = nights || 1;
    const checkinDate = new Date(startDate);
    const checkoutDate = new Date(checkinDate);
    checkoutDate.setDate(checkinDate.getDate() + numNights);

    // Format dates in Finnish (e.g., la 31. toukok.)
    const options = { day: 'numeric', month: 'short', weekday: 'short' };
    const formattedCheckin = isNaN(checkinDate) ? 'Invalid Date' : checkinDate.toLocaleDateString('fi-FI', options);
    const formattedCheckout = isNaN(checkoutDate) ? 'Invalid Date' : checkoutDate.toLocaleDateString('fi-FI', options);

    // Build the booking.com URL dynamically using the dates and city
    const bookingLink = `https://www.booking.com/searchresults.fi.html?aid=1787423&label=673360ebb504efb5a35ba159&sid=81e3c0f7caa3bdd18af46ff33346f738&checkin_month=${checkinDate.getMonth() + 1}&checkin_monthday=${checkinDate.getDate()}&checkin_year=${checkinDate.getFullYear()}&checkout_month=${checkoutDate.getMonth() + 1}&checkout_monthday=${checkoutDate.getDate()}&checkout_year=${checkoutDate.getFullYear()}&class_interval=1&dtdisc=0&group_adults=2&group_children=0&inac=0&index_postcard=0&keep_landing=1&label_click=undef&lang=fi&lang_changed=1&no_rooms=1&offset=0&postcard=0&room1=A%2CA&sb_price_type=total&shw_aparth=1&slp_r_match=0&ss=${encodeURIComponent(city)}&ss_all=0&ssb=empty&sshis=0`;

    // Function to save sleeping details (updates the sleeping field for the trip)
    const handleSaveSleeping = async () => {
      try {
        const token = localStorage.getItem('token');
        const sleepingDetails = {
          city,
          checkinDate: formattedCheckin,
          checkoutDate: formattedCheckout,
          nights: numNights,
        };
        const response = await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { sleeping: sleepingDetails },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Sleeping details saved:', response.data);
        navigate(-1);
      } catch (error) {
        console.error('Error saving sleeping details:', error);
      }
    };

    return (
      <div className="sleeping-container">
        <div className="sleeping-info">
          <h2>
            {numNights} {numNights === 1 ? 'night' : 'nights'} in <span className="city-name">{city}</span>
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
          <button className="add-custom-button" onClick={() => { /* Future custom action */ }}>
            Add Custom
          </button>
        </div>
        <div className="save-button-container">
          <button className="save-button" onClick={handleSaveSleeping}>
            Save Sleeping Details
          </button>
        </div>
      </div>
    );
}

export default Sleeping;
