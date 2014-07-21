(function($, $$){
var ctn = function(uicontrol){
	return {
		extend: uicontrol,
		ctor: function(opts){
			this.items = [];
			if (this.layout) {
				var type = this.layout;
				if (typeof this.layout === "string") {
					type = "layout." + type.substr(0,1).toUpperCase() + type.substr(1) + "Layout";
				}
				if (!this.layoutCfg) {
					this.layoutCfg = {};
				}
				this.layoutCfg.container = this;
				this.layout = $$.create(type, this.layoutCfg);
			}
			//this.add(opts.items);
			this._initItems(opts);
		},
		_keyStr: "key",
		_initItems: function(opts){
			this.add(opts.items);
		},
		getItems: function(active){
			var items = this.items,
				res = [],
				i, item, len = this.items.length;
			for (i = 0; i < len; i++) {
				item = items[i];
				
				if (!active || !item.visiabled) {
					res.push(item);
				}
			}
			
			return res;
		},
		getItem: function(key){
			if (!key && key !== 0) {
				return null;
			}
			
			if (!this.items) {
				return null;
			}
			
			if (key.$instance) {
				return key;
			}
			
			var items = this.items || [],
				keyStr = this._keyStr,
				i, item, len = items.length;
			
			if (typeof key === "number") {
				return items[key];
			}
			
			for (i = 0; i < len; i++) {
				item = items[i];
				
				if (item[keyStr] === key) {
					return item;
				}
			}
			
			return null;
		},
		doResize: function(width, height){
			if (this.layout) {
				this.layout.layout();
				this.layout.resize(width, height);
			} else {
				var items = this.getItems(true),
					i, len = items.length;
				for (i = 0; i < len; i++) {
					items[i].resize && items[i].resize();
				}
			}
		},
		add: function(items){
			var itemCfg = this.itemCfg || {},
				sysItemCfg = this._itemCfg || {};
			if (!items) { 
				return;
			}
			if (! items instanceof Array) {
				items = [items];
			}
			for (var i=0; i < items.length; i++) {
				this._createItem($.extend(true, {}, sysItemCfg, itemCfg, items[i]));
			};
			
			//this.resize();
		},
		_defXtype: "Button",
		//defs: {},
		_createItem: function(item){
			//xtype
			if(item.clsName && item.clsName == item.xtype){return;}
			//item.autoRender = true;
			item.renderTo = this;
			item.container = this;
			var itemEl = this.items[this.items.length] = $$.create(item.xtype || this._defXtype, item);
			//itemEl.render && itemEl.render();
		},
		remove: function(){
		
		},
		removeAll: function(){
		
		}
	};
};

$$.define("core.Container", ["core.UIControl"], ctn);
	
})(window.jQuery, window.com.pouchen);