(function($, $$){
var util = function(){
return {
	root: true, //root表示直接暴露在$$下面, global表示直接暴露在window下面
	static: true, //static表示这是一个纯静态class
	Date: {
		defStr: "yyyy/mm/dd",
		format: function(value,formatStr){
			//TODO
			//value can be a Date or a dateStr
			//if formatStr is not defined, use the defStr
			if(!this.isDate(value)){throw new Error(value+" Is An Invalid Date");}
			var value = new Date(value);
			!formatStr && (formatStr = this.defStr);
			var code = this.getFormatCode(formatStr);
			return (new Function("return "+ code)).call(value);
		},
		formatCodes: {
			yyyy: "$$.Util.String.lpad(this.getFullYear(), 4, '0')",
			yy: "('' + this.getFullYear()).substring(2, 4)",
			mm: "$$.Util.String.lpad(this.getMonth()+1, 2, '0')",
			m: "(this.getMonth()+1)",
			MM: "$$.Util.Date.monthNames[this.getMonth()]",
			M: "$$.Util.Date.getShortMonthName(this.getMonth())",
			dd: "$$.Util.String.lpad(this.getDate(),2,'0')",
			d: "this.getDate()",
			D: "this.getDate()+(this.getDate() > 3 ? 'th' : (this.getDate() == 1 ? 'st' : (this.getDate() == 2 ? 'nd' : 'rd')))",
			W: "$$.Util.Date.getShortDayName(this.getDay())",
			WW: "$$.Util.Date.dayNames[this.getDay()]",
			H: "this.getHours()",
			HH: "$$.Util.String.lpad(this.getHours(), 2, '0')",
			h: "(this.getHours() == 12 ? 12 : this.getHours()%12)",
			hh: "$$.Util.String.lpad(this.getHours() == 12 ? 12 : this.getHours()%12, 2, '0')",
			mi: "this.getMinutes()",
			MI: "$$.Util.String.lpad(this.getMinutes(), 2, '0')",
			s: "this.getSeconds()",
			ss: "$$.Util.String.lpad(this.getSeconds(), 2, '0')",
			a: "(this.getHours() < 12 ? 'am' : 'pm')",
			A: "(this.getHours() < 12 ? 'AM' : 'PM')"
			//TODO
			//D st, nd, rd or th. Works well
			//Week of Month
			//Week of Year
			//Day of Year
			//minimum 
		},
		parseCodes: {
			yyyy: {
				l: 1,
				c: "y=Number(res[{0}]);\n",
				r: "(\\d{4})"
			},
			yy: {
				l: 1,
				c: "",
				r: "(\\d{1,2})"
			},
			mm: {
				l: 1,
				c: "m=Number(res[{0}])-1;\n",
				r: "(1[0-2]|0[1-9])"
			},
			m: {
				l: 1,
				c: "m=Number(res[{0}])-1;\n",
				r: "(1[0-2]|[1-9])" 
			},
			MM: {
				l: 1,
				c: "m=$$.Util.Date.monthNames.indexOf(res[{0});\n",
				r: ""
			},
			M: {
				l: 1,
				c: "",
				r: ""
			},
			dd: {
				l: 1,
				c: "d=Number(res[{0}]);\n",
				r: "(3[0-1]|[1-2][0-9]|0[1-9])"
			},
			d: {
				l: 1,
				c: "d=Number(res[{0}]);\n",
				r: "(3[0-1]|[1-2][0-9]|[1-9])"
			},
			D: {
				l: 1,
				c: "",
				r: ""
			},
			W: {
				l: 0,
				c: "",
				r: ""
			},
			WW: {
				l: 0,
				c: "",
				r: ""
			},
			H: {
				l: 1,
				c: "h=Number(res[{0}]);\n",
				r: "(2[0-3]|1[0-9]|[0-9])"
			},
			HH: {
				l: 1,
				c: "h=Number(res[{0}]);\n",
				r: "(2[0-3]|1[0-9]|0[0-9])"
			},
			h: {
				l: 1,
				c: "h=Number(res[{0}]);\n",
				r: "(1[0-2]|[0-9])"
			},
			hh: {
				l: 1,
				c: "h=Number(res[{0}]);\n",
				r: "(1[0-2]|0[0-9])"
			},
			mi: {
				l: 1,
				c: "mi=Number(res[{0}]);\n",
				r: "([1-5][0-9]|[0-9])"
			},
			MI: {
				l: 1,
				c: "mi=Number(res[{0}]);\n",
				r: "([0-5][0-9])"
			},
			s: {
				l: 1,
				c: "s=Number(res[{0}]);\n",
				r: "([1-5][0-9]|[0-9])"
			},
			ss: {
				l: 1,
				c: "s=Number(res[{0}]);\n",
				r: "([0-5][0-9])"
			},
			a: {
				l: 1,
				c: "if (/(am)/i.test(res[{0}])) {\n"
					+ "if (!h || h == 12) { h = 0; }\n"
					+ "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
				r: "(am|pm|AM|PM)",
				calcAtEnd: true
			},
			A: {
				l: 1,
				c: "if (/(am)/i.test(res[{0}])) {\n"
					+ "if (!h || h == 12) { h = 0; }\n"
					+ "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
				r: "(AM|PM|am|pm)",
				calcAtEnd: true
			}
		},
		getFormatCode: function(formatStr){
			var ch = "",code = [],si = 4, substr = "",i = 0,sp = false;
			for(;i < formatStr.length; i++){
				ch = formatStr.charAt(i);
				if(!sp && ch == "\\"){
					sp = true;
				}else if(sp){
					sp = false;
					code[code.length] =  "'"+ch+"'";
				}else{
					substr = formatStr.substr(i,4);
					if(this.formatCodes[substr]){
						i += 3;
					}else{
						substr = formatStr.substr(i,2);
						if(this.formatCodes[substr]){
							i += 1;
						}else{
							substr = formatStr.substr(i,1);
							if(!this.formatCodes[substr]){
								code[code.length] =  "'"+ch+"'";
								continue;
							}
						}
					}
					code[code.length] = this.formatCodes[substr];
				}
			}
			return code.join("+");
		},
		createParser: function(formatStr){
			var code = [
				"var dt, y, m, d, h, mi, s, v,",
					"res = {0}.exec(input);", // either null, or an array of matched strings
					
				"if(res){",
					"v = new Date();",
					"{1}",
					"v.setFullYear(y || 1970);",
					"v.setMonth(m || 0);",
					"v.setDate(d || 1);",
					"v.setHours(h || 0);",
					"v.setMinutes(mi || 0);",
					"v.setSeconds(s || 0);",
					"v.setMilliseconds(0);",
				"}",
				"return v;"
			].join('\n');
			
			var currentGroup = 1,
				calc = [],
				regex = [],
				sp = false,
				ch = "",
				substr = "",
				i = 0,
				len = formatStr.length,
				atEnd = [],
				obj;
			for(;i < len; i++){
				ch = formatStr.charAt(i);
				if(!sp && ch == "\\"){
					sp = true;
				}else if(sp){
					sp = false;
					regex.push(ch);
				}else{
					substr = formatStr.substr(i,4);
					if(this.parseCodes[substr]){
						i += 3;
					}else{
						substr = formatStr.substr(i,2);
						if(this.parseCodes[substr]){
							i += 1;
						}else{
							substr = formatStr.substr(i,1);
							if(!this.parseCodes[substr]){
								regex.push(ch);
								continue;
							}
						}
					}
					obj = this.parseCodes[substr];
					regex.push(obj.r);
					if (obj.l && obj.c) {
						if (obj.calcAtEnd) {
							atEnd.push($$.Util.String.format(obj.c,currentGroup));
						} else {
							calc.push($$.Util.String.format(obj.c,currentGroup));
						}
					}
					currentGroup += obj.l;
				}
			}
			calc = calc.concat(atEnd);
			var str = $$.Util.String.format(code,new RegExp(regex.join('').replace(/[\/]/g,"\\/")),calc.join(''));
			var fn = new Function("input",str);
			return fn;
		},
		monthNames: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		],
		getShortMonthName : function(month) {
			return this.monthNames[month].substring(0, 3);
		},
		dayNames: [
			"Sunday",
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday"
		],
		getShortDayName : function(day) {
			return this.dayNames[day].substring(0, 3);
		},
		parse: function(value,formatStr){
			var fn = this.createParser(formatStr);
			return fn.call(this,value);
			//TODO
			//pase the value to the Date time
			//return Number of milliseconds since January 1, 1970, 00:00:00, local time
			//return null when parse fail
		},
		isDate: function(value){
			return !isNaN((new Date(value)).getTime());
		}
	},
	Number: {
		defStr: "",
		format: function(value,sp,dec){
			//TODO
			//use the # or 0 to make it strongly in feature
			if(isNaN(value)){throw new Error(value+" Is NaN!");}
			if(!sp && !dec || $$.isEmptyString(value)){return value;}
			var arr = (String(Number(value))).split(".");
			var vint = arr[0];
			var vdec = arr[1] || "";
			if(dec){
				!(dec instanceof Array) && (dec = [dec]);
				var decs = Number(dec[0]),
					decf = dec[1] || false;
				if(decs >= 0){
					vdec = vdec.substr(0,decs);
					if(decf === false){
						vdec = $$.Util.String.rpad(vdec,decs,'0');
					}
				}else if(decs < 0){
					var _len = vint.length;
					vint = $$.Util.String.rpad(vint.substr(0,_len+decs),_len,'0');
					vdec = "";
				}
			}
			if(sp){
				var _vint = "",_f = 0;
				!(sp instanceof Array) && (sp = [sp]);
				var sps = Number(sp[0]),
					spc = sp[1] || ",";
				for(var i = vint.length-1; i >= 0; i--){
					_vint = "" + vint.charAt(i) + _vint;
					if(_f++ == sps-1 && i != 0 && !(i == 1 && vint.charAt(0) == "-")){
						_vint = spc + _vint;
						_f = 0;
					}
				}
				vint = _vint;
			}
			return (vint + (vdec ? ("."+vdec) : "")); 
		},
		parse: function(value){
			//TODO
			//use the # or 0 to make it strongly in feature
			value = String(value);
			var chc=0,ch="",res = "";
			for(var i = 0, ii = value.length; i < ii; i++){
				chc = value.charCodeAt(i);
				if(chc === 46 || (chc >= 48 && chc <= 57)){
					res += value.charAt(i);
				}
			}
			return Number((value.indexOf("-") == 0 ? "-" : "") + res);
		},
		isNumber: function(value){
			return this.parse(value) === null;
		}
	},
	String: {
		format: function(){
			var str = String(arguments[0]), re, objs, i, len;
			if(!str){return;}
			objs = arguments[1];
			if (typeof objs === "object") {
				for (i in objs) {
					re = new RegExp("\\{"+objs[i]+"\\}","ig");
					str = str.replace(re,arguments[i]);
				}
			} else {
				len = arguments.length;
				for(i = 1; i < len; i++){
					re = new RegExp("\\{"+(i-1)+"\\}","ig");
					str = str.replace(re,arguments[i]);
				}
			}
			return str;
		},
		lpad: function(str,length,insChar){
			return this._getInsStr(str,length,insChar)+str;
		},
		rpad: function(str,length,insChar){
			return str+this._getInsStr(str,length,insChar);
		},
		_getInsStr: function(str,length,insChar){
			str = String(str);
			var insStr = "";
			var sl = length - str.length;
			for(var i = 0; i < sl; i++){
				insStr += insChar;
			}
			return insStr;
		}
	},
	Html: {
		ftop2body: function(ele) {
			return $(ele).offset().top;
			//return this._pos2body(ele,"top");
		},
		fleft2body: function(ele) {
			return $(ele).offset().left;
			//return this._pos2body(ele,"left");
		},
		_pos2body: function(ele,dir){
			var ttop = 0, cele = ele,
				off = dir == "left" ? "offsetLeft" : "offsetTop",
				scro = dir == "left" ? "scrollLeft" : "scrollTop";
			while (cele != undefined) {
				ttop += (cele[off] - cele[scro]);
				if (cele.nodeName.toLowerCase() == 'body') {
				  cele = undefined;
				} else {
					var p = cele.parentElement || cele.parentNode;
					var op = cele.offsetParent;
					while(p !== op){
						p = p.parentElement || p.parentNode;
						if(p !== op){
							ttop -= p[scro];
							//console.log(p);
							//console.log("===="+p[scro]);
						}
					}
					cele = op;
				}
			}
			return ttop;
		},
		getIframe: function(url){
			return '<iframe scrolling="auto" frameborder="0"  src="'+url+'" style="width:100%;height:100%;"></iframe>';
		},
		getScrollbarSize: (function(){
			var scrollbarSize;
			return function(force){
				if (force || !scrollbarSize) {
					var db = $$.getBody(),
					div = document.createElement('div');
		
					div.style.width = div.style.height = '100px';
					div.style.overflow = 'scroll';
					div.style.position = 'absolute';
		
					db.appendChild(div); // now we can measure the div...
		
					// at least in iE9 the div is not 100px - the scrollbar size is removed!
					scrollbarSize = {
						width: div.offsetWidth - div.clientWidth,
						height: div.offsetHeight - div.clientHeight
					};
		
					db.removeChild(div);
				}
				return scrollbarSize;
			};
		})(),
		doFit: function(oriWidth,oriHeight,toWidth,toHeight,offset){
			if(isNaN(offset)){offset = 0;}
			if(toWidth === null || toWidth === undefined || isNaN(toWidth)){toWidth = oriWidth;}
			if(toHeight === null || toHeight === undefined || isNaN(toHeight)){toHeight = oriHeight;}
			var rate = Number(Math.min((toWidth-offset)/oriWidth,(toHeight-offset)/oriHeight));
			rate = Math.min(rate,1);
			return {
				width: oriWidth*rate,
				height: oriHeight*rate,
				left: toWidth === oriWidth ? 0 : (toWidth-oriWidth*rate)/2,
				top: toHeight === oriHeight ? 0 : (toHeight-oriHeight*rate)/2
			};
		},
		fitPic:  function(img,offset){
			if(!img){return false;}
			if(isNaN(offset)){offset = 0;}
			var layout = doFit(img.width,img.height,$(img).parent().width(),$(img).parent().height(),offset);
			$(img).css({
				position: "absolute",
				width: layout.width+'px',
				height: layout.height+'px',
				left: layout.left+'px',
				top: layout.top+'px'
			});
			return layout;
		},
		showPic: function(container,src,toWidth,toHeight,offset){
			var pdom = $(container);
			if(!pdom[0] || !src){return;}
			var outer = $("<div style=\"position: relative;\"></div>").appendTo(pdom);
			var picDom = $("<image style=\"display: none;\" src=\""+src+"\"></image>").appendTo(document.body)[0];
			setTimeout(function(){
				var res = $$.Util.Html.doFit(picDom.width,picDom.height,toWidth,toHeight,offset);
				$(outer).css({
					width: res.width + res.left*2,
					height: res.height + res.top*2
				});
				$(picDom).css({
					position: "absolute",
					width: res.width+'px',
					height: res.height+'px',
					left: res.left+'px',
					top: res.top+'px'
				}).appendTo(outer).show();
			});
		}
	},
	SimpleValid: {
		doValid: function(ruleName,value){
			var parms = [];
			var idx = ruleName.indexOf("[");
			if(idx != -1){
				parms = (new Function("return "+ruleName.substring(idx)))();
				ruleName = ruleName.substring(0,idx);
			}
			var fn = this.validRules[ruleName];
			if(!fn){return false;}
			try{
				fn.call(this,value,parms);
			}catch(e){
				e.rule = ruleName;
				e.newVal = value;
				throw e;
			}
		},
		addRule: function(ruleName,fn){
			this.validRules[rulerName] = fn;
		},
		validRules: {
			maxLen: function(value,parms){
				if(value != "" && String(value).length > parms[0]){
					throw new Error("字符長度最大為"+parms[0]);
				}
			},
			notNull: function(value){
				if(value == "" || value == null || value == undefined){
					throw new Error("不能為空");
				}
			},
			minLen: function(value,parms){
				if(String(value).length < parms[0]){
					throw new Error("字符長度最小為"+parms[0]);
				}
			},
			numberType: function(value){
				if(value != "" && isNaN(value)){
					throw new Error(value+"不是一個數字類型");
				}
			},
			min: function(value,parms){
				if(value < parms[0]){
				throw new Error("允許的最小值為"+parms[0]);
				}
			},
			max: function(value,parms){
				if(value > parms[0]){
					throw new Error("允許的最大值為"+parms[0]);
				}
			},
			isEmail:function(value){
				if(!value){return;}
				var reg=/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
				if(!reg.test(value)){
					throw new Error("不是一个有效的EMAIL地址");
				}
			},
			isTel:function(value){
				var reg=/^((0\d{2,3}-\d{7,8})|(1[3584]\d{9})|(\d{7,8}))$/g;
				if(reg.test(value)==false){
					throw new Error('电话号码不合法');
				}
			}
			//isPhone
			//maxValue
			//minValue
			//deci
		}
	},
	Data: {
		_compClz:undefined,
		_comp:function() {
			if (!this._compClz) {
				var comp = function() {
					this.sorts = [];
				};
				comp.prototype.setSorts = function(s) {
					if (s instanceof Array){
						this.sorts = s;
						return this;
					}
					var ss = s.split(",");
					try{
						for (var i=0; i < ss.length; i++) {
							ss[i] = ss[i].trim().split(" ");
							if(!ss[i][1]){ss[i][1] = "ASC";}
							else {ss[i][1] = ss[i][1].toUpperCase();}
						}
					}catch(e){
						throw e;
					}
					this.sorts = ss;
					return this;
				}; 
				comp.prototype.compare = function(a,b) { //a,b 是map或ResultRow
					var col,dir,av,bv;
					for(var i=0; i < this.sorts.length; i++) {
						col = this.sorts[i][0];
						dir = this.sorts[i][1];
						av = a.getData && (typeof a.getData == "function") ? a.getData(col) : a[col];
						bv = b.getData && (typeof b.getData == "function") ? b.getData(col) : b[col];
						if (typeof av == "date") av = av.getTime();
						if (typeof bv == "date") bv = bv.getTime();
						if (typeof av == "string" || typeof bv == "string") {
							var cp = av.localeCompare(bv);
							if (cp == -1) {
								return dir == "ASC" ? -1 : 1;
							} else if (cp == 1) {
								return dir == "ASC" ? 1 : -1;
							}
						} else {
							if (av < bv) {
								return dir == "ASC" ? -1 : 1;
							} else if(av > bv) {
								return dir == "ASC" ? 1 : -1;
							}
						}
					}
					return 0;
				};
				this._compClz = comp;
			}
			return new this._compClz();
		},
		sort:function(dataArray,sorter) { //data是Array,内容可能是map,也可能是ResultRow
			//sorter字符串格式：“col1 ASC/DESC, col2 ASC/DESC”
			//sorter函数格式：int func(a,b)
			var rtn = [];
			for(var i=0; i<dataArray.length; i++) {
				rtn[i] = dataArray[i];
			}
			if (typeof sorter == "string" || sorter instanceof Array) {
				var cls = this._comp().setSorts(sorter);
				//return rtn.sort(cls.compare); //这样执行，compare方法的呼叫者(this)会变成其他，导致this.sorts会访问不到了！
				return rtn.sort(function(){return cls.compare.apply(cls,arguments);}); //此处会保证compare是以cls自己的身份来执行。
			} else if (typeof sorter == "function") {
				return rtn.sort(sorter);
			}
		},
		filter:function(dataArray,filter) {
			//filter格式：{where:"(col1 op1 :arg1 or col2 op2 :arg2)",args:{arg1:value1,arg2:value2}}
			//必須欄位在左，參數值在右。其他語法跟SQL的where一致
			//操作符只允許：<,<=,=,>=,>,<>,like(先按=%開頭是,%%包含,%=結尾是三種處理，先不支持like)
			//邏輯符只允許：and,or 支持圓括號包裹邏輯
			if(! dataArray instanceof Array) {return [];}
			if(dataArray.length <= 0) {return [];}
			if(!filter.where && typeof filter !== "string"){return dataArray;}
			var isUnit = dataArray[0].getData && typeof dataArray[0].getData == "function";
			var rtn = [],fnd = this._translate(filter.where || filter,isUnit);
			for(var i=0; i<dataArray.length; i++) {
				if(fnd(dataArray[i],filter.args || {})) {
					rtn[rtn.length] = dataArray[i];
				}
			}
			return rtn;
		},
		_translate:function(str,isUnit) {
			var code="",b = this._findWord(str, 0),ins = 0,col,op;
			while(b.word) {
				if(b.word=="(" || b.word==")") {
					code+=b.word;
				} else if(b.word.toLowerCase()=="or") {
					code+=" || ";
				} else if(b.word.toLowerCase()=="and") {
					code+=" && ";
				} else {
					ins++;
					if(ins==1) {
						col = b.word;
					} else if(ins==2) {
						op = b.word;
					} else if(ins==3) {
						ins=0;
						code+=this._buildStr(col,op,b.word,isUnit);
					}
				}
				b = this._findWord(str, b.index);
			}
			return new Function("data","args","return "+code+";");
		},
		_findWord:function(str,idx) {
			var rtn = "",b,ins = false;
			for(var i=idx; i<str.length; i++) {
				b = str.charAt(i);
				if(b=="'") {
					rtn+=b;
					if(rtn.length == 1) {
						ins = true;
					} else if(ins) {
						return {word:rtn,index:i+1};
					}
				} else if(b==" " || b=="\t" || b=="\r" || b=="\n") {
					if(ins) {
						rtn+=b;
					} else if(rtn.length) {
						return {word:rtn,index:i};
					}
				} else if(b=="(" || b==")") {
					if(ins) {
						rtn+=b;
					} else if(rtn.length) {
						return {word:rtn,index:i};
					} else {
						return {word:b,index:i+1};
					}
				} else {
					rtn+=b;
				}
			}
			return {word:rtn,index:i};
		},
		_buildStr:function(col,op,val,isUnit) {
			col = this._buildCol(col,isUnit);
			val = this._buildArg(val);
			if(op=="%%") {
				return col +".indexOf("+ val +") >=0";
			} else if(op=="=%") {
				return col +".indexOf("+ val +") ==0";
			} else if(op=="%=") {
				return col +".lastIndexOf("+ val +") + "+ val +".length == "+ col +".length";
			} else if(op=="<>") {
				return col +" != "+ val;
			} else if(op=="=") {
				return col +" == "+ val;
			} else {
				return col +" "+ op +" "+ val;
			}
		},
		_buildCol:function(col,isUnit) {
			return isUnit ? "data.getData(\""+ col +"\")" : "data[\""+ col +"\"]" ;
		},
		_buildArg:function(val) {
			if(val.charAt(0) == ":") {
				val = val.substr(1);
				return "args[\""+ val +"\"]";
			} else {
				//return "\""+val+"\"";
				return val;
			}
		}
	}
};
};

$$.define("core.Util", [], util);
	
})(window.jQuery, window.com.pouchen);