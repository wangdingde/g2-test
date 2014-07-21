(function($, $$){
	
var dma = function(control){
	
	return {
		extend: control,
		loadData: $$.emptyFn,
		_getData: function(){
			return this.data;
		},
		getData: function(data){
			if (!data) {
				data = this._getData();
			}
			
			var ds = data || this.dataSource;
			
			data = this.getRemoteData(ds);
			
			return data;
		},
		reloadData: function(){
			var ds = this.dataSource;
			this.getRemoteData(ds);
		},
		getRemoteData: function(ds){
			if (!ds) {	
				return;
			}
			
			var accNo = ds.accNo,
				mname = ds.mname,
				uname = ds.uname,
				sqlNo = ds.sqlNo,
				url = ds.url,
				whereStr = ds.whereStr || "",
				params = ds.params || {},
				data = ds;
			
			if (mname && uname) {
				var model = this._getDataModel(accNo, mname, whereStr, params);
				data = model.getUnit(uname);
			} else if (sqlNo) {
				data = this._getQueryData(accNo, sqlNo, whereStr, params);
			} else if (url) {
				data = this._getDataFromUrl(url, params);
			}
			
			if (data !== ds) {
				this.dataSource = ds;
				this.data = data;
			}
			
			return data;
		},
		_getDataFromUrl: function(url, params){
			var opts = {
				url: url, 
				type: "POST",
				data: params
			};
			
			return $.ajax(opts);
		},
		_getQueryData: function(accNo, sqlNo, whereStr, params){
			params = params || {};
			params.parmMap = JSON.stringify(params.parmMap);
			
			var data =  $.ajax({
				url: $$.absoluteUrl+"getQuery.jsp",
				type: "POST",
				data: params,
				dataType: "html",
				async:false,
				error: function(){
					alert("獲取數據" + params.sqlNo + "失敗!");
				}
			}).responseText;
			//Ready
			try {
				data = (new Function("return "+ data))();
			}catch (e) {
				alert(data);
			}
			var ru = $$.create("ResultUnit",{});
			
			ru.loadJson(data);
			return ru;
		},
		_getDataModel: function(accNo, mname, whereStr, params){
			var modelMap = $$.modelMap, model;
			
			!modelMap && ($$.modelMap = {});
			model = $$.modelMap[data.n];
			if (!model) {
				model = this._getRemoteModel(accNo, mname, whereStr, params);
			}
			
			return model;
		},
		_getRemoteModel: function(accNo, mname, whereStr, params){
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
				$$.use("Mask",function(){this.hide();});
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
			
			return modelMap;
		},
		getDataSize: function(){
			return this.getDataRows().length;
		},
		getDataRows: function(){
			var rows = [],
				data = this._getData() || [];
			
			if (data.rows) {
				rows = data.rows;
			} else if (data instanceof Array) {
				rows = data;
			}
			
			return rows;
		},
		getCellData: function(row, col, rows){
			var d = null;
			
			row = this.getDataRow(row, rows);
			
			if (col.field) {
				col = col.field;
			}
			
			if (row) {
				d = row.getData ? row.getData(col) : row[col];
			}
			
			return d || "";
		},
		getDataRow: function(row, rows){
			if (typeof row === "number") {
				if (!rows) {
					rows = this.getDataRows();
				}
				
				row = rows[row];
			}
			
			return row;
		},
		getRowData: function(row, rows){
			row = this.getDataRow(row, rows);
			
			return row.getData ? row.unit.getRowData(row) : row;
		},
		getRowIndex: function(row, rows){
			if (typeof row === "number") {
				return row;
			}
			var rowIdx = -1;
			if (!rows) {
				rows = this.getDataRows();
			}
			row = this.getDataRow(row, rows);
			
			if (row) {
				rowIdx = row.idx || row.idx === 0 ? row.idx : rows.indexOf(row);
			}
			
			return rowIdx;
		},
		insertDataRow: function(index, rowData, sender){
			var data = this._getData() || [],
				rows;
				
			if (data.newRow) {
				data.newRow(rowData || {}, sender);
			} else if (data instanceof Array) {
				rows = data.rows || data;
				rows.splice(index, 0, rowData || {});
			}
		},
		deleteDataRow: function(){
			
		},
		setData: function(){
			
		},
		inputData: function(){
			
		}
	};
	
};


$$.define("data.DataManager", ["core.Control"], dma);

})(window.jQuery, window.com.pouchen);