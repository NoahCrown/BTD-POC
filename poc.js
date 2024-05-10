const express = require('express');
const jwt = require('jsonwebtoken'); // Importing jsonwebtoken
const { v4: uuidv4 } = require('uuid'); // UUID generation
const axios = require('axios'); // HTTP client
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Secret key for JWT signing
const secretKey = process.env.SECRET_KEY || 'my_secret_key'; // Use a secure key in production

// Token authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Attach the user data to the request
    next(); // Move to the next middleware or route handler
  });
}

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'admin' && password === 'password') {
    // Generate a token valid for 1 hour
    const token = jwt.sign({ username: 'admin' }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/signal', (req, res) => {
    console.log("Notifications recevied")
})

// Pre-notification signal example
app.post('/pre-notification', authenticateToken, (req, res) => {
  const preNotificationData = {
    provider: req.body.provider,
    start: req.body.start,
    end: req.body.end,
    published: req.body.published,
    signalId: uuidv4(), // Generate a unique signal ID
    correlationId: uuidv4(), // Generate a unique correlation ID
    category: req.body.category || ["pre-notification"],
    object: req.body.object,
    predicate: req.body.predicate,
    payload: {
      cnCodes: req.body.payload.cnCodes,
      countryOfOrigin: req.body.payload.countryOfOrigin,
      commodityDescription: req.body.payload.commodityDescription,
      chedNumbers: req.body.payload.chedNumbers,
      unitIdentification: {
        containerNumber: req.body.payload.unitIdentification.containerNumber,
        trailerRegistrationNumber: req.body.payload.unitIdentification.trailerRegistrationNumber,
      },
      mode: req.body.payload.mode,
      exporterEORI: req.body.payload.exporterEORI,
      importerEORI: req.body.payload.importerEORI,
    },
  };

  console.log("Received pre-notification signal:", preNotificationData);

  // Simulate sending to another endpoint (e.g., ISN messaging infrastructure)
  const externalEndpoint = 'http://localhost:3000/signal';
  axios.post(externalEndpoint, preNotificationData, {
    headers: {
      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzE1MjI4MjgwLCJleHAiOjE3MTUyMzE4ODB9.kd95siR19IhzAUzd4A6IcPwTzs6DqBwVLl7tGRYQ5XQ`, // Token for ISN communication
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log("Response from ISN:", response.data);
    res.status(201).json({
      message: 'Pre-notification signal received and sent to ISN.',
      signal: preNotificationData,
    });
  })
  .catch(error => {
    console.error("Error sending pre-notification to ISN:", error);
    res.status(500).json({
      error: 'Internal server error while sending pre-notification.',
    });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
