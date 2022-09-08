/* userprofilelib.js */
module.exports = function ( jq ) {
	const $ = jq;

  const util = require('./utilmod.js')($);
  const apiconnector = require('./apiconnect.js')($);
  const common = require('./commonlib.js')($);

  const showScanpartProfile = function(scanpartAuxs, deleteCallback){
    return new Promise(function(resolve, reject) {
      let scanpartBox = $('<div style="display: table; width: 100%; border-collapse: collapse; padding: 5px;"></div>');
      let headRow = $('<div style="display: table-row; width: 100%; background-color: blue; color: white;"></div>');
      $(headRow).appendTo($(scanpartBox));
      $(headRow).append($('<div style="display: table-cell;">ลำดับที่</div>'));
      $(headRow).append($('<div style="display: table-cell;">Study Description</div>'));
      $(headRow).append($('<div style="display: table-cell;">Protocol Name</div>'));
      $(headRow).append($('<div style="display: table-cell;">Scan Part</div>'));
      $(headRow).append($('<div style="display: table-cell;">คำสั่ง</div>'));
      let promiseList = new Promise(async function(resolve2, reject2){
        for (let i=0; i < scanpartAuxs.length; i++) {
          let item = scanpartAuxs[i];
          let itemRow = $('<div style="display: table-row; width: 100%"></div>');
          $(itemRow).appendTo($(scanpartBox));
          $(itemRow).append($('<div style="display: table-cell; vertical-align: middle;">' + (i+1) + '</div>'));
          $(itemRow).append($('<div style="display: table-cell; vertical-align: middle;">' + item.StudyDesc + '</div>'));
          $(itemRow).append($('<div style="display: table-cell; vertical-align: middle;">' + item.ProtocolName + '</div>'));
          let scanPartCell = $('<div style="display: table-cell; vertical-align: middle;"></div>');
					let scanpartValues = Object.values(item.Scanparts);
					scanpartValues = scanpartValues.slice(0, -1);
          let scanPartBox = await common.doRenderScanpartSelectedBox(scanpartValues);
          $(scanPartBox).appendTo($(scanPartCell));
          $(itemRow).append($(scanPartCell));
          let scanPartCmdCell = $('<div style="display: table-cell; vertical-align: middle;"></div>');
          let deleteCmd = $('<img class="pacs-command" data-toggle="tooltip" src="../images/delete-icon.png" title="ลบรายการนี้"/>');
          $(deleteCmd).appendTo($(scanPartCmdCell));
          $(itemRow).append($(scanPartCmdCell));
          $(deleteCmd).on('click', (evt)=>{
            let yourComfirm = confirm('โปรดยืนยันการลบรายการโดยคลิก ตกลง หรือ OK');
            if (yourComfirm) {
              deleteCallback(item.id);
            }
          });
        }
        setTimeout(()=>{
          resolve2($(scanpartBox));
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
    });
  }

  return {
    showScanpartProfile
  }
}
