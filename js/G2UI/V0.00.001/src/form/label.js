(function($, $$){
var label = function(uicontrol){
	return {
		root: true,
		extend: uicontrol,
		elementType: "label",
		ctor: function(opts){
			$(this.dom).addClass("form-label");
			this.setText();
		},
		setText: function(text){
			var flag = false;
			if (!text) {
				text = this.text;
				flag = true;
			}
			
			if (flag || text !== this.text) {
				this.text = text;
				
				text = text + (this.hasField ? "：" : "");
				$(this.dom).html(text).attr({
					"title": text
				});
			}
		}
	};
};

$$.loadCss("form/label.css", true);

$$.define("form.Label", ["core.UIControl"], label);
	
})(window.jQuery, window.com.pouchen);