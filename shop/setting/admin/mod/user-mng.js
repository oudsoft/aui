module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);

	const userTableFields = [
		{fieldName: 'username', displayName: 'Username', width: '15%', align: 'left', inputSize: '30', verify: false},
		{fieldName: 'id', displayName: 'UserId', width: '5%', align: 'center', inputSize: '30', verify: false},
	];
  const userinfoTableFields = [
		{fieldName: 'User_NameEN', displayName: 'ชื่อ (ภาษาอังกฤษ)', width: '12%', align: 'left', inputSize: '30', verify: false, showHeader: false},
		{fieldName: 'User_LastNameEN', displayName: 'นามสกุล (ภาษาอังกฤษ)', width: '12%', align: 'left', inputSize: '30', verify: false, showHeader: false},
    {fieldName: 'User_NameTH', displayName: 'ชื่อ (ภาษาไทย)', width: '15%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'User_LastNameTH', displayName: 'นามสกุล (ภาษาไทย)', width: '15%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'User_Phone', displayName: 'โทรศัพท์', width: '10%', align: 'left', inputSize: '20', verify: false, showHeader: true},
		{fieldName: 'User_Email', displayName: 'อีเมล์', width: '10%', align: 'left', inputSize: '30', verify: false, showHeader: false},
		{fieldName: 'User_LineID', displayName: 'Line ID', width: '10%', align: 'center', inputSize: '30', verify: false, showHeader: false},
	];
  const usertypeTableFields = [
		{fieldName: 'UserType_Name', displayName: 'ประเภทผู้ใช้งาน', width: '15%', align: 'left', inputSize: '30', verify: true},
	];

  const doShowUserItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
      let usertypeRes = await common.doCallApi('/api/shop/usertype/options', {});
      let usertypes = usertypeRes.Options;
      localStorage.setItem('usertypes', JSON.stringify(usertypes));
      $(workAreaBox).empty();
      let userRes = await common.doCallApi('/api/shop/user/list/by/shop/' + shopData.id, {});
			let userItems = userRes.Records;

      let titlePageBox = $('<div style="padding: 4px;">รายการผู้ใช้งานในร้านค้า</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			$(workAreaBox).append($(titlePageBox));
			let newUserCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
			let newUserCmd = $('<input type="button" value=" + New User " class="action-btn"/>');
			$(newUserCmd).on('click', (evt)=>{
				doOpenNewUserForm(shopData, workAreaBox);
			});
			$(newUserCmdBox).append($(newUserCmd))
			$(workAreaBox).append($(newUserCmdBox));

			let userTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let headerRow = $('<tr></tr>');
			$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
			for (let i=0; i < userTableFields.length; i++) {
				$(headerRow).append($('<td width="' + userTableFields[i].width + '" align="center"><b>' + userTableFields[i].displayName + '</b></td>'));
			}
      for (let i=0; i < userinfoTableFields.length; i++) {
        if (userinfoTableFields[i].showHeader) {
          $(headerRow).append($('<td width="' + userinfoTableFields[i].width + '" align="center"><b>' + userinfoTableFields[i].displayName + '</b></td>'));
        }
			}
      for (let i=0; i < usertypeTableFields.length; i++) {
				$(headerRow).append($('<td width="' + usertypeTableFields[i].width + '" align="center"><b>' + usertypeTableFields[i].displayName + '</b></td>'));
			}

			$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
			$(userTable).append($(headerRow));

      for (let x=0; x < userItems.length; x++) {
				let itemRow = $('<tr></tr>');
				$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
				let item = userItems[x];
				for (let i=0; i < userTableFields.length; i++) {
					let field = $('<td align="' + userTableFields[i].align + '"></td>');
          $(field).text(item[userTableFields[i].fieldName]);
          $(itemRow).append($(field));
        }
        for (let i=0; i < userinfoTableFields.length; i++) {
          if (userinfoTableFields[i].showHeader) {
  					let field = $('<td align="' + userinfoTableFields[i].align + '"></td>');
            $(field).text(item.userinfo[userinfoTableFields[i].fieldName]);
            $(itemRow).append($(field));
          }
        }
        for (let i=0; i < usertypeTableFields.length; i++) {
					let field = $('<td align="' + usertypeTableFields[i].align + '"></td>');
          $(field).text(item.usertype[usertypeTableFields[i].fieldName]);
          $(itemRow).append($(field));
        }

        let commandCell = $('<td align="center"></td>');

				let editUserCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editUserCmd).on('click', (evt)=>{
					doOpenEditUserForm(shopData, workAreaBox, item);
				});
				let resetPasswordCmd = $('<input type="button" value=" Reset Passord " class="action-btn"/>').css({'margin-left': '8px'});
				$(resetPasswordCmd).on('click', (evt)=>{
					doResetPassword(shopData, workAreaBox, item.id);
				});
				let deleteUserCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteUserCmd).on('click', (evt)=>{
					doDeleteUser(shopData, workAreaBox, item.id);
				});

				$(commandCell).append($(editUserCmd));
				$(commandCell).append($(resetPasswordCmd));
				$(commandCell).append($(deleteUserCmd));
        $(itemRow).append($(commandCell));
				$(userTable).append($(itemRow));
      }
      $(workAreaBox).append($(userTable));
      resolve();
    });
  }

	const doCreateVerifyUsernameForm = function(){
		let usernameFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">Username <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let usernameValue = $('<input type="text" id="Username" size="30"/>');
		$(inputField).append($(usernameValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(usernameFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let passwordValue = $('<input type="password" id="Password" size="30"/>');
		$(inputField).append($(passwordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(usernameFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">Retry Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let retrypasswordValue = $('<input type="password" id="RetryPassword" size="30"/>');
		$(inputField).append($(retrypasswordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(usernameFormTable).append($(fieldRow));

		return $(usernameFormTable);
	}

	const doCreateResetPasswordForm = function(){
		let resetPasswordFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let passwordValue = $('<input type="password" id="Password" size="30"/>');
		$(inputField).append($(passwordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(resetPasswordFormTable).append($(fieldRow));

		fieldRow = $('<tr></tr>');
		labelField = $('<td width="40%" align="left">Retry Password <span style="color: red;">*</span></td>').css({'padding': '5px'});
		inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let retrypasswordValue = $('<input type="password" id="RetryPassword" size="30"/>');
		$(inputField).append($(retrypasswordValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(resetPasswordFormTable).append($(fieldRow));

		return $(resetPasswordFormTable);
	}

	const doCreateUserRegisterForm = function(userData){
		let regFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < userinfoTableFields.length; i++) {
			let fieldRow = $('<tr></tr>');
			let labelField = $('<td width="40%" align="left">' + userinfoTableFields[i].displayName + (userinfoTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
			let inputValue = $('<input type="text" id="' + userinfoTableFields[i].fieldName + '" size="' + userinfoTableFields[i].inputSize + '"/>');
			if ((userData) && (userData.userinfo[userinfoTableFields[i].fieldName])) {
				$(inputValue).val(userData.userinfo[userinfoTableFields[i].fieldName]);
			}
			$(inputField).append($(inputValue));
			$(fieldRow).append($(labelField));
			$(fieldRow).append($(inputField));
			$(regFormTable).append($(fieldRow));
		}
		let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">ประเภทผู้ใช้งาน <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let inputValue = $('<select id="UsertypeId"></select>');
		let usertypes = JSON.parse(localStorage.getItem('usertypes'));
		//console.log(usertypes);
		usertypes.forEach((item, i) => {
			$(inputValue).append($('<option value="' + item.Value + '">' + item.DisplayText + '<option>'))
		});
		if ((userData) && (userData.usertypeId)) {
			$(inputValue).val(userData.usertypeId);
		} else {
			$(inputValue).val(3);
		}
		$(inputField).append($(inputValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(regFormTable).append($(fieldRow));

		return $(regFormTable);
	}

	const doVerifyUserForm = function(){
		let isVerify = true;
		let userinfoDataForm = {};
		for (let i=0; i < userinfoTableFields.length; i++) {
			let curValue = $('#'+userinfoTableFields[i].fieldName).val();
			if (userinfoTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+userinfoTableFields[i].fieldName).css({'border': ''});
					userinfoDataForm[userinfoTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+userinfoTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					userinfoDataForm[userinfoTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		userinfoDataForm.usertypeId = $('#UsertypeId').val();
		return userinfoDataForm;
	}

	const doOpenNewUserForm = function(shopData, workAreaBox) {
		let verifyUsernameForm = doCreateVerifyUsernameForm();
		let radNewUserFormBox = $('<div></div>');
		$(radNewUserFormBox).append($(verifyUsernameForm));
		const newuserformoption = {
			title: 'ตรวจสอบ Username',
			msg: $(radNewUserFormBox),
			width: '520px',
			onOk: async function(evt) {
				let newUsername = $(verifyUsernameForm).find('#Username').val();
				let newPassword = $(verifyUsernameForm).find('#Password').val();
				let newRetryPassword = $(verifyUsernameForm).find('#RetryPassword').val();
				if (newUsername === '') {
					$(verifyUsernameForm).find('#Username').css({'border': '1px solid red'});
				} else {
					$(verifyUsernameForm).find('#Username').css({'border': ''});
					if (newPassword === '') {
						$(verifyUsernameForm).find('#Password').css({'border': '1px solid red'});
					} else {
						$(verifyUsernameForm).find('#Password').css({'border': ''});
						if (newRetryPassword === ''){
							$(verifyUsernameForm).find('#RetryPassword').css({'border': '1px solid red'});
						} else {
							$(verifyUsernameForm).find('#RetryPassword').css({'border': ''});
							if (newPassword !== newRetryPassword) {
								$(verifyUsernameForm).find('#Password').css({'border': '1px solid red'});
								$(verifyUsernameForm).find('#RetryPassword').css({'border': '1px solid red'});
							} else {
								$(verifyUsernameForm).find('#Password').css({'border': ''});
								$(verifyUsernameForm).find('#RetryPassword').css({'border': ''});
								let newUserFormObj = {username: newUsername, password: newPassword};
								let userRes = await common.doCallApi('/api/shop/user/verifyusername/' + newUsername, newUserFormObj);
								console.log(userRes);
								if (!userRes.result.result) {
									$(verifyUsernameForm).find('#Username').css({'border': ''});
									newUserFormBox.closeAlert();
									doOpenUserRegisterForm(shopData, workAreaBox, newUserFormObj);
								} else {
									$(verifyUsernameForm).find('#Username').css({'border': '1px solid red'});
									$.notify("Invalid Username", "error");
								}
							}
						}
					}
				}
			},
			onCancel: function(evt){
				newUserFormBox.closeAlert();
			}
		}
		let newUserFormBox = $('body').radalert(newuserformoption);
	}

	const doOpenUserRegisterForm = function(shopData, workAreaBox, newUsernameData){
		let newRegForm = doCreateUserRegisterForm();
		let radNewUserFormBox = $('<div></div>');
		$(radNewUserFormBox).append($(newRegForm));
		const newuserformoption = {
			title: 'เพิ่มผู้ใช้งานใหม่ของร้าน',
			msg: $(radNewUserFormBox),
			width: '520px',
			onOk: async function(evt) {
				let newUserFormObj = doVerifyUserForm();
				if (newUserFormObj) {
					let hasValue = newUserFormObj.hasOwnProperty('User_NameTH');
					if (hasValue){
						newUserFormBox.closeAlert();
						newUserFormObj.username = newUsernameData.username;
						newUserFormObj.password = newUsernameData.password;
						newUserFormObj.shopId = shopData.id;
						let userRes = await common.doCallApi('/api/shop/user/add', newUserFormObj);
						if (userRes.status.code == 200) {
							$.notify("เพิ่มรายการผู้ใช้งานสำเร็จ", "success");
							await doShowUserItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถเพิ่มรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการผู้ใช้งานได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				newUserFormBox.closeAlert();
			}
		}
		let newUserFormBox = $('body').radalert(newuserformoption);
	}

	const doOpenEditUserForm = function(shopData, workAreaBox, userData){
		let editRegForm = doCreateUserRegisterForm(userData);
		let radEditUserFormBox = $('<div></div>');
		$(radEditUserFormBox).append($(editRegForm));
		const edituserformoption = {
			title: 'แก้ไขผู้ใช้งานของร้าน',
			msg: $(radEditUserFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editUserFormObj = doVerifyUserForm();
				if (editUserFormObj) {
					let hasValue = editUserFormObj.hasOwnProperty('User_NameTH');
					if (hasValue){
						editUserFormBox.closeAlert();
						let params = {data: editUserFormObj, id: userData.id, userinfoId: userData.userinfo.id};
						let userRes = await common.doCallApi('/api/shop/user/update', params);
						if (userRes.status.code == 200) {
							$.notify("แก้ไขรายการผู้ใช้งานสำเร็จ", "success");
							await doShowUserItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการผู้ใช้งานได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editUserFormBox.closeAlert();
			}
		}
		let editUserFormBox = $('body').radalert(edituserformoption);
	}

	const doResetPassword = function(shopData, workAreaBox, userId){
		let resetForm = doCreateResetPasswordForm();
		let radResetFormBox = $('<div></div>');
		$(radResetFormBox).append($(resetForm));
		const resetpasswordformoption = {
			title: 'Reset Password',
			msg: $(radResetFormBox),
			width: '420px',
			onOk: async function(evt) {
				let newPassword = $(resetForm).find('#Password').val();
				let newRetryPassword = $(resetForm).find('#RetryPassword').val();
				if (newPassword === '') {
					$(resetForm).find('#Password').css({'border': '1px solid red'});
				} else {
					$(resetForm).find('#Password').css({'border': ''});
					if (newRetryPassword === ''){
						$(resetForm).find('#RetryPassword').css({'border': '1px solid red'});
					} else {
						$(resetForm).find('#RetryPassword').css({'border': ''});
						if (newPassword !== newRetryPassword) {
							$(resetForm).find('#Password').css({'border': '1px solid red'});
							$(resetForm).find('#RetryPassword').css({'border': '1px solid red'});
						} else {
							$(resetForm).find('#Password').css({'border': ''});
							$(resetForm).find('#RetryPassword').css({'border': ''});
							let newPasswordFormObj = {userId: userId, password: newPassword};
							let userRes = await common.doCallApi('/api/users/resetpassword', newPasswordFormObj);
							console.log(userRes);
							if (userRes.status.code == 200) {
								$(resetForm).find('#Password').css({'border': ''});
								$(resetForm).find('#RetryPassword').css({'border': ''});
								resetPasswordFormBox.closeAlert();
								await doShowUserItem(shopData, workAreaBox);
							} else {
								$(resetForm).find('#Password').css({'border': '1px solid red'});
								$(resetForm).find('#RetryPassword').css({'border': '1px solid red'});
								$.notify("Invalid Password", "error");
							}
						}
					}
				}
			},
			onCancel: function(evt){
				resetPasswordFormBox.closeAlert();
			}
		}
		let resetPasswordFormBox = $('body').radalert(resetpasswordformoption);
	}

	const doDeleteUser = function(shopData, workAreaBox, userId){
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบผู้ใช้งานรายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบผู้ใช้งาน</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบผู้ใช้งาน',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let userRes = await common.doCallApi('/api/shop/user/delete', {id: userId});
				if (userRes.status.code == 200) {
					$.notify("ลบรายการผู้ใช้งานรายการทีเลือกสำเร็จ", "success");
					let workingAreaBox = $('#WorkingAreaBox');
					await doShowUserItem(shopData, workAreaBox);
				} else if (userRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการผู้ใช้งานได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  return {
    doShowUserItem
	}
}
