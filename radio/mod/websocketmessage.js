/* websocketmessage.js */
module.exports = function ( jq, wsm) {
	const $ = jq;

	const wrtcCommon = require('../../case/mod/wrtc-common.js')(jq);

  const onMessageRadio = function (msgEvt) {
		let userdata = JSON.parse(localStorage.getItem('userdata'));
    let data = JSON.parse(msgEvt.data);
    console.log(data);
    if (data.type !== 'test') {
      let masterNotify = localStorage.getItem('masternotify');
      let MasterNotify = JSON.parse(masterNotify);
      if (MasterNotify) {
        MasterNotify.push({notify: data, datetime: new Date(), status: 'new'});
      } else {
        MasterNotify = [];
        MasterNotify.push({notify: data, datetime: new Date(), status: 'new'});
      }
      localStorage.setItem('masternotify', JSON.stringify(MasterNotify));
    }
    if (data.type == 'test') {
      $.notify(data.message, "success");
		} else if (data.type == 'refresh') {
			let eventName = 'triggercounter'
			let triggerData = {caseId : data.caseId, statusId: data.statusId, thing: data.thing};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
    } else if (data.type == 'notify') {
			$.notify(data.message, "info");
    } else if (data.type == 'callzoom') {
      let eventName = 'callzoominterrupt';
      let callData = {openurl: data.openurl, password: data.password, topic: data.topic, sender: data.sender};
      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: callData}});
      document.dispatchEvent(event);
    } else if (data.type == 'callzoomback') {
      let eventName = 'stopzoominterrupt';
      let evtData = {result: data.result};
      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
      document.dispatchEvent(event);
		} else if (data.type == 'ping') {
			//let minuteLockScreen = userdata.userprofiles[0].Profile.screen.lock;
			if ((userdata.userprofiles) && (userdata.userprofiles.length > 0)) {
				let minuteLockScreen = Number(userdata.userprofiles[0].Profile.lockState.autoLockScreen);
				let minuteLogout = Number(userdata.userprofiles[0].Profile.offlineState.autoLogout);
				let tryLockModTime = (Number(data.counterping) % Number(minuteLockScreen));
				if (data.counterping == minuteLockScreen) {
					let eventName = 'lockscreen';
		      let evtData = {};
		      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
		      document.dispatchEvent(event);
				} else if (tryLockModTime == 0) {
					let eventName = 'lockscreen';
		      let evtData = {};
		      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
		      document.dispatchEvent(event);
				}
				if (minuteLogout > 0){
					if (data.counterping == minuteLogout) {
						let eventName = 'autologout';
			      let evtData = {};
			      let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
			      document.dispatchEvent(event);
					}
				}
				let modPingCounter = Number(data.counterping) % 10;
				if (modPingCounter == 0) {
					wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
				}
			}
		} else if (data.type == 'unlockscreen') {
			let eventName = 'unlockscreen';
			let evtData = {};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
			document.dispatchEvent(event);
		} else if (data.type == 'updateuserprofile') {
			let eventName = 'updateuserprofile';
			let evtData = data.profile;
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: evtData}});
			document.dispatchEvent(event);
		} else if (data.type == 'message') {
			$.notify(data.from + ':: ส่งข้อความมาว่า:: ' + data.msg, "info");
			doSaveMessageToLocal(data.msg ,data.from, data.context.topicId, 'new');
			/* จุดระวัง */
			/* จุด Swap หรือ จุดไขว้ค่า myId กับ audienceId ระหว่าง sendto กับ from */
			let newConversationData = {topicId: data.context.topicId, topicName: data.context.topicName, topicType: data.context.topicType, topicStatusId: data.context.topicStatusId, audienceId: data.context.myId, audienceName: data.context.myName, myId: data.context.audienceId, myName: data.context.audienceName };
			newConversationData.message = {msg: data.msg, from: data.from, context: data.context};
			$('#ContactContainer').trigger('newconversation', [newConversationData]);
		} else if (data.type == 'clientresult') {
			let eventName = 'clientresult';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.result}});
			document.dispatchEvent(event);
		} else if (data.type == 'logreturn') {
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'echoreturn') {
			let eventName = 'echoreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.message}});
			document.dispatchEvent(event);
		} else if (data.type == 'wrtc') {
			switch(data.wrtc) {
				//when somebody wants to call us
				case "offer":
					wrtcCommon.wsHandleOffer(wsm, data.offer);
				break;
				case "answer":
					wrtcCommon.wsHandleAnswer(wsm, data.answer);
				break;
				//when a remote peer sends an ice candidate to us
				case "candidate":
					wrtcCommon.wsHandleCandidate(wsm, data.candidate);
				break;
				case "interchange":
					wrtcCommon.wsHandleInterchange(wsm, data.interchange);
				break;				
				case "leave":
					wrtcCommon.wsHandleLeave(wsm, data.leave);
				break;
			}
    }
  };

	const doSaveMessageToLocal = function(msg ,from, topicId, status){
		let localMsgStorage = localStorage.getItem('localmessage');
		if ((localMsgStorage) && (localMsgStorage !== '')) {
			let localMessage = JSON.parse(localMsgStorage);
			//console.log(localMessage);
			let localMessageJson = localMessage;
			if (localMessageJson) {
				localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			} else {
				localMessageJson = [];
				localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			}
			localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
		} else {
			let firstFocalMessageJson = [];
			firstFocalMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
			localStorage.setItem('localmessage', JSON.stringify(firstFocalMessageJson));
		}
	}

  return {
    onMessageRadio
	}
}
