/* hospital.js */

module.exports = function ( jq ) {
	const $ = jq;

	const apiconnector = require('./apiconnect.js')($);

	function doShowHospitalData(hospData) {

		let hospTable = $('<table width="100%" cellpadding="5" cellspacing="0" border="1"></table>');
		let headRow = $('<tr style="background-color: green;"></tr>');
		let headColumns = $('<td colspan="2" align="left"><h2>ข้อมูลโรงพยาบาล</h2></td>');
		$(headRow).append($(headColumns));
		$(hospTable).append($(headRow));		

		let dataRow1 = $('<tr></tr>');
		$(hospTable).append($(dataRow1));		
		let dataCol1 = $('<td width="35%" align="left"><b>ชื่อ</b></td><td width="*" align="let">' + hospData.name + '</td>');
		$(dataRow1).append($(dataCol1));

		let dataRow2 = $('<tr></tr>');
		$(hospTable).append($(dataRow2));		
		let dataCol2 = $('<td width="35%" align="left"><b>ที่อยู่</b></td><td width="*" align="let">' + hospData.address + '</td>');
		$(dataRow2).append($(dataCol2));

		let dataRow3 = $('<tr></tr>');
		$(hospTable).append($(dataRow3));		
		let dataCol3 = $('<td width="35%" align="left"><b>เบอร์โทร</b></td><td width="*" align="let">' + hospData.tel + '</td>');
		$(dataRow3).append($(dataCol3));

		let dataRow4 = $('<tr></tr>');
		$(hospTable).append($(dataRow4));		
		let dataCol4 = $('<td width="35%" align="left"><b>การติดต่อ</b></td><td width="*" align="let">' + hospData.contact_detail + '</td>');
		$(dataRow4).append($(dataCol4));

		let dataRow5 = $('<tr></tr>');
		$(hospTable).append($(dataRow5));		
		let dataCol5 = $('<td width="35%" align="left"><b>อื่นๆ</b></td><td width="*" align="let">' + hospData.comment + '</td>');
		$(dataRow5).append($(dataCol5));

		$(".main").append($('<div style="min-height: 10px;"></div>'));
		$(".main").append($(hospTable));
	}

	return {
		doShowHospitalData
	}
}	