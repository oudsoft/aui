/* chatmanager.js */
module.exports = function ( jq ) {
	const $ = jq;
  const util = require('../../case/mod/utilmod.js')($);
	const apiconnector = require('../../case/mod/apiconnect.js')($);

  const contactIconUrl = '/images/user-account.png';
  const closeContactIconUrl = '/images/cancel-icon.png';

  /* List of Audiences */
  let contactLists = [];

  const doCreateContactContainer = function(caseId, openCase){
		contactLists = [];
    let contactContainer = $('<div id="ContactContainer" style=" position: relative; width: 100%; padding: 4px; margin-top: 10px; text-align: right;"></div>');
		let contactIconBar = $('<div id="ContactBar" style="position: relative; width: 100%"></div>');
		$(contactIconBar).appendTo($(contactContainer));
		let chatBoxContainer = $('<div id="ChatBoxContainer" style="position: relative; width: 100%;"></div>');
		$(chatBoxContainer).css('display', 'none');
		$(chatBoxContainer).appendTo($(contactContainer));

		$(contactContainer).on('newconversation', async (evt, data) =>{
			console.log(data);
			if (data.topicId == caseId){
				let isHide = $(chatBoxContainer).css('display');
				if (isHide === 'none') {
					$(chatBoxContainer).css('display', 'block');
				}
				let contact = await doCreateNewAudience(data.audienceId, data.audienceName, data.topicId, data.topicName);
				if (contact) {
					$(contact).appendTo($(contactIconBar));
					let simpleChat = doCreateSimpleChatBox(data.topicId, data.topicName, data.topicType, data.audienceId, data.audienceName, data.topicStatusId);
					$(simpleChat.chatBox).css('display', 'none');
					$(simpleChat.chatBox).appendTo($(chatBoxContainer));
					await simpleChat.handle.restoreLocal();
					let chatBoxTarget = contactLists.find((item)=>{
						if (item.Id == data.audienceId) { return item}
					});
					if (chatBoxTarget){
						chatBoxTarget.chatBox = simpleChat.chatBox;
						chatBoxTarget.handle = simpleChat.handle;
						chatBoxTarget.contact = contact;
					}
					contactLists.forEach((item, i) => {
						$(item.chatBox).slideToggle();
					});
				} else {
					let eventData = {msg: data.message.msg, from: data.message.from, context: data.message.context};
					setTimeout(()=>{
						let selector = '#'+data.audienceId + ' .chatbox';
						let targetChatBox = $(selector);
		      	$(targetChatBox).trigger('messagedrive', [eventData]);
					}, 300);
				}
			}
		});

		/* ในกรณี เคสเคยมีการ chat มาก่อน (casestatusId==14) ต้องเปิด simppleChat มารอไว้เลย */
		/* ของ reffer ปรับให้คุยได้เฉพาะ topic นั้นเท่านั้น */

		if (openCase.case.casestatusId == 14){
			doSeachChatHistory(caseId).then(async (history) => {
				if (history) {
					localStorage.setItem('localmessage', JSON.stringify(history));
					const userdata = JSON.parse(localStorage.getItem('userdata'));
					let lastHis = history.find((item)=>{
						if (item.from !== userdata.username) return item;
					});
					if (lastHis) {
						let audienceId = lastHis.from;
						let audienceInfo = await apiconnector.doGetApi('/api/users/searchusername/' + audienceId, {});
						audienceInfo = await apiconnector.doGetApi('/api/users/select/' + audienceInfo.id, {});
						let audienceName = audienceInfo.user[0].userinfo.User_NameTH + ' ' + audienceInfo.user[0].userinfo.User_LastNameTH;
						let topicName = openCase.case.patient.Patient_HN + ' ' + openCase.case.patient.Patient_NameEN + ' ' + openCase.case.patient.Patient_LastNameEN + ' ' + openCase.case.patient.Patient_Sex + '/' + openCase.case.patient.Patient_Age + ' ' + openCase.case.Case_BodyPart;
						let topicType = 'case';
						let contact = await doCreateNewAudience(audienceId, audienceName, caseId, topicName);
						if (contact) {
							$(contact).appendTo($(contactIconBar));
							let simpleChat = doCreateSimpleChatBox(caseId, topicName, topicType, audienceId, audienceName, openCase.case.casestatusId);
							$(chatBoxContainer).css('display', 'block');
							$(simpleChat.chatBox).css('display', 'block');
							$(simpleChat.chatBox).appendTo($(chatBoxContainer));
							await simpleChat.handle.restoreLocal();
							simpleChat.handle.scrollDown();
							let chatBoxTarget = contactLists.find((item)=>{
								if (item.Id == audienceId) { return item}
							});
							if (chatBoxTarget){
								chatBoxTarget.chatBox = simpleChat.chatBox;
								chatBoxTarget.handle = simpleChat.handle;
								chatBoxTarget.contact = contact;
							}
						}
					} else {
						console.log('Not found any message of audienceId ', lastHis);
						console.log('this is your history', history);
					}
				} else {
					console.log(history);
				}
			});
		}

    return $(contactContainer);
  }

  const doCreateNewAudience = function(Id, Name, topicId, topicName){
    /* Id=username, Name=displayName */
    return new Promise(async function(resolve, reject) {
      let chatBoxTarget = await contactLists.find((item)=>{
        if ((item.Id == Id) && (item.topicId == topicId)) { return item}
      });
      if (!chatBoxTarget){
        let newAudience = {Id: Id, Name: Name, topicId: topicId, topicName: topicName};
        contactLists.push(newAudience);
        let contactIcon = doCreateContactIcon(Id, Name, topicId, onContactIconClickCallback, onCloseContactClickCallback);
        resolve($(contactIcon));
      } else {
				//let contactIcon = chatBoxTarget.contact[0];
				//let contactIcon = doCreateContactIcon(Id, Name, topicId, onContactIconClickCallback, onCloseContactClickCallback);
        //resolve($(contactIcon));
				resolve();
      }
    });
  }

  const doCreateContactIcon = function(Id, Name, topicId, onContactIconClickCallback, onCloseContactClickCallback) {
    let contactBox = $('<div class="contact" style="position: relative; display: inline-block; text-align: center; margin-right: 2px;"></div>');
    let contactIcon = $('<img style="postion: relative; width: 40px; height: auto; cursor: pointer;"/>');
    $(contactIcon).attr('src', contactIconUrl);
    let closeContactIcon = $('<img style="position: absolute; width: 20px; height: 20px; cursor: pointer; margin-left: 20px; margin-top: -70px;"/>');
    $(closeContactIcon).attr('src', closeContactIconUrl);
		//$(closeContactIcon).css('display', 'none');
		//$(contactIcon).hover((evt) =>{$(closeContactIcon).toggle()});
    let contactName = $('<div style="position: relative; font-size: 16px; color: auto;"></div>');
		$(contactName).text(Name);
		let reddot = doCreateReddot(Id, 0);
    $(contactBox).on('click', async (evt)=>{
      await onContactIconClickCallback(Id);
    });
    $(closeContactIcon).on('click', async (evt)=>{
      await onCloseContactClickCallback(Id, topicId, contactBox);
    });
		$(contactBox).attr('id', Id);
    return $(contactBox).append($(contactIcon)).append($(contactName)).append($(closeContactIcon)).append($(reddot));
  }

	const doCreateReddot = function(Id, value) {
		let reddot = $('<span class="reddot" style="position: absolute; width: 30px; height: 30px; border-radius:50%; background-color: red; color: white; margin-top: -50px;"></span>');
		$(reddot).attr('id', Id);
		$(reddot).text(value);
		return $(reddot);
	}

	const doSetReddotValue = function(Id, value){
		let selector = '#'+Id + ' .reddot';
		let lastValue = $(selector).text();
		let newValue = Number(lastValue) + value;
		if (newValue > 0) {
			$(selector).text(newValue);
			$(selector).show()
		} else {
			$(selector).hide()
		}
	}

  const onContactIconClickCallback = function(Id){
		//{Id: Id, Name: Name, chatBox, handle}
		if (contactLists.length == 1){
			$(contactLists[0].chatBox).slideToggle();
		} else {
			contactLists.forEach((item, i) => {
				$(item.chatBox).css('display', 'none');
			});

			contactLists.forEach((item, i) => {
				if (item.Id === Id) {
					$(item.chatBox).slideToggle();
				}
			});
		}
  }

  const onCloseContactClickCallback = function(Id, topicId, contactBox) {
    return new Promise(async function(resolve, reject) {
      let indexAt = undefined;
      let chatBoxTarget = await contactLists.find((item, index)=>{
        if (item.Id == Id) {
          indexAt = index;
          return item
        }
      });
      if (chatBoxTarget){
				let selector = '#'+Id + ' .chatbox';
				let targetChatBox = $(selector);
				$(targetChatBox).remove();
				$(contactBox).remove();
        contactLists.splice(indexAt, 1);
				const main = require('../main.js');
				const myWsm = main.doGetWsm();
		    myWsm.send(JSON.stringify({type: 'closetopic', topicId: topicId}));
      }
    });
  }

	const doCreateSimpleChatBox = function(topicId, topicName, topicType, audienceId, audienceName, topicStatusId) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let simpleChatBoxOption = {
			myId: userdata.username,
			myName: userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH,
			myDisplayName: 'ฉัน',
			topicId: topicId,
			topicName: topicName,
			topicStatusId: topicStatusId,
			topicType: topicType,
			audienceId: audienceId,
			audienceName: audienceName,
			wantBackup: true,
			externalClassStyle: {},
			sendMessageCallback: doSendMessageCallback,
			resetUnReadMessageCallback: doResetUnReadMessageCallback
		};
		let simpleChat = doInitChatBox(simpleChatBoxOption);
		return simpleChat;
	}

	const doInitChatBox = function(options){
	  let simpleChatBoxOption = {
	    topicId: options.topicId,
	    topicName: options.topicName,
			topicStatusId: options.topicStatusId,
			topicType: options.topicType,
	    myId: options.myId,
	    myName: options.myName,
	    myDisplayName: options.myDisplayName,
	    audienceId: options.audienceId,
	    audienceName: options.audienceName,
	    wantBackup: options.wantBackup,
	    externalClassStyle: options.externalClassStyle,
	    sendMessageCallback: options.sendMessageCallback,
			resetUnReadMessageCallback: options.resetUnReadMessageCallback
	  };
	  let simpleChatBox = $('<div></div>');
	  $(simpleChatBox).attr('id', options.audienceId);
	  let simpleChatBoxHandle = $(simpleChatBox).chatbox(simpleChatBoxOption);
	  return {chatBox: $(simpleChatBox), handle: simpleChatBoxHandle};
	}

	const doSendMessageCallback = function(msg, sendto, from, context){
	  return new Promise(async function(resolve, reject){
			const main = require('../main.js');
			const myWsm = main.doGetWsm();
	    let msgSend = {type: 'message', msg: msg, sendto: sendto, from: from, context: context};
	    myWsm.send(JSON.stringify(msgSend));
	    resolve();
	  });
	}

	const doResetUnReadMessageCallback = function(audienceId, value){
		doSetReddotValue(audienceId, value);
	}

	const doSeachChatHistory = function(topicId){
		return new Promise(async function(resolve, reject){
			let cloudHistory = undefined;
			let localHistory = undefined;
			let localMsgStorage = localStorage.getItem('localmessage');
			if ((localMsgStorage) && (localMsgStorage !== '')) {
		    let localLog = JSON.parse(localMsgStorage);
				if (localLog) {
					localHistory = await localLog.filter((item)=>{
						if (item.topicId == topicId) {
							return item;
						}
					});
				}
			}
			let cloudLog = await apiconnector.doGetApi('/api/chatlog/select/case/' + topicId, {});
			if (cloudLog) {
				cloudHistory = await cloudLog.Log.filter((item)=>{
					if (item.topicId == topicId) {
						return item;
					}
				});
			}
			//console.log(localHistory);
			//console.log(cloudHistory);
			if ((localHistory) && (localHistory.length > 0)) {
				if ((cloudHistory) && (cloudHistory.length > 0)) {
					if (localHistory.length > 0) {
						if (cloudHistory.length > 0) {
							let localLastMsg = localHistory[localHistory.length-1];
							let localLastUpd = new Date(localLastMsg.datetime);
							let cloudLastMsg = cloudHistory[cloudHistory.length-1];
							let cloudLastUpd = new Date(cloudLastMsg.datetime);
							if (cloudLastUpd.getTime() > localLastUpd.getTime()){
								resolve(cloudHistory);
							} else {
								resolve(localHistory);
							}
						} else {
							resolve(localHistory);
						}
					} else {
						if (cloudHistory.length > 0) {
							resolve(cloudHistory);
						} else {
							resolve([]);
						}
					}
				} else {
					resolve(localHistory);
				}
			} else {
				if (cloudHistory) {
					resolve(cloudHistory);
				} else {
					resolve([]);
				}
			}
		});
	}

  return {
    //contactLists,
    doCreateContactContainer,
    doCreateNewAudience,

		doCreateSimpleChatBox,
		doSendMessageCallback,
		doResetUnReadMessageCallback
	}
}
