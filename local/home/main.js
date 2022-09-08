/* main.js */

window.$ = window.jQuery = require('jquery');

window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

const home = require('./mod/home.js')($);

$( document ).ready(function() {
  const initPage = function() {
    home.doLoadHome();
	};

  let jqueryUiCssUrl = "https://radconnext.info/lib/jquery-ui.min.css";
  let jqueryUiJsUrl = "https://radconnext.info/lib/jquery-ui.min.js";
  let jqueryLoadingUrl = 'https://radconnext.info/lib/jquery.loading.min.js';
  let jqueryNotifyUrl = 'https://radconnext.info/lib/notify.min.js';

  $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  $('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  //https://carlosbonetti.github.io/jquery-loading/
  $('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  //https://notifyjs.jpillora.com/
  $('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

  setTimeout(()=>{
	   initPage();
  }, 800);
});
