const {
  check
} = require('express-validator');

const AWS = require('aws-sdk');

// Update our AWS Connection Details
AWS.config.update({
  region: process.env.AWS_DEFAULT_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create the service used to connect to DynamoDB
const docClient = new AWS.DynamoDB.DocumentClient();

exports.postBooksValidators = [
  // Check that the rating is a number
  check('rating').isNumeric(),
  check('isbn').custom(async value => {
    const params = {
      TableName: 'nodejs-api'
    }
    let books = await docClient.scan(params).promise()
    let existingBook = books.Items.find(b => b.info.isbn === value)
    if (existingBook) {
      return Promise.reject("That book already exists");
    }
  })
]