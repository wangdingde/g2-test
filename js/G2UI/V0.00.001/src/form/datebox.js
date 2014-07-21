(function ($, $$) {
var DateBox = function (uictrl) {
	return{
		cons: function (opts) {
			this.pattern = opts.pattern || "yyyy/mm/dd";
			this.valuePattern = opts.valuePattern;
			if (!$$.isNull(this.value)) {
				if (this.valid(this.value) === false) {
					return;
				}
				this._timerHandler();
				this.refreshShow();
			}
			var el = this;
			$(this.input).bind("keypress", function (e) {
				if (e.keyCode == 40) {
					el.showCombo();
					return false;
				}
			});
			this.bind("onSetData", function (val) {
				this.calendar && this.calendar.setValue($$.Util.Date.isDate(val) ? new Date(val) : new Date());
			});
		},
		_arrowicon: "asc-datebox-arrow-icon",
		comboDef: {
			comboWidth: undefined,
			comboHeight: 180,
			autoShow: true,
			isShowing: false
		},
		_initCombo: function () {
			//TODO
			//init combo
			//init calender
			!this.comboWidth && (this.comboWidth = $(this.dom).width());
			this.combo = document.createElement("div");
			document.body.appendChild(this.combo);
			this.combo.style.overflow = "hidden";
			this.combo.combo = this;
			$(this.combo).addClass(this.comboListCss);
			var w = this.comboWidth;
			var h = this.comboHeight;
			if (w && w < 120) {
				w = 120;
			}
			if (h && h < 150) {
				w = 150;
			}
			this.calendar = $$.El(this.combo, "Calendar", {width: w, height: h});
			$$.Util.Date.isDate(this.value) && (this.calendar.setValue(new Date(this.value)));
			this._initComboEvents();
		},
		showCombo: function () {
			if (this.isShowing === false) {
				!this.combo && this._initCombo();
				this.layout();
				this.isShowing = true;
				this.calendar.setActive();
				this.trigger("onComboShow");
			}
		},
		_value2text: function (value) {
			var text;
			if ($$.isNull(value) || $$.isEmptyString(value)) {
				return "";
			}
			try {
				if (!($$.Util.Date.isDate(value)) && this.valuePattern) {
					value = this.value = $$.Util.Date.parse(value, this.valuePattern);
				}
				text = $$.Util.Date.format(value, this.pattern);
			} catch (e) {
				return value;
			}
			return this.formatter ? this.formatter(text) : text;
		},
		getValue: function () {
			return this.valuePattern ? $$.Util.Date.format(this.value, this.valuePattern) : this.value;
		},
		_text2value: function (text) {
			var value;
			if ($$.isNull(text) || $$.isEmptyString(text)) {
				return "";
			}
			value = $$.Util.Date.parse(text, this.pattern);
			if (!value && this.valuePattern) {
				value = $$.Util.Date.parse(text, this.valuePattern);
			}
			if (!value) {
				value = $$.Util.Date.parse(text, "yyyymmdd");
			}
			if (!value) {
				value = $$.Util.Date.parse(text, "yyyymmdd HHMIss");
			}
			value = value ? value.getTime() : "";
			return this.parser ? this.parser(value) : value;
		},
		_initComboEvents: function () {
			var el = this;
			$(this.combo).bind("click", function () {
				return false;
			});
			this.calendar.bind("onSetValue", function (value, sender) {
				if (sender == el.combo) {
					el.hideCombo();
					el.setValue(value.getTime());
					el.refreshShow();
					$(el.input).focus();
				}
			});
		//TODO
		//calender setValue
		//show or hide combo
		}
	};
};
$.define('form.Combo', ['core.UIControl'], DateBox);
})(window.jQuery, window.com.pouchen);
