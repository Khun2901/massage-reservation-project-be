const express = require('express')
const dotenv = require('dotenv')

dotenv.config({path: './config/config.'})

const app = express()

app.get('/', (req, res) => {
    res.status(200).send({
        success: true,
        data: {
            id: 1,
        }
    })
})

const PORT = process.env.PORT || 8000

app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT))