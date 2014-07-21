(function($$){
    var AdqButtonQuery = {
        cons: function(opts) {
    		
        },
        init: function(){
    		if(!this.unit){
    			this.unit = $$.getRemoteQuery({accNo: this.accNo, clazz: "", sqlNo: this.sqlNo, opType: 0});
    		}
        	this.initColumnData();
        	this.initQueryUnit();
        	this.initWin();
        },
        getColCaption: function(col){
        	return col.cname;
        },
        isDateType: function(type){
        	return type === "Date" || type === "Timestamp";
        },
        getTableId: function(){
        	return this.sqlNo + "_queryTable_Query";
        },
        _query: function(queryParams){
        	var queryTable = this.table;
        	var ru = $$.getRemoteQuery({accNo: this.accNo, clazz: "", sqlNo: this.sqlNo, opType: 2, whereStr:queryParams.whereStr,parmMap:queryParams.params});
        	this.callback && this.callback(ru);
        }
    };
    $$.register("AdqButton","AdqButtonQuery",AdqButtonQuery);
    
})(window.com.ASC);
