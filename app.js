const express = require('express');
//logging and debugging purposes
const bodyParser = require('body-parser');
//mongo DB wrapper
const mongoose = require('mongoose');
const User = require("./Public/MyWebGame/js/model/user");
//encryption using hashing
const bcrypt = require('bcryptjs');

const app = express();
const port = 3000;

//communicate with TCP sockets
mongoose.connect('mongodb://localhost:27017/paperDb');


//////////////////////////////////////////////////////////////////////////////////////////////////
//Main Usage
app.use(express.static("./Public/MyWebGame"));
app.use(bodyParser.json());

//////////////////////////////////////////////////////////////////////////////////////////////////
//running registerd info to here
app.post('/register', async (req, res) => {
  const {username, password: plainTextPassword} = req.body;
  const password = await bcrypt.hash(plainTextPassword, 10);

  try{
      const response = await User.create({
        username,
        password
      });
      console.log("user created successfully",response);
  }
  catch(error){
    console.log(error);
    return res.json({status: error});
  }

  res.json({status: 'ok'});
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