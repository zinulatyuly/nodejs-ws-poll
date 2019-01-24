// Import basic modules
const WebSocket = require('ws'),
  fs = require('fs'),
  path = require('path'),
  {parse} = require('querystring'),
  http = require('http');

// Import custom modules
const service = require('./service'),
      db = require('./db'),
      store = require('./store');

// WebSocket setup
const wsServer = new WebSocket.Server({port: 3000});

wsServer.on('connection', (ws, req) => {
  let cookies = service.parseCookies(req);
  if (cookies.questionId) {
    ws.clientCookies = cookies.questionId;
    db.select('answers', `question_id="${cookies.questionId}"`, answerRows => {
      ws.send(`answers=${JSON.stringify(answerRows)}`);
    });
  }

  ws.on('message', message => {
    if (cookies.sessionId && cookies.questionId) {
      let result = parse(message);
      db.insert(
        'voters (question_id, answer_id, name, session)',
        `"${cookies.questionId}", "${result.answer}", "${result.name}", "${cookies.sessionId}"`,
        () => {
          db.selectFirst('voters', `session = "${cookies.sessionId}" AND question_id="${cookies.questionId}"`, insertedRow => {
            ws.send(`inserted=${JSON.stringify(insertedRow)}`);
            wsServer.clients.forEach(client => {
            
              if (client.readyState === WebSocket.OPEN && Number(insertedRow.question_id) === Number(client.clientCookies)) {
                client.send(JSON.stringify(insertedRow));
              }
            })
          });
        });
    }
  });
});


// HTTP setup
const httpServer = http.createServer();

httpServer.on('request', (req, res) => {
  const cookies = service.parseCookies(req);

  let filePath = './public' + req.url;

  if (req.method === 'GET') {
    let contentType = 'text/html';
    if (req.url === '/') filePath = './public/index.html';
    if (req.url.includes('poll')) {
      let getData = parse(filePath.split('?')[1]);

      if (getData.url) {
        db.selectFirst('questions', `url = "${getData.url}"`, questionRow => {
          db.select('answers', `question_id = "${questionRow.id}"`, answerRows => {
            let
              questionLabels = '',
              questionTrs = '',
              tBodyHtml = '',
              nameField = '<input type="text" name="name" required class="input-text">',
              submitButton = '<input type="submit" class="btn" value="Submit">';

            // Collect radio inputs and <thead>
            for (let row of answerRows) {
              questionLabels += `<label><input type="radio" name="answer" value="${row.id}">${row.answer}</label>`;
              questionTrs += `<th>${row.answer}</th>`;
            }

            db.select('voters', `question_id = "${questionRow.id}"`, voterRows => {
              let votedUser = {};

              // Collect <tbody>
              for (let voter of voterRows) {
                if (voter.session === cookies.sessionId) {
                  votedUser = voter;
                  tBodyHtml += `<tr><th style="color: #f89b1c">${voter.name}</th>`;
                } else {
                  tBodyHtml += `<tr><th>${voter.name}</th>`;
                }
                for (let answer of answerRows) {
                  if (votedUser.id === voter.id) {
                    tBodyHtml += answer.id === voter.answer_id ? '<td style="color: #f89b1c">x</td>' : '<td></td>';
                  } else {
                    tBodyHtml += answer.id === voter.answer_id ? '<td>x</td>' : '<td></td>'
                  }
                }
                tBodyHtml += '</tr>';
              }

              // Remove submit button, name input and radio if the user voted
              if (votedUser.name) {
                questionLabels = '';
                submitButton = '';
                nameField = `<h1>${votedUser.name}</h1>`;
              }

              cookies.sessionId
                ? res.writeHead(200, {
                  'Set-Cookie': `questionId=${questionRow.id}`,
                  'Content-Type': contentType
                })
                : res.writeHead(200, {
                  'Set-Cookie': [`sessionId=${service.makeRandom(36)}`, `questionId=${questionRow.id}`],
                  'Content-Type': contentType
                });
              res.end(service.getPollHtml({
                questionRow,
                nameField,
                questionLabels,
                submitButton,
                questionTrs,
                tBodyHtml
              }));
            })
          })
        });
      } else {
        fs.readFile('./public/404.html', function (error, content) {
          res.writeHead(200, {'Content-Type': contentType});
          res.end(content, 'utf-8');
        });
      }
    } else {
      const extname = String(path.extname(filePath)).toLowerCase();

      contentType = store.mimeTypes[extname] || 'application/octet-stream';

      fs.readFile(filePath, function (error, content) {
        if (error) {
          if (error.code === 'ENOENT') {
            fs.readFile('./public/404.html', function (error, content) {
              res.writeHead(200, {'Content-Type': contentType});
              res.end(content, 'utf-8');
            });
          } else {
            res.writeHead(500);
            res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            res.end();
          }
        } else {
          res.writeHead(200, {'Content-Type': contentType});
          res.end(content, 'utf-8');
        }
      });
    }
  } else if (req.method === 'POST') {
    service.fetchPostData(req, result => {
      if (result.question) {
        let url = service.makeRandom(36);
        db.insert('questions (question, url)', `"${result.question}", "${url}"`, () => {
          db.last('questions', insertedRow => {
            let buff = [];
            for (let answer of result.answers) {
              buff.push(`"${insertedRow.id}", "${answer}"`)
            }
            db.insertMany('answers (question_id, answer)', buff, 0, () => {
              res.end(`/poll?url=${insertedRow.url}`);
            });
          });
        });
      }
    });
  }
});

httpServer.listen(4000, () => console.log('Running'));