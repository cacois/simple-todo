const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require('body-parser');
const port = process.env.PORT ? process.env.PORT : 3000;
const dbHost = process.env.DB_HOST ? process.env.DB_HOST : "localhost";
const databaseName = process.env.DB_DATABASE_NAME ?
  process.env.DB_DATABASE_NAME :
  "simpletodo";
const dbUser = process.env.DB_USER ? process.env.DB_USER : "mysql_user";
const dbPass = process.env.DB_PASS ? process.env.DB_PASS : "my-secret-pw";
const dbRootPass = process.env.DB_ROOT_PASS ?
  process.env.DB_ROOT_PASS :
  "my-secret-root-pw";

const app = express();
app.use(bodyParser.json());
let db;

app.use(express.static("public"));
app.use(express.static('node_modules/todomvc-common'));
app.use(express.static('node_modules/todomvc-app-css'));

/**
 * Creates the database if it doesn't exist
 */
async function initDB() {
  try {
    // now init non-root connection to use
    db = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPass,
      database: databaseName
    });
  } catch (e) {
    console.log(`ERROR: Unable to connect to database: ${e}`);
    throw e;
  }

  try {
    const createTableQuery =
      "CREATE TABLE IF NOT EXISTS todos (id INT PRIMARY KEY AUTO_INCREMENT, text VARCHAR(255) NOT NULL, complete BOOLEAN NOT NULL)";
    await db.query(createTableQuery);
  } catch (e) {
    console.log(`ERROR: Create table if not exists query failed: ${e}`);
    throw e;
  }
}

app.get("/", (req, res) => res.render("index.html"));

app.get("/todos", function (req, res) {
  if (db) {
    db.query("SELECT * from todos", function (error, results) {
      if (error) throw error;
      res.send(results);
    });
  } else res.status(500).send();
});

/**
 * Syncs a list of todos to the DB. 
 * If a todo has an id, its updated. If a todo has no ID, its inserted.
 * Returns a list of todos, with IDs
 * todo structure: {"id": #, "text": string, "complete": boolean}
 */
app.put("/todos", function (req, res) {
  if (db) {
    db.query("DELETE FROM todos");

    errors = [];
    req.body.forEach(todo => {
      db.query("INSERT INTO todos SET ?", todo, function (err, result) {
        if (err) {
          error.push(err);
        }
      });
    });

    if (errors.length > 0) res.status(500).send(errors);
    else res.sendStatus(201);

  } else res.status(500).send();
});

// init DB
try {
  initDB();
} catch (e) {
  console.log(`ERROR: Unable to initialize database: ${e}`);
}

app.listen(port, () => console.log(`Listening on port ${port}!`));
