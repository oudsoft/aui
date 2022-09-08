/* searchcaselib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  function doCreateCaseItemCommand(ownerRow, caseItem) {
		const userdata = JSON.parse(localStorage.getItem('userdata'));
		let operationCmdButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/arrow-down-icon.png" title="คลิกเพื่อเปิดรายการคำสั่งใช้งานของคุณ"/>');
		$(operationCmdButton).click(async function() {
			let casestatusId = caseItem.case.casestatusId;
			let cando = await common.doGetApi('/api/cases/cando/' + casestatusId, {});
			if (cando.status.code == 200) {
				let cmdRow = $('<div class="cmd-row" style="display: tbable-row; width: 100%;"></div>');
				$(cmdRow).append($('<div style="display: table-cell; border-color: transparent;"></div>'));
				let mainBoxWidth = parseInt($(".mainfull").css('width'), 10);
				//console.log(mainBoxWidth);
				// left: 0px; width: 100%;
				let cmdCell = $('<div style="display: table-cell; position: absolute; width: ' + (mainBoxWidth-8) + 'px; border: 1px solid black; background-color: #ccc; text-align: right;"></div>');
				$(cmdRow).append($(cmdCell));
				console.log(cando);
				await cando.next.actions.forEach((item, i) => {
					let cmd = item.substr(0, (item.length-1));
					let frag = item.substr((item.length-1), item.length);
					if ((frag==='H') &&(userdata.usertypeId==2)) {
						let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
							console.log(data);
							//hospital Action todo
						});
						$(iconCmd).appendTo($(cmdCell));
					} else if ((frag==='R') &&(userdata.usertypeId==4)) {
						console.log(cmd);
						let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
							//console.log(data);
							//readio Action todo
							if (cmd === 'edit') {
								let eventData = {caseId: caseItem.case.id, statusId: caseItem.case.casestatusId, patientId: caseItem.case.patientId, hospitalId: caseItem.case.hospitalId};
								eventData.Modality = caseItem.case.Case_Modality;
								eventData.StudyDescription = caseItem.case.Case_StudyDescription;
								eventData.ProtocolName = caseItem.case.Case_ProtocolName;
								if ((eventData.StudyDescription == '') && (eventData.ProtocolName != '')) {
									eventData.StudyDescription = eventData.ProtocolName;
								}
								console.log(eventData);
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

	function doCreateCaseItemRadioCommand(commandStr, caseItem) {
		let cmd = commandStr.substr(0, (commandStr.length-1));
		let frag = commandStr.substr((commandStr.length-1), commandStr.length);
		if ((frag === 'R') && (cmd === 'edit')) {
			let iconCmd = common.doCreateCaseCmd(cmd, caseItem.case.id, (data)=>{
				let eventData = {caseId: caseItem.case.id, statusId: caseItem.case.casestatusId, patientId: caseItem.case.patientId, hospitalId: caseItem.case.hospitalId};
				eventData.Modality = caseItem.case.Case_Modality;
				eventData.StudyDescription = caseItem.case.Case_StudyDescription;
				eventData.ProtocolName = caseItem.case.Case_ProtocolName;
				if ((eventData.StudyDescription == '') && (eventData.ProtocolName != '')) {
					eventData.StudyDescription = eventData.ProtocolName;
				}
				$(iconCmd).trigger('opencase', [eventData]);
			});
			return $(iconCmd);
		} else {
			return $('<span></span>');
		}
	}

  const doCreateSearchTitlePage = function(){
		let searchResultTitleBox = $('<div id="ResultTitleBox"></div>');
		let logoPage = $('<img src="/images/search-icon-4.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
		$(logoPage).appendTo($(searchResultTitleBox));
		let titleResult = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>ผลการค้นหาเคสของคุณ</h3></div>');
		$(titleResult).appendTo($(searchResultTitleBox));
		return $(searchResultTitleBox);
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

    /*
		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ประเภทความด่วน</span>');
		$(headColumn).appendTo($(headerRow));
    */

		/*
		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>แพทย์ผู้ส่ง</span>');
		$(headColumn).appendTo($(headerRow));
		*/

		headColumn = $('<div style="display: table-cell; text-align: center" class="header-cell"></div>');
		$(headColumn).append('<span>โรงพยาบาล</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>สถานะเคส</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>คำสั่ง</span>');
		$(headColumn).appendTo($(headerRow));

		return $(headerRow);
	}

  const doCreateSearchCaseFormRow = function(key, searchResultCallback){
    let searchFormRow = $('<div style="display: table-row; width: 100%;"></div>');
    let formField = $('<div style="display: table-cell; text-align: center; vertical-align: middle;" class="header-cell"></div>');

    let fromDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ตั้งแต่</span>
    $(fromDateKeyBox).appendTo($(formField));
    let fromDateKey = $('<input type="text" id="FromDateKey" size="6" style="margin-left: 1px;"/>');
    if (key.fromDateKeyValue) {
      let arrTmps = key.fromDateKeyValue.split('-');
      let fromDateTextValue = arrTmps[2] + '-' + arrTmps[1] + '-' + arrTmps[0];
      $(fromDateKey).val(fromDateTextValue);
    }
    //$(fromDateKey).css({'font-size': '20px'});
    $(fromDateKey).appendTo($(fromDateKeyBox));
    $(fromDateKey).datepicker({ dateFormat: 'dd-mm-yy' });

    $(formField).append($('<span style="margin-left: 2px; display: inline-block;">-</span>'));

    let toDateKeyBox = $('<div style="text-align: left; display: inline-block;"></div>'); //<span>ถึง</span>
    $(toDateKeyBox).appendTo($(formField));
    let toDateKey = $('<input type="text" id="ToDateKey" size="6" style="margin-left: 2px;"/>');
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
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let patientHNKey = $('<input type="text" id="PatientHNKey" size="8"/>');
    $(patientHNKey).val(key.patientHNKeyValue);
    $(formField).append($(patientHNKey));
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let bodypartKey = $('<input type="text" id="BodyPartKey" style="width: 90%"/>');
    $(bodypartKey).val(key.bodypartKeyValue);
    $(formField).append($(bodypartKey));
    $(formField).appendTo($(searchFormRow));
    /*
    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));
    */
    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    $(formField).append('<span></span>');
    $(formField).appendTo($(searchFormRow));

    formField = $('<div style="display: table-cell; text-align: left; vertical-align: middle;" class="header-cell"></div>');
    let caseStatusKey = $('<select id="CaseStatusKey"></select>');
    $(caseStatusKey).append($('<option value="0">ทั้งหมด</option>'));
		//console.log(common.allCaseStatusForRadio);
    common.allCaseStatusForRadio.forEach((item, i) => {
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
				const userdata = JSON.parse(localStorage.getItem('userdata'));
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

  function doCreateCaseItemRow(caseItem) {
    return new Promise(async function(resolve, reject) {
      let caseDate = util.formatDateTimeStr(caseItem.case.createdAt);
			let casedatetime = caseDate.split('T');
      let casedateSegment = casedatetime[0].split('-');
      casedateSegment = casedateSegment.join('');
      let casedate = util.formatStudyDate(casedateSegment);
      let casetime = util.formatStudyTime(casedatetime[1].split(':').join(''));
			let patientName = '-';
			let patientSA = '-';
			let patientHN = '-';
			if (caseItem.case.patient){
      	patientName = caseItem.case.patient.Patient_NameEN + ' ' + caseItem.case.patient.Patient_LastNameEN;
      	patientSA = caseItem.case.patient.Patient_Sex + '/' + caseItem.case.patient.Patient_Age;
      	patientHN = caseItem.case.patient.Patient_HN;
			} else {
				console.log(caseItem);
			}
      let caseMODA = caseItem.case.Case_Modality;
      let caseScanparts = caseItem.case.Case_ScanPart;
      let yourSelectScanpartContent = $('<div></div>');
      if ((caseScanparts) && (caseScanparts.length > 0)) {
        yourSelectScanpartContent = await common.doRenderScanpartSelectedAbs(caseScanparts);
      }
      let caseUG = '-';
			if (caseItem.case.urgenttype){
				caseUG = caseItem.case.urgenttype.UGType_Name;
			}
      //let caseREFF = caseItem.Refferal.User_NameTH + ' ' + caseItem.Refferal.User_LastNameTH;
      //console.log(caseItem);
			let caseHosName = '-'
			if (caseItem.case.hospital){
      	caseHosName = caseItem.case.hospital.Hos_Name;
			}

			let caseSTAT = '-';
			if (caseItem.case.casestatus){
      	caseSTAT = caseItem.case.casestatus.CS_Name_EN;
			}

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

      /*
      itemColumn = $('<div style="display: table-cell; text-align: left;"></div>');
      $(itemColumn).append(caseUG);
      $(itemColumn).appendTo($(itemRow));
      */
      /*
      itemColumn = $('<div style="display: table-cell; text-align: left;"></div>');
      $(itemColumn).append(caseREFF);
      $(itemColumn).appendTo($(itemRow));
      */

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(caseHosName);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: left; vertical-align: middle;"></div>');
      $(itemColumn).append(caseSTAT);
      $(itemColumn).appendTo($(itemRow));

      itemColumn = $('<div style="display: table-cell; text-align: center; vertical-align: middle;"></div>');
			//console.log(caseItem.next.actions);
      //let caseCMD = doCreateCaseItemCommand(itemRow, caseItem);
			caseItem.next.actions.forEach((item, i) => {
				let cmdFrag = item;
				let caseCMD = doCreateCaseItemRadioCommand(cmdFrag, caseItem);
      	$(itemColumn).append($(caseCMD));
			});
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
			const youCan = [5, 6, 9, 10, 11, 12, 13, 14];

			let	promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < incidents.length; i++) {
					let caseItem = incidents[i];
					let checkState = util.contains.call(youCan, caseItem.case.casestatusId);
					if (checkState) {
						let itemView = await doCreateCaseItemRow(caseItem);
						$(itemView).appendTo($(caseView));
					}
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

  const doShowSearchResultCallback = function(response){
    return new Promise(async function(resolve, reject) {
      /*  Concept */
      /*
      1. ส่งรายการ case ตามจำนวนรายการ ในเงื่อนไขของ Navigator ไปสร้าง View
      2. รับ view ที่จกข้อ 1 มา append ต่อจาก titlepage
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

  return {
    doCreateSearchTitlePage,
    doCreateHeaderFieldCaseList,
    doCreateSearchCaseFormRow,
    doShowCaseView,
    doShowSearchResultCallback
	}
}
