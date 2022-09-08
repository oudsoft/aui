
/* home.js */

/*
exports.LoadSummaryDoctor = function(username){

}
*/

module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('./apiconnect.js')($);

	function doCallSummaryDoctor(username) {
		return new Promise(function(resolve, reject) {
			const get_dr_listApiName = 'get_dr_list'

			const body = { username: username };
			var realUrl = apiconnector.hostURL + '/' + get_dr_listApiName + apiconnector.apiExt;
			var params = {method: 'post', body: body, url: realUrl, apiname: get_dr_listApiName};
			apiconnector.doCallApiByProxy(get_dr_listApiName, params).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			/*
			const body = { username: username };
			var params = JSON.stringify(body);
			apiconnector.doCallApiDirect(get_dr_listApiName, params)=> {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			*/
		});
	}

	function doLoadSummaryDoctor(username) {
		/*
		console.log(username);
		$("#dialog").load('form/dialog.html');
		*/
		doCallSummaryDoctor(username).then((response) => {
			console.log(response);
			let drCounter = JSON.parse(response.res.body);
			let summTable = $('<table width="100%" cellpadding="2" cellspacing="0" border="1" style="font-size: 30px;"></table>');
			let headRow = $('<tr style="background-color: green;"></tr>');
			let headColumns = $('<td width="50%" align="center">ชื่อข้อมูล</td><td width="*" align="center">จำนวน</td>');
			let dataRow = $('<tr></tr>');
			let dataColumns = $('<td width="50%" align="center">หมอ</td><td width="*" align="center">' + drCounter.dr.length + '</td>')
			$(summTable).append($(headRow));
			$(headRow).append($(headColumns));
			$(summTable).append($(dataRow));
			$(dataRow).append($(dataColumns));
			$(".mainfull").append($('<div style="min-height: 20px;"></div>'));
			$(".mainfull").append($(summTable));
		})
	}

	function doCallHospitalData(username) {
		return new Promise(function(resolve, reject) {
			const get_hospital_detailApiName = 'get_hospital_detail'

			const body = { username: username };
			var realUrl = apiconnector.hostURL + '/' + get_hospital_detailApiName + apiconnector.apiExt;
			var params = {method: 'post', body: body, url: realUrl, apiname: get_hospital_detailApiName};
			apiconnector.doCallApiByProxy(get_hospital_detailApiName, params).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			/*
			const body = { username: username };
			var params = JSON.stringify(body);
			apiconnector.doCallApiDirect(get_hospital_detailApiName, params)=> {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			*/
		});
	}

	function doCallUrgentData(username) {
		return new Promise(function(resolve, reject) {
			const get_urgentApiName = 'get_urgent'

			const body = { username: username };
			var realUrl = apiconnector.hostURL + '/' + get_urgentApiName + apiconnector.apiExt;
			var params = {method: 'post', body: body, url: realUrl, apiname: get_urgentApiName};
			apiconnector.doCallApiByProxy(get_urgentApiName, params).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			/*
			const body = { username: username };
			var params = JSON.stringify(body);
			apiconnector.doCallApiDirect(get_urgentApiName, params)=> {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			*/
		});
	}

	return {
		doCallSummaryDoctor,
		doLoadSummaryDoctor,
		doCallHospitalData,
		doCallUrgentData
	}
}
