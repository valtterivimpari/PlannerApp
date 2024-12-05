import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, displayName }),
            });
            setMessage(`Welcome, ${displayName}!`);
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Registration failed', error);
            setMessage('Registration failed. Try again.');
        }
    };

    return (
        <div className="register-container">
            <h2>Create Account</h2>
            <input 
                type="text" 
                placeholder="Display Name" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
            />
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button onClick={handleRegister}>Register</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Register;
