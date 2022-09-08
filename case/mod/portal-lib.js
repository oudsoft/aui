/* portal-lib.js */
module.exports = function ( jq ) {
	const $ = jq;
  const util = require('./utilmod.js')($);
  const common = require('./commonlib.js')($);

  const maxSizeDef = 100000000;

  const urlQueryToObject = function(url) {
    let result = url.split(/[?&]/).slice(1).map(function(paramPair) {
          return paramPair.split(/=(.+)?/).slice(0, 2);
      }).reduce(function (obj, pairArray) {
          obj[pairArray[0]] = pairArray[1];
          return obj;
      }, {});
    return result;
  }

  const doCreateManualImport = function(caseId){
    let manualBox = $('<div></div>');
    $(manualBox).append($('<div class="accorhead"><b>นำเข้าภาพทางการแพทย์จาก CD/File</b></div>'));
    let manualForm = $('<div class="accorcont" style="padding: 10px; background-color: white;"></div>');
    $(manualBox).append($(manualForm));

    let manualApproachGuideBox = $('<div></div>');
    $(manualApproachGuideBox).appendTo($(manualForm));
    $(manualApproachGuideBox).append('<p style="line-height: 16px;">กระบวนการนำเข้าช่องทางนี้ อนุญาตให้ใช้ไฟล์ DICOM (.dcm) ได้ครั้งล่ะหลายๆ ไฟล์</p>')
    $(manualApproachGuideBox).append('<p style="line-height: 16px;">การนำเข้าผ่านข่องทางนี้มีระยะเวลาในการดำเนินการ ขึ้นอยู่กับขนาดและจำนวนไฟล์ภาพ</p>')
    $(manualApproachGuideBox).append('<p style="line-height: 16px;">ขนาดไฟล์รวมทั้งหมดต่อครั้งที่อัพโหลดต้องไม่เกิน ' + maxSizeDef + ' Bytes.</p>')
    $(manualApproachGuideBox).append('<p style="line-height: 16px;">โปรดเตรียมไฟล์ภาพสำหรับนำเข้าให้พร้อม</p>')
    $(manualApproachGuideBox).append('<p style="line-height: 16px;">ในกรณีต้องการนำภาพเข้าเก็บที่ PACS ของโรงพยาบาล โปรดเลือกอ็อปชั่นนี้ด้วยการเปิดสวิชด้านบนปุ่ม Upload</p>')

    let importOptionBox = $('<div style="position: relative; width: 100%; margin-top: 10px; text-align: right;"></div>');
    $(importOptionBox).appendTo($(manualForm));

    let pacsImportSwitchBox = $('<div id="ReadyState" style="float: right; margin-right: 4px;"></div>');
    let pacsImportOption = {
      onActionCallback : function() {console.log('option on');},
      offActionCallback : function() {console.log('option off');}
    };
    let pacsImportSwitch = $(pacsImportSwitchBox).readystate(pacsImportOption);
    $(pacsImportSwitchBox).appendTo($(importOptionBox));
    $(importOptionBox).append($('<span style="margin-right: 5px;">ให้นำภาพมาเก็บที่ PACS ของโรงพยาบาลด้วย</span>'));

    let openFileCmd = $('<button style="width: 100%">Upload</button>');
    $(openFileCmd).appendTo($(manualForm));

    $(openFileCmd).on('click', (evt)=>{
      let pacsImport = pacsImportSwitch.getState();
      //doOpenSelectFile(evt, pacsImport);
      doOpenSelectMultipleFile(evt, pacsImport);
    });

    return $(manualBox);
  }

  const doCreateCloudImport = function(){
    return new Promise(async function(resolve, reject){
      let cloudBox = $('<div></div>');
      $(cloudBox).append($('<div class="accorhead"><b>นำเข้าภาพทางการแพทย์จาก Cloud</b></div>'));
      let cloudInputForm = $('<div class="accorcont" style="padding: 10px; background-color: white;"></div>');
      $(cloudBox).append($(cloudInputForm));

      let cloudApproachGuideBox = $('<div></div>');
      $(cloudApproachGuideBox).appendTo($(cloudInputForm));
      $(cloudApproachGuideBox).append('<p></p>')

      let cloudApproachFormBox = $('<div style="position: relative; display: table; width: 50%; margin-left: calc(30% - 0px);"></div>');
      $(cloudApproachFormBox).appendTo($(cloudInputForm));

      let citizenIDBox = $('<div style="display: table-row; width: 100%;"></div>');
      $(citizenIDBox).append('<div style="display: table-cell; padding: 5px;"><span>เลขประจำตัวประชาชน</span></div>');
      let citizenIDCell = $('<div style="display: table-cell; padding: 5px;"></div.');
      let citizenID = $('<input type="number"/>');
      $(citizenID).appendTo($(citizenIDCell));
      $(citizenIDCell).appendTo($(citizenIDBox));
      $(citizenIDBox).appendTo($(cloudApproachFormBox));

      let caseIDBox = $('<div style="display: table-row; width: 100%;"></div>');
      $(caseIDBox).append('<div style="display: table-cell; padding: 5px;"><span>รหัสเคส</span></div>');
      let caseIDCell = $('<div style="display: table-cell; padding: 5px;"></div>');
      let caseID = $('<input type="number"/>');
      $(caseID).appendTo($(caseIDCell));
      $(caseIDCell).appendTo($(caseIDBox));
      $(caseIDBox).appendTo($(cloudApproachFormBox));

      let otpBox = $('<div style="display: table-row; width: 100%;"></div>');
      $(otpBox).append('<div style="display: table-cell; padding: 5px;"><span>OTP</span></div>');
      let otpCell = $('<div style="display: table-cell; padding: 5px;"></div>');
      let otp = $('<input type="number"/>');
      $(otp).appendTo($(otpCell));
      $(otpCell).appendTo($(otpBox));
      $(otpBox).appendTo($(cloudApproachFormBox));

      let submitCmd = $('<button style="width: 100%">Submit</button>');
      $(submitCmd).appendTo($(cloudInputForm));

      $(submitCmd).on('click', (evt)=>{

      });

      let cloudApproachHistoryBox = $('<div style="padding: 4px; width: 100%; margin-top: 8px;"></div>');
      $(cloudApproachHistoryBox).appendTo($(cloudInputForm));

      let historyView = await doCreateHistoryView([]);
      $(historyView).appendTo($(cloudApproachHistoryBox));

      let approachControlBar = $('<div style="padding: 4px; width: 100%; margin-top: 8px; text-align: center;"></div>');
      $(approachControlBar).appendTo($(cloudInputForm));

      let openWebViewDicomCmd = $('<input type="button" value=" เปิดภาพ/ผลอ่าน "/>');
      $(openWebViewDicomCmd).appendTo($(approachControlBar));
      $(openWebViewDicomCmd).on('click', (evt)=>{

      });
      $(approachControlBar).append('<span>  </span>');

      let contactImageOwnerCmd = $('<input type="button" value=" ติดต่อผู้ป่วย/โรงพยาบาล เจ้าของภาพ "/>');
      $(contactImageOwnerCmd).appendTo($(approachControlBar));
      $(contactImageOwnerCmd).on('click', (evt)=>{

      });
      $(approachControlBar).append('<span>  </span>');

      let editOTPCmd = $('<input type="button" value=" แก้ไข OTP "/>');
      $(editOTPCmd).appendTo($(approachControlBar));
      $(editOTPCmd).on('click', (evt)=>{

      });
      $(approachControlBar).append('<span>  </span>');

      let importFromCloudCmd = $('<input type="button" value=" Import From Cloud "/>');
      $(importFromCloudCmd).appendTo($(approachControlBar));
      $(importFromCloudCmd).on('click', (evt)=>{

      });

      resolve($(cloudBox));
    });
  }

  const doOpenSelectFile = function(evt, pacsImportOpt){
    let openFileCmd = evt.currentTarget;
    let fileBrowser = $('<input type="file" name="archiveupload" multiple style="display: none;"/>');
    let simpleProgressBar = $('<div style="position: relative; border: 2px solid black; width: 100%; min-height: 20px; background-color: white;"></div>');
    let indicator = $('<div style="position: relative; width: 0px; padding: 0px; background-color: blue; min-height: 18px; text-align: center; color: white;"></div>');
    $(indicator).appendTo($(simpleProgressBar))
    $(fileBrowser).on('change', (evt) =>{
      console.log(evt.currentTarget.files);
      var fileSize = evt.currentTarget.files[0].size;
      var fileType = evt.currentTarget.files[0].type;
      console.log(fileSize);
      console.log(fileType);
      if (fileSize <= maxSizeDef) {
        if ((fileType === 'application/zip')){
          let uploadUrl = '/api/portal/dicomfileupload';
          $(fileBrowser).simpleUpload(uploadUrl, {
            start: function(file){
              $(indicator).css({'width': '0px', 'background-color': 'blue'});
            },
            progress: function(progress){
              let percentageValue = Math.round(progress);
              $(indicator).css({'width': percentageValue + '%'});
              $(indicator).text(percentageValue + '%');
            },
            success: function(data){
              $(fileBrowser).remove();
              $(simpleProgressBar).remove();
              doStartImport(data, pacsImportOpt);
            },
            error: function(error){
              $(indicator).css({'width': '100%', 'background-color': 'red'});
              $(indicator).text('Upload Fail => ' + JSON.stringify(error));
            }
          });
        } else {
          $(indicator).css({'width': '100%', 'background-color': 'red'});
          $(indicator).text('Upload File type not support, Please remind that use zip file only.');
        }
      } else {
        $(indicator).css({'width': '100%', 'background-color': 'red'});
        $(indicator).text('Upload File size Exceed => ' + maxSizeDef + ' bytes.');
      }
    });
    $(openFileCmd).parent().append($(fileBrowser));
    $(openFileCmd).parent().append($(simpleProgressBar));
    $(fileBrowser).click();
  }

  const doOpenSelectMultipleFile = function(evt, pacsImport){
    let openFileCmd = evt.currentTarget;
    let fileBrowser = $('<input type="file" id="files" name="files[]" multiple style="display: none;"/>');
    let simpleProgressBar = $('<div id="SimpleProgressBar" style="position: relative; border: 2px solid black; width: 100%; min-height: 20px; background-color: white;"></div>');
    let indicator = $('<div style="position: relative; width: 0px; padding: 0px; background-color: blue; min-height: 18px; text-align: center; color: white;"></div>');
    $(indicator).appendTo($(simpleProgressBar))
    $(fileBrowser).on('change', (evt) =>{
      var form_data = new FormData();
      var totalfiles = document.getElementById('files').files.length;
      for (var index = 0; index < totalfiles; index++) {
        form_data.append("files[]", document.getElementById('files').files[index]);
      }

      $.ajax({
        url: '/api/portal/dicomfileupload',
        type: 'post',
        data: form_data,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (response) {
          $(fileBrowser).remove();
          $(simpleProgressBar).remove();
          console.log($(fileBrowser));
          doStartImport(response.links, pacsImport);
        }
      });
    });
    $(openFileCmd).parent().append($(fileBrowser));
    $(openFileCmd).parent().append($(simpleProgressBar));
    $(fileBrowser).click();
  }

  const doStartImport = function(data, pacsImportOpt){
    return new Promise(async function(resolve, reject) {
      let userdata = JSON.parse(localStorage.getItem('userdata'));
  		let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let username = userdata.username;
      let importApiUrl = '/api/orthancproxy/importdicom';
      let params = {dicomList: data, username: username, hospitalId: hospitalId, pacsImportOption: pacsImportOpt};
      let importRes = await doCallApi(importApiUrl, params);
      console.log(importRes);
      $.notify('เริ่มกระบวนการเข้าไฟล์ภาพ โปรดรอจนเสร็จสิ้นกระบวนการ', "info");
      $('body').loading('start');
    });
  }

  const onCreateNewDicomTransferLogTrigger = function(evt){
    return new Promise(async function(resolve, reject) {
      //$('body').loading('start');
      let userdata = JSON.parse(localStorage.getItem('userdata'));
      let hospitalId = userdata.hospitalId;
      let userId = userdata.id;
      let username = userdata.username;
      let trigerData = evt.detail.data;

      let getOrthancUrl = '/api/orthancproxy/find';
      let orthancUri = '/studies/' + trigerData.ParentStudy;
      let params = {uri: orthancUri, hospitalId: hospitalId, username: username};
      let getRes = await doGetApi(getOrthancUrl, params);

      let dicomParams = {hospitalId: hospitalId, resourceType: 'study', resourceId: trigerData.ParentStudy, dicom: getRes, username: username};
      let callApiUrl = '/api/dicomtransferlog/add';

      let callRes = await doCallApi(callApiUrl, dicomParams);
      console.log(callRes);
      $.notify('การนำเข้าไฟล์ภาพของคุณดำเนินการเสร็จสมบูรณ์', "success");
      $('body').loading('stop');
    });
  }

  const doCreateHistoryView = function(caseItems) {
    return new Promise(async function(resolve, reject){
      let historyView = $('<div style="display: table; width: 99%; border-collapse: collapse;"></div>');
      let historyHeader = $('<div style="display: table-row; width: 100%;"></div>');
      $(historyHeader).appendTo($(historyView));
      $(historyHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">#</span>'));
      $(historyHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">วันที่</span>'));
      $(historyHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">ส่วนที่สแกน</span>'));
      $(historyHeader).append($('<span style="display: table-cell; text-align: center;" class="header-cell">โรงพยาบาล</span>'));
      const promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < caseItems.length; i++) {

        }
        setTimeout(()=> {
          resolve2($(historyView));
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

  const doShowPortal = async function() {
    let queryObj = urlQueryToObject(window.location.href);
    if (!queryObj.caseId) {
      queryObj.caseId = 1;
    }
    let importManualBox = doCreateManualImport(queryObj.caseId);
    let importCloudBox = await doCreateCloudImport();
    $('.mainfull').empty();
    $('.mainfull').append($(importManualBox));
    $('.mainfull').append($(importCloudBox));

    $('.accorhead').click(function (evt){
      let accorCont = $(this).next('.accorcont');
      if($(accorCont).css('display') != 'block'){
        $('.active').slideUp('fast').removeClass('accoractive');
        $(accorCont).addClass('accoractive').slideDown('slow');
      } else {
        $(accorCont).slideUp('fast').removeClass('accoractive');
      }
    });
  }

  return {
		doShowPortal
	}
}
