require('dotenv').config(); // loads environment variables

// ################################### // creates express server 

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public')); // makes public folder static, so it's always accessible  
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

// ################################### // middleware

const server = require('http').createServer(app); // The createServer method allows Node.js to act as a web server and receive requests 
const FormData = require('form-data');
const axios = require('axios');
const jwt = require('jsonwebtoken'); // used to decode 'json web tokens'
const { env } = require('process');

// ################################### // routes

app.get('/', (req, res) => {
    console.log('login');
    return res.sendFile(__dirname + '/public/login.html');
});

app.get('/home', (req, res) => {
    const currentTime = getUnixTime();
    if (env.JWT_TOKEN_EXP < currentTime) {
        return res.sendFile(__dirname + '/public/login.html');
    } else {
        console.log('home');
        return res.sendFile(__dirname + '/public/home.html');
    }
});

app.post('/validate-and-send-sms', (req, res) => {
    console.log('send-confirmation-sms');
    try {
        jwt.verify(req.body.jwt, env.JWT_SECRET, async (err, decodedToken) => {
            if (err) return err; // pessimistic handling.

            const currentTime = getUnixTime();
            if (decodedToken.exp < currentTime) return res.sendStatus(401).send('expired token'); // Checks for expiration

            env.JWT_TOKEN_EXP = decodedToken.exp; // sets environment variable with expiration time

            const conformation = await confirmSMS(); // handles conformation sms
            console.log('conformation', conformation);
            return res.json(conformation);
        });

    } catch (error) {
        console.log('error', error);
    }
});

// ################################### // functions 

const getUnixTime = () => {
    // gets unix time in seconds format
    const dateNow = new Date();
    return currentTime = Math.round(dateNow.getTime() / 1000);
}

const getRndInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const confirmSMS = async () => {
    // object containing fatsms account variables
    const fatSMS = {
        SMS_URL: 'https://fatsms.com/send-sms',
        API_KEY: '2fa560e4-f67e-45e5-a2db-2bf1bb6c6fe1',
        PHONE_NO: '28794940',
    };

    // creates form data containing data for the fatsms format
    const code = getRndInteger(1000, 9000);
    const formData = new FormData();
    formData.append('to_phone', fatSMS.PHONE_NO);
    formData.append('message', code);
    formData.append('api_key', fatSMS.API_KEY);

    try {
        // create promise to send and receive response from fatsms
        return await axios.post(fatSMS.SMS_URL, formData, { headers: formData.getHeaders() }).then((response) => {
            console.log('response.data success', response.data);
            return { status: 200, code: code };
        }).catch((err) => {
            console.log('here1');
            return { status: 500, error: err };
        });
    } catch (error) {
        console.log('here2');
        return { status: 500, error: err };
    }
}

// ################################### // start server

// Takes the PORT from env. file, if nothing specified then pick port 8888
const port = env.PORT ? env.PORT : 8888;
// Error handling on server upstart
server.listen(port, (error) => {
    if (error) {
        console.log('Error starting the server');
    }
    console.log('This server is running on port', server.address().port);
});

