'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = async (event) => {
    try {
        const requestBody = JSON.parse(event.body);
        const { fullname, email, experience } = requestBody;

        if (!fullname || !email || typeof experience !== 'number') {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Validation Failed' }),
            };
        }

        const checkEmailParam = {
            TableName: process.env.CANDIDATE_TABLE,
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': email,
            },
        };

        const emailResult = await dynamoDb.query(checkEmailParam).promise();

        if (emailResult.Items && emailResult.Items.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Email Already Exists' }),
            };
        }
        const candidate = {
            id: uuid.v1(),
            fullname,
            email,
            experience,
            submittedAt: Date.now(),
            updatedAt: Date.now(),
        };

        const params = {
            TableName: process.env.CANDIDATE_TABLE,
            Item: candidate,
        };

        await dynamoDb.put(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Successfully submitted candidate with email ${email}`,
                candidateId: candidate.id,
            }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Unable to submit candidate' + err }),
        };
    }
};
