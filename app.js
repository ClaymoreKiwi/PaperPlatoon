const http = require('http');
const fs = require('fs');
const port = 3000;

// Create a server object:
const server = http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' }); 

  fs.readFile('Public/MyWebGame/index.html', function (error, data) {
    if (error) {
      res.writeHead(404);
      res.write('File Not Found');
    } else {
      res.write(data);
    }
    res.end();
  });
});

// Set up our server so it will listen on the port
server.listen(port, function (error) {
  // Checking if any error occurred while listening on the port
  if (error) {
    console.log('Something went wrong', error);
  } else {
    console.log('Server is listening on port ' + port); // Added a space before the port
  }
});
