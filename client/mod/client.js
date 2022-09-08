module.exports = function ( jq ) {
	const $ = jq;

  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

	const pageFontStyle = {"font-family": "THSarabunNew", "font-size": "24px"};

	var wsm = undefined;

  const doOpenRemoteRun = function(hospitalId){

    let hospitalIdBox = $('<div style="display: table-row; width: 100%;"></div>');
    let hospitalLabelCell = $('<div style="display: table-cell; padding: 4px;">Hospital Id:</div>');
    let hospitalValueCell = $('<div style="display: table-cell; padding: 4px;"></div>');
    let hospitalInput = $('<input id="HospitalInput" type="text"/>');
    $(hospitalValueCell).append($(hospitalInput));
    $(hospitalIdBox).append($(hospitalLabelCell)).append($(hospitalValueCell));

		let monitorBox = $('<div style="display: table-row; width: 100%;"></div>');
    let monitorLabelCell = $('<div style="display: table-cell; padding: 4px;">Monitor:</div>');
    let monitorValueCell = $('<div style="display: table-cell; padding: 4px;"></div>');
		let monitor = doCreateResultMonitor();
		$(monitorValueCell).append($(monitor));
		$(monitorBox).append($(monitorLabelCell)).append($(monitorValueCell));

    let commandsListBox = $('<div style="display: table-row; width: 100%;"></div>');
    let commandsListLabelCell = $('<div style="display: table-cell; padding: 4px;">Command Script:</div>');
    let commandsListValueCell = $('<div style="display: table-cell; padding: 4px;"></div>');
    let commandsListInput = $('<textarea id="CommandsListInput" cols="80" rows="10"></textarea>');
    $(commandsListValueCell).append($(commandsListInput));
    $(commandsListBox).append($(commandsListLabelCell)).append($(commandsListValueCell));

    let executeCmdBox = $('<div style="display: table-row; width: 100%;"></div>');
    let executeCmdLabelCell = $('<div style="display: table-cell; padding: 4px;"></div>');
    let executeCmdValueCell = $('<div style="display: table-cell; padding: 4px;"></div>');
    let executeCmdCmd = $('<input type="button" value=" Run "/>');
    let echoCmdCmd = $('<input type="button" value=" Echo " style="margin-left: 20px;"/>');
    let logFileCmdCmd = $('<input type="button" value=" Log File " style="margin-left: 20px;"/>');
		let reportLogFileCmdCmd = $('<input type="button" value=" Report Log File " style="margin-left: 20px;"/>');
		let dicomLogFileCmdCmd = $('<input type="button" value=" Dicom Log File " style="margin-left: 20px;"/>');
		let restartServiceCmdCmd = $('<input type="button" value=" Restart Service " style="margin-left: 20px;"/>');
		let backCmd = $('<input type="button" value=" Back " style="margin-left: 20px;"/>');
		let reSendDicomCmd = $('<input type="button" id="ReSendDicomCmd" value=" Re-Send Dicom " style="margin-left: 20px;"/>');
		let compareDicomCmd = $('<input type="button" value=" Compare Dicom " style="margin-left: 20px;"/>');
    $(executeCmdValueCell).append($(executeCmdCmd)).append($(echoCmdCmd)).append($(logFileCmdCmd)).append($(reportLogFileCmdCmd)).append($(dicomLogFileCmdCmd)).append($(restartServiceCmdCmd)).append($(reSendDicomCmd)).append($(compareDicomCmd));
    $(executeCmdBox).append($(executeCmdLabelCell)).append($(executeCmdValueCell));
		// Clear command
		// update command

		let exampleCommandBox = $('<div style="position: relative; width: 100%;"></div>');
		$(exampleCommandBox).append($('<h3>Example</h3>'));
		$(exampleCommandBox).append($('<p>cd C:/RadConnext/Radconnext-win32-x64/resources/app</p>'));
		$(exampleCommandBox).append($('<p>git clone https://github.com/oudsoft/Radconnext-aui tmp/</p>'));
		$(exampleCommandBox).append($('<p>Xcopy tmp http /E /H /C /I /q</p>'));
		$(exampleCommandBox).append($('<p>rmdir tmp /S /q</p>'));
		$(exampleCommandBox).append($('<p>sc stop "radconnext-service"</p>'));
		$(exampleCommandBox).append($('<p>sc start "radconnext-service"</p>'));
		$(exampleCommandBox).append($('<p>sc start "radconnext-service"</p>'));
		$(exampleCommandBox).append($('<p>runas /user:Administator "cmd.exe /C %CD%C:/RadConnext/Radconnext-win32-x64/resources/app"</p>'));
		$(exampleCommandBox).append($('<p>curl --list-only --user radconnext:A4AYitoDUB -T C:\\RadConnext\\Radconnext-win32-x64\\resources\\app\\http\\log\\log.log ftp://119.59.125.63/domains/radconnext.com/private_html/radconnext/inc_files/</p>'));
		$(exampleCommandBox).append($('<p>D:/Radconnext/restart.bat</p>'));
    const userdata = JSON.parse(localStorage.getItem('userdata'));
		if (hospitalId){
			$(hospitalInput).val(hospitalId);
		} else {
			$(hospitalInput).val(userdata.hospitalId);
		}

    wsm = util.doConnectWebsocketMaster(userdata.username, userdata.usertypeId, userdata.hospitalId, 'none');
    /*
    let extOnMsg = $.extend({
        onmessage : function(evt){
          console.log(evt);
        }
    }, wsm.onmessage);

    wsm.onmessage = extOnMsg;
    */
    $(echoCmdCmd).on('click', (evt)=>{
      let hospitalId = $(hospitalInput).val();
      let username = userdata.username;
      wsm.send(JSON.stringify({type: 'clientecho', hospitalId: hospitalId, sender: username, sendto: 'orthanc'}));
    });

    $(executeCmdCmd).on('click', (evt)=>{
      let hospitalId = $(hospitalInput).val();
      let username = userdata.username;
      let commands = $(commandsListInput).val();
      var lines = [];
      $.each(commands.split(/\n/), function(i, line){
        if(line){
          lines.push(line);
        } else {
          lines.push("");
        }
      });
      wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
    });

    $(logFileCmdCmd).on('click', (evt)=>{
			let hospitalId = $(hospitalInput).val();
      let username = userdata.username;
			wsm.send(JSON.stringify({type: 'clientlog', hospitalId: hospitalId, sender: username, sendto: 'orthanc'}));
    });

		$(reportLogFileCmdCmd).on('click', (evt)=>{
			let hospitalId = $(hospitalInput).val();
      let username = userdata.username;
			wsm.send(JSON.stringify({type: 'clientreportlog', hospitalId: hospitalId, sender: username, sendto: 'orthanc'}));
    });

		$(dicomLogFileCmdCmd).on('click', (evt)=>{
			let hospitalId = $(hospitalInput).val();
      let username = userdata.username;
			wsm.send(JSON.stringify({type: 'clientdicomlog', hospitalId: hospitalId, sender: username, sendto: 'orthanc'}));
    });

		$(restartServiceCmdCmd).on('click', (evt)=>{
      let hospitalId = $(hospitalInput).val();
			let username = userdata.username;
			wsm.send(JSON.stringify({type: 'clientrestart', hospitalId: hospitalId, sender: username, sendto: 'orthanc'}));
		});

		$(backCmd).on('click', (evt)=>{
			//window.open('/staff.html');
			window.location.replace('/staff.html');
		});

		$(reSendDicomCmd).on('click', (evt)=>{
			let loadModalityCommand = 'curl --user demo:demo http://localhost:8042/modalities?expand';
			let lines = [loadModalityCommand];
			let username = userdata.username;
			let hospitalId = $(hospitalInput).val();
			wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
			setTimeout(()=>{
				let studyId = $(commandsListInput).val();
				if (studyId !== '') {
					let reSendStudyCommand = 'curl -v -X POST --user demo:demo http://localhost:8042/modalities/cloud/store -d ' + studyId;
					lines = [reSendStudyCommand];
					wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
					$.notify("ระบบกำลังจัดส่งภาพเข้าระบบด้วยเส้นทางใหม่ โปรดรอสักครู่", "info");
				}
			}, 5000);
		});

		$(compareDicomCmd).on('click', (evt)=>{
			let todayStudy = util.getToday() + '-';
			let loadModalityCommand = 'curl --user demo:demo -X POST http://localhost:8042/tools/find -d "{\\"Level\\" : \\"Study\\",  \\"Query\\" : {\\"StudyDate\\" : \\"' + todayStudy + '\\" }}"';
			let lines = [loadModalityCommand];
			let username = userdata.username;
			let hospitalId = $(hospitalInput).val();
			wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
			$.notify("ระบบกำลังสำรวจภาพจากในระบบกับ รพ. โปรดรอสักครู่", "info");
		});

    let remoteRunBox = $('<div id ="RemoteRunBox" style="display: table; width: 100%; border-collapse: collapse;"></div>');
    $(remoteRunBox).append($(hospitalIdBox)).append($(monitorBox)).append($(commandsListBox)).append($(executeCmdBox));
		let remoteBox = $('<div style="position: relative; width: 100%;"></div>');
		let backCmdBox = $('<div style="position: relative; width: 100%; text-align: center;"></div>');
		$(backCmdBox).append($(backCmd));
		return $(remoteBox).append($(remoteRunBox)).append($(exampleCommandBox)).append($(backCmdBox));
  }

	const doCreateResultMonitor = function(){
		let monitorBox = $('<div id ="MonitorBox" style="position: relative; width: 100%; padding: 5px; min-height: 250px; background-color: black; color: white; overflow: scroll; resize: both;"></div>');
		return $( monitorBox);
	}

	const onClientResult = async function(evt){
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let clientData = evt.detail.data;
		let clientOwnerId = evt.detail.owner;
		let clientHospitalId = evt.detail.hospitalId;
		//console.log(clientData);
		//let lines = clientData.split('\n');
		//console.log(lines);
		let resultBox = $('<div style="position: relative; width: 100%; padding: 5px; color: white;"></div>');
		$(resultBox).text(clientData);
		let monitorHandle = $('#app').find('#MonitorBox');
		$(monitorHandle).append($(resultBox));

		let clientDataObject = undefined;
		//console.log(typeof clientData);
	  if ((typeof clientData) == 'string') {
			if (clientData !== '') {
	    	clientDataObject = JSON.parse(clientData);
			} else {
				clientDataObject = {};
			}
	  } else if ((typeof clientData) == 'object') {
			if (clientData && clientData.length > 0){
	    	clientDataObject = clientData;
			} else {
				clientDataObject = {};
			}
	  } else {
	    clientDataObject = {};
	  }
		//console.log(clientDataObject);

		let parentResources = clientDataObject.hasOwnProperty('ParentResources');
		let failedInstancesCount = clientDataObject.hasOwnProperty('FailedInstancesCount');
		let instancesCount = clientDataObject.hasOwnProperty('InstancesCount');
		if ((parentResources) && (failedInstancesCount) && (instancesCount)){
			let studyID = clientDataObject.ParentResources[0];
			let studyTags = await common.doCallLoadStudyTags(clientHospitalId, studyID);
			console.log(studyTags);
			let reStudyRes = await common.doReStructureDicom(clientHospitalId, studyID, studyTags);
			console.log(reStudyRes);
		} else {
			let cloudModality = clientDataObject.hasOwnProperty('cloud');
			console.log(cloudModality);
	    if (cloudModality) {
	      let cloudHost = clientDataObject.cloud.Host;
	      let newCloudHost = undefined;
	      if (cloudHost == '150.95.26.106'){
	        newCloudHost = '202.28.68.28';
	      } else {
	        newCloudHost = '150.95.26.106'
	      }
	      let cloudAET = clientDataObject.cloud.AET;
	      let cloudPort = clientDataObject.cloud.Port;
	      let changeCloudCommand = 'curl -v --user demo:demo -X PUT http://localhost:8042/modalities/cloud -d "{\\"AET\\" : \\"' + cloudAET + '\\", \\"Host\\": \\"' + newCloudHost +'\\", \\"Port\\": ' + cloudPort + '}"';
				console.log(changeCloudCommand);
	      let lines = [changeCloudCommand];
				let username = userdata.username;
				let hospitalId = $('#HospitalInput').val();
	      wsm.send(JSON.stringify({type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: username, sendto: 'orthanc'}));
	      $('body').loading('stop');
	    } else {
				if (clientDataObject[0]) {
					let localStudiesToday = clientDataObject;
					console.log(localStudiesToday);
					let todayStudy = util.getToday() + '-';
					let rqParams = {};
					let apiUrl = '/api/orthancproxy/find?hospitalId=' + clientHospitalId + '&username=demo&method=POST&uri=/tools/find -d \'{"Level" : "Study",  "Query" : {"StudyDate" : "' + todayStudy + '" }}\'';
					let cloudStudiesToday = await common.doGetApi(apiUrl, rqParams);
					console.log(cloudStudiesToday);
					let diffStudiesToday = localStudiesToday.filter(x => !cloudStudiesToday.includes(x));
					console.log(diffStudiesToday);
					if (diffStudiesToday.length > 0){
						diffStudiesToday.forEach((study, i) => {
							$('#CommandsListInput').empty().val(study);
							$('#ReSendDicomCmd').click();
							setTimeout(()=>{
								//
							}, 5000);
						});
					} else {
						cloudStudiesToday.forEach((studyID, i) => {
							let studyTags = await doCallLoadStudyTags(clientHospitalId, studyID);
			        console.log(studyTags);
			        let reStudyRes = await doReStructureDicom(clientHospitalId, studyID, studyTags);
			        console.log(reStudyRes);
						});
					}
				}
			}
		}
	}

	const onClientLogReturn = function(evt){
		let clientData = evt.detail.data;
		console.log(clientData);
		let logBox = $('<div style="position: relative; width: 100%; padding: 5px; color: white;"></div>');
		$(logBox).append($('<a href="' + clientData.link + '" target="_blank">' + clientData.link + '</a>'));
		let monitorHandle = $('#app').find('#MonitorBox');
		$(monitorHandle).append($(logBox));
	}

	const onClientEchoReturn = function(evt){
		let clientData = evt.detail.data;
		console.log(clientData);
		let echoMsgBox = $('<div style="position: relative; width: 100%; padding: 5px; color: white;"></div>');
		$(echoMsgBox).text(clientData);
		let monitorHandle = $('#app').find('#MonitorBox');
		$(monitorHandle).append($(echoMsgBox));
	}

	$('#MonitorBox').resize(()=>{
		console.log('evt');
	});

	function doCallLoadStudyTags(hospitalId, studyId){
    return new Promise(async function(resolve, reject) {
      let rqBody = '{"Level": "Study", "Expand": true, "Query": {"PatientName":"TEST"}}';
      let orthancUri = '/studies/' + studyId;
	  	let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
      let callLoadUrl = '/api/orthancproxy/find'
      $.post(callLoadUrl, params).then((response) => {
        resolve(response);
      });
    });
  }

  function doReStructureDicom(hospitalId, studyId, dicom){
    return new Promise(async function(resolve, reject) {
      let params = {hospitalId: hospitalId, resourceId: studyId, resourceType: "study", dicom: dicom};
      let restudyUrl = '/api/dicomtransferlog/add';
      $.post(restudyUrl, params).then((response) => {
        resolve(response);
      });
    });
  }

  return {
    doOpenRemoteRun,
		onClientResult,
		onClientLogReturn,
		onClientEchoReturn
	}
}
