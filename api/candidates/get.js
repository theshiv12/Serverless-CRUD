'use strict';

const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = async (event) => {
  const params = {
    TableName: process.env.CANDIDATE_TABLE,
    Key: { id: event.pathParameters.id },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Candidate not found' }),
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unable to fetch candidate' }),
    };
  }
};
