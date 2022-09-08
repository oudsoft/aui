/*profilelibV2.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);
	const changepwddlg = require('./changepwddlg.js')($);

  const profileTitle = 'ตั้งค่าการแจ้งเตือนและรับเคส';

  const doCreateProfileTitlePage = function(){
    let profileTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/setting-icon-2.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(profileTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + profileTitle + '</h3></div>');
    $(titleText).appendTo($(profileTitleBox));
    return $(profileTitleBox);
  }

  const doCreateBlankTable = function(){
    let blankTable = $('<table cellspacing="0" cellpadding="0" border="1" width="100%"></table>');
    let headerRow = $('<tr></tr>');
    let activeRow = $('<tr></tr>');
    let lockRow = $('<tr></tr>');
    let offlineRow = $('<tr></tr>');
    let commandRow = $('<tr></tr>');

    let activeNameCell = $('<td><b>Active</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let activeControlCell = $('<td id="ActiveControl"></td>');

    let lockNameCell = $('<td><b>Lock</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let lockControlCell = $('<td id="LockControl"></td>');

    let offlineNameCell = $('<td><b>Offline</b></td>').css({'padding': '5px', 'vertical-align': 'middle'});
    let offlineControlCell = $('<td id="OfflineControl"></td>');

    let commandCell = $('<td colspan="2" id="ProfilePageCmd" align="center"></td>');

    $(headerRow).append($('<td class="header-cell" width="15%">สถานะ</td>'));
    $(headerRow).append($('<td class="header-cell" width="*">ตั้งค่า</td>'));

    $(activeRow).append($(activeNameCell)).append($(activeControlCell));
    $(lockRow).append($(lockNameCell)).append($(lockControlCell));
    $(offlineRow).append($(offlineNameCell)).append($(offlineControlCell));
    $(commandRow).append($(commandCell));
    return $(blankTable).append(headerRow).append($(activeRow)).append($(lockRow)).append($(offlineRow)).append($(commandRow));
  }

	const onActionCommonHandle = function(evt) {
		console.log('one');
	}

	const offActionCommonHandle = function(evt) {
		console.log('two');
	}

	const onActiveHandle = function(evt){
		let onHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#ActiveControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).show();
		var optionValue = $(manAutoOptionBox).find("input[name=ManAutoActiveGroup]:checked").val();
		if (optionValue == 1){
			//Hide Control Option
			let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).hide();
		} else if (optionValue == 2){
			//Show Control Option
			let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).show();
		}
	}

	const offActiveHandle = function(evt){
		let offHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#ActiveControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).hide();
		manSelectActiveHandle(evt);
	}

	const onLockHandle = function(evt){
		let onHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#LockControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).show();
		var optionValue = $(manAutoOptionBox).find("input[name=ManAutoLockGroup]:checked").val();
		if (optionValue == 1){
			//Hide Control Option
			let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).hide();
		} else if (optionValue == 2){
			//Show Control Option
			let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).show();
		}
	}

	const offLockHandle = function(evt){
		let offHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#LockControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).hide();
		manSelectLockHandle(evt);
	}

	const onOfflineHandle = function(evt){
		let onHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#OfflineControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).show();
		var optionValue = $(manAutoOptionBox).find("input[name=ManAutoOfflineGroup]:checked").val();
		if (optionValue == 1){
			//Hide Control Option
			let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).hide();
		} else if (optionValue == 2){
			//Show Control Option
			let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
			$(phoneCallOptionBox).show();
		}
	}

	const offOfflineHandle = function(evt){
		let offHandle = $(evt.currentTarget);
		let manAutoOptionBox = $('#OfflineControl').find('#ManAutoOptionBox');
		$(manAutoOptionBox).hide();
		manSelectOfflineHandle(evt);
	}

	const manSelectActiveHandle = function(evt){
		let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).hide();
	}

	const autoSelectActiveHandle = function(evt){
		let phoneCallOptionBox = $('#ActiveControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).show();
	}

	const manSelectLockHandle = function(evt){
		let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).hide();
	}

	const autoSelectLockHandle = function(evt){
		let phoneCallOptionBox = $('#LockControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).show();
	}

	const manSelectOfflineHandle = function(evt){
		let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).hide();
	}

	const autoSelectOfflineHandle = function(evt){
		let phoneCallOptionBox = $('#OfflineControl').find('#PhoneCallOptionBox');
		$(phoneCallOptionBox).show();
	}

	const changePasswordCmdClick = function(evt){
		changepwddlg.doCreateChangePwdDlg();
	}

	const switchOptions = {onActionCallback: onActionCommonHandle, offActionCallback: offActionCommonHandle};
	const activeActions = {onActionCallback: onActiveHandle, offActionCallback: offActiveHandle};
	const lockActions = {onActionCallback: onLockHandle, offActionCallback: offLockHandle};
	const offlineActions = {onActionCallback: onOfflineHandle, offActionCallback: offOfflineHandle};
	const switchStyle = {'position': 'relative', 'top': '5px', 'left': '20px', 'display': 'inline-block'};
	const switchLabelStyle = {'position': 'relative', 'top': '10px', 'margin-left': '5px'};
	const radioLabelStyle = {'position': 'relative', 'top': '-1px', 'margin-left': '15px'};
	const radioBtnStyle = {'transform': 'scale(2.5)'};

	const doCreateManAutoRadioBox = function(groupName, manCallback, autoCallback){
		let wrapperBox = $('<div id="ManAutoOptionBox" style="position: relative; display: inline-block; margin-left: 30px; top: 10px;"></div>');
		let manOptionBtn = $('<input type="radio" id="ManOption" value="1" checked="true"/>').prop('name', groupName).css(radioBtnStyle);
		let autoOptionBtn = $('<input type="radio" id="AutoOption" value="2"/>').prop('name', groupName).css(radioBtnStyle);
		$(manOptionBtn).on('click', (evt)=>{
			manCallback(evt);
		});
		$(autoOptionBtn).on('click', (evt)=>{
			autoCallback(evt);
		});
		$(wrapperBox).append($(manOptionBtn));
		$(wrapperBox).append($('<label>Manual (คน)</label>').css(radioLabelStyle));
		$(wrapperBox).append($(autoOptionBtn).css({'margin-left': '20px'}));
		$(wrapperBox).append($('<label>Auto</label>').css(radioLabelStyle));
		return $(wrapperBox);
	}

	const doCreatePhoneCallOptionControlBox = function(options){
		let wrapperBox = $('<div id="PhoneCallOptionBox" style="position: relative; display: none; top: 10px; padding: 10px; border: 2px solid black;"></div>');
		let option1HRElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ ไม่เกิน 1 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option4HRElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ 1 - 4 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option24HRLElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ ไม่เกิน 24 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option24HRUElem = $('<div style="line-height: 40px;"></div>').append($('<span>สำหรับเคส เวลาตอบรับ เกิน 24 ชม. หากไม่ได้ตอบรับ โทรเมื่อเวลาตอบรับเหลือน้อยกว่า</span>'));
		let option1HRInput = $('<input type="number" id="Option1HRInput" style="width: 60px;">');
		$(option1HRInput).val(options.optionCaseControl.case1H? options.optionCaseControl.case1H:0);
		let option4HRInput = $('<input type="number" id="Option4HRInput" style="width: 60px;">');
		$(option4HRInput).val(options.optionCaseControl.case4H? options.optionCaseControl.case4H:0);
		let option24HRLInput = $('<input type="number" id="Option24HRLInput" style="width: 60px;">');
		$(option24HRLInput).val(options.optionCaseControl.case24HL? options.optionCaseControl.case24HL:0);
		let option24HRUInput = $('<input type="number" id="Option24HRUInput" style="width: 60px;">');
		$(option24HRUInput).val(options.optionCaseControl.case24HU? options.optionCaseControl.case24HU:0);
		$(option1HRElem).append($(option1HRInput).css({'margin-left': '10px'}));
		$(option1HRElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		$(option4HRElem).append($(option4HRInput).css({'margin-left': '10px'}));
		$(option4HRElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		$(option24HRLElem).append($(option24HRLInput).css({'margin-left': '10px'}));
		$(option24HRLElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		$(option24HRUElem).append($(option24HRUInput).css({'margin-left': '10px'}));
		$(option24HRUElem).append($('<span>นาที</span>').css({'margin-left': '10px'}));
		return $(wrapperBox).append($(option1HRElem)).append($(option4HRElem)).append($(option24HRLElem)).append($(option24HRUElem));
	}

	const doCreateSwitchBox = function(box, switchOptions, defaultValue){
		let switchBox = $(box).readystate(switchOptions);
    if (defaultValue == 1) {
      switchBox.onAction();
    } else {
      switchBox.offAction();
    }
		return switchBox;
	}

	const doCreateWebNotifyContolSwitch = function(initValue){
		let switchLabel = $('<label>แจ้งเตือนทาง Web Site</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="WebNotifySwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreateLineBotNotifyContolSwitch = function(initValue){
		let switchLabel = $('<label>แจ้งเตือนทาง Line</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="LineBotNotifySwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreatePhoneCallActiveContolSwitch = function(initValue, options){
		let switchLabel = $('<label>แจ้งเตือนทาง Call</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="PhoneCallSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, activeActions, initValue);
		$(switchWrapper).append($(switchBox));
		let manAutoToggle = doCreateManAutoRadioBox('ManAutoActiveGroup', manSelectActiveHandle, autoSelectActiveHandle);
		let phoneCallOptionControlBox = doCreatePhoneCallOptionControlBox(options);
		$(switchWrapper).append($(manAutoToggle)).append($(phoneCallOptionControlBox));
		if (options.manAutoOption == 1){
			manAutoToggle.find('#ManOption').prop('checked', true);
			phoneCallOptionControlBox.hide();
		} else if (options.manAutoOption == 2){
			manAutoToggle.find('#AutoOption').prop('checked', true);
			phoneCallOptionControlBox.show();
		}
		return $(switchWrapper);
	}

	const doCreateAutoAcceptSwitch = function(initValue){
		let switchLabel = $('<label>รับเคสอัตโนมัติ</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="AutoAcceptSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreateAutoOnReadySwitch = function(initValue){
		let switchLabel = $('<label>เปลี่ยนสถานะเป็นรับงานเมื่อฉัน Login</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="AutoOnReadySwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));
		return $(switchWrapper);
	}

	const doCreatePhoneCallLockContolSwitch = function(initValue, options){
		let switchLabel = $('<label>แจ้งเตือนทาง Call</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="PhoneCallSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, lockActions, initValue);
		$(switchWrapper).append($(switchBox));
		let manAutoToggle = doCreateManAutoRadioBox('ManAutoLockGroup', manSelectLockHandle, autoSelectLockHandle);
		let phoneCallOptionControlBox = doCreatePhoneCallOptionControlBox(options);
		$(switchWrapper).append($(manAutoToggle)).append($(phoneCallOptionControlBox));
		if (options.manAutoOption == 1){
			manAutoToggle.find('#ManOption').prop('checked', true);
			phoneCallOptionControlBox.hide();
		} else if (options.manAutoOption == 2){
			manAutoToggle.find('#AutoOption').prop('checked', true);
			phoneCallOptionControlBox.show();
		}
		return $(switchWrapper);
	}

	const doCreateAutoLockScreenControlBox = function(initValue){
		let wrapperBox = $('<div id="AutoLockScreenControlBox" style="position: relative; display: block; top: 10px; padding: 10px;"></div>');
		let controlElem = $('<div style="line-height: 40px;"></div>').append($('<span>เข้าสู่ Mode Lock เมื่อไม่ได้ใช้งาน</span>'));
		let controlInput = $('<input type="number" id="AutoLockScreenMinuteInput" style="width: 60px;">');
		$(controlInput).val(initValue);
		$(controlElem).append($(controlInput).css({'margin-left': '10px'}));
		$(controlElem).append($('<span>นาที (สูงสุด 60)</span>').css({'margin-left': '10px'}));
		return $(wrapperBox).append($(controlElem));
	}

	const doCreateUnLockScreenControlBox = function(initValue, callback){
		let switchLabel = $('<label>ใช้ Password ในการ Unlock</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="UnlockOptionSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, switchOptions, initValue);
		$(switchWrapper).append($(switchBox));

		let changePasswordCmd = $('<a href="#">เปลี่ยน Password</a>');
		$(changePasswordCmd).on('click', (evt)=>{
			callback(evt);
		});
		$(switchWrapper).append($(changePasswordCmd).css({'position': 'relative', 'display': 'inline-block', 'margin-left': '50px', 'margin-top': '10px'}));
		return $(switchWrapper);
	}

	const doCreatePhoneCallOfflineContolSwitch = function(initValue, options){
		let switchLabel = $('<label>แจ้งเตือนทาง Call</label>').css(switchLabelStyle);
		let switchWrapper = $('<div style="position: relative; padding: 4px; margin-top: 10px;"></div>');
		$(switchWrapper).append($(switchLabel));
		let switchBox = $('<div id="PhoneCallSwitchBox"></div>').css(switchStyle);

		doCreateSwitchBox(switchBox, offlineActions, initValue);
		$(switchWrapper).append($(switchBox));
		let manAutoToggle = doCreateManAutoRadioBox('ManAutoOfflineGroup', manSelectOfflineHandle, autoSelectOfflineHandle);
		let phoneCallOptionControlBox = doCreatePhoneCallOptionControlBox(options);
		$(switchWrapper).append($(manAutoToggle)).append($(phoneCallOptionControlBox));
		if (options.manAutoOption == 1){
			manAutoToggle.find('#ManOption').prop('checked', true);
			phoneCallOptionControlBox.hide();
		} else if (options.manAutoOption == 2){
			manAutoToggle.find('#AutoOption').prop('checked', true);
			phoneCallOptionControlBox.show();
		}
		return $(switchWrapper);
	}

	const doCreateAutoLogoutControlBox = function(initValue){
		let wrapperBox = $('<div id="AutoLogoutControlBox" style="position: relative; display: block; top: 10px; padding: 10px;"></div>');
		let controlElem = $('<div style="line-height: 40px;"></div>').append($('<span>Logout เมื่อไม่ได้ใช้งาน</span>'));
		let controlInput = $('<input type="number" id="AutoLogoutMinuteInput" style="width: 60px;">');
		$(controlInput).val(initValue);
		$(controlElem).append($(controlInput).css({'margin-left': '10px'}));
		$(controlElem).append($('<span>นาที (ต้องมากว่า Lock Screen)</span>').css({'margin-left': '10px'}));
		return $(wrapperBox).append($(controlElem));
	}

  const doCreateProfilePage = function(){
    return new Promise(async function(resolve, reject) {
      $('body').loading('start');
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let myProfileRes = await doCallMyProfile(userdata.id);
			if (myProfileRes.status.code == 200){
				let myProfile = undefined;
	      if ((myProfileRes) && (myProfileRes.Record.length > 0)) {
	        myProfile = myProfileRes.Record[0];
	      } else {
					let getDefaultProfileUrl = '/api/userprofile/default';
					let defaultRes = await common.doGetApi(getDefaultProfileUrl, {});
					let firstProfile = {Profile: defaultRes.default};
	        myProfile = firstProfile;
	      }
				console.log(myProfile);
				let initValue = 1;

	      let myProfilePage = $('<div style="width: 100%;"></div>');

	      let profileTable = doCreateBlankTable();

				let webNotifyBox = doCreateWebNotifyContolSwitch(myProfile.Profile.activeState.webNotify);
				profileTable.find('#ActiveControl').append($(webNotifyBox));

				let linebotNotifyActiveBox = doCreateLineBotNotifyContolSwitch(myProfile.Profile.activeState.lineNotify);
				profileTable.find('#ActiveControl').append($(linebotNotifyActiveBox));

				let phoneCallActiveBox = doCreatePhoneCallActiveContolSwitch(myProfile.Profile.activeState.phoneCall, myProfile.Profile.activeState.phoneCallOptions);
				let manAutoOptionAciveBox = $(phoneCallActiveBox).find('#ManAutoOptionBox');
				console.log(myProfile.Profile.activeState.phoneCall);
				if (myProfile.Profile.activeState.phoneCall == 0){
					$(manAutoOptionAciveBox).hide();
				} else if (myProfile.Profile.activeState.phoneCall == 1){
					$(manAutoOptionAciveBox).show();
				}
				profileTable.find('#ActiveControl').append($(phoneCallActiveBox));

				let autoAcceptOptionBox = doCreateAutoAcceptSwitch(myProfile.Profile.activeState.autoAcc);
				profileTable.find('#ActiveControl').append($(autoAcceptOptionBox));

				let autoOnReadyOptionBox = doCreateAutoOnReadySwitch(myProfile.Profile.activeState.autoReady);
				profileTable.find('#ActiveControl').append($(autoOnReadyOptionBox));

				let linebotNotifyLockBox = doCreateLineBotNotifyContolSwitch(myProfile.Profile.lockState.lineNotify);
				profileTable.find('#LockControl').append($(linebotNotifyLockBox));

				let phoneCallLockBox = doCreatePhoneCallLockContolSwitch(myProfile.Profile.lockState.phoneCall, myProfile.Profile.lockState.phoneCallOptions);
				let manAutoOptionLockBox = $(phoneCallLockBox).find('#ManAutoOptionBox');
				if (myProfile.Profile.lockState.phoneCall == 0){
					$(manAutoOptionLockBox).hide();
				} else if (myProfile.Profile.lockState.phoneCall == 1){
					$(manAutoOptionLockBox).show();
				}
				profileTable.find('#LockControl').append($(phoneCallLockBox));

				let autoLockSreenBox = doCreateAutoLockScreenControlBox(myProfile.Profile.lockState.autoLockScreen);
				profileTable.find('#LockControl').append($(autoLockSreenBox));

				let unlockScreenControlBox = doCreateUnLockScreenControlBox(myProfile.Profile.lockState.passwordUnlock, changePasswordCmdClick);
				profileTable.find('#LockControl').append($(unlockScreenControlBox));

				let linebotNotifyOfflineBox = doCreateLineBotNotifyContolSwitch(myProfile.Profile.offlineState.lineNotify);
				profileTable.find('#OfflineControl').append($(linebotNotifyOfflineBox));

				let phoneCallOfflineBox = doCreatePhoneCallOfflineContolSwitch(myProfile.Profile.offlineState.phoneCall, myProfile.Profile.offlineState.phoneCallOptions);
				let manAutoOptionOfflineBox = $(phoneCallOfflineBox).find('#ManAutoOptionBox');
				if (myProfile.Profile.offlineState.phoneCall == 0){
					$(manAutoOptionOfflineBox).hide();
				} else if (myProfile.Profile.offlineState.phoneCall == 1){
					$(manAutoOptionOfflineBox).show();
				}
				profileTable.find('#OfflineControl').append($(phoneCallOfflineBox));

				let autoLogoutControlBox = doCreateAutoLogoutControlBox(myProfile.Profile.offlineState.autoLogout);
				profileTable.find('#OfflineControl').append($(autoLogoutControlBox));

				let cmdBar = doCreatePageCmd(myProfilePage, (ob)=>{doCallSaveMyProfile(ob);});
				profileTable.find('#ProfilePageCmd').append($(cmdBar));

	      $(myProfilePage).append($(profileTable));
	      resolve($(myProfilePage));
	      $('body').loading('stop');
			} else if (myProfileRes.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyProfile';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

	const doCreatePageCmd = function(pageHandle, saveCallBack){
    let cmdBar = $('<div style="width: 100%; margin-top: 5px; text-align: center;"></div>');
    let saveCmd = $('<input type="button" value=" Save " class="action-btn"/>');
    let backCmd = $('<input type="button" value=" Back " class="none-action-btn"/>');
    $(saveCmd).appendTo($(cmdBar));
    $(cmdBar).append('&nbsp;&nbsp;');
    $(backCmd).appendTo($(cmdBar));
    $(backCmd).on('click', (evt)=>{$('#AcceptedCaseCmd').click()});
    $(saveCmd).on('click', (evt)=>{

			let activeWebNotify = pageHandle.find('#ActiveControl').find('#WebNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let activeLineNotify = pageHandle.find('#ActiveControl').find('#LineBotNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let activePhoneCall = pageHandle.find('#ActiveControl').find('#PhoneCallSwitchBox').find('input[type=checkbox]').prop('checked');
			let activeManAutoOption = pageHandle.find('#ActiveControl').find('input[name="ManAutoActiveGroup"]:checked').val();
			let activePhoneCall1H = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option1HRInput').val();
			let activePhoneCall4H = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option4HRInput').val();
			let activePhoneCall24HL = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option24HRLInput').val();
			let activePhoneCall24HU = pageHandle.find('#ActiveControl').find('#PhoneCallOptionBox').find('#Option24HRUInput').val();
			let activeAutoAcc = pageHandle.find('#ActiveControl').find('#AutoAcceptSwitchBox').find('input[type=checkbox]').prop('checked');
			let activeAutoReady = pageHandle.find('#ActiveControl').find('#AutoOnReadySwitchBox').find('input[type=checkbox]').prop('checked');

			let lockLineNotify = pageHandle.find('#LockControl').find('#LineBotNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let lockPhoneCall = pageHandle.find('#LockControl').find('#PhoneCallSwitchBox').find('input[type=checkbox]').prop('checked');
			let lockManAutoOption = pageHandle.find('#LockControl').find('input[name="ManAutoLockGroup"]:checked').val();
			let lockPhoneCall1H = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option1HRInput').val();
			let lockPhoneCall4H = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option4HRInput').val();
			let lockPhoneCall24HL = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option24HRLInput').val();
			let lockPhoneCall24HU = pageHandle.find('#LockControl').find('#PhoneCallOptionBox').find('#Option24HRUInput').val();
			let lockAutoLockScreenMinut = pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').val();
			let lockPasswordUnlock = pageHandle.find('#LockControl').find('#UnlockOptionSwitchBox').find('input[type=checkbox]').prop('checked');

			let offlineLineNotify = pageHandle.find('#OfflineControl').find('#LineBotNotifySwitchBox').find('input[type=checkbox]').prop('checked');
			let offlinePhoneCall = pageHandle.find('#OfflineControl').find('#PhoneCallSwitchBox').find('input[type=checkbox]').prop('checked');
			let offlineManAutoOption = pageHandle.find('#OfflineControl').find('input[name="ManAutoOfflineGroup"]:checked').val();
			let offlinePhoneCall1H = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option1HRInput').val();
			let offlinePhoneCall4H = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option4HRInput').val();
			let offlinePhoneCall24HL = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option24HRLInput').val();
			let offlinePhoneCall24HU = pageHandle.find('#OfflineControl').find('#PhoneCallOptionBox').find('#Option24HRUInput').val();
			let offlineAutoLogoutMinut = pageHandle.find('#OfflineControl').find('#AutoLogoutControlBox').find('#AutoLogoutMinuteInput').val();

			let verifyProfile1 = ((lockAutoLockScreenMinut > -1) && (lockAutoLockScreenMinut < 61));
			let verifyProfile2 = ((offlineAutoLogoutMinut <= 0) || ((offlineAutoLogoutMinut > 0) && (offlineAutoLogoutMinut > lockAutoLockScreenMinut)));

			if (verifyProfile1) {
				pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '');
				if (verifyProfile2) {
					pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '');
					pageHandle.find('#OfflineControl').find('#AutoLogoutControlBox').find('#AutoLogoutMinuteInput').css('border', '');
					let profileValue = {
						activeState: {
							webNotify: activeWebNotify? 1:0,
							lineNotify: activeLineNotify? 1:0,
							phoneCall: activePhoneCall? 1:0,
							phoneCallOptions: {
								manAutoOption: activeManAutoOption,
								optionCaseControl: {
									case1H: activePhoneCall1H? activePhoneCall1H:0,
									case4H: activePhoneCall4H? activePhoneCall4H:0,
									case24HL: activePhoneCall24HL? activePhoneCall24HL:0,
									case24HU: activePhoneCall24HU? activePhoneCall24HU:0,
								}
							},
							autoAcc: activeAutoAcc? 1:0,
							autoReady: activeAutoReady? 1:0
						},
						lockState: {
							lineNotify: lockLineNotify? 1:0,
							phoneCall: lockPhoneCall? 1:0,
							phoneCallOptions: {
								manAutoOption: lockManAutoOption,
								optionCaseControl: {
									case1H: lockPhoneCall1H? lockPhoneCall1H:0,
									case4H: lockPhoneCall4H? lockPhoneCall4H:0,
									case24HL: lockPhoneCall24HL? lockPhoneCall24HL:0,
									case24HU: lockPhoneCall24HU? lockPhoneCall24HU:0,
								}
							},
							autoLockScreen: lockAutoLockScreenMinut,
							passwordUnlock: lockPasswordUnlock? 1:0
						},
						offlineState: {
							lineNotify: offlineLineNotify? 1:0,
							phoneCall: offlinePhoneCall? 1:0,
							phoneCallOptions: {
								manAutoOption: offlineManAutoOption,
								optionCaseControl: {
									case1H: offlinePhoneCall1H? offlinePhoneCall1H:0,
									case4H: offlinePhoneCall4H? offlinePhoneCall4H:0,
									case24HL: offlinePhoneCall24HL? offlinePhoneCall24HL:0,
									case24HU: offlinePhoneCall24HU? offlinePhoneCall24HU:0,
								}
							},
							autoLogout: offlineAutoLogoutMinut
						}
					};
					console.log(profileValue);
					saveCallBack(profileValue);
				} else {
					pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '1px solid red');
					pageHandle.find('#OfflineControl').find('#AutoLogoutControlBox').find('#AutoLogoutMinuteInput').css('border', '1px solid red');
					let radAlertMsg = $('<div></div>');
					$(radAlertMsg).append($('<p>กรณีมีการตั้งค่า Logout อัตโนมัติ</p>'));
					$(radAlertMsg).append($('<p>ค่าจำนวนนาทีของ Logout อัตโนมัติ ต้องมากกว่า จำนวนนาทีของล็อคจอภาพ</p>'));
					const radalertoption = {
						title: 'ตั้งค่าไม่ถูกต้อง',
						msg: $(radAlertMsg),
						width: '420px',
						onOk: function(evt) {
							radAlertBox.closeAlert();
						}
					}
					let radAlertBox = $('body').radalert(radalertoption);
				}
			} else {
				pageHandle.find('#LockControl').find('#AutoLockScreenControlBox').find('#AutoLockScreenMinuteInput').css('border', '1px solid red');
				let radAlertMsg = $('<div></div>');
				$(radAlertMsg).append($('<p>กรณีมีการตั้งค่า เข้าสู่ Mode Lock เมื่อไม่ได้ใช้งาน</p>'));
				$(radAlertMsg).append($('<p>ด้วยค่าจำนวนนาที ระหว่าง 0 - 60</p>'));
				const radalertoption = {
					title: 'ตั้งค่าไม่ถูกต้อง',
					msg: $(radAlertMsg),
					width: '420px',
					onOk: function(evt) {
						radAlertBox.closeAlert();
					}
				}
				let radAlertBox = $('body').radalert(radalertoption);
			}
		});
    return $(cmdBar);
  }

	const doCallSaveMyProfile = function(profileData){
    return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let radioId = userdata.id;
			let rqParams = undefined;
			let apiUrl = undefined;
      let readyState = undefined;
      let myProfileRes = await doCallMyProfile(radioId);
      if (myProfileRes.Record.length > 0) {
				if (myProfileRes.Record[0].Profile.readyState){
        	readyState = myProfileRes.Record[0].Profile.readyState;
				} else {
					readyState = common.defaultProfile.readyState;
				}
        apiUrl = '/api/userprofile/update';
        rqParams = {data: profileData, userId: radioId};
      } else {
        readyState = common.defaultProfile.readyState;
        apiUrl = '/api/userprofile/add';
        rqParams = {data: profileData, userId: radioId};
      }
			rqParams.data.readyState = readyState;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        if (response.status.code == 200) {
					userdata.userprofiles[0].Profile = profileData;
					userdata.userprofiles[0].Profile.readyState = readyState;
					console.log(userdata.userprofiles[0].Profile);
          localStorage.setItem('userdata', JSON.stringify(userdata));
          $.notify("บันทึกการคั้งค่าสำเร็จ", "success");
        } else {
          $.notify("บันทึกการคั้งค่าไม่สำเร็จ", "error");
        }
        $('body').loading('stop');
        resolve(response);
			} catch(e) {
        $.notify("มีความผิดพลาดขณะบันทึกการคั้งค่า", "error");
        $('body').loading('stop');
	      reject(e);
    	}
		});
	}

	const doCallMyProfile = function(radioId){
    return new Promise(async function(resolve, reject) {
			let rqParams = {};
			let apiUrl = '/api/userprofile/select/' + radioId;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  return {
    doCreateProfileTitlePage,
    doCreateProfilePage,
    doCallMyProfile,
	}
}
