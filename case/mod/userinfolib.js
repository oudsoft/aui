/* userinfolib.js */
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);
  const common = require('./commonlib.js')($);

  function doCallUpdateUserInfo(data) {
    return new Promise(function(resolve, reject) {
      var updateUserApiUri = '/api/user/update';
      var params = data;
      //$.post(updateUserApiUri, params, function(response){
			common.doCallApi(updateUserApiUri, params).then((response)=>{
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
				reject(err);
  		})
  	});
  }

  function doCallUserInfo(userId) {
    return new Promise(function(resolve, reject) {
      var userInfoApiUri = '/api/user/' + userId;
      var params = {};
      //$.get(userInfoApiUri, params, function(response){
			common.doGetApi(userInfoApiUri, params).then((response)=>{
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
				reject(err);
  		})
  	});
  }

  function doSaveUserProfile(newUserInfo){
		return new Promise(function(resolve, reject) {
	  	doCallUpdateUserInfo(newUserInfo).then((updateRes)=>{
	  		if (updateRes.Result === "OK") {
	  			doCallUserInfo(newUserInfo.userId).then((userInfoRes)=>{
	  				//update userdata in localstorage
	  				let newUserInfo = userInfoRes.Record.info;
	  				let yourUserdata = JSON.parse(localStorage.getItem('userdata'));
	  				yourUserdata.userinfo = newUserInfo;
	  				localStorage.setItem('userdata', JSON.stringify(yourUserdata));
						let userDisplayName = yourUserdata.userinfo.User_NameTH + ' ' + yourUserdata.userinfo.User_LastNameTH;
						$('#UserDisplayNameBox').empty().append($('<h4>' + userDisplayName + '</h4>'));
	  				$.notify("บันทึกการแก้ไขจ้อมูลของคุณ่เข้าสู่ระบบสำเร็จ", "success");
						resolve(updateRes);
	  			});
	  		} else {
	  			$.notify("เกิดความผิดพลาด ไม่สามารถบันทึกการแก้ไขจ้อมูลของคุณ่เข้าสู่ระบบได้ในขณะนี้", "error");
					reject({error: ''})
	  		}
	  	});
		});
  }

	const createFormFragment = function(fragId, fragLabel, fragValue) {
		let fragRow = $('<div style="display: table-row; padding: 2px; background-color: gray; width: 100%;"></div>');
		let labelCell = $('<div style="display: table-cell; width: 250px; padding: 2px;"></div>');
		$(labelCell).append($('<span>' + fragLabel + '</span>'));
		let inputCell = $('<div style="display: table-cell; padding: 2px;"></div>');
		let fragInput = $('<input type="text"/>');
		$(fragInput).attr('id', fragId);
		$(fragInput).val(fragValue);
		$(fragInput).appendTo($(inputCell));
		$(labelCell).appendTo($(fragRow));
		$(inputCell).appendTo($(fragRow));
		return $(fragRow);
	}

  const doShowUserProfile = function() {
		let yourUserdata = JSON.parse(localStorage.getItem('userdata'));

		let table = $('<div style="display: table; width: 100%;"></div>');

		let yourNameENFrag = createFormFragment('UserNameEN', 'ชื่อ(ภาษาอังกฤษ์)', yourUserdata.userinfo.User_NameEN);
		$(yourNameENFrag).appendTo($(table));

		let yourLastNameENFrag = createFormFragment('UserLastNameEN', 'นามสกุล(ภาษาอังกฤษ์)', yourUserdata.userinfo.User_LastNameEN);
		$(yourLastNameENFrag).appendTo($(table));

		let yourNameTHFrag = createFormFragment('UserNameTH', 'ชื่อ(ภาษาไทย)', yourUserdata.userinfo.User_NameTH);
		$(yourNameTHFrag).appendTo($(table));

		let yourLastNameTHFrag = createFormFragment('UserLastNameTH', 'นามสกุล(ภาษาไทย)', yourUserdata.userinfo.User_LastNameTH);
		$(yourLastNameTHFrag).appendTo($(table));

		let yourEmailFrag = createFormFragment('UserEmail', 'อีเมล์', yourUserdata.userinfo.User_Email);
		$(yourEmailFrag).appendTo($(table));

		let yourPhoneFrag = createFormFragment('UserPhone', 'โทรศัพท์', yourUserdata.userinfo.User_Phone);
		$(yourPhoneFrag).appendTo($(table));

		let yourLineIDFrag = createFormFragment('UserLineID', 'Line ID', yourUserdata.userinfo.User_LineID);
		$(yourLineIDFrag).appendTo($(table));

		let yourDefaultDownloadPathFrag = createFormFragment('UserPathRadiant', 'โฟลเดอร์ดาวน์โหลด Dicom', yourUserdata.userinfo.User_PathRadiant);
		$(yourDefaultDownloadPathFrag).appendTo($(table));

		const radDialogOptions = {
	    title: 'ข้อมูลผู้ใช้งานของฉัน',
	    msg: $(table),
	    width: '510px',
			okLabel: ' บันทึก ',
	    onOk: async function(evt) {
				let res = await doVerifyUserInfo();
				console.log(res);
	      radUserInfoDialog.closeAlert();
	    },
			onCancel: function(evt) {
	      radUserInfoDialog.closeAlert();
	    }
	  }

	  let radUserInfoDialog = $('body').radalert(radDialogOptions);

		const doSaveUserInfo = function(newUserInfo){
			return new Promise(async function(resolve, reject) {
				console.log(newUserInfo);
				let yourNewUserInfo = newUserInfo;
				yourNewUserInfo.userId = yourUserdata.id;
				yourNewUserInfo.infoId = yourUserdata.userinfo.id;
				yourNewUserInfo.usertypeId = yourUserdata.usertype.id;
				let saveRes = await doSaveUserProfile(yourNewUserInfo);
				resolve(saveRes);
			});
		}

		const doVerifyUserInfo = function(){
			return new Promise(async function(resolve, reject) {
				let newNameEN = $(table).find('#UserNameEN').val();
				let newLastNameEN = $(table).find('#UserLastNameEN').val();
				let newNameTH = $(table).find('#UserNameTH').val();
				let newLastNameTH = $(table).find('#UserLastNameTH').val();
				let newEmail = $(table).find('#UserEmail').val();
				let newPhone = $(table).find('#UserPhone').val();
				let newLineID = $(table).find('#UserLineID').val();
				let newPathRadiant = $(table).find('#UserPathRadiant').val();
				if (newNameEN === '') {
					$(table).find('#UserNameEN').css('border', '1px solid red');
					$.notify('ต้องมีชื่อ(ภาษาอังกฤษ์)', 'error');
					resolve();
				} else if (newLastNameEN === '') {
					$(table).find('#UserNameEN').css('border', '');
					$(table).find('#UserLastNameEN').css('border', '1px solid red');
					$.notify('ต้องมีนามสกุล(ภาษาอังกฤษ์)', 'error');
					resolve();
				} else if (newNameTH === '') {
					$(table).find('#UserLastNameEN').css('border', '');
					$(table).find('#UserNameTH').css('border', '1px solid red');
					$.notify('ต้องมีชื่อ(ภาษาไทย)', 'error');
					resolve();
				} else if (newLastNameTH === '') {
					$(table).find('#UserNameTH').css('border', '');
					$(table).find('#UserLastNameTH').css('border', '1px solid red');
					$.notify('ต้องมีนามสกุล(ภาษาไทย)', 'error');
					resolve();
				} else if (newEmail === '') {
					$(table).find('#UserLastNameTH').css('border', '');
					$(table).find('#UserEmial').css('border', '1px solid red');
					resolve();
				} else if (newPhone !== '') {
					const phoneNoTHRegEx = /^[0]?[689]\d{8}$/;
					let isCorrectFormat = phoneNoTHRegEx.test(newPhone);
					if (!isCorrectFormat){
						$(table).find('#UserEmial').css('border', '');
						$(table).find('#UserPhone').css('border', '1px solid red');
						$.notify('โทรศัพท์ สามารถปล่อยว่างได้ แต่ถ้ามี ต้องพิมพ์ให้ถูกต้องตามรูปแบบ 0xxxxxxxxx', 'error');
						resolve();
	  			} else {
						$(table).find('#UserEmail').css('border', '');
						$(table).find('#UserPhone').css('border', '');
						if (yourUserdata.usertypeId != 4) {
							let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
							let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
							resolve(callSaveRes);
						} else {
							if (newPathRadiant === '') {
								$(table).find('#UserPathRadiant').css('border', '1px solid red');
								$.notify('กรณีที่คุณเป็นรังสีแพทย์ ต้องระบุ โฟลเดอร์ดาวน์โหลด Dicom', 'error');
								resolve();
							} else {
								$(table).find('#UserPathRadiant').css('border', '');
								let downloadPathFrags = newPathRadiant.split('\\');
								newPathRadiant = downloadPathFrags.join('/');
								let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
								let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
								resolve(callSaveRes);
							}
						}
					}
				} else {
					$(table).find('#UserEmail').css('border', '');
					$(table).find('#UserPhone').css('border', '');
					if (yourUserdata.usertypeId != 4) {
						let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
						let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
						resolve(callSaveRes);
					} else {
						if (newPathRadiant === '') {
							$(table).find('#UserPathRadiant').css('border', '1px solid red');
							$.notify('กรณีที่คุณเป็นรังสีแพทย์ ต้องระบุ โฟลเดอร์ดาวน์โหลด Dicom', 'error');
							resolve();
						} else {
							$(table).find('#UserPathRadiant').css('border', '');
							let downloadPathFrags = newPathRadiant.split('\\');
							newPathRadiant = downloadPathFrags.join('/');
							let yourNewUserInfo = {User_NameEN: newNameEN, User_LastNameEN: newLastNameEN, User_NameTH: newNameTH, User_LastNameTH: newLastNameTH, User_Email: newEmail, User_Phone: newPhone, User_LineID: newLineID, User_PathRadiant: newPathRadiant};
							let callSaveRes = await doSaveUserInfo(yourNewUserInfo);
							resolve(callSaveRes);
						}
					}
				}
			});
		}
  }

  return {
    doShowUserProfile
  }
}
