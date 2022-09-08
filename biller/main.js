/* main.js */

window.$ = window.jQuery = require('jquery');
/*****************************/
window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});
/*****************************/

const apiconnector = require('../case/mod/apiconnect.js')($);
const util = require('../case/mod/utilmod.js')($);
const common = require('../case/mod/commonlib.js')($);
const userinfo = require('../case/mod/userinfolib.js')($);
const billreport = require('../case/mod/billreport.js')($);

let wsm = undefined;

$( document ).ready(function() {
  const initPage = function() {
    if (sessionStorage.getItem('logged')) {
      var token = localStorage.getItem('token');
  		if (token !== 'undefined') {
        let userdata = localStorage.getItem('userdata');
        if (userdata !== 'undefined') {
          userdata = JSON.parse(userdata);
          console.log(userdata);
  			  doLoadMainPage();
          wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
        } else {
          doLoadLogin();
        }
  		} else {
  			doLoadLogin()
  		}
    } else {
      doLoadLogin()
    }
	};
  const doLoadLogin = function(){
    common.doUserLogout(wsm);
  }

	initPage();

});

function doLoadMainPage(){
  let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
	let jqueryNotifyUrl = '../lib/notify.min.js';
  let jquerykeyframeUrl = '../lib/jquery.keyframes.js';
  let chatBoxPlugin = "../setting/plugin/jquery-chatbox-plugin.js";
  let printjs = '../lib/print/print.min.js';
  let excelexportjs = '../lib/excel/excelexportjs.js';
  let jquerySimpleUploadUrl = '../lib/simpleUpload.min.js';
  let utilityPlugin = "../setting/plugin/jquery-radutil-plugin.js";

	$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
	//https://carlosbonetti.github.io/jquery-loading/
	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
	//https://notifyjs.jpillora.com/
	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

  //https://github.com/Keyframes/jQuery.Keyframes
  $('head').append('<script src="' + jquerykeyframeUrl + '"></script>');

  $('head').append('<script src="' + chatBoxPlugin + '"></script>');
  $('head').append('<script src="' + printjs + '"></script>');
  $('head').append('<script src="' + excelexportjs + '"></script>');
  $('head').append('<script src="' + jquerySimpleUploadUrl + '"></script>');
  $('head').append('<script src="' + utilityPlugin + '"></script>');

  $('head').append('<link rel="stylesheet" href="../lib/print/print.min.css" type="text/css" />');

  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});

	$('body').on('loading.start', function(event, loadingObj) {
	  //console.log('=== loading show ===');
	});

	$('body').on('loading.stop', function(event, loadingObj) {
	  //console.log('=== loading hide ===');
	});

  let userdata = JSON.parse(localStorage.getItem('userdata'));

  let mainFile= 'form/main.html';
  let mainStyle= 'css/main.css';
  let menuFile = 'form/menu.html';
  let menuStyle = 'css/menu.css';
  let commonStyle = '../stylesheets/style.css';
  //let caseStyle = 'css/style.css';

  $('head').append('<link rel="stylesheet" href="' + commonStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + mainStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + menuStyle + '" type="text/css" />');
  //$('head').append('<link rel="stylesheet" href="' + caseStyle + '" type="text/css" />');

	$('#app').load(mainFile, function(){
		$('#Menu').load(menuFile, function(){

			$(document).on('openedituserinfo', (evt, data)=>{
				userinfo.doShowUserProfile();
			});
			$(document).on('userlogout', (evt, data)=>{
				common.doUserLogout(wsm);
			});
			$(document).on('openhome', (evt, data)=>{

			});

      $(document).on('openbilling', (evt, data)=>{
        billreport.doOpenCreateBillForm();
			});

      doUseFullPage();

			$('body').loading('stop');
		});
	});
}

function doUseFullPage() {
	$(".row").show();
	$(".mainfull").show();
	$(".mainfull").empty();
}
