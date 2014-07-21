(function ($, $$) {
var DateBox = function (COMBO, CALENDAR) {
	return{
		extend: COMBO,
		ctor: function (opts) {
			var el = this;
			this.bind("onSetData", function (val) {
				this.calendar && this.calendar.setValue(val);
			});
		},
		_arrowicon: "datebox-arrow-icon",
		defCfg: {
			pattern: "yyyy/mm/dd",
			comboWidth: undefined,
			comboHeight: 180,
			autoShow: false,
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
			
			this.calendar = $$.create(CALENDAR, {
				renderTo: this.combo,
				width: w, 
				height: h
			});
			
			if (this.value) {
				this.calendar.setValue(new Date(this.value));
			}
			this._initComboEvents();
		},
		showCombo: function () {
			if (this.isShowing === false) {
				!this.combo && this._initCombo();
				this.layout();
				this.isShowing = true;
				var calendar = this.calendar,
					selectDom = calendar.getSelectDom();
				calendar.focus();
				selectDom.hide();
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
			this.calendar.bind("onSetValued", function (value, inner) {
				if (inner) {
					el.setValue(value.getTime());
					el.hideCombo();
					$(el.input).focus();
				}
				
			});
		//TODO
		//calender setValue
		//show or hide combo
		}
	};
};

$$.define('form.DateBox', ['form.Combo', "form.Calendar"], DateBox);

})(window.jQuery, window.com.pouchen);
