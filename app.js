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

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

let resultKey;

const hasPriorityProperty = (requestQuery) => {
  resultKey = "Priority";
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  resultKey = "Status";
  return requestQuery.status !== undefined;
};

const hasTodoProperty = (requestQuery) => {
  resultKey = "Todo";
  return requestQuery.todo !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT * FROM todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT * FROM todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT * FROM todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT * FROM todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

//API 2

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  api2Query = `
    SELECT * FROM todo WHERE id=${todoId};`;
  const api2Res = await db.get(api2Query);
  res.send(api2Res);
});

//API 3

app.post("/todos/", async (req, res) => {
  const api3Body = req.body;
  const { id, todo, priority, status } = api3Body;
  const api3Query = `
    INSERT INTO todo(id,todo,priority,status)
    VALUES(${id},'${todo}','${priority}','${status}');`;
  const api3Res = await db.run(api3Query);
  res.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const api4Body = req.body;
  //   const { status, priority, todo, search_q = "" } = req.query;
  const updatableObj = `
  SELECT * FROM todo WHERE id=${todoId};`;
  const edoOkati = await db.get(updatableObj);
  let api4Query;
  switch (true) {
    case hasStatusProperty(req.body):
      api4Query = `
              UPDATE todo
              SET 
                id=${todoId},
                todo='${edoOkati.todo}',
                priority='${edoOkati.priority}',
                status='${req.body.status}'
              WHERE id=${todoId};`;
      break;
    case hasPriorityProperty(req.body):
      api4Query = `
              UPDATE todo
              SET 
                id=${todoId},
                todo='${edoOkati.todo}',
                priority='${req.body.priority}',
                status='${edoOkati.status}'
              WHERE id=${todoId};`;
      break;
    case hasTodoProperty(req.body):
      api4Query = `
              UPDATE todo
              SET 
                id=${todoId},
                todo='${req.body.todo}',
                priority='${edoOkati.priority}',
                status='${edoOkati.status}'
              WHERE id=${todoId};`;
      break;
  }

  await db.run(api4Query);
  res.send(`${resultKey} Updated`);
});

//API 5

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteQuery = `
    DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteQuery);
  res.send("Todo Deleted");
});

module.exports = app;
