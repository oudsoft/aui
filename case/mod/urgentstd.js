/*urgentstd.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('./utilmod.js')($);
  const common = require('./commonlib.js')($);

	const pageFontStyle = {"font-family": "THSarabunNew", "font-size": "24px"};

  const doCalNewTime = function(dd, hh, mn) {
    let totalShiftTime = (dd * 24 * 60 * 60 * 1000) + (hh * 60 * 60 * 1000) + (mn * 60 * 1000);
    return totalShiftTime;
  }

  const doCallUrgentListItem = function(){
    return new Promise(async function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let rqParams = {userId: userId};
      let apiUrl = '/api/urgenttypes/filter/by/hospital/' + hospitalId;
      try {
        let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
      } catch(e) {
        reject(e);
      }
    });
  }

  const doDeleteUrgent = function(ugId) {
    return new Promise(async function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let rqParams = {userId: userId, hospitalId: hospitalId, id: ugId};
      let apiUrl = '/api/urgenttypes/delete';
      try {
        let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
      } catch(e) {
        reject(e);
      }
    });
  }

  const doUpdateUrgent = function(ugId, ugValue){
    return new Promise(async function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let rqParams = {userId: userId, hospitalId: hospitalId, id: ugId, data: ugValue};
      let apiUrl = '/api/urgenttypes/update';
      try {
        let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
      } catch(e) {
        reject(e);
      }
    });
  }

  const doAddUrgent = function(ugValue){
    return new Promise(async function(resolve, reject) {
      const userdata = JSON.parse(localStorage.getItem('userdata'));
      let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let rqParams = {userId: userId, hospitalId: hospitalId, data: ugValue};
      let apiUrl = '/api/urgenttypes/add';
      try {
        let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
      } catch(e) {
        reject(e);
      }
    });
  }

  const doCallUpdateUrgent = function(ugId, ugValue){
    console.log(ugId);
    console.log(ugValue);
    $('body').loading('start');
    doUpdateUrgent(ugId, ugValue).then((response) => {
      console.log(response);
      if (response.status.code == 200) {
        $('#StdUrgentConfigSubCmd').click();
        $.notify("บันทึกการแก้ไขรายการ Urgent สำเร็จ", "success");
      } else if (response.status.code == 201) {
        $.notify("ไม่สามารถบันทึกรายการ Urgent ได้ ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
      } else {
        $.notify("เกิดข้อผิดพลาด ไม่สามารถบันทึกรายการ Urgent ได้", "error");
      }
      $('body').loading('stop');
    }).catch((err) => {
      console.log(err);
      $.notify("ต้องขออภัยอย่างแรง มีข้อผิดพลาดเกิดขึ้น", "error");
      $('body').loading('stop');
    });
  }

  const doCallAddNewUrgent = function(ugValue){
    $('body').loading('start');
    doAddUrgent(ugValue).then((response) => {
      if (response.status.code == 200) {
        $('#StdUrgentConfigSubCmd').click();
        $.notify("บันทึกรายการ Urgent ไหม่สำเร็จ", "success");
      } else if (response.status.code == 201) {
        $.notify("ไม่สามารถบันทึก Urgent ใหม่ได้ ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
      } else {
        $.notify("เกิดข้อผิดพลาด ไม่สามารถบันทึกรายการ Urgent ได้", "error");
      }
      $('body').loading('stop');
    }).catch((err) => {
      console.log(err);
      $.notify("ต้องขออภัยอย่างแรง มีข้อผิดพลาดเกิดขึ้น", "error");
      $('body').loading('stop');
    });
  }

  const doCallDeleteUrgent = function(ugId) {
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบ Urgent รายการนี้ออกจากระบบฯ ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบ Urgent</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบ Urgent',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: function(evt) {
				radConfirmBox.closeAlert();
				$('body').loading('start');
				doDeleteUrgent(ugId).then((response) => {
					if (response.status.code == 200) {
						$('#StdUrgentConfigSubCmd').click();
						$.notify("ลบรายการ Urgent สำเร็จ", "success");
					} else if (response.status.code == 201) {
						$.notify("ไม่สามารถลบรายการ Urgent ได้ ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการ Urgent ได้", "error");
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

  const doCreateUrgentForm = function(defualtValue){
    let mainForm = $('<div></div>');
    let titleForm = $('<div class="title-content"><h3>' + ((defualtValue)?'แก้ไข Urgent':'เพิ่ม Urgent ใหม่') + '</h3></div>');
    let urgentForm = $('<div style="display: table; width: 100%; border-collapse: collapse; margin-top: 0px;"></div>');
    let itemRow = $('<div style="display: table-row; width: 100%;"></div>');
    let itemLabelCol = $('<div style="display: table-cell; text-align: left; padding: 5px;"></div>');
    let itemValueCol = $('<div style="display: table-cell; text-align: left; padding: 5px;"></div>');
    let itemValue = $('<input type="text"/>');
    if ((defualtValue) && (defualtValue.name)){
      $(itemValue).val(defualtValue.name);
    }
    $(itemLabelCol).append('<span>ขื่อ Urgent</span>');
    $(itemValueCol).append($(itemValue));
    $(itemRow).append($(itemLabelCol)).append($(itemValueCol));
    $(urgentForm).append($(itemRow));

    itemRow = $('<div style="display: table-row; width: 100%;"></div>');
    itemLabelCol = $('<div style="display: table-cell; text-align: left; padding: 5px;"></div>');
    itemValueCol = $('<div style="display: table-cell; text-align: left; padding: 5px;"></div>');
    let ddaSelect = $('<select style="margin-left: 5px;"></select>');
    for (let i=0; i < 31; i++){
      $(ddaSelect).append($('<option value=' + (i) + '>' + (i) +'</option>'));
    }
    if ((defualtValue) && (defualtValue.acc.dd)){
      $(ddaSelect).val(parseInt(defualtValue.acc.dd));
    }
    let hhaSelect = $('<select style="margin-left: 5px;"></select>');
    for (let i=0; i < 24; i++){
      $(hhaSelect).append($('<option value=' + (i) + '>' + (i) +'</option>'));
    }
    if ((defualtValue) && (defualtValue.acc.hh)){
      $(hhaSelect).val(parseInt(defualtValue.acc.hh));
    }
    let mnaSelect = $('<select style="margin-left: 5px;"></select>');
    for (let i=0; i < 60; i++){
      $(mnaSelect).append($('<option value=' + (i) + '>' + (i) +'</option>'));
    }
    if ((defualtValue) && (defualtValue.acc.mn)){
      $(mnaSelect).val(parseInt(defualtValue.acc.mn));
    }
    $(itemLabelCol).append('<span>เวลาตอบรับเคส</span>');
    $(itemValueCol).append('<span>วัน</span>').append($(ddaSelect));
    $(itemValueCol).append('<span style="margin-left: 5px;">ชม.</span>').append($(hhaSelect));
    $(itemValueCol).append('<span style="margin-left: 5px;">นาที</span>').append($(mnaSelect));

    $(itemRow).append($(itemLabelCol)).append($(itemValueCol));
    $(urgentForm).append($(itemRow));


    itemRow = $('<div style="display: table-row; width: 100%;"></div>');
    itemLabelCol = $('<div style="display: table-cell; text-align: left; padding: 5px;"></div>');
    itemValueCol = $('<div style="display: table-cell; text-align: left; padding: 5px;"></div>');

    let ddwSelect = $('<select style="margin-left: 5px;"></select>');
    let ddaOptionClones = $(ddaSelect).children().clone(true,true);
    $(ddwSelect).append($(ddaOptionClones));
    if ((defualtValue) && (defualtValue.work.dd)){
      $(ddwSelect).val(parseInt(defualtValue.work.dd));
    }

    let hhwSelect = $('<select style="margin-left: 5px;"></select>');
    let hhaOptionClones = $(hhaSelect).children().clone(true,true);
    $(hhwSelect).append($(hhaOptionClones));
    if ((defualtValue) && (defualtValue.work.hh)){
      $(hhwSelect).val(parseInt(defualtValue.work.hh));
    }

    let mnwSelect = $('<select style="margin-left: 5px;"></select>');
    let mnaOptionClones = $(mnaSelect).children().clone(true,true);
    $(mnwSelect).append($(mnaOptionClones));
    if ((defualtValue) && (defualtValue.work.mn)){
      $(mnwSelect).val(parseInt(defualtValue.work.mn));
    }

    $(itemLabelCol).append('<span>เวลาส่งผลอ่าน</span>');
    $(itemValueCol).append('<span>วัน</span>').append($(ddwSelect));
    $(itemValueCol).append('<span style="margin-left: 5px;">ชม.</span>').append($(hhwSelect));
    $(itemValueCol).append('<span style="margin-left: 5px;">นาที</span>').append($(mnwSelect));

    $(itemRow).append($(itemLabelCol)).append($(itemValueCol));
    $(urgentForm).append($(itemRow));

    let cmdFormBox = $('<div style="position: relative; width: 100%; text-align: center; margin-top: 10px;"></div>');
    let saveCmd = $('<span style="text-align: center;">บันทึก</span>');
    $(saveCmd).css({'background-color': 'grey', 'color': 'white', 'border': '3px solid green', 'border-radius': '15px', 'padding': '5px', 'cursor': 'pointer', 'display': 'inline-block', 'width': '80px', 'height': '32px'});
    $(saveCmd).on('click', (evt)=>{
      let ugName = $(itemValue).val();
      let dda = $(ddaSelect).val();
      let hha = $(hhaSelect).val();
      let mna = $(mnaSelect).val();
      let ddw = $(ddwSelect).val();
      let hhw = $(hhwSelect).val();
      let mnw = $(mnwSelect).val();
      if (ugName !== ''){
        $(itemValue).css('border', '');
        let accTime = doCalNewTime(dda, hha, mna);
        if (accTime/(60 * 1000) >= 15) {
          $(ddaSelect).css('border', '');
          let workTime = doCalNewTime(ddw, hhw, mnw);
          if ((workTime/(60 * 1000)) - (accTime/(60 * 1000)) >= 15) {
            $(ddwSelect).css('border', '');
            let acc = {dd: dda, hh: hha, mn: mna};
            let work = {dd: ddw, hh: hhw, mn: mnw};
            let ugValue = {UGType_Name: ugName, UGType: 'standard', UGType_ColorCode: "000066", UGType_WarningStep: "", UGType_AcceptStep: JSON.stringify(acc), UGType_WorkingStep: JSON.stringify(work)};
            if (defualtValue){
              doCallUpdateUrgent(defualtValue.id, ugValue);
            } else {
              doCallAddNewUrgent(ugValue);
            }
          } else {
            $(ddwSelect).notify('โปรดแก้ไขเวลาส่งผลอ่านให้มากกว่าเวลาตอบรับเคสอย่างน้อย 15 นาที', 'error');
            $(ddwSelect).css('border', '1px solid red');
          }
        } else {
          $(ddaSelect).css('border', '1px solid red');
          $(ddaSelect).notify('โปรดแก้ไขเวลาตอบรับเคสให้มากกว่า 15 นาที', 'error');
        }
      } else {
        $(itemValue).css('border', '1px solid red');
        $(itemValue).notify('โปรดระบุชื่อ Urgent ใหม่', 'error');
      }
    });
    let cancelCmd = $('<span style="text-align: center; margin-left: 10px;">ยกเลิก</span>');
    $(cancelCmd).css({'background-color': 'grey', 'color': 'white', 'border': '3px solid red', 'border-radius': '15px', 'padding': '5px', 'cursor': 'pointer', 'display': 'inline-block', 'width': '80px', 'height': '32px'});
    $(cancelCmd).on('click', (evt)=>{
      doLoadMyStdUrgentListView();
    });
    $(cmdFormBox).append($(saveCmd)).append($(cancelCmd))
    return $(mainForm).append($(titleForm)).append($(urgentForm)).append($(cmdFormBox));
  }

  const doCreateStdUrgentTitlePage = function(){
		let pageLogo = $('<img src="/images/urgent-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
		let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>Urgent ของฉัน</h3></div>');
    let titleBox = $('<div></div>').append($(pageLogo)).append($(titleText));
    return $(titleBox);
  }

  const doCreateUrgentHeaderRow = function() {
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');
		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>#</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ชื่อ</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>เวลาตอบรับเคส</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>เวลาส่งผลอ่าน</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>คำสั่ง</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

  const doCreateUGRow = function(ugNo, ugItem){
    let itemRow = $('<div style="display: table-row; width: 100%;"></div>');
		let itemColumn = $('<div style="display: table-cell; text-align: center;"></div>');
    $(itemRow).append($(itemColumn));
		$(itemColumn).append('<span>' + ugNo + '</span>');

    itemColumn = $('<div style="display: table-cell; text-align: left;"></div>');
    $(itemRow).append($(itemColumn));
    $(itemColumn).append('<span>' + ugItem.UGType_Name + '</span>');

    let accValue = JSON.parse(ugItem.UGType_AcceptStep);
    let accBox = doCreateUGUnit(accValue);
    itemColumn = $('<div style="display: table-cell; text-align: center;"></div>');
    $(itemRow).append($(itemColumn));
    $(itemColumn).append($(accBox));

    let workValue = JSON.parse(ugItem.UGType_WorkingStep);
    let workBox = doCreateUGUnit(workValue);
    itemColumn = $('<div style="display: table-cell; text-align: center;"></div>');
    $(itemRow).append($(itemColumn));
    $(itemColumn).append($(workBox));

    let ugCmdBox = doCreateUGCmd(ugItem);
    itemColumn = $('<div style="display: table-cell; text-align: center;"></div>');
    $(itemRow).append($(itemColumn));
    $(itemColumn).append($(ugCmdBox));

    return $(itemRow);
  }

  const doCreateUGUnit = function(ugValue){
    let ugUnitBox = $('<div style="line-height: 24px;"></div>');
    let dd = parseInt(ugValue.dd);
    let hh = parseInt(ugValue.hh);
    let mn = parseInt(ugValue.mn);
    if ((dd) && (dd > 0)) {
      $(ugUnitBox).append($('<span style="background-color: grey; color: white; border-radius: 5px; padding: 5px; display: inline-block;">' + dd + ' วัน</span>'));
    } else {
      $(ugUnitBox).append($('<span style="border: 2px solid grey; border-radius: 5px; display: inline-block;">- วัน</span>'));
    }
    if ((hh) && (hh > 0)){
      $(ugUnitBox).append($('<span style="margin-left: 4px; background-color: grey; color: white; border-radius: 5px; padding: 5px; display: inline-block;">' + hh + ' ชม.</span>'));
    } else {
      $(ugUnitBox).append($('<span style="margin-left: 4px; border: 2px solid grey; border-radius: 5px; display: inline-block;">- ชม.</span>'));
    }
    if ((mn) && (mn > 0)){
      $(ugUnitBox).append($('<span style="margin-left: 4px; background-color: grey; color: white; border-radius: 5px; padding: 5px; display: inline-block;">' + mn + ' นาที</span>'));
    } else {
      $(ugUnitBox).append($('<span style="margin-left: 4px; border: 2px solid grey; border-radius: 5px; display: inline-block;">0 นาที</span>'));
    }
    return $(ugUnitBox);
  }

  const doCreateUGCmd = function(ugItem){
    let ugCmdBox = $('<div style="line-height: 24px;"></div>');
    let editCmd = $('<span>แก้ไข</span>');
    $(editCmd).css({'background-color': 'grey', 'color': 'white', 'border': '3px solid yellow', 'border-radius': '15px', 'padding': '5px', 'cursor': 'pointer', 'display': 'inline-block', 'width': '80px', 'height': '24px'});
    $(editCmd).on('click', (evt)=>{
      let acc = JSON.parse(ugItem.UGType_AcceptStep);
      let work = JSON.parse(ugItem.UGType_WorkingStep);
      let ugDefualtValue = {id: ugItem.id, name: ugItem.UGType_Name, acc: {dd: acc.dd, hh: acc.hh, mn: acc.mn}, work: {dd: work.dd, hh: work.hh, mn: work.mn}};
      let ugForm = doCreateUrgentForm(ugDefualtValue);
      $(".mainfull").empty().append($(ugForm));
    });
    let deleteCmd = $('<span>ลบ</span>');
    $(deleteCmd).css({'margin-left': '5px', 'background-color': 'grey', 'color': 'white', 'border': '3px solid red', 'border-radius': '15px', 'padding': '5px', 'cursor': 'pointer', 'display': 'inline-block', 'width': '80px', 'height': '24px'});
    $(deleteCmd).on('click', (evt)=>{
      doCallDeleteUrgent(ugItem.id);
    });
    return $(ugCmdBox).append($(editCmd)).append($(deleteCmd));
  }

  const doCreateAddItemCmd = function(){
    let addCmdBox = $('<div style="position: relative; display: inline-block; line-height: 24px; width: 100%; margin-top: 10px;"></div>');
    let addCmd = $('<span style="text-align: center; float: right;">เพิ่ม</span>');
    $(addCmd).css({'background-color': 'grey', 'color': 'white', 'border': '3px solid green', 'border-radius': '15px', 'padding': '5px', 'cursor': 'pointer', 'display': 'inline-block', 'width': '80px', 'height': '24px'});
    $(addCmd).on('click', (evt)=>{
      let ugForm = doCreateUrgentForm();
      $(".mainfull").empty().append($(ugForm));
    });
    return $(addCmdBox).append($(addCmd));
  }

  const doShowStdUrgentCallback = function(ugRecords){
    const stdUrgentListView = $('<div id="StdUrgentListView"></div>');
    if (ugRecords.length == 0) {
      $(stdUrgentListView).append($('<h4>ไม่พบรายการ Urgent ของคุณจากระบบ</h4>'));
    } else {
      let headerRow = doCreateUrgentHeaderRow();
      let myUrgentView = $('<div style="display: table; width: 100%; border-collapse: collapse; margin-top: 0px;"></div>');
      $(myUrgentView).append($(headerRow));
      for (let i=0; i < ugRecords.length; i++) {
        let ugItem = ugRecords[i];
        let ugRow = doCreateUGRow((i+1), ugItem);
        $(myUrgentView).append($(ugRow));
      }
      $(stdUrgentListView).append($(myUrgentView));
    }
    return $(stdUrgentListView);
  }

  const doLoadMyStdUrgentListView = function(){
    $('body').loading('start');
    let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
    let userItemPerPage = userDefualtSetting.itemperpage;
    let titlePage = doCreateStdUrgentTitlePage();
		$("#TitleContent").empty().append($(titlePage));

    let addCmdBox = doCreateAddItemCmd();
    let showItems = undefined;
    doCallUrgentListItem().then(async(callRes)=>{
      let ugRecords = callRes.Records;
      if (userItemPerPage == 0) {
				showItems = ugRecords;
			} else {
				showItems = await common.doExtractList(ugRecords, 1, userItemPerPage);
			}

      let ugView = doShowStdUrgentCallback(showItems);
      let navigBarBox = $('<div id="NavigBar"></div>');

      let navigBarOption = {
        currentPage: 1,
        itemperPage: userItemPerPage,
        totalItem: ugRecords.length,
        styleClass : {'padding': '4px', "font-family": "THSarabunNew", "font-size": "20px"},
        changeToPageCallback: async function(page){
          $('body').loading('start');
          let toItemShow = 0;
          if (page.toItem == 0) {
            toItemShow = ugRecords.length;
          } else {
            toItemShow = page.toItem;
          }
          let showItems = await common.doExtractList(ugRecords, page.fromItem, toItemShow);
          let showView = doShowStdUrgentCallback(showItems);
          $('.mainfull').find('#StdUrgentListView').empty().append($(showView));
          $('body').loading('stop');
        }
      };
      let navigatorPage = $(navigBarBox).controlpage(navigBarOption);
      navigatorPage.toPage(1);

      $(".mainfull").empty().append($(addCmdBox)).append($(ugView)).append($(navigBarBox));;
			$('body').loading('stop');
    })
  }

  return {
    doLoadMyStdUrgentListView
	}
}
