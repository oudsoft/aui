module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);
	const shopmng = require('./shop-mng.js')($);

	const shopTableFields = [
		{fieldName: 'Shop_Name', displayName: 'ชื่อร้าน', width: '12%', align: 'left', inputSize: '40', verify: true, showHeader: true},
		{fieldName: 'Shop_Address', displayName: 'ที่อยู่', width: '15%', align: 'left', inputSize: '40', verify: true, showHeader: true},
		{fieldName: 'Shop_Tel', displayName: 'โทรศัพท์', width: '10%', align: 'left', inputSize: '20', verify: true, showHeader: true},
		{fieldName: 'Shop_Mail', displayName: 'อีเมล์', width: '10%', align: 'left', inputSize: '40', verify: true, showHeader: true},
		{fieldName: 'Shop_LogoFilename', displayName: 'โลโก้', width: '10%', align: 'center', inputSize: '40', verify: false, showHeader: true},
		{fieldName: 'Shop_VatNo', displayName: 'VAT No.', width: '10%', align: 'left', inputSize: '20', verify: false, showHeader: false},
		{fieldName: 'Shop_PromptPayNo', displayName: 'หมายเลขพร้อมเพย์', width: '8%', align: 'left', inputSize: '20', verify: false, showHeader: false},
		{fieldName: 'Shop_PromptPayName', displayName: 'ขื่อบัญชีพร้อมเพย์', width: '10%', align: 'left', inputSize: '20', verify: false, showHeader: false},
		{fieldName: 'Shop_BillQuota', displayName: 'Bill Quota', width: '7%', align: 'left', inputSize: '5', verify: false, showHeader: false},
		{fieldName: 'id', displayName: 'ShopId', width: '5%', align: 'center', inputSize: '40', verify: false, showHeader: false},
	];

  const doShowShopItem = function(){
    return new Promise(async function(resolve, reject) {
			$('#App').empty();
      let shopRes = await common.doCallApi('/api/shop/shop/list', {});
			if ((shopRes) &&/* (shopRes.status) && (shopRes.status.code) && */ (shopRes.status.code == 210)) {
		    common.doUserLogout();
			}
			let shopItems = shopRes.Records;
			let titlePageBox = $('<div style="padding: 4px;">รายการร้านค้าในระบบ</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			let logoutCmd = $('<span>ออกจากระบบ</span>').css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'absolute', 'right': '5px', 'top': '8px', 'padding': '4px', 'font-size': '14px'});
			$(logoutCmd).on('click', (evt)=>{
				common.doUserLogout();
			});
			$(titlePageBox).append($(logoutCmd));

			$('#App').append($(titlePageBox));
			let newShopCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
			let newShopCmd = $('<input type="button" value=" + New Shop " class="action-btn"/>');
			$(newShopCmd).on('click', (evt)=>{
				doOpenNewShopForm();
			});
			$(newShopCmdBox).append($(newShopCmd))
			$('#App').append($(newShopCmdBox));
			let shopTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
			let headerRow = $('<tr></tr>');
			$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
			for (let i=0; i < shopTableFields.length; i++) {
				if (shopTableFields[i].showHeader) {
					$(headerRow).append($('<td width="' + shopTableFields[i].width + '" align="center"><b>' + shopTableFields[i].displayName + '</b></td>'));
				}
			}
			$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
			$(shopTable).append($(headerRow));
			for (let x=0; x < shopItems.length; x++) {
				let itemRow = $('<tr></tr>');
				$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
				let item = shopItems[x];
				for (let i=0; i < shopTableFields.length; i++) {
					if (shopTableFields[i].showHeader) {
						let field = $('<td align="' + shopTableFields[i].align + '"></td>');
						if (shopTableFields[i].fieldName !== 'Shop_LogoFilename') {
							$(field).text(item[shopTableFields[i].fieldName]);
							$(itemRow).append($(field));
						} else {
							let shopLogoIcon = new Image();
							shopLogoIcon.id = 'Shop_LogoFilename_' + item.id;
							if (item['Shop_LogoFilename'] !== ''){
								shopLogoIcon.src = item['Shop_LogoFilename'];
							} else {
								shopLogoIcon.src = '/shop/favicon.ico'
							}
							$(shopLogoIcon).css({"width": "80px", "height": "auto", "cursor": "pointer", "padding": "2px", "border": "2px solid #ddd"});
							$(shopLogoIcon).on('click', (evt)=>{
								window.open(item['Shop_LogoFilename'], '_blank');
							});
							$(field).append($(shopLogoIcon));
							let updateShopLogoCmd = $('<input type="button" value=" เปลี่ยนรูป " class="action-btn"/>');
							$(updateShopLogoCmd).on('click', (evt)=>{
								doStartUploadPicture(evt, field, item.id);
							});
							$(field).append($(updateShopLogoCmd));
							$(itemRow).append($(field));
						}
					}
				}
				let editShopCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
				$(editShopCmd).on('click', (evt)=>{
					doOpenEditShopForm(item);
				});
				let mngShopCmd = $('<input type="button" value=" Manage " class="action-btn"/>').css({'margin-left': '8px'});
				$(mngShopCmd).on('click', (evt)=>{
					doOpenManageShop(item, doStartUploadPicture, doOpenEditShopForm);
				});
				let deleteShopCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
				$(deleteShopCmd).on('click', (evt)=>{
					doDeleteShop(item.id);
				});

				let commandCell = $('<td align="center"></td>');
				$(commandCell).append($(editShopCmd));
				$(commandCell).append($(mngShopCmd));
				$(commandCell).append($(deleteShopCmd));
				$(itemRow).append($(commandCell));
				$(shopTable).append($(itemRow));
			}
			$('#App').append($(shopTable));
			resolve();
    });
  }

	const doCreateShopForm = function(shopData){
		let shopFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < shopTableFields.length; i++) {
			if ((shopTableFields[i].fieldName !== 'id') && (shopTableFields[i].fieldName !== 'Shop_LogoFilename')) {
				let fieldRow = $('<tr></tr>');
				let labelField = $('<td width="40%" align="left">' + shopTableFields[i].displayName + (shopTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
				let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
				let inputValue = $('<input type="text" id="' + shopTableFields[i].fieldName + '" size="' + shopTableFields[i].inputSize + '"/>');
				if ((shopData) && (shopData[shopTableFields[i].fieldName])) {
					$(inputValue).val(shopData[shopTableFields[i].fieldName]);
				}
				$(inputField).append($(inputValue));
				$(fieldRow).append($(labelField));
				$(fieldRow).append($(inputField));
				$(shopFormTable).append($(fieldRow));
			}
		}
		return $(shopFormTable);
	}

	const doVerifyShopForm = function(){
		let isVerify = true;
		let shopDataForm = {};
		for (let i=0; i < shopTableFields.length; i++) {
			if (shopTableFields[i].fieldName !== 'Shop_LogoFilename') {
				let curValue = $('#'+shopTableFields[i].fieldName).val();
				if (shopTableFields[i].verify) {
					if (curValue !== '') {
						$('#'+shopTableFields[i].fieldName).css({'border': ''});
						shopDataForm[shopTableFields[i].fieldName] = curValue;
						isVerify = isVerify && true;
					} else {
						$('#'+shopTableFields[i].fieldName).css({'border': '1px solid red'});
						isVerify = isVerify && false;
						return;
					}
				} else {
					if (curValue !== '') {
						shopDataForm[shopTableFields[i].fieldName] = curValue;
						isVerify = isVerify && true;
					}
				}
			}
		}
		return shopDataForm;
	}

	const doStartUploadPicture = function(evt, imageBox, shopId, callback){
		let fileBrowser = $('<input type="file"/>');
    $(fileBrowser).attr("name", 'shoplogo');
    $(fileBrowser).attr("multiple", true);
    $(fileBrowser).css('display', 'none');
    $(fileBrowser).on('change', function(e) {
      var fileSize = e.currentTarget.files[0].size;
      var fileType = e.currentTarget.files[0].type;
      if (fileSize <= common.fileUploadMaxSize) {
        doUploadImage(fileBrowser, shopId, callback);
      } else {
        $(imageBox).append($('<span>' + 'File not excess ' + common.fileUploadMaxSize + ' Byte.' + '</span>'));
      }
    });
    $(fileBrowser).appendTo($(imageBox));
    $(fileBrowser).click();
	}

	const doUploadImage = function(fileBrowser, shopId, callback){
		var uploadUrl = '/api/shop/upload/shoplogo';
    $(fileBrowser).simpleUpload(uploadUrl, {
      success: async function(data){
        $(fileBrowser).remove();
				let shopRes = await common.doCallApi('/api/shop/shop/change/logo', {data: {Shop_LogoFilename: data.link}, id: shopId});
				if (callback) {
					callback(data);
				} else {
					setTimeout(async() => {
						/*
						$(shopLogoIcon).attr('src', data.link);
						$(shopLogoIcon).on('click', (evt)=>{
							window.open(data.link, '_blank');
						});
						*/
						await doShowShopItem();
      		}, 400);
				}
      },
    });
	}

	const doOpenNewShopForm = function(){
		let shopNewForm = doCreateShopForm();
		let radNewShopFormBox = $('<div></div>');
		$(radNewShopFormBox).append($(shopNewForm));
		const newshopformoption = {
			title: 'เพิ่มร้านค้าใหม่เข้าสู่ระบบ',
			msg: $(radNewShopFormBox),
			width: '520px',
			onOk: async function(evt) {
				let newShopFormObj = doVerifyShopForm();
				if (newShopFormObj) {
					let hasValue = newShopFormObj.hasOwnProperty('Shop_Name');
					if (hasValue){
						newShopFormBox.closeAlert();
						newShopFormObj.Shop_LogoFilename = '';
						if (!newShopFormObj.Shop_VatNo) {
							newShopFormObj.Shop_VatNo = '';
						}
						let shopRes = await common.doCallApi('/api/shop/shop/add', newShopFormObj);
						if (shopRes.status.code == 200) {
							$.notify("เพิ่มรายการร้านค้าสำเร็จ", "success");
							await doShowShopItem()
						} else if (shopRes.status.code == 201) {
							$.notify("ไม่สามารถเพิ่มรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการร้านค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				newShopFormBox.closeAlert();
			}
		}
		let newShopFormBox = $('body').radalert(newshopformoption);
	}

	const doOpenEditShopForm = function(shopData, successCallback){
		let shopEditForm = doCreateShopForm(shopData);
		let radEditShopFormBox = $('<div></div>');
		$(radEditShopFormBox).append($(shopEditForm));
		const editshopformoption = {
			title: 'แก้ไขข้อมูลร้านค้า',
			msg: $(radEditShopFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editShopFormObj = doVerifyShopForm();
				if (editShopFormObj) {
					let hasValue = editShopFormObj.hasOwnProperty('Shop_Name');
					if (hasValue){
						editShopFormBox.closeAlert();
						//editShopFormObj.Shop_LogoFilename = '';
						if (!editShopFormObj.Shop_VatNo) {
							editShopFormObj.Shop_VatNo = '';
						}
						let params = {data: editShopFormObj, id: shopData.id}
						let shopRes = await common.doCallApi('/api/shop/shop/update', params);
						if (shopRes.status.code == 200) {
							$.notify("แก้ไขรายการร้านค้าสำเร็จ", "success");
							if (successCallback) {
								successCallback(editShopFormObj);
							} else {
								await doShowShopItem();
							}
						} else if (shopRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการร้านค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editShopFormBox.closeAlert();
			}
		}
		let editShopFormBox = $('body').radalert(editshopformoption);
	}

	const doOpenManageShop = function(shopData, uploadLogoCallback, editShopCallback){
		shopmng.doShowShopMhg(shopData, uploadLogoCallback, editShopCallback);
	}

	const doDeleteShop = function(shopId){
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบร้านค้ารายการที่เลือกออกจากระบบฯ ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบร้านค้า</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบร้านค้า',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let shopRes = await common.doCallApi('/api/shop/shop/delete', {id: shopId});
				if (shopRes.status.code == 200) {
					$.notify("ลบรายการร้านค้าสำเร็จ", "success");
					await doShowShopItem()
				} else if (shopRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการร้านค้าได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  return {
    doShowShopItem,
		doOpenManageShop,
		doCreateShopForm,
		doOpenEditShopForm,
		doStartUploadPicture
	}
}
