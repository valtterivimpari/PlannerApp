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
        console.log('Attempting login with:', { username, password });
    
        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
    
            console.log('Response status:', response.status);
            if (!response.ok) {
                setError('Invalid username or password');
                console.error('Login failed');
                return;
            }
    
            const data = await response.json();
            console.log('Login successful, received data:', data);
    
            localStorage.setItem('token', data.token);
            localStorage.setItem('displayName', data.displayName);
            localStorage.setItem('loggedInUsername', username);
            localStorage.setItem('isLoggedIn', 'true'); // Ensure this is set
    
            navigate('/profile'); // Redirect to the profile page
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
