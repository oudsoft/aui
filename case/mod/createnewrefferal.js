/*createnewrefferal.js*/
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);
  const common = require('./commonlib.js')($);

  const doShowPopupRegisterNewRefferalUser = async function(){
		$('body').loading('start');
		function randomUsernameReq() {
			return new Promise(async function(resolve, reject) {
				let rqParams = {};
				let newRandomUsernameRes = await common.doGetApi('/api/users/randomusername', rqParams);
				console.log(newRandomUsernameRes);
				if (newRandomUsernameRes.random) {
					resolve({username: newRandomUsernameRes.random.username});
				} else {
					resolve({});
				}
			});
		}

		function createRegisterForm(){
			const form = $('<div id="UserRegisterInfo"></div>');
			$(form).append('<div class="InputField"><label>ชื่อ (ภาษาอังกฤษ) :</label><input type="text" id="NameEN" size="25"/></div>');
	    $(form).append('<div class="InputField"><label>นามสกุล (ภาษาอังกฤษ) :</label><input type="text" id="LastNameEN" size="25"/></div>');
	    $(form).append('<div class="InputField"><label>ชื่อ (ภาษาไทย) :</label><input type="text" id="NameTH" size="25"/></div>');
	    $(form).append('<div class="InputField"><label>นามสกุล (ภาษาไทย) :</label><input type="text" id="LastNameTH" size="25"/></div>');
	    $(form).append('<div class="InputField"><label>Email :  </label><input type="text" id="Email" size="25"/></div>');
	    $(form).append('<div class="InputField"><label>เบอร์โทรศัพท์ :</label><input type="text" id="Phone" size="25"/></div>');
	    $(form).append('<div class="InputField"><label>LineID :</label><input type="text" id="LineID" size="25"/></div>');
			return $(form);
		}

		function doValidateForm(form, newUsername, hospital) {
			const username = newUsername;
			const password = newUsername + '@12345';
	    const UserType = 5;
	    const Hospitals = [];
			const Hospital = hospital;
	    let NameEN = $(form).find("#NameEN").val();
	    let LastNameEN = $(form).find("#LastNameEN").val();
	    let NameTH = $(form).find("#NameTH").val();
	    let LastNameTH = $(form).find("#LastNameTH").val();
	    let Email = $(form).find("#Email").val();
	    let Phone = $(form).find("#Phone").val();
	    let LineID = $(form).find("#LineID").val();
	    if (NameEN !== ''){
	      if (LastNameEN !== ''){
	        if (NameTH !== ''){
	          if (LastNameTH !== ''){
              let params = {User_NameEN: NameEN, User_LastNameEN: LastNameEN, User_NameTH: NameTH, User_LastNameTH: LastNameTH, User_Email: Email, User_Phone: Phone, User_LineID: LineID, User_PathRadiant: '/path/to/khow', User_Hospitals: JSON.stringify(Hospitals), usertypeId: UserType, hospitalId: Hospital, username: username, password: password};
              return params;
	          } else {
	            $(form).find("#LastNameTH").css({'border': '1px solid red'});
	            return;
	          }
	        } else {
	          $(form).find("#NameTH").css({'border': '1px solid red'});
	          return;
	        }
	      } else {
	        $(form).find("#LastNameEN").css({'border': '1px solid red'});
	        return;
	      }
	    } else {
	      $(form).find("#NameEN").css({'border': '1px solid red'});
	      return;
	    }
	  }

		function regiternewUserReq(userParams) {
			return new Promise(async function(resolve, reject) {
				let rqParams = userParams;
				let result = await common.doCallApi('/api/user/add', rqParams);
				if (result.status.code == 200) {
					resolve(result);
				} else {
					resolve({});
				}
			});
		}

		function doGetNextSipPhone(usertypeId){
			return new Promise(async function(resolve, reject) {
				let rqParams = {};
				let result = await common.doGetApi('/api/users/nextsipphonenumber/' + usertypeId, rqParams);
				if (result.status.code == 200) {
					resolve(result);
				} else {
					resolve({});
				}
			});
		}

		const userdata = JSON.parse(localStorage.getItem('userdata'));
		const hospitalId = userdata.hospitalId;
		const userId = userdata.id

  	const spacingBox = $('<span>&nbsp;</span>');
  	const inputStyleClass = {"font-family": "EkkamaiStandard", "font-size": "20px"};

  	$('#HistoryDialogBox').empty();
		let newUsername = await randomUsernameReq();
		if (newUsername) {
			let newUsernameLabelDiv = $('<div>Username ใหม่ที่ระบบฯ สุ่มขึ้นมาให้</div>');
			$(newUsernameLabelDiv).css(inputStyleClass);
			$('#HistoryDialogBox').append($(newUsernameLabelDiv));
			let newUsernameDiv = $('<div style="font-weight: bold; color: red;">' + newUsername.username + '</div>');
			$(newUsernameDiv).css(inputStyleClass);
			$('#HistoryDialogBox').append($(newUsernameDiv));
			let usernameActionCmdDiv = $('<div></div>');
			$(usernameActionCmdDiv).appendTo('#HistoryDialogBox');
			let acceptActionCmd = $('<input type="button" value=" ใช้ Username นี้"/>');
			$(acceptActionCmd).css(inputStyleClass);
			$(acceptActionCmd).appendTo(usernameActionCmdDiv);
			$(acceptActionCmd).click((e)=> {
				$(usernameActionCmdDiv).remove();
				let registerForm = createRegisterForm();
				$(registerForm).css(inputStyleClass);
				$(registerForm).find('input[type="text"]').css(inputStyleClass);
				$('#HistoryDialogBox').append($(registerForm));
				let registerActionCmdDiv = $('<div style="text-align: center; margin-top: 10px;"></div>');
				$(registerActionCmdDiv).appendTo('#HistoryDialogBox');
				let submitActionCmd = $('<input type="button" value=" ตกลง "/>');
				$(submitActionCmd).css(inputStyleClass);
				$(submitActionCmd).appendTo(registerActionCmdDiv);
				$(submitActionCmd).click(async (e)=> {
					let userParams = doValidateForm(registerForm, newUsername.username, hospitalId);
					if (userParams){
						let nextSipPhone = await doGetNextSipPhone(5);
						userParams.User_SipPhone = nextSipPhone.sipNext;
						let result = await regiternewUserReq(userParams);
						if ((result.status) && (result.status.code == 200)) {
							let apiUrl = '/api/cases/options/' + hospitalId;
							let rqParams = {};
							let response = await common.doGetApi(apiUrl, rqParams);
							let options = response.Options;
							$("#Refferal").empty();
							$("#Refferal").append('<option value="-1">เลือกหมอ</option>');
							options.refes.forEach((item) => {
								$("#Refferal").append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
							});
							$("#Refferal").append($('<option value="0">เพิ่มหมอ</option>'));
						} else {
							alert('ไม่สามารถบันทึกการลงทะเบียนหมอเจ้าของไข้ได้ในขณะนี้')
						}
						$(cancelActionCmd).click();
					}
				});
				$(registerActionCmdDiv).append($(spacingBox));
				let cancelActionCmd = $('<input type="button" value=" ยกเลิก "/>');
				$(cancelActionCmd).css(inputStyleClass);
				$(cancelActionCmd).appendTo(registerActionCmdDiv);
				$(cancelActionCmd).click((e)=> {
					$('#HistoryDialogBox').dialog('close');
					$('body').loading('stop');
				});
			});
			$(usernameActionCmdDiv).append($(spacingBox));
			let notAcceptActionCmd = $('<input type="button" value=" สุ่ม Username ใหม่"/>');
			$(notAcceptActionCmd).css(inputStyleClass);
			$(notAcceptActionCmd).appendTo(usernameActionCmdDiv);
			$(notAcceptActionCmd).click(async (e)=>{
				newUsername = await randomUsernameReq();
				if (newUsername) {
					$(newUsernameDiv).empty().text(newUsername.username);
				} else {
					alert('ฟังก์ชั่น Random username ทำงานผิดพลาด');
				}
			});
	  	$('#HistoryDialogBox').dialog('option', 'title', 'เพิ่ม User ประเภทหมอเจ้าของไข้');
	  	$('#HistoryDialogBox').dialog('open');
		} else {
			alert('ฟังก์ชั่น Random username ทำงานผิดพลาด');
		}
  }

  return {
    doShowPopupRegisterNewRefferalUser
	}
}
