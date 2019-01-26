import service from './public-service.js';

const status = document.getElementById('status'),
  form = document.getElementById('poll'),
  questionLabels = document.getElementById('question-labels'),
  submitButton = document.getElementById('submit-button'),
  nameField = document.getElementById('name-field'),
  elem = document.getElementById('results');

const ws = new WebSocket('ws://localhost:3000');

let answers = [];
let voter = {};

function onMessage(value) {
  if (value.startsWith('answers=')) {
    answers = JSON.parse(value.slice(8));
  }
  else if (value.startsWith('inserted=')) {
    voter = JSON.parse(value.slice(9));
    questionLabels.innerHTML = '';
    submitButton.innerHTML = '';
    nameField.innerHTML = `<h1>${voter.name}</h1>`;
  }
  else if (service.isJsonString(value)) {
    let obj = JSON.parse(value);
    let answersHtml = obj.id === voter.id ? `<tr><th style="color: #f89b1c">${obj.name}</th>` : `<tr><th>${obj.name}</th>`;
    
    for (let answer of answers) {
      if (obj.id === voter.id) {
        answersHtml += Number(obj.answer_id) === Number(answer.id) ? `<td style="color: #f89b1c">x</td>` : `<td></td>`;
      } else {
        answersHtml += Number(obj.answer_id) === Number(answer.id) ? `<td>x</td>` : `<td></td>`;
      }
    }
    
    answersHtml += `</tr>`;
    
    elem.innerHTML += answersHtml;
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  
  const formElement = document.querySelector('form');
  
  ws.send(service.serialize(formElement) + '&' + window.location.search.substr(1));
});

ws.onopen = () => status.innerHTML = '<strong style="color: green">ONLINE</strong>';
ws.onclose = () => status.innerHTML = '<strong style="color: red">OFFLINE</strong>';

ws.onmessage = ({ data }) => onMessage(data);