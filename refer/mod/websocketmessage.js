/* websocketmessage.js */
module.exports = function ( jq, wsm ) {
	const $ = jq;

	const wrtcCommon = require('../../case/mod/wrtc-common.js')(jq);

  const onMessageRefer = function (msgEvt) {
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
		} else if (data.type == 'ping') {
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}
		} else if (data.type == 'refresh') {
			let eventName = 'triggercounter'
			let triggerData = {caseId : data.caseId, statusId: data.statusId};
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
      console.log('Ping Data =>', data);
		} else if (data.type == 'unlockscreen') {

    } else if (data.type == 'message') {
      $.notify(data.from + ':: ส่งข้อความมาว่า:: ' + data.msg, "info");
			doSaveMessageToLocal(data.msg ,data.from, data.context.topicId, 'new');
      let eventData = {msg: data.msg, from: data.from, context: data.context};
      $('#SimpleChatBox').trigger('messagedrive', [eventData]);
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
    onMessageRefer
	}
}
