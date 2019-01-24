const mysql = require('mysql'),
      { user, password, host, database } = require('./db-settings');

console.log('foreign.js');

let con = mysql.createConnection({
  host,
  user,
  password,
  database
});

const queries = [
  `ALTER TABLE voters
   ADD FOREIGN KEY (question_id) REFERENCES questions(id)`,
  `ALTER TABLE voters
   ADD FOREIGN KEY (answer_id) REFERENCES answers(id)`,
  `ALTER TABLE answers
   ADD FOREIGN KEY (question_id) REFERENCES questions(id)`
];

function recourseAdd(rows, step, callback) {
  con.query(rows[step], function (err, result) {
    if (err) throw err;
    console.log(rows[step].substr(0, 40) + '... successful!');
    step++;
    step < rows.length ? recourseAdd(rows, step, callback) : callback();
  });
}

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected...");
  recourseAdd(queries, 0, result => {
    console.log('Done!');
  })
});