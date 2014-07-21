(function ($, $$) {
var CheckBox = function (input) {
	return {
		root: true,
		extend: input,
		ctor: function (opts) {
			this.on = $$.isNull(opts.on) || $$.isEmptyString(opts.on) ? 1 : opts.on;
			this.off = $$.isNull(opts.off) || $$.isEmptyString(opts.off) ? 0 : opts.off;
		},
		_initInput: function () {
			this.input = this.input || document.createElement("input");
			this.input.type = "checkbox";
			this.input.el = this;
			$(this.input).removeAttr("checked");
			$(this.input).appendTo(this.dom);
		},
		refreshShow: function (text) {
			if ($$.isNull(text) || $$.isEmptyString(text)) {
				text = this.value;
			}
			if (text == this.on) {
				$(this.input).attr("checked", "checked");
			} else {
				$(this.input).removeAttr("checked");
			}
		},
		setData: function (data) {
			this.value = data.value == this.on ? this.on : this.off;
			this.trigger("onSetData", this.value);
		},
		clearData: function () {
			$(this.input).removeAttr("checked");
		},
		_initEvent: function () {
			this._transformInputEvent();
			this.bind({
				onClick: function () {
					this.setValue(this.value == this.on ? this.off : this.on);
				}
			});
		}
	};
};

$$.define('form.CheckBox', ['form.InputBox'], CheckBox);

})(window.jQuery, window.com.pouchen);