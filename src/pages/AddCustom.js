import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AddCustom.css';

function AddCustom() {
  const location = useLocation();
  const navigate = useNavigate();
  // Expecting tripId, city, startDate, and nights from the previous page
  const { tripId, city, startDate, nights, sleeping, destinationIndex } = location.state || {};

  const initialData = sleeping
    ? {
        accommodationType: sleeping.type, // use the saved type
        accommodationName: sleeping.name || '',
        breakfast: sleeping.breakfast,
        link: sleeping.link,
        notes: sleeping.notes
      }
    : {
        accommodationType: '',
        accommodationName: '',
        breakfast: 'no',
        link: '',
        notes: ''
      };
  
  const [formData, setFormData] = useState(initialData);
  const [isPreview, setIsPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsPreview(true);
  };

  const handleEdit = () => {
    setIsPreview(false);
  };

  const handleReadyToGo = async () => {
    try {
      const token = localStorage.getItem('token');
      const options = { day: 'numeric', month: 'short', weekday: 'short' };
      const validStartDate = startDate
        ? startDate
        : (sleeping && sleeping.rawCheckin ? sleeping.rawCheckin : new Date().toISOString());
      
      // Save the raw start date (ISO string)
      const rawCheckin = new Date(validStartDate).toISOString();
      const formattedCheckin = new Date(validStartDate).toLocaleDateString('fi-FI', options);
      const checkinDateObj = new Date(validStartDate);
      const checkoutDateObj = new Date(checkinDateObj);
      checkoutDateObj.setDate(checkinDateObj.getDate() + nights);
      const formattedCheckout = checkoutDateObj.toLocaleDateString('fi-FI', options);
    
      // Build custom sleeping details object including both raw and formatted dates
      const sleepingDetails = {
        custom: true,
        type: formData.accommodationType,
        name: formData.accommodationName,
        breakfast: formData.breakfast,
        link: formData.link,
        notes: formData.notes,
        city,
        rawCheckin,
        checkinDate: formattedCheckin,
        checkoutDate: formattedCheckout,
        nights,
      };
    
      if (destinationIndex !== undefined) {
        // Update sleeping details for a specific destination
        const tripResponse = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentTrip = tripResponse.data;
        // currentTrip.destinations is now an array (already parsed by GET endpoint)
        let destinations = currentTrip.destinations || [];
        if (destinations[destinationIndex]) {
          destinations[destinationIndex].sleeping = sleepingDetails;
        } else {
          console.error("Destination index not found");
          return;
        }
        // Save the updated destinations array
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Also clear the top-level sleeping field so it doesn’t override destination sleeping data
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { sleeping: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Sleeping details updated for destination index', destinationIndex);
        navigate(`/sleeping/${encodeURIComponent(city)}/${validStartDate}`, { 
          state: { tripId, sleeping: sleepingDetails, city, startDate: validStartDate, nights, destinationIndex } 
        });
        
      } else {
        // Fallback: update the overall trip sleeping field
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { sleeping: sleepingDetails },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Custom sleeping details saved');
        navigate(`/sleeping/${encodeURIComponent(city)}/${validStartDate}`, { 
          state: { tripId, sleeping: sleepingDetails, city, startDate: validStartDate, nights } 
        });
        
      }
      
    } catch (error) {
      console.error('Error saving custom sleeping details:', error);
    }
  };
  
  
  

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (destinationIndex !== undefined) {
        // Fetch current trip details
        const tripResponse = await axios.get(`http://localhost:5000/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const currentTrip = tripResponse.data;
        let destinations = currentTrip.destinations ? JSON.parse(currentTrip.destinations) : [];
        // Remove sleeping details for the specific destination
        if (destinations[destinationIndex]) {
          destinations[destinationIndex].sleeping = null;
        }
        // Save updated destinations
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}/destinations`,
          { destinations },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Sleeping details deleted for destination index', destinationIndex);
        navigate('/trip-info', { state: { tripId } });
      } else {
        // Default behavior: remove sleeping details from the entire trip
        await axios.put(
          `http://localhost:5000/api/trips/${tripId}`,
          { sleeping: null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Custom sleeping details deleted');
        navigate(`/sleeping/${encodeURIComponent(city)}/${startDate}`, { 
          state: { tripId, city, startDate, nights } 
        });
        
      }
    } catch (error) {
      console.error('Error deleting custom sleeping details:', error);
    }
  };
  

  return (
    <div className="add-custom-container">
      {!isPreview ? (
        <form className="custom-form" onSubmit={handleSubmit}>
          <h2>Add Custom Accommodation</h2>
          <div className="form-group">
            <label>Accommodation Type:</label>
            <select
              name="accommodationType"
              value={formData.accommodationType}
              onChange={handleChange}
              required
            >
              <option value="">Select type</option>
              <option value="Hotel">Hotel</option>
              <option value="Hostel">Hostel</option>
              <option value="Bed and Breakfast">Bed and Breakfast</option>
              <option value="Villa">Villa</option>
              <option value="Resort">Resort</option>
              <option value="Apartment">Apartment</option>
              <option value="Campground">Campground</option>
              <option value="Motel">Motel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Name of the Accommodation:</label>
            <input 
              type="text"
              name="accommodationName"
              value={formData.accommodationName}
              onChange={handleChange}
              placeholder="Enter accommodation name"
              required
            />
          </div>
          <div className="form-group">
            <label>Breakfast Included:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="breakfast"
                  value="yes"
                  checked={formData.breakfast === 'yes'}
                  onChange={handleChange}
                />{' '}
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name="breakfast"
                  value="no"
                  checked={formData.breakfast === 'no'}
                  onChange={handleChange}
                />{' '}
                No
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>Link:</label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="Enter URL"
            />
          </div>
          <div className="form-group">
            <label>Notes:</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter notes"
            />
          </div>
          <button type="submit" className="submit-button">
            Preview
          </button>
        </form>
      ) : (
        <div className="custom-summary">
          <h2>Summary</h2>
          <p>
            <strong>Type:</strong> {formData.accommodationType}
          </p>
          <p>
            <strong>Type:</strong> {formData.accommodationName}
          </p>
          <p>
            <strong>Breakfast:</strong>{' '}
            {formData.breakfast === 'yes' ? 'Included' : 'Not included'}
          </p>
          <p>
            <strong>Link:</strong> {formData.link}
          </p>
          <p>
            <strong>Notes:</strong> {formData.notes}
          </p>
          <div className="summary-buttons">
            <button className="edit-button" onClick={handleEdit}>
              Edit
            </button>
            <button className="ready-button" onClick={handleReadyToGo}>
              Ready to go!
            </button>
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCustom;
