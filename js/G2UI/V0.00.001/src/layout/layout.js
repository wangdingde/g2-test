(function($, $$){
	var Layout = function(uicontrol){
		return {
			extend: uicontrol,
			ctor: function(opts){
				
			},
			layout: function(){
				var items = this.getLayoutItems();
				this.doLayout(items);
			},
			doLayout: function(items){
				var opts = this.calculate(items);
				
				this.renderItems(opts);
			},
			doResize: function(width, height){
				var items = this.getLayoutItems(),
					i, item, len = items.length;
				
				for (i = 0; i < len; i++) {
					item = items[i];
					item.resize(width, height);
				}
			},
			getLayoutItems: function(){
				return this.container.getItems(true);
			},
			renderItems: $$.emptyFn,
			calculate: $$.emptyFn
		};
	};
	
$$.define("layout.Layout", ["core.UIControl"], Layout);

})(window.jQuery, window.com.pouchen);