/* login.js */
module.exports = function ( jq ) {
	const $ = jq;

  //const common = require('../../case/mod/commonlib.js')($);

	const emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

	function urlQueryToObject(url) {
  	let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
  				return paramPair.split(/=(.+)?/).slice(0, 2);
  		}).reduce(function (obj, pairArray) {
  				obj[pairArray[0]] = pairArray[1];
  				return obj;
          let password2 = $('#psw2').val();
  		}, {});
  	return result;
  }

  function doCallLoginApi(user) {
    return new Promise(function(resolve, reject) {
      var loginApiUri = '/api/login/';
      var params = user;
      $.post(loginApiUri, params, function(response){
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
        reject(err);
  		})
  	});
  }

  function doLogin(){
  	var username = $("#username").val();
  	var password = $("#password").val();
  	if( username == ''){
  		$("#username").css("border","2px solid red");
      $("#username").notify('ต้องมี Username', 'error');
    } else if(password == ''){
      $("#username").css("border","");
      $("#password").css("border","2px solid red");
      $("#password").notify('ต้องมี Password', 'error');
  	} else {
      $("#password").css("border","");
  		let user = {username: username, password: password};
      console.log(user);
  		doCallLoginApi(user).then(async (response) => {
  			if (response.success == false) {
					doGetCheckUsername(username).then((existRes)=>{
						console.log(existRes);
						if (existRes.result.length > 0) {
							$.notify('Password ไม่ถูกต้อง', 'error');
							$("#password").css("border","2px solid red");
							//$('#OpenRegisterFormCmd').hide();
							$('#ResetPwdCmd').show();
							$('#ResetPwdCmd').on('click', (evt)=>{
								doOpenResetPwdForm(username)
							});
						} else {
		          $.notify('Username และ Password ไม่ถูกต้อง', 'error');
		          $("#username").css("border","2px solid red");
		          $("#password").css("border","2px solid red");
							$('#ResetPwdCmd').hide();
							/*
							$('#OpenRegisterFormCmd').show();
							$('#OpenRegisterFormCmd').on('click', (evt)=>{
								doOpenRegisterForm()
							});
							*/
						}
					});
  			} else {
          $("#username").css("border","");
          $("#password").css("border","");

					let usertype = response.data.usertype.id;

					localStorage.setItem('token', response.token);
					localStorage.setItem('userdata', JSON.stringify(response.data));
  				const defualtSettings = {"itemperpage" : "20"};
  				localStorage.setItem('defualsettings', JSON.stringify(defualtSettings));

					let remembermeOption = $('#RememberMe').prop("checked");
					if (remembermeOption == true) {
						localStorage.setItem('rememberme', 1);
					} else {
						localStorage.setItem('rememberme', 0);
					}

					let queryObj = urlQueryToObject(window.location.href);
					console.log(queryObj);
					if (queryObj.action) {
						if (queryObj.action === 'callchat'){
							let caseId = queryObj.caseId;
							window.location.replace('/refer/callradio.html?caseId=' + caseId);
						}
					} else {
          	gotoYourPage(usertype);
					}
  			}
  		});
  	}
  }

  const doLoadLoginForm = function(){
    let jqueryUiCssUrl = "/lib/jquery-ui.min.css";
  	let jqueryUiJsUrl = "/lib/jquery-ui.min.js";
  	let jqueryLoadingUrl = '/lib/jquery.loading.min.js';
  	let jqueryNotifyUrl = '/lib/notify.min.js';
    $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  	//https://carlosbonetti.github.io/jquery-loading/
  	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  	//https://notifyjs.jpillora.com/
  	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

    $('body').append($('<div id="overlay"><div class="loader"></div></div>'));
    $('body').loading({overlay: $("#overlay"), stoppable: true});

    $('#app').load('/form/central-login.html', function(what){
      $('#id01').css({'display': 'block'});

      $('#LoginCmd').on('click', (evt)=>{
        doLogin();
      });

      $("#password").on('keypress',function(e) {
        if(e.which == 13) {
          doLogin();
        };
      });

			$('#OpenRegisterFormCmd').show();
			$('#OpenRegisterFormCmd').on('click', (evt)=>{
				doOpenRegisterForm()
			});

      $('body').loading('stop');
    });
  }

  const gotoYourPage = function(usertype){
		let dicomfilter = undefined;
    console.log(usertype);
    switch (usertype) {
      case 1:
        window.location.replace('/shop/setting/admin.html');
        /* รอแก้ bundle ของ admin */
      break;
      case 2:
        window.location.replace('/shop/setting/admin.html');
      break;
      case 3:
				window.location.replace('/shop/setting/admin.html');
      break;
      case 4:
        window.location.replace('/shop/setting/admin.html');
      break;
      case 5:
        window.location.replace('/shop/setting/admin.html');
      break;
    }
  }

	const doCheckUserData = function(){
		let yourToken = localStorage.getItem('token');
		if (yourToken) {
			let userdata = localStorage.getItem('userdata');
			if (userdata !== 'undefined') {
				userdata = JSON.parse(userdata);
				if (userdata && userdata.usertype){
					gotoYourPage(userdata.usertype.id)
				} else {
					doLoadLoginForm();
				}
			} else {
				doLoadLoginForm();
			}
		} else {
			doLoadLoginForm();
		}
	}

	const doOpenResetPwdForm = function(username){
		$('#id01').show();
		$('#LoginForm').hide();
		$('#ResetPwdForm').show();
		$('#ResetCmd').on('click', (evt)=>{
			let yourEmail = $('#email').val();
			if (yourEmail !== '') {
				$('#email').css('border', '');
				let emailValid = emailRegEx.test(yourEmail);
				if (emailValid) {
					$('#email').css('border', '');
					doCallCheckEmailAddress(yourEmail, username).then((checkRes)=>{
						if (checkRes.data.userId) {
							doCallSendResetPwdEmail(yourEmail, username, checkRes.data.userId).then((sendRes)=>{
								let sendEmailResBox = $('<div></div>');
								let resText = 'ระบบฯ ได้ส่งลิงค์สำหรับรีเซ็ตรหัสผ่านไปทางอีเมล์ '+ yourEmail + ' เรียบร้อยแล้ว';
								resText += '\nโปรดตรวจสอบ ที่กล่องอีเมล์ของคุณ';
								resText += '\nคุณมีเวลาสำหรับรีเซ็ตรหัสผ่าน 1 ชม. นับจากนี้';
								$(sendEmailResBox).text(resText);
								$('#ResetPwdForm').append($(sendEmailResBox));
								$('#ResetCmd').hide();
								$('#email').hide();
							});
						} else {
							$('#email').css('border', '1px solid red');
							$.notify('ไม่พบการลงทะเบียนด้วย Email Address นี้', 'error');
						}
					});
				} else {
					$('#email').css('border', '1px solid red');
					$.notify('Email Address ไม่ถูกตามฟอร์แมต', 'error');
				}
			} else {
				$('#email').css('border', '1px solid red');
				$.notify('Email Address ต้องไม่ว่าง', 'error');
			}
		});
	}

	const doGetCheckUsername = function(username){
		return new Promise(function(resolve, reject) {
			var existUsernameApiUri = '/api/users/searchusername/' + username;
			var params = {username: username};
			$.get(existUsernameApiUri, params, function(response){
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}
	const doCallEmailExist = function(yourEmail){
		return new Promise(function(resolve, reject) {
      var existEmailApiUri = '/api/users/email/exist';
      var params = {email: yourEmail};
      $.post(existEmailApiUri, params, function(response){
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
        reject(err);
  		})
  	});
	}

	const doCallCheckEmailAddress = function(yourEmail, username){
		return new Promise(function(resolve, reject) {
      var checkEmailApiUri = '/api/users/email';
      var params = {email: yourEmail, username: username};
      $.post(checkEmailApiUri, params, function(response){
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
        reject(err);
  		})
  	});
	}

	const doCallSendResetPwdEmail = function(yourEmail, username, userId) {
		return new Promise(function(resolve, reject) {
      var existEmailApiUri = '/api/resettask/new';
      var params = {email: yourEmail, username: username, userId: userId};
      $.post(existEmailApiUri, params, function(response){
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
        reject(err);
  		})
  	});
	}

	const doCallRegister = function(params){
		return new Promise(function(resolve, reject) {
      var createNewActivateApiUri = '/api/activatetask/new';
      $.post(createNewActivateApiUri, params, function(response){
  			resolve(response);
  		}).catch((err) => {
  			console.log(JSON.stringify(err));
        reject(err);
  		})
  	});
	}

	const doOpenRegisterForm = function(){
		$('#id01').show();
		$('#LoginForm').hide();
		$('#RegisterForm-Username').show();
		$('#CheckUsernameCmd').on('click', (evt)=>{
			let username = $('#username1').val();
			let password1 = $('#password1').val();
			let password2 = $('#password2').val();
			if (username !== '') {
				$('#username1').css('border', '');
				if (password1 !== ''){
					$('#password1').css('border', '');
					if (password2 !== '') {
						$('#password2').css('border', '');
						if (password1 == password2) {
							$('#password1').css('border', '');
							$('#password2').css('border', '');
							doGetCheckUsername(username).then((existRes)=>{
								console.log(existRes);
								if (existRes.result.length == 0) {
									$('#username').css('border', '');
									doOpenUserInfoForm(username, password1);
								} else {
									$('#username').css('border', '1px solid red');
									$.notify('Username นี้มีผู้อื่นใช้แล้ว', 'error');
								}
							});
						} else {
							$('#password1').css('border', '1px solid red');
							$('#password2').css('border', '1px solid red');
							$.notify('Password และ Retry Password ต้องเหมือนกัน', 'error');
						}
					} else {
						$('#password2').css('border', '1px solid red');
						$.notify('Retry Password ต้องไม่ว่าง', 'error');
					}
				} else {
					$('#password1').css('border', '1px solid red');
					$.notify('Password ต้องไม่ว่าง', 'error');
				}
			} else {
				$('#username1').css('border', '1px solid red');
				$.notify('Username ต้องไม่ว่าง', 'error');
			}
		});
	}

	const doOpenUserInfoForm = function(username, password){
		$('#RegisterForm-Username').hide();
		$('#RegisterForm-Info').show();
		$('#RegisterCmd').on('click', (evt)=>{
			let nameTH = $('#NameTH').val();
			let lastNameTH = $('#LastNameTH').val();
			let nameEN = $('#NameEN').val();
			let lastNameEN = $('#LastNameEN').val();
			let email = $('#Email').val();
			let phone = $('#Phone').val();
			let lineID = $('#LineID').val();
			if (nameTH !== '') {
				$('#NameTH').css('border', '');
				if (lastNameTH !== '') {
					$('#LastNameTH').css('border', '');
					if (nameEN !== '') {
						$('#NameEN').css('border', '');
						if (lastNameEN !== '') {
							$('#LastNameEN').css('border', '');
							if (email !== ''){
								let emailValid = emailRegEx.test(email);
								if (emailValid) {
									$('#Email').css('border', '');
									if (phone !== ''){
										doCallEmailExist(email).then((callRes)=>{
											if (callRes.data.length == 0) {
												let params = {User_NameEN: nameEN, User_LastNameEN: lastNameEN, User_NameTH: nameTH, User_LastNameTH: lastNameTH, User_Email: email, User_Phone: phone, User_LineID: lineID, User_PathRadiant: '/path/to/khow', username: username, password: password};
												console.log(params);
												doCallRegister(params).then((regRes)=>{
													console.log(regRes);
													if (regRes.Task.email){
														let sendEmailResBox = $('<div></div>');
														let resText = 'ระบบฯ ได้ส่งลิงค์สำหรับ Activate บัญชีใช้งานของคุณไปทางอีเมล์ '+ email + ' เรียบร้อยแล้ว';
														resText += '\nโปรดตรวจสอบ ที่กล่องอีเมล์ของคุณ';
														resText += '\nคุณมีเวลาสำหรับ Activate บัญชีใช้งาน 1 ชม.';
														$(sendEmailResBox).text(resText);
														$('#RegisterForm-Info').empty();
														$('#RegisterForm-Info').append($(sendEmailResBox));
													} else {
														$.notify('เกิดข้อผิดพลาด ไม่สามารถลงทะบียนบัญชีใช้งานได้', 'error');
													}
												});
											} else {
												$('#Email').css('border', '1px solid red');
												$('#Email').notify('อีเมล์นี้มีผู้อื่นใช้ไปแล้ว', 'error');
											}
										});
									} else {
										$('#Phone').css('border', '1px solid red');
										$('#Phone').notify('เบอร์โทรศัพทต้องไม่ว่าง', 'error');
									}
								} else {
									$('#Email').css('border', '1px solid red');
									$('#Email').notify('อีเมล์ไม่ถูกต้อง', 'error');
								}
							} else {
								$('#Email').css('border', '1px solid red');
								$('#Email').notify('อีเมล์ต้องไม่ว่าง', 'error');
							}
						} else {
							$('#LastNameEN').css('border', '1px solid red');
							$('#LastNameEN').notify('นามสกุลภาษาอังกฤษต้องไม่ว่าง', 'error');
						}
					} else {
						$('#NameEN').css('border', '1px solid red');
						$('#NameEN').notify('ชื่อภาษาอังกฤษต้องไม่ว่าง', 'error');
					}
				} else {
					$('#LastNameTH').css('border', '1px solid red');
					$('#LastNameTH').notify('นามสกุลภาษาไทยต้องไม่ว่าง', 'error');
				}
			} else {
				$('#NameTH').css('border', '1px solid red');
				$('#NameTH').notify('ชื่อภาษาไทยต้องไม่ว่าง', 'error');
			}
		});
	}

	return {
    doLoadLoginForm,
		doCheckUserData,
		doOpenRegisterForm
	}
}
