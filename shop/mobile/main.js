/* main.js */

window.$ = window.jQuery = require('jquery');

window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

const common = require('../home/mod/common-lib.js')($);

const orderMng = require('./mod/order-mng-lib.js')($);

let pageHandle = undefined;
$( document ).ready(function() {
  const initPage = function() {
    let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
  	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
  	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
  	let jqueryNotifyUrl = '../lib/notify.min.js';

    let momentWithLocalesPlugin = "../lib/moment-with-locales.min.js";
    let ionCalendarPlugin = "../lib/ion.calendar.min.js";
    let ionCalendarCssUrl = "../stylesheets/ion.calendar.css";

    let utilityPlugin = "../lib/plugin/jquery-radutil-plugin.js";
    let html5QRCodeUrl = "../lib/html5-qrcode.min.js";

    $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  	//https://carlosbonetti.github.io/jquery-loading/
  	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  	//https://notifyjs.jpillora.com/
  	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

    $('head').append('<script src="' + momentWithLocalesPlugin + '"></script>');
    $('head').append('<script src="' + ionCalendarPlugin + '"></script>');

    $('head').append('<link rel="stylesheet" href="../stylesheets/style.css" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../lib/print/print.min.css" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="' + ionCalendarCssUrl + '" type="text/css" />');

    $('head').append('<script src="' + utilityPlugin + '"></script>');
    $('head').append('<script src="' + html5QRCodeUrl + '"></script>');

    $('body').append($('<div id="MainBox"></div>').css({'position': 'absolute', 'top': '0px', 'float': 'left', 'right': '0px', 'left': '0px'}));
    $('body').append($('<div id="MenuBox"></div>').css({'display': 'none', 'position': 'fixed', 'z-index': '42', 'left': '0px', 'top': '0px', 'width': '100%;', 'width': '100%', 'height': '100%', 'overflow': 'scroll', 'background-color': 'rgb(240, 240, 240)'}));
    $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

    $('body').loading({overlay: $("#overlay"), stoppable: true});

	};

  let userdata = JSON.parse(localStorage.getItem('userdata'));
  console.log(userdata);
  if ((!userdata) || (userdata == null)) {
    common.doUserLogout();
  }

	initPage();

  pageHandle = doCreatePageLayout();
  orderMng.setupPageHandle(pageHandle);


  orderMng.doShowOrderList(userdata.shopId, pageHandle.mainContent);
  $('body').loading('stop');
});

const doCreatePageLayout = function(){
  let toggleMenuCmd = $('<img id="ToggleMenuCmd" src="../../images/bill-icon.png"/>').css({'width': '40px', 'height': 'auto'});
  $(toggleMenuCmd).css({'position': 'fixed', 'top': '1px', 'left': '10px', 'z-index': '49', 'cursor': 'pointer'});
  let mainBox = $('#MainBox');
  $(mainBox).append($(toggleMenuCmd));
  let mainContent = $('<div id="MainContent"></div>').css({'position': 'relative', 'width': '100%'});
  $(mainBox).append($(mainContent));
  let userInfoBox = doCreateUserInfoBox();
  let menuContent = $('<div id="MenuContent"></div>').css({'position': 'relative', 'width': '100%'});
  let menuBox = $('#MenuBox');
  $(menuBox).append($(userInfoBox)).append($(menuContent));
  let timeAnimate = 550;

  $(toggleMenuCmd).on('click', (evt)=>{
    $(menuBox).animate({width: 'toggle'}, timeAnimate);
    if ($(toggleMenuCmd).css('left') == '10px') {
      $(toggleMenuCmd).animate({left: '90%'}, timeAnimate);
      $(toggleMenuCmd).attr('src', '../../images/cross-mark-icon.png');
    } else {
      $(toggleMenuCmd).animate({left: '10px'}, timeAnimate);
      $(toggleMenuCmd).attr('src', '../../images/bill-icon.png');
    }
  });
  let handle = {mainBox, menuBox, toggleMenuCmd, mainContent, menuContent};
  return handle;
}

const doCreateUserInfoBox = function(){
  let userdata = JSON.parse(localStorage.getItem('userdata'));
  let userInfoBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'text-align': 'center'});
  let userPictureBox = $('<img src="../../images/avatar-icon.png"/>').css({'position': 'relative', 'width': '50px', 'height': 'auto', 'cursor': 'pointer', 'margin-top': '-2px'});
  $(userPictureBox).on('click', (evt)=>{
    $(userInfo).toggle('slow', 'swing', ()=>{
      $(userLogoutCmd).toggle('fast', 'linear');
    });
  });
  let userInfo = $('<div></div>').text(userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH).css({'position': 'relative', 'margin-top': '-15px', 'padding': '2px', 'font-size': '14px'});
  let userLogoutCmd = $('<div>ออกจากระบบ</div>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'width': '50%', 'margin-top': '0px', 'padding': '2px', 'font-size': '14px', 'margin-left': '25%', 'border': '2px solid black'});
  $(userLogoutCmd).on('click', (evt)=>{
    common.doUserLogout();
  });
  return $(userInfoBox).append($(userPictureBox)).append($(userInfo)).append($(userLogoutCmd));
}
