// Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // Make sure this contains the .page-layout, .profile-container, and .map-area styles
import defaultProfileImage from '../assets/default-profile.png';
import axios from 'axios';
import GlobeMap from './GlobeMap'; // Your map component

function Profile() {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem('profileImage') || defaultProfileImage
  );
  const displayName = localStorage.getItem('displayName') || 'Guest';
  const username = localStorage.getItem('loggedInUsername') || 'guest';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!token || !isLoggedIn) {
      console.warn('No token or login session found. Redirecting to login.');
      navigate('/login');
    }
  }, [navigate]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = e.target.result;
        setProfileImage(image);
        localStorage.setItem('profileImage', image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    localStorage.removeItem('profileImage');
    setProfileImage(defaultProfileImage);
  };

  return (
    <div
      className="page-layout"
      style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}
    >
      {/* Left column: Profile info */}
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-photo">
            <img src={profileImage} alt="Profile" />
            <label className="custom-file-upload">
              Choose a profile picture
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button onClick={handleDeleteImage} className="delete-image-button">
              Delete Profile Picture
            </button>
          </div>
          <h2>{displayName}</h2>
          <p>@{username}</p>
          <div className="create-trip-container">
            <button
              className="create-trip-button"
              onClick={() => navigate('/create-trip')}
            >
              Create Trip
            </button>
            <button
              className="trips-button"
              onClick={() => navigate('/trips')}
            >
              Trips
            </button>
          </div>
        </div>
      </div>
  
      {/* Right column: Map area */}
      <div className="map-area" style={{ border: '2px dashed red' }}>
        <GlobeMap />
      </div>
    </div>
  );
  
}  

export default Profile;

