module.exports = function ( jq ) {
	const $ = jq;

  const doShowMessage = function(userId){
    return new Promise(async function(resolve, reject) {
      const masterNotifyView = $("<div id='MasterNotifyView' style='padding: 6px;'><ul></ul></div>");
      const masterNotifyDiv = $("<div id='MasterNotifyDiv'><ul></ul></div>");
      $(masterNotifyView).append($(masterNotifyDiv))
      let masterNotify = await loadMessage();
      if (masterNotify) {
        let reloadCmd = $("<input type='button' value=' Re-Load ' />");
        $(reloadCmd).on('click',async(evt)=>{
          masterNotify = await loadMessage();
          showMessage(masterNotify, masterNotifyDiv);
        });
        $(reloadCmd).appendTo($(masterNotifyView));

        if (masterNotify.length > 0){
          let clearAllCmd = $("<input type='button' value=' Clear All' style='margin-left: 10px;'/>");
          $(clearAllCmd).on('click',async ()=>{
            let userConfirm = confirm('โปรดยืนยันเพื่อล้างราบการข้อความออกไปทั้งหมด้ โดยคลิกปุ่ม ตกลง หรือ OK');
            if (userConfirm){
              localStorage.removeItem('masternotify');
              masterNotify = await loadMessage();
              showMessage(masterNotify, masterNotifyDiv);
              $.notify('ล้างรายการข้อมูลทั้งหมดสำเร็จ', "success");
            }
          });
          $(clearAllCmd).appendTo($(masterNotifyView));

          let clearPingCmd = $("<input type='button' value=' Clear Ping ' style='margin-left: 10px;'/>");
          $(clearPingCmd).on('click',async(evt)=>{
            let otherNotify = await masterNotify.filter((item, i) => {
              if (item.notify.type !== 'ping'){
                return item;
              }
            });
            masterNotify = otherNotify;
            localStorage.setItem('masternotify', JSON.stringify(masterNotify));
            masterNotify = await loadMessage();
            showMessage(masterNotify, masterNotifyDiv);
          });
          $(clearPingCmd).appendTo($(masterNotifyView));
        }

        showMessage(masterNotify, masterNotifyDiv);
      }
      resolve($(masterNotifyView));
    });
  }

  const loadMessage = function(){
    return new Promise(async function(resolve, reject){
      let masterNotify = JSON.parse(localStorage.getItem('masternotify'));
      if (masterNotify) {
        await masterNotify.sort((a,b) => {
          let av = new Date(a.datetime);
          let bv = new Date(b.datetime);
          if (av && bv) {
            return bv - av;
          } else {
            return 0;
          }
        });
        resolve(masterNotify);
      } else {
        resolve([]);
      }
    });
  }

  const showMessage = function(masterNotify, masterNotifyDiv){
    $(masterNotifyDiv).empty();
    if (masterNotify.length > 0){
      masterNotify.forEach((item, i) => {
        let masterItem = $("<li>" + JSON.stringify(item) + "</li>");
        let openCmd = $("<input type='button' value=' Open ' />");
        $(openCmd).on('click',async (evt)=>{
          item.status = 'Read';
          localStorage.setItem('masternotify', JSON.stringify(masterNotify));
          let newMasterNotify = await loadMessage();
          showMessage(newMasterNotify, masterNotifyDiv);
        })
        $(openCmd).appendTo($(masterItem));

        let removeCmd = $("<input type='button' value=' Remove ' />");
        $(removeCmd).on('click',async(evt)=>{
          masterNotify.splice(i, 1);
          localStorage.setItem('masternotify', JSON.stringify(masterNotify));
          let newMasterNotify = await loadMessage();
          showMessage(newMasterNotify, masterNotifyDiv);
        })
        $(removeCmd).appendTo($(masterItem));
        $(masterItem).appendTo($(masterNotifyDiv));
      });
    }
  }

  return {
    doShowMessage
  }
}
