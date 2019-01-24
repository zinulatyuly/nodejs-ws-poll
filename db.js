const mysql = require('mysql'),
      { user, password, host, database } = require('./setup/db-settings');

const con = mysql.createConnection({
  host,
  user,
  password,
  database
});

exports.user = user;
exports.host = host;
exports.password = password;

con.connect(function (err) {
  if (err) throw err;
  console.log('Connected to DB');
  
  exports.query = function (sql) {
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(result);
    });
  };
  
  exports.selectFirst = function (from, where, callback) {
    let sql = `SELECT * FROM ${from} WHERE ${where}`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(result[0]);
    });
  };
  
  exports.select = function (from, where, callback) {
    let sql = `SELECT * FROM ${from} WHERE ${where}`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(result);
    });
  };
  
  exports.last = function (from, callback) {
    let sql = `SELECT * FROM ${from} ORDER BY id DESC LIMIT 1`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(result[0]);
    });
  };
  
  exports.insert = function (into, values, callback) {
    let sql = `INSERT INTO ${into} VALUES (${values})`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback();
    });
  };
  
  function recourseInsert(into, rows, step, callback) {
    let sql = `INSERT INTO ${into} VALUES (${rows[step]})`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      step++;
      step < rows.length ? recourseInsert(into, rows, step, callback) : callback();
    });
  }
  
  exports.insertMany = function (into, rows, step, callback) {
    return recourseInsert(into, rows, step, callback);
  }
});