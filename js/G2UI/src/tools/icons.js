(function($, $$) {
	
var icons = function () {
	return{
		static: true,
		setIcon: function(key, icon){
			this[key] = icon;
		},
		"ADD": "icon-add",
		"EDIT": "icon-edit",
		"REMOVE": "icon-remove",
		"SAVE": "icon-save",
		"CANCEL": "icon-cancel",
		"REFRESH": "icon-refresh",
		"MIN": "icon-min",
		"MAX": "icon-max",
		"RESTORE": "icon-restore",
		"CLOSE": "icon-close",
		"COLLAPSE": "icon-collapse",
		"EXPAND": "icon-expand",
		"SEARCH": "icon-search"
	};
};

$$.loadCss("tools/icon.css", true);

$$.define('tools.Icons', [], icons);
})(window.jQuery, window.com.pouchen); 