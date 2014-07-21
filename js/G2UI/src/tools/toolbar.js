(function($, $$) {
var toolbar = function (CONTAINER, BUTTON) {
	return{
		extend: CONTAINER,
		_itemCfg: {
			xtype: BUTTON
		}
	};
};

$$.define('tools.Toolbar', ['core.Container', "form.Button"], toolbar);
})(window.jQuery, window.com.pouchen); 