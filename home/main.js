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

	initPage();
});
