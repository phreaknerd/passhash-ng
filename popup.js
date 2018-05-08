var port;
var settings;
var tabId;
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
    settings = m.settings;
    tabId = m.tabId;
    port.postMessage({action: 'resetPopup'});
    $('#tag').val(settings.tag);
    setTimeout(function(){
      $('#key').focus();
    }, 500);  
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
    if(settings.hint == 1){
      $('#hint').removeClass('hidden');
    }
    if(settings.unmasker == 1){
      $('#unmask').removeClass('hidden');
      $('.unmasklabel').removeClass('hidden');
    }
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
            browser.windows.update(browser.windows.WINDOW_ID_CURRENT, { height: 450 });
          }
      }
      else {
        $('.settings').addClass('hidden');
        $('.settings').hide();
        $('#options').val('Options >>');
        if(settings.popup == 1) {
          browser.windows.update(browser.windows.WINDOW_ID_CURRENT, { height: 200 });
        }
      }
    });
    $('input').on('input change', function(e) {
      var cfg = generateConfig();
      var hashWordSize = cfg.replace( /^\D+/g, '');
      var requireDigit = ( cfg.indexOf('d') != -1 ? true : false );
      var requirePunctuation = ( cfg.indexOf('p') != -1 ? true : false );
      var requireMixedCase = ( cfg.indexOf('m') != -1 ? true : false );
      var restrictSpecial = ( cfg.indexOf('r') != -1 ? true : false ); 
      var restrictDigits = ( cfg.indexOf('g') != -1 ? true : false );
      if($('#key').val() && $('#tag').val()) {
        $('#hash').val(PassHashCommon.generateHashWord($('#tag').val(), $('#key').val(), hashWordSize, requireDigit, requirePunctuation, requireMixedCase, restrictSpecial, restrictDigits));
        $('#hint').html(PassHashCommon.generateHashWord($('#key').val(), $('#key').val(), 2, true, false, true, false, false));
      }
    });
		$(document).keydown(function(e) {
				if (e.keyCode == 27 && settings.popup == 1) {
          browser.windows.remove(browser.windows.WINDOW_ID_CURRENT);
        }
		});
    $('form').on('submit', function(e){
      e.preventDefault();
      port.postMessage({
        action: 'sethash', 
        hash: $('#hash').val(),
        tag: $('#tag').val(),
        cfg: generateConfig(),
        tabId: tabId
      });
    }); 
  }
  else if(m.action == 'close') {
    if(settings.popup == 1) {  
      browser.windows.remove(browser.windows.WINDOW_ID_CURRENT);
    }
    else {
      this.close();
    }
  }
}
port.onMessage.addListener(listener);
