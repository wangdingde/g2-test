(function ($, $$) {
var win = function (PANEL, MASK) {
	return{
		extend: PANEL,
		ctor: function(opts){
			this.bind("onResized", function(){
				this.center();
			});
			if (this.modal) {
				this.bind({
					"onOpened": this.showMask,
					"onClosed": this.hideMask,
					"onMined": this.hideMask
				});
				 !this.closed && this.showMask();
			}
		},
		defCfg: {
			title:'New Window',
			content:'This is a Window',
			collapsible:true,
			minimizable:true,
			closable: true,
			maximizable: true,
			draggable: true,
			resizable: true,
			modal: false
		},
		center: function(){
			this.move({
				left: ($(window).width() - this.getWidth())/2,
				top: ($(window).height() - this.getHeight())/2
			});
		},
		showMask: function(){
			MASK.show(this);
		},
		hideMask: function(){
			MASK.hide();
		}
	};
};

$$.define('panel.Window', ["panel.Panel", "panel.Mask"], win);

})(window.jQuery, window.com.pouchen);
