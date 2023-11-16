const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(express.static("./Static"))
app.use(bodyParser.json);

app.post('/register', async (req, res) => {
  console.log(req.body);
  res.json({status: 'ok'});
});

app.get('*', (req, res) => {
  res.status(404).sendFile(__dirname +"/404.html");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});