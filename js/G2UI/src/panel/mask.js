(function($, $$){
var mask = function (UICONTROL, UTIL, ZCENTER) {
	var maskEl, toEl;
	return{
		extend: UICONTROL,
		root: true,
		domCls: UTIL.Css.opacity() + " panel-mask",
		ctor: function(opts){
			
		},
		defCfg: {
			fit: true
		},
		statics: {
			show: function(el){
				if (!maskEl) {
					maskEl = $$.create(this, {});
					maskEl.isHidden = false;
				} else if (maskEl.isHidden) {
					maskEl.show();
				}
				maskEl.oriOverflow = $(document.body).css("overflow");
				maskEl.isHidden = false;
				$(document.body).css("overflow", "hidden");
				ZCENTER.toFront(maskEl);
				if (toEl) {
					toEl.unbind("mask.onResized");
				}
				if (el) {
					toEl = el;
					el.bind({
						"mask.onResized": function(){
							maskEl.resize();
						}
					});
					ZCENTER.toFront(el);
				}
			},
			hide: function(){
				if (maskEl && !maskEl.isHidden) {
					maskEl.hide();
					$(document.body).css("overflow", maskEl.oriOverflow);
					maskEl.oriOverflow = undefined;
					maskEl.isHidden = true;
				}
			}
		}
	};
};

$$.loadCss("panel/mask.css", true);

$$.define('panel.Mask', ["core.UIControl", "core.Util", "tools.ZCenter"], mask);
	
})(window.jQuery, window.com.pouchen);