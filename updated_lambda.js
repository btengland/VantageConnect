import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";

// This is the updated Lambda code.
// NOTE: For this to work, the frontend must be updated to handle the 'updateGame' action
// and process the full game object it receives. The original frontend code will not work with this.

const client = new DynamoDBClient({});
const db = DynamoDBDocumentClient.from(client);

const api = new ApiGatewayManagementApiClient({
  endpoint: process.env.WEBSOCKET_API_URL,
});

const broadcastGameUpdate = async (game) => {
  const connectionsResp = await db.send(
    new ScanCommand({
      TableName: "Connections",
      FilterExpression: "gameId = :gid",
      ExpressionAttributeValues: { ":gid": game.gameId },
    })
  );

  if (!connectionsResp.Items || connectionsResp.Items.length === 0) {
    console.log("No connections to broadcast to for game:", game.gameId);
    return;
  }

  const postPromises = connectionsResp.Items.map(async (conn) => {
    try {
      await api.send(
        new PostToConnectionCommand({
          ConnectionId: conn.connectionId,
          Data: JSON.stringify({ action: "updateGame", game }),
        })
      );
    } catch (err) {
      if (err.name === "GoneException" || err.statusCode === 410) {
        console.log(`Deleting stale connection: ${conn.connectionId}`);
        await db.send(
          new DeleteCommand({
            TableName: "Connections",
            Key: { connectionId: conn.connectionId },
          })
        );
      } else {
        console.warn(`Failed to send to connection ${conn.connectionId}`, err);
      }
    }
  });

  await Promise.all(postPromises);
};

export const handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event, null, 2));
  const body = JSON.parse(event.body || "{}");
  const { action, gameId, challengeDice } = body;

  if (!gameId) {
    return { statusCode: 400, body: JSON.stringify({ message: "Missing gameId" }) };
  }
  const gameIdNum = Number(gameId);

  try {
    let game;

    if (action === "updateChallengeDice") {
      if (typeof challengeDice !== "number") {
        return { statusCode: 400, body: JSON.stringify({ message: "challengeDice must be a number" }) };
      }

      const updateResp = await db.send(
        new UpdateCommand({
          TableName: "Games",
          Key: { gameId: gameIdNum },
          UpdateExpression: "SET challengeDice = :val",
          ExpressionAttributeValues: { ":val": challengeDice },
          ReturnValues: "ALL_NEW",
        })
      );
      game = updateResp.Attributes;

    } else if (action === "readPlayers") {
      const gameResp = await db.send(
        new GetCommand({
          TableName: "Games",
          Key: { gameId: gameIdNum },
        })
      );
      if (!gameResp.Item) {
        return { statusCode: 404, body: JSON.stringify({ message: "Game not found" }) };
      }
      game = gameResp.Item;

    } else {
      // Potentially handle other actions like 'endTurn' here in the future
      console.log("Unknown or unhandled action:", action);
      const gameResp = await db.send(
        new GetCommand({
          TableName: "Games",
          Key: { gameId: gameIdNum },
        })
      );
      if (!gameResp.Item) {
        return { statusCode: 404, body: JSON.stringify({ message: "Game not found" }) };
      }
      game = gameResp.Item;
    }

    if (game) {
      await broadcastGameUpdate(game);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Action processed successfully." }),
    };
  } catch (err) {
    console.error("Error in handler:", err);
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
  }
};
