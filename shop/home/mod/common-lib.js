module.exports = function ( jq ) {
	const $ = jq;

  const fileUploadMaxSize = 10000000;

	const shopSensitives = [6];

  const doCallApi = function(apiUrl, rqParams) {
    return new Promise(function(resolve, reject) {
      $('body').loading('start');
      $.post(apiUrl, rqParams, function(data){
        resolve(data);
        $('body').loading('stop');
      }).fail(function(error) {
        reject(error);
        $('body').loading('stop');
      });
    });
  }

  const doGetApi = function(apiUrl, rqParams) {
    return new Promise(function(resolve, reject) {
      $('body').loading('start');
      $.get(apiUrl, rqParams, function(data){
        resolve(data);
        $('body').loading('stop');
      }).fail(function(error) {
        reject(error);
        $('body').loading('stop');
      });
    });
  }

	const doUserLogout = function() {
	  localStorage.removeItem('token');
		localStorage.removeItem('userdata');
		localStorage.removeItem('customers');
		localStorage.removeItem('menugroups');
		localStorage.removeItem('menuitems');
		//localStorage.removeItem('userdata');
	  let url = '/shop/index.html';
	  window.location.replace(url);
	}

	const doFormatNumber = function(num){
    const options = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };
    return Number(num).toLocaleString('en', options);
  }

	function doFormatQtyNumber(num){
	  if ((Number(num) === num) && (num % 1 !== 0)) {
	    return doFormatNumber(num);
	  } else {
	    return Number(num);
	  }
	}

	const doFormatDateStr = function(d) {
		var yy, mm, dd;
		yy = d.getFullYear();
		if (d.getMonth() + 1 < 10) {
			mm = '0' + (d.getMonth() + 1);
		} else {
			mm = '' + (d.getMonth() + 1);
		}
		if (d.getDate() < 10) {
			dd = '0' + d.getDate();
		} else {
			dd = '' + d.getDate();
		}
		var td = `${yy}-${mm}-${dd}`;
		return td;
	}

	const doFormatTimeStr = function(d) {
		var hh, mn, ss;
		hh = d.getHours();
		mn = d.getMinutes();
		ss = d.getSeconds();
		var td = `${hh}:${mn}:${ss}`;
		return td;
	}

	const doCreateImageCmd = function(imageUrl, title) {
    let imgCmd = $('<img src="' + imageUrl + '"/>').css({'width': '35px', 'height': 'auto', 'cursor': 'pointer', 'border': '2px solid #ddd'});
    $(imgCmd).hover(()=>{
			$(imgCmd).css({'border': '2px solid grey'});
		},()=>{
			$(imgCmd).css({'border': '2px solid #ddd'});
		});
		if (title) {
			$(imgCmd).attr('title', title);
		}
    return $(imgCmd)
  }

	const doCreateTextCmd = function(text, bgcolor, textcolor, bordercolor, hovercolor) {
    let textCmd = $('<span></span>').css({/*'min-height': '35px', 'line-height': '30px',*/ 'cursor': 'pointer', 'border-radius': '4px', 'padding': '4px', 'text-align': 'center', 'font-size': '16px'});
		$(textCmd).text(text);
		$(textCmd).css({'background-color': bgcolor, 'color': textcolor});
		if (bordercolor){
			$(textCmd).css({'border': '2px solid ' + bordercolor});
		} else {
			$(textCmd).css({'border': '2px solid #ddd'});
		}
		if ((bordercolor) && (hovercolor)) {
			$(textCmd).hover(()=>{
				$(textCmd).css({'border': '2px solid ' + hovercolor});
			},()=>{
				$(textCmd).css({'border': '2px solid ' + bordercolor});
			});
		} else {
    	$(textCmd).hover(()=>{
				$(textCmd).css({'border': '2px solid grey'});
			},()=>{
				$(textCmd).css({'border': '2px solid #ddd'});
			});
		}
    return $(textCmd)
  }

	const delay = function(ms) {
  	return new Promise(resolve => setTimeout(resolve, ms));
	}

	const calendarOptions = {
		lang:"th",
		years:"2020-2030",
		sundayFirst:false,
	};

	const genUniqueID = function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4();
	}

	const isExistsResource = function(url) {
    if(url){
      var req = new XMLHttpRequest();
      req.open('GET', url, false);
      req.send();
      return req.status==200;
    } else {
      return false;
    }
	}

	const doCreateReportDocButtonCmd = function(text, textCmdCallback, qrCmdCallback) {
		let reportDocButtonBox = $('<div></div>').css({'width': '100%', 'background-color': 'white', 'color': 'black', 'text-align': 'left', 'cursor': 'pointer', 'z-index': '210', 'line-height': '30px'});
		let openReportDocCmd = $('<span>' + text + '</span>').css({'font-weight': 'bold', 'margin-left': '5px'});
		$(openReportDocCmd).on('click', (evt)=>{
			evt.stopPropagation();
			textCmdCallback(evt);
		});
		let openReportQrCmd = $('<img src="/shop/img/usr/myqr.png"/>').css({'position': 'absolute', 'margin-left': '8px', 'margin-top': '2px', 'width': '25px', 'height': 'auto'});
		$(openReportQrCmd).on('click', (evt)=>{
			evt.stopPropagation();
			qrCmdCallback(evt);
		});
		return $(reportDocButtonBox).append($(openReportDocCmd)).append($(openReportQrCmd));
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

	const doResetSensitiveWord = function(words){
    return new Promise(async function(resolve, reject) {
			await words.forEach((word, i) => {
				if ($('#' + word.elementId).hasClass('sensitive-word')) {
					$('#' + word.elementId).text(word.customWord);
				}
			});
			resolve();
    });
  }

  return {
		fileUploadMaxSize,
		shopSensitives,
    doCallApi,
    doGetApi,
		doUserLogout,
		doFormatNumber,
		doFormatQtyNumber,
		doFormatDateStr,
		doFormatTimeStr,
		doCreateImageCmd,
		doCreateTextCmd,
		delay,
		calendarOptions,
		genUniqueID,
		isExistsResource,
		doCreateReportDocButtonCmd,
		doCalOrderTotal,
		doResetSensitiveWord
	}
}
