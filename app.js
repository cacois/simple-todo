const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const port = process.env.PORT
  ? process.env.PORT
  : 3000;
const dbHost = process.env.DB_HOST
  ? process.env.DB_HOST
  : "localhost";
const databaseName = process.env.DB_DATABASE_NAME
  ? process.env.DB_DATABASE_NAME
  : "simpletodo";
const dbUser = process.env.DB_USER
  ? process.env.DB_USER
  : "mysql_user";
const dbPass = process.env.DB_mongoPASS
  ? process.env.DB_PASS
  : "my-secret-pw";
const dbRootPass = process.env.DB_ROOT_PASS
  ? process.env.DB_ROOT_PASS
  : "my-secret-root-pw";

const app = express();
app.use(bodyParser.json());
let db;

app.use(express.static("public"));
app.use(express.static('node_modules/todomvc-common'));
app.use(express.static('node_modules/todomvc-app-css'));
app.use(favicon(__dirname + '/public/images/favicon.ico'));

/**
 * Creates the database if it doesn't exist
 */
async function initDB() {
  try {
    // now init non-root connection to use
    console.log('connecting to mysql...');
    db = await mysql.createConnection({host: dbHost, user: dbUser, password: dbPass, database: databaseName});
  } catch (e) {
    console.log(`ERROR: Unable to connect to database: ${e}`);
    throw e;
  }

  try {
    console.log('creating todos table...');
    const createTableQuery = 
      "CREATE TABLE IF NOT EXISTS todos (id INT PRIMARY KEY AUTO_INCREMENT, text VARCHAR(255) NOT NULL, complete BOOLEAN NOT NULL)";
    await db.query(createTableQuery);
  } catch (e) {
    console.log(`ERROR: Create table if not exists query failed: ${e}`);
    throw e;
  }
  console.log("done")
}

app.get("/", (req, res) => res.render("index.html"));
app.get("/favicon.ico", (req, res) => res.render("favicon.ico"));

app.get("/todos", async function (req, res) {
  console.log('GET /todos')

  // if we detect a lack of connection, try to connect
  if(!db || !db.connection) {
    console.log('Disconnected state detected - reconnecting to DB');
    initDB();
  }

  if (db && db.connection) {
    try {
      const [rows, fields] = await db.query("SELECT * from todos")
      res.send(rows)
    } catch (err) {
      console.log(`error querying DB: ${err}`);
      res.status(500).send();
    }
  }
});

/**
 * Syncs a list of todos to the DB.
 * If a todo has an id, its updated. If a todo has no ID, its inserted.
 * Returns a list of todos, with IDs
 * todo structure: {"id": #, "text": string, "complete": boolean}
 */
app.put("/todos", async function (req, res) {
  console.log('writing todos');
  
  // if we detect a lack of connection, try to connect
  if(!db || !db.connection) {
    console.log('Disconnected state detected - reconnecting to DB');
    initDB();
  }

  if (db && db.connection) {
    console.log('clearing table...');
    try {
      [results] = await db.query("DELETE FROM todos");
    } catch (err) {
      console.log(`error on delete: ${err}`)
      res.status(500).send();
      return
    }

    errors = [];
    todos = req.body
    console.log('inserting...');

    // format todos into nested array for sql bulk insert
    todos = todos.map((todo) => [todo.text, todo.complete])

    try {
      // format bulk insert query string
      const query = mysql.format("INSERT INTO todos (text, complete) VALUES ?", [todos])

      console.log(`query: ${query}`)
      await db.execute(query);

      console.log('todos synced with db');
    } catch (err) {
      console.log(`Insert error: ${err}`);
      errors.push(err);
    }

    console.log(`errors.length: ${errors.length}`)

    if (errors.length > 0) {
      console.log('500')
      res.status(500).send(errors);
    } else {
      console.log('201')
      res.sendStatus(201);
    }
  }
});


// Main: init DB
try {
  initDB();
} catch (e) {
  console.log(`ERROR: Unable to initialize database: ${e}`);
}

app.listen(port, () => console.log(`Listening on port ${port}!`));
