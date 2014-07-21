(function($, $$){
	
var store = function(CONTROL, UTIL){
	
	return {
		extend: CONTROL,
		//override
		_getAllRows: function(){
			var data = this.data,
				rows = data ? (data.rows || data) : [];
				
			return rows;
		},
		getRows: function(){
			var rows = this._getAllRows(),
				ud = UTIL.Data, st = this.sortExp, fo = this.filterExp;
			
			if (fo) {
				rows = ud.filter(rows, fo);
			}
			
			if (st) {
				rows = ud.sort(rows, st);
			}
			
			return rows;
		},
		sort: function(str){
			if (str === this.sortExp) {
				return false;
			}
			
			if (str === undefined) {
				str = this.sortExp;
			} else {
				this.sortExp = str || undefined;
			}
			
			return true;
		},
		clearSort: function(){
			this.sortExp = undefined;
		},
		filter: function(filterExp){
			if (filterExp === this.filterExp) {
				return false;
			}
			
			if (filterExp === undefined) {
				filterExp = this.filterExp;
			} else {
				this.filterExp = filterExp || undefined;
			}
			
			return true;
		},
		clearFilter: function(){
			this.filterExp = undefined;
		},
		getRowSize: function(){
			return this.getRows().length;
		},
		getRow: function(row){
			var data = this.data;
			return data ? this._getRow(row, data) : null;
		},
		//override
		_getRow: function(row, data){
			return data.getRow && data.getRow(row);
		},
		getRowIndex: function(row){
			if (typeof row === "number") {
				return row;
			}
			
			row = this.getRow(row);
			return row ? this._getRowIndex(row) : -1;
		},
		//override
		_getRowIndex: function(row){
			var idx = row.idx,
				rows = this.getRows();
			return idx || idx === 0 ? idx : rows.indexOf(row);
		},
		setCurrent: function(curr){
			this._setCurrent(curr);
			this.curr = Math.max(curr, -1);
		},
		//override
		_setCurrent: function(curr){
			this.data.setCurrent && this.data.setCurrent(curr);
		},
		getCurrent: function(){
			return this.curr;
		},
		getData: function(row, col){
			return this._getData(row, col);
		},
		//override
		_getData: function(row, col){
			var data = this.data;
			return data.getData && data.getData(row, col);
		},
		setData: function(row, col, val){
			this._setData(row, col, val);
		},
		//override
		_setData: function(row, col, val){
			var data = this.data;
			data.setData && data.setData(row, col, val);
		},
		input: function(col,val){
			this._input(col, val);
		},
		//override
		_input: function(col,val){
			this.data.input(col, val);
		},
		reload: function(){
			var ds = this.dataSource;
			this.getRemoteData(ds);
		},
		load: function(data){
			if (!data) {
				data = this.data;
			}
			
			var ds = data || this.dataSource;
			
			data = this.getRemoteData(ds);
			
			return data;
		},
		clear: function(){
			var data = this.data;
			data.clearData();
			return this;
		},
		insertRow: function(row){
			return this._insertRow(row);
		},
		//override
		_insertRow: function(row){
			return this.data.newRow(row);
		},
		deleteRow: function(row){
			return this._deleteRow(row);
		},
		//override
		_deleteRow: function(row){
			return this.data.deleteRow(row);
		},
		getRemoteData: function(ds){
			if (!ds) {
				return;
			}
			
			var data = this._getRemoteData(ds);
			
			if (!data) {
				return data;
			}
			
			if (data !== ds) {
				this.dataSource = ds;
				this.data = data;
			}
			
			return data;
		},
		//override
		_getRemoteData: function(ds){
			var accNo = ds.accNo,
				mname = ds.mname,
				uname = ds.uname,
				whereStr = ds.whereStr || "",
				params = ds.params || {},
				data = ds;
			
			if (!mname || !uname) {
				return;
			}
			
			var data =  $.ajax({
				url: $$.absoluteUrl+"getData.jsp",
				type: "POST",
				data: params,
				dataType: "html",
				async:false,
				error: function(){
					$$.use("Mask",function(){this.hide();});
					alert("獲取數據" + params.modelName + "失敗!");
				}
			}).responseText;
			//Ready
			try {
				data = (new Function("return "+ data))();
				//console.log(data);
			} catch (e) {
				alert(data);
			}
			var modelMap = $$.modelMap;
			!$$.modelMap && ($$.modelMap = {});
			var model = $$.modelMap[data.n];
			if(model){
				model.loadJson(data,clearData);
			}else{
				model = $$.create("DataModel",{modName: data.n});
				$$.modelMap[data.n] = model;
				model.loadJson(data,clearData);
				model.dataFrom = dataFrom;
				model.whereStr = params.whereStr;
				model.parmMap = parmMap;
			}
			
			return modelMap.getUnit(uname);
		}
	};
	
};

$$.define("data.Store", ["core.Control", "core.Util"], store);

})(window.jQuery, window.com.pouchen);