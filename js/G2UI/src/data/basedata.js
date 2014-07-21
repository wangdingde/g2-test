(function($, $$){
	
var bd = function(CONTROL, RESULTUNIT){
	return {
		extend: CONTROL,
		setUnit: function(unit){
			if (!unit || unit === this.bindingUnit) {
				this.bindingUnit = unit;
				return;
			}
			
			if (this.unit) {
				this.unbindSource();
			}
			
			currUnit = unit;
			this.unit = unit;
			this.bindSource(unit);
		},
		//創建unit
		createUnit: function(unit){
			var tunit = this.unit, xtype, resp, data;
			//當前unit與傳入unit相同時直接返回
			if (unit !== tunit) {
				//初始化tunit與unit
				unit = unit || tunit;
				tunit = tunit || unit;
				//unit與tunit都不存在時直接返回null
				if (!unit) {
					return null;
				}
				//利用unit load數據
				resp = this.load(unit);
				//unit與resp不同，則表示已加載數據
				if (resp !== unit) {
					data = resp;
				}
				//當data已經爲UNIT類型時，直接setUnit返回即可
				if (data && data.$instance && data.loadJson) {
					unit = tunit;
					tunit = data;
					
					tunit.apply(unit);
					if (unit.listeners) {
						tunit.bind(unit.listeners);
					}
				} else {
					//unit此處充當備選data
					unit = data;
					//判斷tunit是否需要初始化
					if (!tunit.$instance || !tunit.loadData) {
						delete tunit.mname;
						delete tunit.uname;
						delete tunit.sqlNo;
						delete tunit.url;
						
						unit = tunit.data || unit || tunit;
						
						xtype = tunit.xtype || this.unitType || RESULTUNIT;
						
						tunit = $$.create(xtype, tunit);
					}
					
					//加載數據
					tunit.loadData(data || unit); 
				}
			}
			//log(tunit);
			tunit.sortExp = tunit.sortExp || this.sortExp;
			tunit.filterExp = tunit.filterExp || this.filterExp;
			tunit.apater = tunit.apater || this.unitApater;
			
			this.setUnit(tunit);
			
			return tunit;
		},
		getDataSource: function(){
			return this.bindingUnit || this.createUnit();
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
		getRemoteData: function(ds){
			if (!ds) {
				return;
			}
			
			var data = $$.Data.getRemoteData(ds);
			
			if (!data) {
				return data;
			}
			
			if (data !== ds) {
				this.dataSource = ds;
			}
			
			return data;
		},
		getRows: function(){
			var currUnit = this.bindingUnit || this.createUnit();
			return currUnit ? currUnit.getRows() : [];
		},
		getRowSize: function(){
			var currUnit = this.bindingUnit || this.createUnit();
			return currUnit ? currUnit.getRowSize() : 0;
		},
		getColumnData: function(row, field){
			row = this.getRow(row);
			var currUnit = this.bindingUnit || this.createUnit();
			return currUnit ? currUnit.getData(row, field.field || field) : undefined;
		},
		getRowData: function(row){
			row = this.getRow(row);
			var currUnit = this.bindingUnit || this.createUnit();
			return currUnit ? currUnit.getRowData(row) : {};
		},
		getRowByUid: function(uid){
			var currUnit = this.bindingUnit || this.createUnit();
			if (uid < 0 || !currUnit) {
				return null;
			}
			
			return currUnit.getRowByUid(uid);
		},
		getRowUid: function(row){
			if (typeof row === "number") {
				return row;
			}
			var ds = this.getDataSource(),
				uid = row ? row.tid : -1;
				
			if (!uid && uid !== 0) {
				uid = ds.lastTid;
			}
			return uid;
		},
		//綁定unit
		bindSource: function(unit){
			if (this.bindingUnit === unit) {
				return;
			}
			
			this._bindUnit(unit);
			//初始化時即綁定
			//this._bindEl();
			
			this.bindingUnit = unit;
		},
		unbindSource: function(){
			this._unbindUnit();
			
			this.unit = null;
			this.bindingUnit = null;
		},
		_getColumnInfo: function(row, field){
			row = this.getRow(row);
		},
		_bindUnit: $$.emptyFn,
		_unbindUnit: $$.emptyFn,
		//每個el不管unit如何變化，只需要bind一次即可
		_bindEl: $$.emptyFn
	};
	
};


$$.define("data.BaseData", ["core.Control", "data.ResultUnit"], bd);

})(window.jQuery, window.com.pouchen);