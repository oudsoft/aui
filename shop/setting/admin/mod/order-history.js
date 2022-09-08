module.exports = function ( jq ) {
	const $ = jq;
  const common = require('../../../home/mod/common-lib.js')($);

  const doExtractList = function(originList, from, to) {
		return new Promise(async function(resolve, reject) {
			let exResults = [];
			let	promiseList = new Promise(function(resolve2, reject2){
				for (let i = (from-1); i < to; i++) {
					if (originList[i]){
						exResults.push(originList[i]);
					}
				}
				setTimeout(()=>{
          resolve2(exResults);
        }, 100);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

  const doCreateOrderHistoryTable = function(workAreaBox, viewPage, startRef, fromDate){
    return new Promise(async function(resolve, reject) {
      $('body').loading('start');
      let titleText = 'ประวัติออร์เดอร์'
      let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
      let userItemPerPage = userDefualtSetting.itemperpage;
      let orderHistoryItems = JSON.parse(localStorage.getItem('customerorders'));

      if (fromDate) {
        let fromDateTime = (new Date(fromDate)).getTime();
        orderHistoryItems = await orderHistoryItems.filter((item, i) => {
          let orderDateTime = (new Date(item.createdAt)).getTime();
          if (orderDateTime >= fromDateTime) {
            return item;
          }
        });
        titleText += ' ตั้งแต่วันที่ ' + fromDate;
      }

      let totalItem = orderHistoryItems.length;

      if (userItemPerPage != 0) {
        if (startRef > 0) {
          orderHistoryItems = await doExtractList(orderHistoryItems, (startRef+1), (startRef+userItemPerPage));
        } else {
          orderHistoryItems = await doExtractList(orderHistoryItems, 1, userItemPerPage);
        }
      }

      let historyTable = $('<table id="HistoryTable" width="100%" cellspacing="0" cellpadding="0" border="1"></table>');

      let titleRow = $('<tr></tr>').css({'background-color': 'gray', 'color': 'white'});
      let titleCol = $('<td colspan="5" align="center"></td>');
      $(titleCol).append($('<h3></h3>').text(titleText).css({'font-weight': 'bold'}));
      $(titleRow).append($(titleCol));
      $(historyTable).append($(titleRow));

      let headerRow = $('<tr></tr>');
      $(headerRow).append($('<td width="4%" align="center"><b>#</b></td>'));
      $(headerRow).append($('<td width="15%" align="center"><b>วันที่</b></td>'));
      $(headerRow).append($('<td width="45%" align="center"><b>รายการสินค้า</b></td>'));
			let billRemarkCol = $('<td width="20%" align="center"><b>บันทึกการปิดบิล</b></td>');
			$(headerRow).append($(billRemarkCol));
      let cmdCol = $('<td width="*" align="center"></td>');
      $(headerRow).append($(cmdCol));
      $(historyTable).append($(headerRow));

      let promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < orderHistoryItems.length; i++) {
          let no = (i + 1 + startRef);
          let orderHistoryItem = orderHistoryItems[i];
          let orderDate = common.doFormatDateStr(new Date(orderHistoryItem.createdAt));
          let dataRow = $('<tr></tr>');
          $(dataRow).append($('<td align="center"></td>').text(no));
          $(dataRow).append($('<td align="left"></td>').text(orderDate));
          let orderItemCol = $('<td align="left"></td>');

          for (let j=0; j < orderHistoryItem.Items.length; j++) {
            let price = Number(orderHistoryItem.Items[j].Price);
            let qty = Number(orderHistoryItem.Items[j].Qty);
            let total = price * qty;
            let orderItemRow = $('<span style="width: 100%; display: table-row;"></span>');
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 30px; text-align: center;"></span>').text((j+1)+'.'));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 180px; text-align: left;"></span>').text(orderHistoryItem.Items[j].MenuName));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 80px; text-align: center;"></span>').text(common.doFormatNumber(price)));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 40px; text-align: center;"></span>').text(common.doFormatQtyNumber(qty)));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 70px; text-align: center;"></span>').text(orderHistoryItem.Items[j].Unit));
            $(orderItemRow).append($('<span style="display: table-cell; min-width: 70px; text-align: right;"></span>').text(common.doFormatNumber(total)));
            $(orderItemCol).append($(orderItemRow));
          }
          $(dataRow).append($(orderItemCol));

					let remarkText = '';
					if (orderHistoryItem.bill) {
						remarkText = orderHistoryItem.bill.Remark;
					} else if (orderHistoryItem.taxinvoice) {
						remarkText = orderHistoryItem.taxinvoice.Remark;
					}
					if ((remarkText) && (remarkText !== '')) {
						let remarkTexts = remarkText.split('\n');
						console.log(remarkTexts);
						let remarkBox = $('<div></div>').css({'text-align': 'left'});
						await remarkTexts.forEach((line, i) => {
							$(remarkBox).append($('<p></p>').text(line).css({'line-height': '14px'}));
						});

						let remarkCell = $('<td align="center"></td>');
						$(remarkCell).append($(remarkBox));
						$(dataRow).append($(remarkCell));
					} else {
						$(dataRow).append($('<td align="center"></td>'));
					}
					$(dataRow).append($('<td align="center"></td>'));
          $(historyTable).append($(dataRow));
        }
        setTimeout(()=> {
	        resolve2(historyTable);
	      },1200);
      });
      Promise.all([promiseList]).then((ob)=> {
        let orderHostoryTable = ob[0];
        $(workAreaBox).append($(orderHostoryTable).css({'margin-top': '20px'}));

        let showPage = 1;
        if ((viewPage) && (viewPage > 0)){
          showPage = viewPage;
        }

        let pageNavigator = doCreatePageNavigatorBox(showPage, userItemPerPage, totalItem, async function(page){
          console.log(page);
          $('body').loading('start');
          $('#HistoryTable').remove();
          $('#NavigBar').remove();
          userDefualtSetting.itemperpage = page.perPage;
          localStorage.setItem('defualsettings', JSON.stringify(userDefualtSetting));

          let toPage = Number(page.toPage);
          let newStartRef = Number(page.fromItem);
          orderHostoryTable = await doCreateOrderHistoryTable(workAreaBox, toPage, newStartRef, fromDate)
          $('body').loading('stop');
        })
        $(workAreaBox).append($(pageNavigator).css({'margin-top': '2px'}));

  			resolve(orderHostoryTable);
        $('body').loading('stop');
  		});
    });
  }

  const doCreatePageNavigatorBox = function(showPage, userItemPerPage, totalItem, callback) {
    let navigBarBox = $('<div id="NavigBar"></div>');
    let navigBarOption = {
      currentPage: showPage,
      itemperPage: userItemPerPage,
      totalItem: totalItem,
      styleClass : {'padding': '4px', 'margin-top': '60px'},
      changeToPageCallback: callback
    };
    let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
    //navigatoePage.toPage(1);
    return $(navigBarBox);
  }

  return {
    doCreateOrderHistoryTable,
    doCreatePageNavigatorBox
  }
}
