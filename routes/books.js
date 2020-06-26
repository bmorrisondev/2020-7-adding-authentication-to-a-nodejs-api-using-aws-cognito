const express = require('express');
const router = express.Router();
const {
  validationResult
} = require('express-validator');
const validators = require('./booksValidators')
const {
  validateAuth
} = require('../auth')
const AWS = require('aws-sdk');

// Update our AWS Connection Details
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create the service used to connect to DynamoDB
const docClient = new AWS.DynamoDB.DocumentClient();

// Define another get with a route afterwards
router.get('/:id?', async (req, res) => {
  // Placing the params here since we may add filters to it
  const params = {
    TableName: 'nodejs-api'
  };

  let responseData;

  // Setup any filters that come in
  if (req.params.id) {
    // params.Key is used to filter based on the primary key of the table
    params.Key = {
      id: req.params.id
    };
  } else {
    if (req.query.id) {
      params.Key = {
        id: req.query.id
      };
    }
  }

  if (!params.Key) {
    // If there are no params, scan the table and return all records
    responseData = await docClient.scan(params).promise();
  } else {
    // Otherwise use the filted version, which is less costly
    responseData = await docClient.get(params).promise();
  }

  // Finally, return the data
  res.json(responseData);
});

// Update the middleware to use validateAuth. I can use the spread operator (...) to include the validators as well.
router.post('/', [validateAuth, ...validators.postBooksValidators], async (req, res) => {
  // If there are any validation errors, send back a 400 Bad Request with the errors
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      errors: errors.array()
    })
  }

  // Setup the parameters required to save to Dynamo
  const params = {
    TableName: 'nodejs-api',
    Item: {
      // Use Date.now().toString() just to generate a unique value
      id: Date.now().toString(),
      // `info` is used to save the actual data
      info: req.body
    }
  };

  docClient.put(params, (error) => {
    if (!error) {
      // Send a status of 201, which means an item was created
      res.status(201).send();
    } else {
      // If there was an error, send a 500 (Internal Server Error) along with the error
      res.status(500).send('Unable to save record, err' + error);
    }
  });
});

// Export the router
module.exports = router;