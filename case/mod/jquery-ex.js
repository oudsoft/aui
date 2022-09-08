const $ = require('jquery');

$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

$.fn.center = function () {
  this.css("position","absolute");
  this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +  $(window).scrollLeft()) + "px");
  return this;
}

$.fn.postCORS = function(url, data, func) {
  if(func == undefined) func = function(){};
    return $.ajax({
      type: 'POST',
      url: url,
      data: data,
      dataType: 'json',
      contentType: 'application/x-www-form-urlencoded',
      xhrFields: { withCredentials: true },
      success: function(res) { func(res) },
      error: function(err) { func({err})
    }
  });
}

$.fn.cachedScript = function( url, options ) {
  // Allow user to set any option except for dataType, cache, and url
  options = $.extend( options || {}, {
    dataType: "script",
    cache: true,
    url: url
  });

  // Use $.ajax() since it is more flexible than $.getScript
  // Return the jqXHR object so we can chain callbacks
  return jQuery.ajax( options );
};

$.fn.doLoadServiceworker = function(noti) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      const MAXAGE = 10; // seconds until recheck
      const HASH = Math.floor(Date.now() / (MAXAGE * 1000)); // or a hash of lib.js
      const URL = `/sw.js?hash=${HASH}`;
      navigator.serviceWorker.register('sw.js?hash=' + HASH).then( async reg => {
        console.log(`Registration:`, reg);
        if (reg) {
          //noti = require('./mod/notimod.js')(reg);
          noti.triggerPush();
        }
      });
      navigator.serviceWorker.addEventListener('message', function(event) {
        console.log("Got reply from service worker: " + event.data);
      });
    });
  } else {
    console.error('Service workers are not supported in this browser');
  }
}

/*
  Service Worker on https <type of sign self> of localhost, it 'll ssl's error massage
  DOMException: Failed to register a ServiceWorker for scope ('https://192.168.1.108:8443/webapp/') with script ('https://192.168.1.108:8443/webapp/sw.js?hash=159800668'): An SSL certificate error occurred when fetching the script.
*/

$.fn.simplelog = function(dataPairObj){
  let logMessages = $('<div style="width: 100%;"></div>');
  let keyTags = Object.getOwnPropertyNames(dataPairObj);
  for (let i=0; i<keyTags.length; i++) {
    let logItem = $('<div style="width: 100%; border: 1px solid grey;"></div>');
    let key = keyTags[i];
    let value = dataPairObj[key]
    let logKey = $('<span>' + key + '</span>');
    $(logKey).css({'color': 'black'});
    let logValue = $('<span>' + value + '</span>');
    $(logValue).css({'color': 'blue'});
    $(logItem).append($(logKey));
    $(logItem).append($('<span> => </span>'));
    $(logItem).append($(logValue));
    $(logMessages).append($(logItem));
  }
  this.append($(logMessages));
}
