/*case-creator.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const util = require('../../../case/mod/utilmod.js')($);
  const common = require('../../../case/mod/commonlib.js')($);
  const newreffuser = require('../../../case/mod/createnewrefferal.js')($);
	const submain = require('./submainlib.js')($);

  const phProp = {
    attachFileUploadApiUrl: 'https://radconnext.info/api/uploadpatienthistory',
    scannerUploadApiUrl: 'https://radconnext.info/api/scannerupload',
    captureUploadApiUrl: 'https://radconnext.info/api/captureupload',
    attachFileUploadIconUrl: '/images/paperclip-icon.png',
    scannerUploadIconUrl: '/images/scanner-icon.png',
    captureUploadIconUrl: '/images/screen-capture-icon.png',
    attachFileToggleTitle: 'คลิกเพื่อแนบไฟล์',
    scannerUploadToggleTitle: 'คลิกเพื่อสแกนภาพจากสแกนเนอร์',
    captureUploadToggleTitle: 'คลิกเพื่อแคปเจอร์ภาพหน้าจอ'
  };

  const fmtStr = function (str) {
    var args = [].slice.call(arguments, 1);
    var i = 0;
    return str.replace(/%s/g, () => args[i++]);
  }

  function doVerifyNewCaseDataFirstStep(form, scanparts){
    let patientNameEN = $(form).find('#PatientNameEN').val();
    let patientNameTH = $(form).find('#PatientNameTH').val();
    let hn = $(form).find('#HN').val();
    let sex = $(form).find('#Sex').val();
    let age = $(form).find('#age').val();
    let acc = $(form).find('#ACC').val();
		let citizenID = $(form).find('#CitizenID').val();
    let cliameright = $(form).find('#Cliameright').val();
    let bodypart = $(form).find('#Bodypart').val();
    let price = 0;
    //if (!(/^[a-zA-Z]\w{1,65}$/.test(patientNameEN))) {
		if (!(/[a-zA-Z\s]+$/.test(patientNameEN))) {
      $(form).find('#PatientNameEN').css("border","4px solid red");
      $(form).find('#PatientNameEN').notify("ชื่อผู้ป่วยภาษาอังกฤษ ต้องไม่มีอักษรภาษาไทย พิมพ์ ชื่อ เว้นวรรค นามสกุล", "error");
      $(form).find('#PatientNameEN').focus();
      return false;
    } else if (hn === '') {
      $(form).find('#PatientNameEN').css("border","");
      $(form).find('#HN').css("border","4px solid red");
      $(form).find('#HN').notify("HN ผู้ป่วยต้องไม่เว้นว่าง", "error");
      $(form).find('#HN').focus();
      return false;
    } else if (age === '') {
      $(form).find('#HN').css("border","");
      $(form).find('#Age').css("border","4px solid red");
      $(form).find('#Age').notify("อายุผู้ป่วยต้องไม่เว้นว่าง", "error");
      $(form).find('#Age').focus();
      return false;
    } else if (bodypart === '') {
      $(form).find('#Age').css("border","");
      $(form).find('#Bodypart').css("border","4px solid red");
      $(form).find('#Bodypart').notify("Study Desc. / Protocol Name ต้องไม่เว้นว่าง", "error");
      $(form).find('#Bodypart').focus();
      return false;
		} else if (scanparts.length == 0) {
			$(form).notify("ต้องมี Scan Part อย่างน้อย 1 รายการ โปรดคลิกที่ปุ่ม เพิ่ม/ลด/แก้ไข Scan Part", "error");
			return false;
    } else {
      return true;
    }
  }

  function doVerifyNewCaseDataSecondStep(form, radioSelected){
		let department = $(form).find('#Department').val();
    let refferal = $(form).find('#Refferal').val();
    let urgenttype = $(form).find('#Urgenttype').val();
    //let radiologist = $(form).find('#Radiologist').val();
		let radiologist = radioSelected.radioId;
    let detail = $(form).find('#Detail').val();
		if (refferal < 0) {
			$(form).find('#Bodypart').css("border","");
			$(form).find('#Refferal').css("border","4px solid red");
			$(form).find('#Refferal').notify("โปรดระบุแพทย์เจ้าของไช้", "error");
			$(form).find('#Refferal').focus();
			return false;
    } else if (urgenttype <= 0) {
      $(form).find('#Urgenttype').css("border","4px solid red");
      $(form).find('#Urgenttype').notify("โปรดเลือกประเภทความเร่งด่วน", "error");
      $(form).find('#Urgenttype').focus();
      return false;
    } else if (radiologist <= 0) {
      $(form).find('#Urgenttype').css("border","");
      $(form).find('#Radiologist').css("border","4px solid red");
      $(form).find('#Radiologist').notify("โปรดเลือกรังสีแพทย์", "error");
      $(form).find('#Radiologist').focus();
      return false;
    } else {
      return true;
    }
  }

  function doControlShowCustomUrget(tableWrapper, ugValue, defualtValue, ugentId) {
		common.doCallSelectUrgentType(ugValue).then((ugtypeRes)=>{
			let ugentId = ugtypeRes.Records[0].id;
			let acceptStep = JSON.parse(ugtypeRes.Records[0].UGType_AcceptStep);
			let acceptText = common.doDisplayCustomUrgentResult(acceptStep.dd, acceptStep.hh, acceptStep.mn, defualtValue.createdAt);

			let workingStepFrom = (acceptStep.dd * 24 * 60 * 60 * 1000) + (acceptStep.hh * 60 * 60 * 1000) + (acceptStep.mn * 60 * 1000);
			let wkFromTime = (new Date(defualtValue.createdAt)).getTime() + workingStepFrom;

			let accDateTimes = acceptText.split(':');
			let accDates = accDateTimes[0].split('-');
			let accTimes = accDateTimes[1].split('.');
			let y = accDates[0].trim();
			let m = parseInt(accDates[1].trim()) - 1;
			let d = accDates[2].trim();
			let h = accTimes[0].trim();
			let mn = accTimes[1].trim();

			let wkFromDateTime = new Date(y, m, d, h, mn);

			let workingStep = JSON.parse(ugtypeRes.Records[0].UGType_WorkingStep);
			let workingText = common.doDisplayCustomUrgentResult(workingStep.dd, workingStep.hh, workingStep.mn, wkFromDateTime);
			let ugData = {Accept: acceptStep, Working: workingStep};
			$('#CustomUrgentPlugin').empty();
			if ((defualtValue.caseId) && (defualtValue.createdAt)) {
				let createdAt = common.doFormatDateTimeCaseCreated(defualtValue.createdAt);
				$('#CustomUrgentPlugin').append($('<div>เคสถูกส่งไป เมื่อ <b>' + createdAt + '</b></div>'));
			}
			$('#CustomUrgentPlugin').append($('<div>ระยะเวลาตอบรับเคส ภายใน <b>' + acceptText + '</b></div>'));
			$('#CustomUrgentPlugin').append($('<div>ระยะเวลาส่งผลอ่าน ภายใน <b>' + workingText + '</b></div>'));

			let canChange = ((!defualtValue.status) || (util.contains.call([3, 4, 7], defualtValue.status)));
			if (canChange) {
				if (defualtValue.urgenttype === 'custom') {
					let editUrgentTypeButton = $('<input type="button" value=" แก้ไขค่าความเร่งด่วน "/>');
					$(editUrgentTypeButton).appendTo($('#CustomUrgentPlugin'));
					$(editUrgentTypeButton).on('click', (evt)=>{
						$('.select-ul').hide();
						doOpenCustomUrgentPopup(tableWrapper, 'edit', defualtValue, ugentId, ugData);
					});
				} else if (defualtValue.urgenttype === 'standard') {
					$(tableWrapper).find('#Urgenttype').prop('disabled', false);
				}
			} else {
				if (defualtValue.urgenttype === 'standard') {
					$(tableWrapper).find('#Urgenttype').prop('disabled', true);
				}
			}
		});
	}

	function doOpenCustomUrgentPopup(tableWrapper, mode, defualtValue, ugentId, urgentData) {
		let customurgentSettings = {
			successCallback: async function(ugData) {
				let customUrgentRes = undefined
				if (mode === 'new') {
					customUrgentRes = await common.doCreateNewCustomUrgent(ugData);
				} else if (mode === 'edit') {
					customUrgentRes = await common.doUpdateCustomUrgent(ugData, ugentId);
				}
				//console.log(customUrgentRes);
				if (customUrgentRes.status.code == 200) {
					if (mode === 'new') {
						defualtValue.urgent = customUrgentRes.Record.id
						defualtValue.urgenttype = customUrgentRes.Record.UGType;
					} else if (mode === 'edit') {
						defualtValue.urgent = ugentId;
						defualtValue.urgenttype = 'custom';
					}
					$('#Urgenttype').remove();
					$('#CustomUrgentPlugin').empty();
					if ((mode === 'edit') && (defualtValue.createdAt)){
						let createdAt = common.doFormatDateTimeCaseCreated(defualtValue.createdAt);
						$('#CustomUrgentPlugin').append($('<div>เคสถูกส่งไป เมื่อ <b>' + createdAt + '</b></div>'));
					}
					$('#CustomUrgentPlugin').append($('<div>ระยะเวลาตอบรับเคส ภายใน <b>' + ugData.Accept.text + '</b></div>'));
					$('#CustomUrgentPlugin').append($('<div>ระยะเวลาส่งผลอ่าน ภายใน <b>' + ugData.Working.text + '</b></div>'));
					if (defualtValue.urgenttype === 'custom') {
						let editUrgentTypeButton = $('<input type="button" value=" แก้ไขค่าความเร่งด่วน "/>');
						$(editUrgentTypeButton).appendTo($('#CustomUrgentPlugin'));
						$(editUrgentTypeButton).on('click', (evt)=>{
							doOpenCustomUrgentPopup(tableWrapper, 'edit', defualtValue, ugentId, ugData);
						});
					}
				} else {
					$.notify("ไม่สามารถบันทึกประเภทความเร่งด่วนใหม่เข้าสู่ระบบได้ในขณะนี้ โปรดใช้งานประเภทที่มีอยู่แล้วในรายการ", "info");
				}
			}
		};
		let customurgentBox = $(tableWrapper).find('#CustomUrgentPlugin');
		let customurgent = $(customurgentBox).customurgent(customurgentSettings);
		if (mode === 'edit') {
			customurgent.editInputValue(urgentData);
		}
		return customurgent;
	}

  function doCreateNewCaseData(defualtValue, phrImages, scanparts, radioSelected, hospitalId){
		return new Promise(function(resolve, reject) {
			let urgentType = $('.mainfull').find('#Urgenttype').val();
			//console.log(urgentType);
			let urgenttypeId = defualtValue.urgent;
			//console.log(urgenttypeId);
			if (urgentType) {
				urgenttypeId = urgentType;
			}
			//console.log(urgenttypeId);
			if (!urgenttypeId) {
				let content = $('<div></div>');
				$(content).append($('<p>ค่าความเร่งด่วนไม่ถูกต้อง โปรดแก้ไข</p>'));
				const radalertoption = {
					title: 'ข้อมูลไม่ถูกต้อง',
					msg: $(content),
					width: '410px',
					onOk: function(evt) {
						radAlertBox.closeAlert();
					}
				}
				let radAlertBox = $('body').radalert(radalertoption);
				$(radAlertBox.cancelCmd).hide();
				resolve();
			} else {
		    let patientNameEN = $('.mainfull').find('#PatientNameEN').val();
		    let patientNameTH = $('.mainfull').find('#PatientNameTH').val();
		    let patientHistory = phrImages;
				let scanpartItem = [];
				let isOutTime = common.doCheckOutTime(new Date());
				let	promiseList = new Promise(async function(resolve2, reject2){
					for (let i=0; i < scanparts.length; i++){
						let thisScanPart = scanparts[i];
						let dfRes = await common.doCallPriceChart(hospitalId, thisScanPart.id);
						if (isOutTime) {
							thisScanPart.DF = {value: dfRes.prdf.df.night, type: 'night'};
						} else {
							thisScanPart.DF = {value: dfRes.prdf.df.normal, type: 'normal'};
						}
						scanpartItem.push(thisScanPart);
					}
					setTimeout(()=>{
	          resolve2($(scanpartItem));
	        }, 500);
				});
				Promise.all([promiseList]).then((ob)=>{
					let scanpartItems = JSON.parse(JSON.stringify(ob[0]));
					//let scanpartItems = scanparts;
			    let studyID = defualtValue.studyID;
			    let patientSex = $('.mainfull').find('#Sex').val();
			    let patientAge = $('.mainfull').find('#Age').val();
			    let patientCitizenID = $('.mainfull').find('#CitizenID').val();
					let patientRights = $('.mainfull').find('#Cliameright').val();
			    let price = 0;
			    let hn = $('.mainfull').find('#HN').val();
			    let acc = $('.mainfull').find('#ACC').val();
			    let department = $('.mainfull').find('#Department').val();
			    let drOwner = $('.mainfull').find('#Refferal').val();
			    let bodyPart = $('.mainfull').find('#Bodypart').val();
					let scanPart = $('.mainfull').find('#Scanpart').val();
			    //let drReader = $('.mainfull').find('#Radiologist').val();
					//console.log(radioSelected);
					let drReader = radioSelected.radioId;
			    let detail = $('.mainfull').find('#Detail').val();
					let wantSaveScanpart = 0;
					let saveScanpartOption = $('.mainfull').find('#SaveScanpartOption').prop('checked');
					if (saveScanpartOption) {
						wantSaveScanpart = 1;
					}
			    let mdl = defualtValue.mdl;
			    let studyDesc = defualtValue.studyDesc;
			    let protocalName = defualtValue.protocalName;
			    let manufacturer = defualtValue.manufacturer;
			    let stationName = defualtValue.stationName;
			    let studyInstanceUID = defualtValue.studyInstanceUID;
			    let radioId = drReader;
					let option = {scanpart: {save: wantSaveScanpart}}; //0 or 1
			    let newCase = {patientNameTH, patientNameEN, patientHistory, scanpartItems, studyID, patientSex, patientAge, patientRights, patientCitizenID, price, hn, acc, department, drOwner, bodyPart, scanPart, drReader, urgenttypeId, detail, mdl, studyDesc, protocalName, manufacturer, stationName, studyInstanceUID, radioId, option: option};
			    resolve(newCase);
				});
			}
		});
  }

  const doShowRadioReadyLegent = function(evt, content){
		const radalertoption = {
			title: 'ความหมายสัญลักษณ์',
			msg: $(content),
			width: '610px',
			onOk: function(evt) {
				radAlertBox.closeAlert();
			}
		}
		let radAlertBox = $('body').radalert(radalertoption);
		$(radAlertBox.cancelCmd).hide();
	}

  const doCreateNewCaseFirstStep = function(defualtValue, allSeries, allImageInstances){
    $('body').loading('start');
		let rqParams = {};
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let hospitalId = userdata.hospitalId;
		let apiUrl = '/api/cases/options/' + hospitalId;
		common.doGetApi(apiUrl, rqParams).then(async (response)=>{
			let options = response.Options;
			let openStoneWebViewerCounter = 0;

			let tableWrapper = $('<div id="FirstStepWrapper" class="new-case-wrapper"></div>');
			let headerWrapper = $('<div style="position: relative; width: 100%;" class="header-cell">' + defualtValue.headerCreateCase + '</div>');
			$(headerWrapper).css({'border': ''});
			$(headerWrapper).appendTo($(tableWrapper));

			let guideWrapper = $('<div style="width: 100%; margin-top: -15px; background: #ddd; line-height: 30px;"><h4>ขั้นตอนที่ 1/2 โปรดตรวจสอบและแก้ไขข้อมูล</h4></div>');
			$(guideWrapper).appendTo($(tableWrapper));

			let table = $('<div style="display: table; width: 100%; padding: 10px; margin-top: -10px;"></div>');
			$(table).appendTo($(tableWrapper));

			let patientName = defualtValue.patient.name.split('^').join(' ');
      //patientName = patientName.split(' ').join('_');
      patientName = patientName.split('.').join(' ');
			let tableRow = $('<div style="display: table-row;"></div>');
			let tableCell = $('<div style="display: table-cell; width: 240px;">ขื่อผู้ป่วย (ภาษาอังกฤษ)</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="PatientNameEN"/></div>');
			$(tableCell).find('#PatientNameEN').val(patientName);
			$(tableCell).appendTo($(tableRow));
			//$(tableRow).appendTo($(table));

			//tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">ขื่อผู้ป่วย (ภาษาไทย)</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="PatientNameTH"/></div>');
			$(tableCell).find('#PatientNameTH').val(patientName);
			$(tableCell).appendTo($(tableRow));
			$(tableRow).appendTo($(table));

			tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">HN</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="HN"/></div>');
			$(tableCell).find('#HN').val(defualtValue.patient.id);
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell;"></div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell;"></div>');
			$(tableCell).appendTo($(tableRow));
			$(tableRow).appendTo($(table));

			tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">เพศ</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell;  padding: 5px;"></div>');
			let sexSelector = $('<select id="Sex"></select>');
			$(sexSelector).append($('<option value="M">ชาย</option>'));
			$(sexSelector).append($('<option value="F">หญิง</option>'));
			$(sexSelector).appendTo($(tableCell));
			$(tableCell).find('#Sex').val(defualtValue.patient.sex);
			$(tableCell).appendTo($(tableRow));
			//$(tableRow).appendTo($(table));

			//tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">อายุ</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell;  padding: 5px;"><input type="text" id="Age"/></div>');
			$(tableCell).find('#Age').val(defualtValue.patient.age);
			$(tableCell).appendTo($(tableRow));
			$(tableRow).appendTo($(table));

			tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">สิทธิ์ผู้ป่วย</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><select id="Cliameright"></select></div>');
			options.cliames.forEach((item) => {
				$(tableCell).find('#Cliameright').append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
			});
			if (defualtValue.rights) {
				$(tableCell).find('#Cliameright').val(defualtValue.rights);
			} else {
				$(tableCell).find('#Cliameright').prepend($('<option value="0">ไม่ระบุ</option>'));
				$(tableCell).find('#Cliameright').val(0);
			}
			$(tableCell).appendTo($(tableRow));
			//$(tableRow).appendTo($(table));

			//tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">เลขประจำตัวประชาชน</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="CitizenID"/></div>');
			$(tableCell).find('#CitizenID').val(defualtValue.patient.patientCitizenID);
			$(tableCell).appendTo($(tableRow));
			$(tableRow).appendTo($(table));

			tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">Study Desc. / Protocol Name</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="Bodypart"/></div>');
			$(tableCell).find('#Bodypart').val(defualtValue.bodypart);
			$(tableCell).appendTo($(tableRow));
			//$(tableRow).appendTo($(table));

			//tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">Accession Number</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="ACC"/></div>');
			$(tableCell).find('#ACC').val(defualtValue.acc);
			$(tableCell).appendTo($(tableRow));
			$(tableRow).appendTo($(table));

			tableRow = $('<div id="ScanPartRow" style="display: table-row;"></div>');
			tableCell = $('<div id="ScanPartCellLabel" style="display: table-cell; vertical-align: middle;">Scan Part</div>');
			$(tableCell).appendTo($(tableRow));

			let selectedResultBox = $('<div id="SelectedResultBox"></div>');
			let saveScanpartOptionDiv = $('<div id="SaveScanpartOptionDiv" style="display: none;"><input type="checkbox" id="SaveScanpartOption" value="0" style="transform: scale(1.5)"><label for="SaveScanpartOption"> บันทึกรายการ Scan Part ไว้ใช้งานในครั้งต่อไป</label></div>');
			let scanparts = [];
			if (defualtValue.scanpart) {
				scanparts = defualtValue.scanpart;
			}

			let scanpartSettings = {
        iconCmdUrl: '/images/case-incident.png',
        loadOriginUrl: 'https://radconnext.info/api/scanpartref/list',
				addScanpartItemUrl: 'https://radconnext.info/api/scanpartref/add',
				externalStyle: {'margin-top': '67px'},
				headerBackgroundColor: common.headBackgroundColor,
				selectedMainJson: scanparts,
        successCallback: function(data) {
					scanparts = data.selectedData;
          $(selectedResultBox).empty().append($(data.selectedBox));
					$('.remove-item').empty();
					if (scanparts.length > 0) {
						$(saveScanpartOptionDiv).css('display', 'block');
					} else {
						$(saveScanpartOptionDiv).css('display', 'none');
					}
        },
				updateSelectedItem: async function(content){
					if (scanparts.length > 0) {
						let key = '';
						if (scanparts.length >= 1) {
							scanpart.joinOptionToMain();
						}
						await scanparts.forEach(async (item, i) => {
							if (item) {
								let code = item.Code;
								let foundItem = await scanpart.getItemByCodeFromMain(code);
								if (foundItem.foundIndex) {
									await scanpart.addSelectedItem(content, code, key);
									scanpart.removeItemFromMainAt(foundItem.foundIndex);
								} else {

								}
							}
						});
					}
				}
      };

			let scanpartButtonBox = $('<div id="ScanpartButtonBox" style="margin-top: 8px;"></div>');
		  let scanpart = $(scanpartButtonBox).scanpart(scanpartSettings);

			tableCell = $('<div id="ScanPartCellValue" style="padding: 5px; display: none; margin-top: -1px; margin-bottom: -1px;"></div>');
			$(tableCell).appendTo($(tableRow));
			$(selectedResultBox).appendTo($(tableCell));
			$(scanpartButtonBox).appendTo($(tableCell));
			$(saveScanpartOptionDiv).appendTo($(tableCell));

			$(tableRow).appendTo($(table));

			const scanpartAutoGuide = async function(){
				let yourSelectScanpart = await common.doRenderScanpartSelectedBox(scanparts);
				$(selectedResultBox).append($(yourSelectScanpart));
				$(saveScanpartOptionDiv).show();
			}
			//console.log(defualtValue);
			if ((defualtValue.scanpart) && (defualtValue.scanpart.length > 0)) {
				scanpartAutoGuide();
			} else {
				let studyDesc = defualtValue.studyDesc;
				let protocalName = defualtValue.protocalName;
				let auxScanpart = await common.doLoadScanpartAux(studyDesc, protocalName);
				//console.log(auxScanpart);
				if ((auxScanpart.Records) && (auxScanpart.Records.length > 0)) {
					//scanparts = auxScanpart.Records[0].Scanparts;
          let scanpartValues = Object.values(auxScanpart.Records[0].Scanparts);
          scanparts = scanpartValues.slice(0, -1);
					//console.log(scanparts);
					scanpartAutoGuide();
				} else {
					$(saveScanpartOptionDiv).hide();
				}
			}


			tableRow = $('<div style="display: table-row;"></div>');
			tableCell = $('<div style="display: table-cell;">จำนวน Series / จำนวนรูป</div>');
			$(tableCell).appendTo($(tableRow));
			tableCell = $('<div style="display: table-cell; padding: 5px;"></div>');
			let previewCmd = $('<a href="#">ตรวจสอบรูป</a>');
			$(previewCmd).on('click', function(evt){
				openStoneWebViewerCounter += 1;
				//common.doOpenStoneWebViewer(defualtValue.studyInstanceUID);
        const lacalOrthancStoneWebviewer = 'http://localhost:8042/stone-webviewer/index.html?study=' + defualtValue.studyInstanceUID;
        window.open(lacalOrthancStoneWebviewer, '_blank');
			});
			let summarySeriesImages = allSeries + ' / ' + allImageInstances;
			let sumSeriesImages = $('<span id="SumSeriesImages">' + summarySeriesImages + '</span>');
			$(tableCell).append($(sumSeriesImages));
			$(tableCell).append('<span>   </span>');
			$(tableCell).append($(previewCmd));

			$(tableCell).appendTo($(tableRow));
			$(tableRow).appendTo($(table));

			let footerWrapper = $('<div class="header-cell"></div>');
			let nextStepTwoCmd = $('<input type="button" value=" ต่อไป " class="action-btn"/>');

			$(nextStepTwoCmd).appendTo($(footerWrapper));
			$(footerWrapper).append('<span>  </span>')
			let cancelFirstStepCmd = $('<input type="button" value=" ยกเลิก " class="none-action-btn"/>');
			$(cancelFirstStepCmd).appendTo($(footerWrapper));

			$(footerWrapper).appendTo($(tableWrapper));

			$('.mainfull').empty().append($(tableWrapper));

			let rowWidth = $(table).find('#ScanPartRow').width();
			let colLabelWidth = $(table).find('#ScanPartCellLabel').width();
			let colValueWidth = $(table).find('#ScanPartCellValue').width();
			let marginRight = colValueWidth - rowWidth + colLabelWidth;
			let newWidth = rowWidth - colLabelWidth;
			$(table).find('#ScanPartCellValue').css({'margin-right': marginRight + 'px', 'width': newWidth + 'px'}).show();

			$(nextStepTwoCmd).click(()=>{
				const goToSecondStep = async function() {
					let verified = doVerifyNewCaseDataFirstStep(table, scanparts);
					if (verified) {
						$(tableWrapper).hide();
						let nextTable = $('.mainfull').find('#SecondStepWrapper');
						if ($(nextTable).prop('id')) {
							$(nextTable).show();
						} else {
							doCreateNewCaseSecondStep(defualtValue, options, scanparts);
						}
					}
				}
				if (openStoneWebViewerCounter > 0) {
					goToSecondStep();
				} else {
					if (defualtValue.caseId) {
						//Update Case
						openStoneWebViewerCounter += 1;
						goToSecondStep();
					} else {

						let radAlertMsg = $('<div></div>');
						$(radAlertMsg).append($('<p>Total ' + allSeries + ' Series, ' + allImageInstances +' Images</p>'));
						const radconfirmoption = {
				      title: 'Open Study.',
				      msg: $(radAlertMsg),
				      width: '420px',
							okLabel: ' ต่อไป ',
				      onOk: function(evt) {
								radConfirmBox.closeAlert();
								openStoneWebViewerCounter += 1;
								goToSecondStep();
				      },
				      onCancel: function(evt){
								radConfirmBox.closeAlert();
				      }
				    }
				    let radConfirmBox = $('body').radalert(radconfirmoption);
					}
				}
			});

			$(cancelFirstStepCmd).click(async()=>{
				if (userdata.usertypeId == 2){
					//doLoadDicomFromOrthanc();
          $('#HomeMainCmd').click();
				} else if (userdata.usertypeId == 5){
					window.location.replace('/refer/index.html?t=2');
				}
			});

			$('body').loading('stop');
		});
  }

  const doCreateNewCaseSecondStep = function(defualtValue, options, scanparts) {
    $('body').loading('start');
    let tableWrapper = $('<div id="SecondStepWrapper" class="new-case-wrapper"></div>');

    let headerWrapper = $('<div style="width: 100%;" class="header-cell">' + defualtValue.headerCreateCase + '</div>');
    $(headerWrapper).css({'border': ''});
    $(headerWrapper).appendTo($(tableWrapper));


    let guideWrapper = $('<div style="width: 100%; margin-top: -15px; background: #ddd; line-height: 30px;"><h4>ขั้นตอนที่ 2/2 โปรดกรอกข้อมูลให้สมบูรณ์พร้อมทั้งแนบประวัติผู้ป่วย</h4></div>');
    $(guideWrapper).appendTo($(tableWrapper));

    let table = $('<div style="display: table; width: 100%; padding: 10px; margin-top: -15px;"></div>');
    $(table).appendTo($(tableWrapper));

    /* Department */
    let tableRow = $('<div style="display: table-row;"></div>');
    let tableCell = $('<div style="display: table-cell;">แผนก</div>');
    $(tableCell).appendTo($(tableRow));
    tableCell = $('<div style="display: table-cell; padding: 5px;"><input type="text" id="Department"/></div>');
    $(tableCell).find('#Department').val(defualtValue.dept);
    $(tableCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    /*Refferal */
    tableRow = $('<div style="display: table-row;"></div>');
    tableCell = $('<div style="display: table-cell;">แพทย์เจ้าของไช้</div>');
    $(tableCell).appendTo($(tableRow));
    tableCell = $('<div style="display: table-cell; padding: 5px;"><select id="Refferal"></select></div>');
    options.refes.forEach((item) => {
      $(tableCell).find('#Refferal').append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
    })
    $(tableCell).find('#Refferal').append($('<option value="-1">เพิ่มหมอ</option>'));
    $(tableCell).find('#Refferal').prepend($('<option value="0">ไม่ระบุ</option>'));
    $(tableCell).find('#Refferal').on('change', (evt)=>{
      let selectedReff = $(tableWrapper).find('#Refferal').val();
      if (selectedReff == -1) {
        newreffuser.doShowPopupRegisterNewRefferalUser();
      }
    });

    if ((defualtValue.primary_dr) && (defualtValue.primary_dr > 0)) {
      $(tableCell).find('#Refferal').val(defualtValue.primary_dr);
    } else {
      $(tableCell).find('#Refferal').val(0);
    }

    $(tableCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    /* Patient History */
    tableRow = $('<div style="display: table-row;"></div>');
    tableCell = $('<div style="display: table-cell; width: 240px; height: 100%; vertical-align: middle;">ประวัติผู้ป่วย</div>');
    $(tableCell).appendTo($(tableRow));
    tableCell = $('<div style="display: table-cell; padding: 5px;"></div>');

    let patientHistoryBox = $('<div id="PatientHistoryBox"></div>').appendTo($(tableCell)).imagehistory( phProp ).data("custom-imagehistory");
    if ((defualtValue.pn_history) && (defualtValue.pn_history.length > 0)) {
      defualtValue.pn_history.forEach((item, i) => {
        patientHistoryBox.images(item);
      });
    }

		document.onpaste = function(pasteEvent) {
			let phBox = $(tableCell).find('#PatientHistoryBox');
			if ($(phBox)) {
				let item = pasteEvent.clipboardData.items[0];
				console.log(item);
				console.log(item.type.toUpperCase());
				let blob = item.getAsFile();
				if (item.type.indexOf("image") === 0) {
					patientHistoryBox.options.doUploadBlob(blob, 'image').then((data)=>{
						//console.log(data);
					});
				} else if ((item.type.toUpperCase() === 'APPLICATION/ZIP') || (item.type.toUpperCase() === 'APPLICATION/X-ZIP-COMPRESSED')) {
					patientHistoryBox.options.doUploadBlob(blob, 'zip').then((data)=>{
						console.log(data);
					});
				} else if (item.type.toUpperCase() === 'APPLICATION/PDF') {
					patientHistoryBox.options.doUploadBlob(blob, 'pdf').then((data)=>{
						console.log(data);
					});
				}
			}
		};

    $(tableWrapper).on('newpatienthistoryimage', (evt)=>{
      //
    });
    $(tableCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    tableRow = $('<div style="display: table-row;"></div>');
    tableCell = $('<div style="display: table-cell;"></div>');
    $(tableCell).appendTo($(tableRow));
    tableCell = $('<div style="display: table-cell; padding: 5px;"></div>');
    let magicBox = $('<div id="magic-box"></div>');
    $(magicBox).appendTo($(tableCell));
    $(tableCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    /* Case Detail */
    tableRow = $('<div style="display: table-row;"></div>');
    tableCell = $('<div style="display: table-cell; vertical-align: middle;">รายละเอียดเพิ่มเติม</div>');
    $(tableCell).appendTo($(tableRow));
    tableCell = $('<div style="display: table-cell; padding: 5px;"><textarea id="Detail" cols="45" rows="5"></textarea></div>');
    $(tableCell).find('#Detail').val(defualtValue.detail);
    $(tableCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    /*Urgent type */
    tableRow = $('<div style="display: table-row;"></div>');
    tableCell = $('<div style="display: table-cell;">ประเภทความเร่งด่วน</div>');
    $(tableCell).appendTo($(tableRow));

    if (defualtValue.urgenttype === 'standard') {
      tableCell = $('<div style="display: table-cell; padding: 5px;"><select id="Urgenttype"></select></div>');
      options.urgents.forEach((item) => {
        $(tableCell).find('#Urgenttype').append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
      });
      $(tableCell).find('#Urgenttype').append($('<option value="-1">กำหนดเวลารับผลอ่าน</option>'));

      $(tableCell).find('#Urgenttype').on('change', (evt) => {
        let ugValue = $(tableWrapper).find('#Urgenttype').val();
        if (!ugValue) {
          ugValue = $(tableCell).find('#Urgenttype').val();
        }
        if (ugValue == -1) {
          let eventData = {name: 'usecustomurgent'};
          $(tableWrapper).find('#Urgenttype').trigger('usecustomurgent', [eventData]);
        } else {
          if (ugValue > 0) {
            let ugentId = ugValue;
            doControlShowCustomUrget(tableWrapper, ugValue, defualtValue, ugentId)
            if (defualtValue.urgenttype === 'custom') {
              $('#Urgenttype').remove();
            }
          }
        }
      });

      if ((defualtValue.urgent) && (defualtValue.urgent > 0)) {
        $(tableCell).find('#Urgenttype').val(defualtValue.urgent);
        $(tableCell).find('#Urgenttype').change();
      } else {
        $(tableCell).find('#Urgenttype').prepend($('<option value="0">ระบุประเภทความเร่งด่วน</option>'));
        $(tableCell).find('#Urgenttype').val(0);
      }
    } else if (defualtValue.urgenttype === 'custom') {
      tableCell = $('<div style="display: table-cell; padding: 5px;"></div>');
      let ugValue = defualtValue.urgent;
      let ugentId = ugValue;
      doControlShowCustomUrget(tableWrapper, ugValue, defualtValue, ugentId);
    }

    $('<div id="CustomUrgentPlugin"></div>').appendTo($(tableCell));

    $(tableCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    /* Radio Select */
    tableRow = $('<div style="display: table-row;"></div>');
    tableCell = $('<div style="display: table-cell;">รังสีแพทย์</div>');
    $(tableCell).appendTo($(tableRow));
    tableCell = $('<div style="display: table-cell; padding: 5px;"></div>');

    let radioCustomSelector = undefined;
    const youCan = [1, 2, 3, 4, 7, 8];
    let checkState = ((!defualtValue.status) || (util.contains.call(youCan, defualtValue.status)));
    if (checkState) {
      let radioCustomSelectorBox = $('<div id="Radiologist"></div>');
      $(radioCustomSelectorBox).appendTo($(tableCell));
      let customSelectPluginOption = {
        loadOptionsUrl: 'https://radconnext.info/api/radiologist/state/current',
        /* "font-family": "THSarabunNew", "font-size": "24px",  */
        externalStyle: {"width": "410px", "line-height": "35px", "min-height": "35px"},
        startLoad: function(){$('#Radiologist').loading('start');},
        stopLoad: function(){$('#Radiologist').loading('stop');},
        onShowLegentCmdClick: doShowRadioReadyLegent
      }
      radioCustomSelector = $(radioCustomSelectorBox).customselect(customSelectPluginOption);
      if (defualtValue.dr_id) {
        radioCustomSelector.loadOptions().then(async (options)=>{
          let radioIndex = -1;
          let radioItem = await options.find((item, index)=>{
            if (item.radioId == defualtValue.dr_id) {
              radioIndex = index;
              return item;
            }
          });
          radioCustomSelector.setSelectedIndex(radioIndex);
          radioCustomSelector.setSelectOptions(options);
        });
      }
      $(tableCell).appendTo($(tableRow));
      $(tableRow).appendTo($(table));
    }

    let footerWrapper = $('<div class="header-cell"></div>');
    let backFirstStepCmd = $('<input type="button" value=" กลับ " class="none-action-btn"/>');
    $(backFirstStepCmd).appendTo($(footerWrapper));
    $(footerWrapper).append('<span>  </span>')
    let saveStepTwoCmd = $('<input type="button" value=" บันทึก " class="action-btn"/>');
    //$(saveStepTwoCmd).css({'background-color': '#2579B8', 'color': 'white', 'line-height': '26px'});
    $(saveStepTwoCmd).appendTo($(footerWrapper));
    $(footerWrapper).append('<span>  </span>')
    let cancelFirstStepCmd = $('<input type="button" value=" ยกเลิก " class="none-action-btn"/>');
    $(cancelFirstStepCmd).appendTo($(footerWrapper));

    $(footerWrapper).appendTo($(tableWrapper));

    $('.mainfull').append($(tableWrapper));

    $(backFirstStepCmd).click(async()=>{
      $(tableWrapper).hide();
      let lastTable = $('.mainfull').find('#FirstStepWrapper');
      $(lastTable).show();
    });

    $(saveStepTwoCmd).click(()=>{
      let patientHistory = patientHistoryBox.images();
      let radioSelected = radioCustomSelector.getSelectedIndex();

      const saveNow = async function(){
        //await $(tableWrapper).animate({	left: rightPos }, 1000);
        if (defualtValue.caseId) {
          let currentCaseStatusApiUrl = '/api/cases/status/' + defualtValue.caseId;
          let getRes = await common.doGetApi(currentCaseStatusApiUrl, {});
          if ((getRes.status.code == 200) && (getRes.canupdate == true)) {
            doSaveUpdateCaseStep(defualtValue, options, patientHistory, scanparts, radioSelected);
          } else if ((getRes.status.code == 200) && (parseInt(getRes.current) == 9)) {
            let radAlertMsg = $('<div></div>');
            $(radAlertMsg).append($('<p>เนื่องจากเคสที่คุณกำลังพยายามแก้ไข ไม่อยู่ในสถานะที่จะแก้ไขได้อีกต่อไป</p>'));
            $(radAlertMsg).append($('<p>หากจำเป็นต้องการแก้ไขเคสจริงๆ โปรดติดต่อรังสีแพทย์เพื่อแจ้งยกเลิกเคส</p>'));
            $(radAlertMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> เพื่อยกเลิกการแก้ไข</p>'));
            const radalertoption = {
              title: 'แจ้งเตือนสำคัญ',
              msg: $(radAlertMsg),
              width: '420px',
              onOk: function(evt) {
                radAlertBox.closeAlert();
                $.notify("ยกเลิกการแก้ไขเคสสำเร็จ", "success");
                if (userdata.usertypeId == 2) {
                  $('#NewStatusSubCmd').click(); // <- Tech Page
                } else if (userdata.usertypeId == 5) {
                  doLoadDicomFromOrthanc(); // <- Refer Page
                }
              }
            }
            let radAlertBox = $('body').radalert(radalertoption);
            $(radAlertBox.cancelCmd).hide();
          }
        } else {
          doSaveNewCaseStep(defualtValue, options, patientHistory, scanparts, radioSelected);
        }
      }
      const goToSaveCaseStep = async()=>{
        if (radioSelected.radioId > 0){
          let radioReadyApiUrl = '/api/userprofile/select/' + radioSelected.radioId;
          let radioRes = await common.doCallApi(radioReadyApiUrl, {});
          if ((radioRes.Record.length > 0) && (radioRes.Record[0].Profile.readyState == 1)) {
            let verified = doVerifyNewCaseDataSecondStep(table, radioSelected);
            if (verified) {
              saveNow();
            }
          } else {
            let radAlertMsg = $('<div></div>');
            $(radAlertMsg).append($('<p>เนื่องจากรังสีแพทย์ที่คุณเลือกได้ปิดรับงานใหม่ไปแล้ว</p>'));
            $(radAlertMsg).append($('<p>โปรดยืนยันว่าคุณต้องการส่งเคสนี้ให้กับรังสีแพทย์ที่ระบุไว้จริงๆ</p>'));
            $(radAlertMsg).append($('<p><b>ใช่ หรือไม่?</b></p>'));
            $(radAlertMsg).append($('<p>หาก <b>ใช่</b> คลิกปุ่ม <b>ตกลง</b> เพื่อดำเนินการส่งเคส</p>'));
            $(radAlertMsg).append($('<p>หาก <b>ไม่ใช่</b> คลิกปุ่ม <b>ยกเลิก</b> เพื่อยกเลิกการส่งเคส</p>'));
            const radconfirmoption = {
              title: 'โปรดยืนยันการส่งเคสในกรณีรังสีแพทย์ปิดรับงาน',
              msg: $(radAlertMsg),
              width: '420px',
              onOk: function(evt) {
                let verified = doVerifyNewCaseDataSecondStep(table, radioSelected);
                if (verified) {
                  $('body').loading('start');
                  radConfirmBox.closeAlert();
                  saveNow();
                }
              },
              onCancel: function(evt){
                radConfirmBox.closeAlert();
              }
            }
            let radConfirmBox = $('body').radalert(radconfirmoption);
          }
        } else {
          $('.mainfull').find('#Radiologist').notify("โปรดเลือกรังสีแพทย์ที่ต้องการส่งไปอ่านผล", "error");
        }
      }
      if (patientHistory.length > 0){
        goToSaveCaseStep();
      } else {
        /*========================================================*/
        //let pthrna = $('.mainfull').find('#pthrna').prop('checked');
        let caseDetail = $(table).find('#Detail').val();
        if (caseDetail !== '') {
          goToSaveCaseStep();
        } else {
          let radAlertMsg = $('<div></div>');
          $(radAlertMsg).append($('<p>ต้องการส่งโดยไม่มีประวัติ</p>'));
          const radconfirmoption = {
            title: 'โปรดยืนยัน',
            msg: $(radAlertMsg),
            width: '420px',
            onOk: function(evt) {
              radConfirmBox.closeAlert();
              goToSaveCaseStep();
            },
            onCancel: function(evt){
              $.notify('โปรดแนบประวัติผู้ป่วยอย่างน้อย 1 รูป/ไฟล์ หรือ พิมพ์รายละเอียดเพิ่มเติม', 'error');
              radConfirmBox.closeAlert();
            }
          }
          let radConfirmBox = $('body').radalert(radconfirmoption);

        }
      }
    });

    $(cancelFirstStepCmd).click(async()=>{
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      if (userdata.usertypeId == 2){
        //doLoadDicomFromOrthanc();
        $('#HomeMainCmd').click();
      } else if (userdata.usertypeId == 5){
        window.location.replace('/refer/index.html?t=2');
      }
    });

    $(tableWrapper).on('usecustomurgent', (evt) =>{
      $('.select-ul').hide();
      doOpenCustomUrgentPopup(tableWrapper,'new', defualtValue);
    });
    $('body').loading('stop');
  }

  const doSaveNewCaseStep = async function(defualtValue, options, phrImages, scanparts, radioSelected){
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		const hospitalId = userdata.hospitalId;
		const userId = userdata.id
		let newCaseData = await doCreateNewCaseData(defualtValue, phrImages, scanparts, radioSelected, hospitalId);
		if (newCaseData) {
	    $('body').loading('start');
	    try {
	      let rqParams = {key: {Patient_HN: newCaseData.hn}};
	      let patientdb = await common.doCallApi('/api/patient/search', rqParams);
	      let patientId, patientRes, patientData;
	      if (patientdb.Records.length === 0) {
	        //ไม่มี hn ใน db -> add
	        patientData = common.doPreparePatientParams(newCaseData);
					console.log('patientData', patientData);
	        rqParams = {data: patientData, hospitalId: hospitalId};
	        patientRes = await common.doCallApi('/api/patient/add', rqParams);
	        //console.log(patientRes);
	        patientId = patientRes.Record.id;
	      } else {
	        //ถ้ามี hn ใน db -> update
	        patientId = patientdb.Records[0].id;
	        patientData = common.doPreparePatientParams(newCaseData);
	        rqParams = {data: patientData, patientId: patientId};
	        patientRes = await common.doCallApi('/api/patient/update', rqParams);
	      }

	      const urgenttypeId = newCaseData.urgenttypeId;
	      const cliamerightId = newCaseData.patientRights
	      let caseData = common.doPrepareCaseParams(newCaseData);

				let currentTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
	      currentTime = currentTime.split(':').join('');
	      let dicomZipFileName = fmtStr('%s_%s-%s-%s-%s.zip', patientData.Patient_NameEN, patientData.Patient_LastNameEN, defualtValue.studyTags.MainDicomTags.StudyDate, defualtValue.studyTags.MainDicomTags.StudyTime, currentTime);

				caseData.Case_DicomZipFilename = dicomZipFileName;

				console.log(defualtValue);
				if (defualtValue.studyTags) {
		      rqParams = {data: caseData, hospitalId: hospitalId, userId: userId, patientId: patientId, urgenttypeId: urgenttypeId, cliamerightId: cliamerightId, option: newCaseData.option, studyTags: defualtValue.studyTags};
					console.log(rqParams);

		      let caseRes = await common.doCallApi('/api/cases/add', rqParams);
		      if (caseRes.status.code === 200) {
						console.log('caseActions=>', caseRes.actions);
		        $.notify("บันทึกเคสใหม่เข้าสู่ระบบเรียบร้อยแล้ว", "success");
						if (userdata.usertypeId == 2) {
							let isActive = $('#CaseMainCmd').hasClass('NavActive');
							if (!isActive) {
								let hrPatientFiles = caseData.Case_PatientHRLink;
								doTransferDicomZip(dicomZipFileName, hrPatientFiles, defualtValue, false);
								$('#CaseMainCmd').click();
							}
							$('#NewStatusSubCmd').click(); // <- Tech Page
						} else if (userdata.usertypeId == 5) {
							$('#HomeMainCmd').click(); // <- Refer Page
						}
		      } else {
		        $.notify("เกิดความผิดพลาด ไม่สามารถบันทึกเคสใหม่เข้าสู่ระบบได้ในขณะนี้", "error");
		      }
				} else {
					$.notify("เกิดความผิดพลาด ไม่สามารถสร้างจ้อมูล Dicom เพื่อใช้งานได้", "error");
				}
		    $('body').loading('stop');
	    } catch(e) {
	      console.log('Unexpected error occurred =>', e);
	      $('body').loading('stop');
	    }
		} else {
			$.notify("ข้อมูลเคสที่คุณสร้างใหม่มีความผิดพลาด", "error");
		}
	}

  const doTransferDicomZip = function(dicomZipFileName, hrPatientFiles, defualtValue, isChangeRadio) {
    return new Promise(async function(resolve, reject) {
      let transerDicomUrl = '/api/orthanc/transfer/dicom';
      let transferParams = {DicomZipFileName: dicomZipFileName, StudyTags: defualtValue.studyTags, HrPatientFiles: hrPatientFiles, OldHrPatientFiles: defualtValue.pn_history, ChangeRadioOption: isChangeRadio};
			if (defualtValue.caseId) {
				transferParams.caseId = defualtValue.caseId;
			}
			console.log(transferParams);
			resolve();
      let transerDicomRes = await common.doCallLocalApi(transerDicomUrl, transferParams);
			console.log(transerDicomRes);
    });
  }

	const doSaveUpdateCaseStep = async function (defualtValue, options, phrImages, scanparts, radioSelected){
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		const hospitalId = userdata.hospitalId;
		const userId = userdata.id
		const goToNextPage = function(statusId, dicomZipFileName, hrPatientFiles, defualtValue, isChangeRadio, caseId){
			if (statusId == 1) {
				$('#NewStatusSubCmd').click();
			} else if ((statusId == 2) || (statusId == 8)) {
				$('#AcceptedStatusSubCmd').click();
			} else if (statusId == 5) {
				$('#SuccessStatusSubCmd').click();
			} else if ((statusId == 3)||(statusId == 4)||(statusId == 7)) {
				$('#NegativeStatusSubCmd').click();
			}
			doTransferDicomZip(dicomZipFileName, hrPatientFiles, defualtValue, isChangeRadio);
		}

		let updateCaseData = await doCreateNewCaseData(defualtValue, phrImages, scanparts, radioSelected, hospitalId);

		if (updateCaseData) {
			$('body').loading('start');
			let patientData =  common.doPreparePatientParams(updateCaseData);
			let rqParams = {data: patientData, patientId: defualtValue.patientId};
			let patientRes = await common.doCallApi('/api/patient/update', rqParams);

			const urgenttypeId = updateCaseData.urgenttypeId;
			const cliamerightId = updateCaseData.patientRights
			let casedata = common.doPrepareCaseParams(updateCaseData);
			let currentTime = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
			currentTime = currentTime.split(':').join('');
			let dicomZipFileName = fmtStr('%s_%s-%s-%s-%s.zip', patientData.Patient_NameEN, patientData.Patient_LastNameEN, defualtValue.studyTags.MainDicomTags.StudyDate, defualtValue.studyTags.MainDicomTags.StudyTime, currentTime);

			casedata.Case_DicomZipFilename = dicomZipFileName;

			rqParams = {id: defualtValue.caseId, data: casedata, urgenttypeId: urgenttypeId, cliamerightId: cliamerightId};
			let caseRes = await common.doCallApi('/api/cases/update', rqParams);
			if (caseRes.status.code === 200) {
				console.log(defualtValue);
				console.log(radioSelected);
				if (defualtValue.dr_id !== radioSelected.radioId) {
					let caseNewStatus = 1;
					let d = new Date().getTime();
					let stampTime = util.formatDateTimeStr(d);
					let changeRaioLog = 'Radio change from ' + updateCaseData.drReader + ' to ' + updateCaseData.radioId + ' by ' + userId + ' at ' + stampTime;
					common.doUpdateCaseStatus(defualtValue.caseId, caseNewStatus, changeRaioLog).then((caseChangeStatusRes) => {
						console.log(caseChangeStatusRes);
						$.notify("บันทึกการแก้ไขเคสและปรับสถานะเคสเป็นเคสใหม่เรียบร้อยแล้ว", "success");
						let hrPatientFiles = casedata.Case_PatientHRLink;
						goToNextPage(defualtValue.status, dicomZipFileName, hrPatientFiles, defualtValue, true);
					});
				} else {
					$.notify("บันทึกการแก้ไขเคสเรียบร้อยแล้ว", "success");
					let hrPatientFiles = casedata.Case_PatientHRLink;
					goToNextPage(defualtValue.status, dicomZipFileName, hrPatientFiles, defualtValue, false);
				}
			} else {
				$.notify("เกิดความผิดพลาด ไม่สามารถบันทึกการแก้ไขเคสได้ในขณะนี้", "error");
			}
			$('body').loading('stop');
		} else {
			$.notify("ข้อมูลเคสที่คุณสร้างใหม่มีความผิดพลาด", "error");
		}
	}

  return {
    doCreateNewCaseFirstStep,
    doCreateNewCaseSecondStep
  }
}
