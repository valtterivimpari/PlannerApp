// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import defaultProfileImage from '../assets/default-profile.png';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
    
            if (!response.ok) {
                setError('Invalid username or password');
                return;
            }
    
            const data = await response.json();
            
            // Only store login status if user explicitly logs in
            localStorage.setItem('token', data.token);
            localStorage.setItem('displayName', data.displayName);
            localStorage.setItem('loggedInUsername', username);
            localStorage.setItem('isLoggedIn', 'true'); 
    
            navigate('/profile'); 
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred during login. Please try again.');
        }
    };
    
    
    
    
    
    
    
    
    
    
    // Function to handle "Enter" key press
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    onKeyPress={handleKeyPress} /* Listen for Enter key */
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    onKeyPress={handleKeyPress} /* Listen for Enter key */
                />
                <button onClick={handleLogin}>Login</button>
                <button onClick={() => navigate('/register')}>Register</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
}

export default Login;
