/*ai-lib.js*/
module.exports = function ( jq ) {
	const $ = jq;
	const apiconnector = require('../../case/mod/apiconnect.js')($);
  const util = require('../../case/mod/utilmod.js')($);
  const common = require('../../case/mod/commonlib.js')($);

  const commandButtonStyle = {'padding': '3px', 'cursor': 'pointer', 'border': '1px solid white', 'color': 'white', 'background-color': 'blue'};
	const quickReplyDialogStyle = { 'position': 'fixed', 'z-index': '13', 'left': '0', 'top': '0', 'width': '100%', 'height': '100%', 'overflow': 'auto', 'background-color': 'rgb(0,0,0)', 'background-color': 'rgba(0,0,0,0.4)'};
	const quickReplyContentStyle = { 'background-color': '#fefefe', 'margin': '15% auto', 'padding': '10px', 'border': '1px solid #888', 'width': '520px', 'height': '200px', /*'font-family': 'THSarabunNew',*/ 'font-size': '20px' };

  const doCallCheckSeries = function(studyID) {
    return new Promise(async function(resolve, reject) {
      let seriesList = await common.doGetLocalSeriesList(studyID);
			if (seriesList){
	      let seriesDescList = [];
	      let	promiseList = new Promise(async function(resolve2, reject2){
	        seriesList.Series.forEach(async(item, i) => {
						//let seriesTags = await common.doGetOrthancSeriesDicom(item);
	          let seriesTags = await common.doGetLocalOrthancSeriesDicom(item);
						let seriesName = undefined;
						if (seriesTags.MainDicomTags.SeriesDescription){
							seriesName = seriesTags.MainDicomTags.SeriesDescription
						} else {
							seriesName = '[ ' + seriesTags.MainDicomTags.BodyPartExamined + ' ]'
						}
	          let seriesView = {id: item, desc: seriesName};
	          seriesDescList.push(seriesView);
	        });
	        setTimeout(()=>{
						resolve2(seriesDescList);
					}, 2500);
				});
	      Promise.all([promiseList]).then((ob)=>{
					resolve(ob[0]);
				});
			} else {
				resolve();
			}
    });
  }

  const doCreateSeriesSelect = function(dicomSeries){
    return new Promise(async function(resolve, reject) {
      let selectView = $('<div style="width: 100%;"></div>');
      let titleGuide = $('<div style="position: relative; width: 100%; padding: 2px; background-color: #02069B; color: white;"></div>');
      let figgerIcon = $('<img src="/images/figger-right-icon.png" width="25px" height="auto" style="position: relative; display: inline-block;"/>');
      let guideText = $('<span id="GalleryTitle" style="position: relative; display: inline-block; margin-left: 5px;">โปรดเลือกซีรีส์ที่ต้องการส่งภาพให้ AI</span>');
      $(titleGuide).append($(figgerIcon)).append($(guideText));
      $(titleGuide).appendTo($(selectView));

      let seriesContent = $('<div style="position: relative; width: 100%; padding: 2px;"></div>');
			let	promiseList = new Promise(async function(resolve2, reject2){
	      await dicomSeries.forEach((item, i) => {
	        let seriesItem = $('<div class="series-item" style="position: relative; width: 100%; padding: 2px;"></div>');
	        $(seriesItem).text(item.desc);
	        $(seriesItem).css({'cursor': 'pointer'});
	        $(seriesItem).hover(()=>{
	          $(seriesItem).css({'background-color': '#02069B', 'color': 'white'});
	        }, ()=>{
	          $(seriesItem).css({'background-color': '', 'color': ''});
	        });
	        $(seriesItem).on('click', async (evt)=>{
	          //$(selectView).loading('start');
	          $('#quickreply').empty();
						$('#quickreply').append($('<div id="overlay"><div class="loader"></div></div>'));
					  $('#quickreply').loading({overlay: $("#overlay"), stoppable: true});
						$('#quickreply').loading('start');
						//let callSeriesRes = await common.doGetOrthancSeriesDicom(item.id);
	          let callSeriesRes = await common.doGetLocalOrthancSeriesDicom(item.id);
						let modality = callSeriesRes.MainDicomTags.Modality;
						let studyId = callSeriesRes.ParentStudy;
	          let callCreatePreview = await common.doCallCreatePreviewSeries(item.id, callSeriesRes.Instances);
	          let galleryView = await doCreateThumbPreview(item.id, item.desc, callSeriesRes.Instances, studyId, modality);
	          $(galleryView).css(quickReplyContentStyle);
	          $(galleryView).css({'width': '720px', 'height': 'auto'});
	  			  $('#quickreply').append($(galleryView));
						if (callSeriesRes.Instances.length == 1){
							//$(galleryView).find('#ImagePreview').empty();
							$(galleryView).find('#OKCmd').click();
							$(galleryView).find('#ThumbSelector').empty();
							$(galleryView).find('#ThumbSelector').css({'display': 'block'});
						} else {
							$(galleryView).find('#ImagePreview').css({'display': 'block'});
							$(galleryView).find('#ThumbSelector').css({'display': 'block'});
						}
	          $('#quickreply').loading('stop');
	        });
	        $(seriesItem).appendTo($(seriesContent));
	      });
				setTimeout(()=>{
					$(seriesContent).appendTo($(selectView));
		      resolve2($(selectView));
				}, 2500);
			});
			Promise.all([promiseList]).then((ob)=>{
				resolve(ob[0]);
			});
    });
  }

  const doCreateThumbPreview = function(seriesId, seriesDesc, instanceList, studyId, modality){
    return new Promise(async function(resolve, reject) {
      let galleryView = $('<div style="width: 100%;"></div>');
      let titleGuide = $('<div style="position: relative; width: 100%; padding: 2px; background-color: #02069B; color: white;"></div>');
      let figgerIcon = $('<img src="/images/figger-right-icon.png" width="25px" height="auto" style="position: relative; display: inline-block;"/>');
      let guideText = $('<span style="position: relative; display: inline-block; margin-left: 5px;">โปรดเลือกภาพที่ต้องการส่งให้ AI</span>');
      let dialogCmdBox = $('<div style="position: relative; display: inline-block; float: right; padding: 2px;"></div>');
      $(titleGuide).append($(figgerIcon)).append($(guideText)).append($(dialogCmdBox));
      $(titleGuide).appendTo($(galleryView));

      let okCmd = $('<span id="OKCmd" style="padding: 2px; border: 1px solid white; background-color: green; cursor: pointer; border-radius: 10px;">ตกลง</span>');
      $(okCmd).appendTo($(dialogCmdBox));
      $(dialogCmdBox).append($('<span>  </span>'));
      let cancelCmd = $('<span style="padding: 2px; border: 1px solid white; background-color: red; cursor: pointer; border-radius: 10px;">ยกเลิก</span>');
      $(cancelCmd).appendTo($(dialogCmdBox));

      let seriesNameBox = $('<div style="width: 100%; text-align: center; margin-top: 5px;"></div>');
      $(seriesNameBox).html('<h4>' + seriesDesc + '</h4>');
      $(seriesNameBox).appendTo($(galleryView));

      let imagePreview = $('<div id="ImagePreview" style="width: 100%; min-height: 220px; text-align: center; margin-top: 5px; display: none;"></div>');
      $(imagePreview).appendTo($(galleryView));
      let thumbSelector = $('<div id="ThumbSelector" style="width: 100%; display: none;"></div>');
      $(thumbSelector).appendTo($(galleryView));

      let previewPath = '/img/usr/preview/' + seriesId
      await instanceList.forEach((item, i) => {
        let thumbImg = $('<img width="60" height="auto"/>');
				let thumbFileSrc = previewPath + '/' + item + '.png';
				//console.log(thumbFileSrc);
        $(thumbImg).attr('src', thumbFileSrc);
        $(thumbImg).css({'cursor': 'pointer'});
        $(thumbImg).data('thumbImgData', {instanceId: item});
        $(thumbImg).on('click', async (evt)=>{
          $(thumbSelector).find('img').removeClass('img-thumb-active');
          $(thumbImg).addClass('img-thumb-active');
          let previewImg = $('<img width="360" height="auto"/>');
          $(previewImg).attr('src', previewPath + '/' + item + '.png');
          $(imagePreview).empty().append($(previewImg));
        })
        $(thumbImg).appendTo($(thumbSelector));
      });
      $(okCmd).on('click', async (evt)=>{
        let thumbSelected = $(thumbSelector).find('img.img-thumb-active');
        if (thumbSelected.length > 0){
					//$('#quickreply').loading('start');
					$(galleryView).append($('<div id="overlay"><div class="loader"></div></div>'));
					$(galleryView).loading({overlay: $("#overlay"), stoppable: true});
					$(galleryView).loading('start');

          let thumbData = $(thumbSelected).data('thumbImgData');
					try {
	          let aiRes = await doCallSendAI(seriesId, thumbData.instanceId, studyId);
						console.log(aiRes);
						let pdfLinks = aiRes.result.links;
						let resultBox = $('<div style="width: 97%; padding: 10px; border: 1px solid black; background-color: #ccc; margin-top: 4px;"></div>');
						let embetObject = $('<object data="' + aiRes.result.finalpdf + '" type="application/pdf" width="100%" height="480"></object>');
						$(embetObject).appendTo($(resultBox));

						$(thumbSelector).empty().append($(resultBox));

						/* start convert on cloud */
						let userdata = JSON.parse(localStorage.getItem('userdata'));
						let hospitalId = userdata.hospitalId;
						let socketUrl = 'ws://localhost:3000/api/orthanc/' + hospitalId;
						let wsl = undefined;
						try {
							wsl = new WebSocket(socketUrl);
						} catch(err) {
							console.log('Can not connect to local socket.', err);
						}

						console.log(wsl);
						wsl.onopen = function () {
							console.log('Local Client Websocket is connected to Local server')
						};

						wsl.onmessage = function (msgEvt) {
							let data = JSON.parse(msgEvt.data);
							console.log('Local WebSocket Client have data in=> ', data);
						}
						wsl.onclose = function(event) {
							console.log("Local WebSocket Client is closed now. with  event:=> ", event);
						};

						wsl.onerror = function (err) {
							console.log("Local WebSocket Client Got an error", err);
						};

						setTimeout(async()=>{
							if ((wsl.readyState == 0) || (wsl.readyState == 1)){
								let pdffilecode = aiRes.result.pdfs;
								let convertRes = await common.doConvertAIResult(studyId, pdffilecode, modality);
								console.log(convertRes);
								/********/
								//$(okCmd).text('แปลงผลอ่านเข้า PACS');
								/*
									ต้องบอก user ว่า แปลงเข้า local orthanc และ pacs แล้ว
								*/
								wsl.close();
							} else {
								console.log('you are not hospital orthanc host. We can not convert dicom to ypur pacs.');
								let radAlertMsg = $('<div></div>');
								$(radAlertMsg).append($('<p>อุปกรณ์ที่คุณเปิดใช้งานระบบในขณะนี้</p>'));
								$(radAlertMsg).append($('<p>ไม่ใช่อุปกรณที่ได้เชื่อมต่ออยู่กับ PACS</p>'));
								$(radAlertMsg).append($('<p>จึงไม่สามารถส่งภาพผลอ่านจาก AI เข้าไปยัง PACS ได้</p>'));
								$(radAlertMsg).append($('<p>โปรดคลิกปุ่ม <b>ตกลง</b> เพื่อปิดการแจ้งเตือนนี้</p>'));
								const radconfirmoption = {
						      title: 'แจ้งเตือน',
						      msg: $(radAlertMsg),
						      width: '420px',
						      onOk: function(evt) {
										radAlertBox.closeAlert();
						      }
								}
								let radAlertBox = $('body').radalert(radconfirmoption);
								$(radAlertBox.cancelCmd).hide();
							}
						}, 3000);
						$(guideText).text('ผลอ่านจาก AI');
						$(okCmd).text('  ปิด  ');
						$(cancelCmd).hide();
						$(seriesNameBox).hide();
						$(galleryView).loading('stop');
						$(galleryView).find('#overlay').remove();
						$(okCmd).on('click', (evt)=>{
			        $('#quickreply').empty();
			        $('#quickreply').removeAttr('style');
			      });
					} catch (err) {
						$(galleryView).loading('stop');
						$(galleryView).find('#overlay').remove();
						reject(err);
					}
        }
      });
      $(cancelCmd).on('click', (evt)=>{
        $('#quickreply').empty();
        $('#quickreply').removeAttr('style');
      });
      $(thumbSelector).find('img').first().click();
      resolve($(galleryView));
    });
  }

  const doCallSendAI = function(seriesId, instanceId, studyId){
    return new Promise(async function(resolve, reject) {
			try {
	      let callZipRes = await common.doCallCreateZipInstance(seriesId, instanceId);
	      let callSendAIRes = await common.doCallSendAI(seriesId, instanceId, studyId);
	      resolve(callSendAIRes);
			} catch (err) {
				reject(err);
			}
    });
  }

	const doShowSuccessAlertBox = function(){
	  const registerGuideBox = $('<div></div>');
	  $(registerGuideBox).append($('<p>การลงทะเบียนผู้ใช้งาน จำเป็นต้องมี <b>อีเมล์</b> หนึ่งบัญชี</p>'));
	  $(registerGuideBox).append($('<p>และระบบไม่รองรับการลงทะเบียนบน Microsoft Internet Exploere</p>'));
	  $(registerGuideBox).append($('<p>หากพร้อมแล้วคลิกปุ่ม <b>ตกลง</b> เพื่อเปิดการลงทะเบียนบน Google Chrome</p>'));
	  let chromeBrowser = $('<div style="padding: 5px; text-align: center;"><img src="/images/chrome-icon.png" width="100px" height="auto"/></div>');
	  $(registerGuideBox).append($(chromeBrowser));
	  const radregisteroption = {
	    title: 'ตำชี้แจงเพื่อดำเนินการลงทะเบียน',
	    msg: $(registerGuideBox),
	    width: '460px',
	    onOk: function(evt) {
	      let chromeLink = "ChromeHTML:// radconnext.info/index.html?action=register";
	      window.location.replace(chromeLink);
	      registerGuide.closeAlert();
	    }
	  }
	  let registerGuide = $('body').radalert(radregisteroption);
	  $(registerGuide.cancelCmd).hide();
	}

  return {
    commandButtonStyle,
  	quickReplyDialogStyle,
  	quickReplyContentStyle,

    doCallCheckSeries,
    doCreateSeriesSelect,
    doCreateThumbPreview,
    doCallSendAI
	}
}
