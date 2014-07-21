(function($, $$){

var header = function(container, column){
	return {
		extend: container,
		_itemCfg: {
			xtype: column
		}
	};
};

$$.define("grid.head.Container", ["core.Container","grid.column.Column"], header);
	
})(window.jQuery, window.com.pouchen);