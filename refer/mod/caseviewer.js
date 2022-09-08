/* caseviewer.js */
module.exports = function ( jq ) {
	const $ = jq;

  const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);
	const createnewcase = require('../../case/mod/createnewcase.js')($);
	const ai = require('../../radio/mod/ai-lib.js')($);
	const wrtcCommon = require('../../case/mod/wrtc-common.js')($);

	const backwardCaseStatus = [1, 2, 5, 6, 10, 11, 12, 13, 14];
	const pageFontStyle = {"font-family": "THSarabunNew", "font-size": "24px"};
	const commandButtonStyle = {'padding': '3px', 'cursor': 'pointer', 'border': '1px solid white', 'color': 'white', 'background-color': '#3296EF'};

	const backwardBoxHeight = '210px';

	const doOpenCaseView = function(dicomData, defualtValue, dicomSeries){
    return new Promise(async function(resolve, reject){
      $('body').loading('start');
      $(".mainfull").empty();
	    let caseView = $('<div style="width: 99%; padding: 5px; border: 1px solid black; background-color: #ccc; margin-top: 4px;"></div>');
      let caseTitle = await doCreateCaseTitle(dicomData);
      $(caseTitle).appendTo($(caseView));
      $(".mainfull").append($(caseView));

			let caseItem, patentFullName, patientHN, patientSA, caseBodypart;
      if (dicomData.caseId) {
				let callUrl = '/api/cases/select/'+ dicomData.caseId;
        let caseRes = await apiconnector.doCallApi(callUrl, {});
				console.log(caseRes);
				if (caseRes.status.code == 200){
	        caseItem = caseRes.Records[0];
	        patentFullName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
	        patientHN = caseItem.case.patient.Patient_HN;
	        patientSA = caseItem.case.patient.Patient_Age + '/' + caseItem.case.patient.Patient_Sex;
	        caseBodypart = caseItem.case.Case_BodyPart;
				} else if (caseRes.status.code == 210){
					let rememberme = localStorage.getItem('rememberme');
					if (rememberme == 1) {
						let newUserData = await apiconnector.doCallNewTokenApi();
						localStorage.setItem('token', newUserData.token);
						localStorage.setItem('userdata', JSON.stringify(newUserData.data));
						apiconnector.doCallApi(callUrl, {}).then((caseRes)=>{
							caseItem = caseRes.Records[0];
			        patentFullName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
			        patientHN = caseItem.case.patient.Patient_HN;
			        patientSA = caseItem.case.patient.Patient_Age + '/' + caseItem.case.patient.Patient_Sex;
			        caseBodypart = caseItem.case.Case_BodyPart;
						});
					} else {
						common.doUserLogout();
					}
				}
      } else {
				caseItem = undefined;
        patentFullName = dicomData.name;
        patientHN = dicomData.hn;
        patientSA = dicomData.sa;
        caseBodypart = defualtValue.bodypart;
      }
			$(caseTitle).find('#PatientHN').text(patientHN);
			$(caseTitle).find('#PatentFullName').text(patentFullName);
			$(caseTitle).find('#PatientSA').text(patientSA);
			//$(caseTitle).find('#CaseBodypart').text(caseBodypart);

			if (dicomData.studyInstanceUID) {
				let openStoneWebViewerCmd = $('<input type="button" value=" เปิดภาพ "/>');
	      let openData = {studyInstanceUID: dicomData.studyInstanceUID};
	      $(openStoneWebViewerCmd).data('openData', openData);
	      $(openStoneWebViewerCmd).on('click', onOpenStoneWebViewerCmdClick);
				$(openStoneWebViewerCmd).css({'float': 'right'});
				$(caseTitle).find('#TitleData').append($(openStoneWebViewerCmd));
			}

			if (caseItem) {
				let caseId = caseItem.case.id;
				let patientId = caseItem.case.patientId;
				let patentFullName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
				let backwardView = await doCallCreatePatientBackward(patientId, patentFullName, caseId);
				$(backwardView).css({'height': backwardBoxHeight, 'overflow-y': 'scroll', 'overflow-x': 'hidden'});
				$(caseView).append($(backwardView));
			}

			let caseResultInfoBox = await doCreateResulteSection(dicomData, caseItem);
			//$(caseResultInfoBox).css({'min-height': '100px'});
			$(caseView).append($(caseResultInfoBox));

			let referCommandBox = await doCreateReferCommand(dicomData, caseItem, defualtValue, dicomSeries);
			$(referCommandBox).css({'margin-top': '10px'});
			$(referCommandBox).appendTo($(caseView));

			let contactRadioToolsBar = $('<div id="ContactTools" style="width: 99%; min-height: 80px; text-align: right; display: none;"></div>');
			$(caseView).append($(contactRadioToolsBar));
			const successCaseStatusIds = [5, 6, 10, 11, 12, 13, 14];
			let hadSuccess = util.contains.call(successCaseStatusIds, dicomData.casestatusId);
			if (hadSuccess) {
				let topicName = patientHN + ' ' + patentFullName + ' ' + patientSA + ' ' + caseBodypart;
				let simpleChatBox = await doCreateSimpleChatBox(dicomData, caseItem, topicName);
				$(simpleChatBox).appendTo($(contactRadioToolsBar));
			}


      let caseFooterBar = $('<div style="width: 100%; text-align: center; margin-top: 10px;"></div>');
      $(".mainfull").append($(caseFooterBar));
      let backCmd = $('<input type="button" value=" Back "/>');
      $(backCmd).on('click', (evt)=>{
        $('#HomeMainCmd').click();
      });
      $(backCmd).appendTo($(caseFooterBar));

      $('body').loading('stop');
      resolve();
    });
  }

	const doCreateSimpleChatBox = function(dicomData, caseItem, topicName){
		return new Promise(async function(resolve, reject){
			let history = await doSeachChatHistory(dicomData.caseId);
			localStorage.setItem('localmessage', JSON.stringify(history));
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let audienceContact = {email: caseItem.Radiologist.email, phone: caseItem.Radiologist.phone, sipphone: caseItem.Radiologist.sipphone, lineuserId: caseItem.Radiologist.LineUserId};
			let simpleChatBoxOption = {
				topicId: dicomData.caseId,
				topicName: topicName,
				topicStatusId: dicomData.casestatusId,
				topicType: 'case',
				myId: userdata.username,
				myName: userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH,
				myDisplayName: 'ฉัน',
				myHospitalName: userdata.hospital.Hos_Name,
				audienceId: caseItem.Radiologist.username,
				audienceName: caseItem.Radiologist.User_NameTH + ' ' + caseItem.Radiologist.User_LastNameTH,
				audienceUserId: caseItem.Radiologist.id,
				audienceContact: audienceContact,
				wantBackup: true,
				externalClassStyle: {},
				sendMessageCallback: doSendMessageCallback,
				resetUnReadMessageCallback: doResetUnReadMessageCallback
			};
			let simpleChatBox = $('<div id="SimpleChatBox"></div>');
			let simpleChatBoxHandle = $(simpleChatBox).chatbox(simpleChatBoxOption);

			simpleChatBoxHandle.restoreLocal();

			let softPhoneCmd = doCreateSoftPhoneCallCmd(caseItem);
			let zoomCmd = doCreateZoomCallCmd(caseItem, simpleChatBoxHandle);

			let radioSateCmd = doCreateRadioSateCmd();

			let externalToolsBox = $('<div style="position: relative; display: inline-block; bottom: -14px;"></div>');
			$(externalToolsBox).append($(radioSateCmd)).append($(softPhoneCmd)).append($(zoomCmd))

			$(simpleChatBox).find('#ChatSendBox').prepend($(externalToolsBox));
			resolve($(simpleChatBox));
		});
	}

	const doCreatePageViewTitle = function(dicomData){
		return new Promise(async function(resolve, reject){

		});
	}

  const doCreateCaseTitle = function(dicomData){
    return new Promise(async function(resolve, reject){
      let caseTitle = $('<div id="CaseTitle"><div><span><b>ผู้ป่วย</b></span></div></div>');
      let summaryLine = $('<div id="TitleData" style="min-height: 40px;"></div>');
      $(summaryLine).appendTo($(caseTitle));
      $(summaryLine).append($('<span>HN:</span>'));
      $(summaryLine).append($('<span id="PatientHN" style="margin-left: 5px; font-weight: bold;"></span>'));
      $(summaryLine).append($('<span style="margin-left: 10px;">Name:</span>'));
      $(summaryLine).append($('<span id="PatentFullName" style="margin-left: 5px; font-weight: bold;"></span>'));
      $(summaryLine).append($('<span style="margin-left: 10px;">Age/sex:</span>'));
      $(summaryLine).append($('<span id="PatientSA" style="margin-left: 5px; font-weight: bold;"></span>'));
      //$(summaryLine).append($('<span style="margin-left: 10px;">Body Part:</span>'));
      //$(summaryLine).append($('<span id="CaseBodypart" style="margin-left: Spx; font-weight: bold;"></span>'));
      $(summaryLine).css(common.pageLineStyle);
      resolve($(caseTitle));
    });
  }

  const doCreateResulteSection = function(dicomData, caseData) {
    return new Promise(async function(resolve, reject){
      let resultBox = $('<div style="margin-top: 10px;"></div>');
      let resultTitle = $('<div style="min-height: 40px;"><span><b>ผลอ่าน</b></span></div>');
      $(resultTitle).appendTo($(resultBox));
			let resultContentBox = await doCreateResultWithCaseStatus(dicomData, caseData);
      let resultView = $('<div style="width: 98%; padding: 4px; border: 2px solid grey; background-color: white; min-height: 100px"></div>')
			$(resultView).append($(resultContentBox));
      $(resultView).appendTo($(resultBox));
			let toggleContentCmd = $('<span style="float: right; cursor: pointer;">ซ่อนผลอ่าน</span>');
			$(toggleContentCmd).on('click', function(evt){
	      let state = $(resultView).css('display');
	      if (state === 'block') {
	        $(resultView).slideUp();
	        $(toggleContentCmd).text('แสดงผลอ่าน');
	      } else {
	        $(resultView).slideDown();
	        $(toggleContentCmd).text('ซ่อนผลอ่าน');
	      }
	    });
	    $(toggleContentCmd).appendTo($(resultTitle));
      resolve($(resultBox));
    });
  }

  const doCreateResultWithCaseStatus = function(dicomData, caseData) {
    return new Promise(async function(resolve, reject){
			let resultView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
      let resultBox = $('<div style="display: table-row; width: 100%;"></div>');
			if (dicomData.caseId) {
	      if ((dicomData.casestatusId == 1) || (dicomData.casestatusId == 2) || (dicomData.casestatusId == 8) || (dicomData.casestatusId == 9)) {
					let sendStatusBox = $('<div style="display: table-cell;">ไม่มีผลอ่าน</div>');
					$(sendStatusBox).appendTo($(resultBox));
					let caseStatusBox = $('<div style="display: table-cell;">สถานะ = <b>' + caseData.case.casestatus.CS_Name_EN + '</b></div>');
					$(caseStatusBox).appendTo($(resultBox));

					let dealTimeBox = $('<div style="display: table-cell;"><span>กำหนดรับผล </span></div>');
					let dealTimeValue = $('<span></span>');$('body').loading('start');
					$(dealTimeValue).loading('start');
					$(dealTimeValue).load('/api/tasks/select/' + dicomData.caseId, function(caseTask){
						if ((caseTask.Records) && (caseTask.Records.length > 0) && (caseTask.Records[0].triggerAt)){
							//let caseTriggerAt = new Date(caseTask.Records[0].triggerAt);
							let caseDate = util.formatDateTimeStr(caseTask.Records[0].triggerAt);
							let casedatetime = caseDate.split('T');
							let casedateSegment = casedatetime[0].split('-');
							casedateSegment = casedateSegment.join('');
							let casedate = util.formatStudyDate(casedateSegment);
							let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
							$(dealTimeValue).append($('<b>' + casedate + ' ' + casetime + '</b>'));
						} else {
							let expiredStatus = 4;
							let expiredDescription = 'Not found Task on Case Task Cron Job.';
							common.doUpdateCaseStatus(dicomData.caseId, expiredStatus, expiredDescription);
							$(dealTimeValue).text('ไม่พบการตั้งค่าเวลา');
						}

						$(dealTimeValue).loading('stop');
					});
					$(dealTimeValue).appendTo($(dealTimeBox));
					$(dealTimeBox).appendTo($(resultBox));
					let caseOwnerBox = $('<div style="display: table-cell;">ผู้ส่ง '+ caseData.Owner.User_NameTH + ' ' + caseData.Owner.User_LastNameTH + '</div>');
					$(caseOwnerBox).appendTo($(resultBox));

	      } else if ((dicomData.casestatusId == 3) || (dicomData.casestatusId == 4) || (dicomData.casestatusId == 7)) {
					let sendStatusBox = $('<div style="display: table-cell;">ไม่มีผลอ่าน</div>');
					$(sendStatusBox).appendTo($(resultBox));
					let caseStatusBox = $('<div style="display: table-cell;">สถานะ = <b>' + caseData.case.casestatus.CS_Name_EN + '</b></div>');
					$(caseStatusBox).appendTo($(resultBox));
					let caseDate = util.formatDateTimeStr(caseData.case.updatedAt);
					let casedatetime = caseDate.split('T');
					let casedateSegment = casedatetime[0].split('-');
					casedateSegment = casedateSegment.join('');
					let casedate = util.formatStudyDate(casedateSegment);
					let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
					let dealTimeBox = $('<div style="display: table-cell;">เมื่อ '+ casedate + ' ' + casetime + '</div>');
					$(dealTimeBox).appendTo($(resultBox));
					let caseOwnerBox = $('<div style="display: table-cell;">ผู้ส่ง '+ caseData.Owner.User_NameTH + ' ' + caseData.Owner.User_LastNameTH + '</div>');
					$(caseOwnerBox).appendTo($(resultBox));
	      } else if ((dicomData.casestatusId == 5) || (dicomData.casestatusId == 6) || (dicomData.casestatusId == 10) || (dicomData.casestatusId == 11) || (dicomData.casestatusId == 12) || (dicomData.casestatusId == 13) || (dicomData.casestatusId == 14)) {
	        let pdfReportBox = await doCreateCaseResult(dicomData.caseId);
	        $(pdfReportBox).appendTo($(resultBox));
	      } else {
	        common.doOpenStoneWebViewer(dicomData.studyInstanceUID);
	      }
			} else {
				let sendStatusBox = $('<span style="display: table-cell;">ไม่มีผลอ่าน</span>');
				$(sendStatusBox).appendTo($(resultBox));
				let caseStatusBox = $('<span style="display: table-cell;">สถานะ = ไม่ได้ส่งอ่าน</span>');
				$(caseStatusBox).appendTo($(resultBox));
				let dealTimeBox = $('<span style="display: table-cell;"></span>');
				$(dealTimeBox).appendTo($(resultBox));
			}
			$(resultView).append($(resultBox));
      resolve($(resultView));
    });
  }

  const doCreateCaseResult = function(caseId){
    return new Promise(async function(resolve, reject){
      let resultRes = await apiconnector.doCallApi('/api/cases/result/'+ caseId, {});
			let resultReport = undefined;
			if (resultRes.Records.length > 0) {
      	resultReport = resultRes.Records[0];
			} else {
				resultRes = await common.doGetApi('/api/cases//do/resubmit/'+ caseId, {});
				console.log(resultRes);
			}
			let pdfStream = undefined;
			let embetObject = undefined;
			let reportLink = resultReport.PDF_Filename;
			/*
			if (window.location.hostname == 'localhost') {
				reportLink = 'https://radconnext.info' + resultReport.PDF_Filename;
			}
			*/
			try {
				pdfStream = await util.doCreateDownloadPDF(reportLink);
				console.log(pdfStream);
	      embetObject = $('<object data="' + reportLink + '" type="application/pdf" width="100%" height="480"></object>');
			} catch (err) {
				console.log(err);
				embetObject = $('<object data="" type="application/pdf" width="100%" height="480"></object>');
			} finally {
				let resultBox = $('<div id="ResultBox" style="width: 97%; padding: 10px; border: 1px solid black; background-color: #ccc; margin-top: 4px;"></div>');

	      $(embetObject).appendTo($(resultBox));
	      resolve($(resultBox));
			}
    });
  }

	const doCreateReferCommand = function(dicomData, caseData, defualtValue, dicomSeries){
		return new Promise(async function(resolve, reject){
			let commandView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let commandBox = $('<div style="display: table-row; width: 100%;"></div>');
			$(commandBox).appendTo($(commandView));
			let aiCmdBox = $('<div style="display: table-cell; text-align: center; width: 30%;"></div>');
			$(aiCmdBox).appendTo($(commandBox));
			//let aiCmd = $('<input type="button" value=" AI "/>');
			let aiCmd = $('<span></span>');
			$(aiCmd).appendTo($(aiCmdBox));
			$(aiCmd).on('click', async(evt)=>{
				let aiResultLogRes = await common.doCallAIResultLog(dicomData.dicomID);
				if (aiResultLogRes.Log) {
					let sentTimeCounter = aiResultLogRes.Log.length;
					if (sentTimeCounter > 0) {
						const announceMsg = $('<div></div>');
				    $(announceMsg).append($('<p>ระบบฯ พบว่า Dicom ขุดนี้เคยส่งไปให้ AI อ่านผลแล้ว จำนวน ' + sentTimeCounter + ' ครั้ง</p>'));
						$(announceMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> เพื่อดำเนินการต่อ</p>'));
						$(announceMsg).append($('<p>หรือไม่ส่ง คลิกปุ่ม <b>ยกเลิก</b></p>'));
						const radalertoption = {
				      title: 'แจ้งให้ทราบ',
				      msg: $(announceMsg),
				      width: '560px',
				      onOk: function(evt) {
			          radAlertBox.closeAlert();
								doExecAICmdClick(dicomData, caseData);
				      },
							onCancel: function(evt){
								radAlertBox.closeAlert();
							}
				    }
						let radAlertBox = $('body').radalert(radalertoption);

					} else {
						doExecAICmdClick(dicomData, caseData);
					}
				}
			});
			let createNewCaseCmdBox = $('<div style="display: table-cell; text-align: center; width: 50%;"></div>');
			$(createNewCaseCmdBox).appendTo($(commandBox));
			//let createNewCaseCmd = $('<input type="button" value=" ส่งรังสีแพทย์อ่านผล "/>');
			let createNewCaseCmd = $('<span></span>');
			$(createNewCaseCmd).appendTo($(createNewCaseCmdBox));
			$(createNewCaseCmd).on('click', (evt)=>{
				doCreateNewCaseCmdClick(dicomData, caseData, defualtValue, dicomSeries);
			});
			let contactRadioCmdBox = $('<div style="display: table-cell; text-align: center; width: 30%;"></div>');
			$(contactRadioCmdBox).appendTo($(commandBox));
			if ((dicomData.casestatusId == 5) || (dicomData.casestatusId == 6) || (dicomData.casestatusId == 10) || (dicomData.casestatusId == 11) || (dicomData.casestatusId == 12) || (dicomData.casestatusId == 13) || (dicomData.casestatusId == 14)) {
				let contactRadioCmd = $('<input type="button" value=" ติดต่อรังสีแพทย์ "/>');
				$(contactRadioCmd).appendTo($(contactRadioCmdBox));
				$(contactRadioCmd).on('click', (evt)=>{
					doContactRadioCmdClick(dicomData, caseData);
				});
			}
			resolve(($(commandView)));
		});
	}

	const doExecAICmdClick = function(dicomData, caseData){
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			let seriesList = await ai.doCallCheckSeries(dicomData.dicomID);
			if (seriesList) {
				let seriesSelect = await ai.doCreateSeriesSelect(seriesList);
				$(seriesSelect).css(ai.quickReplyContentStyle);
				$(seriesSelect).css({'height': 'auto'});
				$('#quickreply').css(ai.quickReplyDialogStyle);
				$('#quickreply').append($(seriesSelect));

				let howmanySeries = $(seriesSelect).find('.series-item');
				if (howmanySeries.length == 1) {
					let singleSeries = $(howmanySeries)[0];
					$(singleSeries).click();
				}
			} else {
				const sorryMsg = $('<div></div>');
		    $(sorryMsg).append($('<p>ระบบค้นหาภาพจากระบบไม่เจอโปรดแจ้งผูดูแลระบบฯ ของคุณ</p>'));
				const radalertoption = {
		      title: 'ขออภัยที่เกิดข้อผิดพลาด',
		      msg: $(sorryMsg),
		      width: '560px',
		      onOk: function(evt) {
	          radAlertBox.closeAlert();
		      }
		    }
				let radAlertBox = $('body').radalert(radalertoption);
		    $(radAlertBox.cancelCmd).hide();
			}
			$('body').loading('stop');
			resolve();
		});
	}

	const doCreateNewCaseCmdClick = function(dicomData, caseData, defualtValue, dicomSeries){
		return new Promise(async function(resolve, reject){
			let patientName = defualtValue.patient.name;
			let allSeries = dicomSeries.length;
			if (dicomData.caseId) {
				const newCaseStatusIds = [1, 2, 8, 9];
				const failCaseStatusIds = [3, 4, 7]
				const successCaseStatusIds = [5, 6, 10, 11, 12, 13, 14];
				let isNewCase = util.contains.call(newCaseStatusIds, dicomData.casestatusId);
				let hadFail = util.contains.call(failCaseStatusIds, dicomData.casestatusId);
				let hadSuccess = util.contains.call(successCaseStatusIds, dicomData.casestatusId);
				const doShowRadConfirm = function(okCallback, cancelCallback){
					let radConfirmBox = $('<div></div>');
					$(radConfirmBox).append($('<p>รายการภาพชุดนี้ได้ถูกส่งไปหารังสีแพทย์แล้ว และอยู่ระหว่างรอผลอ่าน</p>'));
					$(radConfirmBox).append($('<p>โปรดยืนโดยการคลิกปุ่ม<b>ตกลง</b> เพื่อยืนยันว่าคุณต้องการสร้างเคสใหม่จากภาพชุดนี้อีกหนึ่งเคส</p>'));
					$(radConfirmBox).append($('<p>หรือคลิกปุ่ม<b>ยกเลิก</b> เพื่อยกเลิกการสร้างเคสใหม</p>'));
					const radConfirmOption = {
			      title: 'ยืนยันการสร้างเคสใหม่',
			      msg: $(radConfirmBox),
			      width: '500px',
			      onOk: function(evt) {
							radConfirm.closeAlert();
							if (okCallback){
								okCallback();
							}
			      },
			      onCancel: function(evt) {
			        radConfirm.closeAlert();
							if (cancelCallback){
								cancelCallback();
							}
			      }
			    }
			    let radConfirm = $('body').radalert(radConfirmOption);
				}

	      if (isNewCase) {
					doShowRadConfirm(async()=>{
						let allImageInstances = await createnewcase.doCallCountInstanceImage(dicomSeries, patientName);
						createnewcase.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
						resolve();
					}, ()=>{
						resolve();
					});
				} else if (hadFail) {
					let allImageInstances = await createnewcase.doCallCountInstanceImage(dicomSeries, patientName);
					createnewcase.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
					resolve();
	      } else if (hadSuccess) {
					doShowRadConfirm(async()=>{
						let allImageInstances = await createnewcase.doCallCountInstanceImage(dicomSeries, patientName);
						createnewcase.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
						resolve();
					}, ()=>{
						resolve();
					});
				}
			} else {
				let allImageInstances = await createnewcase.doCallCountInstanceImage(dicomSeries, patientName);
				createnewcase.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
				resolve();
			}
		});
	}

	const doContactRadioCmdClick = function(dicomData, caseData){
		let contactToolsBox = $('#ContactTools');
		let patentFullName = caseData.case.patient.Patient_NameEN + ' ' + caseData.case.patient.Patient_LastNameEN;
		let patientHN = caseData.case.patient.Patient_HN;
		let patientSA = caseData.case.patient.Patient_Age + '/' + caseData.case.patient.Patient_Sex;
		let caseBodypart = caseData.case.Case_BodyPart;
		let topicName = patientHN + ' ' + patentFullName + ' ' + patientSA + ' ' + caseBodypart;
		doCreateSimpleChatBox(dicomData, caseData, topicName).then((simpleChatBox)=>{
			$(contactToolsBox).empty().append($(simpleChatBox));
			let isExpand = $(contactToolsBox).css('display');
			if (isExpand == 'none'){
				$(contactToolsBox).slideToggle();
			}
		});
	}

	const doSendMessageCallback = function(msg, sendto, from, context){
		return new Promise(async function(resolve, reject){
			const main = require('../main.js');
			const wsm = main.doGetWsm();
			const userdata = main.doGetUserData();
			let msgSend = {type: 'message', msg: msg, sendto: sendto, from: from, context: context, sendtotype: 4, fromtype: 5};
			wsm.send(JSON.stringify(msgSend));
			let newStatus = 14;
			if (context.topicStatusId != newStatus) {
				let newDescription = 'Case have Issue Message to Radio.';
				let updateStatusRes = await common.doUpdateCaseStatus(context.topicId, newStatus, newDescription);
				//console.log(updateStatusRes);
				if (updateStatusRes.status.code == 200){
					let selector = '#'+sendto + ' .chatbox';
					let targetChatBox = $(selector);
					let eventData = {topicStatusId: newStatus};
					$(targetChatBox).trigger('updatetopicstatus', [eventData]);
				} else {
					$.notify('Now. can not update case status.', 'warn');
				}
			}
			resolve();
		});
	}

	const doResetUnReadMessageCallback = function(audienceId, value){
		let selector = '#'+audienceId + ' .reddot';
		let lastValue = $(selector).text();
		let newValue = Number(lastValue) + value;
		if (newValue > 0) {
			$(selector).text(newValue);
			$(selector).show()
		} else {
			$(selector).hide()
		}
	}

	const doCreateSoftPhoneCallCmd = function(caseItem){
		const softPhoneIconUrl = '/images/phone-call-icon-2.png';
		let softPhoneBox = $('<div style="position: relative; display: inline-block; text-align: center; margin-right: 20px; bottom: 10px;"></div>');
    let softPhoneIcon = $('<img style="postion: absolute; width: 30px; height: auto; cursor: pointer;"/>');
    $(softPhoneIcon).attr('src', softPhoneIconUrl);
		$(softPhoneBox).data('softPhoneData', {caseData: caseItem});
		$(softPhoneBox).on('click', softPhoneCmdClick);
		$(softPhoneIcon).appendTo($(softPhoneBox));
		return $(softPhoneBox);
	}

	const softPhoneCmdClick = function(evt){
		$('body').loading('start');
		let softPhoneCmd = $(evt.currentTarget);
		let softPhoneData = $(softPhoneCmd).data('softPhoneData');
		//console.log(softPhoneData);
		const phoneNoTHRegEx = /^[0]?[689]\d{8}$/;
		let callNumber = softPhoneData.caseData.Radiologist.phone;
		if (callNumber){
			let isCorrectFormat = phoneNoTHRegEx.test(callNumber);
			if (isCorrectFormat){
				const main = require('../main.js');
				const mySipUA = main.doGetSipUA();
				let callSession = mySipUA.call(callNumber, main.softphone.callOptions);
				//console.log(callSession);
				callSession.connection.addEventListener('addstream', function (e) {
					var remoteAudio = document.getElementById('RemoteAudio');
					remoteAudio.srcObject = e.stream;
					setTimeout(() => {
			      remoteAudio.play();
						$('#SipPhoneIncomeBox').css({'top': '10px'});
			      $('#SipPhoneIncomeBox').find('#IncomeBox').css({'display': 'none'});
			      $('#SipPhoneIncomeBox').find('#AnswerBox').css({'display': 'block'});
			    }, 500);
				});
			} else {
				console.log('Your Phone Number is wrong format.');
			}
		} else {
			console.log('Your Phone Number is Null.');
		}
		$('body').loading('stop');
	}

	const doCreateZoomCallCmd = function(caseItem, chatHandle){
		const zoomIconUrl = '/images/zoom-white-icon.png';
		let zoomBox = $('<div style="position: relative; display: inline-block; text-align: center; margin-right: 20px; bottom: 10px;"></div>');
    let zoomIcon = $('<img style="postion: absolute; width: 30px; height: auto; cursor: pointer;"/>');
    $(zoomIcon).attr('src', zoomIconUrl);
		$(zoomBox).data('zoomData', {caseData: caseItem});
		$(zoomBox).on('click', (evt)=>{
			//zoomCmdClick(evt, chatHandle);
			callWebRCT(evt);
		});
		$(zoomIcon).appendTo($(zoomBox));
		return $(zoomBox);
	}

	const callWebRCT = async function(evt) {
		$('body').loading('start');
		const main = require('../main.js');
		const wsm = main.doGetWsm();
		//wrtcCommon.doSetupWsm(wsm);

		let zoomCmd = $(evt.currentTarget);
		let zoomData = $(zoomCmd).data('zoomData');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let hospitalName = userdata.hospital.Hos_Name;
		let caseBodypart = zoomData.caseData.case.Case_BodyPart;
		let radioId = zoomData.caseData.case.Case_RadiologistId;

		let callSocketUrl = '/api/cases/radio/socket/' + radioId;
		let radioSockets = await common.doCallApi(callSocketUrl, {});
		let radioUsername = zoomData.caseData.Radiologist.username;
		wrtcCommon.doCheckBrowser().then((stream)=>{
			if (stream) {
				$('head').append('<script src="../lib/RecordRTC.min.js"></script>');
				wrtcCommon.doSetupUserMediaStream(stream);
				let userJoinOption = {joinType: 'caller', joinMode: 'share', joinName: userdata.username, audienceName: radioUsername, userMediaStream: stream};
				wrtcCommon.doSetupUserJoinOption(userJoinOption);
				let patientFullNameEN = zoomData.caseData.case.patient.Patient_NameEN + ' ' + zoomData.caseData.case.patient.Patient_LastNameEN;
				let patientHN = zoomData.caseData.case.patient.Patient_HN;
				let joinTopic = 'โรงพยาบาล' + hospitalName + '  ' + patientFullNameEN + '  HN: ' + patientHN;
				let dlgContent = doCreateWebRCTDlgContent();
				let radwebrctoption = {
					title: 'Video Conference [' + joinTopic + ']',
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
				let webrtcBox = $('body').radalert(radwebrctoption);
				$(webrtcBox.cancelCmd).hide();

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
						//wrtcCommon.doCreateInterChange(wsm);
						wrtcCommon.doSetupDisplayMediaStream(myDisplayMediaStream);
					  let streams = [wrtcCommon.doGetDisplayMediaStream(), wrtcCommon.doGetUserMediaStream()];
						let localMergedStream = wrtcCommon.doMixStream(streams);
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
						    wrtcCommon.doSetupRemoteConn(myRemoteConn);
								$(startCmd).click();
								let myInfo = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
								let callZoomMsg = {type: 'callzoom', sendTo: radioUsername, topic: joinTopic, sender: userdata.username, senderInfo: myInfo, bodyPart: caseBodypart, radioId: radioId};
								wsm.send(JSON.stringify(callZoomMsg));
								$.notify('ระบบฯได้ส่งคำขอแจ้งเปิด Viedo Conference ไปยังรังสีแพทย์สำเร็จ โปรดรอให้รังสีแพทย์เตรียมความพร้อม', 'succes');
							}
						}, 3500);
						$(shareCmd).show();
						$(startCmd).hide();
						$(endCmd).show();
					});
				});
				let startCmd = wrtcCommon.doCreateStartCallCmd();
				$(startCmd).on('click', (evt)=>{
					userJoinOption.joinType = 'caller'
					wrtcCommon.doSetupUserJoinOption(userJoinOption);
					wrtcCommon.doCreateOffer(wsm);
					$(shareCmd).show();
					$(startCmd).hide();
					$(endCmd).show();
				})
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

						let newStream = new MediaStream();
						wrtcCommon.doGetRemoteTracks().forEach((track) => {
							console.log(track);
							newStream.addTrack(track)
				    });
						console.log(newStream);
						myVideo.srcObject = wrtcCommon.doMixStream([newStream, myUserMediaStream]);

						$(shareCmd).show();
						$(startCmd).hide();
						$(endCmd).show();

						wrtcCommon.doCreateInterChange(wsm);
						//$(startCmd).click();
					}

				});

				$(dlgContent).find('#CommandBox').append($(shareCmd).show());
				$(dlgContent).find('#CommandBox').append($(startCmd).hide());
				$(dlgContent).find('#CommandBox').append($(endCmd).hide());

				$('body').loading('stop');
			} else {
				$.notify('ขออภัย เว็บบราวเซอร์ของคุณไม่รองรับการใช้งานฟังก์ชั่นนี้', 'error');
				$('body').loading('stop');
			}
		});
	}

	const doCreateWebRCTDlgContent = function(){
		let wrapper = $('<div  id="WebRCTBox" style="width: 100%"></div>');
		let myVideoElem = $('<video id="MyVideo" width="620" height="350" autoplay/>')/*.css({'border': '1px solid blue'})*/;
		let videoCmdBox = $('<div id="CommandBox" style="width: 100%; text-align: center;"></div>');
		return $(wrapper).append($(myVideoElem)).append($(videoCmdBox));
	}

	const zoomCmdClick = async function(evt, chatHandle){
		$('body').loading('start');
		let zoomCmd = $(evt.currentTarget);
		let zoomData = $(zoomCmd).data('zoomData');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let startMeetingTime = util.formatStartTimeStr();
		let hospName = userdata.hospital.Hos_Name;
		let caseBodypart = zoomData.caseData.case.Case_BodyPart;
		let zoomMeeting = await apiconnector.doGetZoomMeeting(zoomData.caseData, startMeetingTime, hospName);
		//find radio socketId
		let radioId = zoomData.caseData.case.Case_RadiologistId;
		let callSocketUrl = '/api/cases/radio/socket/' + radioId;
		let rqParams = {};
		let radioSockets = await common.doCallApi(callSocketUrl, rqParams);
		if (radioSockets.length > 0) {
			//radio online
			$.notify('ระบบฯ เปิดห้องสนทนาได้สำเร็จ กำลังส่งข้อมูลเข้าร่วมสนทนาไปให้รังสีแพทย์', "info");
			let callZoomMsg = {type: 'callzoom', sendTo: radioSockets[0].id, openurl: zoomMeeting.join_url, password: zoomMeeting.password, topic: zoomMeeting.topic, sender: userdata.username};
			const main = require('../main.js');
			const myWsm = main.doGetWsm();
			myWsm.send(JSON.stringify(callZoomMsg));

			let line2 = caseBodypart + '   ' + util.formatFullDateStr(startMeetingTime) + ' ' + util.formatTimeHHMNStr(startMeetingTime);
			let line4 = 'pass: ' + zoomMeeting.password;
			let blockMsgs = [{msg: zoomMeeting.topic, type: 'text'}, {msg: line2, type: 'text'}, {msg: zoomMeeting.join_url, type: 'link'}, {msg: line4, type: 'text'}];
			let myInfo = userdata.userinfo.User_NameTH + ' ' + userdata.userinfo.User_LastNameTH;
			let audienceInfo = zoomData.caseData.Radiologist.User_NameTH + ' ' + zoomData.caseData.Radiologist.User_LastNameTH;
			let contextData = {topicId: zoomData.caseData.case.id, topicName: zoomMeeting.topic, myId: userdata.username, myName: myInfo, audienceId: zoomData.caseData.Radiologist.username, audienceName: audienceInfo, type: 'html'};
			await doSendMessageCallback(blockMsgs, zoomData.caseData.Radiologist.username, userdata.username, contextData);

			let eventData = {msg: blockMsgs, from: userdata.username, context: contextData};
      $('#SimpleChatBox').trigger('messagedrive', [eventData]);

			/*
			let messageBox = $('#SimpleChatBox').find('#MessageBoard');
			$(messageBox).append($(chatMsg));
			*/
			window.open(zoomMeeting.start_url, '_blank');
			$('body').loading('stop');
		} else {
			//radio offline
			$('body').loading('stop');
			let radAlertMsg = $('<div></div>');
			$(radAlertMsg).append($('<p>ระบบฯ ไม่สามารถติดต่อรังสีแพทย์ได้ในขณะนี้</p>'));
			$(radAlertMsg).append($('<p>อย่างไรก็ตามคุณสามารถส่งข้อมูลห้องสนนาที่สร้างขึ้นใหม่</p>'));
			$(radAlertMsg).append($('<p>่ไปให้รังสีแพทย์ทางช่องทางอื่นได้เช่น ไลน์ อีเมล์ เป็นต้น</p>'));
			$(radAlertMsg).append($('<p>ลิงค์สำหรับเข้าร่วมสนทนา <b>' + zoomMeeting.join_url + '</b></p>'));
			$(radAlertMsg).append($('<p>Password เข้าร่วมสนทนา <b>' + zoomMeeting.password + '</b></p>'));
			$(radAlertMsg).append($('<p>ชื่อหัวข้อสนทนา <b>' + zoomMeeting.topic + '</b></p>'));
			const radconfirmoption = {
				title: 'ไม่สามารถติดต่อรังสีแพทย์ได้',
				msg: $(radAlertMsg),
				width: '420px',
				onOk: function(evt) {
					radConfirmBox.closeAlert();
				}
			}
			let radConfirmBox = $('body').radalert(radconfirmoption);
			$(radConfirmBox.cancelCmd).hide();
		}
	}

	const onOpenStoneWebViewerCmdClick = function(evt) {
    const openCmd = $(evt.currentTarget);
    const openData = $(openCmd).data('openData');
    common.doOpenStoneWebViewer(openData.studyInstanceUID);
  }

	const doCallCreatePatientBackward = function(patientId, patientFullName, currentCaseId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			//let limit = 2;
			//let patientBackward = await doLoadPatientBackward(hospitalId, patientId, backwardCaseStatus, currentCaseId, limit);
			let patientBackward = await doLoadPatientBackward(hospitalId, patientId, backwardCaseStatus, currentCaseId);
			let patientBackwardView = undefined;
			if (patientBackward.Records.length > 0) {
				patientBackwardView = await doCreatePatientBackward(patientBackward.Records, patientFullName, patientId, currentCaseId);
			} else {
				patientBackwardView = $('<div id="BackWardBox" style="width: 100%;"><div><span><b>ประวัติการตรวจ</b></span></div><span>ไม่พบประวัติการตรวจ</span></div>');
			}
			resolve($(patientBackwardView));
		});
	}

	const doLoadPatientBackward = function(hospitalId, patientId, statusIds, currentCaseId, limit) {
		return new Promise(function(resolve, reject) {
			var apiUri = '/api/cases/filter/patient';
			var params = {statusId: statusIds, patientId: patientId, hospitalId: hospitalId, currentCaseId: currentCaseId};
			if ((limit) && (limit > 0)) {
				params.limit = limit;
			}
			$.post(apiUri, params, function(response){
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doCreatePatientBackward = function(backwards, patientFullName, patientId, currentCaseId) {
		return new Promise(async function(resolve, reject) {
			let backwardBox = $('<div id="BackWardBox" style="width: 100%;"></div>');
			let titleBox = $('<div style="width: 100%;"></div>');
			$(titleBox).appendTo($(backwardBox));
			let titleText = $('<span><b>ประวัติการตรวจ</b></span>');
			$(titleText).appendTo($(titleBox));

			let backwardView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			$(backwardView).appendTo($(backwardBox));

			//let limitToggle = doCreateToggleSwitch(patientFullName, patientId, backwardView, currentCaseId);
			let limitToggle = doCreateMinMaxCmd();
			$(limitToggle).appendTo($(titleBox));
			$(limitToggle).css({'display': 'inline-block', 'float': 'right'});

			let backwardContentView = await doCreateBackwardItem(patientFullName, backwards, backwardView);
			$(backwardBox).append($(backwardContentView));
			resolve($(backwardBox));
		});
	}

	const doCreateToggleSwitch = function(patientFullName, patientId, backwardView, currentCaseId) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let hospitalId = userdata.hospitalId;
		let switchBox = $('<div></div>');
		let toggleSwitch = $('<label class="switch"></label>');
		let input = $('<input type="checkbox">');
		let slider = $('<span class="slider"></span>');
		$(toggleSwitch).append($(input));
		$(toggleSwitch).append($(slider));
		$(input).on('click', async (evt)=>{
			$(backwardView).loading('start');
			let patientBackwards = undefined;
			let isOn = $(input).prop('checked');
			if (isOn) {
				patientBackwards = await doLoadPatientBackward(hospitalId, patientId, backwardCaseStatus, currentCaseId);
			} else {
				let limit = 2;
				patientBackwards = await doLoadPatientBackward(hospitalId, patientId, backwardCaseStatus, currentCaseId, limit);
			}
			let backwardContent = await doCreateBackwardItem(patientFullName, patientBackwards.Records, backwardView);
			$(backwardView).loading('stop');
		});
		$(switchBox).append($(toggleSwitch));
		return $(switchBox);
	}

	const doCreateMinMaxCmd = function(){
		let toggleMinMaxCmd = $('<span style="float: right; cursor: pointer; margin-right: 15px;">ขยาย</span>');
		$(toggleMinMaxCmd).on('click', function(evt){
			let backWardBox = $(".mainfull").find('#BackWardBox');
			let state = $(backWardBox).css('height');
			if (state === backwardBoxHeight) {
				$(backWardBox).css({'height': '100%'});
				$(toggleMinMaxCmd).text('ย่อ');
			} else {
				$(backWardBox).css({'height': backwardBoxHeight});
				$(toggleMinMaxCmd).text('ขยาย');
			}
		});
		return $(toggleMinMaxCmd);
	}

	const doCreateBackwardItem = function(patientFullName, backwards, backwardView) {
		return new Promise(async function(resolve, reject) {
			let callUserOnlineStateUrl = '/api/radiologist/state/current';
			let clientRes = await common.doCallApi(callUserOnlineStateUrl, {});
			let radioSockets = clientRes.Records;

			$(backwardView).empty();
			let backwardHeader = $('<div style="display: table-row; width: 100%;"></div>');
			$(backwardHeader).appendTo($(backwardView));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">#</span>'));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">วันที่</span>'));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">รายการ</span>'));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">ภาพ</span>'));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">ผลอ่าน</span>'));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">รังสีแพทย์</span>'));
			$(backwardHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">หมายเหตุ/อื่นๆ</span>'));
			const promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < backwards.length; i++) {
					let backwardRow = $('<div style="display: table-row; width: 100%;"></div>');
					let backward = backwards[i];
					let caseCreateAt = util.formatDateTimeStr(backward.createdAt);
					let casedatetime = caseCreateAt.split('T');
					let casedateSegment = casedatetime[0].split('-');
					casedateSegment = casedateSegment.join('');
					let casedate = casedateSegment;
					casedateSegment = casedatetime[1].split(':');
					casedateSegment = casedateSegment.join('');
					let casetime = casedateSegment;
					let caseDateFmt = util.formatStudyDate(casedate);
					let dicomCmdBox = doCreateDicomCmdBox(backwardRow, backward.Case_OrthancStudyID, backward.Case_StudyInstanceUID, patientFullName, casedate, casetime);
					//let patientHRBackwardBox = await doCreateHRBackwardBox(patientFullName, backward.Case_PatientHRLink, casedate);
					let responseBackwardBox = undefined;
					const caseSuccessStatusIds = [5, 6, 10, 11, 12, 13, 14];
					let hadSuccess = util.contains.call(caseSuccessStatusIds, backward.casestatusId);
					if (hadSuccess) {
						if ((backward.caseresponses) && (backward.caseresponses.length > 0)) {
								responseBackwardBox = doCreateResponseBackwardBox(backwardRow, backward.id, backward.caseresponses[0].id, patientFullName, casedate, casetime);
						} else {
							responseBackwardBox = $('<div style="text-align: center">ไมพบผลอ่าน</div>');
						}
					} else {
						responseBackwardBox = $('<div style="text-align: center">เคสยังไม่มีผลอ่าน</div>');
					}

					$(backwardRow).append($('<span style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;">' + (i+1) + '</span>'));
					$(backwardRow).append($('<span style="display: table-cell; text-align: left; padding: 4px; vertical-align: middle;">' + caseDateFmt + '</span>'));
					$(backwardRow).append($('<span style="display: table-cell; text-align: left; vertical-align: middle;">' + backward.Case_BodyPart + '</span>'));
					let dicomCmdCell = $('<span style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;"></span>');
					$(dicomCmdCell).append($(dicomCmdBox));
					$(backwardRow).append($(dicomCmdCell));

					let responseBackwardCell = $('<span style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;"></span>');
					$(responseBackwardCell).append($(responseBackwardBox));
					$(backwardRow).append($(responseBackwardCell));

					let radioBackwardCell = $('<span style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;"></span>');
					let radioBackwardBox = await doCreateRadioStatusCell(backwardRow, backward, radioSockets, backward.casestatusId, backward.Case_OrthancStudyID);
					$(radioBackwardCell).append($(radioBackwardBox));

					let radioId = backward.Case_RadiologistId;
					//console.log(radioSockets);
					let caseRadio = await radioSockets.find((item)=>{
						if (item.user.id == radioId){
							return item;
						}
					});
					//console.log(caseRadio);
					let radioStateBox = undefined
					if (caseRadio.currentState.screenState.online == 1) {
						radioStateBox = doCreateRadioStateBox('green');
					} else {
						radioStateBox = doCreateRadioStateBox('red');
					}

					$(radioBackwardCell).append($(radioStateBox));

					$(backwardRow).append($(radioBackwardCell));

					$(backwardRow).append($('<span style="display: table-cell; text-align: center; padding: 4px; vertical-align: middle;">-</span>'));

					$(backwardRow).on('dblclick', (evt)=>{
						common.doOpenStoneWebViewer(backward.Case_StudyInstanceUID);
						$('.row-selected').removeClass('row-selected');
						$(backwardRow).addClass('row-selected');
					});
					if (i == 0){
						$(backwardRow).addClass('row-selected');
					}
					$(backwardRow).appendTo($(backwardView));
				}
				setTimeout(()=> {
					resolve2($(backwardView));
				}, 500);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreateDicomCmdBox = function(backwardRow, orthancStudyID, studyInstanceUID, patientFullName, casedate, casetime){
		let dicomCmdBox = $('<div></div>');
		let openViewerCmd = $('<span>ดาวน์โหลด</span>');
		$(openViewerCmd).appendTo($(dicomCmdBox));
		$(openViewerCmd).css(commandButtonStyle);
		$(openViewerCmd).on('click', async (evt)=>{
			$('.row-selected').removeClass('row-selected');
			$(backwardRow).addClass('row-selected');
			//common.doOpenStoneWebViewer(studyInstanceUID);
			let fileExt = 'zip';
			let dicomZipFilename = (patientFullName.split(' ').join('_')) + '-' + casedate + '-' + casetime + '.' + fileExt;
			common.doDownloadDicom(orthancStudyID, dicomZipFilename);
		});
		return $(dicomCmdBox);
	}

	const doCreateResponseBackwardBox = function(backwardRow, backwardCaseId, caseresponseId, patientFullName, casedate, casetime){
		let responseBackwarBox = $('<div></div>');
		let downloadCmd = $('<span>เปิดผลอ่าน</span>');
		$(downloadCmd).css(commandButtonStyle);
		$(downloadCmd).appendTo($(responseBackwarBox));
		$(downloadCmd).on('click', async (evt)=>{
			$('.row-selected').removeClass('row-selected');
			$(backwardRow).addClass('row-selected');
			$('body').loading('start');
      const userdata = JSON.parse(localStorage.getItem('userdata'));
			let caseHospitalId = userdata.hospitalId;
      let reportCreateCallerEndPoint = "/api/casereport/create";
			let fileExt = 'pdf';
			let fileName = (patientFullName.split(' ').join('_')) + '-' + casedate + '-' + casetime + '.' + fileExt;
      let params = {caseId: backwardCaseId, hospitalId: caseHospitalId, responseId: caseresponseId, userId: userdata.id, pdfFileName: fileName};
			let reportPdf = await $.post(reportCreateCallerEndPoint, params);
			/*
			var pom = document.createElement('a');
			pom.setAttribute('href', reportPdf.reportLink);
			pom.setAttribute('download', fileName);
			pom.click();
			*/

			let embetObject = $('<object data="' + reportPdf.reportLink + '" type="application/pdf" width="100%" height="480"></object>');
			let resultBox = $(".mainfull").find('#ResultBox');
			$(resultBox).empty().append($(embetObject));
			$('body').loading('stop');
		});
		return $(responseBackwarBox);
	}

	const doCreateRadioStatusCell = function(backwardRow, backwardItem, radioSockets, backwardCasestatusId, backwardCaseOrthancStudyID){
		return new Promise(async function(resolve, reject) {
			const caseSuccessStatusIds = [5, 6, 10, 11, 12, 13, 14];
			let loadUrl = '/api/cases/status/by/dicom/' + backwardCaseOrthancStudyID;
			let loadRes = await apiconnector.doGetApi(loadUrl, {});
			const dicomData = {caseId: loadRes.Records[0].id, casestatusId: loadRes.Records[0].casestatusId, dicomID: backwardCaseOrthancStudyID, studyInstanceUID: loadRes.Records[0].Case_StudyInstanceUID};
			let hadSuccess = util.contains.call(caseSuccessStatusIds, backwardCasestatusId);
			if (hadSuccess) {
				let caseRadio = await radioSockets.find((item)=>{
					if (item.user.id == backwardItem.Case_RadiologistId){
						return item;
					}
				});
				let radioFN = caseRadio.user.userinfo.User_NameTH + ' ' + caseRadio.user.userinfo.User_LastNameTH;
				let contactRadioCmd = $('<span>' + radioFN + '</span>');
				$(contactRadioCmd).css(commandButtonStyle);
				$(contactRadioCmd).on('click', async(evt)=>{
					loadUrl = '/api/cases/select/'+ dicomData.caseId;
					loadRes = await apiconnector.doCallApi(loadUrl, {});
					console.log(loadRes);
					if (loadRes.status.code == 200){
		        let caseBackwardItem = loadRes.Records[0];
						$('.row-selected').removeClass('row-selected');
						$(backwardRow).addClass('row-selected');
						doContactRadioCmdClick(dicomData, caseBackwardItem);
					} else {
						$.notify('Your request case not found.', 'error');
					}
				});
				resolve($(contactRadioCmd));
			} else {
				let createNewCaseCmd = $('<span>ไม่ได้ส่งอ่าน</span>');
				$(createNewCaseCmd).css(commandButtonStyle);
				$(createNewCaseCmd).on('click', async(evt)=>{
					$('.row-selected').removeClass('row-selected');
					$(backwardRow).addClass('row-selected');
					let studyTag = await common.doGetSeriesList(backwardCaseOrthancStudyID);
					let defualtValue = doCreateDefualtValue(studyTag);
					let dicomSeries = studyTag.Series;
					doCreateNewCaseCmdClick(dicomData, caseData, defualtValue, dicomSeries);
				});
				resolve($(createNewCaseCmd));
			}
		});
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
			//let cloudLog = await apiconnector.doGetApi('/api/chatlog/select/case/' + topicId, {});
			let cloudLog = await apiconnector.doCallApi('/api/chatlog/select', {topicType: 'case', topicId: topicId});
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
						resolve([]);
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

	const doCreateDefualtValue = function(studyTag){
		let defualtValue = {patient: {id: studyTag.PatientMainDicomTags.PatientID, name: studyTag.PatientMainDicomTags.PatientName, age: patientProps[1], sex: patientProps[0]}, bodypart: bdp, studyID: studyTag.ID, acc: studyTag.MainDicomTags.AccessionNumber, mdl: mld};
		if (studyTag.MainDicomTags.StudyDescription) {
			defualtValue.studyDesc = studyTag.MainDicomTags.StudyDescription;
		} else {
			defualtValue.studyDesc = '';
		}
		if (studyTag.SamplingSeries.MainDicomTags.ProtocolName) {
			defualtValue.protocalName = studyTag.SamplingSeries.MainDicomTags.ProtocolName;
		} else {
			defualtValue.protocalName = '';
		}
		defualtValue.manufacturer = studyTag.SamplingSeries.MainDicomTags.Manufacturer;
		defualtValue.stationName = studyTag.SamplingSeries.MainDicomTags.StationName;
		defualtValue.studyInstanceUID = studyTag.MainDicomTags.StudyInstanceUID;
		defualtValue.studyDate = studyTag.MainDicomTags.StudyDate;
		defualtValue.headerCreateCase = 'ส่งอ่านผล';
		defualtValue.urgenttype = 'standard';
		return defualtValue;
	}

	const doCreateRadioStateBox = function(bkColor){
		let circle = $('<span style="position: relative; height: 15px; width: 15px; border: 1px solid #ccc; border-radius: 50%; display: inline-block; margin-left: 4px; bottom: -1px;"></span>');
		$(circle).css('background-color', bkColor);
		return $(circle);
	}


	const doCreateRadioSateCmd = function(){
		const stateIconUrl = '/images/doctor-icon-wh.png';
		let stateBox = $('<div style="position: relative; display: inline-block; text-align: center; margin-right: 20px; bottom: 10px;"></div>');
    let stateIcon = $('<img style="postion: absolute; width: 30px; height: auto; cursor: pointer;"/>');
    $(stateIcon).attr('src', stateIconUrl);
		$(stateBox).on('click', async (evt)=>{
			let stateBox = await doCreateFakeRadioStateBox();
			$(stateBox).css({'height': ' 220px', 'overflow': 'scroll'})
			const radalertoption = {
				title: 'สภานะรังสีแพทย์',
				msg: $(stateBox),
				width: '360px',
				onOk: function(evt) {
					radAlertBox.closeAlert();
				}
			}
			let radAlertBox = $('body').radalert(radalertoption);
			$(radAlertBox.cancelCmd).hide();
		});
		console.log(stateBox);
		return $(stateBox).append($(stateIcon));
	}

	const doCreateCircleBox = function(bkColor) {
    let circle = $('<span style="height: 25px; width: 25px; border: 1px solid #ccc; border-radius: 50%; display: inline-block; margin-left: 5px;"></span>');
    $(circle).css('background-color', bkColor);
    return $(circle);
	}

	const doCreateRadioState = function(name, state) {
		let bkColor = undefined;
		if (state == 1) {
			bkColor = 'green';
		} else if (state == 2) {
			bkColor = 'yellow';
		} else if (state == 3) {
			bkColor = 'red';
		}
		let stateBox = $('<div></div>').css({'postion': 'relative', 'padding': '4px', 'line-height': '28px'});
		let circleBox = doCreateCircleBox(bkColor);
		let nameBox = $('<span></span>').text(name).css({'text-decoration': 'underline', 'text-decoration-color': bkColor, 'text-decoration-thickness': '10px'});
		return $(stateBox).append($(nameBox)).append($(circleBox));
	}

	const radioList = [
		{name: 'พ.ธีรวัฒน์ ปิยพสุนทรา', state: 1},
		{name: 'พ.สินีนาถ วารี', state: 1},
		{name: 'พ.นรินทร อู่ทรัพย์', state: 2},
		{name: 'พ.สิริพร ตันติมูรธา', state: 2},
		{name: 'พ.ธนัท ทับเที่ยง', state: 1},
		{name: 'พ.วุฒิชัย สีมาพล', state: 2},
		{name: 'พ.ชารัตน์ ชูเกียรติ', state: 3},
		{name: 'พ.ณัฏฐยา ปราอาภรณ์', state: 1},
		{name: 'พ.ธิติ ทองส่งโสม', state: 1},
		{name: 'พ.สกันยา โกยทรัพย์สิน', state: 1},
		{name: 'พ.ปวีณา สุวรรณเทพ', state: 3},
		{name: 'พ.เบญจวรรณ ไชยขันธ์', state: 3},
		{name: 'พ.วรรณิดา กิจรานันทน์', state: 1},
		{name: 'พ.นันท์นภัส เหล่าไทย', state: 1},
		{name: 'พ.ณัฐสร นิยะมานนท์', state: 2},
		{name: 'พ.ธนุส บุญยะลีพรรณ', state: 3},
		{name: 'พ.สรสิช ศุภธีรสกุล', state: 1},
		{name: 'พ.กุศลิน พิลาแดง', state: 1},
		{name: 'พ.ศศิภากร จิตรสำเริง', state: 1}
	];

	const doCreateFakeRadioStateBox = function(){
		return new Promise(async function(resolve, reject) {
			let radioBox = $('<div></div>').css({'postion': 'relative', 'width': '100%'});
			const promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < radioList.length; i++) {
					let statBox = doCreateRadioState(radioList[i].name, radioList[i].state);
					$(radioBox).append($(statBox));
				}
				setTimeout(()=> {
					resolve2($(radioBox));
				}, 500);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}


  return {
    doOpenCaseView
	}
}
