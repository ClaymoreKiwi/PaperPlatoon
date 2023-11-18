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
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/paperDb';

const https = require('https');

const app = express();
const port = 3000;

//communicate with TCP sockets
mongoose.connect(MONGODB_URI);

//////////////////////////////////////////////////////////////////////////////////////////////////
//Main Usage
app.use(express.static("./Public/MyWebGame"));
app.use(bodyParser.json());


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
  //hash the password before adding to the database
  const {username, password: plainTextPassword} = req.body;

  //user login handling
  if(!username || typeof username !== 'string'){
    return res.json({status: 'error', error: 'Error Message:\nInvalid username'})
  }
  //password handling
  if(!plainTextPassword || typeof plainTextPassword !== 'string'){
    return res.json({status: 'error', error: 'Error Message:\nInvalid password'})
  }
  if(plainTextPassword.length < 8){
    return res.json({status: 'error', error: 'Error Message:\npassword is too short, use 8 or more charcters'})
  }

  const password = await bcrypt.hash(plainTextPassword, 10);

  try{
    //create new user and add in the name and password
      const response = await User.create({
        username,
        password,
        highScore: 0
      });
      //print out success message (debugging)
      console.log("user created successfully",response);
      return res.json({status: 'ok'});
  }
  catch(error){
    if(error.code === 11000)
    {
      //duplicate key
      return res.json({status: error, error: "Error Message:\nUser name already exists"});
    }
    //other error that may occur 
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