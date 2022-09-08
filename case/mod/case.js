/* case.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('./apiconnect.js')($);
	const util = require('./utilmod.js')($);
	const common = require('./commonlib.js')($);
	//const newcase = require('./createnewcase.js')($);
	const casecreator = require('../../local/dicom/mod//case-creator.js')($);
	const casecounter = require('./casecounter.js')($);

	const defualtPacsLimit = '30';
	const defualtPacsStudyDate = 'ALL';

	let currentTab = undefined;

	/*
		ค่าข้อมูลใน query ที่ไม่ใช่สตริง ต้องเขียนแบบนี้เท่านั้น
		"Expand": true
		"Limit": 5
		ถ้าเขียนเป็น
		"Expand": "true"
		"Limit": "5"
		แบบนี้จะผิด และจะเกิด Internal Error ขึ้นที่ orthanc
	*/

	const doLoadCases = function(rqParams) {
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			try {
				let response = await common.doCallApi('/api/cases/filter/hospital', rqParams);
				if (response.status.code === 200) {
					if (response.Records.length > 0) {
						console.log(response.Records);
						let rwTable = await doShowCaseList(response.Records);
						$(".mainfull").empty().append($(rwTable));
						casecounter.doSetupCounter();
					} else {
						$(".mainfull").empty().append($('<div><h3>ไม่พบรายการเคส</h3></div>'));
					}
					$('body').loading('stop');
					resolve({loadstatus: 'success'});
				} else if (response.status.code === 210) {
					$('body').loading('stop');
					reject({error: {code: 210, cause: 'Token Expired!'}});
				} else {
					$('body').loading('stop');
					let apiError = 'api error at doLoadCases';
					console.log(apiError);
					reject({error: apiError});
				}
			} catch(err) {
				$('body').loading('stop');
				reject({error: err})
			}
		});
	}

	const doCreateSearchCaseFormRow = function(key, searchResultCallback){
		let searchFormRow = $('<div style="display: table-row; width: 100%;"></div>');
		let formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');

		let fromDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ตั้งแต่</span>
		$(fromDateKeyBox).appendTo($(formField));
		let fromDateKey = $('<input type="text" id="FromDateKey" style="margin-left: 5px; width: 40px;"/>');
		if (key.fromDateKeyValue) {
			let arrTmps = key.fromDateKeyValue.split('-');
			let fromDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
			$(fromDateKey).val(fromDateTextValue);
		}
		//$(fromDateKey).css({'font-size': '20px'});
		$(fromDateKey).appendTo($(fromDateKeyBox));
		$(fromDateKey).datepicker({ dateFormat: 'dd-mm-yy' });

		$(formField).append($('<span style="margin-left: 5px; margin-right: 2px; display: inline-block;">-</span>'));

		let toDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ถึง</span>
		$(toDateKeyBox).appendTo($(formField));
		let toDateKey = $('<input type="text" id="ToDateKey" size="6" style="margin-left: 5px; width: 40px;"/>');
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
		let patientNameENKey = $('<input type="text" id="PatientNameENKey" style="width: 140px;"/>');
		$(patientNameENKey).val(key.patientNameENKeyValue);
		$(formField).append($(patientNameENKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let patientHNKey = $('<input type="text" id="PatientHNKey" size="8"/>');
		$(patientHNKey).val(key.patientHNKeyValue);
		$(formField).append($(patientHNKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left;vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let bodypartKey = $('<input type="text" id="BodyPartKey" style="width: 90%"/>');
		$(bodypartKey).val(key.bodypartKeyValue);
		$(formField).append($(bodypartKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		$(formField).append('<span></span>');
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
		let caseStatusKey = $('<select id="CaseStatusKey"></select>');
		$(caseStatusKey).append($('<option value="0">ทั้งหมด</option>'));
		common.allCaseStatus.forEach((item, i) => {
			$(caseStatusKey).append($('<option value="' + item.value + '">' + item.DisplayText + '</option>'));
		});
		$(caseStatusKey).val(key.caseStatusKeyValue);
		$(formField).append($(caseStatusKey));
		$(formField).appendTo($(searchFormRow));

		formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');
		let startSearchCmd = $('<img src="/images/search-icon-3.png" width="30px" height="auto"/>');
		$(formField).append($(startSearchCmd));
		$(formField).appendTo($(searchFormRow));

		$(searchFormRow).find('input[type=text],select').css({'font-size': '14px'});

		$(startSearchCmd).css({'cursor': 'pointer'});
		$(startSearchCmd).on('click', async (evt) => {
			let fromDateKeyValue = $('#FromDateKey').val();
			console.log(fromDateKeyValue);
			let toDateKeyValue = $(toDateKey).val();
			let patientNameENKeyValue = $(patientNameENKey).val();
			let patientHNKeyValue = $(patientHNKey).val();
			let bodypartKeyValue = $(bodypartKey).val();
			let caseStatusKeyValue = $(caseStatusKey).val();
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
					searchKey = {fromDateKeyValue: fromDateFormat, toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
				} else {
					alert('ถึงวันที่ ต้องมากกว่า ตั้งแต่วันที่ หรือ เลือกวันที่เพียงช่องใดช่องหนึ่ง ส่วนอีกช่องให้เว้นว่างไว้\nโปรดเปลี่ยนค่าวันที่แล้วลองใหม่');
				}
			} else {
				if (fromDateKeyValue) {
					let arrTmps = fromDateKeyValue.split('-');
					fromDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
					let fromDateKeyTime = new Date(fromDateKeyValue);
					let fromDateFormat = util.formatDateStr(fromDateKeyTime);
					searchKey = {fromDateKeyValue: fromDateFormat, patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
				} else if (toDateKeyValue) {
					let arrTmps = toDateKeyValue.split('-');
					toDateKeyValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
					let toDateKeyTime = new Date(toDateKeyValue);
					let toDateFormat = util.formatDateStr(toDateKeyTime);
					searchKey = {toDateKeyValue: toDateFormat, patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
				} else {
					searchKey = {patientNameENKeyValue, patientHNKeyValue, bodypartKeyValue, caseStatusKeyValue};
				}
			}
			if (searchKey) {
				$('body').loading('start');
				let userdata = JSON.parse(localStorage.getItem('userdata'));
				let hospitalId = userdata.hospitalId;
				let userId = userdata.id;
				let usertypeId = userdata.usertypeId;

				let searchParam = {key: searchKey, hospitalId: hospitalId, userId: userId, usertypeId: usertypeId};

				let response = await common.doCallApi('/api/cases/search/key', searchParam);

				$(".mainfull").find('#SearchResultView').empty();
        $(".mainfull").find('#NavigBar').empty();

				await searchResultCallback(response);

				$('body').loading('stop');

			}
		});

		return $(searchFormRow);

	}

	const doCreateHeaderFieldCaseList = function() {
		let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>วันที่ส่งอ่าน</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ชื่อผู้ป่วย</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>เพศ/อายุ</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>HN</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Mod.</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Scan Part</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ประเภทความด่วน</span>');
		$(headColumn).appendTo($(headerRow));

		/*
		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>แพทย์ผู้ส่ง</span>');
		$(headColumn).appendTo($(headerRow));
		*/

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>รังสีแพทย์</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>สถานะเคส</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>คำสั่ง</span>');
		$(headColumn).appendTo($(headerRow));

		return $(headerRow);
	}

	function doCreateCaseItemCommand(ownerRow, caseItem) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let operationCmdButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/arrow-down-icon.png" title="คลิกเพื่อเปิดรายการคำสั่งใช้งานของคุณ"/>');
		$(operationCmdButton).click(async function() {
			let casestatusId = caseItem.case.casestatusId;
			let cando = await common.doGetApi('/api/cases/cando/' + casestatusId, {});
			console.log(cando);
			if (cando.status.code == 200) {
				let cmdRow = $('<div class="cmd-row" style="display: tbable-row; width: 100%;"></div>');
				$(cmdRow).append($('<div style="display: table-cell; border-color: transparent;"></div>'));
				let mainBoxWidth = parseInt($(".mainfull").css('width'), 10);
				//console.log(mainBoxWidth);
				// left: 0px; width: 100%;
				let cmdCell = $('<div style="display: table-cell; position: absolute; width: ' + (mainBoxWidth-8) + 'px; border: 1px solid black; background-color: #ccc; text-align: right;"></div>');
				$(cmdRow).append($(cmdCell));
				await cando.next.actions.forEach((item, i) => {
					let cmd = item.substr(0, (item.length-1));
					let frag = item.substr((item.length-1), item.length);
					if ((frag==='H') &&(userdata.usertypeId==2)) {
						let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
							console.log(cmd);
							console.log(caseItem);
							console.log(data);
							//hospital Action todo
							switch (cmd) {
								case 'upd':
									doCallEditCase(caseItem.case.id);
								break;
								case 'view':
									doViewCaseReport(caseItem.case.id);
								break;
								case 'print':
									//doPrintCaseReport(caseItem.case.id);
									doViewCaseReport(caseItem.case.id);
								break;
								case 'convert':
									doConvertCaseReport(caseItem.case.id, caseItem.case.Case_StudyInstanceUID, caseItem.case.Case_OrthancStudyID, caseItem.case.Case_Modality);
								break;
								case 'cancel':
									doCancelCase(caseItem.case.id);
								break;
								case 'close':
									doCloseCase(caseItem.case.id);
								break;
								case 'delete':
									doCallDeleteCase(caseItem.case.id);
								break;
								case 'callzoom':
									doZoomCallRadio(caseItem);
								break;
							}
						});
						$(iconCmd).appendTo($(cmdCell));
					} else if ((frag==='R') &&(userdata.usertypeId==4)) {
						let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
							//readio Action todo
							if (cmd === 'edit') {
								let eventData = {caseId: caseItem.case.id};
					      $(iconCmd).trigger('opencase', [eventData]);
							}
						});
						$(iconCmd).appendTo($(cmdCell));
					}
				});
				$('.cmd-row').remove();
				$(cmdRow).insertAfter(ownerRow);
			}
		});

		return $(operationCmdButton);
	}

	function doCreateCaseItemRow(caseItem) {
		return new Promise(async function(resolve, reject) {
			let casedatetime = caseItem.case.createdAt.split('T');
			let casedateSegment = casedatetime[0].split('-');
			casedateSegment = casedateSegment.join('');
			let casedate = util.formatStudyDate(casedateSegment);
			let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
			let patientName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
			let patientSA = caseItem.case.patient.Patient_Sex + '/' + caseItem.case.patient.Patient_Age;
			let patientHN = caseItem.case.patient.Patient_HN;
			let caseMODA = caseItem.case.Case_Modality;
			let caseScanparts = caseItem.case.Case_ScanPart;
			let yourSelectScanpartContent = $('<div></div>');
			if ((caseScanparts) && (caseScanparts.length > 0)) {
				yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
			}
			let caseUG = caseItem.case.urgenttype.UGType_Name;
			//let caseREFF = caseItem.Refferal.User_NameTH + ' ' + caseItem.Refferal.User_LastNameTH;
			let caseRADI = caseItem.Radiologist.User_NameTH + ' ' + caseItem.Radiologist.User_LastNameTH;
			let caseSTAT = caseItem.case.casestatus.CS_Name_EN;

			let itemRow = $('<div class="case-row" style="display: table-row; width: 100%;"></div>');
			let itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append('<span>'+ casedate + ' : ' + casetime +'</span>');
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append(patientName);
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append(patientSA);
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append(patientHN);
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append(caseMODA);
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append($(yourSelectScanpartContent));
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append(caseUG);
			$(itemColumn).appendTo($(itemRow));

			/*
			itemColumn = $('<div style="display: table-cell; text-align: left;"></div>');
			$(itemColumn).append(caseREFF);
			$(itemColumn).appendTo($(itemRow));
			*/

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append(caseRADI);
			$(itemColumn).appendTo($(itemRow));

			itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
			$(itemColumn).append($('<span id="CaseStatusName">' + caseSTAT + '</span>'));
			$(itemColumn).appendTo($(itemRow));

			let caseCMD = doCreateCaseItemCommand(itemRow, caseItem);

			itemColumn = $('<div style="display: table-cell; text-align: center; vertical-align: middle;"></div>');
			$(itemColumn).append($(caseCMD));
			$(itemColumn).appendTo($(itemRow));

			resolve($(itemRow));
		});
	}

	const doShowCaseView = function(incidents, key, callback) {
		return new Promise(function(resolve, reject) {
			let rowStyleClass = {/*"font-family": "THSarabunNew", "font-size": "22px"*/};
			let caseView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');

			let headView = doCreateHeaderFieldCaseList(key.fromDateKeyValue);
			$(headView).appendTo($(caseView));
			let formView = doCreateSearchCaseFormRow(key, callback);
			$(formView).appendTo($(caseView));

			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < incidents.length; i++) {
					let itemView = await doCreateCaseItemRow(incidents[i]);
					$(itemView).appendTo($(caseView));
				}
				setTimeout(()=>{
					resolve2($(caseView));
				}, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

  const doShowCaseList = function(incidents) {
		return new Promise(async function(resolve, reject) {
			let myTasks = await common.doCallMyUserTasksCase();
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let rowStyleClass = {/*"font-family": "THSarabunNew", "font-size": "22px"*/};
			let rwTable = $('<table width="100%" cellpadding="5" cellspacing="0"></table>');
			let headRow = $('<tr class="table-header-row"></tr>');
			$(headRow).css(rowStyleClass);
			let headColumns = $('<td width="15%" align="center">เวลาที่ส่งอ่าน</td><td width="10%" align="center">ชื่อ</td><td width="5%" align="center">เพศ/อายุ</td><td width="8%" align="center">HN</td><td width="5%" align="center">Mod.</td><td width="15%" align="center">Scan Part</td><td width="10%" align="center">ประเภทความด่วน</td><td width="10%" align="center">แพทย์ผู้ส่ง</td><td width="10%" align="center">รังสีแพทย์</td><td width="10%" align="center">สถานะเคส</td><td width="*" align="center">คำสั่ง</td>');
			$(rwTable).append($(headRow));
			$(headRow).append($(headColumns));
			for (let i=0; i < incidents.length; i++) {
				let dataRow = $('<tr class="case-row"></tr>');
				$(dataRow).css(rowStyleClass);
				let caseDate = util.formatDateTimeStr(incidents[i].case.createdAt);
				let casedatetime = caseDate.split('T');
				let casedateSegment = casedatetime[0].split('-');
				casedateSegment = casedateSegment.join('');
				let casedate = util.formatStudyDate(casedateSegment);
				let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
				let caseScanparts = incidents[i].case.Case_ScanPart;
				let yourSelectScanpartContent = $('<div></div>');
				if ((caseScanparts) && (caseScanparts.length > 0)) {
					yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
				}
				//$(dataRow).append($('<td align="center"><div class="tooltip">'+ casedate + '<span class="tooltiptext">' + casetime + '</span></div></td>'));
				$(dataRow).append($('<td align="center">' + casedate + ' : ' + casetime + '</td>'));
				$(dataRow).append($('<td align="center"><div class="tooltip">'+ incidents[i].case.patient.Patient_NameEN + ' ' + incidents[i].case.patient.Patient_LastNameEN + '<span class="tooltiptext">' + incidents[i].case.patient.Patient_NameTH + ' ' + incidents[i].case.patient.Patient_LastNameTH + '</span></div></td>'));
				$(dataRow).append($('<td align="center">'+ incidents[i].case.patient.Patient_Sex + '/' + incidents[i].case.patient.Patient_Age + '</td>'));
				$(dataRow).append($('<td align="center">'+ incidents[i].case.patient.Patient_HN + '</td>'));
				$(dataRow).append($('<td align="center">'+ incidents[i].case.Case_Modality + '</td>'));
				//$(dataRow).append($('<td align="center">'+ $(yourSelectScanpartContent).html() + '</td>'));
				let scanpartCol = $('<td align="center"></td>');
				$(dataRow).append($(scanpartCol));
				$(scanpartCol).append($(yourSelectScanpartContent));
				$(dataRow).append($('<td align="center">'+ incidents[i].case.urgenttype.UGType_Name + '</td>'));
				$(dataRow).append($('<td align="center">'+ incidents[i].Refferal.User_NameTH + ' ' + incidents[i].Refferal.User_LastNameTH + '</td>'));
				$(dataRow).append($('<td align="center">'+ incidents[i].Radiologist.User_NameTH + ' ' + incidents[i].Radiologist.User_LastNameTH + '</td>'));
				let caseStatusCol = $('<td align="center"><span id="CaseStatusName">'+ incidents[i].case.casestatus.CS_Name_EN + '</span></td>');
				$(dataRow).append($(caseStatusCol));
				if ((incidents[i].case.casestatus.id == 1) || (incidents[i].case.casestatus.id == 2) || (incidents[i].case.casestatus.id == 8) /* || (incidents[i].case.casestatus.id == 9) */ ) {
					//let caseTask = await common.doCallApi('/api/tasks/select/'+ incidents[i].case.id, {});
					//{"status":{"code":200},"Records":[{"caseId":217,"username":"sutin","radioUsername":"test0003","triggerAt":"2020-12-13T07:13:52.968Z"}]}
					let task = await common.doFindTaksOfCase(myTasks.Records, incidents[i].case.id);
					//if ((caseTask.Records) && (caseTask.Records.length > 0) && (caseTask.Records[0]) && (caseTask.Records[0].triggerAt)){
					console.log(myTasks.Records);
					if ((task) && (task.triggerAt)) {
						let caseTriggerAt = new Date(task.triggerAt);
						let diffTime = Math.abs(caseTriggerAt - new Date());
						let hh = parseInt(diffTime/(1000*60*60));
						let mn = parseInt((diffTime - (hh*1000*60*60))/(1000*60));
						let clockCountdownDiv = $('<div id="ClockCountDownBox"></div>');
						$(clockCountdownDiv).countdownclock({countToHH: hh, countToMN: mn});
						$(caseStatusCol).append($(clockCountdownDiv));
					} else {
						//Warning Case Please Cancel Case by Cancel Cmd.
						/*
						let taskWarningBox = $('<div style="position: relative; width: 100%; text-align: center; color: red;"></div>');
						$(taskWarningBox).append($('<span>กรุณาส่งใหม่</span>'));
						$(caseStatusCol).append($(taskWarningBox));
						*/
					}
				}
				let commandCol = $('<td align="center"></td>');
				$(commandCol).appendTo($(dataRow));
				$(rwTable).append($(dataRow));

				let operationCmdButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/arrow-down-icon.png" title="คลิกเพื่อเปิดรายการคำสั่งใช้งานของคุณ"/>');
				$(operationCmdButton).click(function() {
					$('.operation-row').each((index, child) => {
						if ($(child).css('display') !== 'none') {
							$(child).slideUp();
						}
					});
					let operationVisible = $('#' + incidents[i].case.id).css('display');
					if (operationVisible === 'none') {
						$('#' + incidents[i].case.id).slideDown();
						$(moreCmdBox).css('visibility', 'hidden');
						$(moreCmdBox).data('state', 'off');
						$(toggleMoreCmd).show();
					} else {
						$('#' + incidents[i].case.id).slideUp();
					}
				});
				$(operationCmdButton).appendTo($(commandCol));

				let commnandRow = $('<tr></tr>');
				$(commnandRow).appendTo($(rwTable));
				let operationCol = $('<td id="' + incidents[i].case.id + '"colspan="12" align="right" style="background-color: #828080; display: none;" class="operation-row"></td>');
				$(operationCol).appendTo($(commnandRow));

				let operationCmdBox = $('<div style="position: relative; display: inline-block;"></div>');
				$(operationCmdBox).appendTo($(operationCol));

				let moreCmdBox = $('<div style="position: relative; display: inline-block; visibility: hidden;" data-state="off"></div>');
				let toggleMoreCmd = $('<img class="pacs-command" data-toggle="tooltip" src="/images/three-dot-h-icon.png" title="More Command." style="display: none;"/>');
				$(toggleMoreCmd).on('click', (evt)=>{
					let state = $(moreCmdBox).data('state');
					if (state == 'off') {
						$(moreCmdBox).css('visibility', 'visible');
						$(moreCmdBox).data('state', 'on');
						$(toggleMoreCmd).hide();
					} else {
						$(moreCmdBox).css('visibility', 'hidden');
						$(moreCmdBox).data('state', 'off');
					}
				});

				let downlodDicomButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/zip-icon.png" title="Download Dicom in zip file."/>');
				$(downlodDicomButton).click(function() {
					let patientNameEN = incidents[i].case.patient.Patient_NameEN + '_' + incidents[i].case.patient.Patient_LastNameEN;
					let savefile = patientNameEN + '-' + casedateSegment + '.zip';
					common.doDownloadDicom(incidents[i].case.Case_OrthancStudyID, savefile);
				});
				$(downlodDicomButton).appendTo($(moreCmdBox));

				if ((incidents[i].case.casestatus.id == 1) || (incidents[i].case.casestatus.id == 2) || (incidents[i].case.casestatus.id == 3) || (incidents[i].case.casestatus.id == 4) || (incidents[i].case.casestatus.id == 7)) {
					let editCaseButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/update-icon-2.png" title="Edit Case Detail."/>');
					$(editCaseButton).click(function() {
						doCallEditCase(incidents[i].case.id);
					});
					$(editCaseButton).appendTo($(operationCmdBox));

					let task = await common.doFindTaksOfCase(myTasks.Records, incidents[i].case.id);
					if((!task) && ((incidents[i].case.casestatus.id == 1) || (incidents[i].case.casestatus.id == 2) || (incidents[i].case.casestatus.id == 8))) {
						//not foynd task.
						let cancelCaseButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/cancel-icon.png" title="Cancel incurrect Case by short-cut."/>');
						$(cancelCaseButton).click(async function() {
							//doCancelCase(incidents[i].case.id);
							let caseId = incidents[i].case.id;
							let cancelStatus = 7;
							let expiredDescription = 'Not found Task on Case Task Cron Job. Cancel by Status Short-cut.';
							let response = await common.doUpdateCaseStatusByShortCut(caseId, cancelStatus, expiredDescription);
							if (response.status.code == 200) {
								//casecounter.doSetupCounter();
								$('#NegativeStatusSubCmd').click();
							}
						});
						$(cancelCaseButton).appendTo($(moreCmdBox));
					}
				}

				if ((incidents[i].case.casestatus.id == 3) || (incidents[i].case.casestatus.id == 4)) {
					let cancelCaseButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/cancel-icon.png" title="Cancel Case."/>');
					$(cancelCaseButton).click(function() {
						doCancelCase(incidents[i].case.id);
					});
					$(cancelCaseButton).appendTo($(operationCmdBox));
				}

				if ((incidents[i].case.casestatus.id == 5) || (incidents[i].case.casestatus.id == 6) || (incidents[i].case.casestatus.id == 10) || (incidents[i].case.casestatus.id == 11) || (incidents[i].case.casestatus.id == 12) || (incidents[i].case.casestatus.id == 13) || (incidents[i].case.casestatus.id == 14)) {
					//let viewResultButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/pdf-icon-2.png" title="View Result."/>');
					let closeCaseButton = $('<img class="pacs-command-dd" data-toggle="tooltip" src="/images/close-icon-3.png" title="Close Case to archive job."/>');
					$(closeCaseButton).click(async function() {
						if (incidents[i].case.casestatus.id == 12) {
							let closeCaseStatus = 6;
							let closeDescription = '';
							await common.doUpdateCaseStatusByShortCut(incidents[i].case.id, closeCaseStatus, closeDescription);
							casecounter.doSetupCounter();
							$('#SuccessStatusSubCmd').click();
						} else {
							doCloseCase(incidents[i].case.id);
						}
					});
					$(closeCaseButton).appendTo($(operationCmdBox));

					let viewResultButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/print-icon.png" title="View Result."/>');
					$(viewResultButton).click(function() {
						doViewCaseReport(incidents[i].case.id);
					});
					$(viewResultButton).appendTo($(operationCmdBox));

					/*
					let printResultButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/print-icon.png" title="Print Read Result."/>');
					$(printResultButton).click(function() {
						doPrintCaseReport(incidents[i].case.id);
					});
					$(printResultButton).appendTo($(operationCmdBox));
					*/
					let convertResultButton = $('<img class="pacs-command-dd" data-toggle="tooltip" src="/images/convert-icon.png" title="Convert Result to Dicom."/>');
					$(convertResultButton).click(function() {
						doConvertCaseReport(incidents[i].case.id, incidents[i].case.Case_StudyInstanceUID, incidents[i].case.Case_OrthancStudyID, incidents[i].case.Case_Modality);
					});
					//$(convertResultButton).appendTo($(operationCmdBox));
					$(convertResultButton).prependTo($(moreCmdBox));

					let zoomCallButton = $('<img class="pacs-command-dd" data-toggle="tooltip" src="/images/zoom-black-icon.png" title="Call Radiologist by zoom app."/>');
					$(zoomCallButton).click(function() {
						doZoomCallRadio(incidents[i]);
					});
					//$(zoomCallButton).appendTo($(operationCmdBox));
					$(zoomCallButton).prependTo($(moreCmdBox));
				}

				if (incidents[i].case.casestatus.id == 7) {
					let deleteCaseButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/delete-icon.png" title="Delete Case."/>');
					$(deleteCaseButton).click(function() {
						doCallDeleteCase(incidents[i].case.id);
					});
					$(deleteCaseButton).appendTo($(operationCmdBox));
				}

				if (incidents[i].case.casestatus.id == 8){
					let editCaseButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/update-icon-2.png" title="Edit Case Detail."/>');
					$(editCaseButton).click(function() {
						doCallEditCase(incidents[i].case.id);
					});
					$(editCaseButton).appendTo($(operationCmdBox));

					let task = await common.doFindTaksOfCase(myTasks.Records, incidents[i].case.id);
					if(!task){
						//not foynd task.
						let cancelCaseButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/cancel-icon.png" title="Cancel incurrect Case by short-cut."/>');
						$(cancelCaseButton).click(async function() {
							//doCancelCase(incidents[i].case.id);
							let caseId = incidents[i].case.id;
							let cancelStatus = 7;
							let expiredDescription = 'Not found Task on Case Task Cron Job. Cancel by Status Short-cut.';
							let response = await common.doUpdateCaseStatusByShortCut(caseId, cancelStatus, expiredDescription);
							if (response.status.code == 200) {
								//casecounter.doSetupCounter();
								$('#NegativeStatusSubCmd').click();
							}
						});
						$(cancelCaseButton).appendTo($(moreCmdBox));
					}
				}

				$(operationCol).append($(toggleMoreCmd)).prepend($(moreCmdBox));
				let moreChild = $(moreCmdBox).find('.pacs-command');
				if ($(moreChild).length > 0) {
					$(toggleMoreCmd).show();
				}
			}
			resolve($(rwTable));
		});
  }

  async function doCallEditCase(caseid) {
  	$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		const username = userdata.username;

		let rqParams = { username: username, id: caseid }
		let apiUrl = '/api/cases/select/' + caseid;
		try {
			let apiRes = await common.doCallApi(apiUrl, rqParams);
			console.log(apiRes);
			let response = apiRes.Records[0];
			let resPatient = response.case.patient;
  		let patient = {id: resPatient.Patient_HN, name: resPatient.Patient_NameEN, name_th: resPatient.Patient_NameTH, age: resPatient.Patient_Age, sex: resPatient.Patient_Sex, patientCitizenID: resPatient.Patient_CitizenID};
			let defualtValue = {caseId: response.case.id, patient: patient, bodypart: response.case.Case_BodyPart, scanpart: response.case.Case_ScanPart, studyID: response.case.Case_OrthancStudyID, acc: response.case.Case_ACC, mdl: response.case.Case_Modality};
			defualtValue.pn_history = response.case.Case_PatientHRLink;
			defualtValue.status = response.case.casestatusId;
			defualtValue.urgent = response.case.urgenttypeId;
			defualtValue.urgenttype = response.case.urgenttype.UGType;
			defualtValue.rights = response.case.cliamerightId;
			defualtValue.primary_dr = response.case.Case_RefferalId;
			defualtValue.dr_id = response.case.Case_RadiologistId;
			defualtValue.detail = response.case.Case_DESC;
			defualtValue.dept = response.case.Case_Department;
			defualtValue.inc_price = response.case.Case_Price;
			defualtValue.patientId = resPatient.id;
			defualtValue.studyInstanceUID = response.case.Case_StudyInstanceUID;
			defualtValue.headerCreateCase = 'แก้ไขเคส';
			defualtValue.createdAt = response.case.createdAt;

			//let orthancRes = await common.doGetOrthancStudyDicom(defualtValue.studyID);
			let studyTags = await common.doGetSeriesList(defualtValue.studyID)
			let seriesList = studyTags.Series;
			let patientName = studyTags.PatientMainDicomTags.PatientName;
			let allSeries = seriesList.length;
			//let allImageInstances = await newcase.doCallCountInstanceImage(seriesList, patientName);
			let allImageInstances = await common.doCountImageLocalDicom(defualtValue.studyID);
			//newcase.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
			casecreator.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
			/*
  		//doOpenEditCase(defualtValue);
			*/
  		$('body').loading('stop');
		} catch(e) {
	    console.log('Unexpected error occurred =>', e);
	    $('body').loading('stop');
    }
  }

	function doShowPopupReadResult(caseId, hospitalId, userId, patient) {
		//window.open(re_url, '_blank');
		$('body').loading('start');
		apiconnector.doDownloadResult(caseId,  hospitalId, userId, patient).then((pdf) => {
			console.log(pdf);
			var pom = document.createElement('a');
			pom.setAttribute('href', pdf.reportLink);
			pom.setAttribute('target', '_blank');
			//pom.setAttribute('download', patient + '.pdf');
			pom.click();
			$('body').loading('stop');
		});
	}

	function doConvertResultToDicom(caseId, hospitalId, userId, studyID, modality, studyInstanceUID) {
		$('body').loading('start');
		apiconnector.doConvertPdfToDicom(caseId, hospitalId, userId, studyID, modality, studyInstanceUID).then(async (dicomRes) => {
			console.log(dicomRes);
			if (dicomRes.status.code == 200) {
				//alert('แปลงผลอ่านเข้า dicom ชองผู้ป่วยเรียบร้อย\nโปรดตรวจสอบได้จาก Local File.');
				// ตรงนี้จะมี websocket trigger มาจาก server / pdfconverto.js
				let userdata = JSON.parse(localStorage.getItem('userdata'));
				let convertLog = {action: 'convert', by: userdata.id, at: new Date()};
				await common.doCallApi('/api/casereport/appendlog/' + caseId, {Log: convertLog});
				$('body').loading('stop');
			} else if (dicomRes.status.code == 205) {
				let radAlertMsg = $('<div></div>');
				$(radAlertMsg).append($('<p>โปรดรีสตาร์ต RadConnext Service</p>'));
				$(radAlertMsg).append($('<p>เพื่อดำเนินการ Convert Pdf Dicom อีกครั้ง</p>'));
				const radalertoption = {
					title: 'Local Web Socket ขัดข้อง',
					msg: $(radAlertMsg),
					width: '420px',
					onOk: function(evt) {
						radAlertBox.closeAlert();
					}
				}
				let radAlertBox = $('body').radalert(radalertoption);

			}
		}).catch((err) => {
			console.log('doConvertResultToDicom ERROR:', err);
			$('body').loading('stop');
		});
	}

	function doCallDeleteCase(caseID) {
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบเคสรายการนี้ออกจากระบบฯ จริงๆ ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบเคส</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบเคส',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: function(evt) {
				radConfirmBox.closeAlert();
				$('body').loading('start');
				doDeleteCase(caseID).then((response) => {
					if (response.status.code == 200) {
						casecounter.doSetupCounter();
						$('#NegativeStatusSubCmd').click();
						$.notify("ลบรายการเคสสำเร็จ", "success");
					} else if (response.status.code == 201) {
						$.notify("ไม่สามารถลบรายการเคสได้ เนื่องจากเคสไม่อยู่ในสถานะที่จะลบได้", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการเคสได้", "error");
					}
					$('body').loading('stop');
				}).catch((err) => {
					console.log(err);
					$.notify("ต้องขออภัยอย่างแรง มีข้อผิดพลาดเกิดขึ้น", "error");
					$('body').loading('stop');
				});
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);

	}

	function doDeleteCase(id) {
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.userId;
			let rqParams = { hospitalId: hospitalId, userId: userId, id: id};
			let apiUrl = '/api/cases/delete';
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	async function doZoomCallRadio(incidents) {
		$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let startMeetingTime = util.formatStartTimeStr();
		let hospName = userdata.hospital.Hos_Name;
		let zoomMeeting = await apiconnector.doGetZoomMeeting(incidents, startMeetingTime, hospName);
		//find radio socketId
		let radioId = incidents.case.Case_RadiologistId;
		let callSocketUrl = '/api/cases/radio/socket/' + radioId;
		let rqParams = {};
		let radioSockets = await common.doCallApi(callSocketUrl, rqParams);
		if (radioSockets.length > 0) {
			//radio online
			let callZoomMsg = {type: 'callzoom', sendTo: radioSockets[0].id, openurl: zoomMeeting.join_url, password: zoomMeeting.password, topic: zoomMeeting.topic, sender: userdata.username}
			//let myWsm = main.doGetWsm();
			//console.log(JSON.stringify(callZoomMsg));
			const main = require('../main.js');
			let myWsm = main.doGetWsm();
			myWsm.send(JSON.stringify(callZoomMsg));
			window.open(zoomMeeting.start_url, '_blank');
		} else {
			//radio offline
			let userConfirm = confirm('ระบบไม่สามารถติดต่อไปยังปลายทางของคุณได้ในขณะนี้\nตุณต้องการส่งข้อมูล conference ไปให้ปลายทางผ่านช่องทางอื่น เช่น อีเมล์ ไลน์ หรทอไม่\nคลิกตกลงหรือ OK ถ้าต้องการ');
			if (userConfirm) {
				$('#HistoryDialogBox').empty();
				let dataBox = $('<div></div>');
				$(dataBox).append('<div><div><b>ลิงค์สำหรับเข้าร่วม Conference</b></div><div>' + zoomMeeting.join_url + '</div></div>');
				$(dataBox).append('<div><div><b>Password เข้าร่วม Conference</b></div><div>' + zoomMeeting.password + '</div></div>');
				$(dataBox).append('<div><div><b>ชื่อหัวข้อ Conference</b></div><div>' + zoomMeeting.topic + '</div></div>');
				$('#HistoryDialogBox').append($(dataBox));
				let cmdBox = $('<div></div>');
		 		$(cmdBox).css('width','100%');
				$(cmdBox).css('padding','3px');
				$(cmdBox).css('clear','left');
		 		$(cmdBox).css('text-align','center');
		  	let closeCmdBtn = $('<button>ปิด</button>');
		  	$(closeCmdBtn).click(()=>{
		  		$('#HistoryDialogBox').dialog('close');
		  	});
		  	$(closeCmdBtn).appendTo($(cmdBox));
		  	$('#HistoryDialogBox').append($(cmdBox));
		  	$('#HistoryDialogBox').dialog('option', 'title', 'ข้อมูล conference');
		  	$('#HistoryDialogBox').dialog('open');
			}
			$('body').loading('stop');
		}
	}

	function doStopInterruptEvt(e) {
		let stopData = e.detail.data;
		if (stopData.result === 1) {
			alert('ปลายทางตอบตกลงเข้าร่วม Conference โปรดเปิดสัญญาญภาพจากกล้องวิดีโอของคุณและรอสักครู่');
		} else {
			alert('ปลายทางปฏิเสธการเข้าร่วม Conference');
		}
		$('body').loading('stop');
	}

	const doCreateSearchTitlePage = function(){
		let searchResultTitleBox = $('<div id="ResultTitleBox"></div>');
		let logoPage = $('<img src="/images/search-icon-4.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
		$(logoPage).appendTo($(searchResultTitleBox));
		let titleResult = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>ผลการค้นหาเคสของคุณ</h3></div>');
		$(titleResult).appendTo($(searchResultTitleBox));
		return $(searchResultTitleBox);
	}

	const doShowSearchResultCallback = function(response){
		return new Promise(async function(resolve, reject) {
			/*  Concept */
			/*
			1. ส่งรายการ case ตามจำนวนรายการ ในเงื่อนไขของ Navigator ไปสร้าง View
			2. รับ view ที่ได้จากข้อ 1 มา append ต่อจาก titlepage
			3. ตรวจสอบจำนวน case ในข้อ 1 ว่ามีกี่รายการ
				- มากกว่า 0 ให้แสดง Navigator
				- เท่ากับ 0 ให้แสดงข้อความ ไม่พบรายการที่ค้นหา
			*/
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
			let caseView = await doShowCaseView(showCases, response.key, doShowSearchResultCallback);
			$(".mainfull").find('#SearchResultView').empty().append($(caseView));

			if (allCaseRecords.length == 0) {
				$(".mainfull").find('#SearchResultView').append($('<h4>ไม่พบรายการเคสตามเงื่อนไขที่คุณค้นหา</h4>'));
			} else {
				let navigBarBox = $(".mainfull").find('#NavigBar');
				if ($(navigBarBox).length == 0) {
					navigBarBox = $('<div id="NavigBar"></div>');
				} else {
					$(navigBarBox).empty();
				}
				$(".mainfull").append($(navigBarBox));
				let navigBarOption = {
					currentPage: 1,
					itemperPage: userItemPerPage,
					totalItem: allCaseRecords.length,
					styleClass : {'padding': '4px'/*, "font-family": "THSarabunNew", "font-size": "20px"*/},
					changeToPageCallback: async function(page){
						$('body').loading('start');
						let toItemShow = 0;
						if (page.toItem == 0) {
							toItemShow = allCaseRecords.length;
						} else {
							toItemShow = page.toItem;
						}
						showCases = await common.doExtractList(allCaseRecords, page.fromItem, toItemShow);
						caseView = await doShowCaseView(showCases, response.key, doShowSearchResultCallback);
						$(".mainfull").find('#SearchResultView').empty().append($(caseView));
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

	const doViewCaseReport = async function(caseId){
		$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let reportRes = await common.doCallApi('/api/casereport/select/' + caseId, {});
		//console.log(reportRes);
		if (reportRes.Records.length > 0){
			let pdfReportLink = 'https://radconnext.info' + reportRes.Records[0].PDF_Filename  + '?t=' + common.genUniqueID();
			console.log(pdfReportLink);
			//let pdfDialog = doCreateResultPDFDialog(pdfReportLink);
			let pdfDialog = $('<object data="' + pdfReportLink + '" type="application/pdf" width="99%" height="380"></object>');
			//$("#dialog").append($(pdfDialog));
			const reportformoption = {
  			title: 'ผลอ่าน',
  			msg: $(pdfDialog),
  			width: '720px',
				okLabel: ' เปิดหน้าต่างใหม่ ',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
					window.open(pdfReportLink, '_blank');
          reportPdfDlgHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				reportPdfDlgHandle.closeAlert();
  			}
  		}
  		let reportPdfDlgHandle = $('body').radalert(reportformoption);

			let viewLog = {action: 'view', by: userdata.id, at: new Date()};
			let callRes = await common.doCallApi('/api/casereport/appendlog/' + caseId, {Log: viewLog});
			/*
			if (callRes.status.code == 200){
				$('#CaseStatusName').text('View');
			}
			*/
			$('body').loading('stop');
		} else {
			$.notify('มีข้อผิดพลาด', 'error');
			$('body').loading('stop');
		}
	}

	const doCancelCase = function(caseId){
		$('body').loading('start');
		let newStatus = 7;
		let newDescription = 'User cancel case.';
		common.doUpdateCaseStatus(caseId, newStatus, newDescription).then((response) => {
			$('body').loading('stop');
			$('#NegativeStatusSubCmd').click();
		});
	}

	const doPrintCaseReport = async function(caseId) {
		$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let reportRes = await common.doCallApi('/api/casereport/select/' + caseId, {});
		if (reportRes.Records.length > 0){
			let pdfFileName = reportRes.Records[0].PDF_Filename;
			printJS(pdfFileName);
			let printLog = {action: 'print', by: userdata.id, at: new Date()};
			await common.doCallApi('/api/casereport/appendlog/' + caseId, {Log: printLog});
			$('body').loading('stop');
		} else {
			$.notify('มีข้อผิดพลาด', 'error');
			$('body').loading('stop');
		}
	}

	const doConvertCaseReport = function(caseId, studyInstanceUID, orthancStudyID, modality){
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let hospitalId = userdata.hospitalId;
		let userId = userdata.id;
		doConvertResultToDicom(caseId, hospitalId, userId, orthancStudyID, modality, studyInstanceUID);
	}

	const doCloseCase = function(caseId){
		$('body').loading('start');
		let newStatus = 6;
		let newDescription = 'User close case to archive job.';
		common.doUpdateCaseStatus(caseId, newStatus, newDescription).then((response) => {
			casecounter.doSetupCounter();
			$('body').loading('stop');
			$('#SuccessStatusSubCmd').click();
		});
	}

	const doCreateResultPDFDialog = function(pdfReportLink){
		const dialogHLBarCss = {'position': 'relative', 'width': '99.4%', 'background-color': common.headBackgroundColor, 'color': 'white', 'text-align': 'center', 'border': '1px solid grey', 'margin-top': '4px'};
		const modalDialog = $('<div></div>');
		$(modalDialog).css(common.quickReplyDialogStyle);
		const contentDialog = $('<div></div>');

		let dialogTitle = $('<h3>ผลอ่าน</h3>');
		let dialogHeader = $('<div></div>');
		$(dialogHeader).append($(dialogTitle));
		$(dialogHeader).css(dialogHLBarCss);

		let dialogContent = $('<div style="border: 1px solid grey; position: relative; width: 99.4%; margin-top: 4px;"></div>');
		let embetObject = $('<object data="' + pdfReportLink + '" type="application/pdf" width="99%" height="380"></object>');
		$(dialogContent).append($(embetObject));
		$(dialogContent).css({'position': 'relative', 'width': '100%'});

		let okCmd = $('<input type="button" value=" ปิด " class="action-btn"/>');
		let dialogFooter = $('<div></div>');
		$(dialogFooter).append($(okCmd));
		$(dialogFooter).css(dialogHLBarCss);

		const doCloseDialog = function(){
			$(modalDialog).parent().empty();
			$(modalDialog).parent().removeAttr('style');
		}

		$(okCmd).on('click', (evt)=>{
			doCloseDialog();
			$('#SuccessStatusSubCmd').click();
		});

		$(contentDialog).append($(dialogHeader)).append($(dialogContent)).append($(dialogFooter));
		$(contentDialog).css(common.quickReplyContentStyle);
		return $(modalDialog).append($(contentDialog))
	}

	return {
		doLoadCases,
		doShowCaseView,
		doShowCaseList,
		doCreateHeaderFieldCaseList,
		doCreateSearchCaseFormRow,
		doCreateSearchTitlePage,
		doShowSearchResultCallback
	}
}
