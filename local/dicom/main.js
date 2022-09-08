/* main.js */

window.$ = window.jQuery = require('jquery');
//require('../../case/mod/jquery-ex.js');
window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

const submain = require('./mod/submainlib.js')($);
const dicom = require('./mod/dicom.js')($);

const util = require('../../case/mod/utilmod.js')($);
const common = require('../../case/mod/commonlib.js')($);

const userinfo = require('../../case/mod/userinfolib.js')($);
const casecounter = require('../../case/mod/casecounter.js')($);
const urgentstd = require('../../case/mod/urgentstd.js')($);
const consult = require('../../case/mod/consult.js')($);
const portal = require('../../case/mod/portal-lib.js')($);
const cases = require('../../case/mod/case.js')($);

var wsm, wsl, sipUA;

$( document ).ready(function() {
  const initPage = function() {
    let logged = sessionStorage.getItem('logged');
    if (logged) {
  		var token = localStorage.getItem('token');
  		if (token !== 'undefined') {
        let userdata = localStorage.getItem('userdata');
        if (userdata !== 'undefined') {
          userdata = JSON.parse(userdata);
          console.log(userdata);
          if (userdata.usertypeId == 2) {
			       doLoadMainPage();
             wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
             wsl = util.doConnectWebsocketLocal(userdata.username);
             //submain.doCreateRegisterVoIP(userdata);
           } else {
             submain.doNotAllowAccessPage();
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

  let jqueryUiCssUrl = "https://radconnext.info/lib/jquery-ui.min.css";
  let jqueryUiJsUrl = "https://radconnext.info/lib/jquery-ui.min.js";
  let jqueryLoadingUrl = 'https://radconnext.info/lib/jquery.loading.min.js';
  let jqueryNotifyUrl = 'https://radconnext.info/lib/notify.min.js';
  let jssipUrl = "https://radconnext.info/lib/jssip-3.9.0.min.js";
  let sipPhonePlugin = "https://radconnext.info/setting/plugin/jquery-sipphone-income-plugin.js";
  let radUtilityPlugin = "https://radconnext.info/setting/plugin/jquery-radutil-plugin.js";

  $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  $('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  //https://carlosbonetti.github.io/jquery-loading/
  $('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  //https://notifyjs.jpillora.com/
  $('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

  $('head').append('<script src="' + jssipUrl + '"></script>');

  $('head').append('<script src="' + sipPhonePlugin + '"></script>');

  $('head').append('<script src="' + radUtilityPlugin + '"></script>');
  setTimeout(()=>{
	   initPage();
  }, 1200);
});

const doLoadLogin = function(){
  common.doUserLogout(wsm);
}

const doLoadMainPage = function(){
  let printjs = 'https://radconnext.info/lib/print/print.min.js';
  let excelexportjs = 'https://radconnext.info/lib/excel/excelexportjs.js';
  let jquerySimpleUploadUrl = 'https://radconnext.info/lib/simpleUpload.min.js';
  let patientHistoryPluginUrl = "https://radconnext.info/setting/plugin/jquery-patient-history-image-plugin.js?r=410ihj";
	let countdownclockPluginUrl = "https://radconnext.info/setting/plugin/jquery-countdown-clock-plugin.js";
	let scanpartPluginUrl = "https://radconnext.info/setting/plugin/jquery-scanpart-plugin.js";
	let customUrgentPlugin = "https://radconnext.info/setting/plugin/jquery-custom-urgent-plugin.js";
	let controlPagePlugin = "https://radconnext.info/setting/plugin/jquery-controlpage-plugin.js"
  let customSelectPlugin = "https://radconnext.info/setting/plugin/jquery-custom-select-plugin.js";
  let chatBoxPlugin = "https://radconnext.info/setting/plugin/jquery-chatbox-plugin.js";
  let readystatePlugin = "https://radconnext.info/setting/plugin/jqury-readystate-plugin.js";

  $('head').append('<script src="' + printjs + '"></script>');
  $('head').append('<script src="' + excelexportjs + '"></script>');
  $('head').append('<script src="' + jquerySimpleUploadUrl + '"></script>');

  $('head').append('<script src="' + patientHistoryPluginUrl + '"></script>');
  $('head').append('<script src="' + countdownclockPluginUrl + '"></script>');
  $('head').append('<script src="' + scanpartPluginUrl + '"></script>');
  $('head').append('<script src="' + customUrgentPlugin + '"></script>');
  $('head').append('<script src="' + controlPagePlugin + '"></script>');
  $('head').append('<script src="' + customSelectPlugin + '"></script>');
  $('head').append('<script src="' + chatBoxPlugin + '"></script>');
  $('head').append('<script src="' + readystatePlugin + '"></script>');

  $('head').append('<link rel="stylesheet" href="https://radconnext.info/lib/tui-image-editor.min.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="https://radconnext.info/lib/tui-color-picker.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="https://radconnext.info/lib/print/print.min.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="https://radconnext.info/case/css/scanpart.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="https://radconnext.info/case/css/custom-select.css" type="text/css" />');

  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});

  $('head').append('<link rel="stylesheet" href="https://radconnext.info/stylesheets/style.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="https://radconnext.info/case/css/style.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="https://radconnext.info/case/css/main-fix.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="https://radconnext.info/case/css/menu-fix.css" type="text/css" />');

  document.addEventListener("triggercasecounter", casecounter.onCaseChangeStatusTrigger);
  document.addEventListener("triggerconsultcounter", casecounter.onConsultChangeStatusTrigger);
  document.addEventListener("triggernewdicom", submain.onNewDicomTransferTrigger);
  document.addEventListener("triggerupdatedicom", submain.onUpdateDicomTransferTrigger);
  document.addEventListener("triggercasemisstake", submain.onCaseMisstakeNotifyTrigger);
  document.addEventListener("triggernewreport", submain.onNewReportTrigger);
  document.addEventListener("triggerrezip", submain.onRezipTrigger);

  let mainFile= '../form/main-fix.html';
  let menuFile = '../form/menu-fix.html';

  $('#app').load(mainFile, function(){
    $('#Menu').load(menuFile, function(){

      $(document).on('openedituserinfo', (evt, data)=>{
				userinfo.doShowUserProfile();
			});
			$(document).on('userlogout', (evt, data)=>{
				common.doUserLogout(wsm);
			});

      $(document).on('gotoportal', (evt, data)=>{
        portal.doShowPortal();
      });

      $(document).on('newconsult', (evt, data)=>{
        consult.doCreateNewConsultForm();
      });

      $(document).on('myconsult', (evt, data)=>{
        consult.doCreateMyConsultListView();
      });

      $(document).on('stdurgentconfig', (evt, data)=>{
        urgentstd.doLoadMyStdUrgentListView();
      });

      $(document).on('openscanpartprofile', (evt, data)=>{
				submain.showScanpartAux();
			});

      $(document).on('openreportdesign', (evt, data)=>{
				$('body').loading('start');
				$(".mainfull").empty();
				let reportDesignUrl = '../report-design/index.html?hosid=' + data.hospitalId;
				window.location.replace(reportDesignUrl);
				$('body').loading('stop');
			});

      $(document).on('opennewstatuscase', async (evt, data)=>{
				let titlePage = $('<div></div>');
				let logoPage = $('<img src="/images/case-incident-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
				$(logoPage).appendTo($(titlePage));
				let titleContent = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>เคสส่งอ่าน [เคสใหม่] -รอตอบรับจากรังสีแพทย์</h3></div>');
				$(titleContent).appendTo($(titlePage));
				$("#TitleContent").empty().append($(titlePage));
				let rqParams = { hospitalId: userdata.hospitalId, statusId: common.caseReadWaitStatus };
				cases.doLoadCases(rqParams).then(()=>{
          common.doScrollTopPage();
        });
			});

      $(document).on('openacceptedstatuscase', async (evt, data)=>{
				let resultTitle = $('<div"></div>');
				let logoPage = $('<img src="/images/case-incident-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
				$(logoPage).appendTo($(resultTitle));
				let titleResult = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>เคสส่งอ่าน [ตอบรับแล้ว] -รอผลอ่าน</h3></div>');
				$(titleResult).appendTo($(resultTitle));
				$("#TitleContent").empty().append($(resultTitle));
				let rqParams = { hospitalId: userdata.hospitalId, /*userId: userdata.id,*/ statusId: common.casePositiveStatus };
				cases.doLoadCases(rqParams).then(()=>{
          common.doScrollTopPage();
        });
			});

      $(document).on('opensuccessstatuscase', async (evt, data)=>{
				let resultTitle = $('<div></div>');
				let logoPage = $('<img src="/images/case-incident-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
				$(logoPage).appendTo($(resultTitle));
				let titleResult = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>เคสส่งอ่าน [ได้ผลอ่านแล้ว]</h3></div>');
				$(titleResult).appendTo($(resultTitle));
				$("#TitleContent").empty().append($(resultTitle));
				let rqParams = { hospitalId: userdata.hospitalId, /*userId: userdata.id,*/ statusId: common.caseReadSuccessStatus };
				cases.doLoadCases(rqParams).then(()=>{
          common.doScrollTopPage();
        });
			});

      $(document).on('opennegativestatuscase', async (evt, data)=>{
				let resultTitle = $('<div></div>');
				let logoPage = $('<img src="/images/case-incident-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
				$(logoPage).appendTo($(resultTitle));
				let titleResult = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>รายการเคสไม่สมบูรณ์/รอคำสั่ง</h3></div>');
				$(titleResult).appendTo($(resultTitle));
				$("#TitleContent").empty().append($(resultTitle));
				let rqParams = { hospitalId: userdata.hospitalId, /*userId: userdata.id,*/ statusId: common.caseNegativeStatus };
				cases.doLoadCases(rqParams).then(()=>{
          common.doScrollTopPage();
        });
			});

      $(document).on('opensearchcase', async (evt, data)=>{
				$('body').loading('start');
        let yesterDayFormat = util.getYesterdayDevFormat();
        let toDayFormat = util.getTodayDevFormat();
				let defaultSearchKey = {fromDateKeyValue: yesterDayFormat, toDateKeyValue: toDayFormat, patientNameENKeyValue: '*', patientHNKeyValue: '*', bodypartKeyValue: '*', caseStatusKeyValue: 0};
				let defaultSearchParam = {key: defaultSearchKey, hospitalId: userdata.hospitalId, userId: userdata.id, usertypeId: userdata.usertypeId};

				let searchTitlePage = cases.doCreateSearchTitlePage();

				$("#TitleContent").empty().append($(searchTitlePage));
				let response = await common.doCallApi('/api/cases/search/key', defaultSearchParam);
				$('body').loading('stop');
				if (response.status.code === 200) {
					let searchResultViewDiv = $('<div id="SearchResultView"></div>');
					$(".mainfull").empty().append($(searchResultViewDiv));
					await cases.doShowSearchResultCallback(response);
          common.doScrollTopPage();
				} else {
					$(".mainfull").append('<h3>ระบบค้นหาเคสขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
				}
			});

      $(document).on('openhome', (evt, data)=>{
				common.doSaveQueryDicom(data);
				dicom.doLoadDicomFromOrthanc();
			});

      submain.doTriggerDicomFilterForm();

      submain.doAddNotifyCustomStyle();

      doInitDefualPage();
      //submain.testLocalConvetDiocom();
    });
  });
}

const doInitDefualPage = function(){
  $('body').loading('start');
  casecounter.doSetupCounter().then(async(loadRes)=>{
    actionAfterSetupCounter();
    submain.doInitShowMasterNotify();
    $('body').loading('stop');
  });
}

const doTriggerLoadDicom = function(){
  let queryString = localStorage.getItem('dicomfilter');
  let query = JSON.parse(queryString);
  let modality = query.Query.Modality;
  if (modality !== '*') {
    $('#HomeMainCmd').next('.NavSubHide').find('.MenuCmd').each((i, cmd) => {
      let cmdModality = $(cmd).data('dm');
      if (cmdModality == modality) {
        $(cmd).click();
      }
    });
  }
}

const actionAfterSetupCounter = function(){
  $('#HomeMainCmd').click();
  doTriggerLoadDicom();
}
