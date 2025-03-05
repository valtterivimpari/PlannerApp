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
import TripInfo from './pages/TripInfo';
import Destination from './pages/Destination';
import MapPage from './pages/MapPage';
import Transport from './pages/Transport';
import FlightDetails from './pages/FlightDetails'; // Import new components
import FlightEdit from './pages/FlightEdit';
import FlightSummary from './pages/FlightSummary';
import TrainDetails from './pages/TrainDetails';
import TrainEdit from './pages/TrainEdit';
import TrainSummary from './pages/TrainSummary';
import BusDetails from './pages/BusDetails';
import BusEdit from './pages/BusEdit';
import BusSummary from './pages/BusSummary';
import FerryDetails from './pages/FerryDetails';
import FerryEdit from './pages/FerryEdit';
import FerrySummary from './pages/FerrySummary';
import Sleeping from './pages/Sleeping';
import AddCustom from './pages/AddCustom';
import Discover from './pages/Discover';
import AddToDo from './pages/AddToDo';
import BudgetCalculator from './pages/BudgetCalculator';




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
                <Route path="/map-view/:destination" element={<MapPage />} />
                <Route path="/transport/:origin/:destination/:date" element={<Transport />} />
                <Route path="/flight-details" element={<FlightDetails />} />
                <Route path="/flight-edit" element={<FlightEdit />} />
                <Route path="/flight-summary" element={<FlightSummary />} />
                <Route path="/train-details" element={<TrainDetails />} />
<Route path="/train-edit" element={<TrainEdit />} />
<Route path="/train-summary" element={<TrainSummary />} />
<Route path="/bus-details" element={<BusDetails />} />
<Route path="/bus-edit" element={<BusEdit />} />
<Route path="/bus-summary" element={<BusSummary />} />
<Route path="/ferry-details" element={<FerryDetails />} />
  <Route path="/ferry-edit" element={<FerryEdit />} />
  <Route path="/ferry-summary" element={<FerrySummary />} />
  <Route path="/sleeping/:city/:date" element={<RequireAuth><Sleeping /></RequireAuth>} />
  <Route path="/add-custom" element={<RequireAuth><AddCustom /></RequireAuth>} />
  <Route path="/discover/:city/:date" element={<RequireAuth><Discover /></RequireAuth>} />
  <Route path="/add-todo" element={<RequireAuth><AddToDo /></RequireAuth>} />
  <Route path="/budget-calculator/:tripId" element={ <RequireAuth><BudgetCalculator /> </RequireAuth>
  } 
/>





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

