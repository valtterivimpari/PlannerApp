// Home_temp.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home_temp.css';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="logo">
                <span className="logo-gradient">Matkasuunnittelija</span>
            </div>

            <div className="intro-text">
                <h1>Suunnittele reissun jokainen <br /> käännekohta</h1>
                <p>Helpota matkaasi Matkasuunnittelijalla</p>
                <button className="start-button" onClick={() => navigate('/login')}>Aloita!</button>
            </div>
        </div>
    );
}

export default Home;
