# simple-todo

A very simple todo app, with styles from [todomvc.com](http://www.todomvc.com). Created as a tool for demonstration of deployment capabilities, specifically with Kubernetes.

# Design

simple-todo is a very basic Express app, with a Mysql backend and some basic jquery to facilitate the single-page frontend. The UI allows you to:

- Enter a new todo
- Mark a todo as complete
- Delete a todo

If connected to a mysql database, the app will load todos on page load. The app will sync todos with the mysql database each time you change the data in the UI.

simple-todo has been designed specifically to work seamlessly without a database connection. The user will notice errors in the browser console, marking attempts to sync with the database. Without a database connection, refreshing the page will also erase all todos.

# To Run Locally

Install dependencies:

```bash
$ npm i
```

Start the mysql database (and an adminer instance):

```bash
$ docker-compose up -d
```

Then start the app:

```bash
$ npm start
```

And access at [http://localhost:3000](http://localhost:3000)

# Using Docker

Build the app image:

```bash
$ docker build -t simple-todo .
```

Then run:

```bash
$ docker run -d -p 3000:3000 --name simple-todo simple-todo
```

And access at [http://localhost:3000](http://localhost:3000)
