(function ($, $$) {
var calendar = function(UICONTROL, UTIL){
	var DATEUTIL = UTIL.Date;
	return {
		extend: UICONTROL,
		_defCfg: {
			width: 180,
			height: 180,
			value: null
		},
		format: "yyyy/mm/dd",
		weekMsg: ["日", "一", "二", "三", "四", "五", "六"],
		monthMsg: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
		strMsg: ["年", "月", "日", "時", "分", "秒", "今天", "關閉", "清除"],
		domCls: "calendar-container",
		ctor: function(opts){
			var now = new Date();
			now.setHours(0, 0, 0, 0);
			this.now = new Date(now);
			
			(!this.value) && (this.value = new Date());
			this.value.setHours(0, 0, 0, 0);
			
			this.initMinMax();
			this.renderPanel();
			
			this.resize();
		},
		doResize: function(width, height){
			var headerDom = this.getHeaderDom(),
				footerDom = this.getFooterDom(),
				bodyDom = this.getBodyDom(),
				selectDom = this.getSelectDom();
			
			bodyDom.height(height - (headerDom.height() + footerDom.height() + 1));
			selectDom.width(width - 2).height(height - 2);
		},
		initMinMax: function(){
			var now = this.now,
				dt = this.dateType,
				min, max, d;
			if (dt == "BeforeToday") {
				max = new Date(now);
				this.max = max;
			} else if (dt == "AfterToday") {
				min = new Date(now);
				this.min = min;
			} else if (dt == "InThisMonth") {
				min = new Date(now);
				max = new Date(now);
				min.setDate(1);
				max.setMonth(max.getMonth()+1, 1);
				max.setDate(max.getDate()-1);
				this.min = min;
				this.max = max;
			} else if (dt == "InThisWeek") {
				min = new Date(now);
				max = new Date(now);
				d = min.getDay();
				min.setDate(min.getDate() - d);
				max.setDate(max.getDate() + (6 - d));
				this.min = min;
				this.max = max;
			}
			//InThisYear
		},
		renderPanel: function(){
			var html = "<div class=\"calendar-header\"></div>" +
						"<div class=\"calendar-body\"></div>" +
						"<div class=\"calendar-footer\"></div>" +
						"<div class=\"calendar-select\"></div>";
			$(html).appendTo(this.dom);
			
			this.renderHeader();
			this.renderFooter();
			this.renderBody(true);
			this.renderYM();
			this.initEvents();
		},
		getHeaderDom: function(){
			return $(".calendar-header", this.dom);
		},
		getBodyDom: function(){
			return $(".calendar-body", this.dom);
		},
		getFooterDom: function(){
			return $(".calendar-footer", this.dom);
		},
		getSelectDom: function(){
			return $(".calendar-select", this.dom);
		},
		renderHeader: function(){
			var el = this,
				headerDom = this.getHeaderDom();
			
			var html = "<table cellpadding='0' cellspacing='0' align='center' style='width: 100%;'>";
			html += "<tr class='calendar-header-tr'><td align='left' nowrap=nowrap>";
			html += '<label class="calendar-pointFirst calendar-label-preyear"> &nbsp; </label>';
			html += '<label class="calendar-pointPrev calendar-label-premonth"> &nbsp; </label>';
			html += '</td><td align="center">';
			html += '<a href="#" class="calendar-ymshow">' + DATEUTIL.format(this.value, 'yyyy/mm') + '</a>';
			html += '</td><td  align="right" nowrap=nowrap>';
			html += '<label class="calendar-pointNext calendar-label-nextmonth"> &nbsp; </label>';
			html += '<label class="calendar-pointLast calendar-label-nextyear"> &nbsp; </label>';
			html += '</td></tr></table>';
			
			headerDom.html(html);
			
			headerDom.find(".calendar-label-preyear").click(function(){
				var val = el.getValue();
				el.setValue(val.setFullYear(val.getFullYear()-1));
			});
			headerDom.find(".calendar-label-premonth").click(function(){
				var val = el.getValue();
				el.setValue(val.setMonth(val.getMonth()-1));
			});
			headerDom.find(".calendar-label-nextmonth").click(function(){
				var val = el.getValue();
				el.setValue(val.setMonth(val.getMonth()+1));
			});
			headerDom.find(".calendar-label-nextyear").click(function(){
				var val = el.getValue();
				el.setValue(val.setFullYear(val.getFullYear()+1));
			});
		},
		refreshHeader: function(){
			var headerDom = this.getHeaderDom();
			
			headerDom.find(".calendar-ymshow").html(DATEUTIL.format(this.value, 'yyyy/mm'));
			
		},
		renderFooter: function(){
			var el = this,
				footerDom = this.getFooterDom();
			
			var html = '<table cellpadding="0" cellspacing="0" style="width: 100%;height: 100%;"><tr class="calendar-footer-tr">';
			html += '<td align="center" class="calendar-border">';
			html += '<label class="calendar-today calendar-btn">今天</label>';
			html += '</td></tr></table>';
			
			footerDom.html(html);
			
			footerDom.find(".calendar-today").click(function(){
				el.setValue(el.now);
			});
		},
		focus: function(){
			
		},
		renderYM: function(){
			var el = this,
				selectDom = this.getSelectDom(),
				currMonth = this.currMonth + 1,
				monthMsg = this.monthMsg,
				i = 0, len = monthMsg.length;
			
			var html = "<table cellpadding='0' cellspacing='0' style='width: 100%;height:100%;'><tr class='calendar-select-td' style='height: 30px'><td colspan='3' align='center'>";
			html += '<label class="calendar-pointPrev calendar-label-input-preyear"> &nbsp;&nbsp;&nbsp;&nbsp; </label>';
			html += '<input type="text" class="calendar-input-year" size="4" value="' + this.currYear + '"/>';
			html += '<label class="calendar-pointNext calendar-label-input-nextyear"> &nbsp;&nbsp;&nbsp;&nbsp; </label>';
			html += "</td>";
			for (; i < len; i++) {
				if (i % 3 == 0) {
					html += (i == 0) ? "<tr>" : "</tr><tr>";
				}
				html += '<td class="calendar-td asc-calendar-ymlbl' + (currMonth == monthMsg[i] ? ' calendar-selected' : '') + '" align="center" nowrap=nowrap>' + monthMsg[i] + '</td>';
			}
			html += "</tr><tr class='calendar-head-tr'><td align='center' colspan='3'><label class='calendar-select-ok calendar-btn'>確定</label>&nbsp;&nbsp;<label class='calendar-select-cancel calendar-btn'>取消</label></td></tr>";
			
			selectDom.hide().html(html);
			
			$('.calendar-td', selectDom).hover(function(){
				$(this).addClass('calendar-mouseover');
			}, function(){
				$(this).removeClass('calendar-mouseover');
			}).click(function(){
				if (!$(this).hasClass('calendar-selected')) {
					$(".calendar-selected", selectDom).removeClass('calendar-selected');
					$(this).addClass('calendar-selected');
				}
			});
			
			$('.calendar-label-input-preyear', selectDom).click(function(){
				var input = $(".calendar-input-year", selectDom),
					year = Number(input.val());
				
				input.val(year-1);
			});
			
			$('.calendar-label-input-nextyear', selectDom).click(function(){
				var input = $(".calendar-input-year", selectDom),
					year = Number(input.val());
				
				input.val(year+1);
			});
			
			$('.calendar-select-ok', selectDom).click(function(){
				var mon = parseInt($(".calendar-selected", selectDom).html()),
					year = Number($(".calendar-input-year", selectDom).val()),
					val = el.getValue();
				
				el.setValue(val.setFullYear(year, mon-1));
				
				selectDom.slideToggle();
			});
			$('.calendar-select-cancel', selectDom).click(function(){
				selectDom.slideToggle();
			});
		},
		refreshYM: function(){
			var val = this.value,
				currMonth = this.currMonth,
				selectDom = this.getSelectDom(),
				dom = $($(".calendar-td", selectDom)[currMonth]);
			
			$(".calendar-input-year", selectDom).val(this.currYear);
			
			if (!dom.hasClass('calendar-selected')) {
				$(".calendar-selected", selectDom).removeClass('calendar-selected');
				dom.addClass('calendar-selected');
			}
			
		},
		renderBody: function(must){
			var el = this,
				bodyDom = this.getBodyDom(),
				thisVal = this.getValue(),
				_currYear = thisVal.getFullYear(),
				_currMon = thisVal.getMonth(),
				now = this.now,
				max = this.max,
				min = this.min,
				format = this.format,
				weekName = this.weekMsg,
				nowTime = now.getTime(),
				valueDate = thisVal.getDate(),
				i = 0, len = weekName.length,
				html, tmpd, time, date;
			
			var SELECTEDCSS = "calendar-selected";
			
			this.focus();
			if (!must && this.currYear == _currYear && this.currMonth == _currMon) {
				$("."+SELECTEDCSS, bodyDom).removeClass(SELECTEDCSS);
				$('[title="' + new String(DATEUTIL.format(thisVal, format)) + '"]', bodyDom).addClass(SELECTEDCSS);
				return;
			}
			this.currYear = _currYear;
			this.currMonth = _currMon;
			
			html = "<table cellpadding='0' cellspacing='0' align='center' style='width: 100%;height: 100%;'>";
			html += "<tr class='asc-calendar-head-td' style='height: 30px;'>";
			for (; i < len; i++) {
				html += '<th class="asc-calendar-head-td">' + weekName[i] + '</th>';
			}
			html += "</th></tr>";
			
			tmpd = new Date(thisVal);
			tmpd.setDate(1);
			tmpd.setDate(-tmpd.getDay() + 1);

			if (tmpd.getDate() == 1) {
				tmpd.setDate(-6);
			}
			if (max) {
				max = max.getTime();
			}
			if (min) {
				min = min.getTime();
			}
			for (i = 0; i < 42; i++) {
				time = tmpd.getTime();
				date = tmpd.getDate();
				if (i % 7 == 0) {
					html += (i == 0) ? "<tr>" : "</tr><tr>";
				}
				html += '<td class="calendar-td ' + this.getTdCls(tmpd);
				if (tmpd.getMonth() != _currMon) {
					html += ' calendar-daynicm';
				} else {
					(i % 7 == 0) && (html += ' calendar-Sun');
					(i % 7 == 6) && (html += ' calendar-Sat');
				}
				if (max && max < time) {
					html += " calendar-out-day";
				} else if (min && min > time) {
					html += " calendar-out-day";
				}
				
				if (time == nowTime) {
					html += ' calendar-today';
				}
				if (tmpd.getMonth() == _currMon && date == valueDate) {
					html += ' calendar-selected';
				}
				html += '" align="center" time="'+time+'" title="' + DATEUTIL.format(tmpd, format) + '">' + this.getDayInfo(date, tmpd) + '</td>';
				tmpd.setDate(date + 1);
			}
			
			html += '</tr></table>';
			bodyDom.html(html);
			
			$(".calendar-td:not(.calendar-out-day)", bodyDom).hover(function(){
				$(this).addClass("calendar-mouseover");
			}, function(){
				$(this).removeClass("calendar-mouseover");
			}).click(function(){
				el.setValue(new Date(Number($(this).attr("time"))), undefined, true);
			});
		},
		initEvents: function(){
			var el = this,
				headerDom = this.getHeaderDom(),
				footerDom = this.getFooterDom(),
				bodyDom = this.getBodyDom(),
				selectDom = this.getSelectDom();
			
			headerDom.find(".calendar-ymshow").click(function(){
				el.refreshYM();
				selectDom.slideToggle();
			});
		},
		getTdCls: function(){
			return "";
		},
		getDayInfo: function(day, date){
			return day;
		},
		getValue: function(){
			return new Date(this.value);
		},
		setValue: function(value, sender, inner){
			var d;
			if (DATEUTIL.isDate(value)) {
				d = new Date(value);
			} else {
				d = new Date();
			}
			d.setHours(0, 0, 0, 0);
			if (this.value.getTime() === d.getTime()) {
				return;
			}
			if (this.trigger("onSetValuing", sender, d, inner) === false) {
				return;
			};
			this.value = d;
			this.refreshHeader();
			this.renderBody();
			this.trigger("onSetValued", sender, d, inner);
		},
		setRange: function(min, max){
			if (min) {
				this.min = new Date(min);
			} else if (min === null) {
				this.min = undefined;
			}
			if (max) {
				this.max = new Date(max);
			} else if (max === null) {
				this.max = undefined;
			}
			
			this.renderBody(true);
		}
	};
}

$$.loadCss("form/calendar.css", true);

$$.define("form.Calendar", ["core.UIControl", "core.Util"], calendar);

})(window.jQuery, window.com.pouchen);