/* home.js */

module.exports = function ( jq ) {
	const $ = jq;

	const welcome = require('./welcome.js')($);
	const login = require('./login.js')($);

	const urlQueryToObject = function(url) {
	  let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
	    return paramPair.split(/=(.+)?/).slice(0, 2);
	  }).reduce(function (obj, pairArray) {
	    obj[pairArray[0]] = pairArray[1];
	    return obj;
	  }, {});
	  return result;
	}

	const doShowHome = function(){

		$('body').css({'background-image': 'url("/images/logo-radconnext.png")', 'background-color': '#cccccc'});
		let openCmdLink = doCreateOpenLoginForm();
		$('body').append($(openCmdLink));

		let queryUrl = urlQueryToObject(window.location.href);
		if (queryUrl.action === 'register'){
			login.doOpenRegisterForm();
		} else {
			//doLoadLoginForm();
			login.doCheckUserData();
		}
	}

	const doLoadLoginForm = function(){
		login.doLoadLoginForm();
	}

	const doCreateOpenLoginForm = function(){
		let openCmdLinkBox = $('<ul></ul>');
		let openLoginCmd = $('<li><a href="#">เข้าสู่ระบบ</a></li>');
		$(openLoginCmd).on('click', (evt)=>{
			login.doLoadLoginForm();
		});
		$(openCmdLinkBox).append($(openLoginCmd));

		let openRegisterCmd = $('<li><a href="#">ลงทะเบียนใช้งาน</a></li>');
		$(openRegisterCmd).on('click', (evt)=>{
			login.doOpenRegisterForm();
		});
		$(openCmdLinkBox).append($(openRegisterCmd));

		$(openCmdLinkBox).css({'font-family': 'EkkamaiStandard', 'font-size': '24px', 'font-weight': 'normal'});
		$(openCmdLinkBox).center();
		return $(openCmdLinkBox);
	}

	////////////////////////////////////////////////////////
	const doLoadHome = function(){
		let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
		let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
		let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
		let jqueryNotifyUrl = '../lib/notify.min.js';

		$('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
		$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
		//https://carlosbonetti.github.io/jquery-loading/
		$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
		//https://notifyjs.jpillora.com/
		$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');

		$('body').append($('<div id="overlay"><div class="loader"></div></div>'));

	  $('body').loading({overlay: $("#overlay"), stoppable: true});

		$('body').loading('start');
		$('body').load('form/login.html', function(){
			$('#LeftSideBox').load('/shop/lib/feeder/login-leftside.js', function(leftsideJS){
				let leftsideResult = eval(leftsideJS);
	      $('#LeftSideBox').empty().append($(leftsideResult.handle));
				$('#RightSideBox').load('/shop/lib/feeder/login-form.js', function(formJS){
					let formResult = eval(formJS);
		      $('#RightSideBox').empty().append($(formResult.handle));
					let isMobileDevice = formResult.isMobileDevice();
					if (isMobileDevice) {
						console.log('ok');
						$('body').empty();
						$('body').css({'height': 'calc(100vh)', 'font-family': 'EkkamaiStandard', 'font-size': '18px'});
						/*
						$('#LeftSideBox').hide();
						$('#RightSideBox').find(">:first-child").css({'width': '90%', 'margin-top': '-280px'});
						$('#RightSideBox').removeAttr('style');
						$('#ViewBox').removeAttr('style');
						*/
						const loginBox = $('<div id="LoginForm"></div>');
					  $(loginBox).css({'position': 'relative', 'width': '100%'});
					  const radconnextOption = {};
					  const myRadconnextLoginForm = $(loginBox).loginform(radconnextOption);
						$('body').append($(loginBox));
						$(loginBox).find('input[type="text"]').css({'font-family': 'EkkamaiStandard', 'font-size': '18px'});
						$(loginBox).find('input[type="password"]').css({'font-family': 'EkkamaiStandard', 'font-size': '18px'});
						$(loginBox).find('input[type="button"]').css({'font-family': 'EkkamaiStandard', 'font-size': '18px', 'height': '35px'});
						$(loginBox).find('input[type="checkbox"]').css({'transform': 'scale(1.4)'});
					}
					$('body').loading('stop');
				});
			});
		});
	}

	return {
		doShowHome,
		doLoadLoginForm,
		//////////////////////////////
		doLoadHome
	}
}
