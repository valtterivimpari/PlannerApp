// Home_temp.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home_temp.css';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="logo">
                <span className="logo-gradient">Travel Planner</span>
            </div>

            <div className="intro-text">
                <h1>Plan every milestone of your trip</h1>
                <p>Make your journey easier with the Travel Planner</p>
                <button className="start-button" onClick={() => navigate('/login')}>Start!</button>
            </div>
        </div>
    );
}

export default Home;
