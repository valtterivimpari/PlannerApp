import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import defaultProfileImage from '../assets/default-profile.png';

function OtherProfile() {
  const { username } = useParams(); // Get the username from the URL
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${username}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error.response || error.message);
        setError(error.response?.data || 'Failed to fetch user profile.');
      }
    };

    fetchUserProfile();
  }, [username]);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-header">
      <img
    src={user.profileImage || defaultProfileImage} // Use profileImage if it exists
    alt={`${user.username}'s profile`}
    style={{ width: '80px', height: '80px', borderRadius: '50%' }}
/>

        <h2>{user.displayName}</h2>
        <p>@{user.username}</p>
      </div>
      <div className="profile-stats">
        <div>
          <span>{user.followers.length}</span>
          <p>Followers</p>
        </div>
        <div>
          <span>{user.following.length}</span>
          <p>Following</p>
        </div>
      </div>
    </div>
  );
}

export default OtherProfile;