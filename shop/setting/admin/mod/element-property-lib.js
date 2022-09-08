module.exports = function ( jq ) {
	const $ = jq;

	const constant = require('../../../home/mod/constant-lib.js');

	const resetActive = function(element) {
    $(".reportElement").each((index, elem)=>{
      $(elem).removeClass("elementActive");
    })
    $(element).addClass("elementActive");
		//$(element).focus();
		$(element).on('keyup', (e)=> {
			if (e.keyCode == 46){
				removeActiveElement();
			}
		});

    $("#remove-item-cmd").prop('disabled', false);
		let tableElement = $('.tableElement');
		let tableCount = $(tableElement).length;
		if(tableCount >= 1) {
			$('#selectable').find('#table-element-cmd').remove();
		}
		let isTableElement = $(element).hasClass('tableElement');
		let newTrRowCmd = $('<li class="ui-widget-content" id="tr-element-cmd"><img src="/images/list-item-icom.png" class="icon-element"/><span class="text-element">แถวรายการ</span></li>')
		if (isTableElement) {
			if ($('#tr-element-cmd').length == 0) {
				$(newTrRowCmd).data({type: "tr"});
				$('#selectable').append($(newTrRowCmd));
				$('#selectable').find('#td-element-cmd').remove();
				$(newTrRowCmd).on('click', (evt)=>{
					let reportcontainerBox = $("#report-container");
					doCreateElement(tableElement, 'tr');
				});
			}
		} else {
			$('#selectable').find('#tr-element-cmd').remove();
			$('#selectable').find('#td-element-cmd').remove();
		}
		let isTrElement = $(element).hasClass('trElement');
		let newTdColCmd = $('<li class="ui-widget-content" id="td-element-cmd"><img src="/images/list-item-icom.png" class="icon-element"/><span class="text-element">ช่องข้อมูล</span></li>')
		if (isTrElement) {
			if ($('#td-element-cmd').length == 0) {
				$(newTdColCmd).data({type: "td"});
				$('#selectable').append($(newTdColCmd));
				$('#selectable').find('#tr-element-cmd').remove();

				$(newTdColCmd).on('click', (evt)=>{
					let activeRow = $(tableElement).find('.elementActive');
					doCreateElement(activeRow, 'td');
				});
			}
		} else {
			$('#selectable').find('.tdElement').remove();
		}
  }

	const resetPropForm = function(target, data){
    let propform = createElementPropertyForm(target, data);
    $("#report-property").empty();
    $("#report-property").append($(propform));
  }

	const removeActiveElement = function(){
		$(".reportElement").each((index, elem)=>{
			let isActive = $(elem).hasClass("elementActive");
			if (isActive) {
				$(elem).remove();
				$("#remove-item-cmd").prop('disabled', true);
				$("#report-property").empty();
			}
			let tableCount = $('.tableElement').length;
			if(tableCount == 0) {
				let tableElementCmdCount = $('#table-element-cmd').length;
				if(tableElementCmdCount == 0){
					let addTableElementCmd = $('<li class="ui-widget-content" id="table-element-cmd"><img src="/images/item-list-icon.png" class="icon-element"/><span class="text-element">ตารางออร์เดอร์</span></li>')
					$("#selectable").append($(addTableElementCmd));
					$('#tr-element-cmd').remove();
					$('#td-element-cmd').remove();
					$(addTableElementCmd).on('click', (evt)=>{
						let reportcontainerBox = $("#report-container");
						doCreateElement(reportcontainerBox, 'table');
					});
				}
			}
		});
	}

  const elementSelect = function(event, data){
		if ((event) && (event.target)) {
    	resetActive(event.target);
    	let prop = data.options;
    	resetPropForm(event.target, prop);
		}
  }
  const elementDrop = function(event, data){
		if ((data) && (data.options)) {
    	let prop = data.options;
    	resetPropForm(event.target, prop);
		}
  }
  const elementResizeStop = function(event, data){
		if ((data) && (data.options)) {
	    let prop = data.options;
	    resetPropForm(event.target, prop);
		}
  }

	const doCreateElement = function(wrapper, elemType, prop){
    let defHeight = 50;
    switch (elemType) {
      case "text":
        var textTypeLength = $(".textElement").length;
        var oProp;
        if (prop) {
          oProp = {
            x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id, type: prop.type, title: prop.title,
            fontsize: prop.fontsize,
            fontweight: prop.fontweight,
            fontstyle: prop.fontstyle,
            fontalign: prop.fontalign
          };
        } else {
          defHeight = 50;
          oProp = {x:0, y: (defHeight * textTypeLength),
            width: '150', height: defHeight,
            id: 'text-element-' + (textTypeLength + 1),
            title: 'Text Element ' + (textTypeLength + 1)
          }
        }
        oProp.elementselect = elementSelect;
        oProp.elementdrop = elementDrop;
        oProp.elementresizestop = elementResizeStop;
        var textbox = $( "<div></div>" );
        $(textbox).textelement( oProp );
        $(wrapper).append($(textbox));
				return $(textbox).css({'position': 'absolute'});
      break;
      case "hr":
        var hrTypeLength = $(".hrElement").length;
        var oProp;
        if (prop) {
          oProp = {x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id};
        } else {
          defHeight = 20;
					let parentWidth = $(wrapper).width();
          oProp = {x:0, y: (defHeight * hrTypeLength),
            width: parentWidth.toString(),
						height: defHeight,
            id: 'hr-element-' + (hrTypeLength + 1)
          }
        }
        oProp.elementselect = elementSelect;
        oProp.elementdrop = elementDrop;
        oProp.elementresizestop = elementResizeStop;
        var hrbox = $( "<div><hr/></div>" );
        $(hrbox).hrelement( oProp );
        $(wrapper).append($(hrbox));
				return $(hrbox).css({'position': 'absolute'});
      break;
      case "image":
        var imageTypeLength = $(".imageElement").length;
        var oProp;
        if (prop) {
          oProp = {x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id, url: prop.url};
        } else {
          defHeight = 60;
          oProp = {x:0, y: (defHeight * imageTypeLength),
            width: '100', height: defHeight,
            id: 'image-element-' + (imageTypeLength + 1),
            url: '../../icon.png'
          }
        }
        oProp.elementselect = elementSelect;
        oProp.elementdrop = elementDrop;
        oProp.elementresizestop = elementResizeStop;
        var imagebox = $( "<div></div>" )
        $(imagebox).imageelement( oProp );
        $(wrapper).append($(imagebox));
				return $(imagebox).css({'position': 'absolute'});
      break;
			case "table":
				var tableTypeLength = $(".tableElement").length;
				let tableBox = undefined;
				//console.log(imageTypeLength);
				if (tableTypeLength == 0) {
					var oProp;
					if (prop) {
						tableBox = doCreateTable(wrapper, prop.rows, prop.x, prop.y);
					} else {
						tableBox = doCreateTable(wrapper, constant.defaultTableData);
					}
				}
				return $(tableBox).css({'position': 'absolute'});
			break;
			case "tr":
				var trLength = $(".trElement").length;
				var oProp;
				if (prop) {
					oProp = {'backgroundColor': prop.backgroundColor};
				} else {
					oProp = {/*x:0, y: (defHeight * imageTypeLength),
						width: '100%', height: defHeight,
						*/
						'backgroundColor': '#ddd',
						id: 'tr-element-' + (trLength + 1)
					}
				}
				//}
				oProp.elementselect = elementSelect;
				oProp.elementdrop = elementDrop;
				oProp.elementresizestop = elementResizeStop;
				var trbox = $('<div></div>');
				$(trbox).trelement( oProp );
				$(wrapper).append($(trbox));
				$(trbox).click();
				return $(trbox);
			break;
			case "td":
				var tdLength = $(".tdElement").length;
				var oProp;
				if (prop) {
					oProp = {x: prop.x, y: prop.y, width: prop.width, height: prop.height, id: prop.id};
				} else {
					//defHeight = 60;
					oProp = {
						'width': '90', 'height': '35',
						id: 'td-element-' + (tdLength + 1)
					}
				}
				//}
				oProp.elementselect = elementSelect;
				oProp.elementdrop = elementDrop;
				oProp.elementresizestop = elementResizeStop;
				var tdbox = $('<span></span>');
				$(tdbox).tdelement( oProp );
				$(wrapper).append($(tdbox));
				$(wrapper).click();
				return $(tdbox);
			break;
    }
  }

	const doCreateTable = function(wrapper, tableData, x, y){
		let wrapperWidth = $(wrapper).width();
		let tableProp = {id: 'table-element-1', x: x?x:0, y: y?y:60, width: '100%', cols: 5};
		tableProp.elementselect = elementSelect;
		tableProp.elementdrop = elementDrop;
		tableProp.elementresizestop = elementResizeStop;
		let rowWidth = wrapperWidth * 0.95;
		let tableBox = $('<div></div>').tableelement( tableProp );
		$(wrapper).append($(tableBox));
		$(tableBox).click();
		for (let i=0; i < tableData.length; i++){
			let row = tableData[i];
			let rowProp = {id: row.id};
			if (row.class){
				rowProp.class = row.class;
			}
			if (row.backgroundColor) {
				rowProp.backgroundColor = row.backgroundColor;
			}
			rowProp.elementselect = elementSelect;
			rowProp.elementdrop = elementDrop;
			rowProp.elementresizestop = elementResizeStop;
			let rowBox = $('<div></div>').trelement( rowProp );
			$(tableBox).append($(rowBox));
			$(rowBox).click();
			for (let j=0; j < row.fields.length; j++){
				let field = row.fields[j];
				let cellProp = {id: field.id, height: '35', cellData: field.cellData, fontweight: field.fontweight, fontalign: field.fontalign};
				let percentValue = field.width.slice(0, (field.width.length-1));
				cellProp.width = (rowWidth * (percentValue/100)).toFixed(2);
				cellProp.elementselect = elementSelect;
				cellProp.elementdrop = elementDrop;
				cellProp.elementresizestop = elementResizeStop;
				let cellBox = $('<div></div>').tdelement( cellProp );
				$(rowBox).append($(cellBox));
				$(cellBox).click();
			}
		}
		return $(tableBox);
	}

  function createPropEditFragment(fragParent, fragTarget, key, label, oValue, type){
    let fragProp = $("<tr></tr>");
    $(fragProp).appendTo($(fragParent));
    let fragLabel = $("<td align='left'>" + label + "</td>");
    $(fragLabel).appendTo($(fragProp));
    let fragValue = $("<input type='text' size='8'/>");
    $(fragValue).val(oValue);
    $(fragValue).on('keyup', (e)=> {
      if (e.keyCode == 13){
        let value = $(e.currentTarget).val();
        if (!(isNaN(value))) {
          let targetData = $(fragTarget).data();
          switch (type) {
            case "text":
              targetData.customTextelement.options[key] = value;
              targetData.customTextelement.options.refresh();
            break;
            case "hr":
              targetData.customHrelement.options[key] = value;
              targetData.customHrelement.options.refresh();
            break;
            case "image":
              targetData.customImageelement.options[key] = value;
              targetData.customImageelement.options.refresh();
            break;
						case "table":
              targetData.customTableelement.options[key] = value;
              targetData.customTableelement.options.refresh();
            break;
						case "tr":
              targetData.customTrelement.options[key] = value;
              targetData.customTrelement.options.refresh();
            break;
						case "td":
              targetData.customTdelement.options[key] = value;
              targetData.customTdelement.options.refresh();
            break;
          }
        } else {
          $(e.currentTarget).css({border: "2px solid red"})
        }
      }
    });
    let fragEditor = $("<td align='left'></td>");
    $(fragEditor).append($(fragValue));
    $(fragValue).appendTo($(fragProp));
    return $(fragProp);
  }

  function createPropContentFragment(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
    //console.log(targetData);
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}
    let fragProp = $("<tr></tr>");
    $(fragProp).appendTo($(fragParent));
    let fragLabel = $("<td align='left'>Type</td>");
    $(fragLabel).appendTo($(fragProp));
    let fragValue = $("<select><option value='static'>Static</option><option value='dynamic'>Dynamic</option></select>");
    let contentLabelFrag, contentDataFrag, updateContentCmdFrag;
    let dynamicFrag;

		let billFieldOptions = JSON.parse(localStorage.getItem('billFieldOptions'));

    $(fragValue).on('change', ()=> {
      let newValue = $(fragValue).val();
      if (newValue === 'static') {
        targetData[elementDataName].options['type'] = 'static';
        $(dynamicFrag).remove();

        contentLabelFrag = $("<tr></tr>");
        $(contentLabelFrag).appendTo($(fragParent));
        let contentlabel = $("<td colspan='2' align='left'>Text</td>");
        $(contentlabel).appendTo($(contentLabelFrag));

        contentDataFrag = $("<tr></tr>");
        $(contentDataFrag).appendTo($(fragParent));
        let textEditorFrag = $("<td colspan='2' align='left'></td>");
        $(textEditorFrag).appendTo($(contentDataFrag));
        let textEditor = $("<input type='text'/>").css({'width': '60px'});
        $(textEditor).css({"width": "98%"});

				if (data.elementType == 'text') {
					$(textEditor).val(data.title);
				} else if (data.elementType == 'td') {
					$(textEditor).val(data.cellData);
				}
        $(textEditor).appendTo($(textEditorFrag));
        updateContentCmdFrag = $("<tr></tr>");
        $(updateContentCmdFrag).appendTo($(fragParent));
        let updateCmdFrag = $("<td colspan='2' align='right'></td>");
        $(updateCmdFrag).appendTo($(updateContentCmdFrag));
				$(textEditor).on('keyup', (e)=> {
					let newContent = $(textEditor).val();
					if (data.elementType == 'text') {
          	targetData[elementDataName].options['title'] = newContent;
					} else if (data.elementType == 'td') {
						targetData[elementDataName].options['cellData'] = newContent;
					}
          targetData[elementDataName].options.refresh();
				});
      } else if (newValue === 'dynamic') {
        targetData[elementDataName].options['type'] = 'dynamic';
        $(contentLabelFrag).remove();
        $(contentDataFrag).remove();
        $(updateContentCmdFrag).remove();

        dynamicFrag = $("<tr></tr>");
        $(dynamicFrag).appendTo($(fragParent));

        let dynamicFieldlabel = $("<td align='left'>Field</td>");
        $(dynamicFieldlabel).appendTo($(dynamicFrag));

        let dynamicFieldValue = $("<td align='left'></td>");
        $(dynamicFieldValue).appendTo($(dynamicFrag));

        let dynamicFieldOption = $("<select></select>");
        $(dynamicFieldOption).appendTo($(dynamicFieldValue));
				if ((targetData[elementDataName].options.elementType == 'text') || (targetData[elementDataName].options.elementType == 'td')) {
	        billFieldOptions.forEach((item, i) => {
	          $(dynamicFieldOption).append("<option value='" + item.name_en + "'>" + item.name_th + "</option>");
	        });
				}
        $(dynamicFieldOption).on('change', ()=> {
          let newContent = $(dynamicFieldOption).val();
					if (data.elementType == 'text') {
          	targetData[elementDataName].options['title'] = '$' + newContent;
					} else if (data.elementType == 'td') {
						targetData[elementDataName].options['cellData'] = '$' + newContent;
					}
          targetData[elementDataName].options.refresh();
        });
				if (data.elementType == 'text') {
					if (data.title) {
						let currentVal = data.title.substring(1);
						$(dynamicFieldOption).val(currentVal).change();
					}
				} else if (data.elementType == 'td') {
					if (data.cellData) {
						let currentVal = data.cellData.substring(1);
						$(dynamicFieldOption).val(currentVal).change();
					}
				}
      }
    });
    let fragEditor = $("<td align='left'></td>");
    $(fragEditor).append($(fragValue));
    $(fragValue).appendTo($(fragProp));
    $(fragValue).val(data.type).change();
    return $(fragProp);
  }

  function createFontSizeFragment(fragParent, fragTarget, data) {
    const fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30,32, 34, 36, 38, 40];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}
    let fragFontSize = $("<tr></tr>");
    $(fragFontSize).appendTo($(fragParent));
    let fragFontSizeLabel = $("<td align='left'>Font Size</td>");
    $(fragFontSizeLabel).appendTo($(fragFontSize));
    let fragFontSizeOption = $("<td align='left'></td>");
    $(fragFontSizeOption).appendTo($(fragFontSize));
    let fragFontSizeValue = $("<select></select>");
    $(fragFontSizeValue).appendTo($(fragFontSizeOption));
    fontSizes.forEach((item, i) => {
      $(fragFontSizeValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontSizeValue).on('change', ()=>{
      let newSize = $(fragFontSizeValue).val();
			targetData[elementDataName].options['fontsize'] = newSize;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontSizeValue).val(data.fontsize).change();
    return $(fragFontSize);
  }

  function createFontWeightFragment(fragParent, fragTarget, data) {
    const fontWeight = ["normal", "bold"];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}

    let fragFontWeight = $("<tr></tr>");
    $(fragFontWeight).appendTo($(fragParent));
    let fragFontWeightLabel = $("<td align='left'>Font Weight</td>");
    $(fragFontWeightLabel).appendTo($(fragFontWeight));

    let fragFontWeightOption = $("<td align='left'></td>");
    $(fragFontWeightOption).appendTo($(fragFontWeight));
    let fragFontWeightValue = $("<select></select>");
    $(fragFontWeightValue).appendTo($(fragFontWeightOption));
    fontWeight.forEach((item, i) => {
      $(fragFontWeightValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontWeightValue).on('change', ()=>{
      let newWeight = $(fragFontWeightValue).val();
      targetData[elementDataName].options['fontweight'] = newWeight;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontWeightValue).val(data.fontweight).change();
    return $(fragFontWeight);
  }

  function createFontStyleFragment(fragParent, fragTarget, data) {
    const fontStyle = ["normal", "italic"];

    let targetData = $(fragTarget).data();
		let elementDataName = undefined;
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}
    let fragFontStyle = $("<tr></tr>");
    $(fragFontStyle).appendTo($(fragParent));
    let fragFontStyleLabel = $("<td align='left'>Font Style</td>");
    $(fragFontStyleLabel).appendTo($(fragFontStyle));

    let fragFontStyleOption = $("<td align='left'></td>");
    $(fragFontStyleOption).appendTo($(fragFontStyle));
    let fragFontStyleValue = $("<select></select>");
    $(fragFontStyleValue).appendTo($(fragFontStyleOption));
    fontStyle.forEach((item, i) => {
      $(fragFontStyleValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontStyleValue).on('change', ()=>{
      let newStyle = $(fragFontStyleValue).val();
      targetData[elementDataName].options['fontstyle'] = newStyle;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontStyleValue).val(data.fontstyle).change();
    return $(fragFontStyle);
  }

  function createFontAlignFragment(fragParent, fragTarget, data) {
    const fontAlign = ["left", "center", "right"];

    let targetData = $(fragTarget).data();
		if (data.elementType == 'text') {
			elementDataName = 'customTextelement';
		} else if (data.elementType == 'td') {
			elementDataName = 'customTdelement';
		}

    let fragFontAlign = $("<tr></tr>");
    $(fragFontAlign).appendTo($(fragParent));
    let fragFontAlignLabel = $("<td align='left'>Align</td>");
    $(fragFontAlignLabel).appendTo($(fragFontAlign));

    let fragFontAlignOption = $("<td align='left'></td>");
    $(fragFontAlignOption).appendTo($(fragFontAlign));
    let fragFontAlignValue = $("<select></select>");
    $(fragFontAlignValue).appendTo($(fragFontAlignOption));
    fontAlign.forEach((item, i) => {
      $(fragFontAlignValue).append("<option value='" + item + "'>" + item + "</option>");
    });
    $(fragFontAlignValue).on('change', ()=>{
      let newAlign = $(fragFontAlignValue).val();
      targetData[elementDataName].options['fontalign'] = newAlign;
      targetData[elementDataName].options.refresh();
    });
    $(fragFontAlignValue).val(data.fontalign).change();
    return $(fragFontAlign);
  }

  function createPropImageSrcFragment(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
    let fragImageSrc = $("<tr></tr>");
    $(fragImageSrc).appendTo($(fragParent));
    let fragImageSrcLabel = $("<td align='left'>Image Url</td>");
    $(fragImageSrcLabel).appendTo($(fragImageSrc));

    let fragImageSrcInput = $("<td align='left'><input type='text' id='urltext' size='10' value='" + data.url + "'/></td>");
    $(fragImageSrcInput).appendTo($(fragImageSrc));

    let openSelectFileCmd = $("<input type='button' value=' ... ' />");
    $(openSelectFileCmd).appendTo($(fragImageSrcInput));
    $(openSelectFileCmd).on('click', (evt) => {
      let fileBrowser = $('<input type="file"/>');
      $(fileBrowser).attr("id", 'fileupload');
      $(fileBrowser).attr("name", 'imagetemplate');
      $(fileBrowser).attr("multiple", true);
      $(fileBrowser).css('display', 'none');
      $(fileBrowser).on('change', function(e) {
        const defSize = 10000000;
        var fileSize = e.currentTarget.files[0].size;
        var fileType = e.currentTarget.files[0].type;
        if (fileSize <= defSize) {
          var uploadUrl = "/api/shop/upload/image/template";
          $('#fileupload').simpleUpload(uploadUrl, {
            progress: function(progress){
  						console.log("ดำเนินการได้ : " + Math.round(progress) + "%");
  					},
            success: function(uploaddata){
  						//console.log('Uploaded.', uploaddata);
              var imageUrl = uploaddata.link;
              $("#urltext").val(imageUrl);
              targetData.customImageelement.options['url'] = imageUrl;
              targetData.customImageelement.options.refresh();
            }
          });
					$(fragTarget).click();
        }
      });
      $(fileBrowser).appendTo($(fragImageSrcInput));
      $(fileBrowser).click();
    });
    return $(fragImageSrc);
  }

	const createTablePropFragment = function(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
		if (targetData.customTableelement) {
			let fragCols = $("<tr></tr>");
			$(fragParent).append($(fragCols));
			$(fragCols).append($('<td align="left">จำนวนคอลัมน์</td>'));
			let colsInput = $('<input type="number"/>').css({'width': '50px'});
			$(colsInput).on('keyup', (e)=> {
				if (e.keyCode == 13){
					let newValue = $(colsInput).val();
					targetData.customTableelement.options['cols'] = newValue;
					targetData.customTableelement.options.refresh();
				}
			});
			$(colsInput).val(targetData.customTableelement.options['cols']);
			let colsFieldValue = $('<td align="left"></td>');
			$(colsFieldValue).append($(colsInput));
			$(fragCols).append($(colsFieldValue));
			/*
				ควบคุมการแสดงเส้นขอบ border ของตาราง
			*/
			return $(fragCols);
		} else return;
	}

	const createTrPropFragment = function(fragParent, fragTarget, data) {
    let targetData = $(fragTarget).data();
		if (targetData.customTrelement) {
			let fragRow = $("<tr></tr>");
			$(fragParent).append($(fragRow));
			$(fragRow).append($('<td align="left">สีพื้นหลัง</td>'));
			let colorInput = $('<input type="text"/>').css({'width': '70px'});
			$(colorInput).on('keyup', (e)=> {
				if (e.keyCode == 13){
					let newValue = $(colorInput).val();
					targetData.customTrelement.options['backgroundColor'] = newValue;
					targetData.customTrelement.options.refresh();
				}
			});
			$(colorInput).val(targetData.customTrelement.options['backgroundColor']);
			let colorFieldValue = $('<td align="left"></td>');
			$(colorFieldValue).append($(colorInput));
			$(fragRow).append($(colorFieldValue));
			return $(fragRow);
		} else {
			return;
		}
	}

  const createElementPropertyForm = function(target, data) {
    let formbox = $("<table width='100%' cellspacing='0' cellpadding='2' border='0'></table>");
    $(formbox).append("<tr><td align='left' width='40%'>id</td><td align='left' width='*'>" + data.id + "</td></tr>");
    if ((data.elementType === 'text') || (data.elementType === 'td')) {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
      let contentProp = createPropContentFragment(formbox, target, data);
      let contentFontSize = createFontSizeFragment(formbox, target, data);
      let contentFontWeight = createFontWeightFragment(formbox, target, data);
      let contentFontStyle = createFontStyleFragment(formbox, target, data);
      let contentFontAlign = createFontAlignFragment(formbox, target, data);
		} else if (data.elementType === 'hr') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
    } else if (data.elementType === 'image') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
      let imageSrcProp = createPropImageSrcFragment(formbox, target, data);
		} else if (data.elementType === 'table') {
			let topProp = createPropEditFragment(formbox, target, 'y', 'Top', data.y, data.elementType);
	    let leftProp = createPropEditFragment(formbox, target, 'x', 'Left', data.x, data.elementType);
	    let widthProp = createPropEditFragment(formbox, target, 'width', 'Width', data.width, data.elementType);
	    let heightProp = createPropEditFragment(formbox, target, 'height', 'Height', data.height, data.elementType);
			let tableProp = createTablePropFragment(formbox, target, data);
		} else if (data.elementType === 'tr') {
			let trProp = createTrPropFragment(formbox, target, data);
    }
    return $(formbox);
  }


  return {
		resetActive,
		resetPropForm,
		removeActiveElement,
		elementSelect,
		elementDrop,
		elementResizeStop,
		doCreateElement,

  	createElementPropertyForm

	}
}
