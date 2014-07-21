(function ($, $$) {
var Combo = function (INPUT, UTIL, COMBODATA) {
	function _hideCombo(combo) {
		$(document.body).children("." + comboListCss).each(function () {
			if (this.combo != combo && this.combo.isShowing) {
				this.combo.hideCombo();
			}
		});
	};
	$(document).bind("click.com.ASC", function () {
		_hideCombo();
	});
	var comboListCss = "asc-combo-list";
	return{
		extend: INPUT,
		mixins: [COMBODATA],
		ctor: function (opts) {
			this.editable = opts.editable == false ? false : true;
			this.enabled = true;
			if (this.editable === false) {
				$(this.input).attr("readonly", "readonly");
			}
			this.bind({
				onArrowClick: function () {
					_hideCombo(this);
					if (this.enabled) {
						this.changeComboView();
					}
				},
				onFocus: function () {
					$(this.arrow).addClass("asc-combo-arrow-active");
				},
				onBlur: function () {
					this.refreshShow(this.text);
					$(this.arrow).removeClass("asc-combo-arrow-active");
				},
				onClick: function () {
					_hideCombo(this);
					if (this.autoShow) {
						this.changeComboView();
					}
				},
				onSetData: function (value, text) {
					this.showCombo();
					this.loadComboData(this._searchByText(text), false, true);
					
					var record = this.getRecordByValue(value);
					this._setSelectedItem(record);
					
				}
			});
			$(this.dom).bind("click", function () {
				return false;
			});
			if (!$$.isNull(this.value)) {
				this.text = this.format(this.value);
				this.refreshShow();
			}
		},
		comboListCss: comboListCss,
		_arrowicon: "asc-combo-arrow-icon",
		defCfg: {
			textField: "name",
			valueField: "no",
			comboWidth: undefined,
			comboHeight: 200,
			autoHeight:false,
			comboData: undefined,
			autoShow: false,
			isShowing: false
		},
		_timerHandler: function (value) {
			var text = value || this.getInputValue();
			value = this.parse(text);
			
			this.setValue(value);
		},
		_searchByText: function(text){
			var d = this.comboData || [],
				i = 0, len = d.length,
				textField = this.textField, r, res = [],
				record = this.getRecordByText(text);
			if (!text || record) {
				return d;
			}
			for (var i = 0, ii = d.length; i < ii; i++) {
				r = d[i];
				if (this._getText(r).toUpperCase().indexOf(String(text).toUpperCase()) !== -1) {
					res.push(r);
				}
			}
			return res;
		},
		
		_value2text: function (value) {
			var record = this.getRecordByValue(value),
				textField = this.textField;
			return record ? this._getText(record) : value;
		},
		_text2value: function (text) {
			var record = this.getRecordByText(text),
				valueField = this.valueField;
			return record ? record[valueField] : text;
		},
		getRecordByText: function (text) {
			var d = this.comboData;
			if (!d || $$.isNull(text) || $$.isEmptyString(text)) {
				return "";
			}
			var textField = this.textField, r;
			for (var i = 0, ii = d.length; i < ii; i++) {
				r = d[i];
				if (this._getText(r) == text) {
					return r;
				}
			}
			return null;
		},
		getRecordByValue: function (value) {
			var d = this.comboData;
			if (!d || $$.isNull(value) || $$.isEmptyString(value)) {
				return "";
			}
			var valueField = this.valueField, r;
			for (var i = 0, ii = d.length; i < ii; i++) {
				r = d[i];
				if (r[valueField] == value) {
					return r;
				}
			}
			return null;
		},
		_initInput: function () {
			INPUT.prototype._initInput.call(this);
			this.arrow = $("<div></div>").addClass("asc-combo-arrow").addClass(this._arrowicon).appendTo(this.dom)[0];
			$(this.arrow).bind("mouseover",function () {
				$(this).addClass("asc-combo-arrow-mouseover");
			}).bind("mouseout", function () {
				$(this).removeClass("asc-combo-arrow-mouseover");
			});
		},
		setWidth: function (width) {
			width = width || this.domw;
			if (!isNaN(width)) {
				$(this.dom).width(width);
				$(this.input).width(width - 26);
				$(this.arrow).width(18);
				this.domw = width;
			}
		},
		setHeight: function(height){
			INPUT.prototype.setHeight.call(this, height);
			$(this.arrow).css({
				"height": height+"px"
			});
		},
		_initCombo: function () {
			this.combo = $("<div></div>").hide().appendTo(document.body)[0];
			$("<ul class=\"asc-combo-list-ul\"></ul>").appendTo(this.combo);
			this.combo.combo = this;
			if(this.autoHeight==false){
				$(this.combo).addClass(this.comboListCss).css({
					"width": this.comboWidth || ($(this.dom).width()-2),
					"height":this.comboHeight
				});
			}else{
				$(this.combo).addClass(this.comboListCss).css({
					"width": this.comboWidth || ($(this.dom).width()-2),
					"min-height":20,
					"max-height":this.comboHeight
				});
			}
			var comboData = this.comboData;
			if (!comboData && this.unit) {
				comboData = this.getDataSource();
				comboData = this.comboData = comboData.getUnitData();
			}
			if (comboData) {
				this.loadComboData(comboData, true);
			}

		},
		_setSelectedItem: function (record) {
			if (record) {
				var li = record["-item"];
				if (!li) {
					return;
				}
				if (!$(li).hasClass("asc-combo-list-selected")) {
					$(li).siblings(".asc-combo-list-selected").removeClass("asc-combo-list-selected");
					//執行問題，不加時某些combo會出現異常
					setTimeout(function () {
						$(li).addClass("asc-combo-list-selected");
					}, 0);
				}
			} else {
				$("ul li.asc-combo-list-selected", this.combo).removeClass("asc-combo-list-selected");
			}
		},
		_initComboEvents: function () {
			var el = this;
			$("ul li", this.combo).unbind(".com.ASC").bind("click.com.ASC",function () {
				if (el.isShowing === false) {
					return;
				}
				el.setValue(this.record[el.valueField]);
				el.refreshShow(el.text);
				$(el.input).focus();
				el.hideCombo();
			}).bind("mouseover.com.ASC",function () {
					$(this).addClass("asc-combo-list-active");
				}).bind("mouseout.com.ASC", function () {
					$(this).removeClass("asc-combo-list-active");
				});
		},
		refreshShow: function (text) {
			if ($$.isNull(text) || $$.isEmptyString(text)) {
				text = this.text;
			}
			if (this.getInputValue() !== text) {
				$(this.input).val(text);
			}
		},
		_getText: function(record){
			var textField = this.textField,
				tpl = this.tpl;
			//${USRS_NM}[${USRS_NO}]
			if (tpl) {
				var matchs = tpl.match(/\$\{[\w]+\}/gi),
					temp = "",
					re_match, i = 0 , len = matchs.length;
				for (; i < len ;i++) {
					if (temp == "") {
						temp = tpl;
					}
					
					var re_match = matchs[i].replace(/[\$\{\}]/gi,"");
					temp = temp.replace(matchs[i],record[re_match]);
				}
				return temp;
			} else {
				return record[textField];
			}
		},
		loadComboData: function (data, must, search) {
			var comboData = this.comboData;
			
			if (search || must || (data instanceof Array && data != comboData)) {
				if (!search && data) {
					this.comboData = data;
					this.value = this.value || "";
					this.text = this.text || "";
					this.refreshShow();
				}
				if (!this.combo) {
					this._initCombo();
				} else {
					var $ul = $("ul", this.combo),
						textField = this.textField, valueField = this.valueField, record, li;
					$ul.empty();
					for (var i = 0, ii = data.length; i < ii; i++) {
						record = data[i];
						li = $("<li class=\"asc-combo-list-item " + (record[valueField] == this.value ? "asc-combo-list-selected" : "") + "\">" + this._getText(record) + "</li>").appendTo($ul)[0];
						li.record = record;
						record["-item"] = li;
					}
					this._initComboEvents();
				}
			}
		},
		changeComboView: function () {
			this[this.isShowing ? "hideCombo" : "showCombo"]();
		},
		layout: function () {
			var dom = this.dom,
				HtmlUtil = UTIL.Html;
			var ftop2body = HtmlUtil.ftop2body(dom),
				fleft2body = HtmlUtil.fleft2body(dom),
				comboW = $(this.combo).width(),
				comboH = $(this.combo).height();
			var left = fleft2body + comboW > $(window).width() ? ($(window).width() - comboW) : fleft2body + 1,
				top = ftop2body + $(this.input).height() + 4 + comboH < $(window).height() || ftop2body < comboH ? (ftop2body + $(this.input).height() + 4) : ftop2body - comboH;
			$(this.combo).css({left: left + "px", top: top + "px"}).show();
		},
		showCombo: function () {
			if (this.isShowing === false) {
				!this.combo && this._initCombo();
				this._resizeComboList();
				this.layout();
				$(this.input).focus();
				this.isShowing = true;
				this.trigger("onComboShow");
			}
		},
		_resizeComboList: function () {
			$(this.combo).addClass(this.comboListCss).css({
				"width": this.comboWidth || ($(this.dom).width() - 2)
			});
			var combo = this.combo;
			setTimeout(function () {
				var selectedLi = $("ul li.asc-combo-list-selected", combo);
				if (selectedLi[0]) {
					var comboHeight = $(combo).height(),
						li2top = selectedLi.position().top + selectedLi.height() / 2;
					if (li2top > comboHeight) {
						$(combo).scrollTop(li2top - comboHeight / 2);
					}
				}
			}, 0);
		},
		hideCombo: function () {
			if (this.isShowing === true) {
				$(this.combo).hide();
				this.isShowing = false;
			}
		},
		disable: function () {
			this.hideCombo();
			$(this.arrow).css("cursor", "auto");
			this.enabled = false;
			INPUT.prototype.disable.call(this);
		},
		enable: function () {
			this.hideCombo();
			this.enabled = true;
			$(this.arrow).css("cursor", "pointer");
			INPUT.prototype.enable.call(this);
		},
		_transformInputEvent: function () {
			INPUT.prototype._transformInputEvent.call(this);
			var el = this;
			$(this.arrow).bind("click.com.ASC", function (e) {
				el.trigger("onArrowClick", e);
			});
		}
	};
};

$$.loadCss("form/combo.css", true);

$$.define('form.Combo', ['form.Input', "core.Util", "data.ComboData"], Combo);

})(window.jQuery, window.com.pouchen);