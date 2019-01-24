const mysql = require('mysql'),
      { user, password, host, database } = require('./db-settings');

const con = mysql.createConnection({
  host,
  user,
  password,
  database
});

const queries = [
    `DROP TABLE IF EXISTS voters`,
    `DROP TABLE IF EXISTS answers`,
    `DROP TABLE IF EXISTS questions`,
    `CREATE TABLE questions (
      id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
      question text DEFAULT NULL,
      url varchar(36) DEFAULT NULL,
      PRIMARY KEY (id)
    )`,
    `ALTER TABLE questions
     ADD UNIQUE INDEX url (url)`,
    `CREATE TABLE answers (
      id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
      question_id int(11) UNSIGNED NOT NULL,
      answer varchar(255) NOT NULL,
      PRIMARY KEY (id)
    )`,
    `CREATE TABLE voters (
    id int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    question_id int(11) UNSIGNED NOT NULL,
    answer_id int(11) UNSIGNED NOT NULL,
    name varchar(255) NOT NULL,
    session varchar(36) DEFAULT NULL,
    PRIMARY KEY (id)
    )`
];

function recourseCreate(rows, step, callback) {
  con.query(rows[step], function (err, result) {
    if (err) throw err;
    console.log(rows[step].substr(0, 20) + '... successful!');
    step++;
    step < rows.length ? recourseCreate(rows, step, callback) : callback();
  });
}

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected...");
  recourseCreate(queries, 0, result => {
    console.log('Done!');
  })
});