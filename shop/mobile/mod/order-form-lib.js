module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../home/mod/common-lib.js')($);
	const styleCommon = require('./style-common-lib.js')($);

	const customerdlg = require('../../setting/admin/mod/customer-dlg.js')($);
	const gooditemdlg = require('../../setting/admin/mod/gooditem-dlg.js')($);
	const closeorderdlg = require('../../setting/admin/mod/closeorder-dlg.js')($);
	const gooditem = require('../../setting/admin/mod/menuitem-mng.js')($);

  let pageHandle = undefined;

  const setupPageHandle = function(value){
    pageHandle = value;
  }

  const doOpenOrderForm = async function(shopId, workAreaBox, orderData, selectDate, doShowOrderList){
		let userdata = JSON.parse(localStorage.getItem('userdata'));
		let userId = userdata.id;
		let userinfoId = userdata.userinfoId;

    let orderObj = {};
    $(workAreaBox).empty();
    let titleText = 'เปิดออร์เดอร์ใหม่';
    if (orderData) {
      titleText = 'แก้ไขออร์เดอร์';
			orderObj.id = orderData.id;
			orderObj.Status = orderData.Status
    } else {
			orderObj.Status = 1;
		}
    let titlePageBox = $('<div style="padding: 4px;"></viv>').text(titleText).css(styleCommon.titlePageBoxStyle);
    let customerWokingBox = $('<div id="OrderCustomer" style="padding: 4px; width: 100%; border-bottom: 1px solid black"></viv>');
    let itemlistWorkingBox = $('<div id="OrderItemList" style="padding: 4px; width: 100%;"></viv>');
    let saveNewOrderCmdBox = $('<div id="LastBox"></div>').css({'width': '100%', 'text-align': 'center'});
    $(workAreaBox).append($(titlePageBox)).append($(customerWokingBox)).append($(itemlistWorkingBox)).append($(saveNewOrderCmdBox));

    let customerForm = $('<table width="98%" cellspacing="0" cellpadding="0" border="0"></table>');
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
		if ((orderData) && (orderData.invoice)) {
			orderObj.invoice = orderData.invoice;
		}
		if ((orderData) && (orderData.bill)) {
			orderObj.bill = orderData.bill;
		}
		if ((orderData) && (orderData.taxinvoice)) {
			orderObj.taxinvoice = orderData.taxinvoice;
		}

		console.log(orderObj);

    $(editCustomerCmd).on('click', async (evt)=>{
			let customerDlgContent = await customerdlg.doCreateFormDlg({id: shopId}, customerSelectedCallback);
			$(customerDlgContent).find('input[type="text"]').css({'width': '280px', 'background': 'url("../../images/search-icon.png") right center / 8% 100% no-repeat'});
			$(pageHandle.menuContent).empty().append($(customerDlgContent).css({'position': 'relative', 'margin-top': '15px'}));
			$(pageHandle.toggleMenuCmd).click();
    });
		$(customerControlCmd).append($(editCustomerCmd));

		let addNewGoodItemCmd = undefined;
		//if (orderObj.Status == 1) {
		if ([1, 2].includes(orderObj.Status)) {
			addNewGoodItemCmd = common.doCreateTextCmd('เพิ่มรายการ', 'green', 'white');
	    $(addNewGoodItemCmd).on('click', async (evt)=>{
				let gooditemDlgContent = await gooditemdlg.doCreateFormDlg({id: shopId}, orderObj.gooditems, gooditemSelectedCallback);
				$(gooditemDlgContent).find('#SearchKeyInput').css({'width': '180px', 'background': 'url("../../images/search-icon.png") right center / 12% 100% no-repeat'});
				$(pageHandle.menuContent).empty().append($(gooditemDlgContent).css({'position': 'relative', 'margin-top': '15px'}));
				$(pageHandle.toggleMenuCmd).click();
	    }).css({'display': 'inline-block', 'width': '80px'});
		}

		let doShowCloseOrderForm = async function() {
			let total = await doCalOrderTotal(orderObj.gooditems);
			if (total > 0) {
				let closeOrderDlgContent = await closeorderdlg.doCreateFormDlg({id: shopId}, total, orderObj, invoiceCallback, billCallback, taxinvoiceCallback);
				$(pageHandle.menuContent).empty().append($(closeOrderDlgContent).css({'position': 'relative', 'margin-top': '15px'}));
				$(pageHandle.toggleMenuCmd).click();
				if (orderObj.Status == 2) {
					let middleActionCmdCell = $(closeOrderDlgContent).find('#MiddleActionCmdCell');
					let createInvoiceCmd = $(middleActionCmdCell).find('#CreateInvoiceCmd');

					let textCmdCallback = async function(evt){
						$(pageHandle.toggleMenuCmd).click();
						let docParams = {orderId: orderObj.id, shopId: shopId};
						let docRes = await common.doCallApi('/api/shop/invoice/create/report', docParams);
						console.log(docRes);
						if (docRes.status.code == 200) {
							//closeorderdlg.doOpenReportPdfDlg(docRes.result.link, 'ใบแจ้งหนี้');
							let report = docRes.result;
							let reportBox = doCreateReportBox(report, 'ใบแจ้งหนี้');
							$(pageHandle.mainContent).slideUp('slow');
							$(pageHandle.mainBox).append($(reportBox));
							$(reportBox).slideDown('slow');
							$.notify("ออกใบแจ้งหนี้่สำเร็จ", "sucess");
						} else if (docRes.status.code == 300) {
							$.notify("ระบบไม่พบรูปแบบเอกสารใบแจ้งหนี้", "error");
						}
					}
					let qrCmdCallback = function(evt){
						let shareCode = orderObj.invoice.Filename.split('.')[0];
						window.open('/shop/share/?id=' + shareCode, '_blank');
						$(pageHandle.toggleMenuCmd).click();
					}
					let invoiceBox = common.doCreateReportDocButtonCmd(orderObj.invoice.No, textCmdCallback, qrCmdCallback);
					$(middleActionCmdCell).append($(invoiceBox).css({'margin-left': '4px'}));
				}
			} else {
				$.notify("ออร์เดอร์ยังไม่สมบูรณ์โปรดเพิ่มรายการสินค้าก่อน", "error");
			}
		}

		let callCreateCloseOrderCmd = undefined;
		if ([1, 2].includes(orderObj.Status)) {
			callCreateCloseOrderCmd = common.doCreateTextCmd(' คิดเงิน ', '#F5500E', 'white', '#5D6D7E', '#FF5733');
			$(callCreateCloseOrderCmd).on('click', async (evt)=>{
				if (orderObj.customer) {
					let params = undefined;
					let orderRes = undefined;
					if ((orderData) && (orderData.id)) {
						params = {data: {Items: orderObj.gooditems, Status: orderObj.Status, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId}, id: orderData.id};
						orderRes = await common.doCallApi('/api/shop/order/update', params);
						if (orderRes.status.code == 200) {
							$.notify("บันทึกรายการออร์เดอร์สำเร็จ", "success");
							doShowCloseOrderForm();
						} else {
							$.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
						}
					} else {
						params = {data: {Items: orderObj.gooditems, Status: 1}, shopId: shopId, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId};
	          orderRes = await common.doCallApi('/api/shop/order/add', params);
	          if (orderRes.status.code == 200) {
	            $.notify("เพิ่มรายการออร์เดอร์สำเร็จ", "success");
							orderObj.id = orderRes.Records[0].id;
							orderData = orderRes.Records[0];
							doShowCloseOrderForm();
	          } else {
	            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
	          }
					}
				} else {
	        $.notify("โปรดระบุข้อมูลลูกค้าก่อนบันทึกออร์เดอร์", "error");
	      }
	    }).css({'display': 'inline-block', 'width': '80px'});
		} else {
			let report = undefined;
			let shareCode = undefined;
			let docNo = undefined;
			let titleDoc = undefined;
			if (orderObj.Status == 3) {
				report = orderObj.bill.Report;
				shareCode = orderObj.bill.Filename.split('.')[0];
				docNo = orderObj.bill.No;
				titleDoc = 'บิลเงินสด/ใบเสร็จรับเงิน';
			} else if (orderObj.Status == 4) {
				report = orderObj.taxinvoice.Report;
				shareCode = orderObj.taxinvoice.Filename.split('.')[0];
				docNo = orderObj.taxinvoice.No;
				titleDoc = 'ใบกำกับภาษี';
			}
			let textCmdCallback = function(evt){
				let reportBox = doCreateReportBox(report, titleDoc);
				$(pageHandle.mainContent).slideUp('slow');
				$(pageHandle.mainBox).append($(reportBox));
				$(reportBox).slideDown('slow');
			}
			let qrCmdCallback = function(evt){
				window.open('/shop/share/?id=' + shareCode, '_blank');
			}
			callCreateCloseOrderCmd = common.doCreateReportDocButtonCmd(docNo, textCmdCallback, qrCmdCallback);
			$(callCreateCloseOrderCmd).css({'display': 'inline-block', 'width': '120px', 'background-color': 'green', 'color': 'white'});
		}

    if ((orderObj) && (orderObj.gooditems)){
      let goodItemTable = await doRenderGoodItemTable(orderObj);
			let addItemCmdBox = $(goodItemTable).find('#AddItemCmdBox');
			if (addNewGoodItemCmd) {
				$(addItemCmdBox).append($(addNewGoodItemCmd));
			}
			let closeOrderCmdBox = $(goodItemTable).find('#CloseOrderCmdBox');
			$(closeOrderCmdBox).append($(callCreateCloseOrderCmd));
      $(itemlistWorkingBox).append($(goodItemTable));
    }

    let cancelCmd = $('<input type="button" value=" กลับ "/>').css({'margin-left': '10px'});
    $(cancelCmd).on('click', async(evt)=>{
      await doShowOrderList(shopId, workAreaBox, selectDate);
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
            await doShowOrderList(shopId, workAreaBox, selectDate);
          } else {
            $.notify("ระบบไม่สามารถบันทึกออร์เดอร์ได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "error");
          }
        } else {
          params = {data: {Items: orderObj.gooditems, Status: 1}, shopId: shopId, customerId: orderObj.customer.id, userId: userId, userinfoId: userinfoId};
          orderRes = await common.doCallApi('/api/shop/order/add', params);
          if (orderRes.status.code == 200) {
            $.notify("เพิ่มรายการออร์เดอร์สำเร็จ", "success");
            await doShowOrderList(shopId, workAreaBox, selectDate);
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

    const customerSelectedCallback = function(customerSelected){
      orderObj.customer = customerSelected;
      customerDataBox = doRenderCustomerContent(customerSelected);
      $(customerContent).empty().append($(customerDataBox));
			$(editCustomerCmd).val('แก้ไขลูกค้า');
			$(pageHandle.toggleMenuCmd).click();
    }

    const gooditemSelectedCallback = async function(gooditemSelected){
      orderObj.gooditems.push(gooditemSelected);
      goodItemTable = await doRenderGoodItemTable(orderObj);
			let addItemCmdBox = $(goodItemTable).find('#AddItemCmdBox');
			if (addNewGoodItemCmd) {
				$(addItemCmdBox).append($(addNewGoodItemCmd));
			}
			let closeOrderCmdBox = $(goodItemTable).find('#CloseOrderCmdBox');
			$(closeOrderCmdBox).append($(callCreateCloseOrderCmd));
      $(itemlistWorkingBox).empty().append($(goodItemTable));
			//$(pageHandle.toggleMenuCmd).click();
    }

		const invoiceCallback = async function(newInvoiceData){
			$(pageHandle.toggleMenuCmd).click();
			let invoiceParams = {data: newInvoiceData, shopId: shopId, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let invoiceRes = await common.doCallApi('/api/shop/invoice/add', invoiceParams);

			if (invoiceRes.status.code == 200) {
				let invoiceId = invoiceRes.Record.id;
				let docParams = {orderId: orderObj.id, shopId: shopId/*, filename: newInvoiceData.Filename, No: newInvoiceData.No*/};
				let docRes = await common.doCallApi('/api/shop/invoice/create/report', docParams);
				console.log(docRes);
				if (docRes.status.code == 200) {
					//closeorderdlg.doOpenReportPdfDlg(docRes.result.link, 'ใบแจ้งหนี้');
					let report = docRes.result;
					let reportBox = doCreateReportBox(report, 'ใบแจ้งหนี้');
					$(pageHandle.mainContent).slideUp('slow');
					$(pageHandle.mainBox).append($(reportBox));
					$(reportBox).slideDown('slow');
					$.notify("ออกใบแจ้งหนี้่สำเร็จ", "sucess");
				} else if (docRes.status.code == 300) {
					$.notify("ระบบไม่พบรูปแบบเอกสารใบแจ้งหนี้", "error");
				}
			} else {
				$.notify("บันทึกใบแจ้งหนี้ไม่สำเร็จ", "error");
			}
			$(pageHandle.menuContent).empty();
		}

		const billCallback = async function(newBillData, paymentData){
			$(pageHandle.toggleMenuCmd).click();
			let billParams = {data: newBillData, shopId: shopId, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let billRes = await common.doCallApi('/api/shop/bill/add', billParams);
			if (billRes.status.code == 200) {
				let billId = billRes.Record.id;
				orderObj.bill = billRes.Record;
				let paymentParams = {data: paymentData, shopId: shopId, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
				let paymentRes = await common.doCallApi('/api/shop/payment/add', paymentParams);
				if (paymentRes.status.code == 200) {
					let docParams = {orderId: orderObj.id, shopId: shopId/*, filename: newBillData.Filename, No: newBillData.No*/};
					let docRes = await common.doCallApi('/api/shop/bill/create/report', docParams);
					console.log(docRes);
					if (docRes.status.code == 200) {
						let report = docRes.result;
						let reportBox = doCreateReportBox(report, 'บิลเงินสด/ใบเสร็จรับเงิน', ()=>{
							let textCmdCallback = function(evt){
								let reportBox = doCreateReportBox(report, 'บิลเงินสด/ใบเสร็จรับเงิน');
								$(pageHandle.mainContent).slideUp('slow');
								$(pageHandle.mainBox).append($(reportBox));
								$(reportBox).slideDown('slow');
							}
							let qrCmdCallback = function(evt){
								let shareCode = orderObj.bill.Filename.split('.')[0];
								window.open('/shop/share/?id=' + shareCode, '_blank');
							}
							let billCmdBox = common.doCreateReportDocButtonCmd(orderObj.bill.No, textCmdCallback, qrCmdCallback);
							$(billCmdBox).css({'display': 'inline-block', 'width': '120px', 'background-color': 'green', 'color': 'white'});
							$(callCreateCloseOrderCmd).parent().empty().append($(billCmdBox));
						});
						$(pageHandle.mainContent).slideUp('slow');
						$(pageHandle.mainBox).append($(reportBox));
						$(reportBox).slideDown('slow');
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
			$(pageHandle.menuContent).empty();
		}

		const taxinvoiceCallback = async function(newTaxInvoiceData, paymentData){
			$(pageHandle.toggleMenuCmd).click();
			let taxinvoiceParams = {data: newTaxInvoiceData, shopId: shopId, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
			let taxinvoiceRes = await common.doCallApi('/api/shop/taxinvoice/add', taxinvoiceParams);

			if (taxinvoiceRes.status.code == 200) {
				let taxinvoiceId = taxinvoiceRes.Record.id;
				orderObj.taxinvoice = taxinvoiceRes.Record;
				let paymentParams = {data: paymentData, shopId: shopId, orderId: orderObj.id, userId: userId, userinfoId: userinfoId};
				let paymentRes = await common.doCallApi('/api/shop/payment/add', paymentParams);
				if (paymentRes.status.code == 200) {
					let docParams = {orderId: orderObj.id, shopId: shopId/*, filename: newInvoiceData.Filename, No: newInvoiceData.No*/};
					let docRes = await common.doCallApi('/api/shop/taxinvoice/create/report', docParams);
					console.log(docRes);
					if (docRes.status.code == 200) {
						let report = docRes.result;
						let reportBox = doCreateReportBox(report, 'ใบกำกับภาษี', ()=>{
							let textCmdCallback = function(evt){
								let reportBox = doCreateReportBox(report, 'ใบกำกับภาษี');
								$(pageHandle.mainContent).slideUp('slow');
								$(pageHandle.mainBox).append($(reportBox));
								$(reportBox).slideDown('slow');
							}
							let qrCmdCallback = function(evt){
								let shareCode = orderObj.bill.Filename.split('.')[0];
								window.open('/shop/share/?id=' + shareCode, '_blank');
							}
							let taxinvoiceCmdBox = common.doCreateReportDocButtonCmd(orderObj.taxinvoice.No, textCmdCallback, qrCmdCallback);
							$(taxinvoiceCmdBox).css({'display': 'inline-block', 'width': '120px', 'background-color': 'green', 'color': 'white'});
							$(callCreateCloseOrderCmd).parent().empty().append($(taxinvoiceCmdBox));
						});
						$(pageHandle.mainContent).slideUp('slow');
						$(pageHandle.mainBox).append($(reportBox));
						$(reportBox).slideDown('slow');
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
			$(pageHandle.menuContent).empty();
		}
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

	const doRenderGoodItemTable = function(orderData){
    return new Promise(async function(resolve, reject) {
			let mainBox = $('<div id="MainGoodItemBox"></div>').css({'position': 'relative', 'width': '98%'});
			let addItemCmdBox = $('<div id="AddItemCmdBox"></div>').css({'position': 'relative', 'width': '100%', 'text-align': 'right', 'padding': '4px', 'border-bottom': '1px solid black'});
			let itemListBox = $('<div id="ItemListBox"></div>').css({'position': 'relative', 'width': '100%', 'text-align': 'left', 'padding': '4px', 'border-bottom': '1px solid black'});
			let summaryBox = $('<div id="SummaryBox"></div>').css({'position': 'relative', 'width': '100%', 'text-align': 'right', 'padding': '4px', 'border-bottom': 'double'});
			let closeOrderCmdBox = $('<div id="CloseOrderCmdBox"></div>').css({'position': 'relative', 'width': '100%', 'text-align': 'right', 'padding': '4px', 'border-bottom': 'double'});
			$(mainBox).append($(addItemCmdBox)).append($(itemListBox)).append($(summaryBox)).append($(closeOrderCmdBox));
			if ((orderData) && (orderData.gooditems) && (orderData.gooditems.length > 0)) {
				let	promiseList = new Promise(async function(resolve2, reject2){
          let total = 0;
					let totalBox = $('<span></span>').text(common.doFormatNumber(total)).css({'margin-right': '4px', 'font-size': '24px', 'font-weight': 'bold'});
          let goodItems = orderData.gooditems;
					let itenNoCells = [];
          for (let i=0; i < goodItems.length; i++) {
						let subTotal = Number(goodItems[i].Price) * Number(goodItems[i].Qty);
						let goodItemBox = $('<div></div>').css({'width': '125px', 'position': 'relative', 'min-height': '150px', 'border': '2px solid black', 'border-radius': '5px', 'float': 'left', 'cursor': 'pointer', 'padding': '5px', 'margin-left': '8px', 'margin-top': '10px'});;
						let goodItemImg = $('<img/>').attr('src', goodItems[i].MenuPicture).css({'width': '120px', 'height': 'auto'});
						let goodItemNameBox = $('<div></div>').text(goodItems[i].MenuName).css({'position': 'relative', 'width': '100%', 'padding': '2px', 'font-size': '16px'});
						let goodItemQtyUnitBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'padding': '2px'});
						let goodItemQtyBox = $('<span></span>').text(common.doFormatQtyNumber(goodItems[i].Qty)).css({'padding': '2px', 'font-size': '20px'});
						let goodItemUnitBox = $('<span></span>').text(goodItems[i].Unit).css({'padding': '2px', 'font-size': '16px'});
						let goodItemSubTotalBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'padding': '2px'});
						let goodItemSubTotalText = $('<span></span>').text(common.doFormatNumber(subTotal)).css({'position': 'relative', 'width': '100%', 'padding': '2px', 'font-size': '20px', 'font-weight': 'bold'});
						let increaseBtnCmd = common.doCreateImageCmd('../../images/plus-sign-icon.png', 'เพิ่มจำนวน');
						let decreaseBtnCmd = common.doCreateImageCmd('../../images/minus-sign-icon.png', 'ลดจำนวน');
						let deleteGoodItemCmd = common.doCreateImageCmd('../../images/cross-red-icon.png', 'ลบรายการ');
						$(increaseBtnCmd).css({'width': '22px', 'height': 'auto', 'margin-left': '8px'});
						$(increaseBtnCmd).on('click', async(evt)=>{
							evt.stopPropagation();
							let oldQty = Number($(goodItemQtyBox).text());
							let newQty = oldQty + 1;
							$(goodItemQtyBox).text(common.doFormatQtyNumber(newQty));
							goodItems[i].Qty = newQty;
							subTotal = Number(goodItems[i].Price) * newQty;
							$(goodItemSubTotalText).text(common.doFormatNumber(subTotal));
							let newTotal = await doCalOrderTotal(orderData.gooditems);
							$(totalBox).text(common.doFormatNumber(newTotal));
						});
						$(decreaseBtnCmd).on('click', async(evt)=>{
							evt.stopPropagation();
							let oldQty = Number($(goodItemQtyBox).text());
							let newQty = oldQty -1;
							if (newQty > 0) {
								$(goodItemQtyBox).text(common.doFormatQtyNumber(newQty));
								goodItems[i].Qty = newQty;
								subTotal = Number(goodItems[i].Price) * newQty;
								$(goodItemSubTotalText).text(common.doFormatNumber(subTotal));
								let newTotal = await doCalOrderTotal(orderData.gooditems);
								$(totalBox).text(common.doFormatNumber(newTotal));
							}
						});
						$(deleteGoodItemCmd).on('click', async (evt)=>{
							evt.stopPropagation();
							$(goodItemBox).remove();
							let newGoodItems = await doDeleteGoodItem(i, orderData);
							orderData.gooditems = newGoodItems;
							let newTotal = await doCalOrderTotal(orderData.gooditems);
							$(totalBox).text(common.doFormatNumber(newTotal));
						});

						$(decreaseBtnCmd).css({'width': '22px', 'height': 'auto', 'margin-left': '4px'});
						$(deleteGoodItemCmd).css({'width': '32px', 'height': 'auto', 'margin-left': '8px'});
						$(goodItemQtyUnitBox).append($(goodItemQtyBox)).append($(goodItemUnitBox));
						if ([1, 2].includes(orderData.Status)) {
							$(goodItemQtyUnitBox).append($(decreaseBtnCmd)).append($(increaseBtnCmd));
						}
						$(goodItemSubTotalBox).append($(goodItemSubTotalText));
						if ([1, 2].includes(orderData.Status)) {
							$(goodItemSubTotalBox).append($(deleteGoodItemCmd));
						}
						$(goodItemBox).append($(goodItemImg)).append($(goodItemNameBox)).append($(goodItemQtyUnitBox)).append($(goodItemSubTotalBox));
						$(itemListBox).append($(goodItemBox));
						$(goodItemBox).on('click', async(evt)=>{
							evt.stopPropagation();
							let menugroupRes = await common.doCallApi('/api/shop/menugroup/options/' + goodItems[i].shopId, {});
			      	let menugroups = menugroupRes.Options;
			      	localStorage.setItem('menugroups', JSON.stringify(menugroups));
							let gooditemForm = doCreateGoodItemProperyForm(orderData.gooditems[i], async (newData)=>{
								subTotal = Number(orderData.gooditems[i].Price) * Number(orderData.gooditems[i].Qty);
								$(goodItemSubTotalText).text(common.doFormatNumber(subTotal));
								total = await doCalOrderTotal(orderData.gooditems);
								$(totalBox).text(common.doFormatNumber(total));
							});
							$(pageHandle.menuContent).empty().append($(gooditemForm).css({'position': 'relative', 'margin-top': '15px', 'width': '91%'}));
							$(pageHandle.toggleMenuCmd).click();
						});
					}
					total = await doCalOrderTotal(orderData.gooditems);
					$(totalBox).text(common.doFormatNumber(total));
					$(summaryBox).empty().append($(totalBox));
					$(itemListBox).css({'display': 'block', 'overflow': 'auto'});
					setTimeout(()=>{
            resolve2($(mainBox));
          }, 500);
				});
        Promise.all([promiseList]).then((ob)=>{
          resolve(ob[0]);
        });
			} else {
				$(itemListBox).css({'height': '290px'});
				$(summaryBox).empty().append($('<span><b>0.00</b></span>').css({'margin-right': '4px'}));
				resolve($(mainBox));
			}
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

	const doCreateReportBox = function(report, docTitle, successCallback){
		let temps = report.link.split('/');
		let shareCode = temps[temps.length-1].split('.')[0];
		let reportBoxStyle = {'position': 'relative', 'width': '100%', 'text-align': 'center', 'top': '70px'};
		let reportElemStyle = {'position': 'relative', 'display': 'inline-block', 'cursor': 'pointer', 'margin': '4px', 'padding': '2px', 'border': '1px solid #ddd'};
		let reportBox = $('<div></div>').css(reportBoxStyle);
		if (report.qrLink) {
			let qrReport = $('<img/>').attr('src', report.qrLink).css(reportElemStyle).css({'width': '200px', 'height': 'auto'});
			$(qrReport).on('click', (evt)=>{
				window.open('/shop/share/?id=' + shareCode, '_blank');
			});
			$(reportBox).append($(qrReport));
		}
		temps = temps.splice(0, temps.length-1);
		let link = temps.join('/');
		if (report.pagecount == 1) {
			let pngReportLink = link + '/' + shareCode + '.png';
			let pngReport = $('<img/>').attr('src', pngReportLink).css(reportElemStyle).css({'width': 'auto', 'height': '200px'});
			$(pngReport).on('click', (evt)=>{
				window.open(pngReportLink, '_blank');
				$(pdfBox).toggle();
				$(reportBox).find('img').toggle();
			});
			$(reportBox).append($(pngReport));
		} else {
			for (let x=0; x < report.pagecount; x++) {
				let pngReportLink = link + '/' + shareCode + '-' + x + '.png';
				let pngReport = $('<img/>').attr('src', pngReportLink).css(reportElemStyle).css({'width': 'auto', 'height': '200px'});
				$(pngReport).on('click', (evt)=>{
					window.open(pngReportLink, '_blank');
					$(pdfBox).toggle();
					$(reportBox).find('img').toggle();
				});
				$(reportBox).append($(pngReport));
			}
		}
		let pdfBox = $('<div></div>').css(reportBoxStyle);
		let togglePdfBoxCmd = common.doCreateTextCmd(' แสดงรูป ', 'silver', 'black', 'grey', 'black');
		$(togglePdfBoxCmd).on('click', (evt)=>{
			let hasHiddenPdfBox = ($(pdfBox).css('display') == 'none');
			if (hasHiddenPdfBox) {
				$(pdfBox).slideDown('slow');
				$(reportBox).find('img').slideUp('slow');
			} else {
				$(pdfBox).slideUp('slow');
				$(reportBox).find('img').slideDown('slow');
			}
		}).css({'display': 'inline-block', 'width': '120px'});
		let openNewWindowCmd = common.doCreateTextCmd(' เปิดหน้าต่างใหม่ ', 'silver', 'black', 'grey', 'black');
		let pdfURL = report.link + '?t=' + common.genUniqueID();
		$(openNewWindowCmd).on('click', (evt)=>{
			window.open(pdfURL, '_blank');
		}).css({'display': 'inline-block', 'width': '120px', 'margin-left': '5px'});
		$(pdfBox).append($(togglePdfBoxCmd)).append($(openNewWindowCmd));
		let reportPdf = $('<object data="' + pdfURL + '" type="application/pdf" width="99%" height="380"></object>');
		$(pdfBox).append($(reportPdf));
		$(reportBox).append($(pdfBox).css({'display': 'none'}));

		let toggleReportBoxCmd = common.doCreateTextCmd(' เสร็จ ', 'green', 'white', 'green', 'black');
		$(toggleReportBoxCmd).on('click', (evt)=>{
			let hasHiddenReportBox = ($(mainBox).css('display') == 'none');
			if (hasHiddenReportBox) {
				$(mainBox).slideDown('slow');
				$(pageHandle.mainContent).slideUp('slow');
			} else {
				$(mainBox).slideUp('slow');
				$(pageHandle.mainContent).slideDown('slow');
				if (successCallback) {
					successCallback()
				}
			}
		}).css({'display': 'inline-block', 'width': '120px', 'float': 'right'});
		let docNoes = shareCode.split('-');
		let docTitleBox = $('<span><b>' + docTitle + ' ' + docNoes[docNoes.length-1] + '</b></span>').css({'display': 'inline-block', 'float': 'left', 'margin-left': '50px'});
		let toggleReportBox = $('<div></div>').css({'position': 'relative', 'width': '100%'});
		$(toggleReportBox).append($(docTitleBox)).append($(toggleReportBoxCmd).css({'text-align': 'center'}));
		let mainBox = $('<div></div>').css({'position': 'relative', 'width': '100%', 'top': '18px', 'diaplay': 'none'});
		return $(mainBox).append($(toggleReportBox)).append($(reportBox));
	}

	const doCreateGoodItemProperyForm = function(gooditemData, successCallback) {
		let gooditemForm = gooditem.doCreateNewMenuitemForm(gooditemData);
		let gooitemImage = $('<img/>').attr('src', gooditemData.MenuPicture).css({'width': '100px', 'height': 'auto'}).on('click', (evt)=>{window.open(gooditemData.MenuPicture, '_blank');});
		let gooitemPictureCell = $('<td colspan="2" align="center"></td>').append($(gooitemImage));
		let gooitemPictureRow = $('<tr></tr>').append($(gooitemPictureCell));
		let saveCmd = $('<input type="button" value=" บันทึก " class="action-btn"/>');
		$(saveCmd).on('click', async(evt)=>{
			let editMenuitemFormObj = gooditem.doVerifyMenuitemForm();
			if (editMenuitemFormObj) {
				let hasValue = editMenuitemFormObj.hasOwnProperty('MenuName');
				if (hasValue){
					gooditemData.MenuName = editMenuitemFormObj.MenuName;
					gooditemData.Price = editMenuitemFormObj.Price;
					gooditemData.Unit = editMenuitemFormObj.Unit;
					let params = {data: editMenuitemFormObj, id: gooditemData.id};
					let menuitemRes = await common.doCallApi('/api/shop/menuitem/update', params);
					if (menuitemRes.status.code == 200) {
						$.notify("แก้ไขรายการเมนูสำเร็จ", "success");
						$(cancelCmd).click();
						successCallback(editMenuitemFormObj);
					} else if (menuitemRes.status.code == 201) {
						$.notify("ไม่สามารถแก้ไขรายการเมนูได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
					} else {
						$.notify("เกิดข้อผิดพลาด ไม่สามารถแก้ไขรายการเมนูได้", "error");
					}
				}
			}
		});
		let cancelCmd = $('<input type="button" value=" กลับ "/>').css({'margin-left': '10px'});
		$(cancelCmd).on('click', async(evt)=>{
			$(pageHandle.toggleMenuCmd).click();
			$(pageHandle.menuContent).empty();
		});
		let gooitemCmdCell = $('<td colspan="2" align="center"></td>').append($(saveCmd)).append($(cancelCmd));
		let gooitemCmdRow = $('<tr></tr>').append($(gooitemCmdCell));
		return $(gooditemForm).prepend($(gooitemPictureRow)).append($(gooitemCmdRow));
	}

  return {
    setupPageHandle,
    doOpenOrderForm,
		doCreateReportBox
	}
}
