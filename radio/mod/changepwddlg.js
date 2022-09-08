/*changepwddlg.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  const doCreateChangePwdDlg = function(){
    let changePwdDlg = $('<div></div>');
    let changePwdWrapper = $('<table width="100%" border="0" cellspacing="0" cellpadding="2"></table>');
    let newPasswordRow = $('<tr></tr>');
    let retryPasswordRow = $('<tr></tr>');
    $(changePwdWrapper).append($(newPasswordRow)).append($(retryPasswordRow));
    let newPasswordLabelCell = $('<td width="40%" align="left">New Password <span style="color: red;">*</span></td>');
    let newPasswordValueCell = $('<td width="*" align="left"></td>');
    $(newPasswordRow).append($(newPasswordLabelCell)).append($(newPasswordValueCell));
    let retryPasswordLabelCell = $('<td align="left">Retry Password <span style="color: red;">*</span></td>');
    let retryPasswordValueCell = $('<td align="left"></td>');
    $(retryPasswordRow).append($(retryPasswordLabelCell)).append($(retryPasswordValueCell));

    let newPasswordValue = $('<input type="password" id="NewPassword" style="width: 190px;"/>');
    let retryPasswordValue = $('<input type="password" id="RetryPassword" style="width: 190px;"/>');
    $(newPasswordValueCell).append($(newPasswordValue));
    $(retryPasswordValueCell).append($(retryPasswordValue));
    $(changePwdDlg).append($(changePwdWrapper));

    const doVerifyNewPassword = function(){
      let newPassword = $(newPasswordValue).val();
      let retryPassword = $(retryPasswordValue).val();
      if (newPassword !== ''){
        $(newPasswordValue).css({'border': ''});
        if (retryPassword !== ''){
          $(retryPasswordValue).css({'border': ''});
          if (newPassword === retryPassword){
            $(newPasswordValue).css({'border': ''});
            $(retryPasswordValue).css({'border': ''});
            return newPassword;
          } else {
            $(newPasswordValue).css({'border': '1px solid red'});
            $(retryPasswordValue).css({'border': '1px solid red'});
            $.notify('New Password กับ Retry Password มีค่าไม่เหมือนกัน', 'error');
            return;
          }
        } else {
          $(retryPasswordValue).css({'border': '1px solid red'});
          $.notify('Retry Password ต้องไม่ว่าง', 'error');
          return;
        }
      } else {
        $(newPasswordValue).css({'border': '1px solid red'});
        $.notify('New Password ต้องไม่ว่าง', 'error');
        return;
      }
    }

    const radconfirmoption = {
      title: 'เปลี่ยน Password',
      msg: $(changePwdDlg),
      width: '440px',
      onOk: function(evt) {
        let newPassword = doVerifyNewPassword();
        if ((newPassword) && (newPassword !== '')) {
          $('body').loading('start');
          changePwdDlgBox.closeAlert();
          let userdata = JSON.parse(localStorage.getItem('userdata'));
          let userId = userdata.id;
          let reqParams = {userId: userId, password: newPassword};
          console.log(reqParams);
          $.post('/api/users/resetpassword', reqParams).then((response) => {
            console.log(response);
            $('body').loading('stop');
            if (response) {
              $.notify('เปลี่ยน Password สำเร็จ', 'success');
            } else {
              $.notify('เปลี่ยน Password ไม่สำเร็จ', 'error');
            }
          });
        }
      },
      onCancel: function(evt){
        changePwdDlgBox.closeAlert();
      }
    }
    let changePwdDlgBox = $('body').radalert(radconfirmoption);
  }

  const doShowChangePwdDlg = function(){

  }

  return {
    doCreateChangePwdDlg
  }
}
