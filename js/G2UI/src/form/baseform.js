(function($, $$){
	
var formBody = function(CONTAINER, LABELFIELD, TABLELAYOUT){
	//log(CONTAINER);
	//log(FORMDATA);
	//log(LABELFIELD);
	return {
		extend: CONTAINER,
		ctor: function(opts){
			this.currs = [];
		},
		_keyStr: "field",
		_defCfg: {
			supportFocus: true,
			editable: true,
			layout: TABLELAYOUT,
			layoutCfg: {
				columns: 4,
				colWidth: null
			}
		},
		_itemCfg: {
			xtype: LABELFIELD,
			labelWidth: 70,
			width: 240
		},
		getParam: function(){
			var items = this.items,
				param = {},
				item, field, i, len = items.length;
			
			for (i = 0; i < len; i++) {
				item = items[i];
				field = item.field;
				if (field && item.getValue) {
					param[field] = item.getValue();
				}
			}
		},
		setParam: function(param, sender){
			var items = this.items,
				item, field, i, len = items.length;
			
			for (i = 0; i < len; i++) {
				item = items[i];
				field = item.field;
				if (item.field && param.hasOwnProperty(field)) {
					this.input(field, param[field], sender);
				}
			}
		},
		clearData: function(){
			var items = this.items,
				item, i, len = items.length;
			
			for (i = 0; i < len; i++) {
				item = items[i];
				item.clearData && item.clearData();
			}
		},
		input: function(field, val, sender){
			if (this.trigger("onInputing", sender, field, val) === false) {
				return;
			}
			
			var item = this.getItem(field);
			if (!item) {
				return;
			}
			item.setValue && item.setValue(val);
			item.refreshShow && item.refreshShow();
			
			this.trigger("onInputed", sender, field, val);
		},
		disable: function(){
			if (!this.disabled) {
				var items = this.items,
					i = 0, len = items.length, item;
				
				for (; i < len; i++) {
					item = items[i];
					item.disable();
				}
			}
		},
		enable: function(){
			var items = this.items,
				i = 0, len = items.length, item;
			
			for (; i < len; i++) {
				item = items[i];
				item.enable();
			}
		}
	};
};

var form = function(PANEL, TOOLBAR){
	return {
		extend: PANEL,
		defBarType: TOOLBAR,
		defBodyType: "form.BaseFormBody",
		defCfg: {
			minimizable: false,
			closable: false,
			maximizable: false
		},
		disable: function(){
			this.body && this.body.disable();
		},
		enable: function(){
			this.body && this.body.enable();
		}
	};
};

$$.define("form.BaseFormBody", ["core.Container", "form.LabelField", "layout.TableLayout"], formBody);

$$.define("form.BaseForm", ["panel.Panel", "tools.Toolbar"], form);
	
})(window.jQuery, window.com.pouchen);