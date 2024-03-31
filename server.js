const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

// Load env vars
dotenv.config({path: './config/config.env'})

//Connect to Database
connectDB()

const app = express()

// Mock request
app.get('/', (req, res) => {
    res.status(200).send({
        success: true,
        data: {
            id: 1,
        }
    })
})

const PORT = process.env.PORT || 8000

const server = app.listen(PORT, console.log('Server running in', process.env.NODE_ENV, 'mode on port', PORT))

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`)
    server.close(() => process.exit(1))
})