import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Sleeping.css';
import bookingImage from '../assets/booking.png';

function Sleeping() {
  const location = useLocation();
  const navigate = useNavigate();
  // Check if a custom sleeping object exists in state
  const { tripId, sleeping, city, startDate, nights } = location.state || {};


  // If custom sleeping details exist, use them; otherwise, use fallback values
  const isCustom = sleeping && sleeping.custom;
  const displayCity = isCustom ? sleeping.city : city;
  const displayNights = isCustom ? sleeping.nights : (nights || 1);
  const validStartDate = startDate && !isNaN(new Date(startDate))
  ? startDate
  : new Date().toISOString();

  let formattedCheckin, formattedCheckout;
  if (isCustom) {
    // Assume custom checkinDate is already formatted
    formattedCheckin = sleeping.checkinDate;
    // Calculate checkout based on nights if desired—or store it in custom details as well.
    // For simplicity, we’ll display the custom checkout if provided; otherwise, use checkin plus nights.
    formattedCheckout = sleeping.checkoutDate || '—';
  } else {
    const numNights = nights || 1;
const checkinDateObj = new Date(validStartDate);
const checkoutDateObj = new Date(checkinDateObj);
checkoutDateObj.setDate(checkinDateObj.getDate() + numNights);
const options = { day: 'numeric', month: 'short', weekday: 'short' };
formattedCheckin = isNaN(checkinDateObj)
? 'Invalid Date'
: checkinDateObj.toLocaleDateString('fi-FI', options);
formattedCheckout = isNaN(checkoutDateObj)
? 'Invalid Date'
: checkoutDateObj.toLocaleDateString('fi-FI', options);
}

  // Build the booking.com URL dynamically using the city and, if not custom, the dates
  const bookingLink = `https://www.booking.com/searchresults.fi.html?aid=1787423&label=673360ebb504efb5a35ba159&sid=81e3c0f7caa3bdd18af46ff33346f738&checkin_month=0&checkin_monthday=0&checkin_year=0&checkout_month=0&checkout_monthday=0&checkout_year=0&class_interval=1&dtdisc=0&group_adults=2&group_children=0&inac=0&index_postcard=0&keep_landing=1&label_click=undef&lang=fi&lang_changed=1&no_rooms=1&offset=0&postcard=0&room1=A%2CA&sb_price_type=total&shw_aparth=1&slp_r_match=0&ss=${encodeURIComponent(displayCity)}&ss_all=0&ssb=empty&sshis=0`;
  // (For simplicity, the checkin/checkout values are not recalculated in custom mode.)

  // Handler for editing custom details – navigate to AddCustom with current custom details
  const handleEditCustom = () => {
    const newStartDate = (sleeping && sleeping.rawCheckin) ? sleeping.rawCheckin : startDate;
    navigate('/add-custom', { state: { tripId, city, startDate: newStartDate, nights, sleeping } });
  };
  
  

  // Handler for deleting custom details
  const handleDeleteCustom = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/trips/${tripId}`,
        { sleeping: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Custom sleeping details deleted');
      // Navigate back to Sleeping with fallback details
      navigate('/sleeping', { state: { tripId, city, startDate, nights } });
    } catch (error) {
      console.error('Error deleting custom sleeping details:', error);
    }
  };

  return (
    <div className="sleeping-container">
      <div className="sleeping-info">
        <h2>
          {displayNights} {displayNights === 1 ? 'night' : 'nights'} in{' '}
          <span className="city-name">{displayCity}</span>
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
            navigate('/add-custom', { state: { tripId, city, startDate, nights } })
          }}
        >
          <span className="plus-icon">+</span>
          Add custom
        </button>
      </div>
      {isCustom && (
        <div className="custom-summary">
          <h3>Custom Accommodation Details</h3>
          <p>
            <strong>Type:</strong> {sleeping.type}
          </p>
          <p><strong>Name:</strong> {sleeping.name}</p>
          <p>
            <strong>Breakfast:</strong> {sleeping.breakfast === 'yes' ? 'Included' : 'Not included'}
          </p>
          <p>
            <strong>Link:</strong> {sleeping.link}
          </p>
          <p>
            <strong>Notes:</strong> {sleeping.notes}
          </p>
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


