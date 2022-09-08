module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

  String.prototype.lpad = function(padString, length) {
      var str = this;
      while (str.length < length)
          str = padString + str;
      return str;
  }

  const doCreateFormDlg = function(shopData, orderTotal, orderObj, invoiceSuccessCallback, billSuccessCallback, taxinvoiceSuccessCallback) {
    return new Promise(async function(resolve, reject) {
			const orderId = orderObj.id;
      let payAmountInput = undefined;
      let createTaxInvoiceCmd = undefined;

      const keyChangeValue = function(evt){
        let discountValue = $(discountInput).val();
        let vatValue = $(vatInput).val();
        let grandTotal = (Number(orderTotal) - Number(discountValue)) + Number(vatValue);
        $(granTotalCell).empty().append($('<span><b>' + common.doFormatNumber(grandTotal) + '</b></span>'));
        if ($(payAmountInput)) {
          $(payAmountInput).val(common.doFormatNumber(grandTotal));
        }
        if ((vatValue == '') || (vatValue == 0)) {
          if ($(createTaxInvoiceCmd)) {
            $(createTaxInvoiceCmd).hide();
          } else {
            $(createTaxInvoiceCmd).show();
          }
        }
      }

      let wrapperBox = $('<div></div>');
      let closeOrderTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let dataRow = $('<tr></tr>').css({'height': '40px'});
      $(dataRow).append($('<td width="40%" align="left"><b>ยอดรวมค่าสินค้า</b></td>'));
      $(dataRow).append($('<td width="*" align="right"><b>' + common.doFormatNumber(orderTotal) + '</b></td>'));
      $(closeOrderTable).append($(dataRow));
      dataRow = $('<tr></tr>').css({'height': '40px'});
      $(dataRow).append($('<td align="left">ส่วนลด</td>'));
      let discountInputCell = $('<td align="right"></td>');
      let discountInput = $('<input type="number" value="0"/>').css({'width': '80px'});
      $(discountInput).on('keyup', keyChangeValue);
      $(discountInputCell).append($(discountInput));
      $(dataRow).append($(discountInputCell));
      $(closeOrderTable).append($(dataRow));

      let vatInput = $('<input type="number" value="0"/>').css({'width': '80px'});
      if (shopData.Shop_VatNo !== '') {
        $(vatInput).on('keyup', keyChangeValue);
        dataRow = $('<tr></tr>').css({'height': '40px'});
        $(dataRow).append($('<td align="left">ภาษีมูลค่าเพิ่ม (7%)</td>'));
        $(vatInput).val(common.doFormatNumber(0.07*orderTotal));
        $(dataRow).append($('<td align="right"></td>').append($(vatInput)));
        $(closeOrderTable).append($(dataRow));
      }
      dataRow = $('<tr></tr>').css({'background-color': '#ddd', 'height': '40px'});
      $(dataRow).append($('<td width="55%" align="left"><b>รวมทั้งสิ้น</b></td>'));
      let discountValue = $(discountInput).val();
      let vatValue = $(vatInput).val();
      let grandTotal = (Number(orderTotal) - Number(discountValue)) + Number(vatValue);
      let granTotalCell = $('<td width="*" align="right"></td>');
      $(granTotalCell).empty().append($('<span><b>' + common.doFormatNumber(grandTotal) + '</b></span>'));
      $(dataRow).append(granTotalCell);
      $(closeOrderTable).append($(dataRow));

      let middleActionCmdRow = $('<tr></tr>').css({'height': '40px'});
      let commandCell = $('<td colspan="2" align="center" id="MiddleActionCmdCell"></td>');
      $(middleActionCmdRow).append($(commandCell));
      $(closeOrderTable).append($(middleActionCmdRow));

			if (orderObj.Status == 1) {
	      let createInvoiceCmd = common.doCreateTextCmd('พิมพ์ใบแจ้งหนี้', '#F5500E', 'white', '#5D6D7E', '#FF5733');
				$(createInvoiceCmd).attr('id', 'CreateInvoiceCmd');
				$(createInvoiceCmd).on('click', async(evt)=>{
					let shopId = shopData.id;
					let nextInvoiceNo = '000000001';
					let filename = shopId.toString().lpad("0", 5) + '-1-' + nextInvoiceNo + '.pdf';
					let discountValue = parseFloat($(discountInput).val());
					let vatValue = parseFloat($(vatInput).val());

					let lastinvoicenoRes = await common.doCallApi('/api/shop/invoice/find/last/invioceno/' + shopId, {});
					console.log(lastinvoicenoRes);
					if (lastinvoicenoRes.Records.length > 0) {
						let lastinvoiceno = lastinvoicenoRes.Records[0].No;
						let nextNo = Number(lastinvoiceno);
						nextNo = nextNo + 1;
						nextInvoiceNo = nextNo.toString().lpad("0", 9);
						filename = shopId.toString().lpad("0", 5) + '-1-' + nextInvoiceNo + '.pdf';
						let invoiceData = {No: nextInvoiceNo, Discount: discountValue, Vat: vatValue, Filename: filename};
						invoiceSuccessCallback(invoiceData);
					} else {
						let invoiceData = {No: nextInvoiceNo, Discount: discountValue, Vat:vatValue, Filename: filename};
						invoiceSuccessCallback(invoiceData);
					}
				});
				$(commandCell).append($(createInvoiceCmd));
			}
			if ((orderObj.Status == 1) || (orderObj.Status == 2)) {
	      let closeOrderCmd = common.doCreateTextCmd('เก็บเงิน', 'green', 'white');
	      $(closeOrderCmd).css({'margin-left': '10px'});
	      $(closeOrderCmd).on('click', async(evt)=>{
	        let paytypeRes = await common.doCallApi('/api/shop/paytype/options', {});
	        $(middleActionCmdRow).remove();
	        let paytypeSelect = $('<select></select>');
	        paytypeRes.Options.forEach((item, i) => {
	          $(paytypeSelect).append($('<option value="' + item.Value + '">' + item.DisplayText + '</option>'));
	        });
	        payAmountInput = $('<input type="number" value="0"/>').css({'width': '120px'});
	        $(payAmountInput).val(grandTotal);
	        dataRow = $('<tr></tr>').css({'height': '40px'});
	        $(dataRow).append($('<td align="left">วิธีชำระ</td>'));
	        $(dataRow).append($('<td align="right"></td>').append($(paytypeSelect)));
	        $(closeOrderTable).append($(dataRow));
	        dataRow = $('<tr></tr>').css({'height': '40px'});
	        $(dataRow).append($('<td align="left">จำนวนที่ชำระ</td>'));
	        $(dataRow).append($('<td align="right"></td>').append($(payAmountInput)));
	        $(closeOrderTable).append($(dataRow));

					let addRemarkCmdRow = $('<tr></tr>').css({'height': '40px'});
	        let addRemarkCmdCell = $('<td align="left"></td>');
	        $(addRemarkCmdRow).append($(addRemarkCmdCell)).append($('<td align="left"></td>'));
	        $(closeOrderTable).append($(addRemarkCmdRow));

					let addRemarkCmd = common.doCreateTextCmd('เพิ่มบันทึกการปิดบิล', 'gray', 'white');
					$(addRemarkCmd).css({'width' : '100%'});
					$(addRemarkCmd).on('click', (evt)=>{
						let hasHiddenRemarkBox = ($(remarkBox).css('display') == 'none');
						if (hasHiddenRemarkBox) {
							$(remarkBox).slideDown('slow');
							$(addRemarkCmd).text('ซ่อนบันทึก');
						} else {
							$(remarkBox).slideUp('slow');
							$(addRemarkCmd).text('เพิ่มบันทึกการปิดบิล');
						}
					});
					$(addRemarkCmdCell).append($(addRemarkCmd));

					let remarkBoxRow = $('<tr></tr>').css({'height': '80px'});
	        let remarkBoxCell = $('<td colspan="2" align="left"></td>');
					let remarkBox = $('<textarea id="Remark" cols="44" rows="5"></textarea>').css({'display': 'none'});
					$(remarkBoxCell).append($(remarkBox));
	        $(remarkBoxRow).append($(remarkBoxCell));
	        $(closeOrderTable).append($(remarkBoxRow));

	        let finalActionCmdRow = $('<tr></tr>').css({'height': '60px', 'vertical-align': 'bottom'});
	        let finalCommandCell = $('<td colspan="2" align="center"></td>');
	        $(finalActionCmdRow).append($(finalCommandCell));
	        $(closeOrderTable).append($(finalActionCmdRow));

	        let createBillCmd = common.doCreateTextCmd('พิมพ์ใบเสร็จ', 'green', 'white');
	        $(finalCommandCell).append($(createBillCmd));

	        $(createBillCmd).on('click', async(evt)=>{
	          let shopId = shopData.id;
	          let nextBillNo = '000000001';
						let filename = shopId.toString().lpad("0", 5) + '-2-' + nextBillNo + '.pdf';
						let discountValue = parseFloat($(discountInput).val());
						let vatValue = parseFloat($(vatInput).val());

						let payAmountValue = parseFloat($(payAmountInput).val());
						let payType = parseInt($(paytypeSelect).val());
						let paymentData = {Amount: payAmountValue, PayType: payType};
						let hasHiddenRemarkBox = ($(remarkBox).css('display') == 'none');
	          let lastbillnoRes = await common.doCallApi('/api/shop/bill/find/last/billno/' + shopId, {});
						console.log(lastbillnoRes);
	          if (lastbillnoRes.Records.length > 0) {
	            let lastbillno = lastbillnoRes.Records[0].No;
	            let nextNo = Number(lastbillno);
	            nextNo = nextNo + 1;
	            nextBillNo = nextNo.toString().lpad("0", 9);
	            filename = shopId.toString().lpad("0", 5) + '-2-' + nextBillNo + '.pdf';
	            let billData = {No: nextBillNo, Discount: discountValue, Vat:vatValue, Filename: filename};
							if (!hasHiddenRemarkBox) {
								billData.Remark = $(remarkBox).val();
							}
							billSuccessCallback(billData, paymentData);
	          } else {
							let billData = {No: nextBillNo, Discount: discountValue, Vat:vatValue, Filename: filename};
							if (!hasHiddenRemarkBox) {
								billData.Remark = $(remarkBox).val();
							}
							billSuccessCallback(billData, paymentData);
						}
	        });

	        if (shopData.Shop_VatNo !== '') {
	          createTaxInvoiceCmd = common.doCreateTextCmd('พิมพ์กำกับภาษี', 'green', 'white');
	          $(createTaxInvoiceCmd).css({'margin-left': '10px'});
	          $(finalCommandCell).append($(createTaxInvoiceCmd));
	          $(createTaxInvoiceCmd).on('click', async (evt)=>{
							let shopId = shopData.id;
		          let nextTaxInvoiceNo = '000000001';
							let filename = shopId.toString().lpad("0", 5) + '-3-' + nextTaxInvoiceNo + '.pdf';
							let discountValue = parseFloat($(discountInput).val());
							let vatValue = parseFloat($(vatInput).val());

							let payAmountValue = parseFloat($(payAmountInput).val());
							let payType = parseInt($(paytypeSelect).val());
							let paymentData = {Amount: payAmountValue, PayType: payType};
							let hasHiddenRemarkBox = ($(remarkBox).css('display') == 'none');
		          let lasttaxinvoicenoRes = await common.doCallApi('/api/shop/taxinvoice/find/last/taxinvioceno/' + shopId, {});
							console.log(lasttaxinvoicenoRes);
		          if (lasttaxinvoicenoRes.Records.length > 0) {
		            let lasttaxinvoiceno = lasttaxinvoicenoRes.Records[0].No;
		            let nextNo = Number(lasttaxinvoiceno);
		            nextNo = nextNo + 1;
		            nextTaxInvoiceNo = nextNo.toString().lpad("0", 9);
		            filename = shopId.toString().lpad("0", 5) + '-3-' + nextTaxInvoiceNo + '.pdf';
		            let taxinvoicenoData = {No: nextTaxInvoiceNo, Discount: discountValue, Vat: vatValue, Filename: filename};
								if (!hasHiddenRemarkBox) {
									taxinvoicenoData.Remark = $(remarkBox).val();
								}
								taxinvoiceSuccessCallback(taxinvoicenoData, paymentData);
		          } else {
								let taxinvoicenoData = {No: nextTaxInvoiceNo, Discount: discountValue, Vat: vatValue, Filename: filename};
								if (!hasHiddenRemarkBox) {
									taxinvoicenoData.Remark = $(remarkBox).val();
								}
								taxinvoiceSuccessCallback(taxinvoicenoData, paymentData);
							}
	          });
	        }
	      });
				$(commandCell).append($(closeOrderCmd));
			}

      $(wrapperBox).append($(closeOrderTable))
      resolve($(wrapperBox));
    });
  }

	const doOpenReportPdfDlg = function(pdfUrl, title, closeCallback){
    return new Promise(async function(resolve, reject) {
			const pdfURL = pdfUrl + '?t=' + common.genUniqueID();
      const reportPdfDlgContent = $('<object data="' + pdfURL + '" type="application/pdf" width="99%" height="380"></object>');
      $(reportPdfDlgContent).css({'margin-top': '10px'});
      const reportformoption = {
  			title: title,
  			msg: $(reportPdfDlgContent),
  			width: '720px',
				okLabel: ' เปิดหน้าต่างใหม่ ',
				cancelLabel: ' ปิด ',
  			onOk: async function(evt) {
					window.open(pdfUrl, '_blank');
          reportPdfDlgHandle.closeAlert();
					if (closeCallback) {
						closeCallback();
					}
  			},
  			onCancel: function(evt){
  				reportPdfDlgHandle.closeAlert();
					if (closeCallback) {
						closeCallback();
					}
  			}
  		}
  		let reportPdfDlgHandle = $('body').radalert(reportformoption);
      resolve(reportPdfDlgHandle)
    });
  }

	const doShowBillRemarkBox = function(evt) {
		let masterCmd = $(evt.currentTarget);
		let masterCell = $(masterCmd).parent();
		$(masterCmd).hide();

		let remarkBox = $('<div></div>').css({'display': 'block', 'height': '100px', 'border': '1px solid red'});
		let hiddenBoxCmd = common.doCreateTextCmd('ซ่อน', 'gray', 'white');
		$(hiddenBoxCmd).on('click', (evt)=>{
			$(remarkBox).slideUp('fast')/*.css({'display': 'none'})*/;
			$(remarkBox).remove();
			$(masterCmd).show();
		});

		$(remarkBox).append($(hiddenBoxCmd));
		$(masterCell).append($(remarkBox));
		$(remarkBox)/*.css({'display': 'block'})*/.slideDown('slow');
	}

  return {
    doCreateFormDlg,
		doOpenReportPdfDlg
	}
}
