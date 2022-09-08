/* websocketmessage.js */
module.exports = function ( jq, wsm ) {
	const $ = jq;
  const onMessageHospital = function (msgEvt) {
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
		} else if (data.type == 'ping') {
			let modPingCounter = Number(data.counterping) % 10;
			if (modPingCounter == 0) {
				wsm.send(JSON.stringify({type: 'pong', myconnection: (userdata.id + '/' + userdata.username + '/' + userdata.hospitalId)}));
			}
    } else if (data.type == 'trigger') {
			/*************************/
			/*
      let message = {type: 'trigger', dcmname: data.dcmname, StudyInstanceUID: data.studyInstanceUID, owner: data.ownere, hostname: data.hostname};
      wsl.send(JSON.stringify(message));
      $.notify('The system will be start store dicom to your local.', "success");
			*/
		} else if (data.type == 'refresh') {
			if (data.thing === 'consult') {
				let eventName = 'triggerconsultcounter'
				let triggerData = {caseId : data.caseId, statusId: data.statusId};
				let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
				document.dispatchEvent(event);
			} else if (data.thing === 'case') {
				let eventName = 'triggercasecounter'
				let triggerData = {caseId : data.caseId, statusId: data.statusId};
				let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
				document.dispatchEvent(event);
			}
		//} else if (data.type == 'refreshconsult') {
		} else if (data.type == 'casemisstake') {
			let eventName = 'triggercasemisstake'
			let triggerData = {msg : data.msg, from: data.from};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
		} else if (data.type == 'newreport') {
			let eventName = 'triggernewreport'
			let triggerData = data;
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
			console.log(event);
    } else if (data.type == 'notify') {
      $.notify(data.message, "info");
    } else if (data.type == 'exec') {
			/*************************/
			/*
        wsl.send(JSON.stringify(data));
			*/
    } else if (data.type == 'cfindresult') {
      let evtData = { result: data.result, owner: data.owner, hospitalId: data.hospitalId, queryPath: data.queryPath};
      $("#RemoteDicom").trigger('cfindresult', [evtData]);
    } else if (data.type == 'move') {
			/*************************/
			/*
      wsl.send(JSON.stringify(data));
			*/
    } else if (data.type == 'cmoveresult') {
      let evtData = { data: data.result, owner: data.owner, hospitalId: data.hospitalId, patientID: data.patientID};
      setTimeout(()=>{
        $("#RemoteDicom").trigger('cmoveresult', [evtData]);
      }, 5000);
    } else if (data.type == 'run') {
			/*************************/
			/*
      wsl.send(JSON.stringify(data));
			*/
    } else if (data.type == 'runresult') {
      //$('#RemoteDicom').dispatchEvent(new CustomEvent("runresult", {detail: { data: data.result, owner: data.owner, hospitalId: data.hospitalId }}));
      let evtData = { data: data.result, owner: data.owner, hospitalId: data.hospitalId };
      $('body').trigger('runresult', [evtData]);
    } else if (data.type == 'refresh') {
      let event = new CustomEvent(data.section, {"detail": {eventname: data.section, stausId: data.statusId, caseId: data.caseId}});
      document.dispatchEvent(event);
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
		} else if (data.type == 'message') {
      $.notify(data.from + ':: ส่งข้อความมาว่า:: ' + data.msg, "info");
			doSaveMessageToLocal(data.msg ,data.from, data.context.topicId, 'new');
      let eventData = {msg: data.msg, from: data.from, context: data.context};
      $('#SimpleChatBox').trigger('messagedrive', [eventData]);
		} else if (data.type == 'importresult') {
			let eventName = 'createnewdicomtranserlog';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.result}});
			document.dispatchEvent(event);
		} else if (data.type == 'clientresult') {
			console.log(data);
			let eventName = 'clientresult';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.result, hospitalId: data.hospitalId, owner: data.owner}});
			document.dispatchEvent(event);
		} else if (data.type == 'logreturn') {
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'dicomlogreturn') {
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'reportlogreturn') {
			console.log('yess');
			let eventName = 'logreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.log}});
			document.dispatchEvent(event);
		} else if (data.type == 'echoreturn') {
			let eventName = 'echoreturn';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.message}});
			document.dispatchEvent(event);
		} else if (data.type == 'clientreconnect') {
			let eventName = 'clientreconnecttrigger';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: data.message}});
			document.dispatchEvent(event);
		} else if (data.type == 'rezip') {
			let eventName = 'triggerrezip';
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: {studyID: data.studyID, dicomZipFilename: data.dicomZipFilename}}});
			document.dispatchEvent(event);
    } else {
			console.log('Nothing Else');
		}
  };

	const doSaveMessageToLocal = function(msg ,from, topicId, status){
		let localMessage = localStorage.getItem('localmessage');
		let localMessageJson = JSON.parse(localMessage);
		if (localMessageJson) {
			localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
		} else {
			localMessageJson = [];
			localMessageJson.push({msg: msg, from: from, topicId: topicId, datetime: new Date(), status: status});
		}
		localStorage.setItem('localmessage', JSON.stringify(localMessageJson));
	}

  return {
    onMessageHospital
	}
}
