var elements;

function saveOptions(e) {
  var cfg = '';
  for(var i = 0, element; element = elements[i]; i++) {
    if(element.checked === true){
      cfg += element.value;
    }
  }
  browser.storage.local.set({
    passhashng: { cfg: cfg}
  }).then(function(){}, onError);

  function onError(error) {
    console.log(`Error: ${error}`);
  }

}

function restoreOptions() {

  function setCurrentChoice(result) {
    var num = 16;
    if(typeof result.passhashng !== 'undefined' && typeof result.passhashng.cfg !== 'undefined' ) {
      num = result.passhashng.cfg.replace( /^\D+/g, '');
      elements = document.querySelectorAll("input");
      for(var i = 0, element; element = elements[i]; i++) { 
        if(typeof element.type !== 'undefined' && element.type == 'radio') {
          if(element.value == num) {
            element.checked = true;
          }
          else {
            element.checked = false;
          }
        }
        else if (typeof element.type !== 'undefined' && element.type == 'checkbox') {
          if (result.passhashng.cfg.indexOf(element.value) != -1) {
            element.checked = true;
          }
          else {
            element.checked = false;
          }
        }
      }
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("passhashng");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
elements = document.querySelectorAll("input");
for(var i = 0, element; element = elements[i]; i++) {
  element.addEventListener("click", saveOptions);
}
