(function($, $$){
	
var rc = function(control){
	
	return {
		extend: control,
		ctor: function(opts){ //resultunit column
			this.cname = opts.colName; //name
			this.dtype = opts.dType; //data type [C:string,N:number,D:datetime,T:text,I:image,M:multiMedia]
			this.unit = null; //unit
			this.idx = 0; //index in unit
			this.pri = []; //primary data
			//this.dom = null; //binding dom element (th or input),和showRow()方法一樣不應在這里﹐應該留到綁定器上
		}
	};
	
};

var rr = function(control){
	
	return {
		extend: control,
		ctor : function(opts) { //resultunit row
			this.unit = null; //unit
			this.idx = 0; //index in unit
			this.pidx = 0; //primary data index
			this.tid = -1; //前端專用本行唯一id,新增時由lastTid滾動產生,用于簡化父子查找
			this.pid = -1; //前端專用本行父行的id,新增時取父行id寫入,或執行model.parentRow / childRows時計算寫入。
		},
		getData : function(col) {
			return this.unit.getData(this,col);
		},
		setData : function(col,val) {
			return this.unit.setData(this,col,val);
		},
		parentRow : function() {
			return this.unit.mdl ? this.unit.mdl.parentRow(this) : null;
		},
		childRows : function(child,findAll) {
			return this.unit.mdl ? this.unit.mdl.childRows(this,child,findAll) : [];
		},
		childRelaRows : function(rela,findAll) {
			return this.unit.mdl ? this.unit.mdl.childRelaRows(this,rela,findAll) : [];
		},
		allSubRows : function(includeUser) {
			return this.unit.mdl ? this.unit.mdl.allSubRows(this.unit,this,includeUser) : [this];
		}
	};
	
};

var ru = function(CONTROL, RESULTROW, RESULTCOL, APATER, UTIL){
	
	return {
		extend: CONTROL,
		ctor : function(opts) { //resultunit,
			this.mdl = null; //data model
			this.idx = -1; //index in model
			this.uname = opts.unitName; //name
			this.cols = []; //columns
			this.rows = []; //rows
			this.curr = -1; //current row pos;
			this.ld = false; //is loading
			//this.dom = null; //binding dom element(table or form),留到綁定器上
			this.lastTid = 0; //to generate row's tid
		},
		
		//sortExp 爲undefined時表示按已有的排序處理
		//sortExp 爲null或者空字符串時表示清空排序
		sort: function(sortExp, sender){
			if (sortExp === this.sortExp) {
				return false;
			}
			this.trigger("onSorting", sender, sortExp);
			
			if (sortExp !== undefined) {
				this.sortExp = sortExp || undefined;
			}
			
			this.trigger("onSorted", sender, sortExp);
			
			return true;
		},
		//處理與sort相同
		filter: function(filterExp, sender){
			if (filterExp === this.filterExp) {
				return false;
			}
			this.trigger("onFiltering", sender, filterExp);
			
			if (filterExp !== undefined) {
				this.filterExp = filterExp || undefined;
			}
				
			this.trigger("onFiltered", sender, filterExp);
			
			return true;
		},
		createApater: function(ap){
			if (!ap) {
				ap = this.apater;
			}
			
			if (!ap) {
				return;
			}
			
			if (typeof ap === "string" || ap.$isClass) {
				ap = {xtype: ap};
			} else {
				return ap;
			}
			
			ap = this.apater = $$.create(ap.xtype || APATER, ap);
			
			return ap;
		},
		getRows: function(){
			var rows = this.rows,
				ud = UTIL.Data, st = this.sortExp, fo = this.filterExp;
			
			var punit = this.parent(), prow;
			
			if (punit) {
				prow = punit.getRow(punit.curr);
				rows = prow ? prow.childRows(this) : [];
			}
			
			if (fo) {
				rows = ud.filter(rows, fo);
			}
			
			if (st) {
				rows = ud.sort(rows, st);
			}
			
			return rows;
		},
		getRowByUid: function(uid){
			return this.getRowByTid(uid);
		},
		getRowSize: function(){
			return this.getRows().length;
		},
		loadData : function(obj,clearOld,sender) {
			var apater = this.createApater();
			if (!obj || !apater) {
				return;
			}
			
			this.trigger("onLoadDataing", sender, obj, clearOld);
			
			if(clearOld || obj.c && obj.c instanceof Array) {
				this.clearData();
			}
			
			this.ld = true;
			var rtn = apater.loadData(this, obj,clearOld);
			
			this.ld = false;
			this.trigger("onLoadDataed", sender, rtn);
			return rtn;
		},
		
		getCol : function(col) {
			if (col === -1) {return null;}
			if (typeof col == "string") {
				for(var i = 0; i <this.cols.length; i++) {
					if (this.cols[i].cname == col) {return this.cols[i];}
				}
			} else if (typeof col == "number") {
				return this.cols[col];
			} else if (typeof col == "object") { //col instanceof rc is right ?
				return col;
			}
			return null;
		},
		getColIdx : function(col) {
			if (col == null) {return -1;}
			if (typeof col == "string") {
				for(var i = 0; i <this.cols.length; i++) {
					if (this.cols[i].cname == col) {return i;}
				}
			} else if (typeof col == "object") {
				return col.idx;
			} else if (typeof col == "number") {
				return col;
			}
			return -1;
		},
		getRow : function(row) {
			if (row === -1) {return null;}
			if (typeof row == "number") {
				return this.rows[row];
			} else if (typeof row == "object") {
				return row;
			}
			return null;
		},
		getRowIdx : function(row) {
			if (row == null) {return -1;}
			if (typeof row == "number") {
				return row;
			} else if (typeof row == "object") {
				return row.idx;
			}
			return -1;
		},
		getRowByTid : function(tid) {
			if (tid == null || tid === -1) {return null;}
			for ( var i = 0; i < this.rows.length; i++) {
				if (this.rows[i].tid == tid) {return this.rows[i];}
			}
			return null;
		},
		getData : function(row,col) {
			row = this.getRowIdx(row);
			col = this.getColIdx(col);
			if (row < 0 || row >= this.rows.length || col < 0 || col >= this.cols.length) {return null;}
			return this.cols[col].pri[this.rows[row].pidx];
		},
		getRowData : function(row) {
			row = this.getRow(row);
			if (row == null) {return null;}
			var rtn = {};
			for(var i=0; i<this.cols.length; i++) {
				rtn[this.cols[i].cname] = this.cols[i].pri[row.pidx];
			}
			return rtn;
		},
		getUnitData : function() {
			var rows = this.rows, data = [];
			for(var i = 0, ii = rows.length; i < ii; i++){
				data[i] = this.getRowData(rows[i]);
			}
			return data;
		},
		setData : function(row,col,val,sender) {
			row = this.getRowIdx(row);
			col = this.getColIdx(col);
	//		console.log("=====setData====");
	//		console.log(this.cols[col]);
	//		console.log(val);
			if (row < 0 || row >= this.rows.length || col < 0 || col >= this.cols.length) {return;}
			var oldVal = this.cols[col].pri[this.rows[row].pidx];
			this.cols[col].pri[this.rows[row].pidx] = val;
			//log("onSetDataed===row:" + row + ";col:" + col + ";val:" + val);
			!this.ld && this.trigger("onSetDataed",sender,this.rows[row],this.cols[col],oldVal,val);
		},
		_packCol : function(col) {
			col.unit = this;
			col.idx = this.cols.length;
			this.cols[col.idx] = col;
		},
		addCol : function(cname,jtype) {
			//因使用$$.register框架模式﹐不再使用new﹐統一改用$$.create工廠模式。
			//var col = new rc(cname,jtype);
			var col = $$.create(RESULTCOL, {colName: cname, dType: jtype});
			this._packCol(col);
			return col;
		},
		removeCol : function(col) {
			var idx = this.getColIdx(col);
			this.cols.splice(idx,1);
			for(var i = idx;i < this.cols.length; i++) {
				this.cols[i].idx = i;
			}
		},
		_newRow : function() {
			return $$.create(RESULTROW,{});
		},
		addRow : function(sender) {
			if (this.cols.length <= 0) {return null;}
			var pu = this.parent();
			if (!this.ld && pu != null && pu.curr < 0) {return null;}
			
			if(!this.ld && this.trigger("onAddRowing", sender) === false){return;}
			var row = this._newRow();
			row.unit = this;
			row.idx = this.rows.length;
			this.rows[row.idx] = row;
			var pidx = -1;
			for(var i = 0; i<this.cols.length; i++) {
				if (pidx == -1) {pidx = this.cols[i].pri.length;}
				this.cols[i].pri.length = pidx+1; //increase pri size
			}
			row.pidx = pidx;
			row.tid = this.lastTid++;
			if (!this.ld && pu != null) {
				row.pid = pu.rows[pu.curr].tid;
			}
			//this.setCurrent(row);  //應該放到dataunit的newRow里
			!this.ld && this.trigger("onAddRowed", sender, row);
			return row;
		},
		_clearColData : function(col) {
			col.pri = [];
		},
		clearData : function() {
			for(var i = 0; i<this.cols.length; i++) {
				this._clearColData(this.cols[i]);
			}
			this.rows = [];
			this.curr = -1;
		},
		_loadRow : function(row,col,val) {
			this.setData(row,col,val);
		},
		_loadCols : function(obj) {
			this.cols = [];
			for(var i=0; i<obj.length; i++) {
				this.addCol(obj[i].n,obj[i].t);
			}
		},
		_loadUnit : function(obj) { }, //這里不需要﹐只是為dataunit占位子
		loadJson : function(obj,clearOld,sender) {
			if(clearOld || obj.c && obj.c instanceof Array) {
				this.clearData();
			}
			this.ld = true;
			this.trigger("onloadJsoning",sender,obj);
			this._loadUnit(obj);
			if(obj.c && obj.c instanceof Array) {
				this._loadCols(obj.c);
			}
			var cnt,row,rtn = [];
			if(obj.d && obj.d instanceof Array && obj.d.length > 0) {
				cnt = obj.d[0].p.length;
				for(var i=0; i<cnt; i++) {
					row = this.addRow();
					for(var j=0; j<this.cols.length; j++) {
						this._loadRow(row,j,obj.d[j].p[i]);
					}
					rtn[rtn.length] = row;
				}
			}
			this.ld = false;
			this.trigger("onloadJsoned",sender,rtn);
			return rtn;
		},
		canFind : function(row) { return true; }, //這里都可見﹐datarow那邊刪除的不可見
		findRow : function(edge,cols,vals,excludeRowIdxs,range,findAllState) {
			//edge: [start(含),end(不含)] 或 start(含)。  默認[0,unit.rows.length]
			//cols: [col1,col2,...]
			//vals: [val1,val2,...] col1 = val1 and col2 = val2 ...
			//excludeRowIdxs: [row1,...]
			//range:[row1,row2,...]限定搜索集合。  默認unit.rows
			//findAllState﹕true表示找全部狀態的行﹐false表示不找刪除的行﹐默認false
			if (cols == null || vals == null) {return null;}
			if (!(cols instanceof Array) || !(vals instanceof Array)) {return null;}
			var bgni = 0, endi = this.rows.length;
			if (typeof edge == "number") {bgni=edge;}
			else if (edge instanceof Array && edge.length >= 2) {bgni=edge[0]; endi=edge[1];}
			else if (edge != null) {return null;}
			if (!(excludeRowIdxs instanceof Array)) {excludeRowIdxs = [];}
			if (!(range instanceof Array)) {range = this.rows;}
			if (bgni < 0){bgni = 0;}
			if (endi > range.length) {endi = range.length;}
			var fnd = true, rowidx;
			for(var i = bgni; i < endi; i++) {
				rowidx = this.getRowIdx(range[i]);
				if(excludeRowIdxs.indexOf(rowidx) >= 0 || !(findAllState || this.canFind(rowidx))) {continue;}
				fnd = true;
				for(var j = 0; j < cols.length; j++) {
					if(this.getData(rowidx,cols[j]) != vals[j]) {
						fnd = false;
						break;
					}
				}
				if(fnd) {return this.rows[rowidx];}
			}
			return null;
		},
		findRows : function(edge,cols,vals,excludeRowIdxs,range,findAllState) {
			if (cols == null || vals == null) {return [];}
			if (!(cols instanceof Array) || !(vals instanceof Array)) {return [];}
			var bgni = 0, endi = this.rows.length;
			if (typeof edge == "number") {bgni=edge;}
			else if (edge instanceof Array && edge.length >= 2) {bgni=edge[0]; endi=edge[1];}
			else if (edge != null) {return [];}
			if (!(excludeRowIdxs instanceof Array)) {excludeRowIdxs = [];}
			if (!(range instanceof Array)) {range = this.rows;}
			var fnd = true, rowidx, rtn = [];
			for(var i = bgni; i < endi; i++) {
				rowidx = this.getRowIdx(range[i]);
				if(excludeRowIdxs.indexOf(rowidx) >= 0 || !(findAllState || this.canFind(rowidx))) {continue;}
				fnd = true;
				for(var j = 0; j < cols.length; j++) {
					if(this.getData(rowidx,cols[j]) != vals[j]) {
						fnd = false;
						break;
					}
				}
				if(fnd) {rtn[rtn.length] = this.rows[rowidx];}
			}
			return rtn;
		},
		checkRow : function(row) {	}, //這里不需要﹐只是為datarow占位子
		setCurrent : function(row,sender) {
			var oldRow = this.getRow(this.curr);
			row = this.getRow(row);
			if(this.trigger("onSetCurrenting",sender,oldRow,row) === false){return;}
			if (!this.ld) {	this.checkRow(this.curr); }
			this.curr = this.getRowIdx(row);
			var cus = this.children();
			for (var i=0; i < cus.length; i++) {
				cus[i].trigger("onParentSetCurrented",sender,oldRow,row);
			}
			this.trigger("onSetCurrented",sender,oldRow,row);
		},
		findChildRelation : function(findChild) {
			return this.mdl == null ? [] : this.mdl.findChildRelation(this,findChild);
		},
		parent : function() {
			return this.mdl == null ? null : this.mdl.parent(this);
		},
		children : function() {
			return this.mdl == null ? [] : this.mdl.children(this);
		},
		child : function(rela) {
			return rela == null || rela.pu != this ? null : rela.cu;
		},
		allSubUnits : function() {
			return this.mdl == null ? null : this.mdl.allSubUnits(this);
		},
		updateJson : function() { return null; } //ru無提交功能
	};
	
};

$$.define("data.ResultCol", ["core.Control"], rc);

$$.define("data.ResultRow", ["core.Control"], rr);

$$.define("data.ResultUnit", ["core.Control", "data.ResultRow", "data.ResultCol", "data.Apater", "core.Util"], ru);

})(window.jQuery, window.com.pouchen);