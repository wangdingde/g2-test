(function($, $$) {
var editToolbar = function (TOOLBAR, ICONS, TABLELAYOUT) {
	return{
		extend: TOOLBAR,
		ctor: function(opts){
			var toolbar = this,
				items = [],
				sbs = {
					"add": {
						key: "add",
						text: "Add",
						icon: ICONS.ADD,
						stateArray: [true, true, true, true, true],
						handler: function(){
							toolbar.onAdd();
						}
					}, 
					"edit": {
						key: "edit",
						text: "Edit",
						icon: ICONS.EDIT,
						stateArray: [false,false,true,false],
						handler: function(){
							toolbar.onEdit();
						}
					}, 
					"remove": {
						key: "remove",
						text: "Remove",
						icon: ICONS.REMOVE,
						stateArray: [false,false,true,true],
						handler: function(){
							toolbar.onRemove();
						}
					}, 
					"save": {
						key: "save",
						text: "Save",
						icon: ICONS.SAVE,
						stateArray: [false,true,false,true],
						handler: function(){
							toolbar.onSave();
						}
					}, 
					"cancel": {
						key: "cancel",
						text: "Cancel",
						icon: ICONS.CANCEL,
						stateArray: [false,true,false,true],
						handler: function(){
							toolbar.onCancel();
						}
					}, 
					"refresh": {
						key: "refresh",
						text: "Refresh",
						icon: ICONS.REFRESH,
						stateArray: [true, true, true, true, true],
						handler: function(){
							toolbar.onRefresh();
						}
					}
				},
				nbs = this.needButtons,
				others = this.others || [],
				source = this.source,
				dataSource = source.getDataSource(),
				parent = dataSource.parent(),
				key;
			
			if (parent) {
				delete sbs.edit;
				delete sbs.save;
				delete sbs.cancel;
				delete sbs.refresh;
			}
			
			for (key in sbs) {
				if (!nbs || nbs.indexOf(key) !== -1) {
					items.push(sbs[key]);
				}
			}
			
			items = items.concat(others);
			
			this.add(items);
			
			source.bind({
				"onEndEdited": function(){
					toolbar.refreshState();
				},
				"onBeginEdited": function(){
					toolbar.refreshState();
				},
				"onLoadJsoned": function(){
					toolbar.refreshState();
				}
			});
		},
		onAdd: function(sender){
			if (this.trigger("onAdding", sender) === false) {
				return;
			}
			this._onAdd && this._onAdd();
			this.refreshState();
			this.trigger("onAdded", sender);
		},
		onEdit: function(sender){
			if (this.trigger("onEditing", sender) === false) {
				return;
			}
			this._onEdit && this._onEdit();
			this.refreshState();
			this.trigger("onEdited", sender);
		},
		onRemove: function(sender){
			if (this.trigger("onRemoving", sender) === false) {
				return;
			}
			
			var toolbar = this,
				source = this.source;
			
			source.onRemove(function(){
				toolbar.refreshState();
				
				toolbar.trigger("onRemoved", sender);
			});
			/*
			var c = confirm("是否確定刪除數據？刪除后不可恢復！");
			if(c){
				var res = toolbar._removeAction ? toolbar._removeAction.call(toolbar) : true;
				if(res !== true){
					res === false && (res = "系統錯誤，請稍後再試！");
					if(typeof res != "object"){
						$.messager.alert("錯誤",res,'error');
					}
					return false;
				}
				toolbar._onRemove && toolbar._onRemove();
				toolbar.refreshState();
				
				toolbar.trigger("onRemoved", sender);
			}
			*/
		},
		onSave: function(sender){
			if (this.trigger("onSaving", sender) === false) {
				return;
			}
			
			var toolbar = this,
				source = this.source;
			
			source.onSave(function(){
				toolbar.refreshState();
				
				toolbar.trigger("onSaved", sender);
			});
			/*
			var res = this._saveAction ? this._saveAction.call(this) : true;
			if(res !== true){
				res === false && (res = "系統錯誤，請稍後再試！");
				if(typeof res != "object"){
					//$.messager.alert("錯誤",res,'error');
					alert(res);
				}
				return false;
			}
			this._onSave && this._onSave();
			this.refreshState();
			this.trigger("onSaved", sender);
			*/
		},
		onCancel: function(sender){
			if (this.trigger("onCanceling", sender) === false) {
				return;
			}
			this._onCancel && this._onCancel();
			this.refreshState();
			this.trigger("onCanceled", sender);
		},
		onRefresh: function(sender){
			if (this.trigger("onRefreshing", sender) === false) {
				return;
			}
			this._onRefresh && this._onRefresh();
			this.trigger("onRefreshed", sender);
		},
		refreshState: function(sender){
			if (this.trigger("onRefreshing", sender) === false) {
				return;
			}
			var source = this.source,
				isEditing = source.isInputing(),
				dataSource = source.getDataSource(),
				hasCurrentRow = dataSource ? dataSource.getRow(dataSource.curr) : false,
				parent = dataSource.parent(),
				prow = parent ? parent.getRow(parent.curr) : true,
				removed = this._getRemoved(),
				btns = this.items, i, len = btns.length,
				btn, key, selected, met;
			//console.log(this.owner);
			//console.log(hasCurrentRow);
			for (i = 0; i < len; i++) {
				btn = btns[i];
				key = btn.key;
				selected = key == "remove" ? removed.length > 0 : hasCurrentRow;
				
				met = (btn.invalid || (btn.stateArray[4] && !prow) ? false : btn.stateArray[(isEditing ? 1 : 0) + (selected ? 2 : 0)]) ? "enable" : "disable";
				//log("key:"+key+"===method:"+met);
				btn[met]();
			}
			this.trigger("onRefreshed", sender);
		},
		_saveAction: function(){
			var source = this.source;
				
			return source.update();
		},
		_removeAction: function(){
			var source = this.source,
				dataSource = source.getDataSource(),
				removed = this._getRemoved(),
				index = source.getRowIndex(source.currs[0]),
				i, len = removed.length;
			source.lastCurr = index;
			for (i = 0; i < len; i++) {
				dataSource.deleteRow(removed[i], this);
			}
			
			return source.update(true);
		},
		_onAdd: function(){
			var source = this.source;
			
			source && source.onAdd && source.onAdd();
		},
		_onEdit: function(){
			var source = this.source;
			
			source && source.onEdit && source.onEdit();
		},
		_onRemove: function(){
			var source = this.source;
			
			source && source.onRemove && source.onRemove();
		},
		_onSave: function(){
			var source = this.source;
			
			source && source.onSave && source.onSave();
		},
		_onCancel: function(){
			var source = this.source;
			
			source && source.onCancel && source.onCancel();
		},
		_getRemoved: function(){
			var source = this.source,
				currs = source.currs,
				removed = [], i, len = currs.length;
				
			for (i = 0; i < len; i++) {
				 removed.push(currs[i]);
			}
			return removed;
		},
		_onRefresh: function(){
			
		}
	};
};

$$.define('tools.EditToolbar', ['tools.Toolbar', 'tools.Icons', "layout.TableLayout"], editToolbar);
})(window.jQuery, window.com.pouchen); 