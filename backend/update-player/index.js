import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, GetCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const WS_ENDPOINT = 'https://4gjwhoq0uf.execute-api.us-east-2.amazonaws.com/production';

async function sendToClient(connectionId, payload) {
  const wsClient = new ApiGatewayManagementApiClient({ endpoint: WS_ENDPOINT });
  try {
    await wsClient.send(new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: JSON.stringify(payload)
    }));
    console.log("✅ Sent to client:", payload);
  } catch (err) {
    if (err.name === 'GoneException') {
      console.log(`⚠️ Connection ${connectionId} is gone. Removing from Connections table.`);
      await docClient.send(new DeleteCommand({
        TableName: "Connections",
        Key: { connectionId }
      }));
    } else {
      console.error("❌ Failed to send to client:", err);
    }
  }
}

export const handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { playerId, updates } = body;
    const connectionId = event.requestContext?.connectionId;

    if (typeof playerId !== "number" || !updates) {
      if (connectionId) {
        await sendToClient(connectionId, { action: 'error', message: "playerId must be a number and updates are required", code: 400 });
      }
      return { statusCode: 400, body: JSON.stringify({ message: "playerId must be a number and updates are required" }) };
    }

    // Get current player
    const { Item: currentPlayer } = await docClient.send(new GetCommand({
      TableName: "Players",
      Key: { playerId }
    }));

    if (!currentPlayer) {
      if (connectionId) {
        await sendToClient(connectionId, { action: 'error', message: "Player not found", code: 404 });
      }
      return { statusCode: 404, body: JSON.stringify({ message: "Player not found" }) };
    }

    // Merge updates
    const finalUpdates = {};
    for (const key in updates) {
      // Check if the property is an array
      if (Array.isArray(updates[key])) {
        finalUpdates[key] = updates[key]; // Replace the array
      } else if (typeof updates[key] === 'object' && updates[key] !== null && currentPlayer[key] && typeof currentPlayer[key] === 'object') {
        finalUpdates[key] = { ...currentPlayer[key], ...updates[key] }; // Merge objects
      } else {
        finalUpdates[key] = updates[key]; // Replace primitives
      }
    }

    // Build DynamoDB update expression
    let UpdateExpression = "SET";
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};
    let first = true;
    for (const key in finalUpdates) {
      if (!first) UpdateExpression += ",";
      first = false;
      const attrName = `#${key}`;
      const attrValue = `:${key}`;
      UpdateExpression += ` ${attrName} = ${attrValue}`;
      ExpressionAttributeNames[attrName] = key;
      ExpressionAttributeValues[attrValue] = finalUpdates[key];
    }

    // Update player
    const result = await docClient.send(new UpdateCommand({
      TableName: "Players",
      Key: { playerId },
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW"
    }));

    // Push updates to all connected clients
    const connectionsResult = await docClient.send(new ScanCommand({
        TableName: "Connections",
        FilterExpression: "sessionCode = :sc",
        ExpressionAttributeValues: { ":sc": Number(currentPlayer.sessionCode) }
    }));

    const updatePayload = {
        action: 'playerPatched',
        playerId: playerId,
        updates: finalUpdates
    };

    const promises = (connectionsResult.Items || [])
        .filter(conn => conn.connectionId !== connectionId)
        .map(conn => sendToClient(conn.connectionId, updatePayload));

    await Promise.all(promises);

    // Respond to requesting client
    if (connectionId) {
      await sendToClient(connectionId, {
        action: 'playerUpdated',
        player: result.Attributes,
        code: 200
      });
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Player updated successfully", player: result.Attributes }) };

  } catch (err) {
    console.error('Lambda error:', err);
    const connectionId = event.requestContext?.connectionId;
    if (connectionId) {
      await sendToClient(connectionId, { action: 'error', message: "Internal server error", code: 500 });
    }
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error", error: err.message }) };
  }
};
