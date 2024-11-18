'use strict';

const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = async (event) => {
  const params = {
    TableName: process.env.CANDIDATE_TABLE,
    ProjectionExpression: 'id, fullname, email',
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ candidates: data.Items }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Unable to list candidates' }),
    };
  }
};
