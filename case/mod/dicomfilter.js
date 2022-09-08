/* dicomfilter.js */
module.exports = function ( jq ) {
	const $ = jq;
  const util = require('./utilmod.js')($);

  const doCreateFilter = function(filterObject) {
    let query = filterObject.Query;
    let queryTags = Object.getOwnPropertyNames(query);

    let modality, queryTag, tagValue, studydate;

		if (query.Modality === '*') {
			modality = 'ALL';
		} else {
			modality = query.Modality;
		}

    if (queryTags.length >= 2) {
			if (queryTags[1] !== 'StudyDate') {
		    queryTag = queryTags[1];
		    tagValue = query[queryTag];
				if (query.StudyDate) {
					studydate = query.StudyDate;
				}
			} else {
				queryTag = 'ALL';
	      tagValue = '*';
				studydate = query.StudyDate;
			}
    } else {
			queryTag = 'ALL';
      tagValue = '*';
    }

		let studydateName = 'ALL';
		if (studydate) {
			if (studydate === (util.getToday() + '-')) {
				studydateName = 'TODAY';
			} else if (studydate === (util.getYesterday() + '-')) {
				studydateName = 'YESTERDAY';
			} else if (studydate === (util.getDateLastWeek() + '-')) {
				studydateName = 'WEEK';
			} else if (studydate === (util.getDateLastMonth() + '-')) {
				studydateName = 'MONTH';
			} else if (studydate === (util.getDateLast3Month() + '-')) {
				studydateName = '3MONTH';
			} else if (studydate === (util.getDateLastYear() + '-')) {
				studydateName = 'YEAR';
			}
		}

		let limit = filterObject.Limit;

  	let table = $('<div style="display: table; width: 100%;"></div>');

    let tableRow = $('<div style="display: table-row; padding: 2px; background-color: gray;"></div>');
    let labelCell = $('<div style="display: table-cell; width: 200px; padding: 2px;"><b>Dicom Tag</b></div>');
    let tagSelectorCell = $('<div style="display: table-cell; padding: 2px;"></div>');
    let tagSelector = $('<select id="DicomTag"></select>');
    $(tagSelector).append($('<option value="ALL">ALL</option>'));
    $(tagSelector).append($('<option value="PatientID">Patient ID</option>'));
    $(tagSelector).append($('<option value="PatientName">Patient Name</option>'));
    $(tagSelector).append($('<option value="PatientSax">Patient Sex</option>'));
    $(tagSelector).append($('<option value="AccessionNumber">Accession Number</option>'));
    $(tagSelector).append($('<option value="StudyDescription">Study Description</option>'));
		if (queryTag) {
			$(tagSelector).val(queryTag);
		}
    $(tagSelector).appendTo($(tagSelectorCell));
    $(labelCell).appendTo($(tableRow));
    $(tagSelectorCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    tableRow = $('<div style="display: table-row; padding: 2px; background-color: gray;"></div>');
    labelCell = $('<div style="display: table-cell; width: 200px; padding: 2px;"><b>Tag Value</b></div>');
    let tagValueCell = $('<div style="display: table-cell; padding: 2px;"></div>');
    let tagValueInput = $('<input type="text" id="TagValue"/>');
    $(tagValueInput).val(tagValue);
    $(tagValueInput).appendTo($(tagValueCell));
    $(labelCell).appendTo($(tableRow));
    $(tagValueCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    tableRow = $('<div style="display: table-row; padding: 2px; background-color: gray;"></div>');
    labelCell = $('<div style="display: table-cell; width: 200px; padding: 2px;"><b>Modality</b></div>');
    let modalitySelectorCell = $('<div style="display: table-cell; padding: 2px;"></div>');
    let modalitySelector = $('<select id="Modality"></select>');
    $(modalitySelector).append($('<option value="ALL">ALL</option>'));
    $(modalitySelector).append($('<option value="CT">CT</option>'));
    $(modalitySelector).append($('<option value="CR">CR</option>'));
    $(modalitySelector).append($('<option value="MR">MR</option>'));
    $(modalitySelector).append($('<option value="XA">XA</option>'));
    $(modalitySelector).append($('<option value="DR">DR</option>'));
		$(modalitySelector).val(modality);
    $(modalitySelector).appendTo($(modalitySelectorCell));
    $(labelCell).appendTo($(tableRow));
    $(modalitySelectorCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    tableRow = $('<div style="display: table-row; padding: 2px; background-color: gray;"></div>');
    labelCell = $('<div style="display: table-cell; width: 200px; padding: 2px;"><b>Study Date</b></div>');
    let studydateSelectorCell = $('<div style="display: table-cell; padding: 2px;"></div>');
    let studydateSelector = $('<select id="StudyDate"></select>');
    $(studydateSelector).append($('<option value="ALL">ALL</option>'));
    $(studydateSelector).append($('<option value="TODAY">Today</option>'));
    $(studydateSelector).append($('<option value="YESTERDAY">Yesterday</option>'));
    $(studydateSelector).append($('<option value="WEEK">Last 7 days</option>'));
    $(studydateSelector).append($('<option value="MONTH">Last 31 days</option>'));
    $(studydateSelector).append($('<option value="3MONTH">Last 3 months</option>'));
    $(studydateSelector).append($('<option value="YEAR">Last year</option>'));
		$(studydateSelector).val(studydateName)
    $(studydateSelector).appendTo($(studydateSelectorCell));
    $(labelCell).appendTo($(tableRow));
    $(studydateSelectorCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    tableRow = $('<div style="display: table-row; padding: 2px; background-color: gray;"></div>');
    labelCell = $('<div style="display: table-cell; width: 200px; padding: 2px;"><b>Limit</b></div>');
    let limitSelectorCell = $('<div style="display: table-cell; padding: 2px;"></div>');
    let limitSelector = $('<select id="Limit"></select>');
    $(limitSelector).append($('<option value="ALL">ALL</option>'));
    $(limitSelector).append($('<option value="5">5</option>'));
    $(limitSelector).append($('<option value="10">10</option>'));
    $(limitSelector).append($('<option value="20">20</option>'));
    $(limitSelector).append($('<option value="30">30</option>'));
    $(limitSelector).append($('<option value="50">50</option>'));
    $(limitSelector).append($('<option value="100">100</option>'));
		$(limitSelector).val(limit);
    $(limitSelector).appendTo($(limitSelectorCell));
    $(labelCell).appendTo($(tableRow));
    $(limitSelectorCell).appendTo($(tableRow));
    $(tableRow).appendTo($(table));

    $(tagSelector).on('change', (evt)=>{
      $(tagValueInput).val('*');
    });

    return $(table);
  }

  const doGetDicomFilter = function(filter) {
    let modality = $(filter).find('#Modality').val();
  	let keyName = $(filter).find('#DicomTag').val();
  	let keyValue = $(filter).find('#TagValue').val();
  	let studydate = $(filter).find('#StudyDate').val();
  	let limit = $(filter).find('#Limit').val();
    let queryStr = '{"Level": "Study", "Expand": true, "Query": {';
  	if (modality === 'ALL') {
  		queryStr += '"Modality": "*"';
  	} else {
  		queryStr += '"Modality": "' + modality + '"';
  	}
  	if (keyName !== 'ALL') {
  		queryStr += ', "' + keyName + '": "' + keyValue + '"';
  	}
  	if (studydate !== 'ALL') {
			if (studydate === 'TODAY') {
				//queryStr += ', "StudyDate": "' + '-' + util.getToday() + '"';
				queryStr += ', "StudyDate": "' + util.getToday() + '-"';
			} else if (studydate === 'YESTERDAY') {
				queryStr += ', "StudyDate": "' + util.getYesterday() + '-"';
			} else if (studydate === 'WEEK') {
				queryStr += ', "StudyDate": "' + util.getDateLastWeek() + '-"';
			} else if (studydate === 'MONTH') {
				queryStr += ', "StudyDate": "' + util.getDateLastMonth() + '-"';
			} else if (studydate === '3MONTH') {
				queryStr += ', "StudyDate": "' + util.getDateLast3Month() + '-"';
			} else if (studydate === 'YEAR') {
				queryStr += ', "StudyDate": "' + util.getDateLastYear() + '-"';
			} else {
				queryStr = queryStr;
			}
  	}

  	queryStr += '}';

		/*
  	if (limitControl) {
			if (limit !== 'ALL') {
				queryStr += ', "Limit": ' + limit + '}';
			} else {
				queryStr += '}';
			}
		} else {
			queryStr += '}';
		}
		*/

		if (limit !== 'ALL') {
			queryStr += ', "Limit": ' + limit + '}';
		} else {
			queryStr += '}';
		}

    return queryStr;
  }

  return {
    doCreateFilter,
    doGetDicomFilter
	}
}
