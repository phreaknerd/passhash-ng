var port_content;
var port_popup;
var popup_win;
var settings = {};
var storage = browser.storage.local;

function listener(p) {
  if(p.name == 'passhash-content') {
    port_content = p;
    port_content.onMessage.addListener(function(m){
      if(m.action == 'openpopup') {
        settings.id = m.id;
        settings.domain = m.domain;
        popup_win = browser.windows.create({
          "type": "panel",
          "height": 200,
          "width": 450,
          "url": browser.extension.getURL("popup.html"),
          "allowScriptsToClose": true
        });
      }
    });
  }
  else if(p.name == 'passhash-popup'){
    port_popup = p;
    port_popup.onMessage.addListener(function(m){
      if(m.action == 'sethash') {
        port_popup.postMessage({action: 'close'});
        port_content.postMessage({action: 'sethash', hash: m.hash, id: settings.id });
      }
    });
    //popup is there initialize 
    port_popup.postMessage({action: 'init', 'settings': settings});
  }
}

browser.runtime.onConnect.addListener(listener);


browser.contextMenus.create({
  id: "passhash-hasher",
  title: "Password Hasher NG",
  contexts: ["password"]
});


browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "passhash-hasher":
      port_content.postMessage({action: 'getconfig'}); 
      break;
  }
});
