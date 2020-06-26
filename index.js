require('dotenv').config();
// Import express and create a new express app
const express = require('express');
const app = express();
// Import our new books route file
const booksRoute = require('./routes/books');

// Add body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Register the books routes with /books
app.use('/books', booksRoute);

// // Define a basic GET request. The request & response object are passed in
app.get('/', async (req, res) => {
  // Use the request object to send back 'Hello world!'
  res.send('Hello world!');
});

// Define the port we're going to listen for requests on
const port = 3000;

// Tell the app to listen on that port, and log out to the console once its listening.
app.listen(port);
console.log(`listening on http://localhost:${port}`);
