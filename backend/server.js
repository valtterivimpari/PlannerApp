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
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).send('Unauthorized');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user; // Attach user info to the request object
        next();
    });
}

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
    console.log('Login attempt:', username);

    try {
        const query = `SELECT * FROM users WHERE username = $1`;
        const result = await pool.query(query, [username]);
        const user = result.rows[0];

        if (!user) {
            console.error('User not found:', username);
            return res.status(400).send('Invalid username or password');
        }
        console.log('User found:', user);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.error('Invalid password for user:', username);
            return res.status(400).send('Invalid username or password');
        }

        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful for:', username);
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

// Fetch all trips
// Fetch a single trip by ID
app.get('/api/trips', async (req, res) => {
    try {
        const query = `SELECT * FROM trips`;
        const result = await pool.query(query);
        res.json(result.rows); // Respond with all trips
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).send('Server error');
    }
});








// Add a new trip
app.post('/api/trips', async (req, res) => {
    const { tripName, selectedCountry, startDate, endDate } = req.body;
    console.log('Received trip data:', { tripName, selectedCountry, startDate, endDate });

    if (!tripName || !selectedCountry || !startDate || !endDate) {
        return res.status(400).send('All fields are required');
    }

    try {
        const query = `INSERT INTO trips (trip_name, selected_country, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(query, [tripName, selectedCountry, startDate, endDate]);
        console.log('Trip saved to database:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving trip:', error);
        res.status(500).send('Server error');
    }
});






// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
console.log('JWT_SECRET:', process.env.JWT_SECRET);


