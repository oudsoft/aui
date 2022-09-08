/* newcaselib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);
	const chatman = require('./chatmanager.js')($);

  const doCreateNewCaseTitlePage = function() {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
    const newcaseTitle = 'แจ้งงานใหม่';
    let newcaseTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/new-case-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(newcaseTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + newcaseTitle + '</h3></div>');
    $(titleText).appendTo($(newcaseTitleBox));

		let readySwitchBox = $('<div id="ReadyState" style="position: relative; display: inline-block; float: right; top: 15px;"></div>');
		let readyOption = {switchTextOnState: 'เปิดรับเคส', switchTextOffState: 'ปิดรับเคส',
			onActionCallback: ()=>{
				doUpdateReadyState(1);
				readySwitch.onAction();
			},
			offActionCallback: ()=>{
				doUpdateReadyState(0);
				readySwitch.offAction();
			}
		};
		let readySwitch = $(readySwitchBox).readystate(readyOption);
		$(readySwitchBox).appendTo($(newcaseTitleBox));
		if (userdata.userprofiles.length > 0) {
			if (userdata.userprofiles[0].Profile.readyState == 1) {
				readySwitch.onAction();
			} else {
				readySwitch.offAction();
			}
		} else {
			readySwitch.offAction();
		}

    return $(newcaseTitleBox);
  }

	const doUpdateReadyState = async function(state) {
		$('body').loading('start');
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		userdata.userprofiles[0].Profile.readyState = state;
		userdata.userprofiles[0].Profile.readyBy = 'user';
		localStorage.setItem('userdata', JSON.stringify(userdata));
		let rqParams = {data: userdata.userprofiles[0].Profile, userId: userdata.id};
		console.log(rqParams);
		let profileRes = await common.doCallApi('/api/userprofile/update', rqParams);
		let onoffText = undefined;
		if (state==1) {
			onoffText = 'เปิด';
		} else {
			onoffText = 'ปิด';
		}
		if (profileRes.status.code == 200){
			$.notify(onoffText + "รับงาน - Sucess", "success");
			$('body').loading('stop');
		} else {
			$.notify('ไม่สามารถ' + onoffText + 'รับงาน - Error โปรดติดต่อผู้ดูแลระบบ', 'error');
			$('body').loading('stop');
		}
	}

  const doCreateHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Receive</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Left</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Scan Part</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Urgent</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Sex/Age</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Command</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

	const doCreateConsultHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Receive</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Time Left</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Urgent</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Command</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

  function doCreateCaseItemCommand(caseItem) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
    let caseCmdBox = $('<div style="text-align: center; padding: 4px; width: 100%;"></div>');
    let acceptCmd = $('<div>Accept</div>');
    $(acceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'green', 'color': 'white'});
    $(acceptCmd).on('click', async (evt)=>{
      let response = await common.doUpdateCaseStatus(caseItem.id, 2, 'Radiologist Accept case by Web App');
			if (response.status.code == 200) {
				let newDicomZipSync = {caseId: caseItem.id, studyID: caseItem.Case_OrthancStudyID};
				let dicomzipsync = JSON.parse(localStorage.getItem('dicomzipsync'));
				if (dicomzipsync.length > 0){
					dicomzipsync.push(newDicomZipSync);
				} else {
					dicomzipsync = [];
					dicomzipsync.push(newDicomZipSync);
				}
				localStorage.setItem('dicomzipsync', JSON.stringify(dicomzipsync));
				//util.dicomZipSyncWorker.postMessage({studyID: newDicomZipSync.studyID, type: 'application/x-compressed'});
				$('#NewCaseCmd').click();
			} else {
				alert('เกิดข้อผิดพลาด ไม่สามารถตอบรับเคสได้ในขณะนี้');
			}
    });
    $(caseCmdBox).append($(acceptCmd));

    let notAacceptCmd = $('<div>Reject</div>');
    $(notAacceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'red', 'color': 'white'});
    $(notAacceptCmd).on('click', async (evt)=>{
      let response = await common.doUpdateCaseStatus(caseItem.id, 3, 'Radiologist Reject case by Web App')
			if (response.status.code == 200) {
				$('#NewCaseCmd').click();
			} else {
				alert('เกิดข้อผิดพลาด ไม่สามารถตอบปฏิเสธเคสได้ในขณะนี้');
			}
    });
    $(caseCmdBox).append($(notAacceptCmd))

    return $(caseCmdBox);
  }

  const doCreateCaseItemRow = function(caseItem, caseTask) {
    return new Promise(async function(resolve, reject) {
      //let caseTask = await common.doCallApi('/api/tasks/select/'+ caseItem.id, {});
			if ((caseTask) && (caseTask.triggerAt)){
				let caseDate = util.formatDateTimeStr(caseItem.createdAt);
				let casedatetime = caseDate.split('T');
				let casedateSegment = casedatetime[0].split('-');
				casedateSegment = casedateSegment.join('');
				let casedate = util.formatStudyDate(casedateSegment);
				let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));

				let patientName = caseItem.patient.Patient_NameEN + ' ' + caseItem.patient.Patient_LastNameEN;
				let patientSA = caseItem.patient.Patient_Sex + '/' + caseItem.patient.Patient_Age;
				let patientHN = caseItem.patient.Patient_HN;
				let caseScanparts = caseItem.Case_ScanPart;
				let yourSelectScanpartContent = $('<div></div>');
				if ((caseScanparts) && (caseScanparts.length > 0)) {
					yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
				}
				let caseUG = caseItem.urgenttype.UGType_Name;
	      let caseHosName = caseItem.hospital.Hos_Name;

				let caseCMD = doCreateCaseItemCommand(caseItem);

	      let caseRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');

	  		let caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append('<span>' + casedate + ' : ' + casetime + '</span>');
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	      //if ((caseTask) && (caseTask.triggerAt)){
	        let caseTriggerAt = new Date(caseTask.triggerAt);
	        let diffTime = Math.abs(caseTriggerAt - new Date());
	        let hh = parseInt(diffTime/(1000*60*60));
	        let mn = parseInt((diffTime - (hh*1000*60*60))/(1000*60));
	        let clockCountdownDiv = $('<div></div>').css({'width': '100%', 'text-align': 'center'});;
	        $(clockCountdownDiv).countdownclock({countToHH: hh, countToMN: mn});
	        $(caseColumn).append($(clockCountdownDiv));
	      //} else {
	        //$(caseColumn).append($('<span>not found Task</span>'));
	  		//}
				let totalMinus = (hh*60) + mn;
				if (totalMinus < 30){
					$(clockCountdownDiv).css({'background-color': '#8532EF', 'color': 'white'});
				} else if (totalMinus < 60){
					$(clockCountdownDiv).css({'background-color': '#EF3232', 'color': 'white'});
				} else if (totalMinus < 240){
					$(clockCountdownDiv).css({'background-color': '#FF5733', 'color': 'white'});
				} else if (totalMinus < 1440){
					$(clockCountdownDiv).css({'background-color': '#F79C06', 'color': 'white'});
				} else {
					$(clockCountdownDiv).css({'background-color': '#177102 ', 'color': 'white'});
				}

	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($(yourSelectScanpartContent));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + caseUG + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + patientHN + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + patientName + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + patientSA + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($('<span>' + caseHosName + '</span>'));
	  		$(caseColumn).appendTo($(caseRow));

	      caseColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
	  		$(caseColumn).append($(caseCMD));
	  		$(caseColumn).appendTo($(caseRow));

	      resolve($(caseRow));
			} else {
				let eventName = 'triggercounter'
				let triggerData = {caseId : caseItem.id, statusId: 7, thing: 'case'};
				let event = new CustomEvent(eventName, {"detail": {eventname: eventName, data: triggerData}});
				document.dispatchEvent(event);
				resolve();
			}
    });
  }

	const doCreateConsultItemRow = function(consultItem){
		return new Promise(async function(resolve, reject) {
			let consultTask = await common.doCallApi('/api/consult/tasks/select/'+ consultItem.id, {});
			let consultDate = util.formatDateTimeStr(consultItem.createdAt);
			let consultdatetime = consultDate.split('T');
			let consultdateSegment = consultdatetime[0].split('-');
			consultdateSegment = consultdateSegment.join('');
			let consultdate = util.formatStudyDate(consultdateSegment);
			let consulttime = util.formatStudyTime(consultdatetime[1].split(':').join(''));

			let patientName = consultItem.PatientName;
			let patientHN = consultItem.PatientHN;
			let consultUG = consultItem.UGType;
      let consultHosName = consultItem.hospital.Hos_Name;

			let consultCMD = await doCreateConsultItemCommand(consultItem);

      let consultRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');

			let consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append('<span>' + consultdate + ' : ' + consulttime + '</span>');
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			if (consultItem.casestatusId == 1){
	      if ((consultTask.Tasks) && (consultTask.Tasks.length > 0) && (consultTask.Tasks[0]) && (consultTask.Tasks[0].triggerAt)){
	        let consultTriggerAt = new Date(consultTask.Tasks[0].triggerAt);
	        let diffTime = Math.abs(consultTriggerAt - new Date());
	        let hh = parseInt(diffTime/(1000*60*60));
	        let mn = parseInt((diffTime - (hh*1000*60*60))/(1000*60));
	        let clockCountdownDiv = $('<div></div>');
	        $(clockCountdownDiv).countdownclock({countToHH: hh, countToMN: mn});
	        $(consultColumn).append($(clockCountdownDiv));
	      } else {
	        $(consultColumn).append($('<span>not found Task</span>'));
	  		}
			} else {
				$(consultColumn).append($('<span>-</span>'));
			}
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			let ugValue = $('<span>' + consultUG + '</span>');
  		$(consultColumn).append($(ugValue));
  		$(consultColumn).appendTo($(consultRow));
			$(ugValue).load('/api/urgenttypes/urgname/select/' + consultUG);

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($('<span>' + patientHN + '</span>'));
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($('<span>' + patientName + '</span>'));
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($('<span>' + consultHosName + '</span>'));
  		$(consultColumn).appendTo($(consultRow));

      consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
  		$(consultColumn).append($(consultCMD));
  		$(consultColumn).appendTo($(consultRow));

      resolve($(consultRow));
		});
	}

	const doCreateConsultItemCommand = function(consultItem){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let consultId = consultItem.id;
			let fakPaient = {
				Patient_HN: consultItem.patientHN,
				Patient_NameEN: consultItem.patientName,
				Patient_LastNameEN: '',
				Patient_Sex: '',
				Patient_Age: ''
			}
			let caseData = {
				casestatusId: consultItem.casestatusId,
				Case_BodyPart: '',
				patient: fakPaient
			}
			let fakeCase = {
				case: caseData
			}
	    let consultCmdBox = $('<div style="text-align: center; padding: 4px; width: 100%;"></div>');
			if (consultItem.casestatusId == 1){
		    let acceptCmd = $('<div>Accept</div>');
		    $(acceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'green', 'color': 'white'});
		    $(acceptCmd).on('click', async (evt)=>{
		      let response = await common.doUpdateConsultStatus(consultItem.id, 2);
					if (response.status.code == 200) {
						let openResult = await doOpenChatbox(consultId, fakeCase, consultItem);
					} else {
						alert('เกิดข้อผิดพลาด ไม่สามารถตอบรับ Consult ได้ในขณะนี้');
					}
		    });
		    $(consultCmdBox).append($(acceptCmd));

		    let notAacceptCmd = $('<div>Reject</div>');
		    $(notAacceptCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'red', 'color': 'white'});
		    $(notAacceptCmd).on('click', async (evt)=>{
		      let response = await common.doUpdateConsultStatus(consultItem.id, 3);
					if (response.status.code == 200) {
						$('#NewCaseCmd').click();
					} else {
						alert('เกิดข้อผิดพลาด ไม่สามารถตอบปฏิเสธ Consult ได้ในขณะนี้');
					}
		    });
		    $(consultCmdBox).append($(notAacceptCmd))
			} else if (consultItem.casestatusId == 2){
				let openCmd = $('<div>Open</div>');
				$(openCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'orange', 'color': 'white'});
				$(consultCmdBox).append($(openCmd));
				$(openCmd).on('click', async (evt)=>{
					let openResult = await doOpenChatbox(consultId, fakeCase, consultItem);
				});
				let closeCmd = $('<div>Close</div>');
				$(closeCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'grey', 'color': 'white'});
				$(consultCmdBox).append($(closeCmd));
				$(closeCmd).on('click', async (evt)=>{
					let response = await common.doUpdateConsultStatus(consultItem.id, 6);
					if (response.status.code == 200) {
						$.notify('จบการปรึกษา - Success', 'success');
						$('#NewCaseCmd').click();
					} else {
						$.notify('ไม่สามารถจบการปรึกษา - Error โปรดติดต่อผู้ดูแลระบบ', 'error');
					}
				});
			}
	    resolve($(consultCmdBox));
		});
	}

  const doCallMyNewCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let rqParams = {userId: userId, statusId: common.caseReadWaitStatus};
			let apiUrl = '/api/cases/filter/radio';
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doCallMyTasksCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let username = userdata.username;
			let rqParams = {userId: userId, username: username, statusId: common.caseReadWaitStatus};
			let apiUrl = '/api/tasks/filter/radio/' + userId;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doFindTaksOfCase = function(tasks, caseId){
		return new Promise(async function(resolve, reject) {
			let task = await tasks.find((item)=>{
				if (item.caseId == caseId) return item;
			});
			resolve(task);
		});
	}

	const doCallMyNewConsult = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let rqParams = {userId: userId, statusId: [1 ,2]};
			let apiUrl = '/api/consult/filter/radio';
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  const doCreateNewCasePage = function() {
    return new Promise(async function(resolve, reject) {
      $('body').loading('start');
      let myNewCase = await doCallMyNewCase();
			let myTasks = await doCallMyTasksCase();
			//console.log(myTasks);
			if (myNewCase.status.code == 200){
				let myNewConsult = await doCallMyNewConsult();
				let myCaseViewBox = $('<div style="position: relative; width: 100%;"></div>');
				let myCaseTitleBar = $('<div style="position: relative; width: 100%;"><h3>เคสใหม่</h3></div>');
				$(myCaseViewBox).append($(myCaseTitleBar))
	      let caseLists = myNewCase.Records;
				console.log(caseLists);
	      if (caseLists.length > 0) {
					let myNewCaseView = $('<div style="display: table; width: 100%; border-collapse: collapse; margin-top: -25px;"></div>');
					$(myNewCaseView).appendTo($(myCaseViewBox));
		      let caseHeader = doCreateHeaderRow();
		      $(myNewCaseView).append($(caseHeader));
	        for (let i=0; i < caseLists.length; i++) {
	          let caseItem = caseLists[i];
						let task = await doFindTaksOfCase(myTasks.Records, caseItem.id);
	          let caseRow = await doCreateCaseItemRow(caseItem, task);
						if (caseRow){
	          	$(myNewCaseView).append($(caseRow));
						}
	        }
	      } else {
	        let notFoundCaseMessage = $('<p style="margin-top: -20px;">ไม่พบรายการเคสใหม่ของคุณในขณะนี้</p>')
	        $(myCaseViewBox).append($(notFoundCaseMessage));
	      }

				let myConsultTitleBar = $('<div style="position: relative; width: 100%;"><h3>Consult ใหม่</h3></div>');
				$(myCaseViewBox).append($(myConsultTitleBar))
	      let consultLists = myNewConsult.Records;
	      if (consultLists.length > 0) {
					let myNewConsultView = $('<div style="display: table; width: 100%; border-collapse: collapse; margin-top: -25px;"></div>');
					$(myNewConsultView).appendTo($(myCaseViewBox));
		      let consultHeader = doCreateConsultHeaderRow();
		      $(myNewConsultView).append($(consultHeader));
	        for (let i=0; i < consultLists.length; i++) {
	          let consultItem = consultLists[i];
	          let consultRow = await doCreateConsultItemRow(consultItem);
	          $(myNewConsultView ).append($(consultRow));
	        }
	      } else {
	        let notFoundConsultMessage = $('<p style="margin-top: -20px;">ไม่พบรายการ Consult ใหม่ของคุณในขณะนี้</p>')
	        $(myCaseViewBox).append($(notFoundConsultMessage));
	      }

				let searchConsultCmd = doCreateSearchConsultCmd();
				$(myCaseViewBox).append($(searchConsultCmd));

				let allNewIntend = caseLists.length + consultLists.length;
				if (allNewIntend > 0) {
					$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').text(allNewIntend);
					$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
				} else {
					$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
				}

	      $('body').loading('stop');
	      resolve($(myCaseViewBox));
			} else if (myNewCase.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyNewCase';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

	const doOpenChatbox = function(caseId, fakeOpen, consultItem){
		return new Promise(async function(resolve, reject) {
			let patientHRLine = $('<div style="width: 99%; min-height: 80px;"></div>');
			let patientTitleBar = $('<div style="position: relative; width: 100%;"><b>HN: </b>' + consultItem.PatientHN + ' <b>Name: </b> ' + consultItem.PatientName + ' <b>โรงพยาลาล: </b>' + consultItem.hospital.Hos_Name + '</div>');
			$(patientHRLine).append($(patientTitleBar));
			let patientHRList = consultItem.PatientHRLink;
			patientHRList.forEach((hrlink, i) => {
				let hrIcon = $('<img style="width: 100px; height: auto; cursor: pointer;"/>');
				$(hrIcon).attr('src', hrlink.link);
				$(hrIcon).on('click', (evt)=>{
					window.open(hrlink.link, '_blank');
				});
				$(patientHRLine).append($(hrIcon));
			});

			let contactContainer = $('<div id="ContactContainer" style=" position: relative; width: 100%; padding: 4px; margin-top: 10px; text-align: right;"></div>');
			$(contactContainer).on('newconversation', async (evt, data) =>{
				let eventData = {msg: data.message.msg, from: data.message.from, context: data.message.context};
				setTimeout(()=>{
					let selector = '#'+data.audienceId + ' .chatbox';
					let targetChatBox = $(selector);
					$(targetChatBox).trigger('messagedrive', [eventData]);
				}, 300);
			});

			let contactIconBar = $('<div id="ContactBar" style="position: relative; width: 100%"></div>');
			$(contactIconBar).appendTo($(contactContainer));
			let chatBoxContainer = $('<div id="ChatBoxContainer" style="position: relative; width: 100%;"></div>');
			$(chatBoxContainer).css('display', 'block');
			$(chatBoxContainer).appendTo($(contactContainer));


			let audienceUserId = consultItem.userId;
			let audienceInfo = await apiconnector.doGetApi('/api/users/select/' + audienceUserId, {});
			let audienceId = audienceInfo.user[0].username;
			let audienceName = audienceInfo.user[0].userinfo.User_NameTH + ' ' + audienceInfo.user[0].userinfo.User_LastNameTH;
			let topicId = consultItem.id;
			let topicName = consultItem.PatientHN + ' ' + consultItem.PatientName;
			let topicType = 'consult';
			let contact = await chatman.doCreateNewAudience(audienceId, audienceName, topicId, topicName);
			if (contact) {
				$(contact).appendTo($(contactIconBar));
				let simpleChat = chatman.doCreateSimpleChatBox(topicId, topicName, topicType, audienceId, audienceName, consultItem.casestatusId);
				$(chatBoxContainer).css('display', 'block');
				$(simpleChat.chatBox).css('display', 'block');
				$(simpleChat.chatBox).appendTo($(chatBoxContainer));
				simpleChat.handle.restoreLocal();
				simpleChat.handle.scrollDown();
				$(".mainfull").empty().append($(patientHRLine)).append($(contactContainer));
				resolve(simpleChat);
			} else {
				resolve();
			}
		});
	}

	/*******************/
	/* Consult Search */
	/*******************/

	const doCreateSearchConsultCmd = function(){
		let searchIcon = $('<img src="/images/chat-history-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 5px;"/>');
		let searchCmdLabel = $('<span style="position: relative; display: inline-block; margin-left: 5px; top: -10px;">รายการ Consult เก่า</span>');
		let searchCmd = $('<div style="position: relative; display: inline-block; cursor: pointer; background-color: #062EAA; color: white; border: 2px solid #6D7CA9; padding: 2px;"></div>');
		$(searchCmd).append($(searchIcon)).append($(searchCmdLabel));
		$($(searchCmd)).on('click', (evt)=>{
			doLoadSearchConsult();
		});
		return $(searchCmd);
	}

	const doLoadSearchConsult = function(){
		$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let toDayFormat = util.getTodayDevFormat();

		let defaultSearchKey = {fromDateKeyValue: toDayFormat, patientNameENKeyValue: '*', patientHNKeyValue: '*', caseStatusKeyValue: 6};
		let defaultSearchParam = {key: defaultSearchKey, hospitalId: userdata.hospitalId, userId: userdata.id, usertypeId: userdata.usertypeId};
		common.doCallApi('/api/consult/search/key', defaultSearchParam).then(async(response)=>{
			$('body').loading('stop');
			if (response.status.code === 200) {
				let searchResultViewDiv = $('<div id="SearchResultView"></div>');
				$(".mainfull").append($(searchResultViewDiv));
				await doShowSearchConsultCallback(response);
			} else {
				$(".mainfull").append('<h3>ระบบค้นหา Consult เก่า ขัดข้อง โปรดแจ้งผู้ดูแลระบบ</h3>');
			}
		});
	}

	const doShowSearchConsultCallback = function(response){
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
		  let userItemPerPage = userDefualtSetting.itemperpage;

			let showCases = [];

			let allCaseRecords = response.Records;
			if (userItemPerPage == 0) {
				showCases = allCaseRecords;
			} else {
				showCases = await common.doExtractList(allCaseRecords, 1, userItemPerPage);
			}
			let consultView = await doShowConsultView(showCases, response.key, doShowSearchConsultCallback);
			$(".mainfull").find('#SearchResultView').empty().append($(consultView));

			if (allCaseRecords.length == 0) {
				$(".mainfull").find('#SearchResultView').append($('<h4>ไม่พบรายการ Consult เก่า ตามเงื่อนไขที่คุณค้นหา</h4>'));
			} else {
				let navigBarBox = $('<div id="NavigBar"></div>');
				$(".mainfull").append($(navigBarBox));
				let navigBarOption = {
					currentPage: 1,
					itemperPage: userItemPerPage,
					totalItem: allCaseRecords.length,
					styleClass : {'padding': '4px', "font-family": "THSarabunNew", "font-size": "20px"},
					changeToPageCallback: async function(page){
						$('body').loading('start');
						let toItemShow = 0;
						if (page.toItem == 0) {
							toItemShow = allCaseRecords.length;
						} else {
							toItemShow = page.toItem;
						}
						showCases = await common.doExtractList(allCaseRecords, page.fromItem, toItemShow);
						consultView = await doShowConsultView(showCases, response.key, doShowSearchConsultCallback);
						$(".mainfull").find('#SearchResultView').empty().append($(consultView));
						$('body').loading('stop');
					}
				};
				let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
				navigatoePage.toPage(1);
			}
			$('body').loading('stop');
			resolve();
		});
	}

	const doShowConsultView = function(consults, key, callback) {
		return new Promise(function(resolve, reject) {
			let rowStyleClass = {"font-family": "THSarabunNew", "font-size": "22px"};
			let consultView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');

			let headView = doCreateSearchConsultHeaderRow();
			$(headView).appendTo($(consultView));
			let formView = doCreateSearchConsultFormRow(key, callback);
			$(formView).appendTo($(consultView));

			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < consults.length; i++) {
					let itemView = await doCreateSearchConsultItemRow(consults[i]);
					$(itemView).appendTo($(consultView));
				}
				setTimeout(()=>{
					resolve2($(consultView));
				}, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreateSearchConsultFormRow = function(key, searchResultCallback){
		let searchFormRow = $('<div style="display: table-row; width: 100%;"></div>');
		let formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');

		let fromDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ตั้งแต่</span>
		$(fromDateKeyBox).appendTo($(formField));
		let fromDateKey = $('<input type="text" id="FromDateKey" size="6" style="margin-left: 5px;"/>');
		if (key.fromDateKeyValue) {
			let arrTmps = key.fromDateKeyValue.split('-');
			let fromDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
			$(fromDateKey).val(fromDateTextValue);
		}
		$(fromDateKey).css({'font-size': '20px'});
		$(fromDateKey).appendTo($(fromDateKeyBox));
		$(fromDateKey).datepicker({ dateFormat: 'dd-mm-yy' });

		$(formField).append($('<span style="margin-left: 5px; margin-right: 2px; display: inline-block;">-</span>'));

		let toDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ถึง</span>
		$(toDateKeyBox).appendTo($(formField));
		let toDateKey = $('<input type="text" id="ToDateKey" size="6" style="margin-left: 5px;"/>');
		if (key.toDateKeyValue) {
			let arrTmps = key.toDateKeyValue.split('-');
			let toDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
			$(toDateKey).val(toDateTextValue);
		}
		$(toDateKey).appendTo($(toDateKeyBox));
		$(toDateKey).datepicker({ dateFormat: 'dd-mm-yy' });
		$(formField).append($(toDateKeyBox));

		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let patientNameENKey = $('<input type="text" id="PatientNameENKey" size="15"/>');
		$(patientNameENKey).val(key.patientNameENKeyValue);
		$(formField).append($(patientNameENKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let patientHNKey = $('<input type="text" id="PatientHNKey" size="10"/>');
		$(patientHNKey).val(key.patientHNKeyValue);
		$(formField).append($(patientHNKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left;vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left;vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');
		let startSearchCmd = $('<img src="/images/search-icon-3.png" width="30px" height="auto"/>');
		$(formField).append($(startSearchCmd));
		$(formField).appendTo($(searchFormRow));

		$(searchFormRow).find('input[type=text],select').css({'font-size': '20px'});

		$(startSearchCmd).css({'cursor': 'pointer'});
		$(startSearchCmd).on('click', async (evt) => {
			let fromDateKeyValue = $('#FromDateKey').val();
			let toDateKeyValue = $(toDateKey).val();
			let patientNameENKeyValue = $(patientNameENKey).val();
			let patientHNKeyValue = $(patientHNKey).val();
			//let bodypartKeyValue = $(bodypartKey).val();
			let caseStatusKeyValue = 6;
			let searchKey = undefined;
			if ((fromDateKeyValue) && (toDateKeyValue)) {
				let arrTmps = fromDateKeyValue.split('-');
				fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
				let fromDateKeyTime = new Date(fromDateKeyValue);
				arrTmps = toDateKeyValue.split('-');
				toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
				let toDateKeyTime = new Date(toDateKeyValue);
				if (toDateKeyTime >= fromDateKeyTime) {
					let fromDateFormat = util.formatDateStr(fromDateKeyTime);
					let toDateFormat = util.formatDateStr(toDateKeyTime);
					searchKey = {fromDateKeyValue: fromDateFormat, toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue,caseStatusKeyValue};
				} else {
					alert('ถึงวันที่ ต้องมากกว่า ตั้งแต่วันที่ หรือ เลือกวันที่เพียงช่องใดช่องหนึ่ง ส่วนอีกช่องให้เว้นว่างไว้\nโปรดเปลี่ยนค่าวันที่แล้วลองใหม่');
				}
			} else {
				if (fromDateKeyValue) {
					let arrTmps = fromDateKeyValue.split('-');
					fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
					let fromDateKeyTime = new Date(fromDateKeyValue);
					let fromDateFormat = util.formatDateStr(fromDateKeyTime);
					searchKey = {fromDateKeyValue: fromDateFormat, patientNameENKeyValue, patientHNKeyValue, caseStatusKeyValue};
				} else if (toDateKeyValue) {
					let arrTmps = toDateKeyValue.split('-');
					toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
					let toDateKeyTime = new Date(toDateKeyValue);
					let toDateFormat = util.formatDateStr(toDateKeyTime);
					searchKey = {toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue,caseStatusKeyValue};
				} else {
					searchKey = {patientNameENKeyValue, patientHNKeyValue, caseStatusKeyValue};
				}
			}
			if (searchKey) {
				$('body').loading('start');
				let userdata = JSON.parse(localStorage.getItem('userdata'));
				let hospitalId = userdata.hospitalId;
				let userId = userdata.id;
				let usertypeId = userdata.usertypeId;

				let searchParam = {key: searchKey, hospitalId: hospitalId, userId: userId, usertypeId: usertypeId};

				let response = await common.doCallApi('/api/consult/search/key', searchParam);

				$(".mainfull").find('#SearchResultView').empty();
        $(".mainfull").find('#NavigBar').empty();

				await doShowSearchConsultCallback(response);

				$('body').loading('stop');

			}
		});

		return $(searchFormRow);

	}

	const doCreateSearchConsultHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>วันที่</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Name</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ประวัติ</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>โรงพยาบาล</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Command</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

	const doCreateSearchConsultItemRow = function(consultItem){
		return new Promise(async function(resolve, reject) {
			let consultDate = util.formatDateTimeStr(consultItem.createdAt);
			let consultdatetime = consultDate.split('T');
			let consultdateSegment = consultdatetime[0].split('-');
			consultdateSegment = consultdateSegment.join('');
			let consultdate = util.formatStudyDate(consultdateSegment);
			let consulttime = util.formatStudyTime(consultdatetime[1].split(':').join(''));

			let patientName = consultItem.PatientName;
			let patientHN = consultItem.PatientHN;
			let patientHRbox = $('<div></div>');
			await consultItem.PatientHRLink.forEach((item, i) => {
				let hrthumb = $('<img width="40px" height="auto" style="position: relative; display: inline-block; cursor: pointer;"/>');
				if (item.link){
					$(hrthumb).attr('src', item.link);
					$(hrthumb).on('click', (evt)=>{
						window.open(item.link, '_blank');
					});
				} else {
					$(hrthumb).attr('src', '/images/fail-icon.png');
				}
				$(hrthumb).appendTo($(patientHRbox));
			});

			let consultHosName = consultItem.hospital.Hos_Name;

			let consultCMD = doCreateSearchConsultItemCmd(consultItem);
			//let consultCMD = $('<span>CMD</span>');

			let consultRow = $('<div style="display: table-row; width: 100%;" class="case-row"></div>');

			let consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append('<span>' + consultdate + ' : ' + consulttime + '</span>');
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($('<span>' + patientHN + '</span>'));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($('<span>' + patientName + '</span>'));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($(patientHRbox));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($('<span>' + consultHosName + '</span>'));
			$(consultColumn).appendTo($(consultRow));

			consultColumn = $('<div style="display: table-cell; padding: 4px;"></div>');
			$(consultColumn).append($(consultCMD));
			$(consultColumn).appendTo($(consultRow));

			resolve($(consultRow));
		});
	}

	const doCreateSearchConsultItemCmd = function(consultItem){
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let consultCmdBox = $('<div style="text-align: center; padding: 4px; width: 100%;"></div>');
		let openCmd = $('<div>Open</div>');
		$(openCmd).css({'display': 'inline-block', 'margin': '3px', 'padding': '1px 5px', 'border-radius': '12px', 'cursor': 'pointer', 'background-color' : 'orange', 'color': 'white'});
		$(consultCmdBox).append($(openCmd));
		$(openCmd).on('click', async (evt)=>{
			let consultId = consultItem.id;
			let cloudMessageJson = await apiconnector.doGetApi('/api/chatlog/select/consult/' + consultId, {});
			localStorage.setItem('localmessage', JSON.stringify(cloudMessageJson.Log));
			let fakPaient = {
				Patient_HN: consultItem.patientHN,
				Patient_NameEN: consultItem.patientName,
				Patient_LastNameEN: '',
				Patient_Sex: '',
				Patient_Age: ''
			}
			let caseData = {
				casestatusId: consultItem.casestatusId,
				Case_BodyPart: '',
				patient: fakPaient
			}
			let fakeCase = {
				case: caseData
			}

			let openResult = await doOpenChatbox(consultId, fakeCase, consultItem);

			$('#ChatSendBox').hide();
		});

		return $(consultCmdBox)

	}

  return {
    doCreateNewCaseTitlePage,
    doCreateHeaderRow,
    doCreateCaseItemRow,
    doCallMyNewCase,
    doCreateNewCasePage
	}
}
