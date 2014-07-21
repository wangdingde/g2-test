(function($, $$){
	
$$.define(
	["core.UIControl"],
	function(UICONTROL){
		return {
			extend: UICONTROL,
			ctor: function(){
				$(this.dom).html(this.helloMsg);
			}
		};
	}
);
	
})(window.jQuery, window.com.pouchen);
