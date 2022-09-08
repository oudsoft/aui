module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);

  const doCreateCalendar = function(calendarOptions){
    let calendareBox = $('<div id="CalendarBox"></div>');
    return $(calendareBox).ionCalendar(calendarOptions);
  }

  return {
    doCreateCalendar
	}
}
