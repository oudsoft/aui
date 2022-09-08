/*dicom.js*/
module.exports = function ( jq ) {
	const $ = jq;

	const util = require('../../../case/mod/utilmod.js')($);
  const common = require('../../../case/mod/commonlib.js')($);
	const newreffuser = require('../../../case/mod/createnewrefferal.js')($);
	const ai = require('../../../radio/mod/ai-lib.js')($);

	const casecreator = require('./case-creator.js')($);

  const doCreateDicomListTitlePage = function(queryString){
    let titlePage = $('<div></div>');
    let logoPage = $('<img src="/images/orthanc-icon-3.png" width="40px" height="auto" style="position: relative; display: inline-block; top: 10px;"/>');
    $(titlePage).append($(logoPage));
    let titleContent = $('<div style="position: relative; display: inline-block; margin-left: 10px;"><h3>รายการภาพในระบบ</h3></div>');
    $(titlePage).append($(titleContent));

    let queryDicom = JSON.parse(queryString);

    let filterDisplayText = '';
    if ((queryDicom.Query.Modality) && (queryDicom.Query.Modality !== '*')) {
      filterDisplayText += ' Modality <b>[' + queryDicom.Query.Modality + ']</b>';
    } else {
      queryDicom = {Query: {modality: '*'}};
      filterDisplayText += ' Modality <b>[All]</b>';
    }

    let filterDisplayTextBox = $('<div style="position: relative; display: inline-block; margin-left: 10px;"></div>');
    $(filterDisplayTextBox).append($('<span>' + filterDisplayText + '</span>'));
    $(titlePage).append($(filterDisplayTextBox));

    $('#TitleContent').empty().append($(titlePage));
  }

  const doLoadDicomFromOrthanc = function(viewPage){
    return new Promise(async function(resolve, reject) {
      $('body').loading('start');
  		const userdata = JSON.parse(localStorage.getItem('userdata'));
  		let userDefualtSetting = JSON.parse(localStorage.getItem('defualsettings'));
      let userItemPerPage = userDefualtSetting.itemperpage;
  		let queryString = localStorage.getItem('dicomfilter');
      let localOrthancRes = await common.doCallLocalApi('/api/orthanc/study/list/lastmonth', {});

      if (localOrthancRes.status.code == 200) {
        doCreateDicomListTitlePage(queryString);
        $(".mainfull").empty();
  			let resultBox = $('<div id="ResultView" style="position: relative; width: 99%; z-index: 1;"></div>');
  			$(".mainfull").append($(resultBox));

        let studies = localOrthancRes.result;
        //console.log(studies);

        if (studies.length > 0) {
          let showDicoms = [];
          if (userItemPerPage == 0) {
            showDicoms = studies;
          } else {
            showDicoms = await common.doExtractList(studies, 1, userItemPerPage);
          }

          let dicomView = await doShowDicomResult(showDicoms, 0);
          $(".mainfull").find('#ResultView').empty().append($(dicomView));

  				let showPage = 1;
  				if ((viewPage) && (viewPage > 0)){
  					showPage = viewPage;
  				}
          let navigBarBox = $('<div id="NavigBar"></div>');
          $(".mainfull").append($(navigBarBox));
          let navigBarOption = {
            currentPage: showPage,
            itemperPage: userItemPerPage,
            totalItem: studies.length,
            styleClass : {'padding': '4px', /*'font-family': 'THSarabunNew', 'font-size': '20px', */ 'margin-top': '60px'},
            changeToPageCallback: async function(page){
              $('body').loading('start');
              let toItemShow = 0;
              if (page.toItem == 0) {
                toItemShow = studies.length;
              } else {
                toItemShow = page.toItem;
              }
              showDicoms = await common.doExtractList(studies, page.fromItem, toItemShow);
              let dicomView = await doShowDicomResult(showDicoms, (Number(page.fromItem)-1));
              $(".mainfull").find('#ResultView').empty().append($(dicomView));
              $('body').loading('stop');
  						let eventData = {userId: userdata.id};
  						$(".mainfull").trigger('opendicomfilter', [eventData]);
            }
          };
          let navigatoePage = $(navigBarBox).controlpage(navigBarOption);
          navigatoePage.toPage(1);
  				$('body').loading('stop');
  			} else {
  				let dicomView = await doShowDicomResult([], 0);
          $(".mainfull").find('#ResultView').empty().append($(dicomView));
  				$(".mainfull").append($('<div><h3>ไม่พบรายการภาพ</h3></div>'));
  				$('body').loading('stop');
  			}
        resolve(localOrthancRes);
      } else {
        $.notify('local orthanc load study error', 'error');
        resolve();
      }
    });
  }

  const doShowDicomResult = function(dj, startRef){
		return new Promise(async function(resolve, reject) {
			/* sort dj by studydatetime */
			await dj.sort((a,b) => {
				let av = util.getDatetimeValue(a.MainDicomTags.StudyDate, a.MainDicomTags.StudyTime);
				let bv = util.getDatetimeValue(b.MainDicomTags.StudyDate, b.MainDicomTags.StudyTime);
				if (av && bv) {
					return bv - av;
				} else {
					return 0;
				}
			});
			console.log(dj);
			const table = $('<div style="display: table; width: 100%; border-collapse: collapse;"></div>');
			const tableHeader = doCreateDicomHeaderRow();
			$(tableHeader).appendTo($(table));
			const dicomFilterForm = common.doCreateDicomFilterForm((filterKey)=>{
				console.log(filterKey);
				common.doSaveQueryDicom(filterKey);
				doLoadDicomFromOrthanc();
			});
			$(dicomFilterForm).appendTo($(table));
			$(dicomFilterForm).hide();

			const promiseList = new Promise(function(resolve2, reject2){
				for (let i=0; i < dj.length; i++) {
					let desc, protoname, mld, sa, studydate, bdp;
					if ((dj[i].MainDicomTags) && (dj[i].SamplingSeries)){
						if (dj[i].MainDicomTags.StudyDescription) {
							bdp = dj[i].MainDicomTags.StudyDescription;
						} else {
							let dicomProtocolName = dj[i].SamplingSeries.MainDicomTags.ProtocolName;
							let dicomManufacturer = dj[i].SamplingSeries.MainDicomTags.Manufacturer;
							if (dicomProtocolName) {
								bdp = dicomProtocolName;
							} else if ((dicomManufacturer) && (dicomManufacturer.indexOf('FUJIFILM') >= 0)) {
								bdp = dj[i].SamplingSeries.MainDicomTags.PerformedProcedureStepDescription;
							} else {
								bdp = '';
							}
						}
						desc = '<div class="study-desc">' + bdp + '</div>';

						if (dj[i].SamplingSeries.MainDicomTags.ProtocolName) {
							protoname = '<div class="protoname">' + dj[i].SamplingSeries.MainDicomTags.ProtocolName + '</div>';
						} else {
							protoname = '';
						}
						if (dj[i].SamplingSeries.MainDicomTags.Modality) {
							mld = dj[i].SamplingSeries.MainDicomTags.Modality;
						} else {
							mld = '';
						}
						if (dj[i].MainDicomTags.StudyDate) {
							studydate = dj[i].MainDicomTags.StudyDate;
							studydate = util.formatStudyDate(studydate);
						} else {
							studydate = '';
						}
						if (dj[i].PatientMainDicomTags.PatientSex) {
							sa = dj[i].PatientMainDicomTags.PatientSex;
						} else {
							sa = '-';
						}
						if (dj[i].PatientMainDicomTags.PatientBirthDate) {
							sa = sa + '/' + util.getAge(dj[i].PatientMainDicomTags.PatientBirthDate)
						} else {
							sa = sa + '/-';
						}

						let patientProps = sa.split('/');
						let defualtValue = {patient: {id: dj[i].PatientMainDicomTags.PatientID, name: dj[i].PatientMainDicomTags.PatientName, age: patientProps[1], sex: patientProps[0]}, bodypart: bdp, studyID: dj[i].ID, acc: dj[i].MainDicomTags.AccessionNumber, mdl: mld};
						if (dj[i].MainDicomTags.StudyDescription) {
							defualtValue.studyDesc = dj[i].MainDicomTags.StudyDescription;
						} else {
							defualtValue.studyDesc = '';
						}
						if (dj[i].SamplingSeries.MainDicomTags.ProtocolName) {
							defualtValue.protocalName = dj[i].SamplingSeries.MainDicomTags.ProtocolName;
						} else {
							defualtValue.protocalName = '';
						}
						defualtValue.manufacturer = dj[i].SamplingSeries.MainDicomTags.Manufacturer;
						defualtValue.stationName = dj[i].SamplingSeries.MainDicomTags.StationName;
						defualtValue.studyInstanceUID = dj[i].MainDicomTags.StudyInstanceUID;
						defualtValue.studyDate = dj[i].MainDicomTags.StudyDate;
						defualtValue.headerCreateCase = 'ส่งอ่านผล';
						defualtValue.urgenttype = 'standard';
						defualtValue.studyTags = dj[i];

 						let no = (i + 1 + startRef);
						let studyDate = '<span style="float: left;">' + studydate + '</span>';
						//let studyTime = '<div style="background-color: gray; color: white; text-align: center; float: left; margin: -6px 10px; padding: 5px; border-radius: 5px;">' + util.formatStudyTime(dj[i].MainDicomTags.StudyTime) + '</div>';
						let studyTime = '<span style="float: left; margin-left: 10px;">' + util.formatStudyTime(dj[i].MainDicomTags.StudyTime) + '</span>';


						let hn = dj[i].PatientMainDicomTags.PatientID;
						let name = dj[i].PatientMainDicomTags.PatientName;
						let sdd =  desc +  protoname;
						let dicomDataRow = doCreateDicomItemRow(no, studyDate, studyTime, hn, name, sa, mld, sdd, defualtValue, dj[i].Series, dj[i].ID);
						$(dicomDataRow).appendTo($(table));
					}
				}

				setTimeout(()=> {
					resolve2($(table));
				}, 700);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
		});
	}

	const doCreateDicomHeaderRow = function() {
		const headerLabels = ['No.', 'Study Date', 'HN', 'Name', 'Sex/Age', 'Modality', 'Study Desc. / Protocol Name'/*, 'Operation'*/];
		const tableRow = $('<div id="DicomHeaderRow" style="display: table-row;" width: 100%;"></div>');
		for (var i = 0; i < headerLabels.length; i++) {
			let item = headerLabels[i];
	    let tableHeader = $('<div style="display: table-cell; vertical-align: middle;" class="header-cell">' + item + '</div>');
			$(tableHeader).appendTo($(tableRow));
		}
		return $(tableRow);
	}

	const doCreateDicomItemRow = function(no, studyDate, studyTime, hn, name, sa, mdl, sdd, defualtValue, dicomSeries, dicomID){
		const tableRow = $('<div style="display: table-row; padding: 2px; cursor: pointer;" class="case-row"></div>');

		let dicomValue = $('<div style="display: table-cell; padding: 2px; text-align: center; vertical-align: middle;">' + no + '</div>');
		$(dicomValue).appendTo($(tableRow));

		dicomValue = $('<div style="display: table-cell; padding: 2px; vertical-align: middle;">' + studyDate + studyTime + '</div>');
		$(dicomValue).appendTo($(tableRow));

		dicomValue = $('<div style="display: table-cell; padding: 2px; vertical-align: middle;">' + hn + '</div>');
		$(dicomValue).appendTo($(tableRow));

		dicomValue = $('<div style="display: table-cell; padding: 2px; vertical-align: middle;">' + name + '</div>');
		$(dicomValue).appendTo($(tableRow));

		dicomValue = $('<div style="display: table-cell; padding: 2px; vertical-align: middle;">' + sa + '</div>');
		$(dicomValue).appendTo($(tableRow));

		dicomValue = $('<div style="display: table-cell; padding: 2px; vertical-align: middle;">' + mdl + '</div>');
		$(dicomValue).appendTo($(tableRow));

		dicomValue = $('<div style="display: table-cell; padding: 2px; vertical-align: middle;">' + sdd + '</div>');
		$(dicomValue).appendTo($(tableRow));

		//let operationField = $('<div style="display: table-cell; padding: 2px; text-align: center; vertical-align: middle;"></div>');
		//$(operationField).appendTo($(tableRow));


		$(tableRow).on('click', async (evt)=>{
			//const figgerIcon = $('<img src="/images/figger-right-icon.png" width="30px" height="auto"/>');
			//let closePopupCmd = $('<span style="position: relative; display: inline-block; float: right; padding: 2px;">Close</span>');
			let closePopupCmd = $('<img data-toggle="tooltip" src="../images/cross-mark-icon.png" title="ปิดกล่อง" width="22" height="auto"/>');
			$(closePopupCmd).on('click', (evt)=>{
				$('#quickreply').empty();
				$('#quickreply').removeAttr('style');
			})

			let previewCmd = $('<img class="pacs-command-dd" data-toggle="tooltip" src="../images/preview-icon.png" title="เปิดดูรูปด้วย Web Viewer"/>');
			$(previewCmd).on('click', function(evt){
				$(closePopupCmd).click();
				//common.doOpenStoneWebViewer(defualtValue.studyInstanceUID);
				const lacalOrthancStoneWebviewer = 'http://localhost:8042/stone-webviewer/index.html?study=' + defualtValue.studyInstanceUID;
				window.open(lacalOrthancStoneWebviewer, '_blank');
			});

			let createNewCaseCmd = $('<img class="pacs-command-dd" data-toggle="tooltip" src="../images/doctor-icon.png" title="ส่งรังสีแพทย์เพื่ออ่านผล"/>');
			$(createNewCaseCmd).on('click', async function(evt){
				$(closePopupCmd).click();
				/*
				let patientName = defualtValue.patient.name;
				let allSeries = dicomSeries.length;
				let allImageInstances = await doCallCountInstanceImage(dicomSeries, patientName);
				*/
				let allSeries = dicomSeries.length;
				let allImageInstances = await common.doCountImageLocalDicom(dicomID);
				casecreator.doCreateNewCaseFirstStep(defualtValue, allSeries, allImageInstances);
			});

			let aiInterfaceButton = $('<img class="pacs-command" data-toggle="tooltip" src="/images/ai-icon.png" title="ขอผลอ่านจาก AI"/>');
			$(aiInterfaceButton).click(async function() {
				$(closePopupCmd).click();
				$('body').loading('start');
				let seriesList = await ai.doCallCheckSeries(dicomID);
				if (seriesList) {
					let seriesSelect = await ai.doCreateSeriesSelect(seriesList);
					$(seriesSelect).css(ai.quickReplyContentStyle);
					$(seriesSelect).css({'height': 'auto'});
					$('#quickreply').css(ai.quickReplyDialogStyle);
					$('#quickreply').append($(seriesSelect));
					$('body').loading('stop');

					let howmanySeries = $(seriesSelect).find('.series-item');
					if (howmanySeries.length == 1) {
						let singleSeries = $(howmanySeries)[0];
						$(singleSeries).click();
					}
				} else {
					const sorryMsg = $('<div></div>');
			    $(sorryMsg).append($('<p>ระบบค้นหาภาพจากระบบไม่เจอโปรดแจ้งผูดูแลระบบฯ ของคุณ</p>'));
					const radalertoption = {
			      title: 'ขออภัยที่เกิดข้อผิดพลาด',
			      msg: $(sorryMsg),
			      width: '560px',
			      onOk: function(evt) {
		          radAlertBox.closeAlert();
			      }
			    }
					let radAlertBox = $('body').radalert(radalertoption);
			    $(radAlertBox.cancelCmd).hide();
				}
			});

			let downloadDicomCmd = $('<img class="pacs-command" data-toggle="tooltip" src="../images/download-icon.png" title="ดาวน์โหลด dicom เป็น zip ไฟล์"/>');
			$(downloadDicomCmd).on('click', async function(evt){
				$(closePopupCmd).click();
				let dicomFilename = defualtValue.patient.name.split(' ');
				dicomFilename = dicomFilename.join('_');
				dicomFilename = dicomFilename + '-' + defualtValue.studyDate + '.zip';
				//common.doDownloadDicom(dicomID, dicomFilename);
				await common.doDownloadLocalDicom(dicomID, dicomFilename);
			});

			let deleteDicomCmd = $('<img class="pacs-command" data-toggle="tooltip" src="../images/delete-icon.png" title="ลบรายการนี้"/>');
			$(deleteDicomCmd).on('click', function(evt){
				$(closePopupCmd).click();
				let radAlertMsg = $('<div></div>');
				$(radAlertMsg).append($('<p>คุณต้องการลบ Dicom ของผู้ป่วย</p>'));
				$(radAlertMsg).append($('<p>HN: <b>' + hn + '</b></p>'));
				$(radAlertMsg).append($('<p>Name: <b>' + name + '</b></p>'));
				$(radAlertMsg).append($('<p><b>ใช่ หรือไม่?</b></p>'));
				$(radAlertMsg).append($('<p>หาก <b>ใช่</b> คลิกปุ่ม <b>ตกลง</b> เพื่อดำเนินการลบภาพ</p>'));
				$(radAlertMsg).append($('<p>หาก <b>ไม่ใช่</b> คลิกปุ่ม <b>ยกเลิก</b> เพื่อยกเลิก</p>'));
				const radconfirmoption = {
					title: 'โปรดยืนยันการลบภาพ',
					msg: $(radAlertMsg),
					width: '420px',
					onOk: function(evt) {
						$('body').loading('start');
						radConfirmBox.closeAlert();
						//let userdata = JSON.parse(localStorage.getItem('userdata'));
						//const hospitalId = userdata.hospitalId;
						//apiconnector.doCallDeleteDicom(dicomID, hospitalId).then((response) => {
						common.doDeleteLocalDicom(dicomID).then((response) => {
							$('body').loading('stop');
							if (response) {
								$.notify('ดำเนินการลบข้อมูลเรียบร้อยแล้ว', 'success');
								let atPage = $('#NavigBar').find('#CurrentPageInput').val();
								doLoadDicomFromOrthanc(atPage);
							} else {
								$.notify('เกิดความผิดพลาด ไม่สามารถลบรายการนี้ได้ในขณะนี้', 'error');
							}
						}).catch((err) => {
							$('body').loading('stop');
							$.notify('เกิดความผิดพลาด ไม่สามารถลบรายการนี้ได้ในขณะนี้', 'error');
						});
					},
					onCancel: function(evt){
						radConfirmBox.closeAlert();
					}
				}
				let radConfirmBox = $('body').radalert(radconfirmoption);
			});

			let popupDicomCmdBox = $('<div></div>');

			let popupTitleBar = $('<div style="position: relative; background-color: #02069B; color: white; border: 2px solid grey; min-height: 20px;"></div>');
			let titleTextBox = $('<span style="display: inline-block; margin-left: 8px;"></span>');
      $(titleTextBox).text('รายการคำสั่ง');
			$(closePopupCmd).css({'position': 'relative', 'display': 'inline-block', 'float': 'right', 'padding': '2px'});
			$(closePopupCmd).css({'margin-right': '0px', 'cursor': 'pointer', 'border': '3px solid grey', 'background-color': 'white'});

			$(popupTitleBar).append($(titleTextBox)).append($(closePopupCmd));

			let popupDicomSummary = $('<div style="position: relative; min-height: 10px; padding: 5px;"></div>');
			$(popupDicomSummary).append($('<span><b>HN:</b>  </span>'));
			$(popupDicomSummary).append($('<span>' + hn + '  </span>'));
			$(popupDicomSummary).append($('<span><b>Name:</b>  </span>'));
			$(popupDicomSummary).append($('<span>' + name + ' </span>'));
			$(popupDicomSummary).append($('<span><b>Acc. No.:</b>  </span>'));
			let accNoElem = $('<span>' + defualtValue.acc + '</span>');
			$(accNoElem).on('click', (evt)=>{
				$('body').loading('start');
				const main = require('../main.js');
				let myWsm = main.doGetWsm();
				let userdata = JSON.parse(localStorage.getItem('userdata'));
				let hospitalId = userdata.hospitalId;
				let myname = userdata.username;
				let command = 'curl -X POST --user demo:demo http://localhost:8042/modalities/cloud/store -d ' + defualtValue.studyID;
				let lines = [command];
				let runCommand = {type: 'clientrun', hospitalId: hospitalId, commands: lines, sender: myname, sendto: 'orthanc'};
				myWsm.send(JSON.stringify(runCommand));
				$(closePopupCmd).click();
			});
			$(popupDicomSummary).append($(accNoElem));

			let popupCmdBar = $('<div style="position: relative; min-height: 50px; padding: 5px; text-align: center;"></div>');
			$(popupCmdBar).append($(previewCmd));
			$(popupCmdBar).append($(createNewCaseCmd));
			$(popupCmdBar).append($(aiInterfaceButton));
			$(popupCmdBar).append($(downloadDicomCmd));
			$(popupCmdBar).append($(deleteDicomCmd));

			$(popupDicomCmdBox).append($(popupTitleBar)).append($(popupDicomSummary)).append($(popupCmdBar))

			$(popupDicomCmdBox).css({'width': '850px', 'height': '180px'});
			$(popupDicomCmdBox).css(ai.quickReplyContentStyle);
			$('#quickreply').css(ai.quickReplyDialogStyle);
			$('#quickreply').append($(popupDicomCmdBox));
		})
		//console.log(defualtValue);
		//return $(tableRow);

		let rowGroup = $('<div style="display: table-row-group"></div>');
		return $(rowGroup).append($(tableRow));
	}

  return {
    doLoadDicomFromOrthanc
  }
}
