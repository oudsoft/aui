  /*
    browserify to /public/bundlebk.js
  */

/* main.js */

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

const home = require('./mod/home.js')($);

$( document ).ready(function() {
  const initPage = function() {
    home.doShowHome();
	};

	initPage();
});


function doGetToken(){
	return localStorage.getItem('token');
}

function doGetUserData(){
  return localStorage.getItem('userdata');
}

module.exports = {
	doGetToken,
  doGetUserData
}
