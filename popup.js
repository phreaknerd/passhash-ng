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
      $('.hint').hide();
    }
    else {
      $('#key').attr('type', 'password');
      $('.hint').show();
    }
  });
  $('#options').on('click', function(e){
    if($('.settings').hasClass('hidden')){
      $('.settings').removeClass('hidden');
      browser.windows.getCurrent().then((currentWindow) => {
        var updateInfo = {
          height: 600
        };
        browser.windows.update(currentWindow.id, updateInfo);
        $('.settings').show();
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
      });

    }
  });
  $('#tag, #key').on('input change', function(e) {
    $('#hash').val(PassHashCommon.generateHashWord($('#tag').val(), $('#key').val(), 16, true, true, true, false, false));
    $('.hint').html(PassHashCommon.generateHashWord($('#key').val(), $('#key').val(), 2, true, false, true, false, false));
  });
  $('#ok').on('click', function(e){
    saveSettings(settings.domain, {
      tag: $('#tag').val(),
      cfg: 'default'
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



