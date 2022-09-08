/* main.js */

window.$ = window.jQuery = require('jquery');

/*****************************/
window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

var noti, wsm, sipUA;

const util = require('../case/mod/utilmod.js')($);
const common = require('../case/mod/commonlib.js')($);
const userinfo = require('../case/mod/userinfolib.js')($);
const userprofile = require('../case/mod/userprofilelib.js')($);
const apiconnector = require('../case/mod/apiconnect.js')($);
const welcome = require('./mod/welcomelib.js')($);
const newcase = require('./mod/newcaselib.js')($);
const acccase = require('./mod/acccaselib.js')($);
const searchcase = require('./mod/searchcaselib.js')($);
const opencase = require('./mod/opencase.js')($);
const template = require('./mod/templatelib.js')($);
//const profile = require('./mod/profilelib.js')($);
const profile = require('./mod/profilelibV2.js')($);
const softphone = require('../case/mod/softphonelib.js')($);

const modalLockScreenStyle = { 'position': 'fixed', 'z-index': '41', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto', 'background-color': '#ccc'};

$( document ).ready(function() {
  const initPage = function() {
    if (sessionStorage.getItem('logged')) {
  		var token = doGetToken();
  		if (token !== 'undefined') {
        let userdata = doGetUserData();
        if (userdata !== 'undefined') {
          userdata = JSON.parse(userdata);
          console.log(userdata);
          if (userdata.usertypeId == 4){
    			  doLoadMainPage();
            wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
            doSetupAutoReadyAfterLogin();
            /*
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
            */
          } else {
            //$.notify('บัญชีใช้งานของคุณไม่สามารถเข้าใช้งานหน้านี้ได้ โปรด Login ใหม่เพื่อเปลี่ยนบัญชีใช้งาน', 'error');
            alert('บัญชีใช้งานของคุณไม่สามารถเข้าใช้งานหน้านี้ได้ โปรด Login ใหม่เพื่อเปลี่ยนบัญชีใช้งาน');
            doLoadLogin();
          }
        } else {
          doLoadLogin();
        }
  		} else {
  			doLoadLogin();
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

function doCallLoginApi(user) {
  return new Promise(function(resolve, reject) {
    var loginApiUri = '/api/login/';
    var params = user;
    //$.post(loginApiUri, params, function(response){
    common.doCallApi(loginApiUri, params).then((response)=>{
			resolve(response);
		}).catch((err) => {
			console.log(JSON.stringify(err));
      reject(err);
		})
	});
}

function doLoadRadioConfigApi(userId) {
  return new Promise(function(resolve, reject) {
    var loadOriginUrl = '/api/radiologist/load/config/' + userId;
    var params = {userId};
    //$.post(loadOriginUrl, params, function(response){
    common.doCallApi(loadOriginUrl, params).then((response)=>{
			resolve(response);
		}).catch((err) => {
			console.log(JSON.stringify(err));
      reject(err);
		})
  });
}

function doLoadMainPage(){
  let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
	let jqueryNotifyUrl = '../lib/notify.min.js';
  let html2textlib = '../lib/to-asciidoc.js';
  let htmlformatlib = '../lib/htmlformatlib.js';
  let jssip = "../lib/jssip-3.9.0.min.js";

	let countdownclockPluginUrl = "../setting/plugin/jquery-countdown-clock-plugin.js";
	let controlPagePlugin = "../setting/plugin/jquery-controlpage-plugin.js";
  let readystatePlugin = "../setting/plugin/jqury-readystate-plugin.js";
  let chatBoxPlugin = "../setting/plugin/jquery-chatbox-plugin.js";
  let utilityPlugin = "../setting/plugin/jquery-radutil-plugin.js";
  let sipPhonePlugin = "../setting/plugin/jquery-sipphone-income-plugin.js";

  $('head').append('<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />');
  $('head').append('<meta http-equiv="Pragma" content="no-cache" />');
  $('head').append('<meta http-equiv="Expires" content="0"/>');

	$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
	//https://carlosbonetti.github.io/jquery-loading/
	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
	//https://notifyjs.jpillora.com/
	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

  $('head').append('<script src="' + html2textlib + '"></script>');
  $('head').append('<script src="' + htmlformatlib + '"></script>');
  $('head').append('<script src="' + jssip + '"></script>');

	$('head').append('<script src="' + countdownclockPluginUrl + '"></script>');
	$('head').append('<script src="' + controlPagePlugin + '"></script>');
  $('head').append('<script src="' + readystatePlugin + '"></script>');
  $('head').append('<script src="' + chatBoxPlugin + '"></script>');
  $('head').append('<script src="' + utilityPlugin + '"></script>');
  $('head').append('<script src="' + sipPhonePlugin + '"></script>');

  $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});

	$('body').on('loading.start', function(event, loadingObj) {
	  //console.log('=== loading show ===');
	});

	$('body').on('loading.stop', function(event, loadingObj) {
	  //console.log('=== loading hide ===');
	});

  document.addEventListener("triggercounter", welcome.onCaseChangeStatusTrigger);
  //document.addEventListener("callzoominterrupt", welcome.doInterruptZoomCallEvt);
  document.addEventListener("callzoominterrupt", welcome.doInterruptWebRTCCallEvt);
  document.addEventListener("lockscreen", onLockScreenTrigger);
  document.addEventListener("unlockscreen", onUnLockScreenTrigger);
  document.addEventListener("autologout", onAutoLogoutTrigger);
  document.addEventListener("updateuserprofile", onUpdateUserProfileTrigger);

  let userdata = JSON.parse(doGetUserData());

  let mainFile= '../case/form/main-fix.html';
  let mainStyle= '../case/css/main-fix.css';
  let menuFile = 'form/menu.html';
  let menuStyle = '../case/css/menu-fix.css';
  let commonStyle = '../stylesheets/style.css';
  let caseStyle = '../case/css/style.css';

  $('head').append('<link rel="stylesheet" href="' + commonStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + caseStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + mainStyle + '" type="text/css" />');
  $('head').append('<link rel="stylesheet" href="' + menuStyle + '" type="text/css" />');

	$('#app').load(mainFile, function(){
		$('#Menu').load(menuFile, function(){
      //let logWin = util.doShowLogWindow();
      $(document).on('openedituserinfo', (evt, data)=>{
				userinfo.doShowUserProfile();
        util.doResetPingCounter();
			});
			$(document).on('userlogout', (evt, data)=>{
				common.doUserLogout(wsm);
			});
			$(document).on('openhome', (evt, data)=>{
        //$(logWin).empty();
        doLoadDefualtPage();
        util.doResetPingCounter();
			});
      $(document).on('opennewstatuscase', async (evt, data)=>{
        //$(logWin).empty();
        let newcaseTitlePage = newcase.doCreateNewCaseTitlePage();
        $("#TitleContent").empty().append($(newcaseTitlePage));
        newcase.doCreateNewCasePage().then((newcasePage)=>{
          $(".mainfull").empty().append($(newcasePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              newcase.doCreateNewCasePage().then((newcasePage)=>{
                $(".mainfull").append($(newcasePage));
                common.doScrollTopPage();
                util.doResetPingCounter();
              });
            } else {
              common.doUserLogout(wsm);
            }
          }
        });
      });
      $(document).on('openacceptedstatuscase', async (evt, data)=>{
        //$(logWin).empty();
        let acccaseTitlePage = acccase.doCreateAccCaseTitlePage();
        $("#TitleContent").empty().append($(acccaseTitlePage));
        acccase.doCreateAccCasePage().then((acccasePage)=>{
          $(".mainfull").empty().append($(acccasePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              acccase.doCreateAccCasePage().then((acccasePage)=>{
                $(".mainfull").append($(acccasePage));
                common.doScrollTopPage();
                util.doResetPingCounter();
              });
            } else {
              common.doUserLogout(wsm);
            }
          }
        });
      });
      $(document).on('opensearchcase', async (evt, data)=>{
        $('body').loading('start');
        let yesterDayFormat = util.getYesterdayDevFormat();
        let toDayFormat = util.getTodayDevFormat();
        let defaultSearchKey = {fromDateKeyValue: yesterDayFormat, toDateKeyValue: toDayFormat, patientNameENKeyValue: '*', patientHNKeyValue: '*', bodypartKeyValue: '*', caseStatusKeyValue: 0};
        let defaultSearchParam = {key: defaultSearchKey, hospitalId: userdata.hospitalId, userId: userdata.id, usertypeId: userdata.usertypeId};
        let searchTitlePage = searchcase.doCreateSearchTitlePage();

        $("#TitleContent").empty().append($(searchTitlePage));

        let callsearchKeyUrl = '/api/cases/search/key';
        common.doCallApi(callsearchKeyUrl, defaultSearchParam).then(async(response)=>{
          if (response.status.code === 200) {
            let searchResultViewDiv = $('<div id="SearchResultView"></div>');
            $(".mainfull").empty().append($(searchResultViewDiv));
            await searchcase.doShowSearchResultCallback(response);
            common.doScrollTopPage();
          } else if (response.status.code === 210) {
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              common.doCallApi(callsearchKeyUrl, defaultSearchParam).then(async(response)=>{
                if (response.status.code === 200) {
                  let searchResultViewDiv = $('<div id="SearchResultView"></div>');
                  $(".mainfull").empty().append($(searchResultViewDiv));
                  await searchcase.doShowSearchResultCallback(response);
                  common.doScrollTopPage();
                } else {
                  $(".mainfull").empty().append('<h3>ระบบค้นหาเคสขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
                }
                util.doResetPingCounter();
                $('body').loading('stop');
              });
            } else {
              common.doUserLogout(wsm);
            }
          } else {
            $(".mainfull").empty().append('<h3>ระบบค้นหาเคสขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
          }
          util.doResetPingCounter();
          $('body').loading('stop');
        });
      });
      $(document).on('opencase', async (evt, caseData)=>{
        let opencaseTitlePage = acccase.doCreateAccCaseTitlePage();
        $("#TitleContent").empty().append($(opencaseTitlePage));
        opencase.doCreateOpenCasePage(caseData).then((opencasePage)=>{
          $(".mainfull").empty().append($(opencasePage));
          common.doScrollTopPage();
          util.doResetPingCounter();
          $.notify('เปิดเคส - Success', 'success');
          //$('.jqte_editor').css(common.sizeA4Style);
          //console.log($('.jqte_editor').css('font-family'));
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              opencase.doCreateOpenCasePage(caseData).then((opencasePage)=>{
                $(".mainfull").empty().append($(opencasePage));
                common.doScrollTopPage();
                util.doResetPingCounter();
                $.notify('เปิดเคส - Success', 'success');
              });
            } else {
              common.doUserLogout(wsm);
            }
          }
        });
      });
      $(document).on('openprofile', async (evt, data)=>{
        let profileTitlePage = profile.doCreateProfileTitlePage();
        $("#TitleContent").empty().append($(profileTitlePage));
        profile.doCreateProfilePage().then((profilePage)=>{
          $(".mainfull").empty().append($(profilePage));
          common.doScrollTopPage();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              profile.doCreateProfilePage().then((profilePage)=>{
                $(".mainfull").empty().append($(profilePage));
                common.doScrollTopPage();
              });
            } else {
              common.doUserLogout(wsm);
            }
          }
        })
      });
      $(document).on('opentemplatedesign', async (evt, data)=>{
        let templateTitlePage = template.doCreateTemplateTitlePage();
        $("#TitleContent").empty().append($(templateTitlePage));
        template.doCreateTemplatePage().then((templatePage)=>{
          $(".mainfull").empty().append($(templatePage));
          common.doScrollTopPage();
        }).catch(async (err)=>{
          if (err.error.code == 210){
            let rememberme = localStorage.getItem('rememberme');
            if (rememberme == 1) {
              let newUserData = await apiconnector.doCallNewTokenApi();
              localStorage.setItem('token', newUserData.token);
              localStorage.setItem('userdata', JSON.stringify(newUserData.data));
              template.doCreateTemplatePage().then((templatePage)=>{
                $(".mainfull").empty().append($(templatePage));
                common.doScrollTopPage();
              });
            } else {
              common.doUserLogout(wsm);
            }
          }
        });
      });
      $(document).on('defualsettingschange', (evt, data)=>{
				doUpdateDefualSeeting(data.key, data.value);
        util.doResetPingCounter();
			});

			doUseFullPage();
			//doLoadDefualtPage();
      doAutoAcceptCase();

      $('.mainfull').bind('paste', (evt)=>{
        common.onSimpleEditorPaste(evt);
      });
      $('#quickreply').bind('paste', (evt)=>{
        common.onSimpleEditorPaste(evt);
      });
      $(document).on('draftbackupsuccess', async (evt, data)=>{
        //Paste ครั้งแรก ของการเปิด case ให้เซฟทันที
        let backupDraftCounter = opencase.getBackupDraftCounter();
        if (backupDraftCounter == 0){
          let apiUri = undefined;
          let responseId = opencase.getCaseResponseId();
    			if (responseId){
    				apiUri = '/api/caseresponse/update';
    			} else {
    				apiUri = '/api/caseresponse/add';
    			}

          let type = 'draft';
    			let caseId = data.caseId
          let responseHTML = data.content;
          if (responseHTML) {
      			let responseText = toAsciidoc(responseHTML);
      			let userdata = JSON.parse(localStorage.getItem('userdata'));
      			let userId = userdata.id;

      			let saveData = {Response_HTML: responseHTML, Response_Text: responseText, Response_Type: type};
      			let params = {caseId: caseId, userId: userId, data: saveData, responseId: responseId};

            $.post(apiUri, params, function(saveRes){
              opencase.setCaseResponseId(saveRes.result.responseId);
              opencase.setBackupDraftCounter(backupDraftCounter+1);
      			}).fail(function(error) {
      				console.log('1st Paste Backup Error', error);
      			});
          }
        }
      });

      $('body').loading('stop');
    });
  });
}

function doUseFullPage() {
	$(".row").show();
	$(".mainfull").show();
	$(".mainfull").empty();
}

function doLoadDefualtPage() {
  let homeTitlePage = welcome.doCreateHomeTitlePage();
  $("#TitleContent").empty().append($(homeTitlePage));
  welcome.doSetupCounter().then((loadRes)=>{
    /*
    let dicomzipsync = JSON.parse(localStorage.getItem('dicomzipsync'));
    dicomzipsync.forEach((dicom, i) => {
      if (!dicom.zipfileURL) {
        util.dicomZipSyncWorker.postMessage({studyID: dicom.studyID, type: 'application/x-compressed'});
      }
    });
    */

    if (loadRes.newList.Records.length > 0 ) {
      $('#NewCaseCmd').click();
    } else if (loadRes.accList.Records.length > 0) {
      $('#AcceptedCaseCmd').click();
    } else {
      $(".mainfull").empty();
    }
    $('body').loading('stop');
  }).catch(async (err)=>{
    if (err.error.code == 210){
      let rememberme = localStorage.getItem('rememberme');
      if (rememberme == 1) {
        let newUserData = await apiconnector.doCallNewTokenApi();
        localStorage.setItem('token', newUserData.token);
        localStorage.setItem('userdata', JSON.stringify(newUserData.data));
        welcome.doSetupCounter().then((loadRes)=>{
          $(".mainfull").empty();
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

function doCreatePasswordUnlockScreen(unlockActionCallback){
  let passwordUnlockBox = $('<div style="position: relative; width: 100%; padding: 10px;"></div>');
  let passwordInputbox = $('<div style="position: relative; width: 100%;"></div>');
  $(passwordInputbox).appendTo($(passwordUnlockBox));
  let yourPassword = $('<input type="password" tabindex="0" id="YourPassword" style="margin-left: 10px; width: 100px;"/>');
  $(passwordInputbox).append($('<span>ป้อนรหัสผ่านของคุณ:</span>'));
  $(passwordInputbox).append($(yourPassword));

  let cmdBar = $('<div style="position: relative; width: 100%; margin-top: 10px;"></div>');
  $(cmdBar).appendTo($(passwordUnlockBox));
  let unlockCmd = $('<input type="button" value=" ปลดล็อค "/>');
  $(unlockCmd).appendTo($(cmdBar));
  $(unlockCmd).on('click', (evt)=>{
    if($(yourPassword).val() !== '') {
      $(yourPassword).css('border', '');
      unlockActionCallback($(yourPassword).val());
    } else {
      $(yourPassword).css('border', '1px solid red');
      $.notify("คุณยังไม่ได้ป้อนรหัสผ่าน", "error");
    }
  });
  $(yourPassword).on('keypress', (evt)=>{
    if(evt.which == 13) {
      if($(yourPassword).val() !== '') {
        $(yourPassword).css('border', '');
        unlockActionCallback($(yourPassword).val());
      } else {
        $(yourPassword).css('border', '1px solid red');
        $.notify("คุณยังไม่ได้ป้อนรหัสผ่าน", "error");
      }
    }
  });

  return $(passwordUnlockBox);
}

const resetScreen = function(){
  $('#quickreply').empty();
  $('#quickreply').removeAttr('style');
  util.doSetScreenState(0);
  util.doResetPingCounter();
}

function unlockAction(modalBox) {
  const userdata = JSON.parse(doGetUserData());

  const unlockCallbackAction = function(yourPassword){
    let user = {username: userdata.username, password: yourPassword};
		doCallLoginApi(user).then((response) => {
			if (response.success == true) {
        let welcomeMsg = 'Welcome back ' + userdata.username;
        $.notify(welcomeMsg, "success");
        resetScreen();
        doAutoAcceptCase();
      } else {
        $.notify("รหัสผ่านของคุณไม่ถูกต้อง", "error");
      }
    });
  }

  if (userdata.userprofiles[0].Profile.lockState.passwordUnlock == 1) {
    $(modalBox).empty();
    let passwordBox = doCreatePasswordUnlockScreen( unlockCallbackAction );
    $(modalBox).append($(passwordBox));
    $(modalBox).css({ height: 'auto'});
    $(passwordBox).find('#YourPassword').focus();
  } else {
    resetScreen();
    doAutoAcceptCase();
  }
}

function onLockScreenTrigger() {
  let lockScreenBox = $('<div style="width: 100%; text-align: center;" tabindex="0"></div>');
  $(lockScreenBox).append('<h2>Press any key to unlock</h2>');
  //$(lockScreenBox).append('<h3>You can Unlock by Click mouse or press any key.</h3>');
  let lockScreenBoxStyle = { 'background-color': '#fefefe', 'margin': '21% auto', 'padding': '10px', 'border': '2px solid #888', 'width': '620px', 'height': 'auot' };
  $(lockScreenBox).css(lockScreenBoxStyle);
  $('#quickreply').empty().append($(lockScreenBox));
  //$('#quickreply').attr('tabindex', 0);
  $('#quickreply').focus();
  $('#quickreply').css(modalLockScreenStyle);
  util.doSetScreenState(1);
  /*
  $('#quickreply').on('mousemove', (evt)=>{
    $('#quickreply').attr('onmousemove', '').unbind("mousemove");
    unlockAction(lockScreenBox);
  });
  */
  $('#quickreply').on('click', (evt)=>{
    $('#quickreply').attr('onclick', '').unbind("click");
    unlockAction(lockScreenBox);
  });
  $('#quickreply').on('keypress', (evt)=>{
    $('#quickreply').attr('onkeypress', '').unbind("keypress");
    unlockAction(lockScreenBox);
  });
}

function onUnLockScreenTrigger(evt){
  resetScreen();
}

function onAutoLogoutTrigger(evt){
  doLoadLogin();
}

function onUpdateUserProfileTrigger(evt){
  let newProfile = evt.detail.data.Profile;
  let newReadyState = newProfile.readyState;

  const userdata = JSON.parse(localStorage.getItem('userdata'));
  userdata.userprofiles[0].Profile.readyState = newReadyState;
  userdata.userprofiles[0].Profile.readyBy = 'bot';
  localStorage.setItem('userdata', JSON.stringify(userdata));

  let readyLogic = undefined;
  if (newReadyState == 1) {
    readyLogic = true;
  } else {
    readyLogic = false;
  }
  $('#app').find('#ReadyState').find('input[type="checkbox"]').prop('checked', readyLogic);
}

function doSetupAutoReadyAfterLogin(){
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  const autoReady = userdata.userprofiles[0].Profile.activeState.autoReady;
  if (autoReady == 1){
    let readyState = userdata.userprofiles[0].Profile.readyState;
    if (readyState == 0){
      userdata.userprofiles[0].Profile.readyState = 1;
      userdata.userprofiles[0].Profile.readyBy = 'auto';
  		localStorage.setItem('userdata', JSON.stringify(userdata));
  		let rqParams = {data: userdata.userprofiles[0].Profile, userId: userdata.id};
  		let profileRes = common.doCallApi('/api/userprofile/update', rqParams);
    }
  }
}

function doAutoAcceptCase(){
  const userdata = JSON.parse(localStorage.getItem('userdata'));
  const autoAcc = userdata.userprofiles[0].Profile.activeState.autoAcc;
  $('.case-counter').hide();
  //console.log(autoAcc);
  if (autoAcc == 1){
    newcase.doCallMyNewCase().then(async (myNewCase)=>{
      console.log(myNewCase);
      if (myNewCase.status.code == 200){
        let caseLists = myNewCase.Records;
        if (caseLists.length > 0){
          for (let i=0; i < caseLists.length; i++) {
            let caseItem = caseLists[i];
            await common.doUpdateCaseStatus(caseItem.id, 2, 'Radiologist Accept case by Auto Acc.');
          }
          $('#AcceptedCaseCmd').click();
        } else {
          doLoadDefualtPage();
        }
      }
    });
  } else {
    doLoadDefualtPage();
  }
}

function doGetToken(){
	return localStorage.getItem('token');
}

function doGetUserData(){
  return localStorage.getItem('userdata');
}

function doGetUserConfigs(){
  return localStorage.getItem('userconfigs');
}

function doGetUserItemPerPage(){
	let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
  return userDefualtSetting.itemperpage;
}

function doGetWsm(){
	return wsm;
}

module.exports = {
  doGetToken,
  doGetUserData,
  doGetUserConfigs,
	doGetUserItemPerPage,
	doGetWsm
}
