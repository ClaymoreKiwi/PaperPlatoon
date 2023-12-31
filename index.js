const express = require('express');
//logging and debugging purposes
const bodyParser = require('body-parser');
//mongo DB wrapper
const mongoose = require('mongoose');
const User = require("./Public/MyWebGame/js/model/user");
//encryption using hashing
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
//secure secret for token validation
const JWT_SECRET = process.env.JWT_SECRET || 'jnsdfijbweiuh/@#$34SEFWEF2df3ererwedf!@##$';
//storing in environment variables for security
const MONGODB_USERNAME = process.env.MONGODB_USERNAME || 'tinglebryce';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'C9d11P5Bdc';
//using environment variables makes the string more secure
//doing this for other parts of the string eg, cluster or database would be good too
const MONGODB_URI = process.env.MONGODB_URI || `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@pp-cluster1.zlvot0m.mongodb.net/`;
//local database for testing
//const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paperDb';

const app = express();
const port = 3000;

//communicate with TCP sockets
mongoose.connect(MONGODB_URI);

//////////////////////////////////////////////////////////////////////////////////////////////////
//Main Usage
app.use(express.static("./Public/MyWebGame"));
app.use(bodyParser.json());


//////////////////////////////////////////////////////////////////////////////////////////////////
//Player Leaderboard
app.get('/get-leaderboard', async (req, res) => {
  try {
    // Retrieve leaderboard data from the database
    const leaderboard = await User.find({}, 'username highScore').sort({ highScore: -1 }).limit(10);

    // Send the leaderboard data as JSON
    res.json(leaderboard);
  } catch (error) {
    res.json({ status: 'error', error: 'Failed to retrieve leaderboard' });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//submit the score for the player
app.post('/submit-score', async (req, res) => {
  const { token, score } = req.body;

  try {
    // Verify the token to get the user ID
    const decodedToken = jwt.verify(token, JWT_SECRET);
    const userId = decodedToken.id;

    // Update the user's high score in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ status: 'error', error: 'User not found' });
    }
   // set the user score if it is higher than the last
    if (score > user.highScore) {
      user.highScore = score;
      await user.save();
      return res.json({status: 'ok', data: score});
    }
 //return invalid if the token has been tampered with - also returns unidentified as a
    return res.json({ status: 'ok' });
  } catch (error) {
    return res.json({ status: 'error', error: 'Invalid token' });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//Get the user score
app.get('/get-user-score', async (req, res) => {
  try {
    // Extract the token from the Authorization header
    const authToken = req.headers.authorization.replace('Bearer ', '');

    // Verify the token to get the user ID
    const decodedToken = jwt.verify(authToken, JWT_SECRET);
    const userId = decodedToken.id;

    // Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ status: 'error', error: 'User not found' });
    }

    // Return the user's score
    return res.json({ status: 'ok', userScore: user.highScore });
  } catch (error) {
    return res.json({ status: 'error', error: 'Invalid token' });
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//Login Information
app.post('/login', async (req, res) => {

  const {username, password} = req.body;
  
  //find the user in the database
  const user = await User.findOne({username});
  if(!user){
    //return error if user is not found
    return res.json({status: 'error', error: 'Error Message:\ninvalid Username/Password'});
  }
  //compare the password if the user is found
  if(await bcrypt.compare(password, user.password)){
    const token = jwt.sign({
      id: user._id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // expire after 1 hour
    }, JWT_SECRET);

    return res.json({status: 'ok', data: token});
  }

  //if all else fails return error
  res.json({status: 'error', error: 'Error Message:\ninvalid Username/Password'});
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//running registerd info to here
app.post('/register', async (req, res) => {
  // Hash the password before adding to the database
  const { username, password: plainTextPassword } = req.body;
  const uppercaseRegex = /[A-Z]/;
  const alphanumericRegex = /^[a-zA-Z0-9]+$/; // Regular expression for alphanumeric characters

  // User login handling
  if (!username || typeof username !== 'string' || !alphanumericRegex.test(username)) {
    return res.json({ status: 'error', error: 'Error Message:\nInvalid username. Use only letters and numbers.' });
  }

  // Password handling
  if (!plainTextPassword || typeof plainTextPassword !== 'string') {
    return res.json({ status: 'error', error: 'Error Message:\nInvalid password' });
  }

  // Adding complexity to passwords
  if (plainTextPassword.length < 8 || !uppercaseRegex.test(plainTextPassword)) {
    return res.json({
      status: 'error',
      error: 'Error Message:\nPassword must be 8 characters or more, contain at least one uppercase letter'
    });
  }

  const password = await bcrypt.hash(plainTextPassword, 10);

  try {
    // Create a new user and add in the name and password
    const response = await User.create({
      username,
      password,
      highScore: 0
    });

    // Print out success message (debugging)
    console.log("user created successfully", response);
    return res.json({ status: 'ok' });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key
      return res.json({ status: 'error', error: "Error Message:\nUser name already exists" });
    }
    // Other error that may occur
    throw error;
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//final route for 404
app.get('*', (req, res) => {
  res.status(404).sendFile(__dirname +"/404.html");
});

//////////////////////////////////////////////////////////////////////////////////////////////////
//port listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});