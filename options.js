var all_elements;
var hasher_elements;
var storage = browser.storage.sync;

function saveOptions(e) {
  var cfg = '';
  for(var i = 0, element; element = hasher_elements[i]; i++) {
    if(element.checked === true){
      cfg += element.value;
    }
  }
  storage.set({
    passhashng: { 
      cfg: cfg,
      hint: document.querySelector("#hint").checked == true ? 1 : 0,
      fulldomain: document.querySelector("#fulldomain").checked == true ? 1 : 0,
      unmasker: document.querySelector("#unmasker").checked == true ? 1 : 0,
      fieldmarker: document.querySelector("#fieldmarker").checked == true ? 1 : 0,
      fieldmarkerhighlight: document.querySelector("#fieldmarker-highlight").checked == true ? 1 : 0
    }
  }).then(function(){}, onError);

  function onError(error) {
    console.log(`Error: ${error}`);
  }

}

function restoreOptions() {

  function setCurrentChoice(result) {
    var num = 16;
    if(typeof result.passhashng !== 'undefined') {
      if(typeof result.passhashng.cfg !== 'undefined' ) {
        num = result.passhashng.cfg.replace( /^\D+/g, '');
        var elements = document.querySelectorAll("input.hashersetting");
        for(var i = 0, element; element = elements[i]; i++) { 
          if(typeof element.type !== 'undefined' && element.type == 'radio') {
            element.checked = element.value == num ? true : false;
          }
          else if (typeof element.type !== 'undefined' && element.type == 'checkbox') {
            element.checked = result.passhashng.cfg.indexOf(element.value) != -1 ? true: false;
          }
        }
      }
      if(typeof result.passhashng.hint !== 'undefined' ) {
        document.querySelector("#hint").checked = result.passhashng.hint == 1 ? true : false;
      }
      if(typeof result.passhashng.fulldomain !== 'undefined' ) {
        document.querySelector("#fulldomain").checked = result.passhashng.fulldomain == 1 ? true : false;
      }
      if(typeof result.passhashng.fieldmarker !== 'undefined' ) {
        document.querySelector("#fieldmarker").checked = result.passhashng.fieldmarker == 1 ? true : false;
      }
      if(typeof result.passhashng.fieldmarkerhighlight !== 'undefined' ) {
        document.querySelector("#fieldmarker-highlight").checked = result.passhashng.fieldmarkerhighlight == 1 ? true : false;
      } 
      if(typeof result.passhashng.unmasker !== 'undefined' ) {
        document.querySelector("#unmasker").checked = result.passhashng.unmasker == 1 ? true : false;
      }
    }
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = storage.get("passhashng");
  getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
all_elements = document.querySelectorAll("input");
hasher_elements = document.querySelectorAll("input.hashersetting");
for(var i = 0, element; element = all_elements[i]; i++) {
  element.addEventListener("click", saveOptions);
}
