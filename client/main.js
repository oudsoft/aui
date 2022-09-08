window.$ = window.jQuery = require('jquery');

window.$.ajaxSetup({
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
  return this;
}

/*****************************/

const client = require('./mod/client.js')($);

$( document ).ready(function() {
  const initPage = function() {
    let jqueryUiCssUrl = "../../lib/jquery-ui.min.css";
  	let jqueryUiJsUrl = "../../lib/jquery-ui.min.js";
  	let jqueryLoadingUrl = '../../lib/jquery.loading.min.js';
  	let jqueryNotifyUrl = '../../lib/notify.min.js';
    let html2textlib = '../../lib/to-asciidoc.js';
    let detectelemresizelib = '../../lib/jquery.resize.js';

    $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  	//https://carlosbonetti.github.io/jquery-loading/
  	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  	//https://notifyjs.jpillora.com/
  	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

    $('head').append('<script src="' + html2textlib + '"></script>');

    $('head').append('<script src="' + detectelemresizelib + '"></script>');

    document.addEventListener("clientresult", client.onClientResult);
    document.addEventListener("logreturn", client.onClientLogReturn);
    document.addEventListener("echoreturn", client.onClientEchoReturn);

    let remoteBox = undefined;
    let urlQuery = urlQueryToObject(window.location.href);
    console.log(urlQuery);
    if ((urlQuery) && (urlQuery.hospitalId)){
      remoteBox = client.doOpenRemoteRun(urlQuery.hospitalId);
    } else {
      remoteBox = client.doOpenRemoteRun();
    }
    $('#app').append($(remoteBox));
	};

	initPage();
});

const urlQueryToObject = function(url) {
  let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
        return paramPair.split(/=(.+)?/).slice(0, 2);
    }).reduce(function (obj, pairArray) {
        obj[pairArray[0]] = pairArray[1];
        return obj;
    }, {});
  return result;
}

module.exports = {

}
