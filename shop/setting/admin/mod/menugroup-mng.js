module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);

  const groupmenuTableFields = [
		{fieldName: 'GroupName', displayName: 'ชื่อกลุ่มเมนู', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'GroupDesc', displayName: 'รายละเอียด', width: '30%', align: 'left', inputSize: '30', verify: false, showHeader: true},
		{fieldName: 'GroupPicture', displayName: 'โลโก้', width: '25%', align: 'center', inputSize: '30', verify: false, showHeader: true}
	];

  const doShowMenugroupItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
      $(workAreaBox).empty();
      let groupmenuRes = await common.doCallApi('/api/shop/menugroup/list/by/shop/' + shopData.id, {});
			let groupmenuItems = groupmenuRes.Records;
      let titlePageBox = $('<div style="padding: 4px;">รายการกลุ่มเมนูของร้าน</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
      $(workAreaBox).append($(titlePageBox));
      let newGroupmenuCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
      let newGroupmenuCmd = $('<input type="button" value=" + New Group Menu " class="action-btn"/>');
      $(newGroupmenuCmd).on('click', (evt)=>{
        doOpenNewGroupmenuForm(shopData, workAreaBox);
      });
      $(newGroupmenuCmdBox).append($(newGroupmenuCmd))
      $(workAreaBox).append($(newGroupmenuCmdBox));

      let groupmenuTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let headerRow = $('<tr></tr>');
			$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
			for (let i=0; i < groupmenuTableFields.length; i++) {
        if (groupmenuTableFields[i].showHeader) {
          $(headerRow).append($('<td width="' + groupmenuTableFields[i].width + '" align="center"><b>' + groupmenuTableFields[i].displayName + '</b></td>'));
        }
			}
			$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
			$(groupmenuTable).append($(headerRow));

			for (let x=0; x < groupmenuItems.length; x++) {
				let itemRow = $('<tr></tr>');
				$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
				let item = groupmenuItems[x];
				for (let i=0; i < groupmenuTableFields.length; i++) {
					let field = $('<td align="' + groupmenuTableFields[i].align + '"></td>');
					if (groupmenuTableFields[i].fieldName !== 'GroupPicture') {
						$(field).text(item[groupmenuTableFields[i].fieldName]);
						$(itemRow).append($(field));
					} else {
						let groupmenuLogoIcon = new Image();
						groupmenuLogoIcon.id = 'GroupPicture_' + item.id;
						if (item['GroupPicture'] !== ''){
							groupmenuLogoIcon.src = item['GroupPicture'];
						} else {
							groupmenuLogoIcon.src = '/shop/favicon.ico'
						}
						$(groupmenuLogoIcon).css({"width": "80px", "height": "auto", "cursor": "pointer", "padding": "2px", "border": "2px solid #ddd"});
						$(groupmenuLogoIcon).on('click', (evt)=>{
							window.open(item['GroupPicture'], '_blank');
						});
						let groupMenuLogoIconBox = $('<div></div>').css({"position": "relative", "width": "fit-content", "border": "2px solid #ddd"});
				    $(groupMenuLogoIconBox).append($(groupmenuLogoIcon));
						let editGroupMenuLogoCmd = $('<img src="../../images/tools-icon-wh.png"/>').css({'position': 'absolute', 'width': '25px', 'height': 'auto', 'cursor': 'pointer', 'right': '2px', 'bottom': '2px', 'display': 'none', 'z-index': '21'});
						$(editGroupMenuLogoCmd).attr('title', 'เปลี่ยนภาพใหม่');
						$(groupMenuLogoIconBox).append($(editGroupMenuLogoCmd));
						$(groupMenuLogoIconBox).hover(()=>{
							$(editGroupMenuLogoCmd).show();
						},()=>{
							$(editGroupMenuLogoCmd).hide();
						});
						$(editGroupMenuLogoCmd).on('click', (evt)=>{
							evt.stopPropagation();
							doStartUploadPicture(evt, groupmenuLogoIcon, field, item.id, shopData, workAreaBox);
						});
						$(field).append($(groupMenuLogoIconBox));

						let clearGroupmenuLogoCmd = $('<input type="button" value=" เคลียร์รูป " class="action-btn"/>');
						$(clearGroupmenuLogoCmd).on('click', async (evt)=>{
							let callRes = await common.doCallApi('/api/shop/menugroup/change/logo', {data: {GroupPicture: ''}, id: item.id});
							groupmenuLogoIcon.src = '/shop/favicon.ico'
						});
						$(field).append($('<div style="width: 100%;"></div>').append($(clearGroupmenuLogoCmd)));
						$(itemRow).append($(field));
					}
				}
				let editGroupmenuCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editGroupmenuCmd).on('click', (evt)=>{
					doOpenEditGroupmenuForm(shopData, workAreaBox, item);
				});
				let deleteGroupmenuCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteGroupmenuCmd).on('click', (evt)=>{
					doDeleteGroupmenu(shopData, workAreaBox, item.id);
				});

				let commandCell = $('<td align="center"></td>');
				$(commandCell).append($(editGroupmenuCmd));
				$(commandCell).append($(deleteGroupmenuCmd));
				$(itemRow).append($(commandCell));
				$(groupmenuTable).append($(itemRow));
			}
			$(workAreaBox).append($(groupmenuTable));
      resolve();
    });
  }

  const doStartUploadPicture = function(evt, groupmenuLogoIcon, imageBox, groupId, shopData, workAreaBox){
    let fileBrowser = $('<input type="file"/>');
    $(fileBrowser).attr("name", 'groupmenulogo');
    $(fileBrowser).attr("multiple", true);
    $(fileBrowser).css('display', 'none');
    $(fileBrowser).on('change', function(e) {
      const defSize = 10000000;
      var fileSize = e.currentTarget.files[0].size;
      var fileType = e.currentTarget.files[0].type;
      if (fileSize <= defSize) {
        doUploadImage(fileBrowser, groupmenuLogoIcon, fileType, groupId, shopData, workAreaBox);
      } else {
        $(imageBox).append($('<span>' + 'File not excess ' + defSize + ' Byte.' + '</span>'));
      }
    });
    $(fileBrowser).appendTo($(imageBox));
    $(fileBrowser).click();
  }

  const doUploadImage = function(fileBrowser, groupmenuLogoIcon, fileType, groupId, shopData, workAreaBox){
    var uploadUrl = '/api/shop/upload/menugrouplogo';
    $(fileBrowser).simpleUpload(uploadUrl, {
      success: async function(data){
        $(fileBrowser).remove();
        let shopRes = await common.doCallApi('/api/shop/menugroup/change/logo', {data: {GroupPicture: data.link}, id: groupId});
        setTimeout(async() => {
          await doShowMenugroupItem(shopData, workAreaBox);
        }, 400);
      },
    });
  }

	const doCreateNewGroupmenuForm = function(groupmenuData){
    let groupmenuFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < groupmenuTableFields.length; i++) {
			if (groupmenuTableFields[i].fieldName !== 'GroupPicture') {
				let fieldRow = $('<tr></tr>');
				let labelField = $('<td width="40%" align="left">' + groupmenuTableFields[i].displayName + (groupmenuTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
				let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
				let inputValue = $('<input type="text" id="' + groupmenuTableFields[i].fieldName + '" size="' + groupmenuTableFields[i].inputSize + '"/>');
				if ((groupmenuData) && (groupmenuData[groupmenuTableFields[i].fieldName])) {
					$(inputValue).val(groupmenuData[groupmenuTableFields[i].fieldName]);
				}
				$(inputField).append($(inputValue));
				$(fieldRow).append($(labelField));
				$(fieldRow).append($(inputField));
				$(groupmenuFormTable).append($(fieldRow));
			}
		}
		return $(groupmenuFormTable);
  }

	const doVerifyGroupmenuForm = function(){
    let isVerify = true;
		let groupmenuDataForm = {};
		for (let i=0; i < groupmenuTableFields.length; i++) {
			let curValue = $('#'+groupmenuTableFields[i].fieldName).val();
			if (groupmenuTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+groupmenuTableFields[i].fieldName).css({'border': ''});
					groupmenuDataForm[groupmenuTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+groupmenuTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					groupmenuDataForm[groupmenuTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		return groupmenuDataForm;
  }

  const doOpenNewGroupmenuForm = function(shopData, workAreaBox) {
		let newGroupmenuForm = doCreateNewGroupmenuForm();
    let radNewGroupmenuFormBox = $('<div></div>');
    $(radNewGroupmenuFormBox).append($(newGroupmenuForm));
    const newgroupmenuformoption = {
      title: 'เพิ่มกลุ่มเมนูใหม่เข้าร้าน',
      msg: $(radNewGroupmenuFormBox),
      width: '520px',
      onOk: async function(evt) {
        let newGroupmenuFormObj = doVerifyGroupmenuForm();
        if (newGroupmenuFormObj) {
          let hasValue = newGroupmenuFormObj.hasOwnProperty('GroupName');
          if (hasValue){
            newGroupmenuFormBox.closeAlert();
						let params = {data: newGroupmenuFormObj, shopId: shopData.id};
            let userRes = await common.doCallApi('/api/shop/menugroup/add', params);
            if (userRes.status.code == 200) {
              $.notify("เพิ่มรายการกลุ่มเมนูสำเร็จ", "success");
              await doShowMenugroupItem(shopData, workAreaBox)
            } else if (userRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการกลุ่มเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการกลุ่มเมนูได้", "error");
            }
          }else {
            $.notify("ข้อมูลไม่ถูกต้อง", "error");
          }
        } else {
          $.notify("ข้อมูลไม่ถูกต้อง", "error");
        }
      },
      onCancel: function(evt){
        newGroupmenuFormBox.closeAlert();
      }
    }
    let newGroupmenuFormBox = $('body').radalert(newgroupmenuformoption);
  }

  const doOpenEditGroupmenuForm = function(shopData, workAreaBox, groupmenuData) {
		let editGroupmenuForm = doCreateNewGroupmenuForm(groupmenuData);
		let radEditGroupmenuFormBox = $('<div></div>');
		$(radEditGroupmenuFormBox).append($(editGroupmenuForm));
		const editgroupmenuformoption = {
			title: 'แก้ไขกลุ่มเมนูของร้าน',
			msg: $(radEditGroupmenuFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editGroupmenuFormObj = doVerifyGroupmenuForm();
				if (editGroupmenuFormObj) {
					let hasValue = editGroupmenuFormObj.hasOwnProperty('GroupName');
					if (hasValue){
						editGroupmenuFormBox.closeAlert();
						let params = {data: editGroupmenuFormObj, id: groupmenuData.id};
						let userRes = await common.doCallApi('/api/shop/menugroup/update', params);
						if (userRes.status.code == 200) {
							$.notify("แก้ไขรายการกลุ่มเมนูสำเร็จ", "success");
							await doShowMenugroupItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการกลุ่มเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการกลุ่มเมนูได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editGroupmenuFormBox.closeAlert();
			}
		}
		let editGroupmenuFormBox = $('body').radalert(editgroupmenuformoption);
  }

  const doDeleteGroupmenu = function(shopData, workAreaBox, groupmenuId){
    let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบกลุ่มเมนูรายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบกลุ่มเมน</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบกลุ่มเมนู',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let groupmenuRes = await common.doCallApi('/api/shop/menugroup/delete', {id: groupmenuId});
				if (groupmenuRes.status.code == 200) {
					$.notify("ลบรายการกลุ่มเมนูสำเร็จ", "success");
					await doShowMenugroupItem(shopData, workAreaBox);
				} else if (userRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการกลุ่มเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการกลุ่มเมนูได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
  }

  return {
    doShowMenugroupItem
  }
}
