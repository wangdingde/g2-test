(function($, $$) {
var zcenter = function () {
	var COMPS = [],
		maxIndex = 2000,
		minIndex = 1999;
	
	return{
		static: true,
		getActive: function(){
			return COMPS[COMPS.length-1];
		},
		setZIndex: function(el, index){
			if (el.setZIndex) {
				el.setZIndex(index);
			} else {
				$(el.dom || el).css({"z-index": index});
			}
		},
		toFront: function(el){
			var idx = COMPS.indexOf(el),
				newIndex = maxIndex++;
			
			if (idx === -1 || idx !== COMPS.length-1) {
				if (idx !== -1) {
					COMPS.splice(idx, 1);
				}
				
				this.setZIndex(el, newIndex);
				COMPS.push(el);
			}
		},
		toBack: function(el){
			var idx = COMPS.indexOf(el),
				newIndex = minIndex--;
			
			if (idx !== 0) {
				if (idx !== -1) {
					COMPS.splice(idx, 1);
				}
				
				this.setZIndex(el, newIndex);
				COMPS.splice(0, 0, el);
			}
		}
	};
};

$$.define('tools.ZCenter', [], zcenter);

})(window.jQuery, window.com.pouchen); 