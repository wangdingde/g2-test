(function($, $$){

var querybody = function(BASEFORMBODY, BUTTON, ADQBUTTON, ICONS){
	return {
		extend: BASEFORMBODY,
		ctor: function(opts){
			
		},
		getOpt: function(opt, val){
			if (!opt) {
				opt = "%%";
			}
			if (opt === "=") {
				opt = " = ";
			} else if (opt === "<=") {
				opt = " <= ";

			} else if (opt === "<>") {
				opt = " <> ";
			} else if (opt === "%%") {
				opt = " LIKE ";
				val = "%" + val + "%";
			} else if (opt === "%=") {
				opt = " LIKE ";
				val = "%" + val;
			} else if (opt === "=%") {
				opt = " LIKE ";
				val = val + "%";
			} else if (opt === ">=") {
				opt = " >= ";
			} else if (opt === ">") {
				opt = " > ";
			} else if (opt === "<") {
				opt = " < ";
			}
			
			return {
				opt: opt,
				val: val
			};
		},
		onQuery: function(){
			var items = this.items,
				whereStr = "", params = {},
				i = 0, len = items.length, 
				item, field, value, res, must, opt;
			
			for (; i < len; i++) {
				item = items[i];
				field = item.field;
				fieldEl = item.fieldEl;
				value = item.getValue && item.getValue();
				must = item.must || (fieldEl ? fieldEl.must : false);
				opt = item.opt || (fieldEl ? fieldEl.opt : "");
				if (must && !value) {
					alert("請輸入必須條件" + (item.label ? ("["+item.label.text+"]") : ""));
					item.focus && item.focus();
					return false;
				}
				if (field && value) {
					res = this.getOpt(opt, value);
					whereStr += (whereStr ? " AND " : "") + field + res.opt +":" + field;
					params[field] = res.val;
				}
			}
			
			//log(whereStr);
			//log(params);
			var mname = this.getMname();
			
			if (mname) {
				$$.Data.loadRemoteData({mname: mname, whereStr: whereStr, parmMap: params, opType: 1, clearData: true});
			}
		},
		getMname: function(){
			var mdl = this.mname || this.model || (this.unit ? this.unit.mdl : null);
			
			return this.mname || mdl.mname;
		},
		initModel: function(){
			
		},
		_buttons: [{
			xtype: BUTTON,
			icon: ICONS.SEARCH,
			text: "查詢",
			handler: function(){
				this.container.onQuery();
			}
		}],
		_initItems: function(opts){
			var items = opts.items,
				btns = this._buttons,
				mname = this.getMname();
			
			items = items.concat(btns);
			
			if (mname) {
				items.push({
					xtype: ADQBUTTON,
					icon: ICONS.SEARCH,
					unit: {
						mname: mname
					}
				});
			}
			
			this.add(items);
		}
	};
};
	
var queryform = function(BASEFORM){
	return {
		extend: BASEFORM,
		defBodyType: "form.QueryFormBody"
	};
};

$$.define("form.QueryFormBody", ["form.BaseFormBody", "form.Button", "form.AdqButton", "tools.Icons"], querybody);

$$.define("form.QueryForm", ["form.BaseForm"], queryform);
	
})(window.jQuery, window.com.pouchen);