(function($, $$){
	
var formBody = function(CONTAINER, FORMDATA, FORMKEY, LABELFIELD, TABLELAYOUT){
	//log(CONTAINER);
	//log(FORMDATA);
	//log(LABELFIELD);
	return {
		extend: CONTAINER,
		mixins: [FORMDATA, FORMKEY],
		ctor: function(opts){
			this.currs = [];
			
			this._bindEl();
			this.setCurrent(null, this);
			
			this.initKeyManager();
		},
		_keyStr: "field",
		_defCfg: {
			supportFocus: true,
			editable: true,
			layout: TABLELAYOUT,
			layoutCfg: {
				columns: 3,
				colWidth: null
			}
		},
		_itemCfg: {
			xtype: LABELFIELD,
			labelWidth: 70,
			width: 240,
			disabled: true
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
					this.input(null, field, param[field], sender);
					//item.setValue(param[field]);
					//&& item.setValue 
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
		input: function(row, field, val, sender){
			if (this.trigger("onInputing", sender, row, field, val) === false) {
				return;
			}
			
			this.setData(row, field, val, this.isInputing(), sender);
			this.trigger("onInputed", sender, row, field, val);
		},
		setData: function(row, field, val, flag, sender){
			//alert(">>>>>"+row);
			var item = this.getItem(field);
			if (!row) {
				row = this.getCurrentRow();
			}
			
			if (!row || !item) {
				return;
			}
			if (this.trigger("onSetDataing", sender, row, field, val) === false) {
				return;
			}
			var context = this._getItemContext(row, field, val),
				input = item.input;
			
			if (!input && item.getInput) {
				input = item.getInput();
			}
			
			item.setValue && item.setValue(val);
			item.refreshShow && item.refreshShow();
			
			input && $(input).removeClass("grid-td-error grid-td-change").addClass(context.css)
			.attr("title", context.errMsg);
			
			this.trigger("onSetDataed", sender, row, field, val);
		},
		_getItemContext: function(row, field, val){
			var ds = this.getDataSource(),
				col = ds.getCol(field),
				context = val !== null && val !== undefined ? val : this.getColumnData(row, field),
				chg = row._upd.indexOf(col.idx) !== -1,
				errMsg = "", css;
				
			if (context === null || context === undefined) {
				context = "";
			}
			//log("getTd===row:"+ row.tid + ";col:"+field+";val:"+val);
			if (row._err.indexOf(col.idx) !== -1) {
				errMsg = row._errmsg[row._err.indexOf(col.idx)];
				css = " grid-td-error";
			} else if (chg) {
				css = " grid-td-change";
			}
			
			return {
				context: context,
				css: css,
				errMsg: errMsg
			};
		},
		setCurrent: function(row, sender){
			//log(this);
			var curr = this.currs[0],
				isEditing = this.isInputing();
			if (row === curr) {
				return;
			}
			if (isEditing && curr) {
				this.endEdit(curr);
			}
			if (!row) {
				var ds = this.getDataSource();
				row = ds.getRow(ds.curr);
			}
			this.trigger("onSetCurrenting", sender, row);
			if (!row) {
				this.clearData();
			} else {
				this.setParam(this.getRowData(row), this);
			}
			
			if (isEditing) {
				this.beginEdit(row);
			}
			this.currs = row ? [row] : [];
			this.trigger("onSetCurrented", sender, row);
		},
		beginEdit: function(row, sender){
			var currs = this.currs,
				curr = row ? row : currs[0],
				items = this.items,
				item, i, len = items.length;
			
			if (!curr) {
				return;
			}
			if (this.trigger("onBeginEditing", sender, curr) === false) {
				return;
			}
			for (i = 0; i < len; i++) {
				item = items[i];
				if (item.field) {
					var context = this._getItemContext(row, item.field),
						input = item.input;
					
					if (!input && item.getInput) {
						input = item.getInput();
					} 
					
					item.enable && item.enable();
					
					input && $(input).removeClass("grid-td-error grid-td-change").addClass(context.css)
					.attr("title", context.errMsg);;
				}
			}
			
			this.trigger("onBeginEdited", sender, curr);
		},
		//結束編輯
		endEdit: function(row, sender){
			var currs = this.currs,
				curr = row ? row : currs[0],
				items = this.items,
				item, i, len = items.length;
			
			if (this.trigger("onEndEditing", sender, curr) === false) {
				return;
			}
			
			for (i = 0; i < len; i++) {
				item = items[i];
				if (item.field) {
					item.disable && item.disable();
				}
			}
			
			this.trigger("onEndEdited", sender, curr);
		}
	};
};

var form = function(PANEL, EDITTOOLBAR){
	return {
		extend: PANEL,
		defBarType: EDITTOOLBAR,
		defBodyType: "form.FormBody",
		defCfg: {
			minimizable: false,
			closable: false,
			maximizable: false
		},
		ctor: function(){
			
		}
	};
};

$$.define("form.FormBody", ["core.Container", "data.FormData1", "form.Key", "form.LabelField", "layout.TableLayout"], formBody);

$$.define("form.Form", ["panel.Panel", "tools.EditToolbar"], form);
	
})(window.jQuery, window.com.pouchen);