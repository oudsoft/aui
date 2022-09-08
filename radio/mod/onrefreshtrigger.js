/* onrefreshtrigger.js */
module.exports = function ( jq ) {
	const $ = jq;

  const doShowCaseCounter = function(newstatusCases, accstatusCases, newConsult){
		let allNewIntend = newstatusCases.length + newConsult.length;
    if (allNewIntend > 0) {
    	$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').text(allNewIntend);
      $('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
			$('#NewCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }

    if (accstatusCases.length > 0) {
    	$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').text(accstatusCases.length);
      $('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').show();
    } else {
			$('#AcceptedCaseCmd').find('.NavRowTextCell').find('.case-counter').hide();
    }
  }

  return {
    doShowCaseCounter
	}
}
