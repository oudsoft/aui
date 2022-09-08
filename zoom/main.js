/* main.js */

window.$ = window.jQuery = require('jquery');

$.ajaxSetup({
	beforeSend: function(xhr) {
		xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
	}
});

$.fn.center = function () {
  this.css("position","absolute");
  this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
  this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +  $(window).scrollLeft()) + "px");
  return this;
}

const zoom = require('./mod/zoom.js')($);

$( document ).ready(function() {
	console.log('page on ready ...');
	const initPage = function() {
    let jqueryUiCssUrl = "../../lib/jquery-ui.min.css";
    let jqueryUiJsUrl = "../../lib/jquery-ui.min.js";
    $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');

		var token = doGetToken();
		if (token) {
			doLoadMainPage()
		} else {
			doLoadLogin()
      $('#RegisterDialogBox').dialog({
        modal: true, autoOpen: false, width: 350, resizable: false, title: 'ลงทะเบียนเข้าใช้งาน'
      });
		}
	};

	initPage();

});

function doCallLoginApi(user) {
	return new Promise(function(resolve, reject) {
    var loginApiUri = '/api/login/';
    var params = user;
    $.post(loginApiUri, params, function(response){
			resolve(response);
		}).catch((err) => {
			console.log(JSON.stringify(err));
		})
	});
}

function doLogin(){
	var username = $("#username").val();
	var password = $("#password").val();
	// Checking for blank fields.
	if( username == '' || password == ''){
		$('input[type="text"],input[type="password"]').css("border","2px solid red");
		$('input[type="text"],input[type="password"]').css("box-shadow","0 0 3px red");
		$('#login-msg').html('<p>Please fill all fields...!!!!!!</p>');
		$('#login-msg').show();
	} else {
    $('#login-msg').hide();
		let user = {username: username, password: password};
		console.log(user);
		doCallLoginApi(user).then((response) => {
			// var resBody = JSON.parse(response.res.body); <= ใช้ในกรณีเรียก API แบบ By Proxy
			//var resBody = JSON.parse(response); <= ใช้ในกรณีเรียก API แบบ Direct
      console.log(response);

			if (response.success == false) {
				$('input[type="text"]').css({"border":"2px solid red","box-shadow":"0 0 3px red"});
				$('input[type="password"]').css({"border":"2px solid #00F5FF","box-shadow":"0 0 5px #00F5FF"});
				$('#login-msg').html('<p>Username or Password incorrect. Please try with other username and password again.</p>');
				$('#login-msg').show();
			} else {
				//Save resBody to cookie.
        $('#login-msg').show();
				//$.cookie(cookieName, JSON.stringify(resBody), { expires : 1 });
        localStorage.setItem('token', response.token);
        localStorage.setItem('userdata', JSON.stringify(response.data));
				upwd = password;
				doLoadMainPage();
			}
		});
	}
}

function doLoadLogin() {
	$('#app').load('form/login.html', function(){
		$(".container").css({"min-height": "100%"});
		$(".main").center();
		$("#login-cmd").click(function(){
			doLogin();
		});
    $("#password").on('keypress',function(e) {
      if(e.which == 13) {
        doLogin();
      };
    });
    $("#register-cmd").click(function(){
			doRegister();
		});
	});
}

function doUserLogout() {
  localStorage.removeItem('token');
  $('#LogoutCommand').hide();
  let url = '/staff.html';
  window.location.replace(url);
}

function doLoadMainPage(){
	//let paths = window.location.pathname.split('/');
	//let rootname = paths[1];
	//let jqueryUiCssUrl = "/lib/jquery-ui.min.css";
	//let jqueryUiJsUrl = "/lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../../lib/jquery.loading.min.js';
	let jqueryNotifyUrl = '../../lib/notify.min.js';
	//$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	//$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
	//https://carlosbonetti.github.io/jquery-loading/
	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
	//https://notifyjs.jpillora.com/
	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});
  $('body').loading('stop');

  let userdata = JSON.parse(doGetUserData());

	$('#app').load('form/main.html', function(){
		$("#User-Identify").text(userdata.userinfo.User_NameEN + ' ' + userdata.userinfo.User_LastNameEN);
		$("#User-Identify").click(function(){
			doShowUserProfile();
		});
		$("#Home-Cmd").click(function(){
      doLoadZommConnect();
		});
    $("#Logout-Cmd").click(function(){
			doUserLogout();
		});

    doLoadZommConnect();
	});
}

function doLoadZommConnect(){
	$(".main").empty();
	let zoomInterface = zoom.doLoadZoomInterface();
  $(".main").append($(hospitalData));
}

const inputStyleClass = {"font-family": "THSarabunNew", "font-size": "24px"};

function doRegister(){
  $('#RegisterDialogBox').empty();
  $('#RegisterDialogBox').css(inputStyleClass);
  let selectUserTypeLabel = $('<div>โปรดเลือกประเภทผู้ใช้งาน</div>');
  let selectUserTypeDiv = $('<select id="selectUserType"><option value="0">ประเภทผู้ใช้งานของคุณคือ?</option><option value="2">ลงทะเบียนใช้งาน (เจ้าหน้าที่เทคนิค)</option><option value="5">ลงทะเบียนใช้งาน (แพทย์เจ้าของไข้)</option><option value="4">ลงทะเบียนใช้งาน (รังสีแพทย์)</option></select>');
  $(selectUserTypeDiv).css(inputStyleClass);
  $('#RegisterDialogBox').append($(selectUserTypeLabel));
  $('#RegisterDialogBox').append($(selectUserTypeDiv));

  $("#selectUserType").on('change', (e)=>{
    let userTypeSelected = $("#selectUserType").val();
    if (userTypeSelected != 0) {
      $("#selectUserType").trigger('selecthospital', [{usertype: userTypeSelected}]);
    }
  });

  $('#RegisterDialogBox').on('selecthospital', (e, data)=> {
    $(selectUserTypeLabel).remove();
    $(selectUserTypeDiv).remove();
    var hospitalOptionsApiUri = '/api/hospital/options';
    var params = {};
    $.post(hospitalOptionsApiUri, params, function(result){
      if(result.Options.length > 0) {
        let selecthospitalLabel = $('<div id="SelecthospitalLabel">โปรดเลือกโรงพยาบาลที่สังกัด</div>')
        let selectHospitalDiv = $('<select id="SelectHospital"></select>');
        $(selectHospitalDiv).css(inputStyleClass);
        $(selectHospitalDiv).append('<option value="0">โรงพยาบาลที่คุณสังกัดคือ?</option>');
        result.Options.forEach((item, i) => {
          $(selectHospitalDiv).append('<option value="' + item.Value + '">' + item.DisplayText + '</option>');
        });
        $('#RegisterDialogBox').append($(selecthospitalLabel));
        $('#RegisterDialogBox').append($(selectHospitalDiv));

        $(selectHospitalDiv).on('change', (e)=>{
          let hospitalSelected = $(selectHospitalDiv).val();
          if (hospitalSelected != 0) {
            $(selectHospitalDiv).trigger('registerusername', [{usertype: data.usertype, hospital: hospitalSelected}]);
          }
        });
      }
    });
  });

  $('#RegisterDialogBox').on('registerusername', (e, data)=> {
    $('#RegisterDialogBox').find('#SelecthospitalLabel').remove();
    $('#RegisterDialogBox').find('#SelectHospital').remove();
    let registerUsernameForm = doCreateRegisterUserNameForm();
    $('#RegisterDialogBox').append($(registerUsernameForm));
    let registerUsernameActionCmdDiv = $('<div id ="RegisterAction" style="text-align: center; margin-top: 10px;"></div>');
    $(registerUsernameActionCmdDiv).appendTo('#RegisterDialogBox');
    let submitActionCmd = $('<input type="button" value=" ตกลง "/>');
    $(submitActionCmd).appendTo(registerUsernameActionCmdDiv);
    $(submitActionCmd).click((e) => {
      let username = $(registerUsernameForm).find('#username').val();
      let password1 = $(registerUsernameForm).find('#password1').val();
      let password2 = $(registerUsernameForm).find('#password2').val();
      if (username !=='') {
        if ((password1 !=='') && (password1.length >= 4) && (password2 !=='') && (password1 === password2)) {
          $(registerUsernameForm).find('#username').css('border', '');
          $(registerUsernameForm).find('#password1').css('border', '');
          $(registerUsernameForm).find('#password2').css('border', '');
          $(submitActionCmd).trigger('verifyusername', [{usertype: data.usertype, hospital: data.hospital, username: username, password: password1}]);
        } else {
          $(registerUsernameForm).find('#password1').css('border', '1px solid red');
          $(registerUsernameForm).find('#password2').css('border', '1px solid red');
        }
      } else {
        $(registerUsernameForm).find('#username').css('border', '1px solid red');
      }
    });
    $(registerUsernameActionCmdDiv).append("<span>  </span>");
    let cancelActionCmd = $('<input type="button" value=" ยกเลิก "/>');
    $(cancelActionCmd).appendTo(registerUsernameActionCmdDiv);
    $(cancelActionCmd).click((e) => {
      $('#RegisterDialogBox').dialog('close');
    });
  	$(registerUsernameActionCmdDiv).find('input[type="button"]').css(inputStyleClass);
  });

  $('#RegisterDialogBox').on('verifyusername', (e, data)=> {
    var verifyusernameApiUri = '/api/users/verifyusername/' + data.username;
    var params = data;
    $.post(verifyusernameApiUri, params, function(result){
      if((result.status.code == 200) && (!result.result.data)) {
        $('#RegisterDialogBox').find('#RegisterUserNameForm').find('#ErrorMessage').remove();
        $('#RegisterDialogBox').trigger('registeruser', [data]);
      } else {
        $('#RegisterDialogBox').find('#username').css('border', '1px solid red');
        $('#RegisterDialogBox').find('#RegisterUserNameForm').append('<div id="ErrorMessage">Invalid This Userane</div>').css('color', 'red');
      }
    });
  });

  $('#RegisterDialogBox').on('registeruser', (e, data)=> {
    $('#RegisterDialogBox').find('#RegisterUsernameForm').remove();
    $('#RegisterDialogBox').find('#RegisterAction').remove();
    let registerUserForm = doCreateRegisterUserForm();
    $('#RegisterDialogBox').append($(registerUserForm));
    let registerUserActionCmdDiv = $('<div id="RegisterUserActionCmdDiv" style="text-align: center; margin-top: 10px;"></div>');
    $(registerUserActionCmdDiv).appendTo('#RegisterDialogBox');
    let submitActionCmd = $('<input type="button" value=" ตกลง "/>');
    $(submitActionCmd).appendTo(registerUserActionCmdDiv);
    $(submitActionCmd).click(async (e) => {
      let userParams = doValidateForm(registerUserForm, data);
      if (userParams){
        let result = await regiternewUserReq(userParams);
        if ((result.status) && (result.status.code == 200)) {
          $('#RegisterDialogBox').find('#RegisterUserInfo').remove();
          $('#RegisterDialogBox').find('#RegisterUserActionCmdDiv').remove();
          let congratulationLabel1 = $('<div><h1>ยินดีต้อนรับเข้่าสู่ระบบ  Rad Connext</h1></div>');
          let congratulationLabel2 = $('<div><h2>โปรดเข้าสู่ระบบฯ ด้วย Username และ Password ที่ได้ลงทะเบียนเสร็จสิ้นไปเมื่อสักครู่</h2></div>');
          $('#RegisterDialogBox').append($(congratulationLabel1));
          $('#RegisterDialogBox').append($(congratulationLabel2));
          setTimeout(()=> {
            $('#RegisterDialogBox').dialog('close');
          }, 5000);
        } else {
          alert('ไม่สามารถบันทึกการลงทะเบียนหมอเจ้าของไข้ได้ในขณะนี้')
        }
      }
    });
    $(registerUserActionCmdDiv).append("<span>  </span>");
    let cancelActionCmd = $('<input type="button" value=" ยกเลิก "/>');
    $(cancelActionCmd).appendTo(registerUserActionCmdDiv);
    $(cancelActionCmd).click((e) => {
      $('#RegisterDialogBox').dialog('close');
    });
    $(registerUserActionCmdDiv).find('input[type="button"]').css(inputStyleClass);
    var x = $('#RegisterDialogBox').position().left;
    var y = $('#RegisterDialogBox').position().top - $(document).scrollTop();
    $('#RegisterDialogBox').dialog('option', 'position', [x,y]);
  });

  $('#RegisterDialogBox').dialog('open');
}

function doCreateRegisterUserNameForm(){
  let form = $('<div id="RegisterUsernameForm"></div>');
  $(form).append('<div class="InputField"><label>Username :</label><input type="text" id="username" size="25"/></div>');
  $(form).append('<div class="InputField"><label>Password :</label><input type="password" id="password1" size="25"/></div>');
  $(form).append('<div class="InputField"><label>Retry Password :</label><input type="password" id="password2" size="25"/></div>');
  return $(form);
}

function doCreateRegisterUserForm(){
  const form = $('<div id="RegisterUserInfo"></div>');
  $(form).append('<div class="InputField"><label>ชื่อ (ภาษาอังกฤษ) :</label><input type="text" id="NameEN" size="25"/></div>');
  $(form).append('<div class="InputField"><label>นามสกุล (ภาษาอังกฤษ) :</label><input type="text" id="LastNameEN" size="25"/></div>');
  $(form).append('<div class="InputField"><label>ชื่อ (ภาษาไทย) :</label><input type="text" id="NameTH" size="25"/></div>');
  $(form).append('<div class="InputField"><label>นามสกุล (ภาษาไทย) :</label><input type="text" id="LastNameTH" size="25"/></div>');
  $(form).append('<div class="InputField"><label>Email :  </label><input type="text" id="Email" size="25"/></div>');
  $(form).append('<div class="InputField"><label>เบอร์โทรศัพท์ :</label><input type="text" id="Phone" size="25"/></div>');
  $(form).append('<div class="InputField"><label>LineID :</label><input type="text" id="LineID" size="25"/></div>');
  return $(form);
}

function doValidateForm(form, data) {
  const username = data.username;
  const password = data.password;
  const UserType = data.usertype;
  const Hospitals = [];
  const Hospital = data.hospital;
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
    let saveNewUserApiUri = '/api/users/';
    $.post(saveNewUserApiUri, rqParams, function(result){
      console.log(result);
      if (result.status.code == 200) {
        resolve(result);
      } else {
        resolve({});
      }
    });
  });
}

function doShowUserProfile() {
  let userdata = JSON.parse(doGetUserData());
  let userinfo = userdata.userinfo;
  console.log(userdata);
  console.log(userdata.userinfo);

	$("#dialog").load('form/dialog.html', function() {
		$("#UserHospital").text(userdata.hospital.Hos_Name);
		$("#Username").text(userdata.username);
		$("#NameEN").val(userinfo.User_NameEN);
    $("#LastNameEN").val(userinfo.User_LastNameEN);
    $("#NameTH").val(userinfo.User_NameTH);
    $("#LastNameTH").val(userinfo.User_LastNameTH);
		$("#Telno").val(userinfo.User_Phone);
		$("#Email").val(userinfo.User_Email);
		$("#LineId").val(userinfo.User_LineID);
		$(".modal-footer").css('text-align', 'center');
		$("#SaveUserProfile-Cmd").click(function(){
			doSaveUserProfile();
		});
	});
}

function doSaveUserProfile(){
	let nameEN = $("#NameEN").val();
  let lastNameEN = $("#LastNameEN").val();
  let nameTH = $("#NameTH").val();
  let lastNameTH = $("#LastNameTH").val();
	let telno = $("#Telno").val();
	let email = $("#Email").val();
	let lineId = $("#LineId").val();
  console.log({nameEN, lastNameEN, nameTH, lastNameTH, telno, email, lineId});
	alert('It will be comming soon.');
	$("#myModal").css("display", "none");
}

function doGetToken(){
	return localStorage.getItem('token');
}

function doGetUserData(){
  return localStorage.getItem('userdata');
}

module.exports = {
	doGetToken,
  doGetUserData
}
