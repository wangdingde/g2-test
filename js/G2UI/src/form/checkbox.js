(function ($, $$) {
var CHECKBOX = function (INPUT) {
	return {
		root: true,
		extend: INPUT,
		defCfg: {
			on: 1,
			off: 0
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
			this.refreshShow();
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

$$.define('form.CheckBox', ['form.Input'], CHECKBOX);

})(window.jQuery, window.com.pouchen);