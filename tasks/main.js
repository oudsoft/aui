window.$ = window.jQuery = require('jquery');

$.ajaxSetup({
	beforeSend: function(xhr) {
		xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
	}
});

const util = require('../case/mod/utilmod.js')($);

var upwd, wsm, wsl;

$( document ).ready(function() {
	console.log('page on ready ...');
	const initPage = function() {
		var token = doGetToken();
		if (token) {
			doLoadUserstatusPage()
		} else {
			//doLoadLogin();
      let url = '/';
      window.location.replace(url);
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
	});
}

function doUserLogout() {
  localStorage.removeItem('token');
  $('#LogoutCommand').hide();
  let url = '/staff.html';
  window.location.replace(url);
}

function doLoadUserstatusPage(){
  let jqueryUiCssUrl = "../../lib/jquery-ui.min.css";
	let jqueryUiJsUrl = "../../lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../../lib/jquery.loading.min.js';
	let jqueryNotifyUrl = '../../lib/notify.min.js';
	$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
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
		$("#Task-Cmd").click(function(){
			doShowTask();
		});
    $("#Logout-Cmd").click(function(){
			doUserLogout();
		});

    //doShowUserProfile();
		doShowTask();

		wsm = util.doConnectWebsocketMaster(userdata.username, userdata.hospitalId, 'none');
    //doConnectWebsocketLocal(userdata.username);
	});
}

const doShowTask = async function (){
  var taskApiUri = '/api/tasks/list';
  var params = {};
  var response = await $.post(taskApiUri, params);
  console.log(response);
	$('.submenu').empty();
	$('.main').empty();
	$('#TaskDiv').remove();
	let TaskDiv = $("<div id='TaskDiv'><ul></ul></div>");
	$(TaskDiv).appendTo($('.main'));
	//let resOb = JSON.parse(response);
	let resOb = response.Records;
	if (resOb.length > 0) {
		resOb.forEach((item, i) => {
			let taskItem = $("<li>" + JSON.stringify(item) + "</li>");
			let removeCmd = $("<input type='button' value=' Remove ' />");
			$(removeCmd).on('click',()=>{

			})
			$(removeCmd).appendTo($(taskItem));
			$('<span>  </span>').appendTo($(taskItem));

			let selectCmd = $("<input type='button' value=' Select ' />");
			$(selectCmd).on('click',()=>{
				doSelectTask(item.caseId);
			});
			$(selectCmd).appendTo($(taskItem));
			$('<span>  </span>').appendTo($(taskItem));

			let d = new Date(item.triggerAt);
			let offset = d.getTimezoneOffset();
			let utc = d.getTime() + (offset * 3600000);
			let nd = new Date(utc);
			$(taskItem).append(nd);

			$(taskItem).appendTo($(TaskDiv));
		});
	}
	doShowMasterNotify();
	//$('.main').append("<div>" + doShowLocalNotify() + "</div>");
}

const doShowMasterNotify = async function() {
	$('#MasterNotifyDiv').remove();
	const masterNotify = JSON.parse(localStorage.getItem('masternotify'));
	if (masterNotify) {
		await masterNotify.sort((a,b) => {
			let av = new Date(a.datetime);
			let bv = new Date(b.datetime);
			if (av && bv) {
				return bv - av;
			} else {
				return 0;
			}
		});

		let MasterNotifyDiv = $("<div id='MasterNotifyDiv'><ul></ul></div>");
		$(MasterNotifyDiv).appendTo($('.main'));
		masterNotify.forEach((item, i) => {
			let masterItem = $("<li>" + JSON.stringify(item) + "</li>");
			let openCmd = $("<input type='button' value=' Open ' />");
			$(openCmd).on('click',()=>{
				item.status = 'Read';
				localStorage.setItem('masternotify', JSON.stringify(masterNotify));
				doShowMasterNotify();
			})
			$(openCmd).appendTo($(masterItem));

			let removeCmd = $("<input type='button' value=' Remove ' />");
			$(removeCmd).on('click',()=>{
				masterNotify.splice(i, 1);
				localStorage.setItem('masternotify', JSON.stringify(masterNotify));
				doShowMasterNotify();
			})
			$(removeCmd).appendTo($(masterItem));
			$(masterItem).appendTo($(MasterNotifyDiv));
		});
		if (masterNotify.length > 0){
			let clearAllCmd = $("<input type='button' value=' Clear ' />");
			$(clearAllCmd).on('click',()=>{
				doClearMessage();
			});
			$(clearAllCmd).appendTo($(MasterNotifyDiv));
		}
	}
}

const doShowLocalNotify = function() {
	const localNotify = JSON.parse(localStorage.getItem('localnotify'));
	console.log(localNotify);
	return localNotify;
}

const doClearMessage = function(){
	localStorage.removeItem('masternotify');
	doShowMasterNotify();
}

const doSelectTask = async function(caseId){
	var taskApiUri = '/api/tasks/select/' + caseId;
  var params = {};
  var response = await $.post(taskApiUri, params);
  console.log(response);
}

function doShowUserProfile() {
  let userdata = JSON.parse(doGetUserData());
  let userinfo = userdata.userinfo;
  console.log(userdata);
  console.log(userdata.userinfo);

	$("#dialog").load('form/dialog.html', function() {
		$("#UserStaus").text(userdata.hospital.Hos_Name);
		//$("#OrgName").text(cookie.org[0].name);
		//$("#OrgName").text(cookie.org[0].name);
		//$("#PositionName").val(cookie.org[0].position);
		$("#Username").text(userdata.username);
		//$("#Password").val(upwd);
		$("#Name").val(userinfo.User_NameEN + ' ' + userinfo.User_LastNameEN);
		$("#Telno").val(userinfo.User_Phone);
		$("#Email").val(userinfo.User_Email);
		$("#LineId").val(userinfo.User_LineID);
		//$("#Comment").val(cookie.comment);
		$(".modal-footer").css('text-align', 'center');
		$("#SaveUserProfile-Cmd").click(function(){
			doSaveUserProfile();
		});
	});
}

function doSaveUserProfile(){
  alert('Now have not support yet.');
	$("#myModal").css("display", "none");
}

function doSaveSetting() {
	alert('Now have not support yet.');
}

const doGetToken = function (){
	return localStorage.getItem('token');
}

const doGetUserData = function (){
  return localStorage.getItem('userdata');
}

module.exports =  {
	doGetToken,
  doGetUserData,
}
