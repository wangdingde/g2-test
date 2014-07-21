(function($, $$){
var Vbox = function(cellLayout){
	return {
		extend: cellLayout,
		ctor: function(opts){
			this.dir = "|";
		}
	};
};

$$.define("layout.VboxLayout", ["layout.CellLayout"], Vbox);
	
})(window.jQuery, window.com.pouchen);