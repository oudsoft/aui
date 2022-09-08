/* urgent.js */

module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('./apiconnect.js')($);

	function doShowUrgentData(urgentList, username) {
		this.username = username;
		let urgentTable = $('<table width="100%" cellpadding="5" cellspacing="0" border="1"></table>');
		let headRow = $('<tr style="background-color: blue;"></tr>');
		let headColumns = $('<td width="30%" align="center"><b>Name</b></td><td width="20%" align="center"><b>ระยะเวลาตอบรับเคส</b></td><td width="20%" align="center"><b>ระยะเวลาอ่านผล</b></td><td width="20%" align="center"><b>แจ้งเตือนครั้ง 2 เมื่อเวลาอ่านผลน้อยกว่า</b></td><td width="*" align="center"><b>&nbsp;</b></td>');
		$(headRow).append($(headColumns));
		$(urgentTable).append($(headRow));
		for (let i=0; i < urgentList.length; i++) {
			let dataRow = $('<tr></tr>');
			$(urgentTable).append($(dataRow));
			let nameCol = $('<td align="center">' + urgentList[i].name + '</td>');
			$(dataRow).append($(nameCol));
			let aliveCol = $('<td align="center">' + urgentList[i].alive + '</td>');
			$(dataRow).append($(aliveCol));
			let readingCol = $('<td align="center">' + urgentList[i].reading + '</td>');
			$(dataRow).append($(readingCol));
			let second_alertCol = $('<td align="center">' + urgentList[i].second_alert + '</td>');
			$(dataRow).append($(second_alertCol));
			let editImg = $('<img src="images/edit-icon.png" width="30" height="auto"/>');
			$(editImg).css('cursor', 'pointer');
			$(editImg).on('click', function(){
				doShowUrgentEdit(urgentList[i], username);
			})
			let editComCol = $('<td align="center"></td>');
			$(editComCol).append($(editImg));
			$(dataRow).append($(editComCol));
		}

		$(".main").append($('<div style="min-height: 10px;"></div>'));
		$(".main").append($(urgentTable));
	}

	function doShowUrgentEdit(urgent, username) {
		console.log(urgent);
		$("#dialog").load('form/urgent-dialog.html', function() {
			$("#Name").val(urgent.name);
			$("#Alive").val(urgent.alive);
			$("#Reading").val(urgent.reading);
			$("#SecondAlert").val(urgent.second_alert);
			$(".modal-footer").css('text-align', 'center');
			$("#SaveUrgent-Cmd").click(function(){
				doSaveUserProfile(urgent.id, username);
			});
		});
	}

	function doVerifyUrgentForm() {
		let name = $("#Name").val();
		let alive = $("#Alive").val();
		let reading = $("#Reading").val();
		let second_alert = $("#SecondAlert").val();
		if (name.trim() === '') {
			$("#Name").css("border", "solid 2px red");
			$("#Name").focus();
			return false;
		} else if (alive.trim() === '') {
			$("#Name").css("border", "");
			$("#Alive").css("border", "solid 2px red");
			$("#Alive").focus();
			return false;
		} else if (reading.trim() === '') {
			$("#Name").css("border", "");
			$("#Alive").css("border", "");
			$("#Reading").css("border", "solid 2px red");
			$("#Reading").focus();
			return false;
		} else if (second_alert.trim() === '') {
			$("#Name").css("border", "");
			$("#Alive").css("border", "");
			$("#Reading").css("border", "");
			$("#SecondAlert").css("border", "solid 2px red");
			$("#SecondAlert").focus();
			return false;
		} else {
			$("#Name").css("border", "");
			$("#Alive").css("border", "");
			$("#Reading").css("border", "");
			$("#SecondAlert").css("border", "");
			let newUrgent = {name, alive, reading, second_alert};
			return newUrgent;
		}
	}

	function doCallUpdateUrgentApi(urgent) {
		return new Promise(function(resolve, reject) {
			const update_urgentApiName = 'update_urgent'

			const body = urgent;
			var realUrl = apiconnector.hostURL + '/' + update_urgentApiName + apiconnector.apiExt;
			var params = {method: 'post', body: body, url: realUrl, apiname: update_urgentApiName};
			apiconnector.doCallApiByProxy(update_urgentApiName, params).then((response) => {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			/*
			const body = { username: user.username, password: user.password };
			var params = JSON.stringify(body);
			apiconnector.doCallApiDirect(update_urgentApiName, params)=> {
				resolve(response);
			}).catch((err) => {
				console.log(JSON.stringify(err));
			})
			*/
		});
	}

	function doSaveUserProfile(id, username) {
		let newUrgent = doVerifyUrgentForm();
		if (!newUrgent) {
			alert('โปรดกรอกข้อมูลในฟอร์มให้สมบูรณ์');
			return;
		} else {
			newUrgent.username = username;
			newUrgent.id = id;
			doCallUpdateUrgentApi(newUrgent).then((response) => {
				let code = response.res.statusCode;
				let resBody = JSON.parse(response.res.body);
				let success = resBody.success;
				if ((code === 200) && (success === true)) {
					$("#UrgentLevel-Cmd").trigger("click");
				}	else {
					alert('ไม่สามารถแก้ไข Urgent Lvel ได้ในขณะนี้\nโปรดลองใหม่อีกครั้งภายหลัง')
				}
				$("#myModal").css("display", "none");
			})
		}
	}

	return {
		doShowUrgentData,
		doShowUrgentEdit,
		doSaveUserProfile
	}
}
