module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);
  const customerdlg = require('./customer-dlg.js')($);
  const gooditemdlg = require('./gooditem-dlg.js')($);
	const closeorderdlg = require('./closeorder-dlg.js')($);
	const calendardlg = require('./calendar-dlg.js')($);
	const mergeorderdlg = require('./order-merge-dlg.js')($);

  const doShowOrderList = function(shopData, workAreaBox, orderDate){
    return new Promise(async function(resolve, reject) {
      let customerRes = await common.doCallApi('/api/shop/customer/list/by/shop/' + shopData.id, {});
      let menugroupRes = await common.doCallApi('/api/shop/menugroup/list/by/shop/' + shopData.id, {});
      let menuitemRes = await common.doCallApi('/api/shop/menuitem/list/by/shop/' + shopData.id, {});
      let customers = customerRes.Records;
      localStorage.setItem('customers', JSON.stringify(customers));
      let menugroups = menugroupRes.Records;
      localStorage.setItem('menugroups', JSON.stringify(menugroups));
      let menuitems = menuitemRes.Records;
      localStorage.setItem('menuitems', JSON.stringify(menuitems));

      $(workAreaBox).empty();

			let selectDate = undefined;
			if (orderDate) {
				selectDate = common.doFormatDateStr(new Date(orderDate));
			} else {
				selectDate = common.doFormatDateStr(new Date());
			}
      let titlePageBox = $('<div style="padding: 4px;"></viv>').css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
			let titleTextBox = $('<div class="sensitive-word" id="titleTextBox"></div>').text('รายการออร์เดอร์ของร้าน');
			let orderDateBox = $('<span></span>').text(selectDate).css({'background-color': 'white', 'color': 'black', 'cursor': 'pointer', 'position': 'relative', 'margin': '-3px 5px 0px 25%', 'padding': '4px', 'font-size': '16px', 'border': '3px solid grey'});
			$(orderDateBox).on('click', (evt)=>{
				common.calendarOptions.onClick = async function(date){
					selectDate = common.doFormatDateStr(new Date(date));
					$(orderDateBox).text(selectDate);
					calendarHandle.closeAlert();
					$('#OrderListBox').remove();
					let orderListBox = await doCreateOrderList(shopData, workAreaBox, selectDate);
					$(workAreaBox).append($(orderListBox));
				}
				let calendarHandle = doShowCalendarDlg(common.calendarOptions);
			});
			$(orderDateBox).hover(()=>{
				$(orderDateBox).css({'border': '3px solid black'});
			},()=>{
				$(orderDateBox).css({'border': '3px solid grey'});
			});

			$(titlePageBox).append($(titleTextBox)).append($(orderDateBox));

			$(workAreaBox).append($(titlePageBox));
			//let newOrderCmdBox = $('<div></div>').css({'position': 'absolute', 'text-align': 'right', 'padding': '4px', 'margin-bottom': '4px'});
			//let newOrderCmd = $('<input type="button" value=" เปิดออร์เดอร์ใหม่ " class="action-btn"/>');
			let newOrderCmd = common.doCreateTextCmd('เปิดออร์เดอร์ใหม', 'green', 'white');
			$(newOrderCmd).addClass('sensitive-word');
			$(newOrderCmd).attr('id', 'newOrderCmd');
			$(newOrderCmd).on('click', (evt)=>{
				doOpenOrderForm(shopData, workAreaBox);
			});
			let canceledOrderHiddenToggleCmd = common.doCreateTextCmd('ซ่อนออร์เดอร์ที่ถูกยกเลิก', 'grey', 'white');
			$(canceledOrderHiddenToggleCmd).addClass('sensitive-word');
			$(canceledOrderHiddenToggleCmd).attr('id', 'canceledOrderHiddenToggleCmd');
			$(canceledOrderHiddenToggleCmd).on('click', (evt)=>{
				let displayStatus = $('.canceled-order').css('display');
				if (displayStatus === 'none') {
					$('.canceled-order').css('display', 'block');
					$(canceledOrderHiddenToggleCmd).text('ซ่อนออร์เดอร์ที่ถูกยกเลิก');
				} else {
					$('.canceled-order').css('display', 'none');
					$(canceledOrderHiddenToggleCmd).text('แสดงออร์เดอร์ที่ถูกยกเลิก');
				}
			});

			//$(newOrderCmdBox).append($(canceledOrderHiddenToggleCmd)).append($(newOrderCmd).css({'margin-left': '4px'}));
			//$(workAreaBox).append($(newOrderCmdBox));
			$(titlePageBox).append($(newOrderCmd).css({'float': 'right', 'margin-right': '5px'})).append($(canceledOrderHiddenToggleCmd).css({'float': 'right', 'margin-right': '10px'}));
			//$(titlePageBox).append($(newOrderCmdBox));

			$('#OrderListBox').remove();
			let orderListBox = await doCreateOrderList(shopData, workAreaBox, selectDate);
			$(workAreaBox).append($(orderListBox));
			//let orderDateBoxPos = (($(titleTextBox).width() - $(orderDateBox).width()) / 2) - ($(orderDateBox).width());
			//$(orderDateBox).css({'margin-left': orderDateBoxPos + 'px'});
      resolve();
    });
  }

	const doShowCalendarDlg = function(calendarOptions) {
		let calendarContent = calendardlg.doCreateCalendar(calendarOptions);
		const calendarDlgOption = {
			title: 'เลือกวันที่บนปฎิทิน',
			msg: $(calendarContent),
			width: '220px',
			onOk: function(evt) {
				calendarDlgHandle.closeAlert();
			},
			onCancel: function(evt){
				calendarDlgHandle.closeAlert();
			}
		}
		let calendarDlgHandle = $('body').radalert(calendarDlgOption);
		$(calendarDlgHandle.okCmd).hide();
		return calendarDlgHandle;
	}

  const doOpenOrderForm = async function(shopData, workAreaBox, orderData, selectDate){
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let userId = userdata.id;
		let userinfoId = userdata.userinfoId;

    let orderObj = {};
    $(workAreaBox).empty();
    let titleText = $('<div>เปิด<span id="titleOrderForm" class="sensitive-word">ออร์เดอร์</span>ใหม่</div>');
    if (orderData) {
      titleText = $('<div>แก้ไข<span id="titleOrderForm" class="sensitive-word">ออร์เดอร์</span></div>');
			orderObj.id = orderData.id;
			orderObj.Status = orderData.Status
    } else {
			orderObj.Status = 1;
		}
    let titlePageBox = $('<div style="padding: 4px;"></viv>').append($(titleText)).css({'width': '99.1%', 'text-align': 'center', 'font-size': '22px', 'border': '2px solid black', 'border-radius': '5px', 'background-color': 'grey', 'color': 'white'});
    let customerWokingBox = $('<div id="OrderCustomer" style="padding: 4px; width: 99.1%;"></viv>');
    let itemlistWorkingBox = $('<div id="OrderItemList" style="padding: 4px; width: 99.1%;"></viv>');
    let saveNewOrderCmdBox = $('<div></div>').css({'width': '99.1%', 'text-align': 'center'});
    $(workAreaBox).append($(titlePageBox)).append($(customerWokingBox)).append($(itemlistWorkingBox)).append($(saveNewOrderCmdBox));

    let customerForm = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let customerFormRow = $('<tr></tr>');
    let customerContent = $('<td width="85%" align="left"></tf>');
    let customerControlCmd = $('<td width="*" align="right" valign="middle"></tf>');
    $(customerFormRow).append($(customerContent)).append($(customerControlCmd));
    $(customerForm).append($(customerFormRow));
    $(customerWokingBox).append($(customerForm));

    let editCustomerCmd = $('<input type="button" class="action-btn"/>');

    let customerDataBox = undefined;
    if ((orderData) && (orderData.customer)) {
      orderObj.customer = orderData.customer;
      customerDataBox = doRenderCustomerContent(orderData.customer);
      $(customerContent).empty().append($(customerDataBox));
      $(editCustomerCmd).val('แก้ไขลูกค้า');
    } else {
      $(editCustomerCmd).val('ใส่ลูกค้า');
      $(customerContent).append($('<h2>ข้อมูลลูกค้า</h2>'));
    }
    if ((orderData) && (orderData.gooditems)) {
      orderObj.gooditems = orderData.gooditems;
    } else {
      orderObj.gooditems = [];
    }

		console.log(orderObj);

    let dlgHandle = undefined;

    $(editCustomerCmd).on('click', async (evt)=>{
      dlgHandle = await doOpenCustomerMngDlg(shopData, customerSelectedCallback);
    });
		$(customerControlCmd).append($(editCustomerCmd));

		let addNewGoodItemCmd = undefined;
		//if (orderObj.Status == 1) {
		if ([1, 2].includes(orderObj.Status)) {
			addNewGoodItemCmd = common.doCreateTextCmd('เพิ่มรายการ', 'green', 'white');
	    $(addNewGoodItemCmd).on('click', async (evt)=>{
	      dlgHandle = await doOpenGoodItemMngDlg(shopData, orderObj.gooditems, gooditemSelectedCallback);
	    });
		}

		let doShowCloseOrderDlg = async function() {
			let total = await doCalOrderTotal(orderObj.gooditems);
			if (total > 0) {
				dlgHandle = await doOpenCreateCloseOrderDlg(shopData, total, orderObj, invoiceCallback, billCallback, taxinvoiceCallback);
			} else {
				$.notify("ออร์เดอร์ยังไม่สมบูรณ์โปรดเพิ่มรายการสินค้าก่อน", "error");
			}
		}

		let callCreateCloseOrderCmd = common.doCreateTextCmd(' คิดเงิน ', '#F5500E', 'white', '#5D6D7E', '#FF5733');
		$(callCreateCloseOrderCmd).on('click', async (evt)=>{
			if (orderObj.customer) {
				let params = undefined;
				let orderRes = undefined;
				if ((orderData) && (orderData.id)) {
					params = {data: {Items: orderObj.gooditems, Status: orderObj.Status, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId}, id: orderData.id};
					orderRes = await common.doCallApi('/api/shop/order/update', params);
					if (orderRes.status.code == 200) {
						$.notify("บันทึกรายการออร์เดอร์สำเร็จ", "success");
						doShowCloseOrderDlg();
					} else {
						$.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
					}
				} else {
					params = {data: {Items: orderObj.gooditems, Status: 1}, shopId: shopData.id, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId};
          orderRes = await common.doCallApi('/api/shop/order/add', params);
          if (orderRes.status.code == 200) {
            $.notify("เพิ่มรายการออร์เดอร์สำเร็จ", "success");
						orderObj.id = orderRes.Records[0].id;
						orderData = orderRes.Records[0];
						doShowCloseOrderDlg();
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
          }
				}
			} else {
        $.notify("โปรดระบุข้อมูลลูกค้าก่อนบันทึกออร์เดอร์", "error");
      }
    });

    if ((orderObj) && (orderObj.gooditems)){
      let goodItemTable = await doRenderGoodItemTable(orderObj, itemlistWorkingBox);
			let lastCell = $(goodItemTable).children(":first").children(":last");
			if (addNewGoodItemCmd) {
				$(lastCell).append($(addNewGoodItemCmd));
			}
			if ([1, 2].includes(orderObj.Status)) {
				lastCell = $(goodItemTable).children(":last").children(":last");
				$(lastCell).append($(callCreateCloseOrderCmd));
			}
      $(itemlistWorkingBox).append($(goodItemTable));
    }

    let cancelCmd = $('<input type="button" value=" กลับ "/>').css({'margin-left': '10px'});
    $(cancelCmd).on('click', async(evt)=>{
      await doShowOrderList(shopData, workAreaBox, selectDate);
    });
    let saveNewOrderCmd = $('<input type="button" value=" บันทึก " class="action-btn"/>');
    $(saveNewOrderCmd).on('click', async(evt)=>{
      if (orderObj.customer) {
        let params = undefined;
        let orderRes = undefined;
        if (orderData) {
          params = {data: {Items: orderObj.gooditems, Status: 1, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId}, id: orderData.id};
          orderRes = await common.doCallApi('/api/shop/order/update', params);
          if (orderRes.status.code == 200) {
            $.notify("บันทึกรายการออร์เดอร์สำเร็จ", "success");
            await doShowOrderList(shopData, workAreaBox, selectDate);
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
          }
        } else {
          params = {data: {Items: orderObj.gooditems, Status: 1}, shopId: shopData.id, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId};
          orderRes = await common.doCallApi('/api/shop/order/add', params);
          if (orderRes.status.code == 200) {
            $.notify("เพิ่มรายการออร์เดอร์สำเร็จ", "success");
            await doShowOrderList(shopData, workAreaBox, selectDate);
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
          }
        }
      } else {
        $.notify("โปรดระบุข้อมูลลูกค้าก่อนบันทึกออร์เดอร์", "error");
      }
    });
    $(saveNewOrderCmdBox).append($(saveNewOrderCmd)).append($(cancelCmd));

		//if (orderObj.Status != 1) {
		if ([3, 4].includes(orderObj.Status)) {
			$(editCustomerCmd).hide();
			$(saveNewOrderCmd).hide();
		}

		$('#App').find('#SummaryBox').remove();

		if (common.shopSensitives.includes(shopData.id)) {
			let sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
			common.delay(500).then(async ()=>{
				await common.doResetSensitiveWord(sensitiveWordJSON);
			});
		}

    const customerSelectedCallback = function(customerSelected){
      orderObj.customer = customerSelected;
      customerDataBox = doRenderCustomerContent(customerSelected);
      $(customerContent).empty().append($(customerDataBox));
			$(editCustomerCmd).val('แก้ไขลูกค้า');
      if (dlgHandle) {
        dlgHandle.closeAlert();
      }
    }

    const gooditemSelectedCallback = async function(gooditemSelected){
      orderObj.gooditems.push(gooditemSelected);
      goodItemTable = await doRenderGoodItemTable(orderObj, itemlistWorkingBox);
			let lastCell = $(goodItemTable).children(":first").children(":last");
			if (addNewGoodItemCmd) {
				$(lastCell).append($(addNewGoodItemCmd));
			}
			if ([1, 2].includes(orderObj.Status)) {
				lastCell = $(goodItemTable).children(":last").children(":last");
				$(lastCell).append($(callCreateCloseOrderCmd));
			}
      $(itemlistWorkingBox).empty().append($(goodItemTable));
    }

		const invoiceCallback = async function(newInvoiceData){
			let invoiceParams = {data: newInvoiceData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let invoiceRes = await common.doCallApi('/api/shop/invoice/add', invoiceParams);

			if (invoiceRes.status.code == 200) {
				let invoiceId = invoiceRes.Record.id;
				let docParams = {orderId: orderObj.id, shopId: shopData.id/*, filename: newInvoiceData.Filename, No: newInvoiceData.No*/};
				let docRes = await common.doCallApi('/api/shop/invoice/create/report', docParams);
				console.log(docRes);
				if (docRes.status.code == 200) {
					//window.open(docRes.result.link, '_blank');
					closeorderdlg.doOpenReportPdfDlg(docRes.result.link, 'ใบแจ้งหนี้');
					$.notify("ออกใบแจ้งหนี้่สำเร็จ", "sucess");
				} else if (docRes.status.code == 300) {
					$.notify("ระบบไม่พบรูปแบบเอกสารใบแจ้งหนี้", "error");
				}
			} else {
				$.notify("บันทึกใบแจ้งหนี้ไม่สำเร็จ", "error");
			}

			if (dlgHandle) {
        dlgHandle.closeAlert();
      }
		}

		const billCallback = async function(newBillData, paymentData){
			let billParams = {data: newBillData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let billRes = await common.doCallApi('/api/shop/bill/add', billParams);

			if (billRes.status.code == 200) {
				let billId = billRes.Record.id;
				let paymentParams = {data: paymentData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
				let paymentRes = await common.doCallApi('/api/shop/payment/add', paymentParams);
				if (paymentRes.status.code == 200) {
					let docParams = {orderId: orderObj.id, shopId: shopData.id/*, filename: newBillData.Filename, No: newBillData.No*/};
					let docRes = await common.doCallApi('/api/shop/bill/create/report', docParams);
					console.log(docRes);
					if (docRes.status.code == 200) {
						//window.open(docRes.result.link, '_blank');
						closeorderdlg.doOpenReportPdfDlg(docRes.result.link, 'บิลเงินสด/ใบเสร็จรับเงิน', ()=>{
							$(cancelCmd).click();
						});
						$.notify("ออกบิลเงินสด/ใบเสร็จรับเงินสำเร็จ", "sucess");
					} else if (docRes.status.code == 300) {
						$.notify("ระบบไม่พบรูปแบบเอกสารบิลเงินสด/ใบเสร็จรับเงิน", "error");
					}
				} else {
					$.notify("บันทึกข้อมูลการชำระเงินไม่สำเร็จ", "error");
				}
			} else {
				$.notify("บันทึกบิลไม่สำเร็จ", "error");
			}

			if (dlgHandle) {
        dlgHandle.closeAlert();
      }
		}

		const taxinvoiceCallback = async function(newTaxInvoiceData, paymentData){
			let taxinvoiceParams = {data: newTaxInvoiceData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let taxinvoiceRes = await common.doCallApi('/api/shop/taxinvoice/add', taxinvoiceParams);

			if (taxinvoiceRes.status.code == 200) {
				let taxinvoiceId = taxinvoiceRes.Record.id;
				let paymentParams = {data: paymentData, shopId: shopData.id, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
				let paymentRes = await common.doCallApi('/api/shop/payment/add', paymentParams);
				if (paymentRes.status.code == 200) {
					let docParams = {orderId: orderObj.id, shopId: shopData.id/*, filename: newInvoiceData.Filename, No: newInvoiceData.No*/};
					let docRes = await common.doCallApi('/api/shop/taxinvoice/create/report', docParams);
					console.log(docRes);
					if (docRes.status.code == 200) {
						//window.open(docRes.result.link, '_blank');
						closeorderdlg.doOpenReportPdfDlg(docRes.result.link, 'ใบกำกับภาษี', ()=>{
							$(cancelCmd).click();
						});
						$.notify("ออกใบกำกับภาษีสำเร็จ", "sucess");
					} else if (docRes.status.code == 300) {
						$.notify("ระบบไม่พบรูปแบบเอกสารใบกำกับภาษี", "error");
					}
				} else {
					$.notify("บันทึกข้อมูลการชำระเงินไม่สำเร็จ", "error");
				}
			} else {
				$.notify("บันทึกใบกำกับภาษีไม่สำเร็จ", "error");
			}

			if (dlgHandle) {
        dlgHandle.closeAlert();
      }
		}
  }

  const doOpenCustomerMngDlg = function(shopData, callback) {
    return new Promise(async function(resolve, reject) {
      const customerDlgContent = await customerdlg.doCreateFormDlg(shopData, callback);
      $(customerDlgContent).css({'margin-top': '10px'});
      const customerformoption = {
  			title: 'เลือกรายการลูกค้า',
  			msg: $(customerDlgContent),
  			width: '520px',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
          customerFormBoxHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				customerFormBoxHandle.closeAlert();
  			}
  		}
  		let customerFormBoxHandle = $('body').radalert(customerformoption);
      $(customerFormBoxHandle.okCmd).hide();
      resolve(customerFormBoxHandle)
    });
  }

  const doOpenGoodItemMngDlg = function(shopData, gooditemSeleted, callback){
    return new Promise(async function(resolve, reject) {
      const gooditemDlgContent = await gooditemdlg.doCreateFormDlg(shopData, gooditemSeleted, callback);
			$(gooditemDlgContent).find('#SearchKeyInput').css({'width': '280px', 'background': 'url("../../images/search-icon.png") right center / 8% 100% no-repeat'});
      $(gooditemDlgContent).css({'margin-top': '10px'});
      const gooditemformoption = {
  			title: 'เลือกรายการสินค้า',
  			msg: $(gooditemDlgContent),
  			width: '580px',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
          gooditemFormBoxHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				gooditemFormBoxHandle.closeAlert();
  			}
  		}
  		let gooditemFormBoxHandle = $('body').radalert(gooditemformoption);
      $(gooditemFormBoxHandle.okCmd).hide();
      resolve(gooditemFormBoxHandle)
    });
  }

	const doOpenCreateCloseOrderDlg = function(shopData, orderTotal, orderObj, invoiceCallback, billCallback, taxinvoiceCallback) {
		return new Promise(async function(resolve, reject) {
      const closeOrderDlgContent = await closeorderdlg.doCreateFormDlg(shopData, orderTotal, orderObj, invoiceCallback, billCallback, taxinvoiceCallback);
      $(closeOrderDlgContent).css({'margin-top': '10px'});
      const closeOrderformoption = {
  			title: 'ป้อนข้อมูลเพื่อเตรียมออกใบแจ้งหนี้ หรือ เก็บเงิน',
  			msg: $(closeOrderDlgContent),
  			width: '420px',
  			onOk: async function(evt) {
          closeOrderFormBoxHandle.closeAlert();
  			},
  			onCancel: function(evt){
  				closeOrderFormBoxHandle.closeAlert();
  			}
  		}
  		let closeOrderFormBoxHandle = $('body').radalert(closeOrderformoption);
      $(closeOrderFormBoxHandle.okCmd).hide();
      resolve(closeOrderFormBoxHandle)
    });
	}

  const doRenderCustomerContent = function(customerData){
    let customerDataTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let dataRow = $('<tr></tr>');
    let avatarCell = $('<td width="30%" rowspan="3" align="center" valign="middle"></td>');
    let nameCell = $('<td width="*" align="left"><b>ชื่อลูกค้า</b> ' + customerData.Name + '</td>');
    let addressCell = $('<td><b>ที่อยู่</b> ' + customerData.Address + '</td>');
    let telCell = $('<td><b>โทรศัพท์</b> ' + customerData.Tel + '</td>');
    let avatarIcon = $('<img src="../../images/avatar-icon.png"/>').css({'width': '95px', 'height': 'auto'});
    $(avatarCell).append($(avatarIcon));
    $(dataRow).append($(avatarCell)).append($(nameCell));
    $(customerDataTable).append($(dataRow));
    dataRow = $('<tr></tr>');
    $(dataRow).append($(addressCell));
    $(customerDataTable).append($(dataRow));
    dataRow = $('<tr></tr>');
    $(dataRow).append($(telCell));
    $(customerDataTable).append($(dataRow));
    return $(customerDataTable);
  }

  const doRenderGoodItemTable = function(orderData, gooditemWorkingBox){
    return new Promise(async function(resolve, reject) {
      let goodItemForm = $('<table width="100%" cellspacing="0" cellpadding="0" border="1"></table>');
      let goodItemHeadFormRow = $('<tr></tr>').css({'background-color': 'grey', 'color': 'white', 'height': '42px'});
      let goodItemHeadNumberCell = $('<td width="5%" align="center"><b>#</b></td>');
      let goodItemHeadNameCell = $('<td width="30%" align="center"><b>รายการ</b></td>');
      let goodItemHeadQtyCell = $('<td width="7%" align="center"><b>จำนวน</b></td>');
      let goodItemHeadUnitCell = $('<td width="10%" align="center"><b>หน่วย</b></td>');
      let goodItemHeadPriceCell = $('<td width="15%" align="center"><b>ราคาต่อหน่วย</b></td>');
      let goodItemHeadSubTotalCell = $('<td width="15%" align="center"><b>รวม</b></td>');
      let goodItemHeadControlCmd = $('<td width="*" align="center" valign="middle"></td>');
      $(goodItemHeadFormRow).append($(goodItemHeadNumberCell)).append($(goodItemHeadNameCell)).append($(goodItemHeadQtyCell)).append($(goodItemHeadUnitCell))
      $(goodItemHeadFormRow).append($(goodItemHeadPriceCell)).append($(goodItemHeadSubTotalCell)).append($(goodItemHeadControlCmd));
      $(goodItemForm).append($(goodItemHeadFormRow));
      let totalLabelCell = $('<td colspan="5" align="center" valign="middle"><b>ยอดรวม</b></td>');
      let totalValueCell = $('<td align="right" valign="middle"></td>');
			let totalRow = $('<tr></tr>').css({'background-color': '#ddd', 'height': '42px'});
			$(totalRow).append($(totalLabelCell)).append($(totalValueCell)).append($('<td align="center"></td>'));

      if ((orderData) && (orderData.gooditems) && (orderData.gooditems.length > 0)) {
        let	promiseList = new Promise(async function(resolve2, reject2){
          let total = 0;
          let goodItems = orderData.gooditems;
					let itenNoCells = [];
          for (let i=0; i < goodItems.length; i++) {
						let priceFrag = $('<span></span>').text(common.doFormatNumber(Number(goodItems[i].Price)));
						if ([1, 2].includes(orderData.Status)) {
							$(priceFrag).css({'cursor': 'pointer', 'text-decoration': 'underline', 'text-decoration-style': 'dotted'})
							$(priceFrag).on('click', (evt)=>{
								doEditOnTheFly(evt, orderData.gooditems, i, async(newPrice)=>{
									orderData.gooditems[i].Price = newPrice;
									$(priceFrag).text(common.doFormatNumber(Number(orderData.gooditems[i].Price)));
									subTotal = Number(orderData.gooditems[i].Price) * Number(orderData.gooditems[i].Qty);
									$(subTotalCell).empty().append($('<span>' +  common.doFormatNumber(subTotal) + '</span>').css({'margin-right': '4px'}));
									total = await doCalOrderTotal(orderData.gooditems);
				          $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
								});
							});
						}
            let goodItemRow = $('<tr></tr>');
						let itenNoCell = $('<td align="center">' + (i+1) + '</td>');
            $(goodItemRow).append($(itenNoCell));
            $(goodItemRow).append($('<td align="left">' + goodItems[i].MenuName + '</td>'));
            let goodItemQtyCell = $('<td align="center">' + common.doFormatQtyNumber(goodItems[i].Qty) + '</td>');
            $(goodItemRow).append($(goodItemQtyCell));
            $(goodItemRow).append($('<td align="center">' + goodItems[i].Unit + '</td>'));
            $(goodItemRow).append($('<td align="center"></td>').append($(priceFrag)));
            let subTotal = Number(goodItems[i].Price) * Number(goodItems[i].Qty);
            let subTotalCell = $('<td align="right"></td>');
						$(subTotalCell).append($('<span>' +  common.doFormatNumber(subTotal) + '</span>').css({'margin-right': '4px'}))
            $(goodItemRow).append($(subTotalCell));
            let commandCell = $('<td align="center"></td>');
            $(goodItemRow).append($(commandCell));

            let increaseBtnCmd = common.doCreateImageCmd('../../images/plus-sign-icon.png', 'เพิ่มจำนวน');
            $(increaseBtnCmd).on('click', async(evt)=>{
              let oldQty = $(goodItemQtyCell).text();
              oldQty = Number(oldQty);
              let newQty = oldQty + 1;
              $(goodItemQtyCell).text(common.doFormatQtyNumber(newQty));
              goodItems[i].Qty = newQty;
              subTotal = Number(goodItems[i].Price) * newQty;
              $(subTotalCell).empty().append($('<span><b>' + common.doFormatNumber(subTotal) + '</b></span>').css({'margin-right': '4px'}));
              let total = await doCalOrderTotal(orderData.gooditems);
              $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
            });
            let decreaseBtnCmd = common.doCreateImageCmd('../../images/minus-sign-icon.png', 'ลดจำนวน');
            $(decreaseBtnCmd).on('click', async(evt)=>{
              let oldQty = $(goodItemQtyCell).text();
              oldQty = Number(oldQty);
              let newQty = oldQty - 1;
              if (newQty > 0) {
                $(goodItemQtyCell).text(common.doFormatQtyNumber(newQty));
                goodItems[i].Qty = newQty;
                subTotal = Number(goodItems[i].Price) * newQty;
                $(subTotalCell).empty().append($('<span><b>' + common.doFormatNumber(subTotal) + '</b></span>').css({'margin-right': '4px'}));
                let total = await doCalOrderTotal(orderData.gooditems);
                $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
              } else {
                $.notify("ไม่สามารถลดจำนวนสินค้าได้น้อยไปกว่านี้", "error");
              }
            });

            let deleteGoodItemCmd = common.doCreateImageCmd('../../images/cross-red-icon.png', 'ลบรายการ');
            $(deleteGoodItemCmd).on('click', async (evt)=>{
							$(goodItemRow).remove();
              let newGoodItems = await doDeleteGoodItem(i, orderData);
              orderData.gooditems = newGoodItems;
							itenNoCells = await itenNoCells.filter((item)=>{
								if ($(item).text() !== $(itenNoCell).text()) {
									if ($(item).text() > $(itenNoCell).text()) {
										let value = $(item).text();
										value = Number(value) - 1;
										return $(item).text(value);
									} else {
										return $(item);
									}
								}
							})
              let total = await doCalOrderTotal(orderData.gooditems);
              $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
            });
						if ([1, 2].includes(orderData.Status)) {
            	$(commandCell).append($(increaseBtnCmd)).append($(decreaseBtnCmd)).append($(deleteGoodItemCmd));
						}
            $(goodItemForm).append($(goodItemRow));
						itenNoCells.push($(itenNoCell));
          }
          total = await doCalOrderTotal(orderData.gooditems);
          $(totalValueCell).empty().append($('<span><b>' + common.doFormatNumber(total) + '</b></span>').css({'margin-right': '4px'}));
          $(goodItemForm).append($(totalRow));
          setTimeout(()=>{
            resolve2($(goodItemForm));
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
          resolve(ob[0]);
        });
      } else {
				$(totalValueCell).empty().append($('<span><b>0.00</b></span>').css({'margin-right': '4px'}));
				$(goodItemForm).append($(totalRow));
        resolve($(goodItemForm));
      }
    });
  }

  const doDeleteGoodItem = function(goodItemIndex, orderData) {
    return new Promise(async function(resolve, reject) {
      let anotherItems = await orderData.gooditems.filter((item, i)=>{
        if (i != goodItemIndex) {
          return item;
        }
      });
      resolve(anotherItems);
    });
  }

  const doCalOrderTotal = function(gooditems){
    return new Promise(async function(resolve, reject) {
      let total = 0;
      await gooditems.forEach((item, i) => {
        total += Number(item.Price) * Number(item.Qty);
      });
      resolve(total);
    });
  }

  const doCreateOrderList = function(shopData, workAreaBox, orderDate){
    return new Promise(async function(resolve, reject) {
			let orderReqParams = {};
			if (orderDate) {
				orderReqParams = {orderDate: orderDate};
			}

      let orderRes = await common.doCallApi('/api/shop/order/list/by/shop/' + shopData.id, orderReqParams);
      let orders = orderRes.Records;
      console.log(orders);

			let yellowOrders = [];
			let orangeOrders = [];
			let greenOrders = [];
			let greyOrders = [];

      let orderListBox = $('<div id="OrderListBox"></div>').css({'position': 'relative', 'width': '100%', 'margin-top': '25px', 'overflow': 'auto'});
      if ((orders) && (orders.length > 0)) {
        let	promiseList = new Promise(async function(resolve2, reject2){
          for (let i=0; i < orders.length; i++) {
            //console.log(orders[i]);
            let total = await doCalOrderTotal(orders[i].Items);
            let orderDate = new Date(orders[i].createdAt);
            let fmtDate = common.doFormatDateStr(orderDate);
            let fmtTime = common.doFormatTimeStr(orderDate);
            let ownerOrderFullName = orders[i].userinfo.User_NameTH + ' ' + orders[i].userinfo.User_LastNameTH;
            let orderBox = $('<div></div>').css({'width': '125px', 'position': 'relative', 'min-height': '150px', 'border': '2px solid black', 'border-radius': '5px', 'float': 'left', 'cursor': 'pointer', 'padding': '5px', 'margin-left': '8px', 'margin-top': '10px'});
            $(orderBox).append($('<div><b>ลูกค้า :</b> ' + orders[i].customer.Name + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>ผู้รับออร์เดอร์ :</b> ' + ownerOrderFullName + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>ยอดรวม :</b> ' + common.doFormatNumber(total) + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>วันที่-เวลา :</b> ' + fmtDate + ':' + fmtTime + '</div>').css({'width': '100%'}));
						if (orders[i].Status == 1) {
							$(orderBox).css({'background-color': 'yellow'});
							let mergeOrderCmdBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'center', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px', 'border': '1px solid black'});
							$(mergeOrderCmdBox).append($('<span>ยุบรวมออร์เดอร์</span>').css({'font-weight': 'bold'}));
							$(mergeOrderCmdBox).on('click', async (evt)=>{
								evt.stopPropagation();
								mergeorderdlg.doMergeOrder(orders, i, async (newOrders, destIndex)=>{
									let params = {data: {Status: 0, userId: orders[i].userId, userinfoId: orders[i].userinfoId}, id: orders[i].id};
									let orderRes = await common.doCallApi('/api/shop/order/update', params);
									if (orderRes.status.code == 200) {
										$.notify("ยกเลิกรายการออร์เดอร์สำเร็จ", "success");
										params = {data: {Items: orders[destIndex].Items, userId: orders[i].userId, userinfoId: orders[i].userinfoId}, id: orders[destIndex].id};
					          orderRes = await common.doCallApi('/api/shop/order/update', params);
					          if (orderRes.status.code == 200) {
					            $.notify("ยุบรวมรายการออร์เดอร์สำเร็จ", "success");
											common.delay(500).then(async()=>{
												$('#OrderListBox').remove();
												let newOrderListBox = await doCreateOrderList(shopData, workAreaBox, orderReqParams.orderDate);
												$(workAreaBox).append($(newOrderListBox));
											});
					          } else {
					            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
					          }
									} else {
										$.notify("ระบบไม่สามารถยกเลิกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
									}
								});
							});
							$(orderBox).append($(mergeOrderCmdBox));
							let cancelOrderCmdBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'center', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px', 'border': '1px solid black'});
							$(cancelOrderCmdBox).append($('<span>ยกเลิกออร์เดอร์</span>').css({'font-weight': 'bold'}));
							$(cancelOrderCmdBox).on('click', async (evt)=>{
								evt.stopPropagation();
								let params = {data: {Status: 0, userId: orders[i].userId, userinfoId: orders[i].userinfoId}, id: orders[i].id};
								let orderRes = await common.doCallApi('/api/shop/order/update', params);
								if (orderRes.status.code == 200) {
									$.notify("ยกเลิกรายการออร์เดอร์สำเร็จ", "success");
									common.delay(500).then(async()=>{
										$('#OrderListBox').remove();
										let newOrderListBox = await doCreateOrderList(shopData, workAreaBox, orderReqParams.orderDate);
										$(workAreaBox).append($(newOrderListBox));
									});
								} else {
									$.notify("ระบบไม่สามารถยกเลิกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
								}
							});
							$(orderBox).append($(cancelOrderCmdBox));
							yellowOrders.push(orders[i]);
						} else if (orders[i].Status == 2) {
							$(orderBox).css({'background-color': 'orange'});
							let invoiceBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
							let openInvoicePdfCmd = $('<span>' + orders[i].invoice.No + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
							$(openInvoicePdfCmd).on('click', async (evt)=>{
								evt.stopPropagation();
								//closeorderdlg.doOpenReportPdfDlg('/shop/img/usr/pdf/' + orders[i].invoice.Filename, 'ใบแจ้งหนี้');
								let docParams = {orderId: orders[i].id, shopId: shopId};
								let docRes = await common.doCallApi('/api/shop/invoice/create/report', docParams);
								console.log(docRes);
								if (docRes.status.code == 200) {
									closeorderdlg.doOpenReportPdfDlg(docRes.result.link, 'ใบแจ้งหนี้');
									//const pdfURL = docRes.result.link + '?t=' + common.genUniqueID();
									//const reportPdfDlgContent = $('<object data="' + pdfURL + '" type="application/pdf" width="99%" height="380"></object>');
									$.notify("ออกใบแจ้งหนี้่สำเร็จ", "sucess");
								} else if (docRes.status.code == 300) {
									$.notify("ระบบไม่พบรูปแบบเอกสารใบแจ้งหนี้", "error");
								}
							});
							let openInvoiceQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
							$(openInvoiceQrCmd).on('click', (evt)=>{
								evt.stopPropagation();
								let shareCode = orders[i].invoice.Filename.split('.')[0];
								window.open('/shop/share/?id=' + shareCode, '_blank');
							});
							$(invoiceBox).append($(openInvoicePdfCmd)).append($(openInvoiceQrCmd));
							$(orderBox).append($(invoiceBox));
							orangeOrders.push(orders[i]);
						} else if ((orders[i].Status == 3) || (orders[i].Status == 4)) {
							$(orderBox).css({'background-color': 'green'});
							if (orders[i].bill){
								let billBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
								let openBillPdfCmd = $('<span>' + orders[i].bill.No + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
								$(openBillPdfCmd).on('click', (evt)=>{
									evt.stopPropagation();
									closeorderdlg.doOpenReportPdfDlg('/shop/img/usr/pdf/' + orders[i].bill.Filename, 'บิลเงินสด/ใบเสร็จรับเงิน');
								});
								let openBillQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
								$(openBillQrCmd).on('click', (evt)=>{
									evt.stopPropagation();
									let shareCode = orders[i].bill.Filename.split('.')[0];
									window.open('/shop/share/?id=' + shareCode, '_blank');
								});
								$(billBox).append($(openBillPdfCmd)).append($(openBillQrCmd));
								$(orderBox).append($(billBox));
							}
							if (orders[i].taxinvoice){
								let taxinvoiceBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
								let openTaxInvoicePdfCmd = $('<span>' + orders[i].taxinvoice.No + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
								$(openTaxInvoicePdfCmd).on('click', (evt)=>{
									evt.stopPropagation();
									closeorderdlg.doOpenReportPdfDlg('/shop/img/usr/pdf/' + orders[i].taxinvoice.Filename, 'ใบกำกับภาษี');
								});
								let openTaxInvoiceQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
								$(openTaxInvoiceQrCmd).on('click', (evt)=>{
									evt.stopPropagation();
									let shareCode = orders[i].taxinvoice.Filename.split('.')[0];
									window.open('/shop/share/?id=' + shareCode, '_blank');
								});
								$(taxinvoiceBox).append($(openTaxInvoicePdfCmd)).append($($(openTaxInvoiceQrCmd)));
								$(orderBox).append($(taxinvoiceBox));
							}
							greenOrders.push(orders[i]);
						} else if (orders[i].Status == 0) {
							$(orderBox).css({'background-color': 'grey'});
							$(orderBox).addClass('canceled-order');
							greyOrders.push(orders[i]);
						}
            $(orderBox).on('click', (evt)=>{
							evt.stopPropagation();
              let orderData = {customer: orders[i].customer, gooditems: orders[i].Items, id: orders[i].id, Status: orders[i].Status};
              $(orderListBox).remove();
              doOpenOrderForm(shopData, workAreaBox, orderData, orderDate);
            });
            $(orderListBox).append($(orderBox));
          }
          setTimeout(()=>{
            resolve2($(orderListBox));
          }, 500);
        });
        Promise.all([promiseList]).then((ob)=>{
          $(workAreaBox).append($(ob[0]));
					$('#App').find('#SummaryBox').remove();
					let summaryData = {yellowOrders, orangeOrders, greenOrders, greyOrders};
					let summaryBox = $('<div id="SummaryBox"></div>').css({'position': 'relative', 'width': '99%', 'min-height': '60px', 'cursor': 'pointer', 'font-size': '18px', 'text-align': 'center', 'background-color': ' #dddd', 'border': '2px solid grey', 'margin-top': '45px', 'overflow': 'auto'});
					$(summaryBox).append($('<span><b>สรุป</b></span>').css({'line-height': '60px'}));
					$(summaryBox).data('summaryData', summaryData);
					$(summaryBox).on('click', (evt)=>{
						doShowSummaryOrder(evt);
						$(summaryBox).off('click');
					});
					$('#App').append($(summaryBox).css({'padding': '5px'}));
					if (common.shopSensitives.includes(shopData.id)) {
						let sensitiveWordJSON = JSON.parse(localStorage.getItem('sensitiveWordJSON'));
						common.delay(500).then(async ()=>{
							await common.doResetSensitiveWord(sensitiveWordJSON);
						});
					}
					resolve(ob[0]);
        });
      } else {
				let notFoundOrderDatbox = $('<div>ไม่พบรายการ<span id="notFoundOrderDatbox" class="sensitive-word">ออร์เดอร์</span>ของวันที่ ' + orderDate + '</div>');
				$(orderListBox).append($(notFoundOrderDatbox));
        resolve($(orderListBox));
      }
    });
  }

	const doEditOnTheFly = function(event, gooditems, index, successCallback){
		let editInput = $('<input type="number"/>').val(common.doFormatNumber(Number(gooditems[index].Price))).css({'width': '100px', 'margin-left': '20px'});
		$(editInput).on('keyup', (evt)=>{
			if (evt.keyCode == 13) {
				$(dlgHandle.okCmd).click();
			}
		});
		let editLabel = $('<label>ราคา:</label>').attr('for', $(editInput)).css({'width': '100%'})
		let editDlgOption = {
			title: 'แก้ไขราคา',
			msg: $('<div></div>').css({'width': '100%', 'height': '70px', 'margin-top': '20px'}).append($(editLabel)).append($(editInput)),
			width: '220px',
			onOk: async function(evt) {
				let newValue = $(editInput).val();
				if(newValue !== '') {
					$(editInput).css({'border': ''});
					let params = {data: {Price: newValue}, id: gooditems[index].id};
					let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
					if (menuitemRes.status.code == 200) {
						$.notify("แก้ไขรายการเมนูสำเร็จ", "success");
						dlgHandle.closeAlert();
						successCallback(newValue);
					} else if (menuitemRes.status.code == 201) {
						$.notify("ไม่สามารถแก้ไขรายการเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการเมนูได้", "error");
					}
				} else {
					$.notify('ราคาสินค้าต้องไม่ว่าง', 'error');
					$(editInput).css({'border': '1px solid red'});
				}
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		let dlgHandle = $('body').radalert(editDlgOption);
		return dlgHandle;
	}

	const doShowSummaryOrder = function(evt){
		return new Promise(async function(resolve, reject) {
			//let summaryData = {yellowOrders, orangeOrders, greenOrders, greyOrders};
			let summaryBox = $(evt.currentTarget);
			let summaryData = $(summaryBox).data('summaryData');
			let summaryTable = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			let summaryRow = $('<div style="display: table-row; width: 100%;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"><b>ประเภท</b></span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"><b>จำนวน</b></span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"><b>มูลค่ารวม</b></span>'));
			$(summaryTable).append($(summaryRow));
			let cancelAmount = 0;
			for (let i=0; i < summaryData.greyOrders.length; i++){
				cancelAmount += await doCalOrderTotal(summaryData.greyOrders[i].Items);
			}
			let newAmount = 0;
			for (let i=0; i < summaryData.yellowOrders.length; i++){
				newAmount += await doCalOrderTotal(summaryData.yellowOrders[i].Items);
			}
			let invoiceAmount = 0;
			for (let i=0; i < summaryData.orangeOrders.length; i++){
				invoiceAmount += await doCalOrderTotal(summaryData.orangeOrders[i].Items);
			}
			let successAmount = 0;
			for (let i=0; i < summaryData.greenOrders.length; i++){
				successAmount += await doCalOrderTotal(summaryData.greenOrders[i].Items);
			}

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: grey;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">ยกเลิก</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.greyOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(cancelAmount)));
			$(summaryTable).append($(summaryRow));

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: yellow;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">ออร์เดอร์ใหม่</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.yellowOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(newAmount)));
			$(summaryTable).append($(summaryRow));

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: orange;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">รอเก็บเงิน</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.orangeOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(invoiceAmount)));
			$(summaryTable).append($(summaryRow));

			summaryRow = $('<div style="display: table-row; width: 100%; background-color: green;"></div>');
			$(summaryRow).append($('<span style="display: table-cell; text-align: left;">เก็บเงินแล้ว</span>'));
			$(summaryRow).append($('<span style="display: table-cell; text-align: center;"></span>').text(summaryData.greenOrders.length));
			$(summaryRow).append($('<span style="display: table-cell; text-align: right;"></span>').text(common.doFormatNumber(successAmount)));
			$(summaryTable).append($(summaryRow));

			$(summaryBox).empty().append($(summaryTable));

			$(summaryBox).on('click', (evt)=>{
				$(summaryBox).off('click');
				$(summaryBox).empty().append($('<span><b>สรุป</b></span>').css({'line-height': '60px'}));
				$(summaryBox).on('click', (evt)=>{
					$(summaryBox).off('click');
					doShowSummaryOrder(evt);
				});
			});
			resolve();
		});
	}

  return {
    doShowOrderList,
		doShowCalendarDlg
	}
}
