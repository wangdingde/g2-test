(function($, $$){

var grid = function(UICONTROL, HEADCONTAINER, UTIL, UNIT){
	return {
		/**
		 * @prototype {Boolean} root 是否登記到根下，即是否直接使用$$.Grid訪問
		 */
		root: true,
		extend: UICONTROL,
		//mixins: [dma],
		/**
		 * @constructor
		 * @param {Object} opts
		 */
		ctor: function(opts) {
			this.maxColLev = 1;
			this.maxColIndex = 0;
			this.sortCols = [];
			this.currs = [];
			this.view = {};
			//this.sortExp = "";
			
			this.init();
		},
		TABLESTART: "<table class=\"grid-body-data\" cellspacing=\"0\" cellpadding=\"0\">",
		TABLEEND: "</table>",
		THEADSTART: "<tr class=\"grid-body-data-head\">",
		THEADEND: "</th>",
		/**
		 * @prototype {Number} [maxRenderSize=500] 最大渲染數量，超過此數量的數據將分段渲染，防止頁面假死
		 * @private
		 */
		maxRenderSize: 500,
		/**
		 * @prototype {Number} [colHeight=25] 列高度
		 * @private
		 */
		colHeight: 25,
		/**
		 * @method _init
		 * grid初始化
		 * 初始化grid
		 * 相關事件
		 * 初始化dom
		 * 初始化列，包括鎖定等狀態
		 * @private
		 */
		_init: function(){
			this._initColumns();
			this._initEvents();
		},
		/**
		 * @method _initEvents
		 * 初始化grid事件
		 * @private
		 */
		_initEvents: function(){
			var el = this;
			
			$(window).bind({
				"resize": function(){
					//$("table.grid-body-data", el.bodyDom).hide();
					if (el.inited) {
						var unit = el.unit,
							dataColumns = el.dataColumns;
							
						el.needLoad = false;
						if (unit && (unit.getRowSize() * dataColumns.length > 2000)) {
							if (el._renderTimer) {
								clearTimeout(el._renderTimer);
								el._renderTimer = null;
							}
							
							el.clearData(true);
							el.needLoad = true;
						}
					}
				},
				"keydown": function(e){
					
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
		},
		/**
		 * @method _initColumns
		 * 初始化columns
		 * @private
		 */
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
				el = $$.create(HEADCONTAINER, {
					itemCfg: {
						colLev: 0,
						grid: this
					},
					fit: true,
					renderTo: $('.grid-head', viewDom),
					grid: this,
					items: obj[key]
				});
				
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
		/**
		 * @method _refreshOldHtml
		 * 刷新登記view部分的原始html，爲清除數據恢復做準備
		 * 當pos不存在時登記所有view，否則登記指定view
		 */
		_refreshOldHtml: function(pos){
			var view = this.view, viewBody, viewDom,
				head1 = this.TABLESTART + this.THEADSTART,
				head2 = this.THEADEND + this.TABLEEND;
			
			for (key in view) {
				if (!pos || pos === key) {
					viewDom = view[key];
					viewBody = $(viewDom).find(".grid-body");
					viewDom.oldHtml = head1 + viewBody.find("grid-body-data grid-body-data-head ").html() + head2;
				}
			}
		},
		/**
		 * @method getView
		 * 獲取或初始化視圖view
		 * @param {String} [pos=main] 獲取view方向，允許的值爲：left,main,right
		 * @return {Object} 返回對於view最外層dom節點
		 * @private
		 */
		getView: function(pos){
			if (!pos) {
				pos = "mian";
			}
			var el = this,
				isMain = pos === "mian",
				isRight = pos === "right",
				mth = isMain ? "appendTo": (isRight ? "insertAfter" : "insertBefore"),
				dom = isMain ? this.dom : view["main"],
				css = "grid-view-" + pos,
				view = this.view, viewDom = view[pos];
				
			if (!viewDom) {
				viewDom = $("<div class=\"grid-view " + css + "\">"+
								"<div class=\"grid-head\"></div>"+
								"<div class=\"grid-body\">"+
									this.TABLESTART + this.TABLEEND +
								"</div>"+
							"</div>")[mth](dom)[0];
				
				$$.create(HEADCONTAINER, {
					fit: true,
					renderTo: $('.grid-head', viewDom),
					items: []
				});
				
				$(".grid-body", viewDom).bind({
					"scroll": function(){
						el._initViewPos(viewDom);
					}
				});
				
				view[pro] = viewDom;
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
		changeColView: function(col, dir){
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
			
			this._refreshOldHtml();
			
			this._initMainSize();
		},
		//獲取column對象
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
		//獲取所有的tr
		getTrs: function(){
			return this.domHelper.getTr();
		},
		//依據行index獲取tr
		getTr: function(index){
			return this.domHelper.getTr(index);
		},
		getTrUid: function(index){
			var tr = this.getTr();
			return Number(tr.attr("uid") || -1);
		},
		//依據uid獲取tr，一般爲內部使用
		getTrByUid: function(uid){
			if (uid < 0) {
				return null;
			}
			
			return this.domHelper.findInData("tr[uid='" + uid +"']");
		},
		//依據行index獲取row
		getRow: function(index){
			var row = index;
			
			if (typeof row === "number") {
				var uid = this.getTrUid(row);
				
				return this.getRowByUid(uid);
			}
			
			return row;
		},
		//依據uid獲取row，一般爲內部使用
		getRowByUid: function(uid){
			var unit = this.unit;
			if (uid < 0 || !unit) {
				return null;
			}
			
			return unit.getRowByUid(uid);
		},
		//鎖定
		lock: function(){
			
		},
		//解鎖
		unlock: function(){
			
		},
		//鎖定列
		lockCol: function(){
			
		},
		//解鎖列
		unlockCol: function(){
			
		},
		//過濾
		filter: function(data){
			
		},
		//排序
		sort: function(data){
			
		},
		pageer: function(){
			
		},
		//加載數據
		loadData: function(data){
			
		},
		//清除數據
		clearData: function(data){
			
		},
		//設置unit
		setUnit: function(){
			
		},
		//創建unit
		createUnit: function(){
			
		},
		//綁定unit
		bindUnit: function(){
			
		},
		//解綁unit
		unbindUnit: function(){
			
		},
		//渲染tr
		renderTr: function(data){
			
		},
		//渲染data
		renderData: function(data){
			
		},
		//渲染之後處理
		afterRender: function(data){
			
		},
		//初始化main view的size大小
		_initMainSize: function(data){
			
		},
		//初始化view位置（滾動條）
		_initViewPos: function(data){
			
		},
		//初始化data區域的事件
		_initDataAreaEvent: function(data){
			
		},
		//初始化tr的事件
		_initTrEvents: function(data){
			
		},
		//初始化選中
		_initSelected: function(data){
			
		},
		//選中行
		select: function(data){
			
		},
		//刷新選中
		refreshSelected: function(data){
			
		},
		//開始編輯
		beginEdit: function(data){
			
		},
		//結束編輯
		endEdit: function(data){
			
		},
		//刪除行
		removeRow: function(data){
			
		},
		//標記刪除狀態
		deleteRow: function(data){
			
		},
		//插入行
		insertRow: function(data){
			
		},
		//在最後插入行
		appendRow: function(data){
			
		},
		//在最前插入行
		prependRow: function(data){
			
		},
		//插入tr
		_insertTr: function(data){
			
		},
		//doResize
		doResize: function(data){
			
		},
		//衝算head區域大小
		_resizeHead: function(data){
			
		}
	};
};

$$.loadCss("grid/grid.css", true);

$$.define("grid.Grid", ["core.UIControl", "grid.head.Container", "core.Util", "data.Store"], grid);
	
})(window.jQuery, window.com.pouchen);