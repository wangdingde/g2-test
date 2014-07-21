(function ($, $$) {
var NumberBox = function (uictrl) {
	return{
		cons: function (opts) {
			this.sp = opts.sp;
			this.dec = opts.dec;
			this.showSpinner = opts.showSpinner === true ? true : false;
			this.stepValue = opts.stepValue || 1;
			this.addRule("numberType", 0);
			if (!isNaN(this.max)) {
				this.addRule("max[" + this.max + "]");
			}
			if (!isNaN(this.min)) {
				this.addRule("min[" + this.min + "]");
			}
			this.refreshShow(this.text);
			if (this.showSpinner) {
				this.spinner = $("<div></div>").addClass("asc-numberbox-spinner").appendTo(this.dom)[0];
				this.spinnerUp = $("<div></div>").addClass("asc-numberbox-spinnerup").appendTo(this.spinner)[0];
				this.spinnerDown = $("<div></div>").addClass("asc-numberbox-spinnerdown").appendTo(this.spinner)[0];
				var el = this;
				$(this.spinnerUp).bind("mouseover",function () {
					$(this).addClass("asc-numberbox-spinnerup-mouseover");
				}).bind("mouseout",function () {
						$(this).removeClass("asc-numberbox-spinnerup-mouseover");
					}).bind("click", function () {
						el.setValue(isNaN(el.value) ? 0 : el.value + el.stepValue);
						$(el.input).focus();
					});
				$(this.spinnerDown).bind("mouseover",function () {
					$(this).addClass("asc-numberbox-spinnerdown-mouseover");
				}).bind("mouseout",function () {
						$(this).removeClass("asc-numberbox-spinnerdown-mouseover");
					}).bind("click", function () {
						el.setValue(isNaN(el.value) ? 0 : el.value - el.stepValue);
						$(el.input).focus();
					});
			}
			this.bind({
				onFocus: function () {
					//this.value = this.parse(this.text);
					if (this.showSpinner) {
						$(this.spinnerUp).addClass('asc-numberbox-spinnerup-active');
						$(this.spinnerDown).addClass('asc-numberbox-spinnerdown-active');
					}
					this.refreshShow();
				},
				onBlur: function () {
					//this.text = this.format(this.value,this.sp,this.dec);
					if (this.showSpinner) {
						$(this.spinnerUp).removeClass('asc-numberbox-spinnerup-active');
						$(this.spinnerDown).removeClass('asc-numberbox-spinnerdown-active');
					}
					this.refreshShow(this.text);
				},
				onKeydown: function (e) {
					var chc = e.which;
					if (!e.ctrlKey && !e.altKey && chc >= 65 && chc <= 90) {
						return false;
					}
				}
			});
		},
		_errorHandler: function (errObj) {
			var oldVal = errObj.oldVal, newVal = errObj.newVal;
			if (errObj.rule == "numberType") {
				if (newVal.charAt(0) != "-" && newVal.charAt(newVal.length - 1) != ".") {
					this.setData({text: newVal});
					this.refreshShow();
					return false;
				}
			}
			this.pp._errorHandler.call(this, errObj);
		},
		setWidth: function (width) {
			width = width || this.domw;
			if (!isNaN(width)) {
				$(this.dom).width(width);
				$(this.input).width(width - (this.showSpinner ? 26 : 8));
				if (this.showSpinner) {
					$(this.arrow).width(18);
				}
				this.domw = width;
			}
		},
		setData: function (data) {
			if (!isNaN(data.value)) {
				value = Number(data.value);
				$$.InputBox.prototype.setData.call(this, {value: value});
				return;
			}
			$$.InputBox.prototype.setData.call(this, data);
		},
		_sysFormat: function (value) {
			return $$.Util.Number.format(this.value, this.sp, this.dec);
		},
		_sysParse: function (text) {
			return $$.Util.Number.parse(text);
		}
	};
};
$.define('form.InputBox', ['core.UIControl'], NumberBox);
})(window.jQuery, window.com.pouchen);
