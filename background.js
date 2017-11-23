var port_content;
var port_popup;
var popup_win;
var settings = {
  cfg: 'dpm16',
  hint: 1,
  domain: '',
  id: '',
  popup: 0,};
var storage = browser.storage.sync;
var popupsettings = {
  "type": "panel",
  "height": 200,
  "width": 450,
  "url": browser.extension.getURL("popup.html"),
  "allowScriptsToClose": true
}

function listener(p) {
  
  if(p.name == 'passhash-content') {
    port_content = p;
    storage.get('passhashng').then(
      function(data){
        if(typeof data['passhashng'] != 'undefined') {
          settings = data['passhashng'];
          settings.popup = 0;
        }
        if(port_content.sender != 'undefined' && port_content.sender.url != 'undefined') {
          settings.domain = parseurl(port_content.sender.url);
          settings.tag = settings.domain.split('.')[0];
        }
      }, 
      function(data) {
        console.log('Could not load extension settings from storage. Running with defaults.');
        console.log(data);
      }
    );
    port_content.onMessage.addListener(function(m, sender){
      if(m.action == 'openPopup') {
        settings.id = m.id;
        openPopup();
      }
      else if (m.action == 'setid') {
        settings.id = m.id;
      }
      else if (m.action == 'enablePageAction') {
        settings.id = m.id;
        browser.pageAction.show(sender.sender.tab.id);
      }
    });
    port_content.postMessage({action: 'init'});
  }
  else if(p.name == 'passhash-popup'){
    port_popup = p;
    port_popup.onMessage.addListener(function(m){
      if(m.action == 'sethash') {
        settings.cfg = m.cfg;
        settings.tag = m.tag;
        port_content.postMessage({action: 'sethash', hash: m.hash, id: settings.id });
        port_popup.postMessage({action: 'close'});
        storage.set({[settings.domain]: {
          tag: settings.tag,
          cfg: settings.cfg
        }});
      }
      else if (m.action == 'resetPopup') {
        settings.popup = 0;
      }
    });
    storage.get(settings.domain).then(
      function(data){
        if(typeof data[settings.domain] != 'undefined') {
          settings.cfg = data[settings.domain].cfg;
          settings.tag = data[settings.domain].tag;
        }
        port_popup.postMessage({action: 'init', 'settings': settings});
      }, 
      function(data) {
        console.log('Could not load site settings from storage. Running with defaults.');
        console.log(data);
        port_popup.postMessage({action: 'init', 'settings': settings});
      }
    );
  }
}

function openPopup() {
  settings.popup = 1;
  popup_win = browser.windows.create(popupsettings).then(popuphack);
}

//hack: the new firefox is showing a blank popup.
function popuphack(info) {
  browser.windows.update(info.id, {
    "width": 451
  });
}

function parseurl(url) {
  var h = url.split('/')[2].split('.');
  if (h.length <= 1)
    return null;
  // Handle domains like co.uk
  if (h.length > 2 && h[h.length-1].length == 2 && h[h.length-2] == "co") 
    return h[h.length-3] + '.' + h[h.length-2] + '.' + h[h.length-1];
  return h[h.length-2] + '.' + h[h.length-1];
}

browser.contextMenus.create({
  id: "passhash-hasher",
  title: "Hash password",
  contexts: ["password"]
});


browser.runtime.onConnect.addListener(listener);

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "passhash-hasher":
      openPopup(); 
      break;
  }
});
