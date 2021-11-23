require('dotenv').config();
const express = require('express');
const app = express();


app.get('/', (req, res) => {

    return res.json('hello world');
});

// Takes the PORT (9999) from env. if nothing specified then pick port 8888
const port = process.env.PORT ? process.env.PORT : 8888;
// Error handling on server upstart
app.listen(port, (error) => {
    if (error) {
        console.log('Error starting the server');
    }
    console.log('This server is running on port:', port);
});

