module.exports = function ( jq ) {
	const $ = jq;

  const common = require('../../../home/mod/common-lib.js')($);
	const constant = require('../../../home/mod/constant-lib.js');
  const elementProperty = require('./element-property-lib.js')($);
  let activeType, activeElement;

  const doCalRatio = function(paperSize){
    let containerWidth = $('#report-container').width();
		if (paperSize == 1) {
    	return containerWidth/constant.A4Width;
		} else if (paperSize == 2) {
			return containerWidth/constant.SlipWidth;
		}
  }

  const resetContainer = function(paperSize){
    let newRatio = doCalRatio(paperSize);
    let newHeight = undefined;
		if (paperSize == 1){
			newHeight = constant.A4Height/* * newRatio*/;
			$('#report-container').css({'width': constant.A4Width, 'margin-left': '0px'});
		} else if (paperSize == 2){
			newHeight = constant.SlipHeight * newRatio;
			let parentWidth = $('#report-container').parent().width();
			let adjustLeft = (parentWidth - constant.SlipWidth) / 2;
			$('#report-container').css({'width': constant.SlipWidth, 'margin-left': adjustLeft+'px'});
		}
    $('#report-container').css('height', newHeight + 'px');
    $('#report-container').css('max-height', newHeight + 'px');

    doCollectElement(paperSize).then((reportElements)=>{
			//console.log(reportElements);
      if (reportElements.length > 0) {
        let wrapper = $('#report-container');
        $(wrapper).empty();
        reportElements.forEach(async (item, i) => {
          let reportElem = {};
          await Object.getOwnPropertyNames(item).forEach((tag) => {
            reportElem[tag] = item[tag];
          });
          let element = elementProperty.doCreateElement(wrapper, item.elementType, reportElem);
					$(element).click();
        });
      }
    });
  }

  const doCreateTemplateTypeSelector = function(shopData){
    let selector = $('<select></select>');
    constant.templateTypes.forEach((item, i) => {
			if (item.id != 3) {
      	$(selector).append($('<option value="' + item.id + '">' + item.NameTH + '</option>'));
			} else {
				if ((shopData.Shop_VatNo) && (shopData.Shop_VatNo != '')) {
					$(selector).append($('<option value="' + item.id + '">' + item.NameTH + '</option>'));
				}
			}
    });
    return $(selector);
  }

	const doCreatePaperSizeSelector = function(){
		let selector = $('<select></select>');
		constant.paperSizes.forEach((item, i) => {
      $(selector).append($('<option value="' + item.id + '">' + item.NameTH + '</option>'));
    });
    return $(selector);
	}

  const doCreateTemplateDesignArea = function(){
    let wrapper = $('<div class="row" id="WorkRow"></div>');
    let columnSideBox = $('<div class="column side"></div>');
    let reportItemBox = $('<div id="report-item"></div>');
    let selectableBox = $('<ol id="selectable"></ol>');
		let addTextElementCmd = $('<li class="ui-widget-content" id="text-element-cmd"><img src="/images/text-icon.png" class="icon-element"/><span class="text-element">กล่องข้อความ</span></li>');
		let addHrElementCmd = $('<li class="ui-widget-content" id="hr-element-cmd"><img src="/images/hr-line-icon.png" class="icon-element"/><span class="text-element">เส้นแนวนอน</span></li>');
		let addImageElementCmd = $('<li class="ui-widget-content" id="image-element-cmd"><img src="/images/image-icon.png" class="icon-element"/><span class="text-element">กล่องรูปภาพ</span></li>');
    $(selectableBox).append($(addTextElementCmd));
    $(selectableBox).append($(addHrElementCmd));
    $(selectableBox).append($(addImageElementCmd));
		var tableTypeLength = $(".tableElement").length;
		if (tableTypeLength == 0) {
			let addTableElementCmd = $('<li class="ui-widget-content" id="table-element-cmd"><img src="/images/item-list-icon.png" class="icon-element"/><span class="text-element">ตารางออร์เดอร์</span></li>');
			$(selectableBox).append($(addTableElementCmd));
			$(addTableElementCmd).on('click', (evt)=>{
				elementProperty.doCreateElement(reportcontainerBox, 'table');
			});
		}
    let reportItemCmdBox = $('<div id="report-item-cmd" style="padding:5px; text-align: center; margin-top: 20px;"></div>');
    let addElementCmd = $('<input type="button" id="add-item-cmd" value=" เพิ่ม "/>');
    let removeElementCmd = $('<input type="button" id="remove-item-cmd" value=" ลบ "/>');
    $(reportItemCmdBox).append($(addElementCmd)).append($(removeElementCmd));
    let reportPropertyBox = $('<div id="report-property"></div>') ;

    $(reportItemBox).append($(selectableBox)).append($(reportItemCmdBox)).append($(reportPropertyBox));
    $(columnSideBox).append($(reportItemBox));

    let columnMiddleBox = $('<div class="column middle"></div>');
    let reportcontainerBox = $('<div id="report-container"></div>');
    $(columnMiddleBox).append($(reportcontainerBox));

		$(addTextElementCmd).on('click', (evt)=>{
			let newElement = elementProperty.doCreateElement(reportcontainerBox, 'text');
		});
		$(addHrElementCmd).on('click', (evt)=>{
			elementProperty.doCreateElement(reportcontainerBox, 'hr');
		});
		$(addImageElementCmd).on('click', (evt)=>{
			elementProperty.doCreateElement(reportcontainerBox, 'image');
		});

    return $(wrapper).append($(columnSideBox)).append($(columnMiddleBox))
  }

	const doLoadCommandAction = function(){
    $("#add-item-cmd").prop('disabled', true);
    $("#remove-item-cmd").prop('disabled', true);
    $("#text-element-cmd").data({type: "text"});
    $("#hr-element-cmd").data({type: "hr"});
    $("#image-element-cmd").data({type: "image"});
		$("#table-element-cmd").data({type: "table"});
		$("#tr-element-cmd").data({type: "tr"});
		$("#td-element-cmd").data({type: "td"});
		let activeType = undefined;
		/*
    $("#selectable").selectable({
      stop: function() {
        $( ".ui-selected", this ).each(function() {
          activeType = $(this).data();
          $("#add-item-cmd").prop('disabled', false);
        });
      },
      selected: function(event, ui) {
        $(ui.selected).addClass("ui-selected").siblings().removeClass("ui-selected");
      }
    });
		*/
    $("#report-container").droppable({
      accept: ".reportElement",
      drop: function( event, ui ) {
      }
    });
		$('.tableElement').droppable({
      accept: ".trElement",
      drop: function( event, ui ) {
      }
    });
		$('.trElement').droppable({
      accept: ".tdElement",
      drop: function( event, ui ) {
      }
    });
    $("#add-item-cmd").click((event) => {
      let elemType = activeType.type;
      let wrapper = $("#report-container");
			if (elemType == 'tr') {
				wrapper = $(wrapper).find('.tableElement');
			} else if (elemType == 'td') {
				let myTable = $(wrapper).find('.tableElement');
				//console.log($(myTable).data());
				let activeRow = $(myTable).find('.elementActive');
				//console.log($(activeRow).data());
				wrapper = $(activeRow)
			}
      elementProperty.doCreateElement(wrapper, elemType);
    });
    $("#remove-item-cmd").click((event) => {
			elementProperty.removeActiveElement()
    });
  }

	const doReadTableData = function(){
		let tableBox = $("#report-container").find('.tableElement');
		let tableWidth = $(tableBox).width();
		let rowWidth = tableWidth * 0.94;
		//console.log(tableWidth);
		//console.log(rowWidth);
		let tableData = $(tableBox).data().customTableelement.options;
		//console.log(tableData);
		//console.log(tableData.customTableelement.options);
		let tableDesignData = {elementType: 'table', id: tableData.id, x: tableData.x, y: tableData.y, width: tableData.width, height: tableData.height, cols: tableData.cols, rows: []};
		let trs = $(tableBox).find('.trElement');
		$(trs).each((i, tr)=>{
			let trData = $(tr).data().customTrelement.options;
			//console.log(trData);
			let trDesignData = {elementType: 'tr', id: trData.id, backgroundColor: trData.backgroundColor, fields: []};
			let tds  = $(tr).find('.tdElement');
			//console.log(tds);
			$(tds).each((i, td)=>{
				let tdData = $(td).data().customTdelement.options;
				let fieldData = {elementType: 'td', id: tdData.id, height: tdData.height, cellData: tdData.cellData, fontweight: tdData.fontweight, fontalign: tdData.fontalign, fontsize: tdData.fontsize, fontstyle: tdData.fontstyle};
				let percentWidth = ((tdData.width / rowWidth) * 100).toFixed(2);
				fieldData.width = percentWidth;
				trDesignData.fields.push(fieldData);
			});
			tableDesignData.rows.push(trDesignData);
		});
		return tableDesignData;
	}

	const doCollectElement = function(paperSize) {
    return new Promise(function(resolve, reject){
      let newRatio = doCalRatio(paperSize);
      let htmlElements = $("#report-container").children();
      let reportElements = [];
      var promiseList = new Promise(function(resolve, reject){
        htmlElements.each(async (index, elem) => {
          let elemData = $(elem).data();
          let data;
          if (elemData.customTextelement) {
            data = elemData.customTextelement.options;
          } else if (elemData.customHrelement) {
            data = elemData.customHrelement.options;
          } else if (elemData.customImageelement) {
            data = elemData.customImageelement.options;
					} else if (elemData.customTableelement) {
						data = doReadTableData();
          } else {
            data = {};
          }

          let reportElem = {};
          await Object.getOwnPropertyNames(data).forEach((tag) => {
            reportElem[tag] = data[tag];
          });
          reportElements.push(reportElem);
        });
        setTimeout(()=> {
          resolve(reportElements);
        }, 500);
      });
      Promise.all([promiseList]).then((ob)=>{
        resolve(ob[0]);
      });
    });
  }

	const doRenderElement = function(shopData, wrapper, reportElements, ratio, paperSize){
		return new Promise(async function(resolve, reject) {
			let newRatio = 1;
			if (ratio) {
				newRatio = ratio;
			}
			let maxTop = 0;
			const promiseList = new Promise(async function(resolve2, reject2) {
		    await reportElements.forEach((elem, i) => {
		      let element;
		      switch (elem.elementType) {
		        case "text":
		          element = $("<div></div>").css({'position': 'absolute'});
		          //$(element).addClass("reportElement");
		          $(element).css({"left": Number(elem.x)*newRatio + "px", "top": Number(elem.y)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": Number(elem.height)*newRatio + "px"});
		          $(element).css({"font-size": Number(elem.fontsize)*newRatio + "px"});
		          $(element).css({"font-weight": elem.fontweight});
		          $(element).css({"font-style": elem.fontstyle});
		          $(element).css({"text-align": elem.fontalign});
							let field = elem.title.substring(1);
							if (field == 'shop_name') {
								$(element).text(shopData.Shop_Name);
							} else if (field == 'shop_address') {
								$(element).text(shopData.Shop_Address);
							} else {
								$(element).text(elem.title);
							}
		        break;
		        case "hr":
		          element = $("<div><hr/></div>").css({'position': 'absolute'});
		          //$(element).addClass("reportElement");
		          $(element).css({"left": Number(elem.x)*newRatio + "px", "top": Number(elem.y)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": Number(elem.height)*newRatio + "px"});
		          $(element > "hr").css({"border": elem.border});
		        break;
		        case "image":
		          element = $("<div></div>").css({'position': 'absolute'});
		          //$(element).addClass("reportElement");
		          let newImage = new Image();
		          newImage.src = elem.url;
		          newImage.setAttribute("width", Number(elem.width)*newRatio);
		          $(element).append(newImage);
		          $(element).css({"left": Number(elem.x)*newRatio + "px", "top": Number(elem.y)*newRatio + "px", "width": Number(elem.width)*newRatio + "px", "height": "auto"});
		        break;
						case "table":
							//doCreateTable(wrapper, elem.rows);
							doRenderTable(wrapper, elem.rows, elem.x, elem.y, newRatio);
						break;
		      }
					if (element) {
		      	$(wrapper).append($(element));
					}
					if (Number(elem.y) > maxTop) {
						maxTop = Number(elem.y);
					}
		    });
				setTimeout(()=> {
	        resolve2(maxTop);
	      }, 1000);
	    });
	    Promise.all([promiseList]).then((ob)=> {
	      resolve(ob[0]);
	    });
		});
  }

	const doRenderTable = function(wrapper, tableRows, left, top, ratio){
		let table = $('<table cellpadding="0" cellspacing="0" width="100%" border="1"></tble>');
		for (let i=0; i < tableRows.length; i++){
			let row = $('<tr></tr>');
			if (tableRows[i].backgroundColor) {
				$(row).css({'background-color': tableRows[i].backgroundColor})
			}
			$(table).append($(row));
			for (let j=0; j < tableRows[i].fields.length; j++) {
				let cell = $('<td></td>');
				if (tableRows[i].fields.length == 2) {
					$(cell).attr("colspan", (tableRows[0].fields.length - 1).toString());
				}
				$(cell).attr({'align': tableRows[i].fields[j].fontalign, 'width': (Number(tableRows[i].fields[j].width.replace(/px$/, ''))*ratio)/* + 'px'*/});
				$(cell).css({'font-size': Number(tableRows[i].fields[j].fontsize)*ratio + "px", 'font-weight': tableRows[i].fields[j].fontweight, 'font-style': tableRows[i].fields[j].fontstyle});
				$(cell).text(tableRows[i].fields[j].cellData);
				$(row).append($(cell));
			}
		}
		$(wrapper).append($(table).css({'position': 'absolute', 'left': Number(left)*ratio+'px', 'top': Number(top)*ratio+'px'}));
		return $(wrapper);
	}

  const doShowTemplateDesign = function(shopData, workAreaBox){
    return new Promise(async function(resolve, reject) {
			let billFieldOptions = await common.doGetApi('/api/shop/template/billFieldOptions', {});
			localStorage.setItem('billFieldOptions', JSON.stringify(billFieldOptions));
      $(workAreaBox).empty();

      let controlTemplateForm = $('<table width="100%" cellspacing="0" cellpadding="0" border="0"></table>');
      let controlRow = $('<tr></tr>').css({'background-color': '#ddd', 'border': '2px solid grey'});
      $(controlTemplateForm).append($(controlRow));
      let templatTypeSelector = doCreateTemplateTypeSelector(shopData);

			let paperSizeSelector = doCreatePaperSizeSelector();

      let templateNameInput = $('<input type="text"/>').css({'width': '260px'});
			let previewTemplateCmd = $('<input type="button" value=" ดูตัวอย่าง "/>');
      let saveNewTemplateCmd = $('<input type="button" value=" บันทึก "/>');
      $(controlRow).append($('<td width="10%" align="left"><b>ประเภทเอกสาร</b></td>'));
      $(controlRow).append($('<td width="15%" align="left"></td>').append($(templatTypeSelector)));
      $(controlRow).append($('<td width="10%" align="left"><b>ชื่อเอกสารใหม่</b></td>'));
      $(controlRow).append($('<td width="25%" align="left"></td>').append($(templateNameInput)));
			$(controlRow).append($('<td width="8%" align="left"><b>ขนาดกระดาษ</b></td>'));
      $(controlRow).append($('<td width="10%" align="center"></td>').append($(paperSizeSelector)));
			$(controlRow).append($('<td width="*" align="center"></td>').append($(previewTemplateCmd)).append($(saveNewTemplateCmd).css({'margin-left': '10px'})));
      $(workAreaBox).empty().append($(controlTemplateForm));
      let designAreaBox = doCreateTemplateDesignArea();
      $(workAreaBox).append($(designAreaBox));
			let paperSizeValue = $(paperSizeSelector).val();

      doLoadCommandAction();

			let wrapper = $(designAreaBox).find('#report-container');

			$(templatTypeSelector).on('change', (evt)=>{
				let selectValue = $(templatTypeSelector).val();
				onTemplateTypeChange(evt, selectValue, shopData, templateNameInput, paperSizeSelector, wrapper);
			});

			$(paperSizeSelector).on('change', (evt)=>{
				let paperSize = $(paperSizeSelector).val();
				onPaperSizeChange(evt, paperSize, shopData, wrapper)
			});

			$(previewTemplateCmd).on('click', async (evt)=>{
				let paperSize = $(paperSizeSelector).val();
				let reportWrapperWidth = $("#report-container").width();
				let templateDesignElements = await doCollectElement(paperSize);
				let wrapperBoxWidth = 760;
		    let newHeight = undefined;
				let renderRatio = undefined;
				let newRatio = doCalRatio(paperSize);

				let wrapperBox = $("<div></div>");
			  $(wrapperBox).css({"position": "relative", "height": "100vh"});

				let doCreatGUIView = async function() {
					$(wrapperBox).empty();
					if (paperSize == 1){
						renderRatio = wrapperBoxWidth / reportWrapperWidth;
						newHeight = constant.A4Height * newRatio;
						$(wrapperBox).css({'margin-left': '0px', 'width': '100%'});
					}  else if (paperSize == 2){
						renderRatio = reportWrapperWidth / wrapperBoxWidth;
						newHeight = constant.SlipHeight * newRatio;
						let adjustLeft = (wrapperBoxWidth - constant.SlipWidth) / 2;
						$(wrapperBox).css({'margin-left': adjustLeft+'px', 'width': reportWrapperWidth+'px'});
					}

					let maxTop = await doRenderElement(shopData, wrapperBox, templateDesignElements, renderRatio, paperSize);
					maxTop = (Number(maxTop) * renderRatio) + 20;
					$(wrapperBox).css({'height': maxTop+'px', 'max-height': maxTop + 'px'});
				}
				let doCreatJSONView = function() {
					$.fn.json_beautify = function() {
				    this.each(function(){
			        var el = $(this);
	            var obj = JSON.parse(el.val());
	            var pretty = JSON.stringify(obj, undefined, 4);
			        el.val(pretty);
				    });
					};
					let textArea = $('<textarea cols="81" rows="25"></textarea>').css({'font-size': '26px'});
					$(textArea).val(JSON.stringify(templateDesignElements));
					$(textArea).json_beautify();
					$(wrapperBox).empty().append($(textArea));
				}

				const radalertoption = {
		      title: 'ตัวอย่างเอกสาร',
		      msg: $(wrapperBox),
		      width: wrapperBoxWidth + 'px',
					okLabel:  'มุมมองเท็กซ์',
					cancelLabel: 'ตกลง',
		      onOk: function(evt) {
						let isJSONView = $(wrapperBox).find('textarea');
						if ($(isJSONView).length > 0) {
							let jsonVal = $(isJSONView).val();
							try {
								templateDesignElements = JSON.parse(jsonVal);
							} catch(err) {
								console.log(err);
							}
							doCreatGUIView();
							$(radAlertBox.okCmd).val('มุมมองเท็กซ์');
						} else {
							doCreatJSONView();
							$(radAlertBox.okCmd).val('มุมมองกราฟฟิก');
						}
		      },
					onCancel: function(evt){
						let isJSONView = $(wrapperBox).find('textarea');
						if ($(isJSONView).length > 0) {
							let jsonVal = $(isJSONView).val();
							try {
								templateDesignElements = JSON.parse(jsonVal);
								let newTemplateDesignElements = [{Content: templateDesignElements}];
								doShowTemplateLoaded(shopData, newTemplateDesignElements, templateNameInput, paperSizeSelector, wrapper);
							} catch(err) {
								console.log(err);
							}
						}
	          radAlertBox.closeAlert();
					}
		    }

				doCreatGUIView();
				let radAlertBox = $('body').radalert(radalertoption);
		    //$(radAlertBox.cancelCmd).hide();

				$(radAlertBox.handle).draggable({
					containment: "parent"
				});
			});

			$(saveNewTemplateCmd).on('click', async(evt)=>{
				let paperSize = $(paperSizeSelector).val();
				let templateDesignElements = await doCollectElement(paperSize);
				let templateName = $(templateNameInput).val();
				let templatType = $(templatTypeSelector).val();
				let params = {data: {Name: templateName, TypeId: parseInt(templatType), Content: templateDesignElements, PaperSize: parseInt(paperSize)}, shopId: shopData.id};
				console.log(params);
				let templateRes = await common.doCallApi('/api/shop/template/save', params);
				console.log(templateRes);
        if (templateRes.status.code == 200) {
          $.notify("บันทึกรูปแบบเอกสารสำเร็จ", "success");
        } else if (templateRes.status.code == 201) {
          $.notify("ไม่สามารถบันทึกรูปแบบเอกสารได้ในขณะนี้ โปรดลองใหม่ภายหลัง", "warn");
        } else {
          $.notify("เกิดข้อผิดพลาด ไม่สามารถบันทึกรูปแบบเอกสารได้", "error");
        }
			});

			$(templatTypeSelector).change();

      resolve();
    });
  }

	const doShowTemplateLoaded = function(shopData, templateItems, templateNameInput, paperSizeSelector, wrapper) {
		$(wrapper).empty();
		let elements = templateItems[0].Content;
		const promiseList = new Promise(async function(resolve2, reject2){
			for (let i=0; i < elements.length; i++){
				let element = elements[i];
				let elementType = element.elementType;
				let elementCreated = elementProperty.doCreateElement(wrapper, elementType, element);
			}
			common.delay(900).then(()=>resolve2());
		});
		Promise.all([promiseList]).then((ob)=>{
			$(templateNameInput).val(templateItems[0].Name);
			$(paperSizeSelector).val(templateItems[0].PaperSize).change();
		});
	}

  const onTemplateTypeChange = async function(evt, typeValue, shopData, templateNameInput, paperSizeSelector, wrapper){
		let templateRes = await common.doCallApi('/api/shop/template/list/by/shop/' + shopData.id, {});
		let templateItems = templateRes.Records;
		if (templateItems.length > 0) {
			let typeFilters = await templateItems.filter((template)=>{
				if (typeValue == template.TypeId) {
					return template;
				}
			});
			if (typeFilters.length > 0) {
				doShowTemplateLoaded(shopData, typeFilters, templateNameInput, paperSizeSelector, wrapper);
			} else {
				//doCreateDefualTemplate
				templateRes = await common.doCallApi('/api/shop/template/select/1', {});
				templateItems = templateRes.Records;
				doShowTemplateLoaded(shopData, templateItems, templateNameInput, paperSizeSelector, wrapper);
			}
		} else {
			//doCreateDefualTemplate
			templateRes = await common.doCallApi('/api/shop/template/select/1', {});
			templateItems = templateRes.Records;
			doShowTemplateLoaded(shopData, templateItems, templateNameInput, paperSizeSelector, wrapper);
		}
  }

	const onPaperSizeChange = function(evt, paperSize, shopData, wrapper){
		resetContainer(paperSize);
	}

  return {
    doShowTemplateDesign
	}
}
