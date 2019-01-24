const { parse } = require('querystring');

module.exports = {
  fetchPostData: (req, callback) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      callback(parse(body));
    });
  },
  parseCookies: request => {
    let list = {},
      rc = request.headers.cookie;
    
    rc && rc.split(';').forEach(function (cookie) {
      let parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
    
    return list;
  },
  makeRandom: n => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    
    for (let i = 0; i < n; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    return text;
  },
  getPollHtml: ({ questionRow, nameField, questionLabels, submitButton, questionTrs, tBodyHtml }) => {
    return `<!DOCTYPE html>
                <html lang="ru">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="minimum-scale=1.0, width=device-width, maximum-scale=1.0, user-scalable=no">
                    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Roboto+Condensed:300,400,400i,700" media="all">
                    <title>Poll</title>
                    <link rel="stylesheet" href="app.css">
                </head>
                
                <body>
                <header>
                    <h1>Test task</h1>
                    <strong id="status">OFFLINE</strong>
                    <div style="margin: 20px">
                        <button 
                            type="button"
                            class="btn" 
                            style="background: #6fd9d8;"
                            onclick="prompt('Please, copy this link',window.location.href)">
                            Share link with friends
                        </button>
                    </div>
                </header>
                
                <main>
                <div class="page">
                    <div class="poll">
                      <h1>${questionRow.question}</h1>
                      <form id="poll">
                      <div class="ex2-question">
                          <div class="ex2-question__label">
                              Your name:
                          </div>
                          <div class="ex2-question__input" id="name-field">
                              ${nameField}
                          </div>
                          <div class="ex2-question__answer" id="question-labels">${questionLabels}</div>
                          <div class="ex2-question__submit" id="submit-button">
                              ${submitButton}
                          </div>
                      </div>
                      </form>
                      <h1>
                          Results
                      </h1>
                      <br>
                      <table class="ex2-table">
                          <thead>
                          <tr>
                              <th>Name</th>
                              ${questionTrs}
                          </tr>
                          </thead>
                          <tbody id="results">
                          ${tBodyHtml}
                          </tbody>
                        </table>
                    </div>
                    </div>
                  </main>
                
                <script src="app.js" type="module"></script>
                </body>
              </html>`
  }
};
