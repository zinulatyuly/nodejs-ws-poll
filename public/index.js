import service from './public-service.js';

let count = 2;

document.getElementById('add-answer').addEventListener('click', addAnswer);

function addAnswer() {
  count++;
  
  let elem = document.getElementById('answers');
  elem.innerHTML = elem.innerHTML + `<tr><th>Answer ${count}:</th><td><input type="text" name="answers" value="Maybe" class="input-text"></td></tr>`;
}

document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  let formElement = document.querySelector('form');
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/create-poll");
  xhr.onload = function() {
    if (xhr.status === 200) {
      window.location.replace(xhr.response);
    }
  };
  xhr.send(service.serialize(formElement));

});
