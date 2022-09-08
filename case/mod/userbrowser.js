//userbrowser.js
var userMediaStream = null;

function errorMessage(message, e) {
	console.error(message, typeof e == 'undefined' ? '' : e);
	alert(message);
}

const checkBrowser = function() {
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

const getUserMediaStream = function() {
	return userMediaStream;
}

const doCloseUserMediaStream = function() {
	if (userMediaStream){
		userMediaStream.getTracks().forEach((track) => {
			track.stop();
		});
		userMediaStream = null;
		var meVideo = document.getElementById("meVideo");
		meVideo.srcObject = null;
	}
}

module.exports = {
	checkBrowser,
	getUserMediaStream,
	doCloseUserMediaStream
};
