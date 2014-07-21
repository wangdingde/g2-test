(function($, $$){
	
var unit = function(){
	
	return {
		createApater: $$.emptyFn,
		
		getCol: $$.emptyFn,
		getColIdx: $$.emptyFn,
		getCols: $$.emptyFn,
		
		getRow: $$.emptyFn,
		getRowIdx: $$.emptyFn,
		getRows: $$.emptyFn,
		getRowByUid: $$.emptyFn,
		
		getData: $$.emptyFn,
		getRowData: $$.emptyFn,
		getUnitData: $$.emptyFn,
		setData: $$.emptyFn,
		
		addCol: $$.emptyFn,
		removeCol: $$.emptyFn,
		addRow: $$.emptyFn,
		
		findRow: $$.emptyFn,
		findRows: $$.emptyFn,
		checkRow: $$.emptyFn,
		
		setCurrent: $$.emptyFn,
		getCurrent: $$.emptyFn,
		
		parent: $$.emptyFn,
		children: $$.emptyFn,
		child: $$.emptyFn,
		
		sort: $$.emptyFn,
		filter: $$.emptyFn,
		
		getRemoteData: $$.emptyFn,
		clearData: $$.emptyFn,
		loadData: $$.emptyFn,
		updateJson: $$.emptyFn,
		
		getCaption: $$.emptyFn,
		getOriData: $$.emptyFn,
		setOriData: $$.emptyFn,
		
		removeRow: $$.emptyFn,
		newRow: $$.emptyFn,
		deleteRow: $$.emptyFn,
		
		input: $$.emptyFn,
		regUpd: $$.emptyFn,
		regError: $$.emptyFn,
		
		accept: $$.emptyFn,
		reject: $$.emptyFn,
		acceptRow: $$.emptyFn,
		rejectRow: $$.emptyFn
	};
	
};

$$.define("data.Unit", [], unit);

})(window.jQuery, window.com.pouchen);