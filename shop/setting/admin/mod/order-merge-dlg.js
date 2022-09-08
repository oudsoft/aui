module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

	let dlgHandle = undefined;

	const orderSelectCallback = function(evt, orders, srcIndex, destIndex, mergeSuccessCallback) {
		let	promiseList = new Promise(async function(resolve2, reject2){
			for (let i=0; i < orders[srcIndex].Items.length; i++) {
				srcItemId = orders[srcIndex].Items[i].id;
				let foundIndex = orders[destIndex].Items.findIndex((item)=>{
					return (item.id === srcItemId);
				});
				if (foundIndex >= 0) {
					let srcQty = orders[srcIndex].Items[i].Qty;
					let destQty = orders[destIndex].Items[foundIndex].Qty;
					let newQty = Number(srcQty) + Number(destQty);
					orders[destIndex].Items[foundIndex].Qty = newQty;
				} else {
					orders[destIndex].Items.push(orders[srcIndex].Items[i]);
				}
			}
			setTimeout(()=>{
				resolve2($(orders));
			}, 500);
		});
		Promise.all([promiseList]).then((ob)=>{
			$('body').loading('start');
			mergeSuccessCallback(ob[0], destIndex);
			$('body').loading('stop');
			if (dlgHandle) {
				dlgHandle.closeAlert();
			}
		});
	}

	const doMergeOrder = async function(orders, srcIndex, mergeSuccessCallback) {
		let orderMergerForm = await doCreateMergeSelectOrderForm(orders, srcIndex, orderSelectCallback, mergeSuccessCallback);
		let mergeDlgOption = {
			title: 'เลือกออร์เดอร์ปลายทางที่ต้องการนำไปยุบรวม',
			msg: $(orderMergerForm),
			width: '420px',
			onOk: async function(evt) {
				dlgHandle.closeAlert();
			},
			onCancel: function(evt){
				dlgHandle.closeAlert();
			}
		}
		dlgHandle = $('body').radalert(mergeDlgOption);
		$(dlgHandle.okCmd).hide();
	}

  const doCreateMergeSelectOrderForm = function(orders, srcIndex, selectedCallback, mergeSuccessCallback){
    return new Promise(async function(resolve, reject) {
      let selectOrderForm = $('<div></div>').css({'width': '100%', 'height': '220px', 'overflow': 'scroll', 'padding': '5px'});
      let promiseList = new Promise(async function(resolve2, reject2){
				for (let i=0; i < orders.length; i++) {
          if ((orders[i].Status == 1) && (orders[i].id != orders[srcIndex].id)) {
						let total = await common.doCalOrderTotal(orders[i].Items);
            let ownerOrderFullName = orders[i].userinfo.User_NameTH + ' ' + orders[i].userinfo.User_LastNameTH;
            let orderBox = $('<div></div>').css({'width': '95%', 'position': 'relative', 'cursor': 'pointer', 'padding': '5px', 'background-color': '#dddd', 'border': '4px solid #dddd'});
            $(orderBox).append($('<div><b>ลูกค้า :</b> ' + orders[i].customer.Name + '</div>').css({'width': '100%'}));
            $(orderBox).append($('<div><b>ผู้รับออร์เดอร์ :</b> ' + ownerOrderFullName + '</div>').css({'width': '100%'}));
						$(orderBox).append($('<div><b>ยอดรวม :</b> ' + common.doFormatNumber(total) + '</div>').css({'width': '100%'}));
            $(orderBox).hover(()=>{
              $(orderBox).css({'border': '4px solid grey'});
            },()=>{
              $(orderBox).css({'border': '4px solid #dddd'});
            });
            $(orderBox).on('click', (evt)=>{
              selectedCallback(evt, orders, srcIndex, i, mergeSuccessCallback);
            });
            $(selectOrderForm).append($(orderBox));
          }
        }
        setTimeout(()=> {
          resolve2($(selectOrderForm));
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

  return {
		doMergeOrder,
    doCreateMergeSelectOrderForm
	}
}
