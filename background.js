var port_content;
var port_popup;
var ports = {};
var popup_win;
var lastdomain;
var settings = {
  cfg: 'dpm16',
  hint: 1,
  domain: '',
  id: '',
  popup: 0,
  fieldmarker: 1,
  fieldmarkerhighlight: 1,
  unmasker: 1,
  fulldomain: 0,
  loaded: 0
};
var localsettings = {};
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
    ports[p.sender.tab.id] = p;
    var url = parseurl(p.sender.tab.url);
    //load defaults 
    storage.get('passhashng').then(
      function(data){
        if(typeof data['passhashng'] != 'undefined') {
          settings = data['passhashng'];
          settings.popup = 0;
        }
        if(p.sender != 'undefined' && p.sender.url != 'undefined') {
          localsettings[p.sender.tab.id] = settings;
          localsettings[p.sender.tab.id].domain = url;
          localsettings[p.sender.tab.id].tag = localsettings[p.sender.tab.id].domain.split('.')[0];
          if(typeof settings.fulldomain != 'undefined' && settings.fulldomain == 1) {
            localsettings[p.sender.tab.id].tag = localsettings[p.sender.tab.id].domain;
          }
        }
        ports[p.sender.tab.id].postMessage({action: 'init', fieldmarker: settings.fieldmarker, fieldmarkerhighlight: settings.fieldmarkerhighlight});
      }, 
      function(data) {
        console.log('Could not load extension settings from storage. Running with defaults.');
        console.log(data);
        ports[p.sender.tab.id].postMessage({action: 'init', fieldmarker: settings.fieldmarker, fieldmarkerhighlight: settings.fieldmarkerhighlight});
      }
    );


    ports[p.sender.tab.id].onMessage.addListener(function(m, sender){
      var tabId = sender.sender.tab.id;
      localsettings[tabId].id = m.id;
      if(m.action == 'openPopup') {
        openPopup();
      }
      else if (m.action == 'setid') {
        //done 
      }
      else if (m.action == 'enablePageAction') {
        browser.pageAction.show(sender.sender.tab.id);
      }
    });
  }
  else if(p.name == 'passhash-popup'){
    var tabs = browser.tabs.query({});
    ports[p.sender.contextId] = p;
    tabs.then(function(tabInfo){
      var tabId;
      var time = 0;
      var taburl;
      for (var j = 0; j < tabInfo.length; j++){
        if(tabInfo[j].url.indexOf('http') == 0 && tabInfo[j].lastAccessed > time){
          time = tabInfo[j].lastAccessed;
          tabId = tabInfo[j].id;
          taburl = tabInfo[j].url;
        }
      }
      taburl = parseurl(taburl);
      storage.get(taburl).then(
        function(data){
          if(typeof data[taburl] != 'undefined') {
            localsettings[tabId].cfg = data[taburl].cfg;
            localsettings[tabId].tag = data[taburl].tag;
          }
          ports[p.sender.contextId].postMessage({action: 'init', settings: localsettings[tabId], tabId: tabId});
          ports[p.sender.contextId].onMessage.addListener(function(m, sender){
            if(m.action == 'sethash') {
              ports[m.tabId].postMessage({action: 'sethash', hash: m.hash, id: settings.id });
              ports[sender.sender.contextId].postMessage({action: 'close'});

              var obj = {};
              obj[localsettings[m.tabId].domain] = {
                tag: m.tag,
                cfg: m.cfg
              };
              storage.set(obj);
            }
            else if (m.action == 'resetPopup') {
              settings.popup = 0;
            }
          });
        }, 
        function(data) {
          console.log('Could not load site settings from storage. Running with defaults.');
          console.log(data);
        }
      );
    });
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


browser.runtime.onConnect.addListener(function(port) {
  listener(port);
});

browser.contextMenus.onClicked.addListener(function(info, tab) {
  switch (info.menuItemId) {
    case "passhash-hasher":
      openPopup(); 
      break;
  }
});
