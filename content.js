var port = browser.runtime.connect(
  { name: 'passhash-content'}
);

port.onMessage.addListener(function(m){
  if(m.action == 'sethash') {
    $('#' + m.id).val(m.hash);
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
      'font-size': $(this).css('font-size'),
      'font-weight': 'bold',
      'padding-top': $(this).css('padding-top'),
      'margin-left': $(this).width(),
      'height': $(this).height(),
      'color': $(this).css('color'),
      'cursor': 'pointer'
    });
    $pwdbtn.on('click', function(e) {
      port.postMessage({action: 'openpopup', id: input_id, domain: window.location.hostname});
    }); 
    $(this).before($pwdbtn);
    i++;
  })
});
