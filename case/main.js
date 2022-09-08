/* main.js */

window.$ = window.jQuery = require('jquery');
require('./mod/jquery-ex.js');
const cases = require('./mod/case.js')($);
const apiconnector = require('./mod/apiconnect.js')($);
const util = require('./mod/utilmod.js')($);
const dicomfilter = require('./mod/dicomfilter.js')($);
const newcase = require('./mod/createnewcase.js')($);
const common = require('./mod/commonlib.js')($);
const userinfo = require('./mod/userinfolib.js')($);
const userprofile = require('./mod/userprofilelib.js')($);
const casecounter = require('./mod/casecounter.js')($);
const consult = require('./mod/consult.js')($);
const urgentstd = require('./mod/urgentstd.js')($);
const masternotify = require('./mod/master-notify.js')($);
const softphone = require('./mod/softphonelib.js')($);

//const isMobile = util.isMobileDeviceCheck();
//const isMobile = true;

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
          if (userdata.usertypeId == 2) {
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
	/*
		jquery loading api
		https://carlosbonetti.github.io/jquery-loading/
	*/
  let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
	let jqueryNotifyUrl = '../lib/notify.min.js';
  let printjs = '../lib/print/print.min.js';
  let excelexportjs = '../lib/excel/excelexportjs.js';
  let jquerySimpleUploadUrl = '../lib/simpleUpload.min.js';
  let jssip = "../lib/jssip-3.9.0.min.js";
  //let localdbjs = '../lib/localdb.min.js';

	let patientHistoryPluginUrl = "../setting/plugin/jquery-patient-history-image-plugin.js";
	let countdownclockPluginUrl = "../setting/plugin/jquery-countdown-clock-plugin.js";
	let scanpartPluginUrl = "../setting/plugin/jquery-scanpart-plugin.js";
	let customUrgentPlugin = "../setting/plugin/jquery-custom-urgent-plugin.js";
	let controlPagePlugin = "../setting/plugin/jquery-controlpage-plugin.js"
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
  //https://printjs.crabbly.com/
  $('head').append('<script src="' + printjs + '"></script>');
  //https://www.jqueryscript.net/other/Export-Table-JSON-Data-To-Excel-jQuery-ExportToExcel.html#google_vignette
  $('head').append('<script src="' + excelexportjs + '"></script>');
  $('head').append('<script src="' + jquerySimpleUploadUrl + '"></script>');
  $('head').append('<script src="' + jssip + '"></script>');
  //https://github.com/mike183/localDB
  //$('head').append('<script src="' + localdbjs + '"></script>');

	$('head').append('<script src="' + patientHistoryPluginUrl + '"></script>');
	$('head').append('<script src="' + countdownclockPluginUrl + '"></script>');
	$('head').append('<script src="' + scanpartPluginUrl + '"></script>');
	$('head').append('<script src="' + customUrgentPlugin + '"></script>');
	$('head').append('<script src="' + controlPagePlugin + '"></script>');
  $('head').append('<script src="' + customSelectPlugin + '"></script>');
  $('head').append('<script src="' + utilityPlugin + '"></script>');
  $('head').append('<script src="' + chatBoxPlugin + '"></script>');
  $('head').append('<script src="' + sipPhonePlugin + '"></script>');

	$('head').append('<link rel="stylesheet" href="../lib/tui-image-editor.min.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="../lib/tui-color-picker.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="../lib/print/print.min.css" type="text/css" />');
	$('head').append('<link rel="stylesheet" href="./css/scanpart.css" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="./css/custom-select.css" type="text/css" />');

  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});

	$('body').on('loading.start', function(event, loadingObj) {
	  //console.log('=== loading show ===');
	});

	$('body').on('loading.stop', function(event, loadingObj) {
	  //console.log('=== loading hide ===');
	});

  //-> น่าจะไม่ได้ใช้งานแล้ว
  $('#HistoryDialogBox').dialog({
    modal: true, autoOpen: false, width: 350, resizable: false, title: 'ประวัติผู้ป่วย'
  });

  document.addEventListener("triggercasecounter", casecounter.onCaseChangeStatusTrigger);
  document.addEventListener("triggerconsultcounter", casecounter.onConsultChangeStatusTrigger);
  document.addEventListener("triggernewdicom", onNewDicomTransferTrigger);
  document.addEventListener("triggercasemisstake", onCaseMisstakeNotifyTrigger);
  document.addEventListener("clientreconnecttrigger", onClientReconnectTrigger);
  document.addEventListener("clientresult", onClientResult);

  let userdata = JSON.parse(doGetUserData());

  let mainFile= 'form/main-fix.html';
  let mainStyle= 'css/main-fix.css';
  let menuFile = 'form/menu-fix.html';
  let menuStyle = 'css/menu-fix.css';
  let commonStyle = '../stylesheets/style.css';
  let caseStyle = 'css/style.css';

  $('head').append('<link rel="stylesheet" href="' + commonStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + caseStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + mainStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + menuStyle + '" type="text/css" />');

	$('#app').load(mainFile, function(){
		$('#Menu').load(menuFile, function(){

			$(document).on('openedituserinfo', (evt, data)=>{
				userinfo.doShowUserProfile();
			});
			$(document).on('userlogout', (evt, data)=>{
				common.doUserLogout(wsm);
			});

			$(document).on('openhome', (evt, data)=>{
				common.doSaveQueryDicom(data);
				newcase.doLoadDicomFromOrthanc();
			});

      $(document).on('opendicomfilter', (evt, data)=>{
        let queryString = localStorage.getItem('dicomfilter');
        let queryDicom = JSON.parse(queryString);
        let filterKey = queryDicom.Query;
        $(".mainfull").find('#DicomFilterForm').show();
        if ((filterKey.StudyFromDate !== '') && (filterKey.StudyFromDate !== '*')) {
          $('#StudyFromDateInput').val(filterKey.StudyFromDate);
        }
        if ((filterKey.StudyToDate !== '') && (filterKey.StudyToDate !== '*')) {
  			  $('#StudyToDateInput').val(filterKey.StudyToDate);
        }
        if ((filterKey.PatientName !== '') && (filterKey.PatientName !== '*')) {
  			  $('#PatientNameInput').val(filterKey.PatientName);
        }
        if ((filterKey.PatientHN !== '') && (filterKey.PatientHN !== '*')) {
  			  $('#PatientHNInput').val(filterKey.PatientHN);
        }
        if ((filterKey.Modality !== '') && (filterKey.Modality !== '*')) {
  				$('#ModalityInput').val(filterKey.Modality);
        }
        if ((filterKey.ScanPart !== '') && (filterKey.ScanPart !== '*')) {
  			  $('#ScanPartInput').val(filterKey.ScanPart);
        }
      });
			$(document).on('opennewstatuscase', async (evt, data)=>{
				let titlePage = $('<div></div>');
				let logoPage = $('<img src="/images/case-incident-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
				$(logoPage).appendTo($(titlePage));
				let titleContent = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>เคสส่งอ่าน [เคสใหม่] -รอตอบรับจากรังสีแพทย์</h3></div>');
				$(titleContent).appendTo($(titlePage));
				$("#TitleContent").empty().append($(titlePage));
				let rqParams = { hospitalId: userdata.hospitalId, /*userId: userdata.id,*/ statusId: common.caseReadWaitStatus };
				cases.doLoadCases(rqParams).then(()=>{
          common.doScrollTopPage();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              cases.doLoadCases(rqParams).then(()=>{
                common.doScrollTopPage();
              });
            } else {
              common.doUserLogout(wsm);
            }
          }
        })
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

			$(document).on('openreportdesign', (evt, data)=>{
				$('body').loading('start');
				$(".mainfull").empty();
				let reportDesignUrl = '../report-design/index.html?hosid=' + data.hospitalId;
				window.location.replace(reportDesignUrl);
				$('body').loading('stop');
			});

			$(document).on('openscanpartprofile', (evt, data)=>{
				showScanpartAux();
			});

      /*
			$(document).on('defualsettingschange', (evt, data)=>{
				doUpdateDefualSeeting(data.key, data.value)
			});
      */

      $(document).on('gotoportal', (evt, data)=>{
        window.location.replace('/portal/index.html');
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

      doAddNotifyCustomStyle();

      doInitDefualPage();

		});
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

const doInitDefualPage = function(){
  $('body').loading('start');
  //let logWin = util.doShowLogWindow();
  casecounter.doSetupCounter().then(async(loadRes)=>{
    actionAfterSetupCounter();
    $('.mainfull').attr('tabindex', 1);
    $('.mainfull').on('keydown', async (evt)=>{
      if (event.ctrlKey && event.key === 'Z') {
        let masterNotifyView = $('.mainfull').find('#MasterNotifyView');
        if ($(masterNotifyView).length > 0) {
          $(masterNotifyView).remove();
        } else {
          masterNotifyView = await masternotify.doShowMessage(userdata.id);
          $('.mainfull').append($(masterNotifyView));
        }
      }
    });
    $('body').loading('stop');
  }).catch(async (err)=>{
    console.log(err);
    if (err.error.code == 210){
      let rememberme = localStorage.getItem('rememberme');
      if (rememberme == 1) {
        let newUserData = await apiconnector.doCallNewTokenApi();
        localStorage.setItem('token', newUserData.token);
        localStorage.setItem('userdata', JSON.stringify(newUserData.data));
        casecounter.doSetupCounter().then((loadRes)=>{
          actionAfterSetupCounter();
          $('body').loading('stop');
        });
      } else {
        common.doUserLogout(wsm);
      }
    }
  });
}

const doUpdateDefualSeeting = function (key, value){
	let lastDefualt = JSON.parse(localStorage.getItem('defualsettings'));
	if (lastDefualt.hasOwnProperty(key)) {
		lastDefualt[key] = value;
		localStorage.setItem('defualsettings', JSON.stringify(lastDefualt));
	}
}

const showScanpartAux = async function() {
  const userdata = JSON.parse(doGetUserData());
	const deleteCallback = async function(scanpartAuxId) {
		$('body').loading('start');
		let rqParams = {id: scanpartAuxId};
		let scanpartauxRes = await common.doCallApi('/api/scanpartaux/delete', rqParams);
		if (scanpartauxRes.status.code == 200) {
			$.notify("ลบรายการ Scan Part สำเร็จ", "success");
			showScanpartAux();
		} else {
			$.notify("ไม่สามารถลบรายการ Scan Part ได้ในขณะนี้", "error");
		}
		$('body').loading('stop');
	}

	$('body').loading('start');
  /*
	let resultTitle = $('<div class="title-content"><h3>รายการ Scan Part ของคุณ</h3></div>');
	$(".mainfull").empty().append($(resultTitle));
  */
  let pageLogo = $('<img src="/images/urgent-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
  let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>รายการ Scan Part ของฉัน</h3></div>');
  let titleBox = $('<div></div>').append($(pageLogo)).append($(titleText));
  $("#TitleContent").empty().append($(titleBox));

	let userId = userdata.id;
	let rqParams = {userId: userId};
	let scanpartauxs = await common.doCallApi('/api/scanpartaux/user/list', rqParams);
	if (scanpartauxs.Records.length > 0) {
		let scanpartAuxBox = await userprofile.showScanpartProfile(scanpartauxs.Records, deleteCallback);
		$(".mainfull").empty().append($(scanpartAuxBox));
  } else if (scanpartauxs.Records.token.expired) {
    let rememberme = localStorage.getItem('rememberme');
    if (rememberme == 1) {
      let newUserData = await apiconnector.doCallNewTokenApi();
      localStorage.setItem('token', newUserData.token);
      localStorage.setItem('userdata', JSON.stringify(newUserData.data));
      let scanpartAuxBox = await userprofile.showScanpartProfile(scanpartauxs.Records, deleteCallback);
  		$(".mainfull").empty().append($(scanpartAuxBox));
    } else {
      window.location.replace('/index.html');
    }
	} else {
		$(".mainfull").append($('<h4>ไม่พบรายการ Scan Part ของคุณ</h4>'));
	}
	$('body').loading('stop');
}

const doCreateCustomNotify = function(){
  let msgBox = $('<div></div>');
  let titleBox = $("<div id='notify-title' style='background-color: white; color: black; font-weight: bold; text-align: center;'></div>");
  $(titleBox).append($('<h4>แจ้งภาพใหม่เข้าระบบ</h4>'));
  let boyBox = $("<div id='notify-body'></div>");
  $(boyBox).append($('<span>มีภาพใหม่เพิ่มเข้าระบบ 1 รายการ คลิกที่ปุ่ม <b>Update</b> เพื่อโหลดรา่ยการภาพใหม่ขึ้นมาแสดง</span>'));
  let footerBox = $("<div id='notify-footer' style='text-align: center;'></div>");
  let updateCmd = $('<input type="button" value="Update" id="UpdateDicomCmd"/>');
  $(footerBox).append($(updateCmd));
  return $(msgBox).append($(titleBox)).append($(boyBox)).append($(footerBox))
}

const onNewDicomTransferTrigger = function(evt){
  let trigerData = evt.detail.data;
  let dicom = trigerData.dicom;
  let webworker = new Worker("../lib/dicom-sync-webworker.js");
  webworker.addEventListener("message", function(event) {
    let evtData = JSON.parse(event.data);
    if (evtData.type === 'savesuccess'){
      let isOnDefualtMenu = $('#HomeMainCmd').hasClass('NavActive');
      console.log(isOnDefualtMenu);
      if (isOnDefualtMenu) {
        let queryString = localStorage.getItem('dicomfilter');
        let dicomQuery = JSON.parse(queryString).Query;
        common.doFilterDicom([dicom], dicomQuery).then((filteredStudies)=>{
          if (filteredStudies.length > 0){
            let msgBox = doCreateCustomNotify();
            $.notify($(msgBox).html(), {position: 'top right', autoHideDelay: 20000, clickToHide: true, style: 'myshopman', className: 'base'});
            let updateDicomCmd = $('body').find('#UpdateDicomCmd');
            $(updateDicomCmd).on('click', (evt)=>{
              newcase.doLoadDicomFromOrthanc();
            });
          }
        });
      } else {
        $.notify('มีรายการภาพใหม่ส่งมาจากโรงพยาบาล บันทึกเข้าสู่ระบบเรียบร้อยแล้ว', 'success');
      }
    } else if (evtData.type === 'error'){
      //$.notify('Dicom Sync in background error at ' + evtData.row + ' Error Message = ' + JSON.stringify(evtData.error))
      //console.log(evtData.error);
    }
  });

  let synmessageCmd = {type: 'save', dicom: dicom}
  webworker.postMessage(JSON.stringify(synmessageCmd));
}

const onCaseMisstakeNotifyTrigger = function(evt){
  let trigerData = evt.detail.data;
  let msg = trigerData.msg;
  let from = trigerData.from;
  let patientFullName = trigerData.caseData.patientFullName;
  let patientHN = trigerData.caseData.patientHN;
  let caseScanParts = trigerData.caseData.caseScanParts;
  let caseScanPartsText = '';
  caseScanParts.forEach((item, i) => {
    if (i != (caseScanParts.length - 1)) {
      caseScanPartsText  += item.Name + ' \ ';
    } else {
      caseScanPartsText  += item.Name;
    }
  });

  let radAlertMsg = $('<div></div>');
  let notifyFromromBox = $('<div></div>');
  $(notifyFromromBox).append($('<p>ผ้ป่วย ชื่อ ' + patientFullName + '</p>').css({'text-align': 'left', 'line-height': '14px'}));
  $(notifyFromromBox).append($('<p>HN ' + patientHN + '</p>').css({'text-align': 'left', 'line-height': '14px'}));
  $(notifyFromromBox).append($('<p>ฆScan Part ' + caseScanPartsText + '</p>').css({'text-align': 'left', 'line-height': '14px'}));
  $(notifyFromromBox).append($('<p>ผู้แจ้ง ' + from.userfullname + '</p>').css({'text-align': 'left', 'line-height': '14px'}));
  $(notifyFromromBox).append($('<p>สาเหตุเคสผิดพลาด ' + msg.cause + '</p>').css({'text-align': 'left', 'line-height': '14px'}));
  $(notifyFromromBox).append($('<p>ข้อความแจ้งเพิ่มเติม ' + msg.other + '</p>').css({'text-align': 'left', 'line-height': '14px'}));
  $(radAlertMsg).append($(notifyFromromBox));

  const radalertoption = {
    title: 'ข้อความแจ้งเตือนเตสผิดพลาด',
    msg: $(radAlertMsg),
    width: '420px',
    onOk: function(evt) {
      radAlertBox.closeAlert();
    }
  }
  let radAlertBox = $('body').radalert(radalertoption);
  $(radAlertBox.cancelCmd).hide();
}

const onClientReconnectTrigger = function(evt){
  let trigerData = evt.detail.data;
  let userdata = doGetUserData();
  userdata = JSON.parse(userdata);
  wsl = util.doConnectWebsocketLocal(userdata.username);
  setTimeout(()=>{
    wsl.send(JSON.stringify({type: 'client-reconnect'}));
    localStorage.removeItem('masternotify');
  },2100);
}

const onClientResult = async function(evt){
  //console.log(evt.detail);
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  let username = userdata.username;
  let hospitalId = userdata.hospitalId;
  let clientData = evt.detail.data;
  let clientDataObject = undefined;
  if ((typeof clientData) == 'string') {
    if (clientData !== '') {
      clientDataObject = JSON.parse(clientData);
    } else {
      clientDataObject = {};
    }
  } else if ((typeof clientData) == 'object') {
    if (clientData && clientData.length > 0){
      clientDataObject = clientData;
    } else {
      clientDataObject = {};
    }
  } else {
    clientDataObject = {};
  }

  let studyID = clientDataObject.ParentResources[0];
  let clientHospitalId = evt.detail.hospitalId;

  let parentResources = clientDataObject.hasOwnProperty('ParentResources');
  let failedInstancesCount = clientDataObject.hasOwnProperty('FailedInstancesCount');
  let instancesCount = clientDataObject.hasOwnProperty('InstancesCount');
  if ((parentResources) && (failedInstancesCount) && (instancesCount)){
    let studyTags = await common.doCallLoadStudyTags(clientHospitalId, studyID);
    console.log(studyTags);
    let reStudyRes = await common.doReStructureDicom(clientHospitalId, studyID, studyTags);
    console.log(reStudyRes);
    let radAlertMsg = $('<div></div>');
    $(radAlertMsg).append($('<p>ดำเนินการส่งภาพจำนวน ' + clientDataObject.InstancesCount + ' ภาพ</p>'));
    $(radAlertMsg).append($('<p>เข้าระบบอีกครั้งสำเร็จ</p>'));
    const radalertoption = {
      title: 'ผลการส่งภาพเข้าระบบ',
      msg: $(radAlertMsg),
      width: '420px',
      onOk: function(evt) {
        radAlertBox.closeAlert();
      }
    }
    let radAlertBox = $('body').radalert(radalertoption);
    $(radAlertBox.cancelCmd).hide();
    $('body').loading('stop');
  } else {
    /*
    let cloudModality = clientDataObject.hasOwnProperty('cloud');
    if (cloudModality) {
      /*
      let cloudHost = clientDataObject.cloud.Host;
      let newCloudHost = undefined;
      if (cloudHost == '150.95.26.106'){
        newCloudHost = '202.28.68.28';
      } else {
        newCloudHost = '150.95.26.106'
      }
      let cloudAET = clientDataObject.cloud.AET;
      let cloudPort = clientDataObject.cloud.Port;
      let changeCloudCommand = 'curl -v --user demo:demo -X PUT http://localhost:8042/modalities/cloud -d "{\\"AET\\" : \\"' + cloudAET + '\\", \\"Host\\": \\"' + newCloudHost +'\\", \\"Port\\": ' + cloudPort + '}"';
      */
      /*
      let changeCloudCommand = 'curl -v --user demo:demo -X POST http://localhost:8042/tools/reset';
      let lines = [changeCloudCommand];
      wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
      setTimeout(()=>{
        setTimeout(async()=>{
          if (studyID) {
            let changeCloudCommand = 'curl -v --user demo:demo -X POST http://localhost:8042/modalities/cloud/store -d ' + studyID;
            let lines = [changeCloudCommand];
            wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
            setTimeout(async()=>{
              let studyTags = await common.doCallLoadStudyTags(clientHospitalId, studyID);
              console.log(studyTags);
              let reStudyRes = await common.doReStructureDicom(clientHospitalId, studyID, studyTags);
              console.log(reStudyRes);
            }, 30000);
          } else {
            let studyTags = await common.doCallLoadStudyTags(clientHospitalId, studyID);
            console.log(studyTags);
            let reStudyRes = await common.doReStructureDicom(clientHospitalId, studyID, studyTags);
            console.log(reStudyRes);
          }
        }, 8500)
      }, 8500)
      $('body').loading('stop');
    }

    */
  }

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

const doAddNotifyCustomStyle = function(){
  $.notify.addStyle('myshopman', {
    html: "<div class='superblue'><span data-notify-html/></div>",
    classes: {
      base: {
        "border": "3px solid white",
        "border-radius": "20px",
        "color": "white",
        "background-color": "#184175",
        "padding": "10px"
      },
      green: {
        "border": "3px solid white",
        "border-radius": "20px",
        "color": "white",
        "background-color": "green",
        "padding": "10px"
      },
      red: {
        "border": "3px solid white",
        "border-radius": "20px",
        "color": "white",
        "background-color": "red",
        "padding": "10px"
      }
    }
  });
}

module.exports = {
  doGetToken,
  doGetUserData,
	doGetUserItemPerPage,
	doGetWsm
}
