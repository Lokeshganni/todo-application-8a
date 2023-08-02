const express = require("express");
const app = express();
app.use(express.json());
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const dbPath = path.join(__dirname, "todoApplication.db");

let db;

const initialiseServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at PORT 3000");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

initialiseServer();

//API 1 get list of todo's who's status is "TO DO"

app.get("/todos/", async (req, res) => {
  const { status, priority, search_q = "" } = req.query;
  const api1Query = `
    SELECT * FROM todo
    WHERE status='${status}';`;
  const api1Res = await db.all(api1Query);
  res.send(api1Res);
});
