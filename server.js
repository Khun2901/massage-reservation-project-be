// Import necessary libraries
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// Import Router files
const auth = require('./routes/auth');
const bodyParser = require('body-parser');
const massages = require('./routes/massages');
const appointments = require('./routes/appointments');
const users = require('./routes/users');

//Connect to Database
connectDB();

const app = express();

// Mock request
app.get('/', (req, res) => {
    res.status(200).send({
        success: true,
        data: {
            id: 1,
        },
    });
});

// Body Parser
app.use(express.json());
app.use(cookieParser());

// Mount Router
app.use('/api/v1/massages', massages);
app.use('/api/v1/auth', auth);
app.use('/api/v1/appointments', appointments);
app.use('/api/v1/users', users);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT));

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
