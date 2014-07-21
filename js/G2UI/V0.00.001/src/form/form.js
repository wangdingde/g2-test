(function($, $$){

var form = function(container, labelField){
	return {
		extend: container,
		ctor: function(){
			$(this.dom).bind({
				"keydown": function(e){
					
				}
			});
		},
		_itemCfg: {
			xtype: labelField,
			labelWidth: 100
		}
	};
};

$$.define("form.Form", ["core.Container", "form.LabelField"], form);
	
})(window.jQuery, window.com.pouchen);