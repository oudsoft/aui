module.exports = function ( jq ) {
	const $ = jq;

	//const welcome = require('./welcome.js')($);
	//const login = require('./login.js')($);
  const common = require('../../../home/mod/common-lib.js')($);

  const doCreateFormDlg = function(shopData, successCallback) {
    return new Promise(async function(resolve, reject) {
      let customers = JSON.parse(localStorage.getItem('customers'));

      let wrapperBox = $('<div></div>');
      let searchInputBox = $('<div></div>').css({'width': '100%', 'padding': '4px'});
      let customerListBox = $('<div></div>').css({'width': '100%', 'padding': '4px', 'min-height': '200px'});
      let searchKeyInput = $('<input type="text" size="40" value="*"/>');
      let customerResult = undefined;
      $(searchKeyInput).css({'background': 'url(../../images/search-icon.png) no-repeat right center', 'background-size': '6% 100%', 'padding-right': '3px'});
      $(searchKeyInput).on('keyup', async (evt)=>{
        let key = $(searchKeyInput).val();
        if (key !== ''){
          if (key === '*') {
            customerResult = await doShowList(customers, successCallback);
          } else {
            let customerFilter = await doFilterCustomer(customers, key);
            customerResult = await doShowList(customerFilter, successCallback);
          }
          $(customerListBox).empty().append($(customerResult));
        }
      });
      let addCustomerCmd = $('<input type="button" value=" เพิ่มลูกค้า " class="action-btn"/>').css({'margin-left': '10px'});
      $(addCustomerCmd).on('click', (evt)=>{
        //$(wrapperBox).empty();
        $(searchInputBox).hide();
        $(customerListBox).hide();
        let newCustomerForm = doShowAddCustomerForm(shopData, async(newCustomers)=>{
          customers = newCustomers;
          $(newCustomerForm).remove();
          $(searchInputBox).show();
          $(customerListBox).show();
          customerResult = await doShowList(customers, successCallback);
          $(customerListBox).empty().append($(customerResult));
        }, ()=>{
					$(newCustomerForm).remove();
          $(searchInputBox).show();
          $(customerListBox).show();
				});
        $(wrapperBox).append($(newCustomerForm))
      });
      $(searchInputBox).append($(searchKeyInput)).append($(addCustomerCmd));
      customerResult = await doShowList(customers, successCallback);
      $(customerListBox).empty().append($(customerResult));
      $(wrapperBox).append($(searchInputBox)).append($(customerListBox));
      resolve($(wrapperBox));
    });
  }

  const doFilterCustomer = function(customers, key){
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

  const doShowList = function(results, successCallback){
    return new Promise(async function(resolve, reject) {
      let customerTable = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let	promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < results.length; i++){
          let resultRow = $('<tr></tr>').css({'cursor': 'pointer', 'padding': '4px'});
          $(resultRow).hover(()=>{
            $(resultRow).css({'background-color': 'grey', 'color': 'white'});
          },()=>{
            $(resultRow).css({'background-color': '#ddd', 'color': 'black'});
          });
          $(resultRow).on('click', (evt)=>{
            successCallback(results[i]);
          });
          let nameCell = $('<td width="25%" align="left">' + results[i].Name + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});;
          let addressCell = $('<td width="45%" align="left">' + results[i].Address + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});;
          let telCell = $('<td width="*" align="left">' + results[i].Tel + '</td>').css({'padding-top': '10px', 'padding-bottom': '10px'});;
          $(resultRow).append($(nameCell)).append($(addressCell)).append($(telCell));
          $(customerTable).append($(resultRow));
        }
        setTimeout(()=>{
          resolve2($(customerTable));
        }, 100);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

  const doShowAddCustomerForm = function(shopData, successCallback, cancelCallback){
    let form = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
    let formRow = $('<tr></tr>');
    let nameCell = $('<td width="22%" align="left"></td>');
    let addressCell = $('<td width="22%" align="left"></td>');
    let telCell = $('<td width="20%" align="left"></td>');
    let commandCell = $('<td width="*" align="center"></td>');
    let nameInput = $('<input type="text" placeholder="ชื่อ"/>').css({'width': '65px'});
    let addressInput = $('<input type="text" placeholder="ที่อยู่"/>').css({'width': '80px'});
    let telInput = $('<input type="text" placeholder="เบอร์โทร"/>').css({'width': '80px'});
    let saveCmd = $('<input type="button" value="บันทึก" class="action-btn"/>');
    $(saveCmd).on('click', async (evt)=>{
      let nameValue = $(nameInput).val();
      let addressValue = $(addressInput).val();
      let telValue = $(telInput).val();
      if (nameValue !== '') {
        $(nameInput).css({'border': ''});
        let newCustomerData = {Name: nameValue, Address: addressValue, Tel: telValue};
        let params = {data: newCustomerData, shopId: shopData.id};
        let customerRes = await common.doCallApi('/api/shop/customer/add', params);
        if (customerRes.status.code == 200) {
          $.notify("เพิ่มรายการลูกค้าสำเร็จ", "success");
          let customers = JSON.parse(localStorage.getItem('customers'));
          customers.push(newCustomerData);
          localStorage.setItem('customers', JSON.stringify(customers));
          successCallback(customers);
        } else if (customerRes.status.code == 201) {
          $.notify("ไม่สามารถเพิ่มรายการลูกค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
        } else {
          $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการลูกค้าได้", "error");
        }
      } else {
        $(nameInput).css({'border': '1px solid red'});
      }
    });
		let cancelCmd = $('<input type="button" value="ยกเลิก" style="margin-left: 2px;"/>');
    $(cancelCmd).on('click', (evt)=>{
			cancelCallback();
		});
    $(nameCell).append($(nameInput)).append($('<span>*</span>').css({'margin-left': '5px', 'color': 'red'}));
    $(addressCell).append($(addressInput));
    $(telCell).append($(telInput));
    $(commandCell).append($(saveCmd)).append($(cancelCmd));
    $(formRow).append($(nameCell)).append($(addressCell)).append($(telCell)).append($(commandCell));
    return $(form).append($(formRow));
  }

  return {
    doCreateFormDlg
	}
}
