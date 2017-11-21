var port = browser.runtime.connect(
  { name: 'passhash-content'}
);

port.onMessage.addListener(function(m){
  if(m.action == 'sethash') {
    $('#' + m.id).val(m.hash);
    $('#' + m.id).trigger('change');
  }
  else if(m.action == 'getconfig') {
    port.postMessage({action: 'openpopup', id: pwditem.id, domain: window.location.hostname});
  }
});

$(function(){
  var i = 0;
  $('input[type=password]').each(function(i){
    var input_id = $(this)[0].id;
    var $pwdbtn = $('<div></div>', {'id': 'pwdbtn-' + i, 'class': 'pwdbtn'});

    $pwdbtn.html(' # ');
    $pwdbtn.css({
      'position': 'absolute',
      'width': '20px',
      'font-size': $(this).css('font-size'),
      'font-weight': 'bold',
      'padding-top': $(this).css('padding-top'),
      'margin-left': $(this).width()-5 + 'px',
      'text-align': 'center',
      'height': $(this).height(),
      'color': $(this).css('color'),
      'cursor': 'pointer',
      'z-index': 1000
    });
    $pwdbtn.on('click', function(e) {
      port.postMessage({action: 'openpopup', id: input_id, domain: window.location.hostname});
    }); 
    $(this).before($pwdbtn);
    $(this).on('contextmenu', function(e){
      port.postMessage({action: 'setid', id: $(this)[0].id, domain: window.location.hostname});
    });
    i++;
  })
});
