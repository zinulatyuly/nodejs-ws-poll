const mysql = require('mysql'),
      { user, host, password, database } = require('./db-settings');

console.log('createdb.js');


const con = mysql.createConnection({
  host,
  user,
  password
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected...");
  con.query(`CREATE DATABASE ${database}`, function (err, result) {
    if (err) throw err;
    console.log("Database created");
    console.log("Done!");
  });
});

