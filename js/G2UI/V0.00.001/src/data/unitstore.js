(function($, $$){
	
var us = function(STORE){
	
	return {
		extend: STORE
	};
	
};

$$.define("data.UnitStore", ["data.Store"], us);

})(window.jQuery, window.com.pouchen);