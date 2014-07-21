(function ($, $$) {
var TextArea = function () {
	return{
		ctor: function (opts) {
			this.max = opts.max;
			this.cols = opts.cols || 30;
			this.rows = opts.rows || 5;
			$(this.input).attr("cols", this.cols).attr("rows", this.rows);
			if (!isNaN(this.max)) {
				this.addRule("maxLen[" + Number(this.max) + "]");
			}
		},
		_initInput: function () {
			this.input = this.input || document.createElement("textarea");
			$(this.input).val("");
			$(this.input).appendTo(this.dom);
		}
	};
};
$.define('form.InputBox', ['core.UIControl'], TextArea);
})(window.jQuery, window.com.pouchen);
