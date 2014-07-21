(function($, $$){

var querybody = function(BASEFORMBODY, BUTTON, ICONS){
	return {
		extend: BASEFORMBODY,
		ctor: function(opts){
			
		},
		onQuery: function(){
			var items = this.items,
				whereStr = "", params = {},
				i = 0, len = items.length, 
				item, field, value;
			
			for (; i < len; i++) {
				item = items[i];
				field = item.field;
				value = item.getValue && item.getValue();
				if (item.must && !value) {
					alert("請輸入必須條件" + (item.label ? ("["+item.label.text+"]") : ""));
					item.focus && item.focus();
					return false;
				}
				if (field && value) {
					whereStr += (whereStr ? " AND " : "") + field + "=:" + field;
					params[field] = value;
				}
			}
			
			//log(whereStr);
			//log(params);
			if (this.mname || this.unit || this.model) {
				var mdl = this.mname || this.model || (this.unit ? this.unit.mdl : null);
				
				if (this.mname || mdl) {
					$$.Data.loadRemoteData({mname: this.mname || mdl.mname, whereStr: whereStr, parmMap: params, opType: 1, clearData: true});
				}
			}
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
				btns = this._buttons;
			
			this.add(items.concat(btns));
		}
	};
};
	
var queryform = function(BASEFORM){
	return {
		extend: BASEFORM,
		defBodyType: "form.QueryFormBody"
	};
};

$$.define("form.QueryFormBody", ["form.BaseFormBody", "form.Button", "tools.Icons"], querybody);

$$.define("form.QueryForm", ["form.BaseForm"], queryform);
	
})(window.jQuery, window.com.pouchen);