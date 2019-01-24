function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function serialize(form) {
  let field, l, s = [];
  if (typeof form == 'object' && form.nodeName == "FORM") {
    let len = form.elements.length;
    for (let i = 0; i < len; i++) {
      field = form.elements[i];
      if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
        if (field.type == 'select-multiple') {
          l = form.elements[i].options.length;
          for (let j = 0; j < l; j++) {
            if (field.options[j].selected)
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

export default {
  isJsonString,
  serialize
}