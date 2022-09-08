
window.$ = window.jQuery = require('jquery');

window.$.ajaxSetup({
  beforeSend: function(xhr) {
    xhr.setRequestHeader('Authorization', localStorage.getItem('token'));
  }
});

const common = require('../home/mod/common-lib.js')($);

const inputTextStyle = {'padding':'8px','display':'block','border':'none','border-bottom':'1px solid #ccc','width':'95%'};

$( document ).ready(function() {
  const initPage = function() {
    let jqueryUiCssUrl = "../lib/jquery-ui.min.css";
  	let jqueryUiJsUrl = "../lib/jquery-ui.min.js";
  	let jqueryLoadingUrl = '../lib/jquery.loading.min.js';
  	let jqueryNotifyUrl = '../lib/notify.min.js';

    $('head').append('<script src="' + jqueryUiJsUrl + '"></script>');
  	$('head').append('<link rel="stylesheet" href="' + jqueryUiCssUrl + '" type="text/css" />');
  	//https://carlosbonetti.github.io/jquery-loading/
  	$('head').append('<script src="' + jqueryLoadingUrl + '"></script>');
  	//https://notifyjs.jpillora.com/
  	$('head').append('<script src="' + jqueryNotifyUrl + '"></script>');
    $('head').append('<link rel="stylesheet" href="../stylesheets/style.css" type="text/css" />');

    $('body').append($('<div id="App"></div>'));
    $('body').append($('<div id="overlay"><div class="loader"></div></div>'));

    $('body').loading({overlay: $("#overlay"), stoppable: true});

    doShowRegisterForm();

    $('body').loading('stop');
  };

	initPage();
});

const doShowRegisterForm = function(){
  $('#App').css({'display': 'block', 'margin-left': 'auto', 'margin-right': 'auto', 'width': '50%'})
  let userInfoForm = doCreateUserInfoForm((newuserInfo)=>{
    let shopInfoForm = doCreateShopInfoForm((newShopInfo)=>{
      let userAccountForm = doCreateUserAccountForm(async (newUserAccount)=>{
        /*
        console.log(newuserInfo);
        console.log(newShopInfo);
        console.log(newUserAccount);
        */
        let newShopData = {Shop_Name: newShopInfo.Name, Shop_Address: newShopInfo.Address, Shop_Tel: newuserInfo.Phone, Shop_Mail: newuserInfo.Email, Shop_LogoFilename: '', Shop_VatNo: '', Shop_PromptPayNo: '', Shop_BillQuota: 500};
        let newShopRes = await common.doCallApi('/api/shop/shop/add', newShopData);
        console.log(newShopRes);
        if (newShopRes.status.code == 200) {
          $.notify("เพิ่มรายการร้านค้าสำเร็จ", "success");
          let shopId = newShopRes.Records[0].id;
          let newUserData = {User_NameEN: '', User_LastNameEN: '', User_NameTH: newuserInfo.Name, User_LastNameTH: newuserInfo.LastNane, User_Phone: newuserInfo.Phone, User_Email: newuserInfo.Email, User_LineID: ''};
          newUserData.username = newUserAccount.Username;
          newUserData.password = newUserAccount.Password;
          newUserData.shopId = shopId;
          newUserData.usertypeId = 2;
          let newUserRes = await common.doCallApi('/api/shop/user/add', newUserData);
          if (newUserRes.status.code == 200) {
            $.notify("เพิ่มรายการผู้ใช้งานสำเร็จ", "success");
            let user = {username: newUserAccount.Username, password: newUserAccount.Password};
            let loginRes = await common.doCallApi('/api/shop/login/', user);
            if (loginRes.success == true) {
              localStorage.setItem('token', loginRes.token);
    					localStorage.setItem('userdata', JSON.stringify(loginRes.data));
              window.location.replace('/shop/setting/admin.html');
            } else {
              $.notify("เกิดข้อผิดพลาด ล็อกอินเข้าใช้งานระบบไม่ได้ในขณะนี้", "error");
              window.location.replace('/shop/index.html');
            }
          } else if (newUserRes.status.code == 201) {
            $.notify("ไม่สามารถเพิ่มรายการผู้ใช้งานได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
          } else {
            $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการผู้ใช้งานได้", "error");
          }
        } else if (newShopRes.status.code == 201) {
          $.notify("ไม่สามารถเพิ่มรายการร้านค้าได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
        } else {
          $.notify("เกิดข้อผิดพลาด ไม่สามารถเพิ่มรายการร้านค้าได้", "error");
        }
      });
      $('#App').empty().append($(userAccountForm));
    });
    $('#App').empty().append($(shopInfoForm));
  });
  $('#App').empty().append($(userInfoForm));
}

const doCreateUserInfoForm = function(successCallback){
  let userInfoFormBox = $('<div></div>');
  let titleForm = $('<div><h2 style="margin-left: 5px;">ข้อมูลผู้ขอเปิดร้านค้า</h2></div>').css({'width': '100%', 'background-color': 'grey', 'color': 'white'});
  let userInfoNameLabel = $('<label>ชื่อ <span style="color: red;">*</span></label>');
  let userInfoNameInput = $('<input type="text"/>').css(inputTextStyle);
  let userInfoNameFrag = $('<p></p>').append($(userInfoNameLabel)).append($(userInfoNameInput));
  let userInfoLastNameLabel = $('<label>นามสกุล <span style="color: red;">*</span></label>');
  let userInfoLastNameInput = $('<input type="text"/>').css(inputTextStyle);
  let userInfoLastNameFrag = $('<p></p>').append($(userInfoLastNameLabel)).append($(userInfoLastNameInput));
  let userInfoEmailLabel = $('<label>อีเมล์ <span style="color: red;">*</span></label>');
  let userInfoEmailInput = $('<input type="text"/>').css(inputTextStyle);
  let userInfoEmailFrag = $('<p></p>').append($(userInfoEmailLabel)).append($(userInfoEmailInput));
  let userInfoPhoneLabel = $('<label>โทรศัพท์ <span style="color: red;">*</span></label>');
  let userInfoPhoneInput = $('<input type="text"/>').css(inputTextStyle);
  let userInfoPhoneFrag = $('<p></p>').append($(userInfoPhoneLabel)).append($(userInfoPhoneInput));
  let footerForm = $('<div></div>').css({'width': '100%', 'background-color': 'grey', 'color': 'white', 'height': '44px', 'text-align': 'center'});
  let nextStepCmd = $('<div>   ถัดไป   </div>').css({'width': 'fit-content', 'display': 'inline-block', 'background-color': 'white', 'color': 'black', 'padding': '4px', 'cursor': 'pointer', 'font-size': '20px', 'margin-top': '3px'});
  $(footerForm).append($(nextStepCmd));
  $(nextStepCmd).on('click', (evt)=>{
    let userInfoName = $(userInfoNameInput).val();
    let userInfoLastName = $(userInfoLastNameInput).val();
    let userInfoEmail = $(userInfoEmailInput).val();
    let userInfoPhone = $(userInfoPhoneInput).val();
    if (userInfoName != '') {
      $(userInfoNameInput).css({'border': ''});
      if (userInfoLastName != '') {
        $(userInfoLastNameInput).css({'border': ''});
        if (userInfoEmail != '') {
          $(userInfoEmailInput).css({'border': ''});
          if (userInfoPhone != '') {
            $(userInfoPhoneInput).css({'border': ''});
            let newuserInfo = {Name: userInfoName, LastName: userInfoLastName, Email: userInfoEmail, Phone: userInfoPhone};
            successCallback(newuserInfo);
          } else {
            $.notify("เบอร์โทร ของคุณคือ", "error");
            $(userInfoPhoneInput).css({'border': '1px solid red'});
          }
        } else {
          $.notify("อีเมล์ ของคุณคือ", "error");
          $(userInfoEmailInput).css({'border': '1px solid red'});
        }
      } else {
        $.notify("นามสกุล ของคุณคืออะไร", "error");
        $(userInfoLastNameInput).css({'border': '1px solid red'});
      }
    } else {
      $.notify("คุณขื่ออะไร ช่วยบอกให้เราทราบหน่อย", "error");
      $(userInfoNameInput).css({'border': '1px solid red'});
    }
  });
  $(userInfoFormBox).append($(titleForm)).append($(userInfoNameFrag)).append($(userInfoLastNameFrag));
  return $(userInfoFormBox).append($(userInfoEmailFrag)).append($(userInfoPhoneFrag)).append($(footerForm));
}

const doCreateShopInfoForm = function(successCallback){
  let shopInfoFormBox = $('<div></div>');
  let titleForm = $('<div><h2 style="margin-left: 5px;">ข้อมูลร้านค้า</h2></div>').css({'width': '100%', 'background-color': 'grey', 'color': 'white'});
  let shopInfoShopNameLabel = $('<label>ชื่อร้าน <span style="color: red;">*</span></label>');
  let shopInfoShopNameInput = $('<input type="text"/>').css(inputTextStyle);
  let shopInfoShopNameFrag = $('<p></p>').append($(shopInfoShopNameLabel)).append($(shopInfoShopNameInput));
  let shopInfoShopAddressLabel = $('<label>ที่อยู่ <span style="color: red;">*</span></label>');
  let shopInfoShopAddressInput = $('<input type="text"/>').css(inputTextStyle);
  let shopInfoShopAddressFrag = $('<p></p>').append($(shopInfoShopAddressLabel)).append($(shopInfoShopAddressInput));
  let footerForm = $('<div></div>').css({'width': '100%', 'background-color': 'grey', 'color': 'white', 'height': '44px', 'text-align': 'center'});
  let nextStepCmd = $('<div>   ถัดไป   </div>').css({'width': 'fit-content', 'display': 'inline-block', 'background-color': 'white', 'color': 'black', 'padding': '4px', 'cursor': 'pointer', 'font-size': '20px', 'margin-top': '3px'});
  $(footerForm).append($(nextStepCmd));
  $(nextStepCmd).on('click', (evt)=>{
    let shopName = $(shopInfoShopNameInput).val();
    let shopAddress = $(shopInfoShopAddressInput).val();
    if (shopName != '') {
      $(shopInfoShopNameInput).css({'border': ''});
      if (shopAddress != '') {
        $(shopInfoShopAddressInput).css({'border': ''});
        let newShopInfo = {Name: shopName, Address: shopAddress};
        successCallback(newShopInfo);
      } else {
        $.notify("ที่อยู่ร้านค้าของคุณอยู่ที่ไหน", "error");
        $(shopInfoShopAddressInput).css({'border': '1px solid red'});
      }
    } else {
      $.notify("ขื่อร้านค้าของคุณชื่ออะไร", "error");
      $(shopInfoShopNameInput).css({'border': '1px solid red'});
    }
  });
  return $(shopInfoFormBox).append($(titleForm)).append($(shopInfoShopNameFrag)).append($(shopInfoShopAddressFrag)).append($(footerForm));
}

const doCreateUserAccountForm = function(successCallback){
  let userAccountFormBox = $('<div></div>');
  let titleForm = $('<div><h2 style="margin-left: 5px;">ตั้งบัญชีใช้งานผู้ดูแลระบบร้าน</h2></div>').css({'width': '100%', 'background-color': 'grey', 'color': 'white'});
  let userAccountUsernameLabel = $('<label>Username  <span style="color: red;">*</span></label>');
  let userAccountUsernameInput = $('<input type="text"/>').css(inputTextStyle);
  let userAccountUsernameFrag = $('<p></p>').append($(userAccountUsernameLabel)).append($(userAccountUsernameInput));
  let userAccountPasswordLabel = $('<label>Password  <span style="color: red;">*</span></label>');
  let userAccountPasswordInput = $('<input type="password"/>').css(inputTextStyle);
  let userAccountPasswordFrag = $('<p></p>').append($(userAccountPasswordLabel)).append($(userAccountPasswordInput));
  let userAccountRetryPasswordLabel = $('<label>Retry Password  <span style="color: red;">*</span></label>');
  let userAccountRetryPasswordInput = $('<input type="password"/>').css(inputTextStyle);
  let userAccountRetryPasswordFrag = $('<p></p>').append($(userAccountRetryPasswordLabel)).append($(userAccountRetryPasswordInput));
  let footerForm = $('<div></div>').css({'width': '100%', 'background-color': 'grey', 'color': 'white', 'height': '44px', 'text-align': 'center'});
  let successCmd = $('<div>   เสร็จสิ้น   </div>').css({'width': 'fit-content', 'display': 'inline-block', 'background-color': 'white', 'color': 'black', 'padding': '4px', 'cursor': 'pointer', 'font-size': '20px', 'margin-top': '3px'});
  $(footerForm).append($(successCmd));
  $(successCmd).on('click', async (evt)=>{
    let username = $(userAccountUsernameInput).val();
    let password = $(userAccountPasswordInput).val();
    let retryRassword = $(userAccountRetryPasswordInput).val();
    if (username != '') {
      $(userAccountUsernameInput).css({'border': ''});
      if (password != '') {
        $(userAccountPasswordInput).css({'border': ''});
        if (retryRassword != '') {
          $(userAccountRetryPasswordInput).css({'border': ''});
          if (password == retryRassword) {
            $(userAccountPasswordInput).css({'border': ''});
            $(userAccountRetryPasswordInput).css({'border': ''});
            let newUserFormObj = {username: username, password: password};
            let verifyRes = await common.doCallApi('/api/shop/user/verifyusername/' + username, newUserFormObj);
            if((verifyRes.status.code === 200) && (!verifyRes.result.result)) {
              $(userAccountUsernameInput).css({'border': ''});
              let newUserAccount = {Username: username, Password: password};
              successCallback(newUserAccount);
            } else {
              $.notify("Username " + username + " มีอยู่แล้ว โปรดเปลี่ยน Username ใหม่", "error");
              $(userAccountUsernameInput).css({'border': '1px solid red'});
            }
          } else {
            $.notify("รหัสผ่านไม่ตรงกัน", "error");
            $(userAccountPasswordInput).css({'border': '1px solid red'});
            $(userAccountRetryPasswordInput).css({'border': '1px solid red'});
          }
        } else {
          $.notify("พิมพ์รหัสผ่านซ้ำอีกครั้ง", "error");
          $(userAccountRetryPasswordInput).css({'border': '1px solid red'});
        }
      } else {
        $.notify("รหัสผ่านต้องไม่ว่าง", "error");
        $(userAccountPasswordInput).css({'border': '1px solid red'});
      }
    } else {
      $.notify("ช่วยตั้ง Username ของคุณ", "error");
      $(userAccountUsernameInput).css({'border': '1px solid red'});
    }
  });
  return $(userAccountFormBox).append($(titleForm)).append($(userAccountUsernameFrag)).append($(userAccountPasswordFrag)).append($(userAccountRetryPasswordFrag)).append($(footerForm));
}

module.exports = {
  doShowRegisterForm
}
