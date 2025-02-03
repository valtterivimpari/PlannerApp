require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const morgan = require('morgan');
const axios = require('axios');



const app = express();
const PORT = process.env.PORT || 5000;

// PostgreSQL Connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tripplanner',
    password: 'Testarosa13',
    port: 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('PostgreSQL connection error:', err));

// Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(morgan('dev'));

// Middleware to authenticate JWT
// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    console.log('Received token:', token);

    if (!token) {
        console.error('Token not provided');
        return res.status(401).send('Unauthorized');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.status(403).send('Invalid token');
        }

        console.log('Token verified for user:', user);
        req.user = user;
        next();
    });
};










// Routes
// Register a new user
app.post('/api/register', async (req, res) => {
    const { username, password, displayName } = req.body;
    console.log('Registratin attempt:', username, displayName);

    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `INSERT INTO users (username, password, display_name) VALUES ($1, $2, $3)`;
        await pool.query(query, [username, hashedPassword, displayName]);
        res.status(201).send('User registered successfully!');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server error');
    }
});


// Login a user
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await pool.query(query, [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).send('Invalid username or password');
        }

        // Log the user details before signing the token
        console.log('User details for token:', user);
        console.log('Creating token with payload:', { id: user.id, username: user.username });


        // Include the `id` field in the JWT payload
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, displayName: user.display_name });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error');
    }
});








// Search for users
app.get('/api/users', authenticateToken, async (req, res) => {
    const { search } = req.query;

    if (!search) {
        return res.status(400).send('Search query is required');
    }

    try {
        const query = `SELECT username, display_name FROM users WHERE username ILIKE $1`;
        const result = await pool.query(query, [`%${search}%`]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).send('Server error');
    }
});

// Profile image upload configuration
const storage = multer.diskStorage({
    destination: './uploads/', // Directory for uploaded images
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    },
});

const upload = multer({ storage });

// Profile image upload
app.post('/api/users/:username/profile-image', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const { username } = req.params;
    try {
        const query = `UPDATE users SET profile_image = $1 WHERE username = $2 RETURNING profile_image`;
        const result = await pool.query(query, [`/uploads/${req.file.filename}`, username]);
        if (result.rowCount === 0) {
            return res.status(404).send('User not found');
        }
        res.status(200).json({ profileImage: result.rows[0].profile_image });
    } catch (error) {
        console.error('Error updating profile image:', error);
        res.status(500).send('Server error');
    }
});


// Add a new trip
app.post('/api/trips', authenticateToken, async (req, res) => {
    const { tripName, selectedCountry, startDate, endDate } = req.body;
    const userId = req.user.id; // Extracted from the JWT token

    if (!userId) {
        console.error('User ID not found in token');
        return res.status(400).send('Invalid token');
    }

    try {
        console.log('Inserting trip for user ID:', userId); // Debugging
        const query = `
            INSERT INTO trips (trip_name, selected_country, start_date, end_date, user_id)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const result = await pool.query(query, [tripName, selectedCountry, startDate, endDate, userId]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving trip:', error);
        res.status(500).send('Server error');
    }
});




// Get all trips for the logged-in user
app.get('/api/trips', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    if (!userId) {
        console.error('User ID not found in token');
        return res.status(400).send('Invalid token');
    }

    try {
        console.log('Fetching trips for user ID:', userId);
        const query = `SELECT * FROM trips WHERE user_id = $1 ORDER BY created_at DESC`;
        const result = await pool.query(query, [userId]);

        console.log('Trips fetched:', result.rows); // Log trips fetched
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Server error');
    }
});


// Delete a trip
app.delete('/api/trips/:tripId', authenticateToken, async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user.id;

    console.log(`Fetching trip ID: ${tripId} for user ID: ${userId}`); 

    if (!userId) {
        console.error('User ID not found in token');
        console.log('Trip not found or unauthorized');
        return res.status(400).send('Invalid token');
    }

    try {
        // Delete the trip from the database
        const query = `DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING *`;
        const result = await pool.query(query, [tripId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Trip not found or unauthorized');
        }

        res.status(200).send('Trip deleted successfully');
    } catch (error) {
        console.error('Error deleting trip:', error);
        res.status(500).send('Server error');
    }
});

// Get a specific trip by ID
app.get('/api/trips/:tripId', authenticateToken, async (req, res) => {
    console.log(`GET /api/trips/${req.params.tripId} hit`);
    const { tripId } = req.params;
    const userId = req.user.id;

    try {
        const query = `SELECT * FROM trips WHERE id = $1 AND user_id = $2`;
        const result = await pool.query(query, [tripId, userId]);

        if (result.rowCount === 0) {
            console.log('Trip not found or unauthorized');
            return res.status(404).send('Trip not found or unauthorized');
        }

        console.log('Trip data:', result.rows[0]); // Debugging
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).send('Server error');
    }
});

// Place this route first
app.put('/api/trips/:tripId/add-destination', authenticateToken, async (req, res) => {
    console.log("PUT request received for /api/trips/:tripId/add-destination");

    const { tripId } = req.params;
    const { newDestination } = req.body;

    if (!newDestination || !newDestination.name) {
        console.error("Invalid destination data:", req.body);
        return res.status(400).send("Invalid destination data");
    }

    try {
        // Fetch current destinations from the database
        const fetchQuery = `SELECT destinations FROM trips WHERE id = $1 AND user_id = $2`;
        const fetchResult = await pool.query(fetchQuery, [tripId, req.user.id]);

        if (fetchResult.rowCount === 0) {
            console.log("Trip not found or unauthorized");
            return res.status(404).send("Trip not found or unauthorized");
        }

        const currentDestinations = fetchResult.rows[0].destinations || [];
        console.log("Current Destinations from DB:", currentDestinations);

        // Add the new destination to the current destinations
        const updatedDestinations = [...currentDestinations, newDestination];
        console.log("New Destination:", newDestination);
        console.log("Updated Destinations to be Saved:", updatedDestinations);

        // Update the destinations in the database
        const updateQuery = `
            UPDATE trips
            SET destinations = $1
            WHERE id = $2 AND user_id = $3
            RETURNING destinations;
        `;
        console.log("Executing query:", updateQuery);

        // Use JSON.stringify for updatedDestinations to ensure valid JSON
        const updateResult = await pool.query(updateQuery, [JSON.stringify(updatedDestinations), tripId, req.user.id]);

        console.log("Final Updated Destinations in DB:", updateResult.rows[0].destinations);
        res.status(200).json(updateResult.rows[0]);
    } catch (error) {
        console.error("Error adding destination:", error);
        res.status(500).send("Server error");
    }
});

app.put('/api/trips/:tripId/destinations', authenticateToken, async (req, res) => {
    const { tripId } = req.params;
    const { destinations } = req.body;
    const userId = req.user.id;

    try {
        const query = `
            UPDATE trips
            SET destinations = $1
            WHERE id = $2 AND user_id = $3
            RETURNING destinations;
        `;
        const result = await pool.query(query, [JSON.stringify(destinations), tripId, userId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Trip not found or unauthorized');
        }

        res.status(200).json(result.rows[0].destinations);
    } catch (error) {
        console.error('Error updating destinations:', error);
        console.log("Updated destinations in database:", result.rows[0].destinations);
        res.status(500).send('Server error');
    }
});







app.put('/api/trips/:tripId', authenticateToken, async (req, res) => {
    console.log('PUT request received for trip:', req.params.tripId);
    console.log('Request body:', req.body);
    console.log('User ID from token:', req.user.id);

    const { tripId } = req.params;
    const { selected_country } = req.body;
    const userId = req.user.id;

    try {
        const query = `
            UPDATE trips
            SET selected_country = $1
            WHERE id = $2 AND user_id = $3
            RETURNING *;
        `;
        console.log('Executing query with:', selected_country, tripId, userId);
        const result = await pool.query(query, [selected_country, tripId, userId]);

        if (result.rowCount === 0) {
            console.log('No rows updated: Trip not found or unauthorized.');
            return res.status(404).send('Trip not found or unauthorized');
        }

        console.log('Trip updated successfully:', result.rows[0]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error during PUT request:', error);
        res.status(200).send("Route works with minimal logic!");
    }
});

app.get('/api/directions', async (req, res) => {
    const { start, end } = req.query;

    if (!start || !end) {
        return res.status(400).send('Missing start or end coordinates');
    }

    try {
        console.log("Fetching directions with:", { start, end });
        const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
            headers: { Authorization: process.env.REACT_APP_OPENROUTESERVICE_API_KEY },
            params: { start, end },
        });
        console.log("Directions API Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching directions:', error.message, error.response?.data);
        res.status(500).send('Failed to fetch directions');
    }
    
});

app.post('/api/flights', authenticateToken, async (req, res) => {
    const {
        origin = null, // Allow NULL value
        destination = null, // Allow NULL value
        date = null, // Allow NULL value
        departureTime, 
        arrivalTime, 
        notes, 
        departureAirport, 
        arrivalAirport, 
        flightNumber, 
        link, 
        operator, 
        seatNumber, 
        bookingNumber
    } = req.body;

    const userId = req.user.id;

    console.log("Received flight data:", req.body);
    console.log("User ID from token:", userId);

    if (!userId) {
        return res.status(401).send("Unauthorized: User ID missing in token.");
    }

    try {
        const query = `
            INSERT INTO flights (user_id, origin, destination, date, departure_time, arrival_time, notes, departure_airport, arrival_airport, flight_number, link, operator, seat_number, booking_number)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *;
        `;

        const values = [userId, origin, destination, date, departureTime, arrivalTime, notes, departureAirport, arrivalAirport, flightNumber, link, operator, seatNumber, bookingNumber];

        console.log("Executing query with values:", values);

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error inserting flight:", error);
        res.status(500).send("Server error: " + error.message);
    }
});




app.get('/api/flights', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const query = `SELECT * FROM flights WHERE user_id = $1`;
        const result = await pool.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

app.put('/api/flights/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const updatedFields = req.body;

    try {
        let query = `UPDATE flights SET `;
        const values = [];
        Object.entries(updatedFields).forEach(([key, value], index) => {
            query += `${key} = $${index + 1}, `;
            values.push(value);
        });
        query = query.slice(0, -2) + ` WHERE id = $${values.length + 1} RETURNING *`;
        values.push(id);

        const result = await pool.query(query, values);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).send('Server error');
    }
});































app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});




// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
console.log('JWT_SECRET:', process.env.JWT_SECRET);


