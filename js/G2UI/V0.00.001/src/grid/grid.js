(function($, $$){

var grid = function(uicontrol, headContainer, util, dma){
	return {
		root: true,
		extend: uicontrol,
		mixins: [dma],
		ctor: function(opts) {
			this.maxColLev = 1;
			this.maxColIndex = 0;
			this.sortCols = [];
			this.currs = [];
			this.view = {};
			//this.sortExp = "";
			
			if (!this.styler) {
				this.styler = {};
			}
			
			if (this.width) {
				this.styler.width = this.width;
			}
			
			if (this.height) {
				this.styler.height = this.height;
			}
			
			$(this.dom).addClass("grid-container");
			
			this.init();
			
			//this.loadData();
			var el = this;
			
			$(window).bind({
				"resize": function(){
					//$("table.grid-body-data", el.bodyDom).hide();
					if (el._renderTimer) {
						clearTimeout(el._renderTimer);
						el._renderTimer = null;
					}
					
					el.clearData(true);
				},
				"keydown": function(e){
					
				}
			});
			
			this.bind({
				"onResized": function(){
					setTimeout(function(){
						el.loadData();
						//$("table.grid-body-data", el.bodyDom).show();
					}, 0);
				}
			});
			
			var cols = this.columns, col, ccols, i;
			
			for (i = 0; i < cols.length; i++) {
				col = cols[i];
				ccols = col.columns;
				
				if (col.locked) {
					this.lock(col, col.locked, "column");
				}
				
				if (ccols) {
					cols = cols.concat(ccols);
				}
			}
			
			//this.unlock("phone");
			//this.lock("name");
			//this.lock("phone");
			//this.loadData();
		},
		maxRenderSize: 500,
		colHeight: 25,
		init: function(){
			this._initContainer();
			this._initColumns();
			this._initBody();
			
			//$("table.grid-body-data", this.bodyDom).hide();
			//this.loadData();
		},
		_initContainer: function(){
			//this.gridViewLeft = $("<div class=\"grid-view grid-view-left\"></div>").appendTo(this.dom)[0];
			var el = this,
				view = this.view,
				main = $("<div class=\"grid-view grid-view-main\"></div>").appendTo(this.dom)[0];
				
			view["main"] = main;
			//this.gridViewRight = $("<div class=\"grid-view grid-view-right\"></div>").appendTo(this.dom)[0];
			
			this.headDom = $("<div class=\"grid-head\"></div>").appendTo(main)[0];
			this.bodyDom = $("<div class=\"grid-body\"></div>").appendTo(main)[0];
			
			$(this.bodyDom).bind({
				"scroll": function(){
					el._initViewPos();
				}
			});
			
			//$(this.gridViewLeft).append("<div class=\"grid-head\"></div><div class=\"grid-body\"></div>");
			//$(this.gridViewRight).append("<div class=\"grid-head\"></div><div class=\"grid-body\"></div>");
		},
		_initViewPos: function(sourceDom){
			var view = this.view, 
				sourceDom = sourceDom || view["main"],
				top = $('.grid-body', sourceDom).scrollTop(),
				key, dom;
			
			for (key in view) {
				dom = view[key];
				if (dom !== sourceDom) {
					$('.grid-body', dom).scrollTop(top);
				}
			}
		},
		getTrs: function(){
			return this.domHelper.getTr();
		},
		getTr: function(index){
			return this.domHelper.getTr(index)[0];
		},
		getTrByRow: function(row){
			row = this.data.getRow(row);
			var trs = this.getTrs(),
				tr, i, len = trs.length;
			
			for (i = 0; i < len; i++) {
				tr = trs[i];
				if (tr.row === row) {
					return tr;
				}
			}
			
			return null;
		},
		getRow: function(row){
			if (typeof row === "number") {
				var tr = this.getTr(row);
				
				row =  tr ? tr.row : tr;
			}
			
			return row;
		},
		lock: function(obj, dir, typ){
			if (!typ) {
				typ = "column";
			}
			
			if (typ === "column") {
				this._lockCol(obj, dir);
			}
		},
		unlock: function(obj, typ){
			if (!typ) {
				typ = "column";
			}
			
			if (typ === "column") {
				this._unLockCol(obj);
			}
		},
		_unLockCol: function(col){
			col = this.getColumn(col);
			
			if (col && col.locked === true) {
				this._changeColView(col, "main");
				
				var dcs = this.dataColumns || [], 
					idx = dcs.indexOf(col);
				
				if (idx >= 0) {
					dcs.splice(idx, 1);
					
					if (col.lockDir === "right") {
						dcs.push(col);
					} else {
						dcs.splice(0, 0, col);
					}
				}
				
				col.locked = false;
				col.lockDir === "";
				
				if (this.inited) {
					this.loadData();
				}
			}
		},
		_lockCol: function(col, dir){
			dir = dir === "right" ? "right" : "left";
			col = this.getColumn(col);
			
			if (col && !col.groupCol && !(col.locked === true && col.lockDir === dir)) {
				col.locked = true;
				col.lockDir = dir;
				
				this._changeColView(col, dir);
				
				if (this.inited) {
					this.loadData();
				}
			}
		},
		_changeColView: function(col, dir){
			var view = this.view, key,
				viewDom, viewBody, viewData, viewHead, htr, hth, hthStr,
				met = dir === "main" && col.lockDir !== "right" ? "prependTo" : "appendTo",
				head1 = "<table class=\"grid-body-data\" cellspacing=\"0\" cellpadding=\"0\"><tr class=\"grid-body-data-head\">",
				head2 = "</tr></table>",
				dataCols = col.columns || [col], i, ccols, beforeTh;
				
			viewDom = this.getView(dir);
			viewBody =  $(viewDom).find(".grid-body");
			viewData = viewBody.find("table.grid-body-data");
			viewHead = $(viewDom).find(".grid-head div[xtype='grid.head.Container']").first();
			
			if (!$(viewDom).find(col.dom)[0]) {
				$(col.dom)[met](viewHead);
			}
			
			htr = viewData.find("tr.grid-body-data-head");
			if (!htr[0]) {
				htr = $("<tr class=\"grid-body-data-head\"></tr>").prependTo(viewData);
			}
			
			for (i = 0; i < dataCols.length; i ++) {
				col = dataCols[i];
				ccols = col.columns;
				
				if (ccols) {
					dataCols = dataCols.concat(ccols);
				} else {
					hthStr = "th[col-index='" + col.index + "'][field='" + col.field + "']",
					hth = htr.find(hthStr);
					
					if (beforeTh && i === dataCols.length - 1) {
						met = "insertAfter";
					}
					
					if (!hth[0]) {
						hth = $(hthStr, this.dom)[met](beforeTh || htr);
					}
					
					beforeTh = hth;
					met = "insertBefore";
				}
			}
			
			viewBody[0].oldHtml = head1 + htr.html() + head2;
			
			for (key in view) {
				if (key !== dir) {
					viewDom = view[key];
					viewBody = $(viewDom).find(".grid-body");
					viewBody[0].oldHtml = head1 + viewBody.find("table.grid-body-data tr.grid-body-data-head ").html() + head2;
				}
			}
			
			this._initMainSize();
		},
		getView: function(pos){
			if (!pos || pos === "main") {
				return this.view["main"];
			}
			var el = this,
				pos = pos === "right",
				pro = pos ? "right" : "left",
				mth = pos ? "insertAfter" : "insertBefore",
				css = pos ? "grid-view-right" : "grid-view-left",
				view = this.view, viewDom = view[pro];
				
			if (!viewDom) {
				viewDom = $("<div class=\"grid-view " + css + "\"></div>")[mth](view["main"])[0];
				$(viewDom).append("<div class=\"grid-head\"></div><div class=\"grid-body\"><table class=\"grid-body-data\" cellspacing=\"0\" cellpadding=\"0\"></table></div>");
				
				$$.create(headContainer, {
					fit: true,
					renderTo: $('.grid-head', viewDom),
					items: []
				});
				
				view[pro] = viewDom;
			}
			
			return viewDom;
		},
		_initBody: function(){
			var dataColumns = [],
				columns = $.extend([], this.columns || []),
				dataColumns = [],
				html = "<table class=\"grid-body-data\" cellspacing=\"0\" cellpadding=\"0\"><tr class=\"grid-body-data-head\">",
				col, ccols, i, len, j;
				
			col = columns.shift();
			
			while (col) {
				ccols = col.columns;
				
				if (ccols) {
					columns = ccols.concat(columns);
				} else {
					html += "<th field=\"" + col.field +"\" col-index=\"" + col.index +"\"></th>";
					dataColumns.push(col);
				}
				
				col = columns.shift();
			}
			html += "</tr>";
			
			html += "</table>";
			
			this.dataColumns = dataColumns;
			this.bodyDom.oldHtml = html;
			$(this.bodyDom).html(html);
			
		},
		_initColumns: function(){
			if (this.columns) {
				this.headEl = $$.create(headContainer, {
					itemCfg: {
						colLev: 0,
						grid: this
					},
					fit: true,
					renderTo: this.headDom,
					grid: this,
					items: this.columns
				});
				
				this.columns = this.headEl.items;
			}
		},
		getColumn: function(col){
			if (!this.columns) {
				return null;
			}
			
			if (col.$instance) {
				return col;
			}
			
			var cols = this.columns, col, ccols, i,
				pro = typeof col === "string" ? "field" : "index";
			
			for (i = 0; i < cols.length; i++) {
				c = cols[i];
				ccols = c.columns;
				
				if (c[pro] === col) {
					return c;
				}
				
				if (ccols) {
					cols = cols.concat(ccols);
				}
			}
			
			return null;
		},
		dataBinding: function(unit){
			
		},
		clearData: function(flag){
			//$(this.bodyDom).html(this.dataHeaderHtml);
				
			var view = this.view, viewDom, viewBody, key;
			
			for (key in view) {
				viewDom = view[key];
				if (viewDom) {
					viewBody = $(viewDom).find(".grid-body");
					viewBody.html(viewBody[0].oldHtml);
				}
			}
			
			if (!flag) {
				this.data = [];
			}
		},
		loadData: function(data, sender){
			this.inited = true;
			if (data === this.data) {
				return;
			}
			if (!data) {
				data = this.data;
			} else {
				this.data = data;
			}
			if (!data) {
				return;
			}
			this.trigger("onLoadDataing", sender, data);
			if (this._renderTimer) {
				clearTimeout(this._renderTimer);
				this._renderTimer = null;
			}
			
			this.clearData(true);
			//$("table.grid-body-data .grid-body-data-row", this.bodyDom).remove();
			
			var dataColumns = this.dataColumns || [],
				ud = util.Data, st = this.sortExp, fo = this.filterExp,
				rows;
				
			rows = this.getDataRows();
			
			if (fo) {
				rows = ud.filter(rows, fo);
			}
			
			if (st) {
				rows = ud.sort(rows, st);
			}
			
			this.loadingCnt++;
			this._renderData(rows, dataColumns, null, sender);
			
			this.refreshSortView();
			this.trigger("onLoadDataed", sender, data);
		},
		_bindingSource: function(){
			
		},
		_renderTr: function(dataCols, idx, size, rows, callback, flag){
			var el = this,
				view = this.view,
				strip = this.strip,
				trsHtml = {}, trHtml = {}, key,
				len = dataCols.length,
				rows = rows || this.getDataRows(),
				row, col, j, dlen = rows.length,
				maxSize = size || this.maxRenderSize || dlen, x;
			
			if (!idx && idx !== 0) {
				idx = 0;
			}
			
			for (x = 0; x < maxSize; x++, idx++) {
				if (!flag && idx >= dlen) {
					break;
				}
				
				row = flag ? rows[x] : this.getDataRow(idx, rows);
				trHtml = {};
				
				for (j = 0; j < len; j++) {
					col = dataCols[j];
					key = col.locked ? (col.lockDir === "right" ? "right" : "left") : "main";
					
					if (!trHtml[key]) {
						trHtml[key] = trHtml[key] = "<tr index=" + idx + " class=\"grid-body-data-row " + (strip && idx%2 === 1 ? "grid-row-stripe" : "") + "\">";
					}
					
					trHtml[key] += "<td field=\"" + col.field +"\" col-index=\"" + col.index +"\">" + ((flag ? row[col.field] : this.getCellData(row, col, rows)) || "") + "</td>";
				}
				
				for (key in trHtml) {
					if (!trsHtml[key]) {
						trsHtml[key] = "";
					}
					trsHtml[key] += trHtml[key] + "</tr>";
				}
			}
			
			for (key in trsHtml) {
				$(view[key]).find(".grid-body table.grid-body-data").append(trsHtml[key]);
			}
			
			callback && callback.call(this, idx);
			
			return idx;
		},
		_renderData: function(rows, dataCols, idx, sender){
			var el = this,
				dlen = rows.length,
				needInited = false,
				maxSize = this.maxRenderSize || dlen;
			
			if (!idx) {
				idx = 0;
			}
			needInited = idx === 0;
			
			idx = this._renderTr(dataCols, idx, maxSize, rows);
			
			if (idx < dlen) {
				this._renderTimer = setTimeout(function(){
					el._renderData(rows, dataCols, idx, el.loadingCnt);
				}, 500);
			} else {
				//el._afterRender();
				this._initDataAreaEvent();
			}
			if (needInited) {
				el._afterRender();
			}
		},
		_afterRender: function(){
			this._initMainSize();
			this._initViewPos();
			this._initDataAreaEvent();
			
			this._initSelected();
			
			if (this.isEditing) {
				this.beginEdit();
			}
			
			//this.insertRow(null, {name: "insertedRow" + Math.random().toFixed(2)});
		},
		_initSelected: function(){
			if (this.getDataSize() === 0) {
				return;
			}
			var currs = this.currs || [],
				len = currs.length,
				i;
				//curr = currs && currs.sort ? currs.sort()[0] : 0;
				
			if (len > 0) {
				for (i = 0; i < len; i++) {
					this.select(currs[i], null, {ctrlKey: true}, true);
				}
			} else {
				this.select(0, null, null, true);
			}
		},
		_initDataAreaEvent: function(){
			var el = this,
				dh = this.domHelper;
			
			dh.dataArea = $(".grid-body table.grid-body-data", this.dom);
			
			this._initTrEvents();
		},
		domHelper: {
			dataArea: undefined,
			findInData: function(selector){
				var dr = this.dataArea;
				return dr ? dr.find(selector) : null;
			},
			getTr: function(index){
				return this.findInData("tr[index" + (!index && index !== 0 ? "" : "='" + index + "'") +"]");
			},
			getSelected: function(){
				return this.findInData("tr.grid-row-selected");
			},
			getEditing: function(){
				return this.findInData("tr.grid-row-editing");
			},
			getTd: function(rowIndex, col){
				var dr = this.dataArea;
				return this.findInData("tr[index='" + rowIndex +"'] td.[col-index='" + col.index + "']");
			}
		},
		select: function(idx, sender, e, flag){
			this.trigger("onSelectRowing", sender, idx);
			var currs = this.currs,
				isEditing = this.isEditing,
				curr = currs && currs.sort ? currs.sort()[0] : null,
				_ls;
			
			if (!isEditing && e && e.ctrlKey) {
				if (currs.indexOf(idx) === -1) {
					currs.push(idx);
				} else if (!flag) {
					return;
				}
				this._lastShiftIdx = idx;
			} else if (!isEditing && e && e.shiftKey) {
				_ls = this._lastShiftIdx;
				
				if ((!_ls && _ls !== 0) || _ls === idx || idx === currs[currs.length-1]) {
					return;
				}
				
				var pos = currs.indexOf(_ls),
					st = idx > _ls ? 1 : -1;
				
				if (pos === -1) {
					return;
				}
				
				currs.splice(pos + 1, currs.length - pos);
				
				while (idx != _ls) {
					_ls += st;
					if (currs.indexOf(_ls) === -1) {
						currs.push(_ls);
					}
				}
			} else {
				if (!flag && currs.length == 1 && currs[0] == idx) {
					return;
				}
				currs = this.currs = [idx];
				this._lastShiftIdx = idx;
				
				var bodyDom = this.bodyDom,
					ch = this.colHeight + 1, //存在邊框+1
					top = ch * idx, 
					maxH = $(bodyDom).height(),
					st = $(bodyDom).scrollTop(),
					s, sTop;
				
				s = top - st;
				
				sTop = s < 0 ? top : (s > maxH - ch ? (top -maxH + ch) : null);
				
				if (sTop !== null) {
					$(bodyDom).scrollTop(sTop);
				}
			}
			
			if (isEditing) {
				this.endEdit(curr, true);
			}
			this.refreshSelected();
			this.trigger("onSelectRowed", sender, idx);
			if (isEditing) {
				this.beginEdit();
			}
		},
		refreshSelected: function(){
			var currs = this.currs,
				dh = this.domHelper,
				st = "", i, curr, len = currs.length;
			
			dh.getSelected().removeClass("grid-row-selected");
			
			for (i = 0; i < len; i++) {
				st += (i === 0 ? "" : ",") + "tr[index='" + currs[i] + "']";
			}
			
			dh.findInData(st).addClass("grid-row-selected");
			
			$$.clearSelection();
		},
		_getData: function(){
			return this.data;
		},
		beginEdit: function(idx){
			var currs = this.currs,
				curr = idx || idx === 0 ? idx : (currs && currs.sort ? currs.sort()[0] : null),
				dh = this.domHelper, tr,
				dataColumns = this.dataColumns || [],
				len = dataColumns.length,
				i, col;
				
			if (curr === null) {
				return;
			}
			
			tr = dh.getTr(curr);
			
			if (tr.hasClass("grid-row-editing")) {
				return;
			}
			
			for (i = 0; i < len; i++) {
				col = dataColumns[i];
				col.beginEdit(curr);
			}
			
			this.isEditing = true;
			dh.getEditing().removeClass("grid-row-editing");
			tr.addClass("grid-row-editing");
		},
		insertRow: function(index, rowData){
			this._insertTr(index, rowData, this);
			this.insertDataRow(index, rowData, this);
		},
		_insertTr: function(index, rowData, sender){
			var el = this,
				dh = this.domHelper,
				len = this.getDataRows().length,
				dataColumns = this.dataColumns || [],
				strip = this.strip,
				i, row, tr, ridx;
			
			if (index === null || index === undefined) {
				index = len;
			}
			
			for (i = len - 1; i >= index; i--) {
				tr = dh.getTr(i);
				tr.attr("index", i+1);
				if (strip) {
					tr.toggleClass("grid-row-stripe");
				}
			}
			
			//this.insertDataRow(index, rowData, this);
			this._renderTr(dataColumns, index, 1, [rowData || {}], null, true);
			this._initTrEvents(index);
		},
		_initTrEvents: function(index){
			var el = this,
				dh = this.domHelper;
				
			dh.getTr(index).bind({
				"mouseover": function(){
					dh.getTr($(this).attr("index")).addClass("grid-row-over");
				},
				"mouseout": function(){
					dh.getTr($(this).attr("index")).removeClass("grid-row-over");
				},
				"click": function(e){
					var idx = Number($(this).attr("index"));
					el.trigger("onClickRowing", el, idx);
					el.select(idx, null, e);
					el.trigger("onClickRowed", el, idx);
				}
			});
		},
		appendRow: function(rowData){
			this.insertRow(null, rowData);
		},
		prependRow: function(rowData){
			this.insertRow(0, rowData);
		},
		endEdit: function(idx, flag){
			if (!this.isEditing) {
				return;
			}
			var currs = this.currs,
				curr = idx || idx === 0 ? idx : (currs && currs.sort ? currs.sort()[0] : null),
				dh = this.domHelper, tr,
				dataColumns = this.dataColumns || [],
				len = dataColumns.length,
				i, col;
			
			tr = dh.getTr(curr);
			
			if (!tr.hasClass("grid-row-editing")) {
				return;
			}
			
			for (i = 0; i < len; i++) {
				col = dataColumns[i];
				col.endEdit(idx);
			}
			
			if (!flag) {
				this.isEditing = false;
			}
			tr.removeClass("grid-row-editing");
		},
		filter: function(filterExp){
			if (filterExp === this.filterExp) {
				return;
			}
			
			if (filterExp === undefined) {
				filterExp = this.filterExp;
			} else {
				this.filterExp = filterExp || undefined;
			}
			
			this.loadData();
		},
		sort: function(str){
			if (str === this.sortExp) {
				return;
			}
			
			if (str === undefined) {
				str = this.sortExp;
			} else {
				this.sortExp = str || undefined;
			}
			
			this.loadData();
		},
		refreshSortView: function(){
			var str = this.sortExp,
				sortCols = this.sortCols,
				ss = str ? str.split(",") : [],
				i, len, item, col;
			
			len = sortCols.length;
			for (i = 0; i < len; i++) {
				col = sortCols[i];
				col.sortDir = "";
				col.sortIdx = null;
				
				col.refreshSortView();
			}
			
			sortCols = this.sortCols = [];
			
			len = ss.length;
			try{
				for (var i=0; i < ss.length; i++) {
					item = ss[i] = ss[i].trim().split(" ");
					if (!item[1]) {
						item[1] = "ASC";
					} else {
						item[1] = item[1].toUpperCase();
					}
					
					col = this.getColumn(item[0]);
					if (col) {
						col.sortDir = item[1];
						col.sortIdx = sortCols.length;
						sortCols.push(col);
						
						col.enableSort();
						col.refreshSortView();
					}
				}
			}catch(e){
				throw e;
			}
		},
		beginSort: function(){
			var sortCols = this.sortCols,
				i, col, len = sortCols.length, sortStr = "";
			
			for (i = 0; i < len; i++) {
				col = sortCols[i];
				
				sortStr += (i > 0 ? ", " : "") + col.field + " " + col.sortDir;
			}
			
			this.sortExp = sortStr;
			this.sort();
		},
		_sortCol: function(col){
			var sortCols = this.sortCols;
			
			if (sortCols.indexOf(col) === -1) {
				col.sortIdx = sortCols.length;
				sortCols.push(col);
			}
			
			col.sortDir = col.sortDir === "ASC" ? "DESC" : "ASC";
			this.beginSort();
		},
		_cancelSortCol: function(col) {
			var sortCols = this.sortCols,
				idx = col.sortIdx;
			
			if (!idx && idx !== 0) {
				return;
			}
			
			col.sortIdx = null;
			col.sortDir = "";
			col.refreshSortView();
			
			sortCols.splice(idx, 1);
			
			this.beginSort();
		},
		doResize: function(width, height){
			//$(this.headDom).width(width).height(hh);
			this._initMainSize(width, height);
			
			this._resizeHead(width, height);
			
			this._resizeBody(width, height);
		},
		_initMainSize: function(width, height){
			var $dom = $(this.dom),
				view = this.view,
				hh = this.maxColLev*(this.colHeight+1), key, dom;
				
			if (!width) {
				width = $dom.width() - $(view["left"]).width() - $(view["right"]).width();
			}
			
			if (!height) {
				height = $dom.height();
			}
			
			height -= hh;
			
			$(this.bodyDom).width(Math.floor(width)).height(Math.floor(height));
			
			for (key in view) {
				dom = view[key];
				if (key !== "main") {
					$('.grid-body', dom).height(height);
				}
			}
		},
		_resizeBody: function(width, height){
			
		},
		_resizeHead: function(width, height){
			if (!this.headEl) {
				return;
			}
			
			width -= 3;
			
			var head = this.headEl,
				maxLev = this.maxColLev,
				colHeight = this.colHeight,
				_height = maxLev * colHeight,
				sh = _height/maxLev,
				columns = this.columns || [],
				htmlUtil = util.Html,
				scrollSize = htmlUtil.getScrollbarSize(true),
				autoWidth = width - scrollSize.width,
				ww = 0,
				offsetSize = 0,
				endCol,
				dataHead = $(".grid-body-data .grid-body-data-head", this.dom),
				ccols, i, len, col, lev, h, dom, autoCols = [];
			
			//head.resize();
			//$(".grid-body-data", this.bodyDom).width(autoWidth);
			//$(this.headEl.dom).width(autoWidth);
			
			for (i = 0; i < columns.length; i++) {
				col = columns[i];
				lev = col.colLev;
				dom = col.dom;
				ccols = col.columns;
				
				if (!ccols) {
					//$doms = $doms ? $doms.add(dom) : $(dom);
					endCol = col;
					w = col.width;
					
					if (!w) {
						autoCols.push(col);
					}else {
						if (w < 1) {
							w = w*width;
						}
						
						offsetSize += w - Math.floor(w);
						w = Math.floor(w);
						
						autoWidth -= w;
						
						$(dom).width(w - 1);
						$("th[col-index='" + col.index + "']", dataHead).width(w);
					}
					//size ++;
				}
				
				if (!ccols && (lev + 1 !== maxLev)) {
					h = (maxLev - lev)*sh + (maxLev - lev -1);
					
					$(col.titleDom).css({
						top: (h - colHeight)/2
					});
				} else {
					h = colHeight;
					
					if (ccols) {
						$(dom).height("auto");
						dom = col.outerDom;
					}
				}
				
				$(dom).height(h);
				$(col.titleDom).css({
					height: colHeight + "px",
					"line-height": colHeight + "px"
				});
				
				if (ccols) {
					columns = columns.concat(ccols);
				}
			}
			
			ww = w;
			
			if (autoCols[0]) {
				len = autoCols.length;
				w = autoWidth/len;
				
				offsetSize += (w - Math.floor(w))*len;
				w = Math.floor(w + offsetSize);
				
				for (i=0; i < len; i++) {
					col = autoCols[i];
					$(col.dom).width(w - 1);
					
					$("th[col-index='" + col.index + "']", dataHead).width(w);
					
					if (col === endCol) {
						ww = w;
					}
				}
			}
			if (endCol && offsetSize > 0) {
				dom = endCol.dom;
				w = ww;
				
				w = Math.floor(w + offsetSize);
				
				
				$(dom).width(w - 1);
				$("th[col-index='" + endCol.index + "']", dataHead).width(w);
			}
			
			var view = this.view, viewDom, viewBody,
				arr = ["left", "right"], len = arr.length;
			
			for (i = 0; i < len; i++) {
				viewDom = view[arr[i]];
				if (viewDom) {
					viewBody = $(viewDom).find(".grid-body");
					viewBody[0].oldHtml = "<table class=\"grid-body-data\" cellspacing=\"0\" cellpadding=\"0\"><tr class=\"grid-body-data-head\">" + $(viewDom).find(".grid-body table.grid-body-data tr.grid-body-data-head").html() + "</tr></table>";
				}
			}
			
			this.bodyDom.oldHtml = $(this.bodyDom).html();
		}
	};
};

$$.loadCss("grid/grid.css", true);

$$.define("grid.Grid", ["core.UIControl","grid.head.Container", "core.Util", "data.DataManager"], grid);
	
})(window.jQuery, window.com.pouchen);