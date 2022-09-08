/* main.js */

window.$ = window.jQuery = require('jquery');
/*****************************/
require('../case/mod/jquery-ex.js');
/*
window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});
*/
/*****************************/

//require('../case/mod/jquery-ex.js');
const apiconnector = require('../case/mod/apiconnect.js')($);
const util = require('../case/mod/utilmod.js')($);
const common = require('../case/mod/commonlib.js')($);
const userinfo = require('../case/mod/userinfolib.js')($);
const orthanc = require('./mod/orthanc.js')($);
const softphone = require('../case/mod/softphonelib.js')($);

var noti, wsm, wsl, sipUA;

$( document ).ready(function() {
  const initPage = function() {
    let logged = sessionStorage.getItem('logged');
    if (logged) {
  		var token = doGetToken();
  		if (token !== 'undefined') {
        let userdata = doGetUserData();
        if (userdata !== 'undefined') {
          userdata = JSON.parse(userdata);
          console.log(userdata);
          if (userdata.usertypeId == 5){
			       doLoadMainPage();
             wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
             if (userdata.userinfo.User_SipPhone){
                let sipPhoneNumber = userdata.userinfo.User_SipPhone;
                let sipPhoneSecret = userdata.userinfo.User_SipSecret;
                sipUA = softphone.doRegisterSoftphone(sipPhoneNumber, sipPhoneSecret);
                sipUA.start();
                let sipPhoneOptions = {onRejectCallCallback: softphone.doRejectCall, onAcceptCallCallback: softphone.doAcceptCall, onEndCallCallback: softphone.doEndCall};
                let mySipPhoneIncomeBox = $('<div id="SipPhoneIncomeBox" tabindex="1"></div>');
                $(mySipPhoneIncomeBox).css({'position': 'absolute', 'width': '98%', 'min-height': '50px;', 'max-height': '50px', 'background-color': '#fefefe', 'padding': '5px', 'border': '1px solid #888',  'z-index': '192', 'top': '-65px'});
                let mySipPhone = $(mySipPhoneIncomeBox).sipphoneincome(sipPhoneOptions);
                $('body').append($(mySipPhoneIncomeBox));
             }
           } else {
             alert('บัญชีใช้งานของคุณไม่สามารถเข้าใช้งานหน้านี้ได้ โปรด Login ใหม่เพื่อเปลี่ยนบัญชีใช้งาน');
             doLoadLogin();
           }
        } else {
          doLoadLogin();
        }
  		} else {
  			doLoadLogin()
  		}
    } else {
      doLoadLogin();
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
  let jssip = "../lib/jssip-3.9.0.min.js";
	let controlPagePlugin = "../setting/plugin/jquery-controlpage-plugin.js"
  let patientHistoryPluginUrl = "../setting/plugin/jquery-patient-history-image-plugin.js";
	let scanpartPluginUrl = "../setting/plugin/jquery-scanpart-plugin.js";
	let customUrgentPlugin = "../setting/plugin/jquery-custom-urgent-plugin.js";
  let customSelectPlugin = "../setting/plugin/jquery-custom-select-plugin.js";
  let chatBoxPlugin = "../setting/plugin/jquery-chatbox-plugin.js";
  let utilityPlugin = "../setting/plugin/jquery-radutil-plugin.js";
  let sipPhonePlugin = "../setting/plugin/jquery-sipphone-income-plugin.js";

	$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
	//https://carlosbonetti.github.io/jquery-loading/
	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
	//https://notifyjs.jpillora.com/
	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');
  $('head').append('<script src="' + jssip + '"></script>');

	$('head').append('<script src="' + controlPagePlugin + '"></script>');
  $('head').append('<script src="' + patientHistoryPluginUrl + '"></script>');
	$('head').append('<script src="' + scanpartPluginUrl + '"></script>');
	$('head').append('<script src="' + customUrgentPlugin + '"></script>');
  $('head').append('<script src="' + customSelectPlugin + '"></script>');
  $('head').append('<script src="' + chatBoxPlugin + '"></script>');
  $('head').append('<script src="' + utilityPlugin + '"></script>');
  $('head').append('<script src="' + sipPhonePlugin + '"></script>');

  $('head').append('<link rel="stylesheet" href="../lib/tui-image-editor.min.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="../lib/tui-color-picker.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="../lib/print/print.min.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="../case/css/custom-select.css" type="text/css" />');

  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});
  /*
	$('body').on('loading.start', function(event, loadingObj) {
	  //console.log('=== loading show ===');
	});

	$('body').on('loading.stop', function(event, loadingObj) {
	  //console.log('=== loading hide ===');
	});

  document.addEventListener("triggernewdicom", onNewDicomTransferTrigger);
  */

  let userdata = JSON.parse(doGetUserData());

  let mainFile= '../case/form/main-fix.html';
  let mainStyle= '../case/css/main-fix.css';
  let menuFile = '../case/form/menu-fix.html';
  let menuStyle = '../case/css/menu-fix.css';
  let commonStyle = '../stylesheets/style.css';
  let caseStyle = '../case/css/style.css';

  $('head').append('<link rel="stylesheet" href="' + commonStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + caseStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + mainStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + menuStyle + '" type="text/css" />');

	$('#app').load(mainFile, function(){
		$('#Menu').load(menuFile, function(){
      $('#CaseMainCmd').hide();
      $('#ConsultMainCmd').hide();
      $('#ReportPetternSubCmd').hide();
      $('#ScanpartAuxConfigSubCmd').hide();
      $('#StdUrgentConfigSubCmd').hide();
      $('#GoToPortalSubCmd').hide();

			$(document).on('openedituserinfo', (evt, data)=>{
				userinfo.doShowUserProfile();
			});
			$(document).on('userlogout', (evt, data)=>{
				common.doUserLogout(wsm);
			});
			$(document).on('openhome', (evt, data)=>{
        common.doSaveQueryDicom(data);
				orthanc.doLoadDicomFromOrthanc();
			});

      $(document).on('opendicomfilter', (evt, data)=>{
        $(".mainfull").find('#DicomFilterForm').show();
      });

			$(document).on('defualsettingschange', (evt, data)=>{
				doUpdateDefualSeeting(data.key, data.value)
			});

      doInitDefualPage();

			$('body').loading('stop');
		});
	});
}

const doInitDefualPage = function(){
  $('#HomeMainCmd').click();
}

const doUpdateDefualSeeting = function (key, value){
	let lastDefualt = JSON.parse(localStorage.getItem('defualsettings'));
	if (lastDefualt.hasOwnProperty(key)) {
		lastDefualt[key] = value;
		localStorage.setItem('defualsettings', JSON.stringify(lastDefualt));
	}
}

function doSaveQueryOrthanc(filterData) {
	let queryStr = undefined;
  if (filterData.dd === '**') {
    queryStr = '{"Level": "Study", "Expand": true, "Query": {"Modality": "' + filterData.dm;
    dDate = '-' + util.getToday();
    queryStr += '", "StudyDate": "' + dDate + '"}, "Limit": 20}';
	} else if (filterData.dd === '*') {
    queryStr = '{"Level": "Study", "Expand": true, "Query": {"Modality": "' + filterData.dm;
		queryStr += '"}}';
	} else {
    queryStr = '{"Level": "Study", "Expand": true, "Query": {"Modality": "' + filterData.dm;
		let dDate;
		if (filterData.dd == 1) {
			dDate = util.getToday() + '-';
		} else if (filterData.dd == 3) {
			dDate = util.getDateLastThreeDay() + '-';
    }
		queryStr += '", "StudyDate": "' + dDate + '"}}';
	}
	let newDicomFilter = JSON.parse(queryStr);
	localStorage.setItem('dicomfilter', JSON.stringify(newDicomFilter));
}

function doGetToken(){
	return localStorage.getItem('token');
}

function doGetUserData(){
  return localStorage.getItem('userdata');
}

function doGetUserItemPerPage(){
	let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
  return userDefualtSetting.itemperpage;
}

function doGetWsm(){
	return wsm;
}

function doGetSipUA(){
  return sipUA;
}

module.exports = {
  doGetToken,
  doGetUserData,
	doGetUserItemPerPage,
	doGetWsm,
  softphone,
  doGetSipUA
}
