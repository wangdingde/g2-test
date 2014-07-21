(function($, $$) {
	
var commands = function () {
	return{
		static: true,
		excute: function(command, value){
			var doc = $$.getDoc();
			try {
				doc.execCommand(command, false, value);
			} catch (e) {
				
			}
		},
		getRange: function(dom){
			var srcObj = document.getElementById ("src"),
				rangeObj;
			
			if (document.createRange) { // all browsers, except IE before version 9
				rangeObj = document.createRange();
				rangeObj.selectNodeContents(dom);
			} else { // Internet Explorer before version 9
				rangeObj = document.body.createTextRange();
				rangeObj.moveToElementText(dom);
			}
			
			return rangeObj;
		},
		moveEnd: function(dom){
			var rangeObj = this.getRange(dom);
			
			if (rangeObj.setEnd) {
				rangeObj.setEnd();
			} else if (rangeObj.moveEnd) {
				rangeObj.moveEnd();
			}
		},
		moveStart: function(dom){
			var rangeObj = this.getRange(dom);
			
			if (rangeObj.setStart) {
				rangeObj.setStart();
			} else if (rangeObj.moveStart) {
				rangeObj.moveStart();
			}
		}
	};
};

$$.define('tools.Commands', [], commands);
})(window.jQuery, window.com.pouchen); 