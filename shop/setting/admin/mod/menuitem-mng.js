module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);

  const menuitemTableFields = [
		{fieldName: 'MenuName', displayName: 'ชื่อเมนู', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'Desc', displayName: 'รายละเอียด', width: '20%', align: 'left', inputSize: '30', verify: false, showHeader: true},
		{fieldName: 'MenuPicture', displayName: 'รูปเมนู', width: '15%', align: 'center', inputSize: '30', verify: false, showHeader: true},
    {fieldName: 'Price', displayName: 'ราคา', width: '10%', align: 'right', inputSize: '20', verify: true, showHeader: true},
		{fieldName: 'Unit', displayName: 'หน่วย', width: '15%', align: 'center', inputSize: '30', verify: true, showHeader: true}
	];
  const menugroupTableFields = [
		{fieldName: 'GroupName', displayName: 'กลุ่ม', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true}
  ];

  const doShowMenuitemItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
      let menugroupRes = await common.doCallApi('/api/shop/menugroup/options/' + shopData.id, {});
      let menugroups = menugroupRes.Options;
      localStorage.setItem('menugroups', JSON.stringify(menugroups));

      $(workAreaBox).empty();
      let menuitemRes = await common.doCallApi('/api/shop/menuitem/list/by/shop/' + shopData.id, {});
			let menuitemItems = menuitemRes.Records;
      let titlePageBox = $('<div style="padding: 4px;">รายการเมนูของร้าน</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
      $(workAreaBox).append($(titlePageBox));
      let newMenuitemCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
      let newMenuitemCmd = $('<input type="button" value=" + New Menu " class="action-btn"/>');
      $(newMenuitemCmd).on('click', (evt)=>{
        doOpenNewMenuitemForm(shopData, workAreaBox);
      });
      $(newMenuitemCmdBox).append($(newMenuitemCmd))
      $(workAreaBox).append($(newMenuitemCmdBox));

      let menuitemTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let headerRow = $('<tr></tr>');
			$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
			for (let i=0; i < menuitemTableFields.length; i++) {
        if (menuitemTableFields[i].showHeader) {
          $(headerRow).append($('<td width="' + menuitemTableFields[i].width + '" align="center"><b>' + menuitemTableFields[i].displayName + '</b></td>'));
        }
			}
      for (let i=0; i < menugroupTableFields.length; i++) {
        if (menugroupTableFields[i].showHeader) {
          $(headerRow).append($('<td width="' + menugroupTableFields[i].width + '" align="center"><b>' + menugroupTableFields[i].displayName + '</b></td>'));
        }
			}
			$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
			$(menuitemTable).append($(headerRow));

      for (let x=0; x < menuitemItems.length; x++) {
				let itemRow = $('<tr></tr>');
				$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
				let item = menuitemItems[x];
				for (let i=0; i < menuitemTableFields.length; i++) {
					let field = $('<td align="' + menuitemTableFields[i].align + '"></td>');
					if (menuitemTableFields[i].fieldName !== 'MenuPicture') {
						$(field).text(item[menuitemTableFields[i].fieldName]);
						$(itemRow).append($(field));
					} else {
						let menuitemLogoIcon = new Image();
						menuitemLogoIcon.id = 'MenuPicture_' + item.id;
						if ((item['MenuPicture']) && (item['MenuPicture'] !== '')) {
							menuitemLogoIcon.src = item['MenuPicture'];
						} else {
							menuitemLogoIcon.src = '/shop/favicon.ico'
						}
						$(menuitemLogoIcon).css({"width": "80px", "height": "auto", "cursor": "pointer", "padding": "2px", "border": "2px solid #ddd"});
						$(menuitemLogoIcon).on('click', (evt)=>{
							window.open(item['MenuPicture'], '_blank');
						});

						let menuItemLogoIconBox = $('<div></div>').css({"position": "relative", "width": "fit-content", "border": "2px solid #ddd"});
				    $(menuItemLogoIconBox).append($(menuitemLogoIcon));
						let editMenuItemLogoCmd = $('<img src="../../images/tools-icon-wh.png"/>').css({'position': 'absolute', 'width': '25px', 'height': 'auto', 'cursor': 'pointer', 'right': '2px', 'bottom': '2px', 'display': 'none', 'z-index': '21'});
						$(editMenuItemLogoCmd).attr('title', 'เปลี่ยนภาพใหม่');
						$(menuItemLogoIconBox).append($(editMenuItemLogoCmd));
						$(menuItemLogoIconBox).hover(()=>{
							$(editMenuItemLogoCmd).show();
						},()=>{
							$(editMenuItemLogoCmd).hide();
						});
						$(editMenuItemLogoCmd).on('click', (evt)=>{
							evt.stopPropagation();
							doStartUploadPicture(evt, menuitemLogoIcon, field, item.id, shopData, workAreaBox);
						});
						$(field).append($(menuItemLogoIconBox));

						let clearMenuitemLogoCmd = $('<input type="button" value=" เคลียร์รูป " class="action-btn"/>');
						$(clearMenuitemLogoCmd).on('click', async (evt)=>{
							let callRes = await common.doCallApi('/api/shop/menuitem/change/logo', {data: {MenuPicture: ''}, id: item.id});
							menuitemLogoIcon.src = '/shop/favicon.ico'
						});
						$(field).append($('<div style="width: 100%;"></div>').append($(clearMenuitemLogoCmd)));
						$(itemRow).append($(field));
					}
				}
        for (let i=0; i < menugroupTableFields.length; i++) {
          let field = $('<td align="' + menugroupTableFields[i].align + '"></td>');
          $(field).text(item.menugroup[menugroupTableFields[i].fieldName]);
          $(itemRow).append($(field));
        }

				let qrcodeImg = new Image();
				qrcodeImg.id = 'MenuQRCode_' + item.id;
				if ((item.QRCodePicture) && (item.QRCodePicture != '')) {
					let qrLink = '/shop/img/usr/qrcode/' + item.QRCodePicture + '.png';
	      	qrcodeImg.src = qrLink;
					// open dialog for print qrcode
					$(qrcodeImg).attr('title', 'พิมพ์คิวอาร์โค้ดรายการนี้');
					$(qrcodeImg).css({'width': '55px', 'height': 'auto', 'cursor': 'pointer'});
					$(qrcodeImg).on('click', (evt)=>{
						doOpenQRCodePopup(evt, item.id, item.QRCodePicture, qrLink);
					});
				} else {
					qrcodeImg.src = '../../images/scan-qrcode-icon.png';
					$(qrcodeImg).attr('title', 'สร้างคิวอาร์โค้ดให้รายการนี้');
					$(qrcodeImg).css({'width': '45px', 'height': 'auto', 'cursor': 'pointer'});
					// generate new qrcode
					$(qrcodeImg).on('click', async (evt)=>{
						await doCreateNewQRCode(evt, item.id);
					});
				}
				let menuitemQRCodeBox = $('<div></div>').css({'text-align': 'center'}).append($(qrcodeImg));

				let editMenuitemCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editMenuitemCmd).on('click', (evt)=>{
					doOpenEditMenuitemForm(shopData, workAreaBox, item);
				});
				let deleteMenuitemCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteMenuitemCmd).on('click', (evt)=>{
					doDeleteMenuitem(shopData, workAreaBox, item.id);
				});
				let menuitemBtnBox = $('<div></div>').css({'text-align': 'center'}).append($(editMenuitemCmd)).append($(deleteMenuitemCmd));

				let commandCell = $('<td align="center"></td>');
				$(commandCell).append($(menuitemQRCodeBox));
				$(commandCell).append($(menuitemBtnBox));
				$(itemRow).append($(commandCell));
				$(menuitemTable).append($(itemRow));
			}

      $(workAreaBox).append($(menuitemTable));
      resolve();
    });
  }

  const doStartUploadPicture = function(evt, menuitemLogoIcon, imageBox, itemId, shopData, workAreaBox){
    let fileBrowser = $('<input type="file"/>');
    $(fileBrowser).attr("name", 'menuitemlogo');
    $(fileBrowser).attr("multiple", true);
    $(fileBrowser).css('display', 'none');
    $(fileBrowser).on('change', function(e) {
      const defSize = 10000000;
      var fileSize = e.currentTarget.files[0].size;
      var fileType = e.currentTarget.files[0].type;
      if (fileSize <= defSize) {
        doUploadImage(fileBrowser, menuitemLogoIcon, fileType, itemId, shopData, workAreaBox);
      } else {
        $(imageBox).append($('<span>' + 'File not excess ' + defSize + ' Byte.' + '</span>'));
      }
    });
    $(fileBrowser).appendTo($(imageBox));
    $(fileBrowser).click();
  }

  const doUploadImage = function(fileBrowser, menuitemLogoIcon, fileType, itemId, shopData, workAreaBox){
    var uploadUrl = '/api/shop/upload/menuitemlogo';
    $(fileBrowser).simpleUpload(uploadUrl, {
      success: async function(data){
        $(fileBrowser).remove();
        let shopRes = await common.doCallApi('/api/shop/menuitem/change/logo', {data: {MenuPicture: data.link}, id: itemId});
        setTimeout(async() => {
          await doShowMenuitemItem(shopData, workAreaBox);
        }, 400);
      },
    });
  }

  const doCreateNewMenuitemForm = function(menuitemData){
    let menuitemFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < menuitemTableFields.length; i++) {
      if (menuitemTableFields[i].fieldName !== 'MenuPicture') {
  			let fieldRow = $('<tr></tr>');
  			let labelField = $('<td width="40%" align="left">' + menuitemTableFields[i].displayName + (menuitemTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
  			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
  			let inputValue = $('<input type="text" id="' + menuitemTableFields[i].fieldName + '" size="' + menuitemTableFields[i].inputSize + '"/>');
  			if ((menuitemData) && (menuitemData[menuitemTableFields[i].fieldName])) {
  				$(inputValue).val(menuitemData[menuitemTableFields[i].fieldName]);
  			}
  			$(inputField).append($(inputValue));
  			$(fieldRow).append($(labelField));
  			$(fieldRow).append($(inputField));
  			$(menuitemFormTable).append($(fieldRow));
      }
		}
    let fieldRow = $('<tr></tr>');
		let labelField = $('<td width="40%" align="left">กลุ่มเมนู <span style="color: red;">*</span></td>').css({'padding': '5px'});
		let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
		let inputValue = $('<select id="GroupId"></select>');
		let menugroups = JSON.parse(localStorage.getItem('menugroups'));
		console.log(menugroups);
		menugroups.forEach((item, i) => {
			//console.log(item);
			$(inputValue).append($('<option value="' + item.Value + '">' + item.DisplayText + '<option>'))
		});
		$(inputField).append($(inputValue));
		$(fieldRow).append($(labelField));
		$(fieldRow).append($(inputField));
		$(menuitemFormTable).append($(fieldRow));

		return $(menuitemFormTable);
  }

  const doVerifyMenuitemForm = function(){
    let isVerify = true;
		let menuitemDataForm = {};
		for (let i=0; i < menuitemTableFields.length; i++) {
			let curValue = $('#'+menuitemTableFields[i].fieldName).val();
			if (menuitemTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+menuitemTableFields[i].fieldName).css({'border': ''});
					menuitemDataForm[menuitemTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+menuitemTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					menuitemDataForm[menuitemTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
    menuitemDataForm.groupId = $('#GroupId').val();
		return menuitemDataForm;
  }

  const doOpenNewMenuitemForm = function(shopData, workAreaBox){
    let newMenuitemForm = doCreateNewMenuitemForm();
    let radNewMenuitemFormBox = $('<div></div>');
    $(radNewMenuitemFormBox).append($(newMenuitemForm));
    const newmenuitemformoption = {
      title: 'เพิ่มเมนูใหม่เข้าร้าน',
      msg: $(radNewMenuitemFormBox),
      width: '520px',
      onOk: async function(evt) {
        let newMenuitemFormObj = doVerifyMenuitemForm();
        if (newMenuitemFormObj) {
          let hasValue = newMenuitemFormObj.hasOwnProperty('MenuName');
          if (hasValue){
            newMenuitemFormBox.closeAlert();
						let params = {data: newMenuitemFormObj, shopId: shopData.id, groupId: newMenuitemFormObj.groupId};
            let menuitemRes = await common.doCallApi('/api/shop/menuitem/add', params);
            if (menuitemRes.status.code == 200) {
              $.notify("เพิ่มรายการเมนูสำเร็จ", "success");
              await doShowMenuitemItem(shopData, workAreaBox)
            } else if (menuitemRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการเมนูได้", "error");
            }
          }else {
            $.notify("ข้อมูลไม่ถูกต้อง", "error");
          }
        } else {
          $.notify("ข้อมูลไม่ถูกต้อง", "error");
        }
      },
      onCancel: function(evt){
        newMenuitemFormBox.closeAlert();
      }
    }
    let newMenuitemFormBox = $('body').radalert(newmenuitemformoption);
  }

  const doOpenEditMenuitemForm = function(shopData, workAreaBox, menuitemData){
    let editMenuitemForm = doCreateNewMenuitemForm(menuitemData);
		let radEditMenuitemFormBox = $('<div></div>');
		$(radEditMenuitemFormBox).append($(editMenuitemForm));
		const editmenuitemformoption = {
			title: 'แก้ไขเมนูของร้าน',
			msg: $(radEditMenuitemFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editMenuitemFormObj = doVerifyMenuitemForm();
				if (editMenuitemFormObj) {
					let hasValue = editMenuitemFormObj.hasOwnProperty('MenuName');
					if (hasValue){
						editMenuitemFormBox.closeAlert();
						let params = {data: editMenuitemFormObj, id: menuitemData.id};
						let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
						if (menuitemRes.status.code == 200) {
							$.notify("แก้ไขรายการเมนูสำเร็จ", "success");
							await doShowMenuitemItem(shopData, workAreaBox)
						} else if (menuitemRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการเมนูได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editMenuitemFormBox.closeAlert();
			}
		}
		let editMenuitemFormBox = $('body').radalert(editmenuitemformoption);
  }

  const doDeleteMenuitem = function(shopData, workAreaBox, menuitemId){
    let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบเมนูรายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบเมน</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบเมนู',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let menuitemRes = await common.doCallApi('/api/shop/menuitem/delete', {id: groupmenuId});
				if (menuitemRes.status.code == 200) {
					$.notify("ลบรายการเมนูสำเร็จ", "success");
					await doShowMenuitemItem(shopData, workAreaBox);
				} else if (menuitemRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการเมนูได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
  }

	const doOpenQRCodePopup = function(evt, menuId, qrCodeName, qrLink) {
		 printJS(qrLink, 'image');
	}

	const doCreateNewQRCode = function(evt, menuId) {
		return new Promise(async function(resolve, reject) {
			let callUrl = '/api/shop/menuitem/qrcode/create/' + menuId;
			let qrRes = await common.doCallApi(callUrl, {id: menuId});
			let qrcodeImg = evt.currentTarget;
			qrcodeImg.src = qrRes.qrLink;
			$(qrcodeImg).attr('title', 'พิมพ์คิวอาร์โค้ดรายการนี้');
			$(qrcodeImg).css({'width': '55px', 'height': 'auto', 'cursor': 'pointer'});
			$(qrcodeImg).on('click', (evt)=>{
				doOpenQRCodePopup(evt, menuId, qrRes.qrName, qrRes.qrLink);
			});
			resolve(qrRes);
		});
	}

  return {
    doShowMenuitemItem,
		doCreateNewMenuitemForm,
		doVerifyMenuitemForm
  }
}
