const mysql = require("mysql2");

// Connect to database
const db = mysql.createConnection(
  {
    socketPath: "/tmp/mysql.sock",
    host: `localhost`,
    // Your MySQL username,
    user: "root",
    // Your MySQL password
    password: "",
    database: "employees",
  },
  console.log("Connected to the employees database.")
);

module.exports = db;
