/* main.js */

window.$ = window.jQuery = require('jquery');

/*****************************/
window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

let userJoinOption, wsm, userMediaStream, displayMediaStream, localMergedStream;
let remoteConn = null;

const util = require('../case/mod/utilmod.js')($);
const common = require('../case/mod/commonlib.js')($);
const streamMerger = require('./mod/streammergermod.js');

const videoInitSize = {width: 437, height: 298};
const videoConstraints = {video: true, audio: false};
const mergeOption = {
  width: 520,
  height: 310,
  fps: 25,
  clearRect: true,
  audioContext: null
};

/* https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b */
const rtcConfiguration = {
	'iceServers': [
	 {url: 'stun:stun2.l.google.com:19302'},
	 {url: 'turn:numb.viagenie.ca',
		credential: 'muazkh',
		username: 'webrtc@live.com'
	 }
	]
};

$( document ).ready(function() {
  const initPage = function() {
    let userdata = localStorage.getItem('userdata');
    if (userdata !== 'undefined') {
      userdata = JSON.parse(userdata);
      console.log(userdata);
      doLoadMainPage();
    }
  }
  initPage();
});

function doLoadMainPage(){
  let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
  let jqueryNotifyUrl = '../lib/notify.min.js';
  let utilityPlugin = "../setting/plugin/jquery-radutil-plugin.js";

  $('head').append('<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />');
  $('head').append('<meta http-equiv="Pragma" content="no-cache" />');

  $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
	//https://carlosbonetti.github.io/jquery-loading/
	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  $('head').append('<script src="' + jqueryNotifyUrl + '"></script>');
  $('head').append('<script src="' + utilityPlugin + '"></script>');

  $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
  $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

  $('body').loading({overlay: $("#overlay"), stoppable: true});

  let joinOptionBox = doCreateJoinOptionBox(onJoinOptionSubmit);
  $("body").append($(joinOptionBox));
}

const onJoinOptionSubmit = function(joinOption){
  doCheckBrowser().then((checkResult)=>{
    userJoinOption = joinOption;
    console.log(userJoinOption);
    if (checkResult) {
      $("body").empty();
      $("body").append($('<div id="VideoBox" style="width: 100%; text-align: center;"></div>').append($('<video id="MyVideo" width="520" height="290" autoplay/>')));
      let myVideo = document.getElementById("MyVideo");
      let displaySize = setScaleDisplay(videoInitSize.width, videoInitSize.height, 10, 20);
      myVideo.width = displaySize.width;
      myVideo.height = displaySize.height;
      myVideo.srcObject = userMediaStream;

      wsm = util.doConnectWebsocketMaster(userJoinOption.joinName, 5, 1, 'none');
      wsm.onmessage = onNewMessage;

      if (userJoinOption.joinType == 'caller'){
        let shareScreenIconUrl = '/images/screen-capture-icon.png';
        let shareScreenCmd = doCreateControlCmd(shareScreenIconUrl);;
        $(shareScreenCmd).on("click", async function(evt){
          await doGetDisplayMedia(onDisplayMediaSuccess);
          let callIconUrl = '/images/phone-call-icon-1.png';
          let callCmd = doCreateControlCmd(callIconUrl);;
          $(callCmd).on("click", function(evt){
            doShowCalleeListDialog();
          });
          //$(shareScreenCmd).hide();
          $("body").find('#CommandBox').empty();
          $("body").find('#CommandBox').append($(callCmd));
        });
        $("body").append($('<div id="CommandBox" style="width: 100%; text-align: center;"></div>').append($(shareScreenCmd)));
      } else if (userJoinOption.joinType === 'callee') {
        doInitRTCPeer(userMediaStream);
        //console.log(remoteConn);
        $("body").append($('<div id="CommandBox" style="width: 100%; text-align: center;"></div>'));
      }
    }
  });
}

const onDisplayMediaSuccess = function(stream){
  let vw, vh;
  let myVideo = document.getElementById("MyVideo");
  stream.getTracks().forEach(function(track) {
    track.addEventListener('ended', function() {
      console.log('Stop Stream.');
    }, false);
  });

  displayMediaStream = stream;
  let streams = [displayMediaStream, userMediaStream];
  let myMerger = streamMerger.CallcenterMerger(streams, mergeOption);
  localMergedStream = myMerger.result
  myVideo.srcObject = localMergedStream;

  myVideo.addEventListener( "loadedmetadata", function (e) {
    vw = this.videoWidth;
    vh = this.videoHeight;
    myVideo.width = vw;
    myVideo.height = vh;
  });
}

const doCreateJoinOptionBox = function(submitFormCallback){
  let joinOptionBox = $('<div></div>');
  let joinOptionForm = $('<table  width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
  let formRow = $('<tr></tr>');
  let labelCell = $('<td colspan="2"><h3>โปรดเลือกและระบุชื่อ</h3></td>');
  $(formRow).append($(labelCell));
  $(joinOptionForm).append($(formRow));
  formRow = $('<tr></tr>');
  labelCell = $('<td width="35%">เช้าร่วมแบบ</td>');
  let valueCell = $('<td width="*"></td>');
  let joinTypeSelect = $('<select></select>');
  $(joinTypeSelect).append($('<option value="caller">ผู้เรียกสาย</option>'));
  $(joinTypeSelect).append($('<option value="callee">ผู้รับสาย</option>'));
  $(valueCell).append($(joinTypeSelect));
  $(formRow).append($(labelCell)).append($(valueCell));
  $(joinOptionForm).append($(formRow));

  formRow = $('<tr></tr>');
  labelCell = $('<td width="35%">ชื่อผู้เช้าร่วม</td>');
  valueCell = $('<td width="*"></td>');
  let joinNameValue = $('<input type="text" size="30"/>');
  $(valueCell).append($(joinNameValue));
  $(formRow).append($(labelCell)).append($(valueCell));
  $(joinOptionForm).append($(formRow));

  formRow = $('<tr></tr>');
  labelCell = $('<td colspan="2" align="center"></td>');
  let submitFormCmd = $('<input type="button" value=" ตกลง "/>');
  $(labelCell).append($(submitFormCmd));
  $(formRow).append($(labelCell));
  $(joinOptionForm).append($(formRow));

  $(submitFormCmd).on('click', (evt)=>{
    let joinType = $(joinTypeSelect).val();
    let joinName = $(joinNameValue).val();
    let joinOption = {joinType, joinName};
    submitFormCallback(joinOption);
  });

  return $(joinOptionBox).append($(joinOptionForm));
}

const doCreateControlCmd = function(iconUrl){
  let hsIcon = new Image();
  hsIcon.src = iconUrl;
  $(hsIcon).css({"width": "40px", "height": "auto", "cursor": "pointer", "padding": "2px"});
  $(hsIcon).css({'border': '4px solid grey', 'border-radius': '5px', 'margin': '4px'});
  $(hsIcon).prop('data-toggle', 'tooltip');
  $(hsIcon).prop('title', "Share Screen");
  $(hsIcon).hover(()=>{
    $(hsIcon).css({'border': '4px solid grey'});
  },()=>{
    $(hsIcon).css({'border': '4px solid #ddd'});
  });
  return $(hsIcon);
}

const errorMessage = function(message, evt) {
	console.error(message, typeof evt == 'undefined' ? '' : evt);
	alert(message);
}

const doCheckBrowser = function() {
	return new Promise(function(resolve, reject) {
		if (location.protocol === 'https:') {
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
			if (navigator.getUserMedia) {
				//const vidOption = {audio: true, video: {facingMode: 'user',frameRate: 30, width : 640, height:480}};
				const vidOption = { audio: true, video: true };
				navigator.getUserMedia(vidOption, function (stream) {
					var mediaStreamTrack = stream.getVideoTracks()[0];
					if (typeof mediaStreamTrack == "undefined") {
						errorMessage('Permission denied!');
						resolve(false);
					} else {
						userMediaStream = stream;
						resolve(true);
					}
				}, function (e) {
					var message;
					switch (e.name) {
						case 'NotFoundError':
						case 'DevicesNotFoundError':
							message = 'Please setup your webcam first.';
							break;
						case 'SourceUnavailableError':
							message = 'Your webcam is busy';
							break;
						case 'PermissionDeniedError':
						case 'SecurityError':
							message = 'Permission denied!';
							break;
						default: errorMessage('Reeeejected!', e);
							resolve(false);
					}
					errorMessage(message);
					resolve(false);
				});
			} else {
				errorMessage('Uncompatible browser!');
				resolve(false);
			}
		} else {
			errorMessage('Please use https protocol for open this page.');
			resolve(false);
		}
	});
}

const doGetDisplayMedia = function(invokeGetDisplayMedia){
  return new Promise(function(resolve, reject) {
    if(navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia(videoConstraints).then(invokeGetDisplayMedia).catch(doGetScreenSignalError);
    } else {
      navigator.getDisplayMedia(videoConstraints).then(invokeGetDisplayMedia).catch(doGetScreenSignalError);
    }
    resolve();
  });
}

const setScaleDisplay = function( width, height, padding, border ) {
   var scrWidth = $( window ).width() - 30,
   scrHeight = $( window ).height() - 30,
   ifrPadding = 2 * padding,
   ifrBorder = 2 * border,
   ifrWidth = width + ifrPadding + ifrBorder,
   ifrHeight = height + ifrPadding + ifrBorder,
   h, w;

   if ( ifrWidth < scrWidth && ifrHeight < scrHeight ) {
	  w = ifrWidth;
	  h = ifrHeight;
   } else if ( ( ifrWidth / scrWidth ) > ( ifrHeight / scrHeight ) ) {
	  w = scrWidth;
	  h = ( scrWidth / ifrWidth ) * ifrHeight;
   } else {
	  h = scrHeight;
	  w = ( scrHeight / ifrHeight ) * ifrWidth;
   }
   return {
	  width: w - ( ifrPadding + ifrBorder ),
	  height: h - ( ifrPadding + ifrBorder )
   };
}

const doGetScreenSignalError =  function(evt){
  var error = {
    name: evt.name || 'UnKnown',
    message: evt.message || 'UnKnown',
    stack: evt.stack || 'UnKnown'
  };
  console.error(error);
  if(error.name === 'PermissionDeniedError') {
    if(location.protocol !== 'https:') {
      error.message = 'Please use HTTPs.';
      error.stack   = 'HTTPs is required.';
    }
  }
}

const doShowCalleeListDialog = async function(){
  let calleeListForm = await doCreateUserOnlineList();
  const calleelistformoption = {
    title: 'โปรดเลือกผู้รับสาย',
    msg: $(calleeListForm),
    width: '520px',
    onOk: async function(evt) {
      let calleeName = $('input[name="CalleeList"]:checked').val();
      if ((calleeName) && (calleeName !== '')) {
        calleeListFormHandle.closeAlert();
        onSelectCallee(calleeName);
      }
    },
    onCancel: function(evt){
      calleeListFormHandle.closeAlert();
    }
  }
  let calleeListFormHandle = $('body').radalert(calleelistformoption);
}

const doCallOnlineSocket = function(){
  return new Promise(async function(resolve, reject) {
    let callUrl = '/api/dicomtransferlog/socket/clients';
    let params = {};
    $.get(callUrl, params).then((response) => {
      resolve(response);
    });
  });
}

const doCreateUserOnlineList = function(){
  return new Promise(async function(resolve, reject) {
    let socketRes = await doCallOnlineSocket();
    const radioBtnStyle = {'transform': 'scale(2.2)'};
    const radioLabelStyle = {'position': 'relative', 'top': '-1px', 'margin-left': '15px'};
    let onlineSelectBox = $('<div></div>').css({'margin-top': '6px'});
    let sockets = socketRes.Clients;
    let	promiseList = new Promise(async function(resolve2, reject2){
      for (let i=0; i < sockets.length; i++){
        if (sockets[i].id != userJoinOption.joinName) {
          let calleeOption = $('<input type="radio" name="CalleeList" value="' + sockets[i].id + '"/>').css(radioBtnStyle);
          let calleeName = $('<label>' + sockets[i].id + '</label>').css(radioLabelStyle);
          $(onlineSelectBox).append($(calleeOption)).append($(calleeName));
        }
      }
      setTimeout(()=>{
        resolve2($(onlineSelectBox));
      }, 100);
    });
    Promise.all([promiseList]).then((ob)=>{
      resolve(ob[0]);
    });
  });
}

const onSelectCallee = function(calleeName){
  console.log(calleeName);
  userJoinOption.audienceName = calleeName;
  doInitRTCPeer(localMergedStream);
  setTimeout(() => {
    doCreateOffer();
  }, 2500);
}

const doCreateEndCmd = function(){
  let endIconUrl = '/images/phone-call-icon-3.png';
  let endCmd = doCreateControlCmd(endIconUrl);
  let commandBox = $("body").find('#CommandBox');
  if (commandBox) {
    $(commandBox).empty().append($(endCmd));
  } else {
    $("body").append($('<div id="CommandBox" style="width: 100%; text-align: center;"></div>').append($(endCmd)));
  }
  return $(endCmd);
}

const doEndCall = function(evt){
  let myVideo = document.getElementById("MyVideo");
  let remoteStream = myVideo.srcObject;
  if (remoteStream) {
    remoteStream.getTracks().forEach((track)=>{
    	track.stop();
    });
  }

  userMediaStream.getTracks().forEach((track)=>{
		track.stop();
	});
  displayMediaStream.getTracks().forEach((track)=>{
		track.stop();
	});
  localMergedStream.getTracks().forEach((track)=>{
		track.stop();
	});
  if (remoteConn) {
    remoteConn.close();
  }
  let joinOptionBox = doCreateJoinOptionBox(onJoinOptionSubmit);
  $("body").empty().append($(joinOptionBox));

  doCreateLeave();
}

/**********************************************/
// WebRTC Section */

const doGetWsState = function() {
	if (wsm) {
		return wsm.readyState;
	} else {
		return -1;
	}
}

const doSendSocketData = function(data){
	if (doGetWsState() == 1){
		wsm.send(JSON.stringify(data));
	} else {
		console.log('WS not already state.')
	}
}

const doInitRTCPeer = function(stream) {
	remoteConn = new RTCPeerConnection(rtcConfiguration);

	// Setup ice handling
	remoteConn.onicecandidate = function (event) {
		if (event.candidate) {
			let sendData = {
				type: "wrtc",
				wrtc: "candidate",
				candidate: event.candidate,
        sender: userJoinOption.joinName,
        sendto: userJoinOption.audienceName
			};
			doSendSocketData(sendData);
		}
	};

	remoteConn.oniceconnectionstatechange = function(event) {
		const peerConnection = event.target;
		console.log('ICE state change event: ', event);
		remoteConn = peerConnection;
	};

	remoteConn.onicegatheringstatechange = function() {
		switch(remoteConn.iceGatheringState) {
			case "new":
			case "complete":
				//label = "Idle";
				console.log(remoteConn.iceGatheringState);
				//เริ่มส่ง stream ให้ client อัตโนมัติ
				//wsHandleStart(null, 'remote', clientId)
			break;
			case "gathering":
				//label = "Determining route";
			break;
		}
	};

	stream.getTracks().forEach((track) => {
		remoteConn.addTrack(track, stream);
	});

	remoteConn.ontrack = function(event) {
		if (event.streams[0]) {
      let myVideo = document.getElementById("MyVideo");
    	let remoteStream = event.streams[0];
      if (userJoinOption.joinType === 'caller') {
        let streams = [displayMediaStream, remoteStream];
        let myMerger = streamMerger.CallcenterMerger(streams, mergeOption);
        let remoteMergedStream = myMerger.result
        myVideo.srcObject = remoteMergedStream;
        console.log('caller new stream');
      } else if (userJoinOption.joinType === 'callee') {
        myVideo.srcObject = remoteStream;
        console.log('callee new stream');
      }
      let endCmd = doCreateEndCmd();
      $(endCmd).on("click", function(evt){
        doEndCall(evt);
      });
    }
  }
}

const onNewMessage = function(msg) {
  if (msg.data !== '') {
    var data = JSON.parse(msg.data);
    console.log(data);
    switch(data.type) {
      case "wrtc":
        switch(data.wrtc) {
          //when somebody wants to call us
          case "offer":
            wsHandleOffer(data.offer);
            if ((!userJoinOption.audienceName) || (userJoinOption.audienceName !== data.sender)) {
              userJoinOption.audienceName = data.sender;
            }
          break;
          case "answer":
            wsHandleAnswer(data.answer);
          break;
          //when a remote peer sends an ice candidate to us
          case "candidate":
            wsHandleCandidate(data.candidate);
          break;
          case "leave":
            wsHandleLeave(data.leave);
          break;
        }
      break;
    }
  } else {
    console.log(msg);
  }
}

const doCreateOffer = function() {
  if (remoteConn){
    remoteConn.createOffer(function (offer) {
    	remoteConn.setLocalDescription(offer);
    	let sendData = {
    		type: "wrtc",
    		wrtc: "offer",
    		offer: offer ,
        sender: userJoinOption.joinName,
        sendto: userJoinOption.audienceName
    	};
    	doSendSocketData(sendData);
    }, function (error) {
    	alert("WSError when creating an offer");
    });
  }
}

const wsHandleOffer = function(offer) {
	remoteConn.setRemoteDescription(new RTCSessionDescription(offer));
	remoteConn.createAnswer(function (answer) {
		remoteConn.setLocalDescription(answer);
		let sendData = {
			type: "wrtc",
			wrtc: "answer",
			answer: answer,
      sender: userJoinOption.joinName,
      sendto: userJoinOption.audienceName
		};
		doSendSocketData(sendData);
	}, function (error) {
		console.log(JSON.stringify(error));
		alert("Error when creating an answer");
	});
}

const wsHandleAnswer = function(answer) {
	if (remoteConn){
		remoteConn.setRemoteDescription(new RTCSessionDescription(answer)).then(
			function() {
				console.log('remoteConn setRemoteDescription success.');
				//console.log(remoteConn);
			}, 	function(error) {
				console.log('remoteConn Failed to setRemoteDescription:=> ' + error.toString() );
			}
		);
  }
}

const wsHandleCandidate = function(candidate) {
	if (remoteConn){
		remoteConn.addIceCandidate(new RTCIceCandidate(candidate)).then(
			function() {/* console.log(candidate) */},
			function(error) {console.log(error)}
		);
	}
}

const wsHandleLeave = function(leave) {
  let myVideo = document.getElementById("MyVideo");
  let remoteStream = myVideo.srcObject;
  /*
  if (userMediaStream) {
    myVideo.srcObject = userMediaStream;
  } else {
    myVideo.pause();
  }
  */
  userMediaStream.getTracks().forEach((track)=>{
		track.stop();
	});
  if (remoteStream) {
    remoteStream.getTracks().forEach((track)=>{
    	track.stop();
    });
  }
  if (remoteConn) {
    remoteConn.close();
  }
  let joinOptionBox = doCreateJoinOptionBox(onJoinOptionSubmit);
  $("body").empty().append($(joinOptionBox));
}

const doCreateLeave = function() {
	let sendData = {
		type: "wrtc",
		wrtc: "leave",
		leave: {reason: 'Stop with cmd.'},
		sender: userJoinOption.joinName,
    sendto: userJoinOption.audienceName
	};
	doSendSocketData(sendData);
}
