const { sign } = require('crypto');
const express = require('express');
const fs = require('fs'); 
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');


const app = express();
const PORT = 3000;
const secretKey = '23123ASA@!#AAF!@#HSFHDF!'; 


app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
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

        req.user = user; 
        next(); 
    });
}
  
app.get('/hello', (req, res) => {
  res.send('Hello, world!');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Dummy user verification
    if (username === 'admin' && password === 'password') {
      const token = jwt.sign({ username: 'admin' }, secretKey, { expiresIn: '1h' }); // Token valid for 1 hour
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });


app.post('/micropub', authenticateToken, (req, res) => {
    const newData = req.body
    console.log(newData)

    const signalId = uuidv4(); 
    const correlationId = uuidv4();

  
    let existingData = [];
    try {
        existingData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    } catch (error) {
        console.error("Error reading data.json:", error); // Logs error details
        existingData = []; 
    }

  
    existingData.push(newData);
  
    fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2));
  
    res.status(201).json({
      message: 'Data received and saved.',
      "signal": {
        "provider": newData.h,
        "start": newData.start,
        "end": null,
        "signalId": signalId,
        "correlationId": correlationId,
        "category": newData.category,
        "object": null,
        "predicate": null,
        "payload":newData.payload,
        

      }
    });
  });
  


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
