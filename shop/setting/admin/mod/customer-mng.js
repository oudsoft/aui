module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);
	const order = require('./order-mng.js')($);
	const calendardlg = require('./calendar-dlg.js')($);
	const history = require('./order-history.js')($);

  const customerTableFields = [
		{fieldName: 'Name', displayName: 'ชื่อ', width: '20%', align: 'left', inputSize: '30', verify: true, showHeader: true},
		{fieldName: 'Address', displayName: 'ที่อยู่', width: '25%', align: 'left', inputSize: '30', verify: false, showHeader: true},
    {fieldName: 'Tel', displayName: 'โทรศัพท์', width: '15%', align: 'left', inputSize: '30', verify: false, showHeader: true},
		{fieldName: 'Mail', displayName: 'อีเมล์', width: '15%', align: 'left', inputSize: '30', verify: false, showHeader: true},
	];

	const doLoadCustomerItem = function(shopId){
    return new Promise(async function(resolve, reject) {
			let customerRes = await common.doCallApi('/api/shop/customer/list/by/shop/' + shopId, {});
			localStorage.setItem('customers', JSON.stringify(customerRes.Records));
			resolve(customerRes.Records);
		});
	}

	const doFilterCustomer = function(customers, key) {
		return new Promise(async function(resolve, reject) {
			let result = customers.filter((item)=>{
        let n = item.Name.search(key);
        if (n >= 0) {
          return item;
        }
      });
      resolve(result);
		});
	}

	const doCreateCalendarCmd = function(cmdTitle, successCallback){
		let orderDateBox = $('<div></div>').text(cmdTitle).css({'width': 'fit-content', 'display': 'inline-block', 'background-color': 'white', 'color': 'black', 'padding': '4px', 'cursor': 'pointer', 'font-size': '16px'});
		$(orderDateBox).on('click', (evt)=>{
			common.calendarOptions.onClick = async function(date){
				calendarHandle.closeAlert();
				successCallback(date);
				selectDate = common.doFormatDateStr(new Date(date));
			}
			let calendarHandle = order.doShowCalendarDlg(common.calendarOptions);
		});
		return $(orderDateBox);
	}

	const doCreateCustomerListTable = function(shopData, workAreaBox, customerItems, newCustomerCmdBox){
		let customerTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		let headerRow = $('<tr></tr>');
		$(headerRow).append($('<td width="2%" align="center"><b>#</b></td>'));
		for (let i=0; i < customerTableFields.length; i++) {
			if (customerTableFields[i].showHeader) {
				$(headerRow).append($('<td width="' + customerTableFields[i].width + '" align="center"><b>' + customerTableFields[i].displayName + '</b></td>'));
			}
		}
		$(headerRow).append($('<td width="*" align="center"><b>คำสั่ง</b></td>'));
		$(customerTable).append($(headerRow));

		for (let x=0; x < customerItems.length; x++) {
			let itemRow = $('<tr class="customer-row"></tr>');
			$(itemRow).append($('<td align="center">' + (x+1) + '</td>'));
			let item = customerItems[x];
			for (let i=0; i < customerTableFields.length; i++) {
				if (customerTableFields[i].showHeader) {
					let field = $('<td align="' + customerTableFields[i].align + '"></td>');
					$(field).text(item[customerTableFields[i].fieldName]);
					$(itemRow).append($(field));
				}
			}

			let commandCell = $('<td align="center"></td>');

			let editCustomerCmd = $('<input type="button" value=" Edit " class="action-btn"/>');
			$(editCustomerCmd).on('click', (evt)=>{
				doOpenEditCustomerForm(shopData, workAreaBox, item);
			});

			let orderCustomerCmd = $('<input type="button" value=" Order " class="action-btn"/>').css({'margin-left': '8px'});
			$(orderCustomerCmd).on('click', async (evt)=>{
				let params = {};
				let orderRes = await common.doCallApi('/api/shop/order/list/by/customer/' + item.id, params);
				localStorage.setItem('customerorders', JSON.stringify(orderRes.Records));
				console.log(JSON.parse(localStorage.getItem('customerorders')));

				$(editCustomerCmd).hide();
				$(orderCustomerCmd).hide();
				$(deleteCustomerCmd).hide();
				$(newCustomerCmdBox).hide();
				$('.customer-row').hide();
				$(itemRow).css({'background-color': 'gray', 'color': 'white'});
				let fromDateCmd = doCreateCalendarCmd('ตั้งแต่วันที่', async (date)=>{
					let selectDate = common.doFormatDateStr(new Date(date));
					$(fromDateCmd).text(selectDate);
					$('#HistoryTable').remove();
					$('#NavigBar').remove();
					let orderHostoryTable = await history.doCreateOrderHistoryTable(workAreaBox, 0, 0, selectDate);
				})
				let backCustomerCmd = $('<input type="button" value=" Back " class="action-btn"/>').css({'margin-left': '8px'});
				$(backCustomerCmd).on('click', (evt)=>{
					$(backCustomerCmd).remove();
					$(fromDateCmd).remove();
					$(editCustomerCmd).show();
					$(orderCustomerCmd).show();
					$(deleteCustomerCmd).show();
					$(newCustomerCmdBox).show();
					$('.customer-row').show();
					$(itemRow).css({'background-color': '', 'color': ''});
					localStorage.removeItem('customerorders');
				});
				$(commandCell).append($(fromDateCmd)).append($(backCustomerCmd));
				$(itemRow).show();

				$('#HistoryTable').remove();
				$('#NavigBar').remove();
				if (orderRes.Records.length > 0) {
					let orderHostoryTable = await history.doCreateOrderHistoryTable(workAreaBox, 0, 0);
				} else {
					let notFoundBox = $('<div id="HistoryTable"></div>').css({'position': 'relative', 'width': '100%', 'margin-top': '25px'});
					$(notFoundBox).text('ไม่พบรายการออร์เดอร์');
					$(workAreaBox).append($(notFoundBox));
				}
			});

			let deleteCustomerCmd = $('<input type="button" value=" Delete " class="action-btn"/>').css({'margin-left': '8px'});
			$(deleteCustomerCmd).on('click', (evt)=>{
				doDeleteCustomer(shopData, workAreaBox, item.id);
			});

			$(commandCell).append($(editCustomerCmd));
			$(commandCell).append($(orderCustomerCmd));
			$(commandCell).append($(deleteCustomerCmd));
			$(itemRow).append($(commandCell));
			$(customerTable).append($(itemRow));
		}
		return $(customerTable);
	}

  const doShowCustomerItem = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
      $(workAreaBox).empty();

			let customerItems = await doLoadCustomerItem(shopData.id);
			let customerTable = undefined;

      let titlePageBox = $('<div style="padding: 4px;">รายการลูกค้าของร้าน</viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			$(workAreaBox).append($(titlePageBox));
			let newCustomerCmdBox = $('<div style="padding: 4px;"></div>').css({'width': '99.5%', 'text-align': 'right'});
			let searchKeyInput = $('<input type="text" size="40" value="*"/>');
			$(searchKeyInput).css({'background': 'url(../../images/search-icon.png) no-repeat right center', 'background-size': '6% 100%', 'padding-right': '3px'});
			$(searchKeyInput).on('keyup', async (evt)=>{
				if (customerTable) {
					$(customerTable).remove();
				}
				let key = $(searchKeyInput).val();
				if (key !== ''){
					if (key === '*') {
						customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerItems, newCustomerCmdBox);
					} else {
						let customers = JSON.parse(localStorage.getItem('customers'));
						let customerFilter = await doFilterCustomer(customers, key);
						customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerFilter, newCustomerCmdBox);
					}
					$(workAreaBox).append($(customerTable));
				}
			});

			let newCustomerCmd = $('<input type="button" value=" + New Customer " class="action-btn"/>');
			$(newCustomerCmd).on('click', (evt)=>{
				doOpenNewCustomerForm(shopData, workAreaBox);
			});
			$(newCustomerCmdBox).append($(searchKeyInput)).append($(newCustomerCmd).css({'margin-left': '10px'}));

			$(workAreaBox).append($(newCustomerCmdBox));

			customerTable = doCreateCustomerListTable(shopData, workAreaBox, customerItems, newCustomerCmdBox);

      $(workAreaBox).append($(customerTable));
      resolve();
    });
  }

  const doCreateNewCustomerForm = function(customerData){
    let customerFormTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
		for (let i=0; i < customerTableFields.length; i++) {
			let fieldRow = $('<tr></tr>');
			let labelField = $('<td width="40%" align="left">' + customerTableFields[i].displayName + (customerTableFields[i].verify?' <span style="color: red;">*</span>':'') + '</td>').css({'padding': '5px'});
			let inputField = $('<td width="*" align="left"></td>').css({'padding': '5px'});
			let inputValue = $('<input type="text" id="' + customerTableFields[i].fieldName + '" size="' + customerTableFields[i].inputSize + '"/>');
			if ((customerData) && (customerData[customerTableFields[i].fieldName])) {
				$(inputValue).val(customerData[customerTableFields[i].fieldName]);
			}
			$(inputField).append($(inputValue));
			$(fieldRow).append($(labelField));
			$(fieldRow).append($(inputField));
			$(customerFormTable).append($(fieldRow));
		}
		return $(customerFormTable);
  }

  const doVerifyCustomerForm = function(){
    let isVerify = true;
		let customerDataForm = {};
		for (let i=0; i < customerTableFields.length; i++) {
			let curValue = $('#'+customerTableFields[i].fieldName).val();
			if (customerTableFields[i].verify) {
				if (curValue !== '') {
					$('#'+customerTableFields[i].fieldName).css({'border': ''});
					customerDataForm[customerTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				} else {
					$('#'+customerTableFields[i].fieldName).css({'border': '1px solid red'});
					isVerify = isVerify && false;
					return;
				}
			} else {
				if (curValue !== '') {
					customerDataForm[customerTableFields[i].fieldName] = curValue;
					isVerify = isVerify && true;
				}
			}
		}
		return customerDataForm;
  }

  const doOpenNewCustomerForm = function(shopData, workAreaBox) {
    let newCustomerForm = doCreateNewCustomerForm();
    let radNewCustomerFormBox = $('<div></div>');
    $(radNewCustomerFormBox).append($(newCustomerForm));
    const newcustomerformoption = {
      title: 'เพิ่มลูกค้าใหม่เข้าร้าน',
      msg: $(radNewCustomerFormBox),
      width: '520px',
      onOk: async function(evt) {
        let newCustomerFormObj = doVerifyCustomerForm();
        if (newCustomerFormObj) {
          let hasValue = newCustomerFormObj.hasOwnProperty('Name');
          if (hasValue){
            newCustomerFormBox.closeAlert();
						let params = {data: newCustomerFormObj, shopId: shopData.id};
            let userRes = await common.doCallApi('/api/shop/customer/add', params);
            if (userRes.status.code == 200) {
              $.notify("เพิ่มรายการลูกค้าสำเร็จ", "success");
              await doShowCustomerItem(shopData, workAreaBox)
            } else if (userRes.status.code == 201) {
              $.notify("ไม่สามารถเพิ่มรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
            } else {
              $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการลูกค้าได้", "error");
            }
          }else {
            $.notify("ข้อมูลไม่ถูกต้อง", "error");
          }
        } else {
          $.notify("ข้อมูลไม่ถูกต้อง", "error");
        }
      },
      onCancel: function(evt){
        newCustomerFormBox.closeAlert();
      }
    }
    let newCustomerFormBox = $('body').radalert(newcustomerformoption);
  }

  const doOpenEditCustomerForm = function(shopData, workAreaBox, customerData){
		let editCustomerForm = doCreateNewCustomerForm(customerData);
		let radEditCustomerFormBox = $('<div></div>');
		$(radEditCustomerFormBox).append($(editCustomerForm));
		const editcustomerformoption = {
			title: 'แก้ไขลูกค้าของร้าน',
			msg: $(radEditCustomerFormBox),
			width: '520px',
			onOk: async function(evt) {
				let editCustomerFormObj = doVerifyCustomerForm();
				if (editCustomerFormObj) {
					let hasValue = editCustomerFormObj.hasOwnProperty('Name');
					if (hasValue){
						editCustomerFormBox.closeAlert();
						let params = {data: editCustomerFormObj, id: customerData.id};
						let userRes = await common.doCallApi('/api/shop/customer/update', params);
						if (userRes.status.code == 200) {
							$.notify("แก้ไขรายการลูกค้าสำเร็จ", "success");
							await doShowCustomerItem(shopData, workAreaBox)
						} else if (userRes.status.code == 201) {
							$.notify("ไม่สามารถแก้ไขรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
						} else {
							$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการลูกค้าได้", "error");
						}
					}else {
						$.notify("ข้อมูลไม่ถูกต้อง", "error");
					}
				} else {
					$.notify("ข้อมูลไม่ถูกต้อง", "error");
				}
			},
			onCancel: function(evt){
				editCustomerFormBox.closeAlert();
			}
		}
		let editCustomerFormBox = $('body').radalert(editcustomerformoption);
	}

  const doDeleteCustomer = function(shopData, workAreaBox, customerId){
		let radConfirmMsg = $('<div></div>');
		$(radConfirmMsg).append($('<p>คุณต้องการลบลูกค้ารายการที่เลือกออกจากร้าน ใช่ หรือไม่</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ตกลง</b> หาก <b>ใช่</b> เพื่อลบลูกค้า</p>'));
		$(radConfirmMsg).append($('<p>คลิกปุ่ม <b>ยกเลิก</b> หาก <b>ไม่ใช่</b></p>'));
		const radconfirmoption = {
			title: 'โปรดยืนยันการลบลูกค้า',
			msg: $(radConfirmMsg),
			width: '420px',
			onOk: async function(evt) {
				radConfirmBox.closeAlert();
				let customerRes = await common.doCallApi('/api/shop/customer/delete', {id: customerId});
				if (customerRes.status.code == 200) {
					$.notify("ลบรายการลูกค้าสำเร็จ", "success");
					await doShowCustomerItem(shopData, workAreaBox);
				} else if (userRes.status.code == 201) {
					$.notify("ไม่สามารถลบรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
				} else {
					$.notify("เกิดข้อผิดพลาด ไม่สามารถลบรายการลูกค้าได้", "error");
				}
			},
			onCancel: function(evt){
				radConfirmBox.closeAlert();
			}
		}
		let radConfirmBox = $('body').radalert(radconfirmoption);
	}

  return {
    doShowCustomerItem
  }
}
