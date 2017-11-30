var port = browser.runtime.connect(
  { name: 'passhash-content' }
);
var fieldmarker = 1;
var fieldmarkerhighlight = 1;

port.onMessage.addListener(function(m){
  if(m.action == 'sethash') {
    $('#' + m.id).val(m.hash);
    $('#' + m.id).trigger('change');
  }
  else if(m.action == 'init') {
    fieldmarker = m.fieldmarker;
    fieldmarkerhighlight = m.fieldmarkerhighlight;
    if($('input[type=password]').length) {
      port.postMessage({action: 'enablePageAction', id: $('input[type=password]')[0].id});
    }
    $('input[type=password]').each(function(i){
      if(fieldmarker == 1 && $(this).is(':visible')) {
        var input_id = $(this)[0].id;
        var $pwdbtn = $('<div></div>', {'id': 'pwdbtn-' + i, 'class': 'pwdbtn'});
        $pwdbtn.html(' # ');
        $pwdbtn.css({
          'position': 'absolute',
          'width': '20px',
          'font-size': $(this).css('font-size'),
          'font-weight': 'bold',
          'padding': '5px',
          'margin-left': $(this).width()-5 + 'px',
          'text-align': 'center',
          'color': $(this).css('color'),
          'cursor': 'pointer',
          'z-index': 1000
        });
        if(fieldmarkerhighlight == 1) {
          $pwdbtn.css({
            'border': 'thin solid #80c080',
            'background-color': '#eeffee',
            'margin-left': $(this).width()+30 + 'px',
            'color': '#609060'
          });
        }
        $pwdbtn.on('click', function(e) {
          port.postMessage({action: 'openPopup', id: input_id, domain: document.location.hostname});
        }); 
        $(this).before($pwdbtn);
      }
      $(this).on('contextmenu', function(e){
        port.postMessage({action: 'setid', id: $(this)[0].id, domain: document.location.hostname});
      });
    })
  }
});
