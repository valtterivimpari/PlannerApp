import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home_temp';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Header from './components/Header';
import OtherProfile from './pages/OtherProfile';
import CreateTripPage from './pages/CreateTripPage';
import Trips from './pages/Trips';
import TripInfo from './pages/TripInfo'; // Ensure TripInfo is correctly imported
import Destination from './pages/Destination';
import MapPage from './pages/MapPage'; // Import the new MapPage component

function App() {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<RedirectIfLoggedIn><Login /></RedirectIfLoggedIn>} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/profile/:username" element={<RequireAuth><OtherProfile /></RequireAuth>} />
                <Route path="/create-trip" element={<RequireAuth><CreateTripPage /></RequireAuth>} />
                <Route path="/trips" element={<RequireAuth><Trips /></RequireAuth>} />
                <Route path="/trip-info/:id" element={<RequireAuth><TripInfo /></RequireAuth>} />
                <Route path="/destination/:id" element={<RequireAuth><Destination /></RequireAuth>} />
                <Route path="/trips/:id" element={<TripInfo />} />
                <Route path="/map-view/:destination" element={<MapPage />} />
            </Routes>
        </Router>
    );
}

// Component to redirect logged-in users away from login and register pages
function RedirectIfLoggedIn({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn && window.location.pathname !== '/profile') {
            console.log('Redirecting logged-in user to profile...');
            navigate('/profile'); // Redirect to profile
        }
    }, [navigate]);

    return children;
}

// Component to protect routes for authenticated users
function RequireAuth({ children }) {
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        console.log('RequireAuth: isLoggedIn =', isLoggedIn);

        if (!isLoggedIn) {
            console.warn('User not logged in. Redirecting to login...');
            navigate('/login');
        }
    }, [navigate]);

    return children;
}

export default App;

