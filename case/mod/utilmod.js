/* utilmod.js */

module.exports = function ( jq ) {
	const $ = jq;

	let wsm;

	const formatDateStr = function(d) {
		var yy, mm, dd;
		yy = d.getFullYear();
		if (d.getMonth() + 1 < 10) {
			mm = '0' + (d.getMonth() + 1);
		} else {
			mm = '' + (d.getMonth() + 1);
		}
		if (d.getDate() < 10) {
			dd = '0' + d.getDate();
		} else {
			dd = '' + d.getDate();
		}
		var td = `${yy}-${mm}-${dd}`;
		return td;
	}

	const formatTimeStr = function(d) {
		var hh, mn, ss;
		hh = d.getHours();
		mn = d.getMinutes();
		ss = d.getSeconds();
		var td = `${hh}:${mn}:${ss}`;
		return td;
	}

	const formatDate = function(dateStr) {
		var fdate = new Date(dateStr);
		var mm, dd;
		if (fdate.getMonth() + 1 < 10) {
			mm = '0' + (fdate.getMonth() + 1);
		} else {
			mm = '' + (fdate.getMonth() + 1);
		}
		if (fdate.getDate() < 10) {
			dd = '0' + fdate.getDate();
		} else {
			dd = '' + fdate.getDate();
		}
		var date = fdate.getFullYear() + (mm) + dd;
		return date;
	}

	const videoConstraints = {video: {displaySurface: "application", height: 1080, width: 1920 }};

	const doGetScreenSignalError = function(e) {
		var error = {
			name: e.name || 'UnKnown',
			message: e.message || 'UnKnown',
			stack: e.stack || 'UnKnown'
		};

		if(error.name === 'PermissionDeniedError') {
			if(location.protocol !== 'https:') {
				error.message = 'Please use HTTPs.';
				error.stack   = 'HTTPs is required.';
			}
		}

		console.error(error.name);
		console.error(error.message);
		console.error(error.stack);

		alert('Unable to capture your screen.\n\n' + error.name + '\n\n' + error.message + '\n\n' + error.stack);
	}

	/* export function */
	const getTodayDevFormat = function(){
		var d = new Date();
		return formatDateStr(d);
	}

	const getYesterdayDevFormat = function(){
		var d = new Date();
		d.setDate(d.getDate() - 1);
		return formatDateStr(d);
	}

	const getToday = function(){
		var d = new Date();
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getYesterday = function() {
		var d = new Date();
		d.setDate(d.getDate() - 1);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getDateLastThreeDay = function(){
		var days = 3;
		var d = new Date();
		var last = new Date(d.getTime() - (days * 24 * 60 * 60 * 1000));
		var td = formatDateStr(last);
		return formatDate(td);
	}

	const getDateLastWeek = function(){
		var days = 7;
		var d = new Date();
		var last = new Date(d.getTime() - (days * 24 * 60 * 60 * 1000));
		var td = formatDateStr(last);
		return formatDate(td);
	}

	const getDateLastMonth = function(){
		var d = new Date();
		d.setDate(d.getDate() - 31);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getDateLast3Month = function(){
		var d = new Date();
		d.setMonth(d.getMonth() - 3);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getDateLastYear = function(){
		var d = new Date();
		d.setFullYear(d.getFullYear() - 1);
		var td = formatDateStr(d);
		return formatDate(td);
	}

	const getFomateDateTime = function(date) {
		var todate = formatDateStr(date);
		var totime = formatTimeStr(date);
		return todate + 'T' + totime;
	}

	const getAge = function(dateString) {
		var dob = dateString;
		var yy = dob.substr(0, 4);
		var mo = dob.substr(4, 2);
		var dd = dob.substr(6, 2);
		var dobf = yy + '-' + mo + '-' + dd;
	  var today = new Date();
	  var birthDate = new Date(dobf);
	  var age = today.getFullYear() - birthDate.getFullYear();
	  var ageTime = today.getTime() - birthDate.getTime();
	  ageTime = new Date(ageTime);
	  if (age > 0) {
	  	if ((ageTime.getMonth() > 0) || (ageTime.getDate() > 0)) {
	  		age = (age + 1) + 'Y';
	  	} else {
	  		age = age + 'Y';
	  	}
	  } else {
	  	if (ageTime.getMonth() > 0) {
	  		age = ageTime.getMonth() + 'M';
	  	} else if (ageTime.getDate() > 0) {
	  		age = ageTime.getDate() + 'D';
	  	}
	  }
	  return age;
	}
	const formatStudyDate = function(studydateStr){
		if (studydateStr.length >= 8) {
			var yy = studydateStr.substr(0, 4);
			var mo = studydateStr.substr(4, 2);
			var dd = studydateStr.substr(6, 2);
			var stddf = yy + '-' + mo + '-' + dd;
			var stdDate = new Date(stddf);
			var month = stdDate.toLocaleString('default', { month: 'short' });
			return Number(dd) + ' ' + month + ' ' + yy;
		} else {
			return studydateStr;
		}
	}
	const formatStudyTime = function(studytimeStr){
		if (studytimeStr.length >= 4) {
			var hh = studytimeStr.substr(0, 2);
			var mn = studytimeStr.substr(2, 2);
			return hh + '.' + mn;
		} else {
			return studytimeStr;
		}
	}
	const getDatetimeValue = function(studydateStr, studytimeStr){
		if ((studydateStr.length >= 8) && (studytimeStr.length >= 6)) {
			var yy = studydateStr.substr(0, 4);
			var mo = studydateStr.substr(4, 2);
			var dd = studydateStr.substr(6, 2);
			var hh = studytimeStr.substr(0, 2);
			var mn = studytimeStr.substr(2, 2);
			var ss = studytimeStr.substr(4, 2);
			var stddf = yy + '-' + mo + '-' + dd + ' ' + hh + ':' + mn + ':' + ss;
			var stdDate = new Date(stddf);
			return stdDate.getTime();
		}
	}
	const formatDateDev = function(dateStr) {
		if (dateStr.length >= 8) {
			var yy = dateStr.substr(0, 4);
			var mo = dateStr.substr(4, 2);
			var dd = dateStr.substr(6, 2);
			var stddf = yy + '-' + mo + '-' + dd;
			return stddf;
		} else {
			return;
		}
	}

	const formatDateTimeStr = function(dt){
	  d = new Date(dt);
		d.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });
		var yy, mm, dd, hh, mn, ss;
	  yy = d.getFullYear();
	  if (d.getMonth() + 1 < 10) {
	    mm = '0' + (d.getMonth() + 1);
	  } else {
	    mm = '' + (d.getMonth() + 1);
	  }
	  if (d.getDate() < 10) {
	    dd = '0' + d.getDate();
	  } else {
	    dd = '' + d.getDate();
	  }
	  if (d.getHours() < 10) {
	    hh = '0' + d.getHours();
	  } else {
		   hh = '' + d.getHours();
	  }
	  if (d.getMinutes() < 10){
		   mn = '0' + d.getMinutes();
	  } else {
	    mn = '' + d.getMinutes();
	  }
	  if (d.getSeconds() < 10) {
		   ss = '0' + d.getSeconds();
	  } else {
	    ss = '' + d.getSeconds();
	  }
		var td = `${yy}-${mm}-${dd}T${hh}:${mn}:${ss}`;
		return td;
	}

	const formatStartTimeStr = function(){
		let d = new Date().getTime() + (5*60*1000);
		return formatDateTimeStr(d);
	}

	const formatFullDateStr = function(fullDateTimeStr){
		let dtStrings = fullDateTimeStr.split('T');
		return `${dtStrings[0]}`;;
	}

	const formatTimeHHMNStr = function(fullDateTimeStr){
		let dtStrings = fullDateTimeStr.split('T');
		let ts = dtStrings[1].split(':');
		return `${ts[0]}:${ts[1]}`;;
	}

	const invokeGetDisplayMedia = function(success) {
		if(navigator.mediaDevices.getDisplayMedia) {
	    navigator.mediaDevices.getDisplayMedia(videoConstraints).then(success).catch(doGetScreenSignalError);
	  } else {
	    navigator.getDisplayMedia(videoConstraints).then(success).catch(doGetScreenSignalError);
	  }
	}

	const addStreamStopListener = function(stream, callback) {
		stream.getTracks().forEach(function(track) {
			track.addEventListener('ended', function() {
				callback();
			}, false);
		});
	}

	const base64ToBlob = function (base64, mime) {
		mime = mime || '';
		var sliceSize = 1024;
		var byteChars = window.atob(base64);
		var byteArrays = [];

		for (var offset = 0, len = byteChars.length; offset < len; offset += sliceSize) {
			var slice = byteChars.slice(offset, offset + sliceSize);

			var byteNumbers = new Array(slice.length);
			for (var i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			var byteArray = new Uint8Array(byteNumbers);

			byteArrays.push(byteArray);
		}

		return new Blob(byteArrays, {type: mime});
	}

	const windowMinimize = function (){
		window.innerWidth = 100;
		window.innerHeight = 100;
		window.screenX = screen.width;
		window.screenY = screen.height;
		alwaysLowered = true;
	}

	const windowMaximize = function () {
		window.innerWidth = screen.width;
		window.innerHeight = screen.height;
		window.screenX = 0;
		window.screenY = 0;
		alwaysLowered = false;
	}

	const doResetPingCounter = function(){
		if ((wsm.readyState == 0) || (wsm.readyState == 1)){
			wsm.send(JSON.stringify({type: 'reset', what: 'pingcounter'}));
		} else {
			$.notify("คุณไม่อยู่ในสถานะการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดรีเฟรช (F5) หรือ Logout แล้ว Login ใหม่ อีกครั้ง", "warn");
		}
	}

	const doSetScreenState = function(state){
		if ((wsm.readyState == 0) || (wsm.readyState == 1)){
			wsm.send(JSON.stringify({type: 'set', what: 'screenstate', value: state}));
		} else {
			$.notify("คุณไม่อยู่ในสถานะการเชื่อมต่อกับเซิร์ฟเวอร์ โปรดรีเฟรช (F5) หรือ Logout แล้ว Login ใหม่ อีกครั้ง", "warn");
		}
	}

	const doConnectWebsocketMaster = function(username, usertype, hospitalId, connecttype){
	  const hostname = window.location.hostname;
		const protocol = window.location.protocol;
	  const port = window.location.port;
	  const paths = window.location.pathname.split('/');
	  const rootname = paths[1];
		/*
		let wsProtocol = 'ws://';
		if (protocol == 'https:') {
			wsProtocol = 'wss://';
		}

		let wsUrl = wsProtocol + hostname + ':' + port + '/' + username + '/' + hospitalId + '?type=' + connecttype;
		if (hostname == 'localhost') {
			wsUrl = 'wss://radconnext.info/' + username + '/' + hospitalId + '?type=' + connecttype;
		}
		*/

		let wsUrl = 'wss://radconnext.info/' + username + '/' + hospitalId + '?type=' + connecttype;
	  wsm = new WebSocket(wsUrl);
		wsm.onopen = function () {
			//console.log('Master Websocket is connected to the signaling server')
		};

		//console.log(usertype);

		if ((usertype == 1) || (usertype == 2) || (usertype == 3)) {
			const wsmMessageHospital = require('./websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageHospital.onMessageHospital;
		} else if (usertype == 4) {
			const wsmMessageRedio = require('../../radio/mod/websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageRedio.onMessageRadio;
		} else if (usertype == 5) {
			const wsmMessageRefer = require('../../refer/mod/websocketmessage.js')($, wsm);
			wsm.onmessage = wsmMessageRefer.onMessageRefer;
		}

	  wsm.onclose = function(event) {
			//console.log("Master WebSocket is closed now. with  event:=> ", event);
		};

		wsm.onerror = function (err) {
		   console.log("Master WS Got error", err);
		};

		return wsm;
	}

	const wslOnClose = function(event) {
		console.log("Local WebSocket is closed now. with  event:=> ", event);
	}

	const wslOnError = function (err) {
		 console.log("Local WS Got error", err);
	}

	const wslOnOpen = function () {
		console.log('Local Websocket is connected to the signaling server')
	}

	const wslOnMessage = function (msgEvt) {
		let data = JSON.parse(msgEvt.data);
		console.log(data);
		if (data.type !== 'test') {
			let localNotify = localStorage.getItem('localnotify');
			let LocalNotify = JSON.parse(localNotify);
			if (LocalNotify) {
				LocalNotify.push({notify: data, datetime: new Date(), status: 'new'});
			} else {
				LocalNotify = [];
				LocalNotify.push({notify: data, datetime: new Date(), status: 'new'});
			}
			localStorage.setItem('localnotify', JSON.stringify(LocalNotify));
		}
		if (data.type == 'test') {
			$.notify(data.message, "success");
		} else if (data.type == 'result') {
			$.notify(data.message, "success");
		} else if (data.type == 'notify') {
			$.notify(data.message, "warnning");
		} else if (data.type == 'exec') {
			//Send result of exec back to websocket server
			wsm.send(JSON.stringify(data.data));
		} else if (data.type == 'move') {
			wsm.send(JSON.stringify(data.data));
		} else if (data.type == 'run') {
			wsm.send(JSON.stringify(data.data));
		} else if (data.type == 'newdicom') {
			let eventName = 'triggernewdicom'
			let triggerData = {dicom : data.dicom};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);
		} else if (data.type == 'updatedicom') {
			let eventName = 'triggerupdatedicom'
			let triggerData = {dicom : data.dicom};
			let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
			document.dispatchEvent(event);			
		}
	}

	const doConnectWebsocketLocal = function(username){
	  let wsUrl = 'ws://localhost:3000/api/' + username + '?type=local';
		wsl = new WebSocket(wsUrl);
		wsl.onopen = wslOnOpen;
		wsl.onmessage = wslOnMessage;
	  wsl.onclose = wslOnClose;
		wsl.onerror = wslOnError;
		return wsl;
	}

	const isMobileDeviceCheck = function(){
	  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
      return true;
	  } else {
			return false;
		}
	}

	const contains = function(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
      indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(needle) {
        var i = -1, index = -1;

        for(i = 0; i < this.length; i++) {
          var item = this[i];

          if((findNaN && item !== item) || item === needle) {
            index = i;
            break;
          }
        }

        return index;
      };
    }
    return indexOf.call(this, needle) > -1;
	};

	const doCreateDownloadPDF = function(pdfLink){
	  return new Promise(async function(resolve, reject){
	    $.ajax({
		    url: pdfLink,
		    success: function(response){
					let stremLink = URL.createObjectURL(new Blob([response.data], {type: 'application/pdf'}));
	        resolve(stremLink);
				}
			});
	  });
	}

	const XLSX_FILE_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

	const doCreateDownloadXLSX = function(xlsxLink){
	  return new Promise(async function(resolve, reject){
	    $.ajax({
		    url: xlsxLink,
		    success: function(response){
					let stremLink = URL.createObjectURL(new Blob([response.data], {type: XLSX_FILE_TYPE}));
	        resolve(stremLink);
				}
			});
	  });
	}

	const doShowLogWindow = function(){
		let myLogBox = $('<div id="LogBox"></div>');
		$(myLogBox).css({'position': 'absolute', 'width': '50%', 'min-height': '250px', 'background-color': 'rgba(192,192,192,0.3)', 'padding': '5px', 'border': '4px solid #888',  'z-index': '45', 'top': '100px'});
		let myLogWindow = $(myLogBox).simplelog({});
		$('body').append($(myLogBox));

		$(myLogBox).draggable({ containment: "body"});
		$(myLogBox).resizable({	containment: 'body'});
		return $(myLogBox);
	}

	/*
	const dicomZipSyncWorker = new Worker("../lib/dicomzip-sync-webworker.js");
	dicomZipSyncWorker.addEventListener("message", async function(event) {
	  let evtData = event.data;
	  //{studyID,fileEntryURL}
		if (evtData.fileEntryURL){
		  let dicomzipsync = JSON.parse(localStorage.getItem('dicomzipsync'));
		  await dicomzipsync.forEach((dicom, i) => {
		    if (dicom.studyID == evtData.studyID) {
		      dicom.fileEntryURL = evtData.fileEntryURL;
		    }
		  });
		  localStorage.setItem('dicomzipsync', JSON.stringify(dicomzipsync));
		} else if (evtData.error){
			$.notify("Your Sync Dicom in Background Error", "error");
		}
	});
	*/

	return {
		formatDateStr,
		getTodayDevFormat,
		getYesterdayDevFormat,
		getToday,
		getYesterday,
		getDateLastThreeDay,
		getDateLastWeek,
		getDateLastMonth,
		getDateLast3Month,
		getDateLastYear,
		getFomateDateTime,
		getAge,
		formatStudyDate,
		formatStudyTime,
		getDatetimeValue,
		formatDateDev,
		formatDateTimeStr,
		formatStartTimeStr,
		formatFullDateStr,
		formatTimeHHMNStr,
		invokeGetDisplayMedia,
		addStreamStopListener,
		base64ToBlob,
		windowMinimize,
		windowMaximize,
		doResetPingCounter,
		doSetScreenState,
		doConnectWebsocketMaster,
		doConnectWebsocketLocal,
		isMobileDeviceCheck,
		contains,
		doCreateDownloadPDF,
		XLSX_FILE_TYPE,
		doCreateDownloadXLSX,
		doShowLogWindow,
		//dicomZipSyncWorker,
		/*  Web Socket Interface */
		wsm
	}
}
