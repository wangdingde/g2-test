(function($, $$){
	
var unit = function(APATER){
	
	return {
		createApater: function(ap){
			if (!ap) {
				ap = this.apater;
			}
			
			if (!ap) {
				return;
			}
			
			if (typeof ap === "string" || ap.$isClass) {
				ap = {xtype: ap};
			}
			
			this.apater = $$.create(ap.xtype || APATER, ap);
		},
		
		getCol: function(col){
			
		},
		getColIdx: function(col){
			
		},
		getCols: function(){
			
		},
		
		getRow: function(row){
			
		},
		getRowIdx: function(row){
			
		},
		getRows: function(){
			
		},
		getRowByUid: function(uid){
			
		},
		
		getData: function(row, col){
			
		},
		getRowData: function(row){
			
		},
		getUnitData: function(){
			
		},
		setData: function(row, col, val){
			
		},
		
		addCol: function(cname, jtype, sender){
			
		},
		removeCol: function(col){
			
		},
		addRow: function(sender){
			
		},
		
		findRow: function(edge,cols,vals,excludeRowIdxs,range,findAllState){
			
		},
		findRows: function(edge,cols,vals,excludeRowIdxs,range,findAllState){
			
		},
		checkRow: function(row){
			
		},
		
		setCurrent: function(row,sender){
			
		},
		getCurrent: function(){
			
		},
		
		parent: function(){
			
		},
		children: function(){
			
		},
		child: function(rela){
			
		},
		
		sort: function(sortExp){
			
		},
		filter: function(filterExp){
			
		},
		
		getRemoteData: function(ds){
			
		},
		clearData: function(){
			
		},
		loadData: function(data, sender){
			
		},
		updateJson: function(onlyDel){
			
		},
		
		getCaption: function(){
			
		},
		getOriData: function(row, col){
			
		},
		setOriData: function(row, col, val){
			
		},
		
		removeRow: function(row){
			
		},
		newRow: function(rowData, sender){
			
		},
		deleteRow: function(row, sender){
			
		},
		
		input: function(col, val, sender){
			
		},
		regChange: function(addChg){
			
		},
		regError: function(addErr){
			
		},
		
		accept: function(sender){
			
		},
		reject: function(sender){
			
		},
		acceptRow: function(row, sender){
			
		},
		rejectRow: function(row, sender){
			
		}
	};
	
};

$$.define("data.Unit", [], unit);

})(window.jQuery, window.com.pouchen);