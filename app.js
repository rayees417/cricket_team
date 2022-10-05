const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__sirname, "cricketTeam.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
//API 1 Get the list of all players

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
SELECT * FROM cricket_team
ORDER BY player_id;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(playersArray);
});

//API 2 create new player in team database
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
INSERT INTO cricket_team (playerId ,playerName, jerseyNumber, role)
VALUES (
${playerId},
'${playerName}',
${jerseyNumber},
'${role}'
);`;

  const dbResponse = await db.run(addPlayerQuery);

  response.send("Player added to team");
});

//API 3 get player by player_id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerArray = `
SELECT * FROM cricket_team
WHERE player_id = ${playerId}`;
  const player = await db.get(getPlayerArray);
  response.send(player);
});

// API 4 update player details

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = response.params;
  const playerDetails = response.body;
  const { player_id, player_name, jersey_number, role } = playerDetails;
  const updatePlayerQuery = `
UPDATE cricket_team 
SET
player_id = ${player_id},
player_name = '${player_name}',
jersey_number = ${jersey_number},
role = '${role}
WHERE player_id = ${playerId};
`;
  await db.run(updatePlayerQuery);
  response.send("Player details updated");
});

// API 5 delete player details
app.delete("/player/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
DELETE FROM cricket_team
WHERE player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
