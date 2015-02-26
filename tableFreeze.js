/**
 * @author oscar
 * @date 2015-2-26
 */

/**
 * 
 * 冻结窗口
 * 
 * @param headRows
 *            冻结顶部行数
 * @param footRows
 *            冻结底部行数
 * @param leftColumn
 *            冻结左侧列数
 * @param rightColumn
 *            冻结右侧列数
 *            
 */
$.fn.Freeze = function(headRows, footRows, leftColumn, rightColumn) {

	var table = this;

	var bgcolor = "white";
	var tableDiv = $(table).parent();
	if (tableDiv) {
		var type = tableDiv.get(0);
		if (type) {
			var isDiv = $(type).is("div");
			if (!isDiv) {
				return;
			}
			bgcolor = $(tableDiv).css("background-color") || "white";
		}
	}

	var freeze = {
		head : headRows || 0,
		foot : footRows || 0,
		left : leftColumn || 0,
		right : rightColumn || 0
	};
	var tableCss = $(table).getStyleObject();

	// 复制顶部div层
	var headTableDiv = null;
	if (headRows > 0) {
		headTableDiv = $("<div id='headTableDiv'><table id='headTableTable'><table> </div>");
		tableDiv.append(headTableDiv);

		var css = {
			position : "absolute",
			"background-color" : bgcolor,
			"z-index" : 900,
			left : 0,
			top : 0,
			overflow : "hidden"
		};
		$("#headTableDiv").css(css);
		var newTable = $("#headTableTable");
		$(newTable).css(tableCss);
		copyTable(newTable, table, true, "top", freeze);
		$(newTable).attr("cellpadding", 0);
		$(newTable).attr("cellspacing", 0);
		$(newTable).attr("border", "1px");

		$(newTable).css("width", $(table).css("width"));
		$("#headTableDiv").css("height", $(newTable).outerHeight(true) + 1);

	}

	// 复制左侧div层
	var leftTableDiv = null;
	if (leftColumn > 0) {
		leftTableDiv = $("<div id='leftTableDiv'><table id='leftTableTable' class='dmDataTable' style='border-collapse:collapse;' border='1px'><table></div>");
		tableDiv.append(leftTableDiv);

		var top = 0;
		if (headTableDiv) {
			top = $(headTableDiv).outerHeight(true) - 1;
		}
		var css = {
			position : "absolute",
			"background-color" : bgcolor,
			"z-index" : 800,
			left : 0,
			top : top,
			overflow : "hidden"
		};
		$("#leftTableDiv").css(css);
		var newTable = $("#leftTableTable");
		$(newTable).css(tableCss);

		copyTable(newTable, table, false, "left", freeze);
		$(newTable).attr("cellpadding", 0);
		$(newTable).attr("cellspacing", 0);
		$(newTable).attr("border", "1px");

		$("#leftTableDiv").css("width", $(newTable).css("width") + 1);
		$("#leftTableDiv").css("height", $(newTable).css("height"));
	}

	var crossLeftTopTableDiv = null;
	if (leftColumn && headRows > 0) {

		crossLeftTopTableDiv = $("<div id='crossLeftTopTableDiv'><table id='crossLeftTopTable' class='dmDataTable' ><table></div>");
		tableDiv.append(crossLeftTopTableDiv);
		var css = {
			position : "absolute",
			"background-color" : bgcolor,
			"z-index" : 999,
			left : 0,
			top : 0,
			overflow : "hidden"
		};
		$("#crossLeftTopTableDiv").css(css);
		var newTable = $("#crossLeftTopTable");
		$(newTable).css(tableCss);

		copyTable(newTable, table, null, null, freeze);
		$(newTable).attr("cellpadding", 0);
		$(newTable).attr("cellspacing", 0);
		$(newTable).attr("border", "1px");

		$("#crossLeftTopTableDiv").css("height",
				$(newTable).outerHeight(true) + 1);
		$("#crossLeftTopTableDiv").css("width", $(newTable).css("width"));
	}

	$(tableDiv).scroll(function() {
		var moveY = $(tableDiv).scrollTop();
		var moveX = $(tableDiv).scrollLeft();

		if (headTableDiv) {
			$(headTableDiv).css("top", moveY);
		}
		if (leftTableDiv) {
			$(leftTableDiv).css("left", moveX);
		}
		if (crossLeftTopTableDiv) {
			$(crossLeftTopTableDiv).css("left", moveX);
			$(crossLeftTopTableDiv).css("top", moveY);
		}
	});

};

/**
 * 复制表格
 * 
 * @param toTable
 *            复制到目标的table
 * @param sourceTable
 *            源table
 * @param isRowColumn
 *            true表示复制行,false:表示复制列;需要生成行和列的交叉部分内容时，为null或undefined
 * @param direction
 *            表示方向,top:顶部,foot:底部,left:左,right:右,null或undefined时表示交叉的部分table要复制
 */
var copyTable = function(toTable, sourceTable, isRowColumn, direction, freeze) {
	if (direction < 0) {
		return;
	}
	if (isRowColumn === true) {
		if ("top" === direction) {// 复制顶部行
			var height = 0;
			for ( var i = 0; i < freeze.head; i++) {
				var tr = $(sourceTable).find("tr").eq(i);
				var newTr = tr.clone();
				toTable.append(newTr);
				height += $(tr).outerHeight(true);
			}
			$(toTable).css("height", height);
		}

	} else if (isRowColumn === false) {
		if ("left" !== direction) {// 复制左侧列
			return null;
		}
		copyLeftColumn(toTable, sourceTable, freeze.head, null, freeze.left);

	} else if (isRowColumn == null || isRowColumn == undefined) {

		// 复制顶部和左侧列中交叉的部分
		var canCopy = freeze.left > 0 && freeze.head > 0;

		if (!canCopy) {
			return null;
		}

		var width = 0, height = 0;
		var head = freeze.head;
		var rowColumns = [];

		for ( var r = 0; r < head; r++) {
			var tr = $(sourceTable).find("tr").eq(r);
			var left = freeze.left;

			var newTr = $("<tr></tr>");
			rowColumns[r] = [];
			for ( var col = 0; col < left; col++) {
				var td = $(tr).find("td").eq(col);
				var rs = $(td).attr("rowspan") || 1;
				var cs = $(td).attr("colspan") || 1;
				var rc = {
					"rowIndex" : r,
					"rowspan" : rs,
					"colspan" : cs,
					"preRowIndex" : col - 1
				};
				rowColumns[r][col] = rc;

				var rcol = rowColumns[r - 1];
				if (rcol) {
					for ( var k = 0; k < rcol.length; k++) {
						var rcspan = rcol[k];
						if (rcspan["rowspan"] > 1) {
							left--;
						}
						if (rcspan["colspan"] > 1) {
							left--;
						}
					}
				}
			}
			var maxHeight = height;
			for ( var col = 0; col < left; col++) {
				var td = $(tr).find("td").eq(col);
				$(newTr).append(td.clone());
				var w = $(td).outerWidth(true) || 0;
				var h = $(td).outerHeight(true) || 0;
				maxHeight = maxHeight > h ? maxHeight : h;
				width += w;
			}
			height = maxHeight;
			$(toTable).append(newTr);
		}
		$(toTable).css("width", width);
		$(toTable).css("height", height);
	}
};

var copyLeftColumn = function(toTable, sourceTable, startRows, endRows,
		columnNums) {

	var minWidth = 0;
	var rowNums = $(sourceTable).find("tr").length;

	// preUnit 表示: 前一个记录的结构单元
	var defaultRowspan = {
		"rowIndex" : -1,
		"columnIndex" : -1,
		"rowspan" : 0,
		"preRowIndex" : -1,
		"colspan" : 0
	};
	var rowspans = [];
	rowspans[0] = defaultRowspan;

	var toTableHeight = 0;
	for ( var i = startRows; i < rowNums; i++) {
		var tr = $(sourceTable).find("tr").eq(i);
		if (endRows) {
			if (i >= endRows) {
				break;
			}
		}
		toTableHeight += ($(tr).outerHeight(true) || 0);
		var newTr = $("<tr></tr>");
		var width = 0;
		var columnNum = columnNums;

		for ( var rp = 0; rp < columnNum; rp++) {
			var td = $(tr).find("td").eq(rp);
			var rowspan = $(td).attr("rowspan") || -1;
			var colspan = new Number($(td).attr("colspan") || 0);

			if (rowspan > 1 || colspan > 1) {
				for ( var rl = 0; rl < rowspans.length; rl++) {
					if (rowspans[rl]["rowspan"] == 0) {
						if (rowspans[rl]["rowIndex"] == -1) {
							rowspans[rl]["rowIndex"] = i;
						}

						var pri = -1;
						if (rl > 0) {
							pri = rowspans[rl - 1]["preRowIndex"] || -1;
						}
						rowspans[rl] = {
							"rowIndex" : i,
							"columnIndex" : rp,
							"rowspan" : rowspan,
							"preRowIndex" : pri,
							"colspan" : colspan
						};
					} else {
						// 添加下一个列下标的合并情况
						rowspans[rl]["columnIndex" + rp] = {
							"rowIndex" : i,
							"columnIndex" : rp,
							"rowspan" : rowspan,
							"preRowIndex" : rowspans[rl]["preRowIndex"],
							"colspan" : colspan
						};
					}

				}
			}
			// rowspans.length循环
		}

		for ( var r = 0; r < rowspans.length; r++) {// 判断还有多少个单元格需要生成
			var rsobj = rowspans[r];
			if (rsobj) {
				var rsnum = rsobj["rowspan"] || 0;
				var ri = rsobj["rowIndex"] || -1;
				var rcnum = rsobj["colspan"] || 0;
				if (rcnum > 1 && ri < i) {// && ri != i
					columnNum--;
				}

				var nextColumnIndex = 0;// 下一个列号的情况
				while (nextColumnIndex < columnNum) {
					var nextCol = rsobj["columnIndex" + nextColumnIndex];
					if (nextCol) {
						if (nextCol["rowspan"] > 0 && nextCol["rowIndex"] != i) {
							columnNum--;
						}
						if (nextCol["colspan"] > 0 && ri < i) {
							columnNum--;
						}
					}
					nextColumnIndex++;
				}

				if (ri == i && rcnum > 1) {
					columnNum--;
				}

				if (rsnum > 0 && ri < i) {// 当前行和当前的行号不同时,表示
					columnNum--;
					continue;
				}

				if (ri != i) {
					if (rsnum - 1 < 0) {
						rsobj["rowspan"] = 0;
					}
				}
			}
		}

		for ( var column = 0; column < columnNum; column++) {
			var td = $(tr).find("td").eq(column);
			$(newTr).append(td.clone());
			width += $(td).outerWidth(true);
		}

		for ( var r = 0; r < rowspans.length; r++) {// 每一行处理过后，所有的行rowspan数值都要减1
			var rsobj = rowspans[r];
			if (rsobj) {
				var rsnum = rsobj["rowspan"] || 0;
				if (rsnum > 0) {
					rsobj["rowspan"] = rsnum - 1;
				} else {
					rowspans[r] = defaultRowspan;
				}

				var nextColumnIndex = 0;// 下一个列下标的情况
				while (nextColumnIndex < columnNums) {
					var nextCol = rsobj["columnIndex" + nextColumnIndex];
					if (nextCol) {
						var ncrs = nextCol["rowspan"] || 0;
						var ncnum = nextCol["colspan"] || 0;
						if (ncnum > 0) {
							nextCol["colspan"] = ncnum - 1;
						}
						if (ncrs > 0) {
							nextCol["rowspan"] = ncrs - 1;
						} else {
							nextCol = null;
						}
					}
					nextColumnIndex++;
				}
			}
		}
		if (rowspans[0]) {
			if (rowspans[0]["rowspan"] <= 0) {
				rowspans = [];
				rowspans[0] = defaultRowspan;
			}
		}
		toTable.append(newTr);
		minWidth = minWidth > width ? minWidth : width;
	}
	$(toTable).css("width", minWidth);
	$(toTable).css("height", toTableHeight);
};

/**
 * 复制一个对象的样式
 */
(function($) {
	$.fn.getStyleObject = function() {
		var dom = this.get(0);
		var style;
		var returns = {};
		if (window.getComputedStyle) {
			var camelize = function(a, b) {
				return b.toUpperCase();
			};
			style = window.getComputedStyle(dom, null);
			for ( var i = 0; i < style.length; i++) {
				var prop = style[i];
				var camel = prop.replace(/\-([a-z])/g, camelize);
				var val = style.getPropertyValue(prop);
				returns[camel] = val;
			}
			return returns;
		}
		if (dom.currentStyle) {
			style = dom.currentStyle;
			for ( var prop in style) {
				returns[prop] = style[prop];
			}
			return returns;
		}
		return this.css();
	};
})(jQuery);
