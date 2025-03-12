// src/components/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
    const navigate = useNavigate();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    const handleLogout = () => {
        localStorage.clear(); // Clear all stored data
        navigate('/login'); // Redirect to login page
    };

    return (
        <div className="header">
            <Link to="/" className="logo">
                <span className="logo-gradient">Travel Planner</span>
            </Link>

            {isLoggedIn && (
                <button className="logout-button" onClick={handleLogout}>
                    Log Out
                </button>
            )}
        </div>
    );
}

export default Header;
