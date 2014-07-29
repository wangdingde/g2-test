(function($, $$){

var gridbody = function(UICONTROL, HEADCONTAINER, UTIL, KEYMANAGER, GRIDDATA){
	return {
		
		root: true,
		extend: UICONTROL,
		mixins: [GRIDDATA, KEYMANAGER],
		
		ctor: function(opts) {
			this.maxColLev = 1;
			this.maxColIndex = 0;
			this.sortCols = [];
			this.currs = [];
			this.view = {};
			//this.sortExp = "";
			this._init();
			//log(this);
		},
		domCls: "grid-container",
		_defCfg: {
			supportFocus: true,
			editable: true,
			strip: true,
			fit: true
		},
		TABLESTART: "<table class=\"grid-body-data\" cellspacing=\"0\" cellpadding=\"0\">",
		TABLEEND: "</table>",
		THEADSTART: "<tr class=\"grid-body-data-head\">",
		THEADEND: "</th>",
		
		maxRenderSize: 500,
		
		colHeight: 25,
		
		_init: function(){
			var $dom = $(this.dom);
			
			$dom.append("<div class=\"grid-editor\">"+
				"<table cellspacing=\"0\" cellpadding=\"0\"><tr></tr></table>"+
			"</div>");
			
			this._initColumns();
			this._initEvents();
		},
		
		_initEvents: function(){
			var el = this;
			//????????????????
			this._bindEl();
			
			$(window).bind({
				"resize": function(){
					//$("table.grid-body-data", el.bodyDom).hide();
					if (el.inited) {
						var dataColumns = el.dataColumns;
							
						el.needLoad = false;
						if (el.getRowSize() * dataColumns.length > 2000) {
							if (el._renderTimer) {
								clearTimeout(el._renderTimer);
								el._renderTimer = null;
							}
							el.clearData(true);
							el.needLoad = true;
						}
					}
				}
			});
			
			this.bind({
				"onResized": function(){
					setTimeout(function(){
						if (!el.inited || el.needLoad) {
							el.loadData();
						}
					}, 0);
				}
			});
			
			this.initKeyManager && this.initKeyManager();
		},
		
		_initColumns: function(){
			var columns = this.columns || [],
				col, key, i, len = columns.length,
				obj = {};
				
			var el, viewDom, html, ccols, items,
				dataColumns = [];
			
			//計算col所屬位置，left？right？mian？	
			for (i = 0; i < len; i++) {
				col = columns[i];
				col.locked = col.locked ? true : false;
				col.lockDir = col.lockDir === "right" ? "right" : "left";
				key = col.locked ? col.lockDir : "main";
				
				if (!obj[key]) {
					obj[key] = [];
				}
				
				obj[key].push(col);
			}
			
			//創建col對象
			columns = [];
			for (key in obj) {
				viewDom = this.getView(key);
				el = viewDom.header;
				el.add(obj[key]);
				
				//計算初始化th
				this._calculateThs(el.items, viewDom, dataColumns);
				columns = columns.concat(el.items);
			}
			
			this.columns = columns;
			this.dataColumns = dataColumns;
			//計算oldHtml，保持狀態，方便後續remove恢復
			this._refreshOldHtml();
		},
		_calculateThs: function(columns, viewDom, dataColumns){
			//shift會刪除元素，提前備份
			columns = $.extend([], columns);
			
			var html = "<tr class=\"grid-body-data-head\">",
				ccols, col;
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
			
			$(html).appendTo(".grid-body .grid-body-data", viewDom);
		},
		
		_refreshOldHtml: function(pos){
			var view = this.view, viewBody, viewDom, html,
				head1 = this.TABLESTART + this.THEADSTART,
				head2 = this.THEADEND + this.TABLEEND;
			
			for (key in view) {
				if (!pos || pos === key) {
					viewDom = view[key];
					viewBody = $(viewDom).find(".grid-body");
					html = viewBody.find(".grid-body-data .grid-body-data-head ").html() || "";
					viewDom.oldHtml = head1 + html + head2;
				}
			}
		},
		
		getView: function(pos){
			if (!pos) {
				pos = "mian";
			}
			var view = this.view,
				el = this,
				isMain = pos === "main",
				isRight = pos === "right",
				mth = isMain ? "appendTo": (isRight ? "insertAfter" : "insertBefore"),
				dom = isMain ? $(this.dom)[0] : view["main"],
				css = "grid-view-" + pos,
				viewDom = view[pos];
				
			if (!dom) {
				dom = $(this.dom)[0];
				mth = "appendTo";
			}
			
			if (!viewDom) {
				viewDom = $("<div class=\"grid-view " + css + "\">"+
								"<div class=\"grid-head\"></div>"+
								"<div class=\"grid-body\">"+
									this.TABLESTART + this.TABLEEND +
								"</div>"+
							"</div>")[mth](dom)[0];
				
				viewDom.header = $$.create(HEADCONTAINER, {
					fit: true,
					itemCfg: {
						colLev: 0,
						grid: this
					},
					renderTo: $('.grid-head', viewDom),
					items: []
				});
				
				$(".grid-body", viewDom).bind({
					"scroll": function(){
						el._initViewPos(viewDom);
					}
				});
				
				view[pos] = viewDom;
			}
			
			return viewDom;
		},
		_initViewPos: function(sourceDom){
			var view = this.view, 
				top = $('.grid-body', sourceDom).scrollTop(),
				key, dom;
			
			for (key in view) {
				dom = view[key];
				if (dom !== sourceDom) {
					$('.grid-body', dom).scrollTop(top);
				}
			}
		},
		//修改列所在視圖view
		_changeColView: function(col, dir){
			var view = this.view, key,
				viewDom, viewBody, viewData, viewHead, htr, hth, hthStr,
				met = dir === "main" && col.lockDir !== "right" ? "prependTo" : "appendTo",
				dataCols = col.columns || [col], i, ccols, beforeTh;
				
			viewDom = this.getView(dir);
			viewBody =  $(viewDom).find(".grid-body");
			viewData = viewBody.find("table.grid-body-data");
			viewHead = $(viewDom).find(".grid-head div[xtype='grid.head.Container']").first();
			
			if (!$(viewDom).find(col.dom)[0]) {
				$(col.dom)[met](viewHead);
			}
			
			htr = viewData.find(".grid-body-data-head");
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
			
			var $editor = $(".grid-editor tr", this.dom);
			$(".grid-body-data-head [col-index]", this.dom).each(function(){
				$editor.append($editor.find("[col-index='" + $(this).attr("col-index") + "']"));
			});
			
			this._refreshOldHtml();
			
			this._initMainSize();
		},
		//獲取column對象
		getColumn: function(col){
			if (!col && col !== 0) {
				return null;
			}
			
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
		//獲取所有的tr
		getTrs: function(){
			return this.getTr();
		},
		getTrUid: function(index){
			var tr = this.getTr(index);
			return tr ? Number(tr.attr("uid") || -1) : -1;
		},
		//依據uid獲取tr，一般爲內部使用
		getTrByUid: function(uid){
			if (uid < 0) {
				return null;
			}
			
			return this.findInData("tr[uid='" + uid +"']");
		},
		//依據行index獲取row
		getRow: function(index){
			var row = index;
			
			if (typeof row === "number") {
				var uid = this.getTrUid(row);
				return uid !== -1 ? this.getRowByUid(uid) : null;
			}
			
			return row;
		},
		getRowIndex: function(row){
			if (typeof row === "number") {
				return row;
			}
			row = this.getRow(row);
			
			var tr = this.getTrByUid(this.getRowUid(row));
			
			return tr ? Number(tr.attr("index")) : -1;
		},
		//鎖定
		lock: function(obj, dir, typ){
			if (!typ) {
				typ = "column";
			}
			
			if (typ === "column") {
				this._lockCol(obj, dir);
			}
		},
		//解鎖
		unlock: function(obj, dir, typ){
			if (!typ) {
				typ = "column";
			}
			
			if (typ === "column") {
				this._unlockCol(obj);
			}
		},
		//鎖定列
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
		//解鎖列
		_unlockCol: function(col){
			col = this.getColumn(col);
			
			if (col && col.locked === true) {
				this._changeColView(col, "main");
				
				//修正dcs中的位置
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
		//過濾
		filter: function(filterExp, sender){
			if (this.trigger("onFiltering", sender, filterExp) === false) {
				return;
			}
			
			this.loadData(null, sender);
			
			this.trigger("onFiltered", sender, filterExp);
		},
		//排序
		sort: function(sortExp, sender){
			if (this.trigger("onSorting", sender, sortExp) === false) {
				return;
			}
			this.loadData(null, sender);
			
			this.trigger("onSorted", sender, sortExp);
		},
		getSortExp: function(){
			var sortCols = this.sortCols,
				i = 0, len = sortCols.length,
				col, exp =  "";
			
			for (; i < len; i++) {
				col = sortCols[i];
				exp += (i !== 0 ? "," : "") + col.field + " " + col.sortDir
			}
			
			return exp;
		},
		_sortCol: function(col){
			var sortCols = this.sortCols;
			
			if (sortCols.indexOf(col) === -1) {
				col.sortIdx = sortCols.length;
				sortCols.push(col);
			}
			
			col.sortDir = col.sortDir === "ASC" ? "DESC" : "ASC";
			col.refreshSortView();
			this.sort(this.getSortExp());
		},
		_cancelSortCol: function(col){
			var sortCols = this.sortCols,
				idx = col.sortIdx,
				i = idx, len = sortCols.length, temp;
			
			if (!idx && idx !== 0) {
				return;
			}
			
			for (; i < len; i++) {
				temp = sortCols[i];
				temp.sortIdx--;
				temp.refreshSortView();
			}
			
			col.sortIdx = null;
			col.sortDir = "";
			col.refreshSortView();
			
			sortCols.splice(idx, 1);
			
			this.sort(this.getSortExp());
		},
		pager: function(){
			
		},
		//加載數據
		loadData: function(data, sender){
			var inited = this.inited;
			this.inited = true;
			//？？？？？？？？？？？？？？？
			this._beforeLoadData && this._beforeLoadData(data);
			if (this.trigger("onLoadDataing", sender, data) === false) {
				return;
			}
			
			var currs = this.currs,
				isEditing = this.isInputing(),
				curr = currs && currs.sort ? currs.sort()[0] : null,
				oriIdx;
			
			if (isEditing && curr) {
				oriIdx = this.getRowIndex(curr);
				
				!isNaN(oriIdx) && this.endEdit(oriIdx, true);
			}
			
			if (this._renderTimer) {
				clearTimeout(this._renderTimer);
				this._renderTimer = null;
			}
			
			this.clearData(true);
			//$("table.grid-body-data .grid-body-data-row", this.bodyDom).remove();
			
			var dataColumns = this.dataColumns || [],
				rows;
			rows = this.getRows();
			
			this.loadingCnt++;
			this._renderData(rows, dataColumns);
			
			this.trigger("onLoadDataed", sender, data);
			if (!inited) {
				$(".grid-body", this.dom).scrollTop(0);
			}
			//this.refreshSortView();
		},
		//清除數據
		clearData: function(flag, sender){
			var view = this.view, viewDom, viewBody, key;
			
			if (this.trigger("onClearDataing", sender, flag) === false) {
				return;
			}
			
			for (key in view) {
				viewDom = view[key];
				if (viewDom) {
					viewBody = $(viewDom).find(".grid-body");
					if (viewDom.oldHtml) {
						viewBody.html(viewDom.oldHtml);
					}
				}
			}
			
			this.trigger("onClearDataed", sender, flag);
		},
		regError: function(row, field, errMsg){
			var col = this.getColumn(field),
				dom = this.isInputing() ? this.getTd(this.getRowIndex(row), col) : (col.editor && $(col.editor.input));
			if (!dom) {
				return;
			}
			
			if (errMsg) {
				dom.addClass("grid-td-error").attr("title", errMsg);
			} else {
				dom.removeClass("grid-td-error").attr("title", "");
			}
		},
		regChange: function(row, field, addChg){
			var col = this.getColumn(field),
				dom = this.isInputing() ? this.getTd(this.getRowIndex(row), col) : (col.editor && $(col.editor.input));
			
			if (!dom) {
				return;
			}
			
			if (addChg) {
				dom.addClass("grid-td-change");
			} else {
				dom.removeClass("grid-td-change");
			}
		},
		_getTdContext: function(row, field, val){
			var ds = this.getDataSource(),
				column = this.getColumn(field),
				tpl = column.tpl,
				col = ds.getCol(field),
				context = val !== null && val !== undefined ? val : this.getColumnData(row, field),
				errMsg = "", css;
			
			context = val;
			if ($$.isNull(val)) {
				if (tpl) {
					var matchs = tpl.match(/\$\{[\w]+\}/gi) || [],
						temp = "",
						re_match, i = 0 , len = matchs.length;
					for (; i < len ;i++) {
						if (temp == "") {
							temp = tpl;
						}
						
						var re_match = matchs[i].replace(/[\$\{\}]/gi,"");
						temp = temp.replace(matchs[i], this.getColumnData(row, re_match));
					}
					context = temp;
				} else {
					context = this.getColumnData(row, field);
				}
			}
			
			if ($$.isNull(context)) {
				context = "";
			}
			
			if (column.formatter) {
				context = column.formatter(row, field, context);
			}
			
			if (row && col) {
				//log("getTd===row:"+ row.tid + ";col:"+field+";val:"+val);
				if (row._err.indexOf(col.idx) !== -1) {
					errMsg = row._errmsg[row._err.indexOf(col.idx)];
					css = " grid-td-error";
					//context += "<div class=\"grid-td-tips grid-td-tips-error\" title=\"" + row._errmsg[row._err.indexOf(col.idx)] +"\"></div>";
				} else if (row._upd.indexOf(col.idx) !== -1) {
					css = " grid-td-change";
				}
			}
			
			return {
				context: context,
				css: css,
				errMsg: errMsg
			};
		},
		_tdChanged: function(row, field){
			var ds = this.getDataSource(),
				col = ds.getCol(field);
				
			return row._upd.indexOf(col.idx) !== -1;
		},
		//渲染tr
		_renderTr: function(dataCols, idx, size, rows, callback, flag){
			var el = this,
				view = this.view,
				strip = this.strip,
				trsHtml = {}, trHtml = {}, key,
				len = dataCols.length,
				//rows = rows || this.getDataRows(),
				row, col, val, j, dlen = rows.length,
				//dataHead = $(".grid-body-data .grid-body-data-head", this.dom),
				maxSize = size || this.maxRenderSize || dlen, x, html, uid, oriRow;
			
			if (!idx && idx !== 0) {
				idx = 0;
			}
			
			for (x = 0; x < maxSize; x++, idx++) {
				if (!flag && idx >= dlen) {
					break;
				}
				
				if (flag) {
					row = rows[x];//this.getDataRow(idx, rows);
					uid = row.uid;
					oriRow = this.getRowByUid(uid);
				} else {
					row = rows[idx];//this.getDataRow(idx, rows);
					uid = this.getRowUid(row);
					oriRow = row;
				}
				
				//log("uid:::"+row.tid);
				//row = flag ? rows[x] : rows[idx];//this.getDataRow(idx, rows);
				//uid = row.uid || row.uid === 0 ? row.uid : this.getRowUid(row);
				//row = this.getRowByUid(uid);
				trHtml = {};
				
				for (j = 0; j < len; j++) {
					col = dataCols[j];
					key = col.locked ? (col.lockDir === "right" ? "right" : "left") : "main";
					val = row[col.field];
					val = this._getTdContext(oriRow, col.field, flag ? (val !== null && val !== undefined ? val : "") : undefined);
					
					if (val === null || val === undefined) {
						val = "";
					}
					html = val.context;
					
					if (!trHtml[key]) {
						trHtml[key] = trHtml[key] = "<tr index=" + idx + " uid=\"" + uid + "\" class=\"grid-body-data-row " + (strip && idx%2 === 1 ? "grid-row-stripe" : "") + "\">";
					}
					//$("th[col-index='" + col.index + "']", dataHead).width(w);
					trHtml[key] += "<td field=\"" + col.field +"\" class=\"" + (val.css || "") + "\" title=\"" + (val.errMsg || "") + "\" align=\"" + (col.align || "left") +"\" col-index=\"" + col.index +"\">"+
									"<div style=\"width: "+(col.width-2)+"px;\" title=\"" + html + "\">" +
									html +
									"</div>" +
								"</td>";
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
		//渲染data
		_renderData: function(rows, dataCols, idx){
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
				}, 200);
			} else {
				//el._afterRender();
				this._initDataAreaEvent();
			}
			if (needInited) {
				el._afterRender();
			}
		},
		//渲染之後處理
		_afterRender: function(){
			this._initMainSize();
			this._initViewPos();
			this._initDataAreaEvent();
			this._initSelected();
			if (this.isInputing()) {
				this.beginEdit();
			}
			//this.ttbar && this.ttbar.refreshState();
		},
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
			return this.findInData("tr" + (!rowIndex && rowIndex !== 0 ? "" : "[index='" + rowIndex +"']") + " td"+(col ? "[col-index='" + col.index + "']" : ""));
		},
		//初始化main view的size大小
		_initMainSize: function(width, height){
			var $dom = $(this.dom),
				view = this.view,
				main = view["main"],
				hh = this.maxColLev*(this.colHeight+1), key, dom;
				
			if (!width) {
				width = $dom.width() - $(view["left"]).width() - $(view["right"]).width();
			}
			
			if (!height) {
				height = $dom.height();
			}
			height -= (hh + $(".panel-header", $dom).height() + $(".grid-toolbar-top", $dom).height() + $(".panel-footer", $dom).height() + $(".grid-toolbar-bottom", $dom).height());
			
			width = Math.floor(width);
			height = Math.floor(height);
			
			for (key in view) {
				dom = view[key];
				if (key !== "main") {
					$('.grid-body', dom).height(height);
				} else {
					$(".grid-body", dom).width(width).height(height);
				}
			}
		},
		//初始化view位置（滾動條）
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
			
			this._initEditorPos();
		},
		_initEditorPos: function(index){
			var $editor = $(".grid-editor", this.dom),
				stop = $('.grid-body', this.dom).scrollTop(),
				top = 99999,
				idx = -1, tr;
			if (!index && index !== 0) {
				index = Number($editor.attr("index"));
			}
			if (!isNaN(index) && index >= 0) {
				tr = this.getTr(index);
				top = (index + 1) * tr.outerHeight();
				idx = index;
			}
			
			$editor.attr({index: idx}).css({
				top: top - stop
			});
		},
		//初始化data區域的事件
		_initDataAreaEvent: function(){
			var el = this;
			
			this.dataArea = $(".grid-body table.grid-body-data", this.dom);
			
			this._initTrEvents();
		},
		//初始化tr的事件
		_initTrEvents: function(index){
			var el = this;
			
			this.getTd(index).unbind(".g2ui.grid").bind({
				"click.g2ui.grid": function(){
					el.setToFocus(el.getColumn(Number($(this).attr("col-index"))));
				}
			});
			
			//綁定前解綁防止重複綁定
			this.getTr(index).unbind(".g2ui.grid").bind({
				"mouseover.g2ui.grid": function(){
					el.getTr($(this).attr("index")).addClass("grid-row-over");
				},
				"mouseout.g2ui.grid": function(){
					el.getTr($(this).attr("index")).removeClass("grid-row-over");
				},
				"click.g2ui.grid": function(e){
					var idx = Number($(this).attr("index"));
					//log("123123");
					el.trigger("onClickRowing", el, idx);
					el.select(idx, null, e);
					el.trigger("onClickRowed", el, idx);
					el.focus();
				}
			});
		},
		//初始化選中
		_initSelected: function(){
			var rowSize = this.getRowSize(),
				currs = this.currs || [], curr,
				len = currs.length,
				i, index, inited = false;
				//curr = currs && currs.sort ? currs.sort()[0] : 0;
			if (rowSize === 0) {
				this.select(-1, null, null, true);
				return;
			}
				
			if (len > 0) {
				for (i = 0; i < len; i++) {
					index = this.getRowIndex(currs[i]);
					if (!isNaN(index)) {
						this.select(index, null, {ctrlKey: true}, true);
						inited = true;
					}
				}
				if (!inited) {
					this.currs = [];
					this.select(0, null, null, true);
				}
			} else {
				this.select(0, null, null, true);
			}
		},
		//選中行
		select: function(idx, sender, e, flag){
			var oriRow, row;
			oriRow = row = this.getRow(idx);
			var currs = this.currs,
				isEditing = this.isInputing(),
				curr = currs && currs.sort ? currs.sort()[0] : null,
				_ls, oriIdx;
			//log("row::" + idx);
			if (isEditing && curr) {
				oriIdx = this.getRowIndex(curr);
				!isNaN(oriIdx) && this.endEdit(oriIdx, true);
			}
			
			this.trigger("onSelectRowing", sender, idx, oriRow);
			//log("==========");
			//alert(idx);
			if (row) {
				if (!isEditing && e && e.ctrlKey) {
					if (currs.indexOf(row) === -1) {
						currs.push(row);
					} else if (!flag) {
						return;
					}
					
					this._lastShiftIdx = row;
				} else if (!isEditing && e && e.shiftKey) {
					_ls = this._lastShiftIdx;
					
					if (_ls === row || row === currs[currs.length-1]) {
						return;
					}
					
					if (!_ls && _ls !== 0){
						_ls = row;
					}
					
					var pos = currs.indexOf(_ls),
						_ls = this.getRowIndex(_ls),
						st = idx > _ls ? 1 : -1;
					
					if (pos === -1) {
						return;
					}
					
					currs.splice(pos + 1, currs.length - pos);
					
					while (idx != _ls) {
						_ls += st;
						row = this.getRow(_ls);
						if (currs.indexOf(row) === -1) {
							currs.push(row);
						}
					}
				} else {
					if (!flag && currs.length == 1 && currs[0] == row) {
						return;
					}
					
					currs = this.currs = [row];
					this._lastShiftIdx = row;
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
				
				this._trVisible(idx);
			} else {
				this.currs = [];
				this._lastShiftIdx = null;
			}
			//log(idx);
			this.refreshSelected();
			this.trigger("onSelectRowed", sender, idx, oriRow);
			//TODO ?? ClearFocus
			$(".grid-col-tofocus").removeClass("grid-col-tofocus");
			if (isEditing) { 
				this.beginEdit(idx);
			} else {
				var col = this.toFocused;
				if (col) {
					var td = this.getTd(idx, col);
					td.addClass("grid-col-tofocus");
				}
			}
		},
		_trVisible: function(idx){
			var dom = this.dom,
				tr = this.getTr(idx),
				height = $(".grid-body", dom).height(),
				top = $('.grid-body', dom).scrollTop();
			
			var trh = tr.outerHeight(),
				st = idx*trh,
				end = st + trh,
				scrollTop = null;
			
			if (st-top < 0) {
				scrollTop = idx * trh;
			} else if (end-top > height) {
				scrollTop = ((idx + 1) * trh) - height;
			}
			
			if (scrollTop !== null) {
				$('.grid-body', dom).scrollTop(scrollTop);
			}
		},
		//刷新選中
		refreshSelected: function(){
			var currs = this.currs,
				st = "", i, curr, len = currs.length;
			
			this.getSelected().removeClass("grid-row-selected");
			
			for (i = 0; i < len; i++) {
				st += (i === 0 ? "" : ",") + "tr[index='" + this.getRowIndex(currs[i]) + "']";
			}
			this.findInData(st).addClass("grid-row-selected");
			
			$$.clearSelection();
		},
		//開始編輯
		beginEdit: function(idx, sender){
			var currs = this.currs,
				curr = idx || idx === 0 ? idx : (currs && currs.sort ? currs.sort()[0] : null),
				tr, dataColumns = this.dataColumns || [],
				len = dataColumns.length,
				i, col;
			
			curr = this.getRow(curr);
			idx = this.getRowIndex(curr);
			//this.isEditing = true;
			if (!curr) {
				return;
			}
			if (this.trigger("onBeginEditing", sender, idx, curr) === false) {
				return;
			}
			//alert(idx);
			tr = this.getTr(idx);
			
			if (tr.hasClass("grid-row-editing")) {
				return;
			}
			
			for (i = 0; i < len; i++) {
				col = dataColumns[i];
				col.beginEdit(idx);
				
				var context = this._getTdContext(curr, col.field);
					
				col.editor && $(col.editor.input).removeClass("grid-td-error grid-td-change").addClass(context.css)
					.attr("title", context.errMsg);
			}
			
			this._initEditorPos(idx);
			
			this.getEditing().removeClass("grid-row-editing");
			tr.addClass("grid-row-editing");
			
			this.trigger("onBeginEdited", sender, idx, curr);
		},
		//結束編輯
		endEdit: function(idx, sender){
			if (this.trigger("onEndEditing", sender, idx) === false) {
				return;
			}
			var dataColumns = this.dataColumns || [],
				len = dataColumns.length,
				row = this.getRow(idx),
				i, col;
			//TODO need???
			for (i = 0; i < len; i++) {
				col = dataColumns[i];
				
				var context = this._getTdContext(row, col.field);
				
				this.getTd(idx, col).removeClass("grid-td-error grid-td-change").addClass(context.css)
					.attr("title", context.errMsg).children("div").html(context.context);	
			}
			
			this._initEditorPos(-1);
			var tr = this.getTr(idx);
			tr && tr.removeClass("grid-row-editing");
			
			this.trigger("onEndEdited", sender, idx);
		},
		input: function(row, col, val, sender){
			if (this.trigger("onInputing", sender, row, col, val) === false) {
				return;
			}
			this.setData(row, col, val, this.isInputing(), sender);
			this.trigger("onInputed", sender, row, col, val);
		},
		setData: function(row, col, val, flag, sender){
			//alert(">>>>>"+row);
			row = this.getRow(row);
			col = this.getColumn(col);
			
			if (!row) {
				row = this.currs[0];
			}
			var editor;
			
			if (!row || !col) {
				return;
			}
			if (this.trigger("onSetDataing", sender, row, col, val) === false) {
				return;
			}
			editor = col.editor;
			var context = this._getTdContext(row, col.field, val);
			if (flag && editor) {
				if (editor) {
					editor.setValue(val, col);
					editor.refreshShow();
					$(editor.input).removeClass("grid-td-error grid-td-change").addClass(context.css)
					.attr("title", context.errMsg);
				}
			} else {
				this.getTd(this.getRowIndex(row), col).removeClass("grid-td-error grid-td-change").addClass(context.css)
					.attr("title", context.errMsg).children().html(context.context);
			}
			
			this.trigger("onSetDataed", sender, row, col, val);
		},
		//刪除行
		removeRow: function(index, sender){
			var row = this.getRow(index),
				tr = this.getTr(index);
			//alert(index);
			if (this.trigger("onRemoveRowing", sender, index, row) === false) {
				return;
			}
			
			this._refreshTr(index, null, 1);
			tr.remove();
			
			this.trigger("onRemoveRowed", sender, index, row);
		},
		//標記刪除狀態
		deleteRow: function(index, sender){
			var row = this.getRow(index);
			if (this.trigger("onDeleteRowing", sender, index, row) === false) {
				return;
			}
			
			this.removeRow(index, sender);
			
			this.trigger("onDeleteRowed", sender, index, row);
		},
		//插入行
		insertRow: function(index, rowData, sender){
			if (this.trigger("onInsertRowing", sender, index, rowData) === false) {
				return;
			}
			this._insertTr(index, rowData);
			
			this.trigger("onInsertRowed", sender, index, rowData);
		},
		//在最後插入行
		appendRow: function(rowData, sender){
			this.insertRow(null, rowData, sender);
		},
		//在最前插入行
		prependRow: function(){
			this.insertRow(0, rowData);
		},
		//插入tr
		_insertTr: function(index, rowData){
			var len = this.getTrs().length,
				dataColumns = this.dataColumns || [];
			
			if (index === null || index === undefined) {
				index = len;
			}
			
			this._refreshTr(index, len, 1);
			
			this._renderTr(dataColumns, index, 1, [rowData || {}], null, true);
			this._initTrEvents(index);
		},
		_refreshTr: function(start, end, step){
			var strip = this.strip,
				tr;
			
			if (!start) {
				start = 0;
			}
			
			if (end === null || end === undefined) {
				end = this.getTrs().length;
			}
			
			if (!step) {
				step = 1;
			}
			while (step > 0 ? start < end : start > end) {
				tr = this.getTr(start);
				
				tr.attr("index", start);
				if (strip) {
					tr.toggleClass("grid-row-stripe");
				}
				start += step;
			}
		},
		//doResize
		doResize: function(width, height){
			this._initMainSize(width, height);
			
			$(".grid-editor", this.dom).width(width);
			this._resizeHead(width, height);
			
			//this._resizeBody(width, height);
		},
		//衝算head區域大小
		_resizeHead: function(width, height){
			width -= 3;
			
			var maxLev = this.maxColLev,
				colHeight = this.colHeight,
				_height = maxLev * colHeight,
				sh = _height/maxLev,
				columns = this.columns || [],
				htmlUtil = UTIL.Html,
				scrollSize = htmlUtil.getScrollbarSize(true),
				autoWidth = width - scrollSize.width,
				ww = 0, w = 0,
				offsetSize = 0,
				endCol,
				dataHead = $(".grid-body-data .grid-body-data-head", this.dom),
				$editors = $(".grid-editor", this.dom),
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
						col.width = w;
						$("th[col-index='" + col.index + "']", dataHead).width(w);
						$editors.find("[col-index='" + col.index + "']").width(w);
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
					
					col.width = w;
					$("th[col-index='" + col.index + "']", dataHead).width(w);
					$editors.find("[col-index='" + col.index + "']").width(w);
					
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
				col.width = w;
				$("th[col-index='" + endCol.index + "']", dataHead).width(w);
				$editors.find("[col-index='" + col.index + "']").width(w);
			}
			
			this._refreshOldHtml();
		}
	};
};

var grid = function(PANEL, EDITTOOLBAR){
	return {
		extend: PANEL,
		defBarType: EDITTOOLBAR,
		defBodyType: "grid.GridBody",
		defCfg: {
			minimizable: false,
			collapsible: false,
			closable: false,
			maximizable: false
		},
		ctor: function(){
			$(this.dom).css({
				"overflow": "hidden"
			});
		}
	};
};

$$.loadCss("grid/grid.css", true);

$$.define("grid.GridBody", ["core.UIControl", "grid.head.Container", "core.Util", "grid.Key", "data.GridData"], gridbody);

$$.define("grid.Grid", ["panel.Panel", "tools.EditToolbar"], grid);
	
})(window.jQuery, window.com.pouchen);