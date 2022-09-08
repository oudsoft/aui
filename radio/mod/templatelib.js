/* templatelib.js */
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

	const simpleEditorConfig = $.extend({}, common.jqteConfig);

  const onAddNewTemplateClick = async function(evt){
    const addCmd = $(evt.currentTarget);
		const templateData = $(addCmd).data('templateData');
    let jqtePluginStyleUrl = '../../lib/jqte/jquery-te-1.4.0.css';
    $('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
    let jqtePluginScriptUrl = '../../lib/jqte/jquery-te-1.4.0.min.js';
    $('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

    let templateNameInput = $('<input type="text" id="TemplateName"/>');
		let modalityInput = $('<select id="Modality" style="width: 80px;"></select>');

		common.modalitySelectItem.forEach((item, i) => {
			let optionItem = $('<option value="' + item +'">' + item + '</option>');
			$(modalityInput).append($(optionItem));
		});

    let hospitalInput = $('<input type="text" id="Hospital" style="width: 310px;"/>');
		let modifyHospitalListCmd = $('<input type="button" id="ModifyHospitalListCmd" value=" ... " class="action-btn"; style="margin-left: 10px;"/>');
    let studyDescriptionInput = $('<input type="text" id="StudyDescription" style="width: 310px;"/>');
		let showLegentCmd = common.doCreateLegentCmd(common.doShowStudyDescriptionLegentCmdClick);

		/*
		let readySwitchBox = $('<div style="position: relative; display: inline-block; top: 0px;"></div>');
		let readyOption = {onActionCallback: ()=>{}, offActionCallback: ()=>{}};
		let readySwitch = $(readySwitchBox).readystate(readyOption);
		*/
		let readySwitchBox = $('<select></select>');
		$(readySwitchBox).append('<option value="1">Yes</option>');
		$(readySwitchBox).append('<option value="0">No</option>');

		let tableControlInputView = $('<table width="100% cellpadding="2" cellspacing="2" border="0"></table>');

		let tableRow = $('<tr></tr>');
		$(tableRow).append($('<td width="25%" align="left"><span style="font-weight: bold;">ขื่อ Template:</span></td>'));
		let inputCell = $('<td width="*" align="left"></td>');
		$(inputCell).append($(templateNameInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Modality:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(modalityInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Hospital:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(hospitalInput)).append($(modifyHospitalListCmd));
		$(modifyHospitalListCmd).data('templateData', templateData);
		$(modifyHospitalListCmd).on('click', onModifyHospitalList);
		$(hospitalInput).attr('readonly', true);
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Associated Study Description:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(studyDescriptionInput)).append($(showLegentCmd));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Auto Apply:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(readySwitchBox));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		$(modifyHospitalListCmd).data('hospitalsData', []);

    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
    let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
    $(simpleEditor).appendTo($(templateViewBox));
    $(simpleEditor).jqte(simpleEditorConfig);
    $(templateViewBox).find('.jqte_editor').css({ height: '350px' });
    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
    let saveCmd = $('<input id="SaveNewTemplate" type="button" value=" Save" class="action-btn"/>');
    $(saveCmd).appendTo($(templateCmdBar));
    $(saveCmd).data('templateData', templateData);
    $(templateCmdBar).append($('<span>  </span>'));
    $(saveCmd).on('click', (evt)=>{
			//let readyState = readySwitch.getState();
			let readyState = $(readySwitchBox).val();
			onSaveNewCmdClick(evt, readyState, true)
		});
    let cancelCmd = $('<input type="button" value=" Cancel "/>');
    $(cancelCmd).appendTo($(templateCmdBar));
    $(cancelCmd).on('click',(evt)=>{$(cancelCmd).trigger('opentemplatedesign')});

		$(".mainfull").empty();
		$(".mainfull").append($(tableControlInputView));
		$(".mainfull").append($(templateViewBox)).append($(templateCmdBar));

  }

  const onViewCmdClick = async function(evt) {
    const viewCmd = $(evt.currentTarget);
		const templateData = $(viewCmd).data('templateData');
    let rqParams = {};
    let apiUrl = '/api/template/select/' + templateData.templateId;
    let response = await common.doCallApi(apiUrl, rqParams);
		if (response.status.code == 200){
	    let templateNameBox = $('<div style="width: 100%; text-align: center;"></div>');
	    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
	    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
	    if (response.Record.length > 0) {
	      $(templateNameBox).append($('<h4>' + response.Record[0].Name + '</h4>'));
	      let thisTemplate = response.Record[0].Content;
	      $(templateViewBox).html(thisTemplate);
	      let editCmd = $('<input type="button" value=" Edit"/>');
	      $(editCmd).appendTo($(templateCmdBar));
	      $(editCmd).data('templateData', templateData);
	      $(templateCmdBar).append($('<span>  </span>'));
	      $(editCmd).on('click', onEditCmdClick);
	      let backCmd = $('<input type="button" value=" Back "/>');
	      $(backCmd).appendTo($(templateCmdBar));
	      $(backCmd).on('click',(evt)=>{$(backCmd).trigger('opentemplatedesign')});
	    } else {
	      $(templateViewBox).append($('<span>ไม่พบรายการ Template รายการนี้</span>'));
	    }
	    $(".mainfull").empty().append($(templateNameBox)).append($(templateViewBox)).append($(templateCmdBar));
		} else if (response.status.code == 210){
			let rememberme = localStorage.getItem('rememberme');
			if (rememberme == 1) {
				let newUserData = await apiconnector.doCallNewTokenApi();
				localStorage.setItem('token', newUserData.token);
				localStorage.setItem('userdata', JSON.stringify(newUserData.data));
				onViewCmdClick(evt);
			} else {
				common.doUserLogout(wsm);
			}

		}
  }

  const onEditCmdClick = async function(evt) {
    const editCmd = $(evt.currentTarget);
		const templateData = $(editCmd).data('templateData');
		//console.log(templateData);
    let jqtePluginStyleUrl = '../../lib/jqte/jquery-te-1.4.0.css';
    $('head').append('<link rel="stylesheet" href="' + jqtePluginStyleUrl + '" type="text/css" />');
    $('head').append('<link rel="stylesheet" href="../case/css/scanpart.css" type="text/css" />');
    let jqtePluginScriptUrl = '../../lib/jqte/jquery-te-1.4.0.min.js';
    $('head').append('<script src="' + jqtePluginScriptUrl + '"></script>');

    let rqParams = {};
    let apiUrl = '/api/template/select/' + templateData.templateId;
    let response = await common.doCallApi(apiUrl, rqParams);

    let templateNameInput = $('<input type="text" id="TemplateName" style="width: 310px;"/>');
    let modalityInput = $('<select id="Modality" style="width: 80px;"></select>');

		common.modalitySelectItem.forEach((item, i) => {
			let optionItem = $('<option value="' + item +'">' + item + '</option>');
			$(modalityInput).append($(optionItem));
		});

    let hospitalInput = $('<input type="text" id="Hospital" style="width: 310px;"/>');
		let modifyHospitalListCmd = $('<input type="button" id="ModifyHospitalListCmd" value=" ... " class="action-btn"; style="margin-left: 10px;"/>');
    let studyDescriptionInput = $('<input type="text" id="StudyDescription" style="width: 310px;"/>');
		let showLegentCmd = common.doCreateLegentCmd(common.doShowStudyDescriptionLegentCmdClick);
		/*
		let readySwitchBox = $('<div style="position: relative; display: inline-block; top: 0px;"></div>');
		let readyOption = {onActionCallback: ()=>{}, offActionCallback: ()=>{}};
		let readySwitch = $(readySwitchBox).readystate(readyOption);
		*/
		let readySwitchBox = $('<select></select>');
		$(readySwitchBox).append('<option value="1">Yes</option>');
		$(readySwitchBox).append('<option value="0">No</option>');

		let tableControlInputView = $('<table width="100% cellpadding="2" cellspacing="2" border="0"></table>');
		let tableRow = $('<tr></tr>');
		$(tableRow).append($('<td width="25%" align="left"><span style="font-weight: bold;">ขื่อ Template:</span></td>'));
		let inputCell = $('<td width="*" align="left"></td>');
		$(inputCell).append($(templateNameInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Modality:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(modalityInput))
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Hospital:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(hospitalInput)).append($(modifyHospitalListCmd));
		$(modifyHospitalListCmd).data('templateData', templateData);
		$(modifyHospitalListCmd).on('click', onModifyHospitalList);
		$(hospitalInput).attr('readonly', true);
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Associated Study Description:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(studyDescriptionInput)).append($(showLegentCmd));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

		tableRow = $('<tr></tr>');
		$(tableRow).append($('<td align="left"><span style="font-weight: bold;">Auto Apply:</span></td>'));
		inputCell = $('<td align="left"></td>');
		$(inputCell).append($(readySwitchBox));
		$(tableRow).append($(inputCell));
		$(tableControlInputView).append($(tableRow));

    let templateViewBox = $('<div style="width: 100%; border: 2px solid grey; background-color: #ccc;"></div>');
    let simpleEditor = $('<input type="text" id="SimpleEditor"/>');
    $(simpleEditor).appendTo($(templateViewBox));
    $(simpleEditor).jqte(simpleEditorConfig);
    $(templateViewBox).find('.jqte_editor').css({ height: '350px' });
    let templateCmdBar = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
    if (response.Record.length > 0) {
			$(modifyHospitalListCmd).data('hospitalsData', response.Record[0].Hospitals);
			let hosValues = [];
			if (response.Record[0].Hospitals){
				await response.Record[0].Hospitals.forEach((item, i) => {
					if (item.id != 0){
						let mapItem = templateData.hospitalmap.find((map)=>{
							if (map.id == item.id) {
								return map;
							}
						});
						if (mapItem){
							hosValues.push(mapItem.Hos_Name);
						}
					} else {
						hosValues.push('All');
					}
				});
			}
      $(templateNameInput).val(response.Record[0].Name);
			$(modalityInput).val(response.Record[0].Modality);
			$(hospitalInput).val(hosValues.join(', '));
			$(studyDescriptionInput).val(response.Record[0].StudyDescription);
			/*
			if (response.Record[0].AutoApply == 1){
				readySwitch.onAction()
			}
			*/
      $(templateViewBox).find('#SimpleEditor').jqteVal(response.Record[0].Content);
      let saveCmd = $('<input type="button" id="SaveEditCmd" value=" Save" class="action-btn"/>');
      $(saveCmd).appendTo($(templateCmdBar));
      $(saveCmd).data('templateData', templateData);
      $(templateCmdBar).append($('<span>  </span>'));
      $(saveCmd).on('click', (evt)=>{
				//let readyState = readySwitch.getState();
				let readyState = $(readySwitchBox).val();
				onSaveEditCmdClick(evt, readyState);
			});
      let cancelCmd = $('<input type="button" value=" Cancel "/>');
      $(cancelCmd).appendTo($(templateCmdBar));
      $(cancelCmd).on('click',(evt)=>{$(cancelCmd).trigger('opentemplatedesign')});
    } else {
      $(templateViewBox).append($('<span>ไม่พบรายการ Template รายการนี้</span>'));
    }
    $(".mainfull").empty();
		$(".mainfull").append($(tableControlInputView));
		$(".mainfull").append($(templateViewBox)).append($(templateCmdBar));
  }

	const onModifyHospitalList = function(evt){
		const modifyHosCmd = $(evt.currentTarget);
		const templateData = $(modifyHosCmd).data('templateData');

		let hospitalOptionBox = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');

		let selectHospitalOptionGuideRow = $('<tr></tr>');
		$(selectHospitalOptionGuideRow ).css({'background-color': common.headBackgroundColor, 'color': 'white'});
		$(selectHospitalOptionGuideRow ).appendTo($(hospitalOptionBox));
		let guideCell = $('<td colspan="2" align="center"></td>');
		$(guideCell).append($('<h3>Apply this template to</h3>'));
		$(guideCell).appendTo($(selectHospitalOptionGuideRow));

		let allAospitalItemRow = $('<tr></tr>');
		let selectCell = $('<td width="15%" align="center"></td>');
		let hospitalNameCell = $('<td width="*" align="left"></td>');
		$(allAospitalItemRow).append($(selectCell)).append($(hospitalNameCell));
		$(hospitalNameCell).text('All');
		let allCheckBox = $('<input type="checkbox" id="AllCmd" name="hospitalIds[]" value="0" style="transform: scale(1.9);"/>');
		$(selectCell).append($(allCheckBox));
		$(hospitalOptionBox).append($(allAospitalItemRow));
		$(allCheckBox).on('click', (evt)=>{
			let isCheckAll = $(evt.currentTarget).prop('checked');
			if (isCheckAll){
				//$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('checked', true).prop('disabled', true);
				$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('checked', false).prop('disabled', true);
			} else {
				//$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('checked', false).prop('disabled', false);
				$('input[type="checkbox"][name="hospitalIds[]"]').not('#AllCmd').prop('disabled', false);
			}
		});

		templateData.hospitalmap.forEach(async (hos, i) => {
			let hospitalItemRow = $('<tr></tr>');
			selectCell = $('<td align="center"></td>');
			hospitalNameCell = $('<td align="left"></td>');
			$(hospitalItemRow).append($(selectCell)).append($(hospitalNameCell));
			$(hospitalNameCell).text(hos.Hos_Name);
			let checkBox = $('<input type="checkbox" name="hospitalIds[]" value="' + hos.id + '" style="transform: scale(1.9);"/>');
			$(selectCell).append($(checkBox));
			$(hospitalOptionBox).append($(hospitalItemRow));

			if (templateData.Hospitals){
				let findMapSelected = await templateData.Hospitals.find((item)=>{
					if (item.id == hos.id) {
						return item;
					}
				});
				if (findMapSelected){
					$(checkBox).prop('checked', true);
				}
			}
		});

		let cmdRow = $('<tr></tr>');
		$(cmdRow).css({'background-color': common.headBackgroundColor, 'color': 'white'});
		$(cmdRow).appendTo($(hospitalOptionBox));
		let cmdCell = $('<td colspan="2" align="center"></td>');
		$(cmdRow).append($(cmdCell));

		let okCmd = $('<input type="button" value=" OK " class="action-btn"/>');
		$(okCmd).on('click', async (evt)=>{
			var values = [];
			await $('input[type="checkbox"][name="hospitalIds[]"]:checked').each(function(i,v){
			  values.push($(v).val());
			});
			//console.log(values);
			let modifyValues = [];
			let hospitalResult = [];
			values.forEach((item, i) => {
				if (item != 0){
					let mapItem = templateData.hospitalmap.find((map)=>{
						if (map.id == item) {
							return map;
						}
					});
					if (mapItem){
						modifyValues.push(mapItem.Hos_Name);
						hospitalResult.push(mapItem);
					}
				} else {
					modifyValues.push('All');
					hospitalResult.push({id: 0});
				}
			});
			$('#ModifyHospitalListCmd').data('hospitalsData', hospitalResult);
			$('#Hospital').val(modifyValues.join(', '));
			$(cancelCmd).click();
		});
		let cancelCmd = $('<input type="button" value=" Cancel " style="margin-left: 10px;"/>');
		$(cancelCmd).on('click', (evt)=>{
			$('#quickreply').empty();
			$('#quickreply').removeAttr('style');
		});

		$(cmdCell).append($(okCmd)).append($(cancelCmd));

		$('#quickreply').css(common.quickReplyDialogStyle);
		let hopitalOptionBoxStyle = { 'background-color': '#fefefe', 'margin': '70px auto', 'padding': '0px', 'border': '2px solid #888', 'width': '420px', 'height': 'auto'};
		$(hospitalOptionBox).css(hopitalOptionBoxStyle);
		$('#quickreply').append($(hospitalOptionBox));
	}

  const onDeleteCmdClick = async function(evt) {
    const deleteCmd = $(evt.currentTarget);
		const templateData = $(deleteCmd).data('templateData');
    let yourAnswer = confirm('โปรดยืนยันการลบ Template โดยคลิก ตกลง หรือ OK');
    if (yourAnswer === true) {
      let callDeleteTemplateUrl = '/api/template/delete';
      let templateId = templateData.templateId;
      let rqParams = {id: templateId}
      let response = await common.doCallApi(callDeleteTemplateUrl, rqParams);
      if (response.status.code == 200) {
        $.notify("ลบรายการ Template สำเร็จ", "success");
        $(deleteCmd).trigger('opentemplatedesign')
      } else {
        $.notify("ลบรายการ Template ขัดข้อง", "`error`");
      }
    }
  }

  const onSaveNewCmdClick = async function(evt, autoApply, triggerOption){
    const saveEditCmd = $(evt.currentTarget);
		const templateData = $(saveEditCmd).data('templateData');
		const hospitalsData = $('#ModifyHospitalListCmd').data('hospitalsData');
    let templaeName = $('#TemplateName').val();
		let modality = $('#Modality').val();
    let studyDescription = $('#StudyDescription').val();
    let templateContent = $('#SimpleEditor').val();
    //let templateId = templateData.templateId;

		var callSaveNew = function(data){
			let userdata = JSON.parse(localStorage.getItem('userdata'));;
			let radioId = userdata.id;
			let callAddTemplateUrl = '/api/template/add';
			let rqParams = {data: data, radioId: radioId};
			common.doCallApi(callAddTemplateUrl, rqParams).then((response)=>{
				if (response.status.code == 200) {
					$.notify("บันทึก Template สำเร็จ", "success");
					if (triggerOption){
						$(saveEditCmd).trigger('opentemplatedesign');
					}
				} else {
					$.notify("บันทึก Template ขัดข้อง", "`error`");
				}
			});
		}

		if (templaeName === '') {
      $.notify("ชื่อ Template ต้องไม่ว่าง", "error");
      $('#TemplateName').css('border', '1px solid red');
		} else if (modality === ''){
			$('#TemplateName').css('border', '');
			$.notify("Modality ต้องไม่ว่าง", "error");
      $('#Modality').css('border', '1px solid red;');
		} else if ((!hospitalsData) || (hospitalsData == '')) {
			$('#Modality').css('border', '');
			$.notify("Hospital ต้องไม่ว่าง", "error");
			$('#Hospital').css('border', '1px solid red;');
		} else if (studyDescription === ''){
			$('#Hospital').css('border', '');
			$.notify("Study Description ต้องไม่ว่าง", "error");
			$('#StudyDescription').css('border', '1px solid red;');
    } else if (templateContent === ''){
      $('#StudyDescription').css('border', '');
      $.notify("ข้อมูล Template ต้องไม่ว่าง", "error");
      $('#SimpleEditor').css('border', '1px solid red;');
    } else {
      $('#SimpleEditor').css('border', '');
			let checkData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription};
			let saveData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription, Content: templateContent, AutoApply: autoApply};
			if (autoApply == true) {
				callCheckTemplateDuplicate(checkData).then((result)=>{
					console.log(result);
					if ((result) && (result.Name)) {
						let radAlertMsg = $('<div></div>');
						$(radAlertMsg).append($('<p>ระบบฯ ตรวจสอบพบ Template ที่มีคุณสมบัติตรงกับ Template ใหม่ และเปิดใช้งาน Auto Apply อยู่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ต้องการ</b> ให้ Template ใหม่เป็น Auto Apply แทนรายการเดิม คลิกปุ่ม <b>ตกลง</b> เพิ่อบันทึกและตั้งค่า Auto Apply ใหม่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ไม่ต้องการ</b> คลิกปุ่ม <b>ยกเลิก</b> เพิ่อปิดกล่องนี้และตั้งค่า Auto Apply ใหม</p>'));
						const radconfirmoption = {
							title: 'โปรดยืนยันการตั้งค่า Auto Apply',
							msg: $(radAlertMsg),
							width: '420px',
							onOk: function(evt) {
								callSaveNew(saveData);
								radConfirmBox.closeAlert();
							},
							onCancel: function(evt){
								radConfirmBox.closeAlert();
							}
						}
						let radConfirmBox = $('body').radalert(radconfirmoption);
					} else {
						callSaveNew(saveData);
					}
				});
			} else {
				callSaveNew(saveData);
			}
    }
  }

  const onSaveEditCmdClick = async function(evt, autoApply){
    const saveEditCmd = $(evt.currentTarget);
		const templateData = $(saveEditCmd).data('templateData');
		const hospitalsData = $('#ModifyHospitalListCmd').data('hospitalsData');
    let templaeName = $('#TemplateName').val();
		let modality = $('#Modality').val();
    let studyDescription = $('#StudyDescription').val();
    let templateContent = $('#SimpleEditor').val();
    let templateId = templateData.templateId;

		var callSaveUpdate = function(data){
			let userdata = JSON.parse(localStorage.getItem('userdata'));;
			let radioId = userdata.id;
			let callUpdateTemplateUrl = '/api/template/update';
			let rqParams = {data: data, id: templateId, radioId: radioId};
			common.doCallApi(callUpdateTemplateUrl, rqParams).then((response)=>{
				if (response.status.code == 200) {
					$.notify("บันทึก Template สำเร็จ", "success");
					$(saveEditCmd).trigger('opentemplatedesign')
				} else {
					$.notify("บันทึก Template ขัดข้อง", "`error`");
				}
			});
		}

    if (templaeName === '') {
      $.notify("ชื่อ Template ต้องไม่ว่าง", "error");
      $('#TemplateName').css('border', '1px solid red');
		} else if (modality === ''){
			$('#TemplateName').css('border', '');
			$.notify("Modality ต้องไม่ว่าง", "error");
      $('#Modality').css('border', '1px solid red;');
		} else if ((!hospitalsData) || (hospitalsData == '')) {
			$('#Modality').css('border', '');
			$.notify("Hospital ต้องไม่ว่าง", "error");
			$('#Hospital').css('border', '1px solid red;');
		} else if (studyDescription === ''){
			$('#Hospital').css('border', '');
			$.notify("Study Description ต้องไม่ว่าง", "error");
			$('#StudyDescription').css('border', '1px solid red;');
    } else if (templateContent === ''){
      $('#StudyDescription').css('border', '');
      $.notify("ข้อมูล Template ต้องไม่ว่าง", "error");
      $('#SimpleEditor').css('border', '1px solid red;');
    } else {
      $('#SimpleEditor').css('border', '');
			let checkData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription};
			let saveData = {Name: templaeName, Modality: modality, Hospitals: hospitalsData, StudyDescription: studyDescription, Content: templateContent, AutoApply: autoApply};
			if (autoApply == true) {
				callCheckTemplateDuplicate(checkData).then((result)=>{
					console.log(result);
					if ((result) && (result.Name)) {
						let radAlertMsg = $('<div></div>');
						$(radAlertMsg).append($('<p>ระบบฯ ตรวจสอบพบ Template ที่มีคุณสมบัติตรงกับ Template ใหม่ และเปิดใช้งาน Auto Apply อยู่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ต้องการ</b> ให้ Template ใหม่เป็น Auto Apply แทนรายการเดิม คลิกปุ่ม <b>ตกลง</b> เพิ่อบันทึกและตั้งค่า Auto Apply ใหม่</p>'));
						$(radAlertMsg).append($('<p>หาก <b>ไม่ต้องการ</b> คลิกปุ่ม <b>ยกเลิก</b> เพิ่อปิดกล่องนี้และตั้งค่า Auto Apply ใหม</p>'));
						const radconfirmoption = {
							title: 'โปรดยืนยันการตั้งค่า Auto Apply',
							msg: $(radAlertMsg),
							width: '420px',
							onOk: function(evt) {
								callSaveUpdate(saveData);
								radConfirmBox.closeAlert();
							},
							onCancel: function(evt){
								radConfirmBox.closeAlert();
							}
						}
						let radConfirmBox = $('body').radalert(radconfirmoption);
					} else {
						callSaveUpdate(saveData);
					}
				});
			} else {
				callSaveUpdate(saveData);
			}
    }
  }

  const doCreateTemplateTitlePage = function() {
    const templateTitle = 'Template';
    let templateTitleBox = $('<div></div>');
    let logoPage = $('<img src="/images/format-design-icon.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(logoPage).appendTo($(templateTitleBox));
    let titleText = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>' + templateTitle + '</h3></div>');
    $(titleText).appendTo($(templateTitleBox));
    return $(templateTitleBox);
  }

  const doCallMyTemplate = function() {
    return new Promise(async function(resolve, reject) {
      const main = require('../main.js');
			let userdata = JSON.parse(main.doGetUserData());
			let radioId = userdata.id;
			let rqParams = {};
			let apiUrl = '/api/template/options/' + radioId;
			try {
				let response = await common.doCallApi(apiUrl, rqParams);
        resolve(response);
			} catch(e) {
	      reject(e);
    	}
    });
  }

  const doCreateHeaderRow = function(){
    let headerRow = $('<div style="display: table-row; width: 100%;"></div>');

		let headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>#</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>ขื่อ Template</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Modality</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Hospital</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Associated Study Description</span>');
		$(headColumn).appendTo($(headerRow));

    headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>คำสั่ง</span>');
		$(headColumn).appendTo($(headerRow));

		headColumn = $('<div style="display: table-cell; text-align: center;" class="header-cell"></div>');
		$(headColumn).append('<span>Auto Apply</span>');
		$(headColumn).appendTo($(headerRow));

    return $(headerRow);
  }

  const doCreateTemplateItemRow = function(i, tmItem){
    return new Promise(function(resolve, reject) {
      const templateData = {templateId: tmItem.Value, Hospitals: tmItem.Hospitals, hospitalmap: tmItem.hospitalmap};
      let tmRow = $('<div style="display: table-row; width: 100%;"></div>');

      let tmCell = $('<div style="display: table-cell; text-align: center;"></div>');
  		$(tmCell).append('<span>' + (i+1) + '</span>');
  		$(tmCell).appendTo($(tmRow));

      tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + tmItem.DisplayText + '</span>');
  		$(tmCell).appendTo($(tmRow));

			tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + (tmItem.Modality)? tmItem.Modality:'' + '</span>');
  		$(tmCell).appendTo($(tmRow));

			let hosList = [];
			if (tmItem.Hospitals){
				tmItem.Hospitals.forEach((item, i) => {
					if (item.id != 0){
						let mapItem = templateData.hospitalmap.find((map)=>{
							if (map.id == item.id) {
								return map;
							}
						});
						if (mapItem){
							hosList.push(mapItem.Hos_Name);
						}
					} else {
						hosList.push('All');
					}
				});
			}
			tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + hosList.join(', ') + '</span>');
  		$(tmCell).appendTo($(tmRow));

			tmCell = $('<div style="display: table-cell; text-align: left;"></div>');
  		$(tmCell).append('<span>' + (tmItem.StudyDescription)? tmItem.StudyDescription:'' + '</span>');
  		$(tmCell).appendTo($(tmRow));

      tmCell = $('<div style="display: table-cell; text-align: center;"></div>');
  		$(tmCell).appendTo($(tmRow));

      let viewCmd = $('<input type="button" value=" View "/>');
      $(viewCmd).appendTo($(tmCell));
      $(viewCmd).data('templateData', templateData);
      $(viewCmd).on('click', onViewCmdClick);
      $(tmCell).append($('<span>  </span>'));

      let editCmd = $('<input type="button" value=" Edit "/>');
      $(editCmd).appendTo($(tmCell));
      $(editCmd).data('templateData', templateData);
      $(editCmd).on('click', onEditCmdClick);
      $(tmCell).append($('<span>  </span>'));

      let deleteCmd = $('<input type="button" value=" Delete "/>');
      $(deleteCmd).appendTo($(tmCell));
      $(deleteCmd).data('templateData', templateData);
      $(deleteCmd).on('click', onDeleteCmdClick);

			tmCell = $('<div style="display: table-cell; text-align: center;"></div>');
  		$(tmCell).appendTo($(tmRow));
			let readySwitchBox = $('<div style="position: relative; display: inline-block; top: 0px;"></div>');
			let readyOption = {
				onActionCallback: ()=>{doUpdateAutoApply({templateId: tmItem.Value, state: 1});},
				offActionCallback: ()=>{doUpdateAutoApply({templateId: tmItem.Value, state: 0});}
			};
			let readySwitch = $(readySwitchBox).readystate(readyOption);
			$(readySwitchBox).appendTo($(tmCell));
			if (tmItem.AutoApply == 1) {
				readySwitch.onAction();
			} else {
				readySwitch.offAction();
			}

      resolve($(tmRow));
    });
  }

	const doCreatAaddNewTemplateBox = function(templateRows){
		let addNewTemplateBox = $('<div style="width: 100%; text-align: right; padding: 4px;"></div>');
		let addNewTemplateCmd = $('<input type="button" value=" + New Template " class="action-btn"/>');
		$(addNewTemplateCmd).appendTo($(addNewTemplateBox));
		$(addNewTemplateCmd).on('click', onAddNewTemplateClick);
		if (templateRows.length > 0) {
			$(addNewTemplateCmd).data('templateData', templateRows[0]);
		} else {
			$(addNewTemplateCmd).data('templateData', templateRows);
		}
		return $(addNewTemplateBox);
	}

	const doCreateTemplateTable = function(templateRows){
    return new Promise(async function(resolve, reject) {
			let myTemplateView = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let tempalateHearder = doCreateHeaderRow();
			$(myTemplateView).append($(tempalateHearder));
			//let templateLists = myTemplate.Options;
			if (templateRows.length > 0) {
				for (let i=0; i < templateRows.length; i++) {
					let tmItem = templateRows[i];
					let tmRow = await doCreateTemplateItemRow(i, tmItem);
					$(myTemplateView).append($(tmRow));
				}
			} else {
				let notFoundMessage = $('<h3>ไม่พบรายการ Template ของคุณในขณะนี้</h3>')
				$(myTemplateView).append($(notFoundMessage));
			}
			resolve($(myTemplateView));
		});
	}

  const doCreateTemplatePage = function(){
    return new Promise(async function(resolve, reject) {
      $('body').loading('start');
      let myTemplatePage = $('<div style="width: 100%;"></div>');
      let myTemplate = await doCallMyTemplate();
			//console.log(myTemplate);
			if (myTemplate.status.code == 200){
				let addNewTemplateBox = doCreatAaddNewTemplateBox(myTemplate.Options);
				let myTemplateView = await doCreateTemplateTable(myTemplate.Options);
				$(myTemplatePage).append($(addNewTemplateBox));
				$(myTemplatePage).append($(myTemplateView));
				resolve($(myTemplatePage));
	      $('body').loading('stop');
			} else if (myTemplate.status.code == 210){
				reject({error: {code: 210, cause: 'Token Expired!'}});
			} else {
				let apiError = 'api error at doCallMyTemplate';
				console.log(apiError);
				reject({error: apiError});
			}
    });
  }

	const doUpdateAutoApply = function(autoApplyData){
		let callUpdateTemplateAutoApplyUrl = '/api/template/autoapply/update';
		let userdata = JSON.parse(localStorage.getItem('userdata'));;
		let radioId = userdata.id;
		let rqParams = {data: {AutoApply: autoApplyData.state}, id: autoApplyData.templateId, radioId: radioId};
		common.doCallApi(callUpdateTemplateAutoApplyUrl, rqParams).then(async(response)=>{
			if (response.status.code == 200) {
				$.notify("บันทึก Template สำเร็จ", "success");
				let myTemplate = response.result.Options;
				let addNewTemplateBox = doCreatAaddNewTemplateBox(myTemplate);
				let myTemplateView = await doCreateTemplateTable(myTemplate);
				let myTemplatePage = $('<div style="width: 100%;"></div>');
				$(myTemplatePage).append($(addNewTemplateBox));
				$(myTemplatePage).append($(myTemplateView));
				$(".mainfull").empty().append($(myTemplatePage));
			} else {
				$.notify("บันทึก Template ขัดข้อง", "`error`");
			}
		});
	}

	const callCheckTemplateDuplicate = function(data){
		return new Promise(async function(resolve, reject) {
			let userdata = JSON.parse(localStorage.getItem('userdata'));;
			let radioId = userdata.id;
			let callCheckTemplateUrl = '/api/template/check/duplicate';
			let rqParams = {data: data, radioId: radioId};
			common.doCallApi(callCheckTemplateUrl, rqParams).then((response)=>{
				if (response.status.code == 200) {
					resolve(response.result);
				} else {
					$.notify("Can not find Duplicate Auto Apply Template", "`error`");
					resolve();
				}
			});
		});
	}

  return {
		/* Event Listener */
		onModifyHospitalList,
		onSaveNewCmdClick,
		/* Medthod */
    doCreateTemplateTitlePage,
    doCreateHeaderRow,
    doCallMyTemplate,
    doCreateTemplatePage
	}
}
