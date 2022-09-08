/* welcomelib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
	const common = require('../../case/mod/commonlib.js')($);
	const caseCounter = require('./onrefreshtrigger.js')($);
	const wrtcCommon = require('../../case/mod/wrtc-common.js')($);

	let newstatusCases = [];
  let accstatusCases = [];
	let newConsult = [];

	//let dicomzipsync = [];

  const doCreateHomeTitlePage = function() {
    const welcomeTitle = 'ยินดีต้อนรับเข้าสู่ระบบ Rad Connext';
    let homeTitle = $('<div></div>');
    let logoPage = $('<img src="/images/home-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(homeTitle));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + welcomeTitle + '</h3></div>');
    $(titleText).appendTo($(homeTitle));

		$('.case-counter').hide();
		$('.consult-counter').hide();

    return $(homeTitle);
  }

	const doShowCaseCounter = function(){
    if (newstatusCases.length > 0) {
    	$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').text(newstatusCases.length);
      $('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
      $('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }

    if (accstatusCases.length > 0) {
			$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').text(accstatusCases.length);
      $('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
      $('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }
  }

	/** Case Event Counter **/
  const onCaseChangeStatusTrigger = function(evt) {
		let triggerData = evt.detail.data;
		let caseId = triggerData.caseId;
		let statusId = triggerData.statusId;
		let thing = triggerData.thing;

    let indexAt = undefined;
    switch (Number(statusId)) {
      case 1:
        if (newstatusCases.indexOf(Number(caseId)) < 0) {
					if (thing === 'case') {
          	newstatusCases.push(caseId);
					} else if (thing === 'consult'){
						newConsult.push(caseId);
					}
        }
      break;
      case 2:
			case 8:
      case 9:
      case 13:
			case 14:
				if (thing === 'case') {
	        if (accstatusCases.indexOf(Number(caseId)) < 0) {
	          accstatusCases.push(caseId);
	        }
	        indexAt = newstatusCases.indexOf(caseId);
	        if (indexAt > -1) {
	          newstatusCases.splice(indexAt, 1);
	        }
				} else if (thing === 'consult'){
					indexAt = newConsult.indexOf(caseId);
					if (indexAt > -1) {
	          newConsult.splice(indexAt, 1);
	        }
				}
      break;
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 10:
      case 11:
      case 12:
				if (thing === 'case') {
	        indexAt = newstatusCases.indexOf(caseId);
	        if (indexAt > -1) {
	          newstatusCases.splice(indexAt, 1);
	        }
	        indexAt = accstatusCases.indexOf(caseId);
	        if (indexAt > -1) {
	          accstatusCases.splice(indexAt, 1);
	        }
				} else if (thing === 'consult'){
					indexAt = newConsult.indexOf(caseId);
					if (indexAt > -1) {
	          newConsult.splice(indexAt, 1);
	        }
				}
      break;
    }
    doShowCaseCounter();
  }

	const doLoadCaseForSetupCounter = function(userId){
		return new Promise(async function(resolve, reject) {
			let loadUrl = '/api/cases/load/list/by/status/radio';
			let rqParams = {userId: userId};
			rqParams.casestatusIds = [[1], [2, 8, 9, 13, 14]];
			/*
			rqParams.casestatusIds = [1];
			let newList = await common.doCallApi(loadUrl, rqParams);
			if (newList.status.code == 200){
			*/
			let allStatusList = await common.doCallApi(loadUrl, rqParams);
			if (allStatusList.status.code == 200){
				/*
				rqParams.casestatusIds = [2, 8, 9, 13, 14];
				let accList = await common.doCallApi(loadUrl, rqParams);
				*/
				loadUrl = '/api/consult/load/list/by/status/radio';
				rqParams = {userId: userId};
				rqParams.casestatusIds = [1];
				let newConsultList = await common.doCallApi(loadUrl, rqParams);
				resolve({newList: allStatusList.Records[0], accList:allStatusList.Records[1], newConsultList});
			} else 	if (allStatusList.status.code == 210) {
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at /api/cases/load/list/by/status/radio';
				console.log(apiError);
				reject({error: apiError});
			}
		});
	}

	const doSetupCounter = function() {
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			doLoadCaseForSetupCounter(userId).then(async (myList)=>{
				//console.log(myList);
				newstatusCases = [];
			  accstatusCases = [];

				newConsult = [];

				//dicomzipsync = [];

				await myList.newList.Records.forEach((item, i) => {
					newstatusCases.push(Number(item.id));
				});
				await myList.accList.Records.forEach((item, i) => {
					accstatusCases.push(Number(item.id));
					//let newDicomZipSync = {caseId: item.id, studyID: item.Case_OrthancStudyID};
					//dicomzipsync.push(newDicomZipSync);
				});
				myList.newConsultList.Records.forEach((item, i) => {
					newConsult.push(Number(item.id));
				});
				//localStorage.setItem('dicomzipsync', JSON.stringify(dicomzipsync));
				caseCounter.doShowCaseCounter(newstatusCases, accstatusCases, newConsult);
				$('body').loading('stop');
				resolve(myList);
			}).catch((err)=>{
				reject(err);
			});
		});
	}
	/** Case event Counter **/

	/** Zoom Calle Event **/
	const doInterruptZoomCallEvt = function(evt) {
		$('body').loading('start');
		const main = require('../main.js');
		let myWsm = main.doGetWsm();

		let radAlertMsg = $('<div></div>');
		$(radAlertMsg).append($('<p>คุณมีสายเรียกเข้าเพื่อ Conference ทาง Zoom</p>'));
		$(radAlertMsg).append($('<p>คลิก ตกลง เพื่อรับสายและเปิด Zoom Conference</p>'));
		$(radAlertMsg).append($('<p>หรือ คลิก ยกเลิก เพื่อปฏิเสธการรับสาย</p>'));
		const radconfirmoption = {
			title: 'Zoom Conference',
			msg: $(radAlertMsg),
			width: '420px',
			onOk: function(evt) {
				let callData = evt.detail.data;
				alert('Password ในการเข้าร่วม Conference คิอ ' + callData.password + '\n');
				window.open(callData.openurl, '_blank');
				//Say yes back to caller
				let callZoomMsg = {type: 'callzoomback', sendTo: callData.sender, result: 1};
				myWsm.send(JSON.stringify(callZoomMsg));
				$('body').loading('stop');
				radConfirmBox.closeAlert();
			},
			onCancel: function(evt){
				let callZoomMsg = {type: 'callzoomback', sendTo: callData.sender, result: 0};
				myWsm.send(JSON.stringify(callZoomMsg));
				$('body').loading('stop');
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

	let dlgContent = undefined;

	const doInterruptWebRTCCallEvt = function(evt){
		$('body').loading('start');
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		const main = require('../main.js');
		const wsm = main.doGetWsm();
		//wrtcCommon.doSetupWsm(wsm);

		let callData = evt.detail.data;
		//console.log(callData);

		wrtcCommon.doCheckBrowser().then((stream)=>{
			if (stream) {
				$('head').append('<script src="../lib/RecordRTC.min.js"></script>');
				wrtcCommon.doSetupUserMediaStream(stream);
				let userJoinOption = {joinType: 'callee', joinMode: 'share', joinName: userdata.username, audienceName: callData.sender, userMediaStream: stream};
				wrtcCommon.doSetupUserJoinOption(userJoinOption);

				let webrtcBox = undefined;

				if (!dlgContent) {
					dlgContent = doCreateWebRCTDlgContent();
					let radwebrctoption = {
						title: 'Video Conference [' + callData.topic + ']',
						msg: $(dlgContent),
						width: '620px',
						onOk: function(evt) {
							/*
							if (wrtcCommon.doGetRecorder()) {
								await wrtcCommon.doGetRecorder().stopRecording();
								let blob = await wrtcCommon.doGetRecorder().getBlob();
								if ((blob) && (blob.size > 0)) {
				          invokeSaveAsDialog(blob);
				        }
							}
							*/
							if (wrtcCommon.doGetDisplayMediaStream()){
								wrtcCommon.doGetDisplayMediaStream().getTracks().forEach(function(track) {
		  						track.stop();
								});
							}
							if (wrtcCommon.doGetUserMediaStream()){
								wrtcCommon.doGetUserMediaStream().getTracks().forEach(function(track) {
		  						track.stop();
								});
							}
							if (wrtcCommon.doGetRemoteConn()) {
								wrtcCommon.doGetRemoteConn().close();
							}
							wrtcCommon.doCreateLeave(wsm);
							webrtcBox.closeAlert();
						}
					}
					webrtcBox = $('body').radalert(radwebrctoption);
					$(webrtcBox.cancelCmd).hide();
				}
				let myVideo = document.getElementById("MyVideo");
				myVideo.srcObject = wrtcCommon.doGetUserMediaStream();

				let shareCmd = wrtcCommon.doCreateShareScreenCmd();
				$(shareCmd).on('click', (evt)=>{
					wrtcCommon.onShareCmdClickCallback((myDisplayMediaStream)=>{
						if (wrtcCommon.doGetDisplayMediaStream()){
							wrtcCommon.doGetDisplayMediaStream().getTracks().forEach(function(track) {
								track.stop();
							});
						}
						wrtcCommon.doCreateInterChange(wsm);
						wrtcCommon.doSetupDisplayMediaStream(myDisplayMediaStream);
					  let streams = [wrtcCommon.doGetDisplayMediaStream(), wrtcCommon.doGetUserMediaStream()];
						let localMergedStream = wrtcCommon.doMixStream(streams);
					  let myVideo = document.getElementById("MyVideo");
						let lastStream = myVideo.srcObject;
					  myVideo.srcObject = localMergedStream;
						setTimeout(()=>{
							let myRemoteConn = wrtcCommon.doGetRemoteConn();
							if (myRemoteConn) {
								myRemoteConn.removeStream(lastStream);
								localMergedStream.getTracks().forEach((track) => {
						      myRemoteConn.addTrack(track, localMergedStream);
						    });
								$(startCmd).click();
							} else {
						    myRemoteConn = wrtcCommon.doInitRTCPeer(localMergedStream, wsm);
								localMergedStream.getTracks().forEach((track) => {
						      myRemoteConn.addTrack(track, localMergedStream);
						    });
						    wrtcCommon.doSetupRemoteConn(myRemoteConn);
								$(startCmd).click();
							}
						}, 500);
						$(shareCmd).show();
						$(startCmd).hide();
						$(endCmd).show();
					});
				});
				let startCmd = wrtcCommon.doCreateStartCallCmd();
				$(startCmd).on('click', (evt)=>{
					userJoinOption.joinType = 'caller'
					wrtcCommon.doSetupUserJoinOption(userJoinOption);
					wrtcCommon.doCreateOffer(wsm)
					$(shareCmd).show();
					$(startCmd).hide();
					$(endCmd).show();
				});
				let endCmd = wrtcCommon.doCreateEndCmd();
				$(endCmd).on('click', async (evt)=>{
					if (wrtcCommon.doGetDisplayMediaStream()) {
						wrtcCommon.doGetDisplayMediaStream().getTracks().forEach((track) => {
				      track.stop();
				    });
					}
					let lastStream = myVideo.srcObject;
					let remoteConn = wrtcCommon.doGetRemoteConn();
					remoteConn.removeStream(lastStream);
					let myUserMediaStream = wrtcCommon.doGetUserMediaStream();
					if (myUserMediaStream) {
						myUserMediaStream.getTracks().forEach((track) => {
				      remoteConn.addTrack(track, myUserMediaStream);
				    });
					}
					wrtcCommon.doCreateInterChange(wsm);
					//$(startCmd).click();

					let myRemoteTracks = wrtcCommon.doGetRemoteTracks();
					let newStream = new MediaStream();
					myRemoteTracks.forEach((track) => {
						newStream.addTrack(track)
			    });

					myVideo.srcObject = wrtcCommon.doMixStream([newStream, myUserMediaStream]);

					$(shareCmd).show();
					$(startCmd).hide();
					$(endCmd).show();
				});

				$(dlgContent).find('#CommandBox').append($(shareCmd).hide());
				$(dlgContent).find('#CommandBox').append($(startCmd).hide());
				$(dlgContent).find('#CommandBox').append($(endCmd).hide());

				let myRemoteConn = wrtcCommon.doInitRTCPeer(wrtcCommon.doGetUserMediaStream(), wsm);
				wrtcCommon.doSetupRemoteConn(myRemoteConn);

				setTimeout(() => {
					wrtcCommon.doCreateOffer(wsm);
					$('body').loading('stop');
				}, 7500);
			} else {
				$.notify('เว็บบราวเซอร์ของคุณไม่รองรับการใช้งานฟังก์ชั่นนี้', 'error');
				$('body').loading('stop');
			}
		});
	}

	const doCreateWebRCTDlgContent = function(){
		let wrapper = $('<div id="WebRCTBox" style="width: 100%"></div>');
		let myVideoElem = $('<video id="MyVideo" width="620" height="350" autoplay/>')/*.css({'border': '1px solid blue'})*/;
		let videoCmdBox = $('<div id="CommandBox" style="width: 100%; text-align: center;"></div>');
		return $(wrapper).append($(myVideoElem)).append($(videoCmdBox));
	}

	/*
	const onDisplayMediaSuccess = function(stream){
  	let vw, vh;
	  let myVideo = document.getElementById("MyVideo");
		stream.getTracks().forEach(function(track) {
	    track.addEventListener('ended', function() {
	      console.log('Stop Stream.');
	    }, false);
	  });

	  wrtcCommon.displayMediaStream = stream;

	  let streams = [wrtcCommon.displayMediaStream, wrtcCommon.userMediaStream];
	  let myMerger = wrtcCommon.streamMerger.CallcenterMerger(streams, wrtcCommon.mergeOption);
	  wrtcCommon.localMergedStream = myMerger.result
	  myVideo.srcObject = wrtcCommon.localMergedStream;
		myVideo.addEventListener( "loadedmetadata", function (e) {
	    vw = this.videoWidth;
	    vh = this.videoHeight;
	    myVideo.width = vw;
	    myVideo.height = vh;
	  });
	}
*/

  return {
		/*
		newstatusCases,
	  accstatusCases,
		*/

		doCreateHomeTitlePage,
		onCaseChangeStatusTrigger,
		doSetupCounter,
		doInterruptZoomCallEvt,
		doInterruptWebRTCCallEvt
	}
}
