var port;
var settings;
var storage = browser.storage.local;
port = browser.runtime.connect({name: 'passhash-popup'});

function saveSettings(name, data) {
  $('.loader').show().html('Saving...');
  $('form').hide();
  storage.set({[name]: data}).then(
    function(val) {
      port.postMessage({action: 'sethash', hash: $('#hash').val(), sitetag: $('#tag').val(), config: '16dpm'});
    }, 
    function(val) {
      alert('Error!');
      console.log(val);
    }
  );
}

function generateConfig(e) {
  var cfg = '';
  var elements = document.querySelectorAll("input");
  for(var i = 0, element; element = elements[i]; i++) {
    if(element.checked === true && element.id != 'unmask'){
      cfg += element.value;
    }
  }
  return cfg;
}

function loadSettings(name) {
  storage.get(name).then(
    function(val) {
      $('.loader').hide();
      $('form').show();
      setForm(val);
    },
    function(val) {
      alert('Error!');
      console.log(val);
    }
  );
}

function listener(m) {
  if(m.action == 'init') {
    settings = m.settings;
    //get domain
    settings.domain = PassHashCommon.getDomain(settings.domain);
    loadSettings(settings.domain);
  }
  else if(m.action == 'close') {
    window.close();
  }
}

port.onMessage.addListener(listener);

function setForm(data) {
  if(typeof data[settings.domain] !== 'undefined' && typeof data[settings.domain].tag !== 'undefined') {
    $('#tag').val(data[settings.domain].tag);
  }
  else {
    $('#tag').val(settings.domain.split('.')[0]);
  }
  //settingsform
  if(typeof data[settings.domain] !== 'undefined' && typeof data[settings.domain].cfg === 'undefined' ) {
    data[settings.domain].cfg = 'dpm16';
  }
  if(typeof data[settings.domain] !== 'undefined' && typeof data[settings.domain].cfg !== 'undefined') {
    num = data[settings.domain].cfg.replace( /^\D+/g, '');
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
      else if (typeof element.type !== 'undefined' && element.type == 'checkbox' && element.id != 'unmask') {
        if (data[settings.domain].cfg.indexOf(element.value) != -1) {
          element.checked = true;
        }
        else {
          element.checked = false;
        }
      }
    }
  }
}

$(function(){
  $('#cancel').on('click', function(e){
    window.close();
  });
  $('#bump').on('click', function(e){
    $('#tag').val(PassHashCommon.bumpSiteTag($('#tag').val())).trigger('change');
  });
  $('#unmask').on('click', function(e){
    if($(this).prop('checked')) {
      $('#key').attr('type', 'text');
      $('#hash').attr('type', 'text');
      $('.hint').hide();
    }
    else {
      $('#key').attr('type', 'password');
      $('#hash').attr('type', 'password');
      $('.hint').show();
    }
  });
  $('#options').on('click', function(e){
    if($('.settings').hasClass('hidden')){
      $('.settings').removeClass('hidden');
      browser.windows.getCurrent().then((currentWindow) => {
        var updateInfo = {
          height: 400
        };
        browser.windows.update(currentWindow.id, updateInfo);
        $('.settings').show();
        $('#options').val('Options <<');
      });
    }
    else {
      $('.settings').addClass('hidden');
      browser.windows.getCurrent().then((currentWindow) => {
        var updateInfo = {
          height: 200
        };
        browser.windows.update(currentWindow.id, updateInfo);
        $('.settings').hide();
        $('#options').val('Options >>');
      });

    }
  });
  $('input').on('input change', function(e) {
    var cfg = generateConfig();
    var hashWordSize = cfg.replace( /^\D+/g, '');
    var requireDigit = ( cfg.indexOf('d') ? true : false );
    var requirePunctuation = ( cfg.indexOf('p') != -1 ? true : false );
    var requireMixedCase = ( cfg.indexOf('m') != -1 ? true : false );
    var restrictSpecial = ( cfg.indexOf('r') != -1 ? true : false ); 
    var restrictDigits = ( cfg.indexOf('g') != -1 ? true : false );
    
    if($('#key').val() && $('#tag').val()) {
      $('#hash').val(PassHashCommon.generateHashWord($('#tag').val(), $('#key').val(), hashWordSize, requireDigit, requirePunctuation, requireMixedCase, restrictSpecial, restrictDigits));
      $('.hint').html(PassHashCommon.generateHashWord($('#key').val(), $('#key').val(), 2, true, false, true, false, false));
    }
  });
  $('#ok').on('click', function(e){
    saveSettings(settings.domain, {
      tag: $('#tag').val(),
      cfg: generateConfig() 
    });
  });
});

//hack: firefox is showing a blank screen onload of panel
browser.windows.getCurrent().then((currentWindow) => {
  var updateInfo = {
    height: 201 
  };
  browser.windows.update(currentWindow.id, updateInfo);
});



