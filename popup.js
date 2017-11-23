var port;
var settings;
port = browser.runtime.connect({name: 'passhash-popup'});

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

function listener(m) {
  if(m.action == 'init') {
    port.postMessage({action: 'resetPopup'});
    settings = m.settings;
    $('#tag').val(settings.tag);
    var num = settings.cfg.replace( /^\D+/g, '');
    var elements = document.querySelectorAll("input");
    for(var i = 0, element; element = elements[i]; i++) { 
      if(typeof element.type !== 'undefined' && element.type == 'radio') {
        element.checked = element.value == num ? true : false;
      }
      else if (typeof element.type !== 'undefined' && element.type == 'checkbox' && element.id != 'unmask') {
        element.checked =settings.cfg.indexOf(element.value) != -1 ? true : false;
      }
    }
    if(settings.hint == 0){
      $('#hint').hide();
    }
    $('#key').focus();
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
          $('.settings').show();
          $('#options').val('Options <<');
          if(settings.popup == 1) {
            browser.windows.getCurrent().then((currentWindow) => {
              browser.windows.update(currentWindow.id, { height: 400 });
            });
          }
      }
      else {
        $('.settings').addClass('hidden');
        $('.settings').hide();
        $('#options').val('Options >>');
        if(settings.popup == 1) {
          browser.windows.getCurrent().then((currentWindow) => {
            browser.windows.update(currentWindow.id, { height: 200 });
          });
        }
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
        $('#hint').html(PassHashCommon.generateHashWord($('#key').val(), $('#key').val(), 2, true, false, true, false, false));
      }
    });
    $('form').on('submit', function(e){
      e.preventDefault();
      port.postMessage({
        action: 'sethash', 
        hash: $('#hash').val(),
        tag: $('#tag').val(),
        cfg: generateConfig() 
      });
    }); 
  }
  else if(m.action == 'close') {
    window.close();
  }
}

port.onMessage.addListener(listener);
