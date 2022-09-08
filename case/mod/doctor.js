/* doctor.js */
module.exports = function ( jq ) {
	const $ = jq;
	const apiconnector = require('./apiconnect.js')($);

	function doShowAllDoctor(drList, username, hosid) {
		let drTable = $('<table width="100%" cellpadding="5" cellspacing="0" border="1"></table>');
		let headRow = $('<tr style="background-color: green;"></tr>');
		let headColumns = $('<td width="5%" align="center">No.</td><td width="20%" align="center">ชื่อ</td><td width="15%" align="center">สถานะ</td><td width="15%" align="center">เบอร์โทร</td><td width="15%" align="center">อีเมล์</td><td width="20%" align="center">โรงพยาบาล</td><td width="*" align="center">รูปภาพ</td>');
		$(drTable).append($(headRow));
		$(headRow).append($(headColumns));
		for (let i=0; i < drList.dr.length; i++) {
			let dataRow = $('<tr></tr>');			
			$(drTable).append($(dataRow));

			//dataColumns = $('<td align="center">' + (i+1) + '</td><td align="center">' + drList.dr[i].name + '</td><td align="center">' + drList.dr[i].status + '</td><td align="center">' + drList.dr[i].mobile + '</td><td align="center">' + drList.dr[i].email + '</td><td align="center">' + drList.hospital_name + '</td><td align="center">' + (drList.dr[i].pic !== '') ? '<img src="' + drList.dr[i].pic + '" width="40" height="auto"/>' : '' + '</td>');
			//dataColumns = $('<td align="center">' + (i+1) + '</td><td align="center"><a href="#" onclick="doShowSchedule(\'' + drList.dr[i].schedule_url + '\')">' + drList.dr[i].name + '</a></td><td align="center">' + drList.dr[i].status + '</td><td align="center">' + drList.dr[i].mobile + '</td><td align="center">' + drList.dr[i].email + '</td><td align="center">' + drList.hospital_name + '</td><td align="center">' + '<img src="' + drList.dr[i].pic + '" width="40" height="auto"/>' + '</td>');
			//<td align="center">' + '<img src="' + drList.dr[i].pic + '" width="40" height="auto"/>' + '</td>'
			let noCol = $('<td align="center">' + (i+1) + '</td>');
			$(dataRow).append($(noCol));

			let nameCol = $('<td align="center"></td>');
			let nameLink = $('<a href="#">' + drList.dr[i].name + '</a>');
			$(nameLink).on('click', function(evt){
				$("#dialog").load('form/schedule-dialog.html', function(){
					$(".modal-header").append($('<h4>' + drList.dr[i].name + '</h4>'));
					let curDate = doGenCurrentDate();
					console.log(curDate);
					let rqBody = {username: username, dr_id: drList.dr[i].id, hos_id: hosid, start_date: curDate};
					doCallDrWorkSchedule(rqBody).then((response) => {
						let resBody = JSON.parse(response.res.body);
						console.log(resBody);
						//let imgPaths = resBody.schedule_pic.split('/');
						//console.log(imgPaths);
						

						//let imgUrl = 'http://' + apiconnector.hostName + '/' + imgPaths[imgPaths.length-1];
						let imgUrl = resBody.schedule_pic;
						console.log(imgUrl);
						//apiconnector.doGetResourceByProxy({url: imgUrl}).then((prxRes) => {
							//console.log(prxRes.body);
							let schImg = $('<img src="' + imgUrl + '" width="600" height="auto"/>');
							$("#ScheduleBox").append($(schImg)).css("text-align", "center").css('padding', '10px');
						//});
					})
					/*
					let schImg = $('<img></img>');
					$(schImg).prop("src", drList.dr[i].schedule_url);
					$("#ScheduleBox").append($(schImg));
					*/
				});
			})
			$(nameCol).append($(nameLink));
			$(dataRow).append($(nameCol));
			let statusCol = $('<td align="center">' + drList.dr[i].status + '</td>');
			$(dataRow).append($(statusCol));
			let mobileCol = $('<td align="center">' + drList.dr[i].mobile + '</td>');
			$(dataRow).append($(mobileCol));
			let emailCol = $('<td align="center">' + drList.dr[i].email + '</td>');
			$(dataRow).append($(emailCol));
			let hospnameCol = $('<td align="center">' + drList.hospital_name + '</td>');
			$(dataRow).append($(hospnameCol));
			let picCol = $('<td align="center"></td>');
			if (drList.dr[i].pic !== '') {
				$(dataRow).append($('<img src="' + drList.dr[i].pic + '" width="30" height="auto"/>'));
			} else {
				$(dataRow).append($('<img src="images/anonymous-icon.jpg" width="30" height="auto"/>'));
			}
			$(dataRow).append($(picCol));

		}		

		$(".main").append($('<div style="min-height: 10px;"></div>'));
		$(".main").append($(drTable));

	}
	
	function doGenCurrentDate() {
		var today = new Date();
		var dd = today.getDate();
		var mm = today.getMonth()+1; 
		var yyyy = today.getFullYear();

		if(dd < 10) {
		   dd = '0' + dd;
		} else {
			dd = '' + dd;
		}

		if(mm < 10) {
		  mm = '0' + mm;
		} else {
			mm = '' + mm;
		}

		today = yyyy + '-' + mm + '-' + dd;	
		return today;
	}

	function doCallDrWorkSchedule(rqBody) {
		return new Promise(function(resolve, reject) {
			const get_dr_work_scheduleApiName = 'get_dr_work_schedule'

			const body = rqBody;		
			var realUrl = apiconnector.hostURL + '/' + get_dr_work_scheduleApiName + apiconnector.apiExt;
			var params = {method: 'post', body: body, url: realUrl, apiname: get_dr_work_scheduleApiName};
			apiconnector.doCallApiByProxy(get_dr_work_scheduleApiName, params).then((response) => {
				resolve(response);			
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			/*
			const body = { username: username };		
			var params = JSON.stringify(body);		
			apiconnector.doCallApiDirect(get_dr_work_scheduleApiName, params)=> {
				resolve(response);			
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			*/
		});
	}

	return {
		doShowAllDoctor
	}
}	