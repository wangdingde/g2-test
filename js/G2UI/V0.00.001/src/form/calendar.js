(function ($, $$) {
var Calendar = function (uictrl) {
	return {
		extend: uictrl,
		defaultOpts: {
			format: "yyyy-mm-dd",
			width: 180,
			height: 180,
			value: null,
			now: new Date(),
			weekMsg: ["日", "一", "二", "三", "四", "五", "六"],
			monthMsg: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
			strMsg: ["年", "月", "日", "時", "分", "秒", "今天", "關閉", "清除"]
		},
		cons: function (opts) {
			this.apply(opts, this.defaultOpts);
			if (!this.dom.style.width) {
				$(this.dom).width(this.width);
			}
			if (!this.dom.style.height) {
				$(this.dom).height(this.height);
			}
			this.creat();
		},
		creat: function () {
			(!this.value) && (this.value = new Date());
			this.value.setHours(0, 0, 0, 0);
			this.now.setHours(0, 0, 0, 0);
			this.render();
		},
		show: function () {
			$(this.dom).show();
			this.setActive();
		},
		setActive: function () {
			$('a.asc-calendar-ymshow', this.headDiv).focus();
		},
		render: function () {
			$(this.dom).addClass('asc-calendar-calendar');
			this.mainDiv = $(this.dom);
			this.createHeadTable();
			var bodyDiv = $('<div class="asc-calendar-bodyDiv" style="position:relative;"></div>');
			this.bodyDiv = bodyDiv;
			this.createBodyTable();
			this.mainDiv.append(bodyDiv);
			this.createFootTable();
			this.createYearMonthDiv();
			this.bodyBtnEvent();
			$(this.bodyDiv).css({'height': $(this.mainDiv).height() - 47});
		},
		createHeadTable: function () {
			var headDiv = $('<div style="margin: 0;width: 100%;position:relative;top:0px;"></div>');
			var tableStr = "<table cellpadding='0' cellspacing='0' align='center' style='width: 100%;'>";
			tableStr += "<tr class='asc-calendar-head-tr'><td align='left' nowrap=nowrap>";
			tableStr += '<label class="asc-calendar-pointFirst asc-calendar-label-preyear" style="margin-left: 2px;margin-right: 5px"> &nbsp; </label>';
			tableStr += '<label class="asc-calendar-pointPrev asc-calendar-label-premonth"> &nbsp; </label>';
			tableStr += '</td><td align="center">';
			tableStr += '<a href="#" style="cursor: pointer;text-decoration: none;" class="asc-calendar-ymshow">' + $$.Util.Date.format(this.value, 'yyyy/mm') + '</a>';
			tableStr += '</td><td  align="right" nowrap=nowrap>';
			tableStr += '<label class="asc-calendar-pointNext asc-calendar-label-nextmonth"> &nbsp; </label>';
			tableStr += '<label class="asc-calendar-pointLast asc-calendar-label-nextyear" style="margin-left: 2px;margin-right: 2px;"> &nbsp; </label>';
			tableStr += '</td></tr></table>';
			headDiv.html(tableStr);
			this.headDiv = headDiv;
			this.mainDiv.append(headDiv);
		},
		createBodyTable: function () {
			var _year = this.value.getFullYear();
			var _mon = this.value.getMonth();
			this.setActive();
			if (this.currYear == _year && this.currMonth == _mon) {
				$('td.asc-calendar-selected', this.bodyDiv).removeClass("asc-calendar-selected");
				$('td[title="' + new String($$.Util.Date.format(this.value, this.format)) + '"]', this.bodyDiv).addClass("asc-calendar-selected");
				return;
			}
			this.currYear = _year;
			this.currMonth = _mon;
			var weekName = this.weekMsg, k;
			var tableStr = "<table cellpadding='0' cellspacing='0' align='center' style='width: 100%;height: 100%;'>";
			tableStr += "<tr class='asc-calendar-head-td' style='height: 30px;'>";
			for (k = 0; k < weekName.length; k++) {
				tableStr += '<th class="asc-calendar-head-td">' + weekName[k] + '</th>';
			}
			tableStr += "</th></tr>";
			var tmpd = new Date(this.value);
			tmpd.setDate(1);
			tmpd.setDate(-tmpd.getDay() + 1);

			if (tmpd.getDate() == 1) {
				tmpd.setDate(-6);
			}
			for (k = 0; k < 42; k++) {
				if (k % 7 == 0) {
					(k == 0) ? tableStr += "<tr>" : tableStr += "</tr><tr>";
				}
				tableStr += '<td class="asc-calendar-td ' + this.getTdClass(tmpd);
				if (tmpd.getMonth() != this.currMonth) {
					tableStr += ' asc-calendar-daynicm';
				} else {
					(k % 7 == 0) && (tableStr += ' asc-calendar-Sun');
					(k % 7 == 6) && (tableStr += ' asc-calendar-Sat');
				}
				if (tmpd.getTime() == this.now.getTime()) {
					tableStr += ' asc-calendar-today';
				}
				if (tmpd.getMonth() == this.currMonth && tmpd.getDate() == this.value.getDate()) {
					tableStr += ' asc-calendar-selected';
				}
				tableStr += '" align="center" title="' + $$.Util.Date.format(tmpd, this.format) + '">' + this.getDayInfo(tmpd) + '</td>';
				tmpd.setDate(tmpd.getDate() + 1);
			}
			tableStr += '</tr></table>';
			this.bodyDiv.html(tableStr);
			var _this = this;
			$('table tr td', this.bodyDiv).css({'cursor': 'pointer'});
			$('table tr td', this.bodyDiv).hover(
				function () {
					$(this).addClass('asc-calendar-mouseover');
				},
				function () {
					$(this).removeClass('asc-calendar-mouseover');
				}
			).click(function () {
					_this.setValue($$.Util.Date.parse($(this).attr('title'), _this.format), _this.dom);
				});
		},
		createFootTable: function () {
			var footDiv = this.footDiv = $('<div class="asc-calendar-footDiv" style="margin: 0;width: 100%;height: 27px;position:relative;bottom:0px;"></div>').appendTo(this.mainDiv);
			var tableStr = '<table cellpadding="0" cellspacing="0" style="width: 100%;height: 100%;"><tr class="asc-calendar-head-tr"><td align="center" nowrap=nowrap>';
			tableStr += '<label></label><label></label><label></label>';
			tableStr += '</td><td align="center" class="asc-calendar-border">';
			tableStr += '<label class="asc-input-today asc-calendar-btn">' + (this.strMsg[6]) + '</label>';
			tableStr += '</td></tr></table>';
			footDiv.html(tableStr);
			$('tr td label', footDiv).hover(
				function () {
					$(this).addClass('asc-calendar-mouseover');
				},
				function () {
					$(this).removeClass('asc-calendar-mouseover');
				}
			);
		},
		createYearMonthDiv: function () {
			var yearMonthDiv = this.yearMonthDiv = $('<div style="position: absolute;left: ' + $(this.mainDiv).position().left + ';top:' + (($(this.bodyDiv).position().top)) + 'px;width:' + $(this.mainDiv).width() + 'px;height:' + ($(this.mainDiv).height() - $(this.headDiv).height()) + 'px;"></div>').appendTo(this.mainDiv);
			var tableStr = "<table cellpadding='0' cellspacing='0' style='margin:0;width:100%;height:100%; background: #ffffff'><tr class='asc-calendar-head-td' style='height: 30px'><td colspan='3' align='center'>";
			tableStr += '<label style="cursor: pointer;margin-right: 5px;" class="asc-calendar-pointPrev asc-calendar-label-input-preyear"> &nbsp;&nbsp;&nbsp;&nbsp; </label>';
			tableStr += '<input type="text" class="asc-calendar-input-year" size="4" value="' + $$.Util.Date.format(this.value, 'yyyy') + '"/>';
			tableStr += '<label style="cursor: pointer;margin-left: 5px;" class="asc-calendar-pointNext asc-calendar-label-input-nextyear"> &nbsp;&nbsp;&nbsp;&nbsp; </label>';
			tableStr += "</td>";
			for (var i = 0; i < this.monthMsg.length; i++) {
				if (i % 3 == 0) {
					(i == 0) ? tableStr += "<tr>" : tableStr += "</tr><tr>";
				}
				tableStr += '<td style="cursor: pointer;" class="asc-calendar-td asc-calendar-ymlbl' + (this.currMonth + 1 == this.monthMsg[i] ? ' asc-calendar-selected' : '') + '" align="center" nowrap=nowrap>' + this.monthMsg[i] + '</td>';
			}
			tableStr += "</tr><tr class='asc-calendar-head-tr'><td align='center' colspan='3'><label class='ymBtnAffrim asc-calendar-btn' style='margin-right: 5px;cursor: pointer;'>確定</label>&nbsp;&nbsp;<label class='ymBtnCancel asc-calendar-btn' style='cursor: pointer;'>取消</label></td></tr>";
			yearMonthDiv.html(tableStr);
			$(yearMonthDiv).hide();
			$('label.asc-calendar-td').hover(function () {
					$(this).addClass('asc-calendar-mouseover');
				},
				function () {
					$(this).removeClass('asc-calendar-mouseover');
				});
		},
		getDayInfo: function (date) {
			return date.getDate();
		},
		getTdClass: function (date) {
			return '';
		},
		bodyBtnEvent: function () {
			var _this = this;
			$('table tr td label', this.headDiv).hover(
				function () {
					$(this).addClass('asc-calendar-mouseover');
				},
				function () {
					$(this).removeClass('asc-calendar-mouseover');
				}
			);
			$('table tr td label.asc-calendar-label-preyear', this.headDiv).click(function () {
				var tmp = new Date(_this.getValue());
				tmp.setYear(tmp.getFullYear() - 1);
				_this.setValue(tmp);
			});
			$('table tr td label.asc-calendar-label-nextyear', this.headDiv).click(function () {
				var tmp = new Date(_this.getValue());
				tmp.setYear(tmp.getFullYear() + 1);
				_this.setValue(tmp);
			});
			$('table tr td label.asc-calendar-label-premonth', this.headDiv).click(function () {
				var tmp = new Date(_this.getValue());
				tmp.setMonth(tmp.getMonth() - 1);
				_this.setValue(tmp);
			});
			$('table tr td label.asc-calendar-label-nextmonth', this.headDiv).click(function () {
				var tmp = new Date(_this.getValue());
				tmp.setMonth(tmp.getMonth() + 1);
				_this.setValue(tmp);
			});
			$('table tr td.asc-calendar-ymlbl', this.yearMonthDiv).hover(
				function () {
					$(this).addClass('asc-calendar-mouseover');
				},
				function () {
					$(this).removeClass('asc-calendar-mouseover');
				}
			);
			$('table tr td a.asc-calendar-ymshow', this.headDiv).click(function () {
				$(_this.yearMonthDiv).show();
				$('input.asc-calendar-input-year', _this.yearMonthDiv).focus();
			});
			$('td.asc-calendar-ymlbl', this.yearMonthDiv).click(function () {
				$('td.asc-calendar-selected', _this.yearMonthDiv).removeClass('asc-calendar-selected');
				$(this).addClass('asc-calendar-selected');
				$(_this.yearMonthDiv).show();
			});
			$('label.asc-calendar-label-input-preyear', this.yearMonthDiv).click(function () {
				var txt = $('input.asc-calendar-input-year', _this.yearMonthDiv);
				var oldVal = txt.val();
				txt.val(Number(oldVal) - 1);
			});
			$('label.asc-calendar-label-input-nextyear', this.yearMonthDiv).click(function () {
				var txt = $('input.asc-calendar-input-year', _this.yearMonthDiv);
				var oldVal = txt.val();
				txt.val(Number(oldVal) + 1);
			});
			$('label.ymBtnAffrim', this.yearMonthDiv).click(function () {
				var _y = $('input.asc-calendar-input-year', _this.yearMonthDiv).val();
				if (!isNaN(_y)) {
					var tmp = new Date(_this.getValue());
					tmp.setFullYear(_y);
					tmp.setMonth(Number($('td.asc-calendar-selected', _this.yearMonthDiv).text()) - 1);
					_this.setValue(tmp);
					$(_this.yearMonthDiv).hide();
				}
			});
			$('label.ymBtnCancel', this.yearMonthDiv).click(function () {
				$(_this.yearMonthDiv).hide();
			});
			$('label.asc-input-today').click(function () {
				var tmp = new Date();
				tmp.setHours(0, 0, 0, 0);
				_this.setValue(tmp, _this.dom);
			});

			$(this.headDiv).keydown(function (e) {
				var oldVal = new Date(_this.value);
				var flag = false;
				switch (e.which) {
					case 37:
						if (e.ctrlKey) {
							oldVal.setMonth(oldVal.getMonth() - 1); //左
						} else {
							oldVal.setDate(oldVal.getDate() - 1);
						}
						flag = true;
						break;
					case 38:
						if (e.ctrlKey) {
							oldVal.setFullYear(oldVal.getFullYear() - 1); //上
						} else {
							oldVal.setDate(oldVal.getDate() - 7);
						}
						flag = true;
						break;
					case 39:
						if (e.ctrlKey) {
							oldVal.setMonth(oldVal.getMonth() + 1); //右
						} else {
							oldVal.setDate(oldVal.getDate() + 1);
						}
						flag = true;
						break;
					case 40:
						if (e.ctrlKey) {
							oldVal.setFullYear(oldVal.getFullYear() + 1); //下
						} else {
							oldVal.setDate(oldVal.getDate() + 7);
						}
						flag = true;
						break;
					case 13:
						_this.setValue(oldVal, _this.dom);
						return false;
				}
				if (flag) {
					_this.setValue(oldVal);
					return false;
				}
			});
			this.bind("onSetValue", function (value) {
				var _this = this;
				var txt = $('input.asc-calendar-input-year', _this.yearMonthDiv);
				var monTxt = $('td.asc-calendar-selected', _this.yearMonthDiv);
				if (this.currYear != Number(txt.text())) {
					txt.val(_this.currYear);
				}
				if (_this.currMonth != Number(monTxt.text()) - 1) {
					monTxt.removeClass('asc-calendar-selected');
					$('td.asc-calendar-ymlbl', _this.yearMonthDiv).each(function () {
						var txt = Number($(this).text());
						if ((txt - 1) == _this.currMonth) {
							$(this).addClass("asc-calendar-selected");
						}
					});
				}
				$('table tr td label[title="' + (_this.currMonth + 1 < 10 ? '0' : '') + (_this.currMonth + 1) + '"]', _this.yearMonthDiv).addClass('asc-calendar-selected');

				$('a.asc-calendar-ymshow', this.headDiv).html($$.Util.Date.format(new Date(this.getValue()), 'yyyy/mm'));
			});
		},
		getValue: function () {
			return this.value;
		},
		setValue: function (value, sender) {
			this.value = value;
			this.value.setHours(0, 0, 0, 0);
			this.createBodyTable();
			this.trigger("onSetValue", sender, value);
		}
	};
};

$$.define("form.InputBox", ["core.UIControl"], Calendar);

})(window.jQuery, window.com.pouchen);