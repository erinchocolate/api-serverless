'use strict';
const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({region: 'us-east-1'});

const send = (statusCode, data) => {
  return {
    statusCode,
    body:JSON.stringify(data)
  }
}


module.exports.createNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: "notes",
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression:"attribute_not_exists(notesId)"
    }
    await documentClient.put(params).promise();
    callback(null, send(201, data));
  } catch (err) {
    callback(null, send(500, err.message));
  }
};

module.exports.updateNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters.id;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: "notes",
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body"
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body
      },
      ConditionExpression: "attribute_exists(notesId)"

    }
    await documentClient.update(params).promise();
    callback(null, send(200, data));
  } catch (err) {
    callback(null, send(500, err.message));
  }
};

module.exports.getAllNotes = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const params = {
      TableName: "notes",
    }
    const notes = await documentClient.scan(params).promise();
    callback(null, send(200, notes));
  } catch (err){
    callback(null, send(500, err.message));
  }
};