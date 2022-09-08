/* commonlib.js */
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);

	const caseReadWaitStatus = [1];
	const caseResultWaitStatus = [2, 8, 9, 13, 14];
	const casePositiveStatus = [2,8,9];
	const caseNegativeStatus = [3,4,7];
	const caseReadSuccessStatus = [5, 10, 11, 12, 13, 14];
	const caseAllStatus = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
	const allCaseStatus = [
		{value: 1, DisplayText: 'เคสใหม่'},
		{value: 2, DisplayText: 'หมอตอบรับแล้ว่ '},
		{value: 3, DisplayText: 'หมอไม่ตอบรับ'},
		{value: 4, DisplayText: 'หมดอายุ'},
		{value: 5, DisplayText: 'ได้ผลอ่านแล้ว'},
		{value: 6, DisplayText: 'ปิดเคสไปแล้ว'},
		{value: 7, DisplayText: 'เคสถูกยกเลิก'},
		{value: 8, DisplayText: 'หมอเปิดอ่านแล้ว'},
		{value: 9, DisplayText: 'หมอเริ่มพิมพ์ผล'},
		{value: 10, DisplayText: 'เจ้าของเคสดูผลแล้ว'},
		{value: 11, DisplayText: 'เจ้าของเคสพิมพ์ผลแล้ว'},
		{value: 12, DisplayText: 'มีการแก้ไขผลอ่าน'},
		{value: 13, DisplayText: 'มีผลอ่านชั่วคราว'},
		{value: 14, DisplayText: 'มีข้อความประเด็นเคส'}
	];

	const allCaseStatusForRadio = [
		{value: 1, DisplayText: 'เคสใหม่'},
		{value: 2, DisplayText: 'หมอตอบรับแล้ว่ '},
		//{value: 3, DisplayText: 'หมอไม่ตอบรับ'},
		{value: 4, DisplayText: 'หมดอายุ'},
		{value: 5, DisplayText: 'ได้ผลอ่านแล้ว'},
		//{value: 6, DisplayText: 'ปิดเคสไปแล้ว'},
		//{value: 7, DisplayText: 'เคสถูกยกเลิก'},
		{value: 8, DisplayText: 'หมอเปิดอ่านแล้ว'},
		{value: 9, DisplayText: 'หมอเริ่มพิมพ์ผล'},
		{value: 10, DisplayText: 'เจ้าของเคสดูผลแล้ว'},
		{value: 11, DisplayText: 'เจ้าของเคสพิมพ์ผลแล้ว'},
		{value: 12, DisplayText: 'มีการแก้ไขผลอ่าน'},
		{value: 13, DisplayText: 'มีผลอ่านชั่วคราว'},
		{value: 14, DisplayText: 'มีข้อความประเด็นเคส'}
	];

	const defaultProfile = {
    readyState: 1,
		readyBy: 'user',
    screen: {
      lock: 30,
      unlock: 0
    },
    auotacc: 0,
    casenotify: {
      webmessage: 1,
      line: 1,
      autocall: 0,
      mancall:0
    }
  };

	const dicomTagPath = [
		{tag: 'StudyDate', path: 'MainDicomTags/StudyDate'},
		{tag: 'StudyTime', path: 'MainDicomTags/StudyTime'},
		{tag: 'Modality', path: 'SamplingSeries/MainDicomTags/Modality'},
		{tag: 'PatientName', path: 'PatientMainDicomTags/PatientName'},
		{tag: 'PatientID', path: 'PatientMainDicomTags/PatientID'},
		{tag: 'StudyDescription', path: 'MainDicomTags/StudyDescription'},
		{tag: 'ProtocolName', path: 'SamplingSeries/MainDicomTags/ProtocolName'}
	];

  const pageLineStyle = {'width': '100%', 'border': '2px solid gray', /*'border-radius': '10px',*/ 'background-color': '#ddd', 'margin-top': '4px', 'padding': '2px'};
	const headBackgroundColor = '#184175';
	const jqteConfig = {format: false, fsize: false, ol: false, ul: false, indent: false, outdent: false,
		link: false, unlink: false, remove: false, /*br: false,*/ strike: false, rule: false,
		sub: false, sup: false, left: false, center: false, right: false/*, source: false */
	};
	const modalitySelectItem = ['CR', 'CT', 'MG', 'US', 'MR', 'AX'];
	const sizeA4Style = {width: '210mm', height: '297mm'};
	const quickReplyDialogStyle = { 'position': 'fixed', 'z-index': '33', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto',/* 'background-color': 'rgb(0,0,0)',*/ 'background-color': 'rgba(0,0,0,0.4)'};
	const quickReplyContentStyle = { 'background-color': '#fefefe', 'margin': '70px auto', 'padding': '0px', 'border': '2px solid #888', 'width': '620px', 'height': '500px'/*, 'font-family': 'THSarabunNew', 'font-size': '24px'*/ };

  const doCallApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			apiconnector.doCallApi(url, rqParams).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log('error at api ' + url);
				console.log(JSON.stringify(err));
				reject(err);
			})
		});
	}

	const doGetApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			apiconnector.doGetApi(url, rqParams).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
		});
	}

	const doCallLocalApi = function(apiurl, rqParams) {
		return new Promise(function(resolve, reject) {
			const progBar = $('body').radprogress({value: 0, apiname: apiurl});
      $(progBar.progressBox).screencenter({offset: {x: 50, y: 50}});
			$.ajax({
        url: apiurl,
        type: 'post',
        data: rqParams,
        xhr: function () {
          var xhr = $.ajaxSettings.xhr();
          xhr.onprogress = function(evt) {
            if (evt.lengthComputable) {
              // For Download
              let loaded = evt.loaded;
              let total = evt.total;
              let prog = (loaded / total) * 100;
              let perc = prog.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              $('body').find('#ProgressValueBox').text(perc + '%');
            }
          };
          xhr.upload.onprogress = function (evt) {
            // For uploads
          };
          return xhr;
        }
      }).done(function (res) {
        progBar.doUpdateProgressValue(100);
        setTimeout(()=>{
  				progBar.doCloseProgress();
          let apiItem = {api: apiurl};
          console.log(apiItem);
          let logWin = $('body').find('#LogBox');
					if (logWin) {
          	$(logWin).simplelog(apiItem);
					}
          resolve(res)
        }, 1000);
      }).fail(function (err) {
        reject(err);
      });
		});
	}

	const doGetLocalApi = function(url, rqParams) {
		return new Promise(function(resolve, reject) {
			$.get(apiURL, params, function(data){
				resolve(data);
			}).fail(function(error) {
				reject(error);
			});
		});
	}

	const doCreateDicomFilterForm = function(execCallback){
		let studyFromDateInput = $('<input type="text" value="*" id="StudyFromDateInput" style="width: 50px;"/>');
		$(studyFromDateInput).datepicker({ dateFormat: 'dd-mm-yy' });
		$(studyFromDateInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let studyToDateInput = $('<input type="text" value="*" id="StudyToDateInput" style="width: 50px;"/>');
		$(studyToDateInput).datepicker({ dateFormat: 'dd-mm-yy' });
		$(studyToDateInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let patientHNInput = $('<input type="text" value="*" id="PatientHNInput" size="12"/>');
		$(patientHNInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let patientNameInput = $('<input type="text" value="*" id="PatientNameInput" size="15"/>');
		$(patientNameInput).on('keypress',function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let modalityInput = $('<input type="text" value="*" id="ModalityInput" size="4"/>');
		$(modalityInput).on('keypress', function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let scanPartInput = $('<input type="text" value="*" id="ScanPartInput" style="width: 96.5%;"/>');
		$(scanPartInput).on('keypress', function(evt) {
			if(evt.which == 13) {
				doVerifyForm();
			};
		});

		let filterFormRow = $('<div id="DicomFilterForm" style="display: table-row; width: 100%;"></div>');
		let studyDateCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(studyDateCell).append($(studyFromDateInput));
		$(studyDateCell).append($('<span style="margin-left: 5px; margin-right: 2px; display: inline-block;">-</span>'));
		$(studyDateCell).append($(studyToDateInput));
		let patentHNCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(patentHNCell).append($(patientHNInput));
		let patentNameCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(patentNameCell).append($(patientNameInput));
		let modalityCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(modalityCell).append($(modalityInput));
		let scanPartCell = $('<div style="display: table-cell; text-align: left;" class="header-cell"></div>');
		$(scanPartCell).append($(scanPartInput));

		$(filterFormRow).append($('<div style="display: table-cell; text-align: left;" class="header-cell"></div>'));
		$(filterFormRow).append($(studyDateCell));
		$(filterFormRow).append($(patentHNCell));
		$(filterFormRow).append($(patentNameCell));
		$(filterFormRow).append($('<div style="display: table-cell; text-align: left;" class="header-cell"></div>'));
		$(filterFormRow).append($(modalityCell));
		$(filterFormRow).append($(scanPartCell));

		const doVerifyForm = function(){
			let studyFromDateValue = $(studyFromDateInput).val();
			let studyToDateValue = $(studyToDateInput).val();
			let patientNameValue = $(patientNameInput).val();
			let patientHNValue = $(patientHNInput).val();
			let modalityValue = $(modalityInput).val();
			let scanPartValue = $(scanPartInput).val();

			if ((studyFromDateValue === '') && (studyToDateValue === '') && (patientNameValue === '') && (patientHNValue === '') && (modalityValue === '') && (scanPartValue === '')){
				$(studyFromDateInput).css('border', '1px solid red');
				$(studyToDateInput).css('border', '1px solid red');
				$(patientHNInput).css('border', '1px solid red');
				$(patientNameInput).css('border', '1px solid red');
				$(modalityInput).css('border', '1px solid red');
				$(scanPartInput).css('border', '1px solid red');
			} else {
				$(studyFromDateInput).css('border', '');
				$(studyToDateInput).css('border', '');
				$(patientHNInput).css('border', '');
				$(patientNameInput).css('border', '');
				$(modalityInput).css('border', '');
				$(scanPartInput).css('border', '');

				let stdfdf = studyFromDateValue;
				if (studyFromDateValue !== '*') {
					let yy = studyFromDateValue.substr(6, 4);
					let mo = studyFromDateValue.substr(3, 2);
					let dd = studyFromDateValue.substr(0, 2);
					stdfdf = yy + mo + dd;
				}
				let stdtdf = studyToDateValue;
				if (studyToDateValue !== '*') {
					let yy = studyToDateValue.substr(6, 4);
					let mo = studyToDateValue.substr(3, 2);
					let dd = studyToDateValue.substr(0, 2);
					stdtdf = yy + mo + dd;
				}
				let filterValue = {studyFromDate: stdfdf, studyToDate: stdtdf, patientName: patientNameValue, patientHN: patientHNValue, modality: modalityValue, scanPart: scanPartValue};
				execCallback(filterValue);
			}
		}

		return $(filterFormRow);
	}

	const doSaveQueryDicom = function(filterData){
	  let searchQuery = {Level: "Study", Expand: true};
	  let dicomQuery = {};
		if (filterData.studyFromDate) {
	    dicomQuery.StudyFromDate = filterData.studyFromDate;
	  }
		if (filterData.studyToDate) {
	    dicomQuery.StudyToDate = filterData.studyToDate;
	  }
	  if (filterData.patientName) {
	    dicomQuery.PatientName = filterData.patientName;
	  }
	  if (filterData.patientHN) {
	    dicomQuery.PatientID = filterData.patientHN;
	  }
		if (filterData.modality) {
	    dicomQuery.Modality = filterData.modality;
	  }
	  if (filterData.scanPart) {
	    dicomQuery.ScanPart = filterData.scanPart;
	  }
	  searchQuery.Query = dicomQuery;
	  localStorage.setItem('dicomfilter', JSON.stringify(searchQuery));
	}

	const dicomFilterLogic = function(logicPairs){
		return new Promise(function(resolve, reject) {
			if (logicPairs.length == 0) {
				resolve(true);
			} else {
				let logicAns = true;
				let	promiseList = new Promise(function(resolve2, reject2){
					for (let i=0; i < logicPairs.length; i++){
						let pair = logicPairs[i];

						let realKey = pair.key;
						let indexAt = realKey.indexOf('*');
		        if (indexAt == 0) {
		          realKey = realKey.substring(1);
		        } else if (indexAt == (realKey.length-1)) {
							realKey = realKey.substring(0, (realKey.length-1));
						} else {
							realKey = realKey;
						}
						let key = realKey;
						let value = pair.value;
						let op = pair.op;
						switch (op) {
				      case '==':
				        logicAns = logicAns && (value.indexOf(key) >= 0);
				      break;
				      case '>=':
				        logicAns = logicAns && (value >= key);
				      break;
				      case '<=':
								logicAns = logicAns && (value <= key);
							break;
						}
					}
					setTimeout(()=>{
						resolve2(logicAns);
					}, 10);
				});
				Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
			}
		});
	}

	const doFilterDicom = function(dicoms, query){
		return new Promise(function(resolve, reject) {
			let studyFromDate = query.StudyFromDate;
			let studyToDate = query.StudyToDate;
			let modality = query.Modality;
			let patientName = query.PatientName;
			let patientID = query.PatientID;
			let scanPart = query.ScanPart;

			let studies = [];

			let	promiseList = new Promise(async function(resolve2, reject2){
				let i = 0;
				while ( i < dicoms.length ) {
					let keyPairs = [];
					let studyTag = dicoms[i];

					let studyDateValue = studyTag.MainDicomTags.StudyDate;
					let modalityValue = studyTag.SamplingSeries.MainDicomTags.Modality;
					let patientNameValue = studyTag.PatientMainDicomTags.PatientName;
					let patientIDValue = studyTag.PatientMainDicomTags.PatientID;
					let studyDescriptionValue = studyTag.MainDicomTags.StudyDescription;
					let protocolNameValue = studyTag.SamplingSeries.MainDicomTags.ProtocolName;

					if ((studyFromDate) && (studyFromDate !== '*')) {
						if ((studyToDate) && (studyToDate !== '*')) {
							let fromPair = {value: studyDateValue, key: studyFromDate, op: '>='};
							let toPair = {value: studyDateValue, key: studyToDate, op: '<='};
							keyPairs.push(fromPair);
							keyPairs.push(toPair);
						} else {
							let fromPair = {value: studyDateValue, key: studyFromDate, op: '=='};
							keyPairs.push(fromPair);
						}
					} else {
						if ((studyToDate) && (studyToDate !== '*')) {
							let toPair = {value: studyDateValue, key: studyToDate, op: '<='};
							keyPairs.push(toPair);
						}
					}

					if ((modality) && (modality !== '*')) {
						let modPair = {value: modalityValue, key: modality, op: '=='};
						keyPairs.push(modPair);
					}


					if ((patientName) && (patientName !== '*')) {
						let patientNamePair = {value: patientNameValue, key: patientName, op: '=='};
						keyPairs.push(patientNamePair);
					}


					if ((patientID) && (patientID !== '*')) {
						let patientIDPair = {value: patientIDValue, key: patientID, op: '=='};
						keyPairs.push(patientIDPair);
					}

					if ((scanPart) && (scanPart !== '*')) {
						let scanPartPair = undefined;
						if ((studyDescriptionValue) && (studyDescriptionValue !== '')){
							scanPartPair = {value: studyDescriptionValue, key: scanPart, op: '=='};
						} else if ((protocolNameValue) && (protocolNameValue !== '')){
							scanPartPair = {value: protocolNameValue, key: scanPart, op: '=='};
						} else {
							scanPartPair = {value: '', key: scanPart, op: '=='};
						}
						keyPairs.push(scanPartPair);
					}


					let filterCheck = await dicomFilterLogic(keyPairs);
					if(filterCheck == true){
						studies.push(studyTag);
					}

					i++;
				}
				setTimeout(()=>{
          resolve2(studies);
        }, 1100);
			});
			Promise.all([promiseList]).then(async(ob)=>{
				await ob[0].sort((a,b) => {
					let av = util.getDatetimeValue(a.MainDicomTags.StudyDate, a.MainDicomTags.StudyTime);
					let bv = util.getDatetimeValue(b.MainDicomTags.StudyDate, b.MainDicomTags.StudyTime);
					if (av && bv) {
						return bv - av;
					} else {
						return 0;
					}
				});
				resolve(ob[0]);
			});
		});
	}

	const doUserLogout = function(wsm) {
	  if (wsm) {
	  	let userdata = JSON.parse(localStorage.getItem('userdata'));
	    wsm.send(JSON.stringify({type: 'logout', username: userdata.username}));
	  }
	  localStorage.removeItem('token');
		localStorage.removeItem('userdata');
		localStorage.removeItem('masternotify');
		//localStorage.removeItem('dicomfilter');
	  let url = '/index.html';
	  window.location.replace(url);
	}

  const doOpenStoneWebViewer = function(StudyInstanceUID, hosId) {
		//const orthancWebviewerUrl = 'http://' + window.location.hostname + ':8042/web-viewer/app/viewer.html?series=';
		let hospitalId = undefined;
		if (hosId) {
			hospitalId = hosId;
		} else {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			hospitalId = userdata.hospitalId;
		}
		apiconnector.doGetOrthancPort(hospitalId).then((response) => {
			//const orthancStoneWebviewer = 'http://'+ window.location.hostname + ':' + response.port + '/stone-webviewer/index.html?study=';
			const orthancStoneWebviewer = 'http://'+ response.ip + ':' + response.port + '/stone-webviewer/index.html?study=';
			let orthancwebapplink = orthancStoneWebviewer + StudyInstanceUID + '&user=' + userdata.username;
			window.open(orthancwebapplink, '_blank');
		});
	}

  const doDownloadDicom = function(studyID, dicomFilename){
		$('body').loading('start');
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		const hospitalId = userdata.hospitalId;
  	apiconnector.doCallDownloadDicom(studyID, hospitalId).then((response) => {
  		console.log(response);
  		//let openLink = response.archive.link;
  		//window.open(openLink, '_blank');
			var pom = document.createElement('a');
			pom.setAttribute('href', response.link);
			pom.setAttribute('download', dicomFilename);
			pom.click();
			$('body').loading('stop');
  	}).catch((err)=>{
			console.log(err);
			$('body').loading('stop');
		})
  }

	const doDownloadLocalDicom = function(studyID, dicomFilename){
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			const dicomUrl = '/api/orthanc/download/dicom/archive';
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {StudyID: studyID, UsrArchiveFileName: dicomFilename});
			//console.log(dicomStudiesRes);
			var pom = document.createElement('a');
			pom.setAttribute('href', dicomStudiesRes.result.archive);
			pom.setAttribute('download', dicomFilename);
			pom.click();
			resolve(dicomStudiesRes.result);
			$('body').loading('stop');
		});
	}

	const doDeleteLocalDicom = function(studyID){
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			const dicomUrl = '/api/orthanc/delete/study';
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {StudyID: studyID});
			resolve(dicomStudiesRes.result);
			$('body').loading('stop');
		});
	}

	const doCountImageLocalDicom = function(studyID){
		return new Promise(async function(resolve, reject) {
			$('body').loading('start');
			const dicomUrl = '/api/orthanc/study/count/instances';
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {StudyID: studyID});
			resolve(dicomStudiesRes.result);
			$('body').loading('stop');
		});
	}

  const doPreparePatientParams = function(newCaseData){
		let rqParams = {};
		let patientFragNames = newCaseData.patientNameEN.split(' ');
		let patientNameEN = patientFragNames[0];
		let patientLastNameEN = patientFragNames[0];
		if (patientFragNames.length >= 2) {
			if (patientFragNames[1] !== '') {
				patientLastNameEN = patientFragNames[1];
			} else {
				let foundNotBlank = patientFragNames.find((item, i) =>{
					if (i > 1) {
						if (patientFragNames[i] !== '') {
							return item;
						}
					}
				});
				if (foundNotBlank){
					patientLastNameEN = foundNotBlank;
				} else {
					patientLastNameEN = patientNameEN;
				}
			}
		}
		patientFragNames = newCaseData.patientNameTH.split(' ');
		let patientNameTH = patientFragNames[0];
		let patientLastNameTH = patientFragNames[0];
		if (patientFragNames.length >= 2) {
			if (patientFragNames[1] !== '') {
				patientLastNameTH = patientFragNames[1];
			} else {
				let foundNotBlank = patientFragNames.find((item, i) =>{
					if (i > 1) {
						if (patientFragNames[i] !== '') {
							return item;
						}
					}
				});
				if (foundNotBlank){
					patientLastNameTH = foundNotBlank;
				} else {
					patientLastNameTH = patientNameTH;
				}
			}
		}
		rqParams.Patient_HN = newCaseData.hn;
		rqParams.Patient_NameTH = patientNameTH;
		rqParams.Patient_LastNameTH = patientLastNameTH;
		rqParams.Patient_NameEN = patientNameEN;
		rqParams.Patient_LastNameEN = patientLastNameEN;
		rqParams.Patient_CitizenID = newCaseData.patientCitizenID;
		rqParams.Patient_Birthday = '';
		rqParams.Patient_Age = newCaseData.patientAge;
		rqParams.Patient_Sex = newCaseData.patientSex;
		rqParams.Patient_Tel = '';
		rqParams.Patient_Address = '';
		return rqParams;
	}

  const doPrepareCaseParams = function(newCaseData) {
		let rqParams = {};
		rqParams.Case_OrthancStudyID = newCaseData.studyID;
		rqParams.Case_ACC = newCaseData.acc;
		rqParams.Case_BodyPart = newCaseData.bodyPart;
		rqParams.Case_ScanPart = newCaseData.scanpartItems;
		rqParams.Case_Modality = newCaseData.mdl;
		rqParams.Case_Manufacturer = newCaseData.manufacturer;
		rqParams.Case_ProtocolName = newCaseData.protocalName;
		rqParams.Case_StudyDescription  = newCaseData.studyDesc;
		rqParams.Case_StationName = newCaseData.stationName
		rqParams.Case_PatientHRLink = newCaseData.patientHistory;
		rqParams.Case_RadiologistId = newCaseData.drReader
		rqParams.Case_RefferalId = newCaseData.drOwner;
		rqParams.Case_RefferalName = '';
		rqParams.Case_Price = newCaseData.price;
		rqParams.Case_Department =  newCaseData.department;
		rqParams.Case_DESC = newCaseData.detail;
		rqParams.Case_StudyInstanceUID = newCaseData.studyInstanceUID
		return rqParams;
	}

	const doGetSeriesList = function(studyId) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			const dicomUrl = '/api/dicomtransferlog/select/' + studyId;
			let rqParams = {hospitalId: hospitalId, username: username};
			let dicomStudiesRes = await doCallApi(dicomUrl, rqParams);
			if (dicomStudiesRes.orthancRes.length > 0) {
				resolve(dicomStudiesRes.orthancRes[0].StudyTags);
			} else {
				resolve()
			}
		});
	}

	const doGetLocalSeriesList = function(studyId) {
		return new Promise(async function(resolve, reject) {
			const dicomUrl = '/api/orthanc/select/study/' + studyId;
			let dicomStudiesRes = await doCallLocalApi(dicomUrl, {});
			resolve(dicomStudiesRes.result);
		});
	}

	const doGetOrthancStudyDicom = function(studyId) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let rqBody = '{"Level": "Study", "Expand": true, "Query": {"PatientName":"TEST"}}';
			let orthancUri = '/studies/' + studyId;
	  	let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
	  	let orthancRes = await apiconnector.doCallOrthancApiByProxy(params);
			resolve(orthancRes);
		});
	}

	const doGetOrthancSeriesDicom = function(seriesId) {
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let rqBody = '{"Level": "Series", "Expand": true, "Query": {"PatientName":"TEST"}}';
			let orthancUri = '/series/' + seriesId;
	  	let params = {method: 'get', uri: orthancUri, body: rqBody, hospitalId: hospitalId};
	  	let orthancRes = await apiconnector.doCallOrthancApiByProxy(params);
			resolve(orthancRes);
		});
	}

	const doGetLocalOrthancSeriesDicom = function(seriesId) {
		return new Promise(async function(resolve, reject) {
			const dicomUrl = '/api/orthanc/select/series/' + seriesId;
			let dicomSeriesRes = await doCallLocalApi(dicomUrl, {});
			resolve(dicomSeriesRes.result);
		});
	}

	const doCallCreatePreviewSeries = function(seriesId, instanceList){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let params = {hospitalId: hospitalId, seriesId: seriesId, username: username, instanceList: instanceList};
			let apiurl = '/api/orthancproxy/create/preview';
			let orthancRes = await apiconnector.doCallApi(apiurl, params)
			resolve(orthancRes);
		});
	}

	const doCallCreateZipInstance = function(seriesId, instanceId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let username = userdata.username;
			let params = {hospitalId: hospitalId, seriesId: seriesId, username: username, instanceId: instanceId};
			let apiurl = '/api/orthancproxy/create/zip/instance';
			let orthancRes = await apiconnector.doCallApi(apiurl, params)
			resolve(orthancRes);
		});
	}

	const doCallSendAI = function(seriesId, instanceId, studyId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let params = { userId: userdata.id, hospitalId: userdata.hospitalId, seriesId: seriesId, instanceId: instanceId, studyId: studyId};
			let apiurl = '/api/orthancproxy/sendai';
			try {
				let orthancRes = await apiconnector.doCallApi(apiurl, params)
				resolve(orthancRes);
			} catch (err) {
				reject(err);
			}
		});
	}

	const doConvertAIResult = function(studyId, pdfcodes, modality){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let params = {hospitalId: userdata.hospitalId, username: userdata.id, studyId: studyId, pdfcodes: pdfcodes, modality: modality};
			let apiurl = '/api/orthancproxy/convert/ai/report';
			let orthancRes = await apiconnector.doCallApi(apiurl, params)
			resolve(orthancRes);
		});
	}

	const doCallAIResultLog = function(studyId){
		return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let params = { userId: userdata.id, studyId: studyId};
			let apiurl = '/api/ailog/select/' + studyId;
			let aiLogRes = await apiconnector.doCallApi(apiurl, params)
			resolve(aiLogRes);
		});
	}

	const doUpdateCaseStatus = function(id, newStatus, newDescription){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, caseId: id, casestatusId: newStatus, caseDescription: newDescription};
			let apiUrl = '/api/cases/status/' + id;
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doUpdateCaseStatusByShortCut = function(id, newStatus, newDescription){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, caseId: id, casestatusId: newStatus, caseDescription: newDescription};
			let apiUrl = '/api/cases/status/shortcut/' + id;
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doUpdateConsultStatus = function(id, newStatus){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, consultId: id, casestatusId: newStatus};
			let apiUrl = '/api/consult/status/' + id;
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doCreateNewCustomUrgent = function(ugData){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let acceptStep = {dd: ugData.Accept.dd, hh: ugData.Accept.hh, mn: ugData.Accept.mn};
			let workingStep = {dd: ugData.Working.dd, hh: ugData.Working.hh, mn: ugData.Working.mn};
			let ugTypeData = {UGType: 'custom', UGType_Name: 'กำหนดเอง', UGType_ColorCode: '', UGType_AcceptStep: JSON.stringify(acceptStep), UGType_WorkingStep: JSON.stringify(workingStep), hospitalId: hospitalId};
			let rqData = {data: ugTypeData};
			let apiUrl = '/api/urgenttypes/add';
			try {
				let response = await doCallApi(apiUrl, rqData);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doCallSelectUrgentType = function(urgentId){
		return new Promise(async function(resolve, reject) {
			let apiUrl = '/api/urgenttypes/select/' + urgentId;
			let rqParams = {};
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doUpdateCustomUrgent = function(ugData, ugentId) {
		return new Promise(async function(resolve, reject) {
			let acceptStep = {dd: ugData.Accept.dd, hh: ugData.Accept.hh, mn: ugData.Accept.mn};
			let workingStep = {dd: ugData.Working.dd, hh: ugData.Working.hh, mn: ugData.Working.mn};
			let ugTypeData = {UGType_AcceptStep: JSON.stringify(acceptStep), UGType_WorkingStep: JSON.stringify(workingStep)};
			let rqParams = {id: ugentId, data: ugTypeData};
			let apiUrl = '/api/urgenttypes/update';
			try {
				let response = await doCallApi(apiUrl, ugTypeData);
				resolve(response);
			} catch(e) {
				reject(e);
			}
		});
	}

	const doLoadScanpartAux = function(studyDesc, protocolName){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));
			let hospitalId = userdata.hospitalId;
			let userId = userdata.id;
			let rqParams = { hospitalId: hospitalId, userId: userId, studyDesc: studyDesc, protocolName: protocolName};
			let apiUrl = '/api/scanpartaux/select';
			try {
				let response = await doCallApi(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doFillSigleDigit = function(x) {
		if (Number(x) < 10) {
			return '0' + x;
		} else {
			return '' + x;
		}
	}

	const doDisplayCustomUrgentResult = function(dd, hh, mn, fromDate) {
		let totalShiftTime = (dd * 24 * 60 * 60 * 1000) + (hh * 60 * 60 * 1000) + (mn * 60 * 1000);
		let atDate;
		if (fromDate) {
			atDate = new Date(fromDate);
		} else {
			atDate = new Date();
		}
		let atTime = atDate.getTime() + totalShiftTime;
		atTime = new Date(atTime);
		let YY = atTime.getFullYear();
		let MM = doFillSigleDigit(atTime.getMonth() + 1);
		let DD = doFillSigleDigit(atTime.getDate());
		let HH = doFillSigleDigit(atTime.getHours());
		let MN = doFillSigleDigit(atTime.getMinutes());
		let td = `${YY}-${MM}-${DD} : ${HH}.${MN}`;
		return td;
	}

	const doFormatDateTimeCaseCreated = function(createdAt) {
		let atTime = new Date(createdAt);
		let YY = atTime.getFullYear();
		let MM = doFillSigleDigit(atTime.getMonth() + 1);
		let DD = doFillSigleDigit(atTime.getDate());
		let HH = doFillSigleDigit(atTime.getHours());
		let MN = doFillSigleDigit(atTime.getMinutes());
		let td = `${YY}-${MM}-${DD} : ${HH}.${MN}`;
		return td;
	}

	const formatNumberWithCommas = function(x) {
		if (x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		} else {
			return undefined;
		}
	}

	const doRenderScanpartSelectedBox = function(scanparts) {
		return new Promise(async function(resolve, reject) {
			const doCreateHeaderField = function() {
	      let headerFieldRow = $('<div style="display: table-row;  width: 100%; border: 2px solid black; background-color: ' + headBackgroundColor + '; color: white;"></div>');
				let fieldCell = $('<div style="display: table-cell; padding: 2px;">ลำดับที่</div>');
	      $(fieldCell).appendTo($(headerFieldRow));
	      fieldCell = $('<div style="display: table-cell; padding: 2px;">รหัส</div>');
	      $(fieldCell).appendTo($(headerFieldRow));
	      fieldCell = $('<div style="display: table-cell; padding: 2px;">ชื่อ</div>');
	      $(fieldCell).appendTo($(headerFieldRow));
	      fieldCell = $('<div style="display: table-cell; padding: 2px;">ราคา</div>');
	      $(fieldCell).appendTo($(headerFieldRow));
	      return $(headerFieldRow);
	    };

			let selectedBox = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let headerFieldRow = doCreateHeaderField();
			$(headerFieldRow).appendTo($(selectedBox));
			await scanparts.forEach((item, i) => {
				let itemRow = $('<div style="display: table-row;  width: 100%; border: 2px solid black; background-color: #ccc;"></div>');
				$(itemRow).appendTo($(selectedBox));
				let itemCell = $('<div style="display: table-cell; padding: 2px;">' + (i+1) + '</div>');
				$(itemCell).appendTo($(itemRow));
				itemCell = $('<div style="display: table-cell; padding: 2px;">' + item.Code + '</div>');
				$(itemCell).appendTo($(itemRow));
				itemCell = $('<div style="display: table-cell; padding: 2px;">' + item.Name + '</div>');
				$(itemCell).appendTo($(itemRow));
				itemCell = $('<div style="display: table-cell; padding: 2px; text-align: right;">' + formatNumberWithCommas(item.Price) + '</div>');
				$(itemCell).appendTo($(itemRow));
			});
			resolve($(selectedBox));
		});
	}

	const getPatientFullNameEN = function (patientId) {
		return new Promise(async function(resolve, reject) {
			let rqParams = {patientId: patientId};
			let apiUrl = '/api/patient/fullname/en/' + patientId;
			try {
				//let response = await doCallApi(apiUrl, rqParams);
				let response = await apiconnector.doCallApiDirect(apiUrl, rqParams);
				resolve(response);
			} catch(e) {
	      reject(e);
    	}
		});
	}

	const doRenderScanpartSelectedAbs = function (scanparts) {
		return new Promise(async function(resolve, reject) {
			let scanPartBox = $('<div class="scanpart-box"></div>');
			let	promiseList = new Promise(function(resolve2, reject2){
				let joinText = '';
				for (let i=0; i < scanparts.length; i++){
					let item = scanparts[i];
					if (i != (scanparts.length-1)) {
						joinText += item.Name + ' / ';
					} else {
						joinText += item.Name;
					}
					/*
					if ((item.DF) && (item.DF !== '')) {
						joinText += ' ' + item.DF + ' บ.';
					}
					*/
				}
				$(scanPartBox).append($('<div>' + joinText + '</div>'));
				setTimeout(()=>{
          resolve2($(scanPartBox));
        }, 100);
      });
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doExtractList = function(originList, from, to) {
		return new Promise(async function(resolve, reject) {
			let exResults = [];
			let	promiseList = new Promise(function(resolve2, reject2){
				for (let i = (from-1); i < to; i++) {
					if (originList[i]){
						exResults.push(originList[i]);
					}
				}
				setTimeout(()=>{
          resolve2(exResults);
        }, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreateCaseCmd = function(cmd, data, clickCallbak) {
		const cmdIcon = $('<img class="pacs-command" data-toggle="tooltip"/>');
		switch (cmd) {
			case 'view':
			$(cmdIcon).attr('src','/images/pdf-icon.png');
			$(cmdIcon).attr('title', 'Open Result Report.');
			break;

			case 'print':
			$(cmdIcon).attr('src','/images/print-icon.png');
			$(cmdIcon).attr('title', 'Print Result Report.');
			break;

			case 'convert':
			$(cmdIcon).attr('src','/images/convert-icon.png');
			$(cmdIcon).attr('title', 'Convert Result Report to Synapse (PACS).');
			break;

			case 'callzoom':
			$(cmdIcon).attr('src','/images/zoom-black-icon.png');
			$(cmdIcon).attr('title', 'Call Radiologist by zoom App.');
			break;

			case 'upd':
			$(cmdIcon).attr('src','/images/update-icon.png');
			$(cmdIcon).attr('title', 'Update Case data.');
			break;

			case 'delete':
			$(cmdIcon).attr('src','/images/delete-icon.png');
			$(cmdIcon).attr('title', 'Delete Case.');
			break;

			case 'ren':
			$(cmdIcon).attr('src','/images/renew-icon.png');
			$(cmdIcon).attr('title', 'Re-New Case.');
			break;

			case 'cancel':
			$(cmdIcon).attr('src','/images/cancel-icon.png');
			$(cmdIcon).attr('title', 'Cancel Case.');
			break;

			case 'edit':
			$(cmdIcon).attr('src','/images/status-icon.png');
			$(cmdIcon).attr('title', 'Edit Result.');
			break;

			case 'close':
			$(cmdIcon).attr('src','/images/closed-icon.png');
			$(cmdIcon).attr('title', 'Edit Result.');
			break;

		}
		$(cmdIcon).on('click', (evt)=>{
			clickCallbak(data);
		});
		return $(cmdIcon);
	}

	const doCallMyUserTasksCase = function(){
    return new Promise(async function(resolve, reject) {
			const userdata = JSON.parse(localStorage.getItem('userdata'));
			let userId = userdata.id;
			let username = userdata.username;
			let rqParams = {userId: userId, username: username, statusId: caseReadWaitStatus};
			let apiUrl = '/api/tasks/filter/user/' + userId;
			try {
				let response = await doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

	const doFindTaksOfCase = function(tasks, caseId){
		return new Promise(async function(resolve, reject) {
			if (tasks) {
				let task = await tasks.find((item)=>{
					if (item.caseId == caseId) return item;
				});
				resolve(task);
			} else {
				resolve();
			}
		});
	}

	const doCreateLegentCmd = function(legentCmdClickCallback){
		let legentCmd = $('<img src="/images/question-icon.png" style="width: 25px; height: auto; padding: 1px; border: 2px solid #ddd; cursor: pointer; margin-top: 0px;" data-toggle="tooltip" title="วิธีพิมพ์ป้อน Study Description"/>');
		$(legentCmd).hover(()=>{
			$(legentCmd).css({'border': '2px solid grey'});
		},()=>{
			$(legentCmd).css({'border': '2px solid #ddd'});
		});
		$(legentCmd).on('click', (evt)=>{
			//doShowLegentCmdClick(evt);
			legentCmdClickCallback(evt);
		});
		let legentCmdBox = $('<span style="margin-left: 10px;"></span>');
		return $(legentCmdBox).append($(legentCmd));
	}

	const doShowStudyDescriptionLegentCmdClick = function(evt){
		const content = $('<div></div>');
		$(content).append($('<p>พิมพ์รายการ Study Description แต่ล่ะรายการ โดยคั่นด้วยเครื่องหมาย Comma (,)</p>'));
		const radalertoption = {
			title: 'วิธีพิมพ์ป้อน Study Description',
			msg: $(content),
			width: '610px',
			onOk: function(evt) {
				radAlertBox.closeAlert();
			}
		}
		let radAlertBox = $('body').radalert(radalertoption);
		$(radAlertBox.cancelCmd).hide();
	}

	const doScrollTopPage = function(){
		$("html, body").animate({ scrollTop: 0 }, "slow");
	  return false;
	}

	const genUniqueID = function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4();
	}

	const onSimpleEditorPaste = function(evt){
		let pathElems = evt.originalEvent.path;
		let simpleEditorPath = pathElems.find((path)=>{
			if (path.className === 'jqte_editor') {
				return path;
			}
		});
		if (simpleEditorPath) {
			evt.stopPropagation();
			evt.preventDefault();
			let clipboardData = evt.originalEvent.clipboardData || window.clipboardData;
			let textPastedData = clipboardData.getData('text');
			let htmlPastedData = clipboardData.getData('text/html');
			let htmlFormat = htmlformat(htmlPastedData);

			let caseData = $('#SimpleEditorBox').data('casedata');
			let simpleEditor = $('#SimpleEditorBox').find('#SimpleEditor');
			let oldContent = $(simpleEditor).val();
			if ((htmlFormat) && (htmlFormat !== '')) {
				htmlFormat = doExtractHTMLFromAnotherSource(htmlFormat);
				document.execCommand('insertHTML', false, htmlFormat);
				let newContent = oldContent + htmlFormat;
				let draftbackup = {caseId: caseData.caseId, content: newContent, backupAt: new Date()};
				localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
				$('#SimpleEditorBox').trigger('draftbackupsuccess', [draftbackup]);
			} else {
				if ((textPastedData) && (textPastedData !== '')) {
					textPastedData = doExtractHTMLFromAnotherSource(textPastedData);
					document.execCommand('insertText', false, textPastedData);
					let newContent = oldContent + textPastedData;
					let draftbackup = {caseId: caseData.caseId, content: newContent, backupAt: new Date()};
					localStorage.setItem('draftbackup', JSON.stringify(draftbackup));
					$('#SimpleEditorBox').trigger('draftbackupsuccess', [draftbackup]);
				}
			}
			//console.log(localStorage.getItem('draftbackup'));
		}
	}

	const doExtractHTMLFromAnotherSource = function(anotherText){
		let startPointText = '<!--StartFragment-->';
		let endPointText = '<!--EndFragment-->';
		let tempToken = anotherText.replace('\n', '');
		let startPosition = tempToken.indexOf(startPointText);
		if (startPosition >= 0) {
			let endPosition = tempToken.indexOf(endPointText);
			tempToken = tempToken.slice((startPosition+20), (endPosition));
		}
		/*
		tempToken = tempToken.split(startPointText).join('<div>');
		tempToken = tempToken.split(endPointText).join('</div>');
		*/
		tempToken = tempToken.replace(startPointText, '<div>');
		tempToken = tempToken.replace(endPointText, '</div>');
		return tempToken;
	}

	const doCallLoadStudyTags = function(hospitalId, studyId){
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

	const doReStructureDicom = function(hospitalId, studyId, dicom){
		return new Promise(async function(resolve, reject) {
			let params = {hospitalId: hospitalId, resourceId: studyId, resourceType: "study", dicom: dicom};
			let restudyUrl = '/api/dicomtransferlog/add';
			$.post(restudyUrl, params).then((response) => {
				resolve(response);
			});
		});
	}

	const doCheckOutTime = function(d){
		let date = new Date(d);
		let hh = date.getHours();
		let mn = date.getMinutes();
		if (hh < 8) {
			return true;
		} else {
			if (hh == 8) {
				if (mn == 0) {
					return true;
				} else {
					return false;
				}
			} else {
				return false;
			}
		}
	}

	const doCallPriceChart = function(hospitalId, scanpartId){
    return new Promise(async function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      //let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let rqParams = {userId: userId, hospitalId: hospitalId, scanpartId: scanpartId};
      let apiUrl = '/api/pricechart/find';
			let response = await doGetApi(apiUrl, rqParams);
			resolve(response);
    });
  }

  return {
		/* Constant share */
		caseReadWaitStatus,
		caseResultWaitStatus,
		casePositiveStatus,
		caseNegativeStatus,
		caseReadSuccessStatus,
		caseAllStatus,
		allCaseStatus,
		allCaseStatusForRadio,
		defaultProfile,
		dicomTagPath,
		pageLineStyle,
		headBackgroundColor,
		jqteConfig,
		modalitySelectItem,
		sizeA4Style,
		quickReplyDialogStyle,
		quickReplyContentStyle,
		/* Function share */
		doCallApi,
		doGetApi,
		doCallLocalApi,
		doGetLocalApi,
		doCreateDicomFilterForm,
		doSaveQueryDicom,
		doFilterDicom,
		doUserLogout,
		doOpenStoneWebViewer,
		doDownloadDicom,
		doDownloadLocalDicom,
		doDeleteLocalDicom,
		doCountImageLocalDicom,
    doPreparePatientParams,
    doPrepareCaseParams,
		doGetSeriesList,
		doGetLocalSeriesList,
		doGetOrthancStudyDicom,
		doGetOrthancSeriesDicom,
		doGetLocalOrthancSeriesDicom,
		doCallCreatePreviewSeries,
		doCallCreateZipInstance,
		doCallSendAI,
		doConvertAIResult,
		doCallAIResultLog,
		doUpdateCaseStatus,
		doUpdateCaseStatusByShortCut,
		doUpdateConsultStatus,
		doCreateNewCustomUrgent,
		doCallSelectUrgentType,
		doUpdateCustomUrgent,
		doLoadScanpartAux,
		doFillSigleDigit,
		doDisplayCustomUrgentResult,
		doFormatDateTimeCaseCreated,
		formatNumberWithCommas,
		getPatientFullNameEN,
		doRenderScanpartSelectedBox,
		doRenderScanpartSelectedAbs,
		doExtractList,
		doCreateCaseCmd,
		doCallMyUserTasksCase,
		doFindTaksOfCase,
		doCreateLegentCmd,
		doShowStudyDescriptionLegentCmdClick,
		doScrollTopPage,
		genUniqueID,
		onSimpleEditorPaste,
		doCallLoadStudyTags,
		doReStructureDicom,
		doCheckOutTime,
		doCallPriceChart
	}
}
