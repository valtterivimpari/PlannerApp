import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import defaultProfileImage from '../assets/default-profile.png';
import axios from 'axios';

function Profile() {
    const navigate = useNavigate();
    const [profileImage, setProfileImage] = useState(
        localStorage.getItem('profileImage') || defaultProfileImage
    );
    const displayName = localStorage.getItem('displayName') || 'Guest';
    const username = localStorage.getItem('loggedInUsername') || 'guest';
    const trips = localStorage.getItem('trips') || 0;
    const countries = localStorage.getItem('countries') || 0;
    const [followers, setFollowers] = useState(Number(localStorage.getItem('followers')) || 0);
    const [following, setFollowing] = useState(Number(localStorage.getItem('following')) || 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        console.log('Profile loaded for username:', username);

        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('No token found. Redirecting to login.');
            navigate('/login');
        }
    }, [navigate, username]);

    const handleSearch = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(`http://localhost:5000/api/users?search=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

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
        <div>
            <button onClick={handleLogout} className="logout-button">Log Out</button>
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
                    <div className="profile-stats">
                        <div>
                            <span>{followers}</span>
                            <p>Followers</p>
                        </div>
                        <div>
                            <span>{following}</span>
                            <p>Following</p>
                        </div>
                        <div>
                            <span>{countries}</span>
                            <p>Countries</p>
                        </div>
                    </div>
                </div>
                <div className="profile-search">
                    <input
                        type="text"
                        placeholder="Search for users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button onClick={handleSearch}>Search</button>
                </div>
                {searchResults.length > 0 && (
                    <div className="search-results">
                        {searchResults.map((user) => (
                            <div
                                key={user.username}
                                className="search-result"
                                onClick={() => navigate(`/profile/${user.username}`)}
                            >
                                <span>{user.displayName} (@{user.username})</span>
                            </div>
                        ))}
                    </div>
                )}
                <div className="create-trip-container">
                    <button className="create-trip-button" onClick={() => navigate('/create-trip')}>
                        Create Trip
                    </button>
                    <button className="trips-button" onClick={() => navigate('/trips')}>
                        Trips
                    </button>
                </div>
                <div className="profile-footer">
                    <button>📤 Share profile</button>
                    <button>⚙️ Settings</button>
                </div>
            </div>
        </div>
    );
}

export default Profile;
