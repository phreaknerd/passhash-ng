var port = browser.runtime.connect(
  { name: 'passhash-content' }
);

port.onMessage.addListener(function(m){
  if(m.action == 'sethash') {
    $('#' + m.id).val(m.hash);
    $('#' + m.id).trigger('change');
  }
  else if(m.action == 'init') {
    var i = 0;
    if($('input[type=password]').length) {
      port.postMessage({action: 'enablePageAction', id: $('input[type=password]')[0].id});
    }
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
        port.postMessage({action: 'openPopup', id: input_id});
      }); 
      $(this).before($pwdbtn);
      $(this).on('contextmenu', function(e){
        port.postMessage({action: 'setid', id: $(this)[0].id});
      });
      i++;
    })
  }
});
