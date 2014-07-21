(function($, $$){
var Hbox = function(cellLayout){
	return {
		extend: cellLayout,
		ctor: function(opts){
			this.dir = "-";
		}
	};
};

$$.define("layout.HboxLayout", ["layout.CellLayout"], Hbox);
	
})(window.jQuery, window.com.pouchen);