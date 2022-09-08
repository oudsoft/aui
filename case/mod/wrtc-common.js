const streammergerlib = require('./streammergermod.js');

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


let $ = undefined;

let userJoinOption = undefined;
let userMediaStream = undefined;
let displayMediaStream = undefined;
let localMergedStream = undefined;
let remoteConn = undefined;
let remoteTracks = undefined;
let streammerger = undefined;
let recorder = undefined;
let mergeMode = false;
let trackSenders = undefined;

const doSetupRemoteConn = function(peerConn){
  remoteConn = peerConn;
}

const doSetupUserJoinOption = function(joinOption){
  userJoinOption = joinOption;
}

const doGetRemoteConn = function(){
  return remoteConn;
}

const doGetStreamMerge = function(){
  return streammerger;
}

const doGetDisplayMediaStream = function(){
  return displayMediaStream;
}

const doGetUserMediaStream = function(){
  return userMediaStream;
}

const doGetRemoteTracks = function(){
  return remoteTracks;
}

const doMixStream = function(streams){
  if (streams.length > 0) {
    if ((streams[0].getVideoTracks()) && (streams[1].getVideoTracks())) {
      streammerger = streammergerlib.CallcenterMerger(streams, mergeOption);
      return streammerger.result;
    } else {
      return;
    }
  } else {
    return;
  }
}

const doSetupUserMediaStream = function(stream){
  userMediaStream = stream;
}

const doSetupDisplayMediaStream = function(stream){
  displayMediaStream = stream;
}

const doGetRecorder = function(){
  return recorder;
}

const doInitRTCPeer = function(stream, wsm) {
	let remoteConn = new RTCPeerConnection(rtcConfiguration);

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
			wsm.send(JSON.stringify(sendData));
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
			break;
			case "gathering":
				//label = "Determining route";
			break;
		}
	};

  if ((trackSenders) && (trackSenders.length > 0)) {
    trackSenders.forEach((sender, i) => {
      remoteConn.removeTrack(sender);
    });
  }

  trackSenders = [];
	stream.getTracks().forEach((track) => {
		let sender = remoteConn.addTrack(track, stream);
    trackSenders.push(sender);
	});

	remoteConn.ontrack = remoteConnOnTrackEvent;

  return remoteConn;
}

const remoteConnOnTrackEvent = function(event) {
  if (event.streams[0]) {
    /*
    if (recorder) {
      recorder.stopRecording().then(async()=>{
        let blob = await recorder.getBlob();
        if ((blob) && (blob.size > 0)) {
          invokeSaveAsDialog(blob);
          recorder = undefined;
        }
      });
    }
    */
    let myVideo = document.getElementById("MyVideo");

    let remoteStream = event.streams[0];

    remoteTracks = [];

    remoteStream.getTracks().forEach(function(track) {
      remoteTracks.push(track);
    });

    console.log(remoteTracks.length);

    let remoteMergedStream = undefined;
    /*
    if (userJoinOption.joinType === 'caller') {
      if (displayMediaStream) {
        let streams = [displayMediaStream, remoteStream];
        remoteMergedStream = doMixStream(streams);
      } else {
        let streams = [remoteStream, userMediaStream];
        remoteMergedStream = doMixStream(streams);
      }
    } else if (userJoinOption.joinType === 'callee') {
      if((userJoinOption.joinMode) && (userJoinOption.joinMode == 'face')) {
        let streams = [remoteStream, userMediaStream];
        remoteMergedStream = doMixStream(streams);
      } else {
        //share screen mode
        remoteMergedStream = remoteStream;
      }
    }
    */
    if (userJoinOption.joinMode == 'share') {
      remoteMergedStream = remoteStream;
    } else if (userJoinOption.joinMode == 'face') {
      let streams = [remoteStream, userMediaStream];
      remoteMergedStream = doMixStream(streams);      
    }
    myVideo.srcObject = remoteMergedStream;
    $('#CommandBox').find('#ShareWebRCTCmd').show();
    $('#CommandBox').find('#EndWebRCTCmd').show();
  }
}

const doCreateOffer = function(wsm) {
  if (remoteConn){
    remoteConn.createOffer(function (offer) {
    	remoteConn.setLocalDescription(offer);
      console.log(offer);
    	let sendData = {
    		type: "wrtc",
    		wrtc: "offer",
    		offer: offer ,
        sender: userJoinOption.joinName,
        sendto: userJoinOption.audienceName
    	};
      wsm.send(JSON.stringify(sendData));
      userJoinOption.joinType = 'caller';
    }, function (error) {
  		console.log(error);
  	});
  }
}

const doCreateInterChange = function(wsm) {
  mergeMode = true;
	let sendData = {
		type: "wrtc",
		wrtc: "interchange",
		interchange: {reason: 'Interchange with cmd.'},
		sender: userJoinOption.joinName,
    sendto: userJoinOption.audienceName
	};
  wsm.send(JSON.stringify(sendData));
  userJoinOption.joinMode = 'face';
}

const doCreateLeave = function(wsm) {
	let sendData = {
		type: "wrtc",
		wrtc: "leave",
		leave: {reason: 'Stop with cmd.'},
		sender: userJoinOption.joinName,
    sendto: userJoinOption.audienceName
	};
  wsm.send(JSON.stringify(sendData));
}

const wsHandleOffer = function(wsm, offer) {
  if (remoteConn) {
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
      wsm.send(JSON.stringify(sendData));
      userJoinOption.joinType = 'callee';
    }, function (error) {
      console.log(error);
    });
  }
}

const wsHandleAnswer = function(wsm, answer) {
  if (remoteConn){
    remoteConn.setRemoteDescription(new RTCSessionDescription(answer)).then(
      function() {
        console.log('remoteConn setRemoteDescription on wsHandleAnswer success.');
        if (userJoinOption.joinType === 'caller') {
          if (displayMediaStream) {
            let newStream = new MediaStream();
            doGetRemoteTracks().forEach((track) => {
              newStream.addTrack(track)
            });
            let myVideo = document.getElementById("MyVideo");
            let streams = [displayMediaStream, newStream];
            myVideo.srcObject = doMixStream(streams);
          } else {
            console.log('Your displayMediaStream is undefined!!');
          }
        } else if (userJoinOption.joinType === 'callee') {
          console.log('The callee request get share screen, Please wait and go on.');
        }
      }, 	function(error) {
        console.log('remoteConn Failed to setRemoteDescription:=> ' + error.toString() );
      }
    );
  }
}

const wsHandleCandidate = function(wsm, candidate) {
  if (remoteConn){
    remoteConn.addIceCandidate(new RTCIceCandidate(candidate)).then(
      function() {/* console.log(candidate) */},
      function(error) {console.log(error)}
    );
  }
}

const wsHandleInterchange = function(wsm, interchange) {
  //มีปัญหาเรื่อง
  //bundle.js:8846 Uncaught DOMException: Failed to execute 'addTrack' on 'RTCPeerConnection': A sender already exists for the track.
  userJoinOption.joinMode = 'face';
  if ((trackSenders) && (trackSenders.length > 0)) {
    trackSenders.forEach((sender, i) => {
      remoteConn.removeTrack(sender);
    });
  }
  if (userMediaStream) {
    userMediaStream.getTracks().forEach((track) => {
      remoteConn.addTrack(track, userMediaStream);
    });
    doCreateOffer(wsm);
  }
}

const wsHandleLeave = function(wsm, leave) {
  doEndCall(wsm);
}

const errorMessage = function(message, evt) {
	console.error(message, typeof evt == 'undefined' ? '' : evt);
	alert(message);
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
						resolve();
					} else {
						userMediaStream = stream;
						resolve(stream);
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

const doCreateControlCmd = function(id, iconUrl){
  let hsIcon = new Image();
  hsIcon.src = iconUrl;
  hsIcon.id = id;
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

const doCreateShareScreenCmd = function(){
  let shareScreenIconUrl = '/images/screen-capture-icon.png';
  let shareScreenCmd = doCreateControlCmd('ShareWebRCTCmd', shareScreenIconUrl);;
  return $(shareScreenCmd);
}

const doCreateStartCallCmd = function(){
  let callIconUrl = '/images/phone-call-icon-1.png';
  let callCmd = doCreateControlCmd('StartWebRCTCmd', callIconUrl);
  return $(callCmd)
}

const onShareCmdClickCallback = async function(callback){
  let captureStream = await doGetDisplayMedia();
  onDisplayMediaSuccess(captureStream, (stream)=>{
    callback(stream);
  });
}

const onDisplayMediaSuccess = function(stream, callback){
  stream.getTracks().forEach(function(track) {
    track.addEventListener('ended', function() {
      console.log('Stop Capture Stream.');
      track.stop();
      $('#CommandBox').find('#EndWebRCTCmd').click();
    }, false);
  });
  callback(stream);
}

const doGetDisplayMedia = function(){
  return new Promise(async function(resolve, reject) {
    let captureStream = undefined;
    if(navigator.mediaDevices.getDisplayMedia) {
      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(videoConstraints);
        resolve(captureStream);
      } catch(err) {
        console.error("Error: " + err);
        reject(err);
      }
    } else {
      try {
        captureStream = await navigator.getDisplayMedia(videoConstraints);
        resolve(captureStream);
      } catch(err) {
        console.error("Error: " + err);
        reject(err);
      }
    }
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

const doCreateEndCmd = function(){
  let endIconUrl = '/images/phone-call-icon-3.png';
  let endCmd = doCreateControlCmd('EndWebRCTCmd', endIconUrl);
  return $(endCmd);
}

const doEndCall = async function(wsm){
  /*
  if (recorder) {
    await recorder.stopRecording();
    let blob = await recorder.getBlob();
    if ((blob) && (blob.size > 0)) {
      invokeSaveAsDialog(blob);
      recorder = undefined;
    }
  }
  */
  let myVideo = document.getElementById("MyVideo");

  if (myVideo) {
    doCheckBrowser().then((stream)=>{
      myVideo.srcObject = stream;
    });
  }

  if (displayMediaStream) {
    displayMediaStream.getTracks().forEach((track)=>{
  		track.stop();
  	});
  }
  if (localMergedStream) {
    localMergedStream.getTracks().forEach((track)=>{
  		track.stop();
  	});
  }
  /*
  if (remoteConn) {
    remoteConn.close();
  }*/

  displayMediaStream = undefined;
  localMergedStream = undefined;

  $('#CommandBox').find('#ShareWebRCTCmd').show();
  $('#CommandBox').find('#StartWebRCTCmd').hide();
  $('#CommandBox').find('#EndWebRCTCmd').hide();
}


module.exports = (jq) => {
  $ = jq;
  return {
    streammergerlib,
    streammerger,
    videoInitSize,
    videoConstraints,
    mergeOption,

    mergeMode,
    userJoinOption,
    userMediaStream,
    displayMediaStream,
    localMergedStream,
    remoteConn,

    /************************/

    doSetupRemoteConn,
    doSetupUserJoinOption,
    doGetRemoteConn,
    doGetStreamMerge,
    doGetDisplayMediaStream,
    doGetUserMediaStream,
    doGetRemoteTracks,
    doMixStream,
    doSetupUserMediaStream,
    doSetupDisplayMediaStream,
    doGetRecorder,
    doInitRTCPeer,
    doCreateOffer,
    doCreateInterChange,
    doCreateLeave,

    wsHandleOffer,
    wsHandleAnswer,
    wsHandleCandidate,
    wsHandleInterchange,
    wsHandleLeave,
    doCheckBrowser,
    doCreateControlCmd,
    doCreateShareScreenCmd,
    onShareCmdClickCallback,
    doCreateStartCallCmd,
    doCreateEndCmd,
    onDisplayMediaSuccess,
    doGetDisplayMedia,
    setScaleDisplay,
    doEndCall
  }
}
