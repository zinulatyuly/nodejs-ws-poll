let count = 2;

document.getElementById('add-answer').addEventListener('click', addAnswer);

function addAnswer() {
  count++;
  
  let elem = document.getElementById('answers');
  elem.innerHTML = elem.innerHTML + `<tr><th>Answer ${count}:</th><td><input type="text" name="answers" value="Maybe" class="input-text"></td></tr>`;
}

function serialize(form) {
  var field, l, s = [];
  if (typeof form == 'object' && form.nodeName == "FORM") {
    var len = form.elements.length;
    for (var i=0; i<len; i++) {
      field = form.elements[i];
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          l = form.elements[i].options.length;
          for (var j=0; j<l; j++) {
            if(field.options[j].selected)
              s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[j].value);
          }
        } else if ((field.type != 'checkbox' && field.type != 'radio') || field.checked) {
          s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value);
        }
      }
    }
  }
  return s.join('&').replace(/%20/g, '+');
}


document.getElementById('form').addEventListener('submit', function (e) {
  e.preventDefault();
  let formElement = document.querySelector('form');
  //let fd = new FormData(formElement);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/create-poll");
  xhr.onload = function() {
    if (xhr.status === 200) {
      window.location.replace(xhr.response);
    }
  };
  xhr.send(serialize(formElement));

});
