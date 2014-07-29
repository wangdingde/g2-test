(function($, $$){

var TAB = function(){
	
};

var TABS = function(UICONTROL, BUTTON, PANEL){
	return {
		extend: UICONTROL,
		ctor: function(){
			this.headers = [];
			this.renderTabs();
		},
		domCls: "tabs-container",
		renderTabs: function(){
			var html = "<div class=\"tabs-header\">" +
							"<div class=\"tabs-header-container\"></div>" +
							"<div class=\"tabs-header-tools\"></div>" +
						"</div>" +
						"<div class=\"tabs-body\"></div>" +
						"<div class=\"tabs-list\"></div>";
			$(html).appendTo(this.dom);
			this.renderTools();
			this.renderHeader();
			if (this.items.length > 0) {
				this.select(0);
			}
		},
		_keyStr: "title",
		renderHeader: function(){
			var items = this.items,
				i = 0, len = items.length,
				header = this.getHeader(),
				container = header.find(".tabs-header-container"),
				item;
			
			for (; i < len; i++) {
				item = items[i];
				this._createTabHeader(item, container);
			}
		},
		renderTools: function(){
			var tools = this.getHeaderTools();
			/*
			var btns = [{
				xtype: BUTTON,
				text: "展開",
				renderTo: tools,
				handler: function(){
					log(111111);
				}
			}];
			*/
			$$.create(BUTTON, {
				xtype: BUTTON,
				text: "展開",
				renderTo: tools,
				handler: function(){
					log(111111);
				}
			});
		},
		getHeader: function(){
			return $(".tabs-header", this.dom);
		},
		getHeaderContainer: function(){
			return $(".tabs-header .tabs-header-container", this.dom);
		},
		getHeaderTools: function(){
			return $(".tabs-header .tabs-header-tools", this.dom);
		},
		getTabContainer: function(){
			return $(".tabs-body", this.dom);
		},
		getTabsList: function(){
			return $(".tabs-list", this.dom);
		},
		doResize: function(width, height){
			var header = this.getHeader(),
				body = this.getTabContainer(),
				active = this.getActive();
			
			body.height(height - header.height());
			
			if (active) {
				active.resize();
			}
		},
		select: function(tab){
			tab = this.getTab(tab);
			
			if (!tab) {
				return;
			}
			
			if (!tab.$instance) {
				tab = this.renderTab(tab);
			}
			
			var active = this.getActive();
			
			if (active && active === tab) {
				return;
			}
			
			if (active) {
				this._unActiveTab(active);
			}
			
			this._activeTab(tab);
			this.activeTab = tab;
		},
		getTabHeader: function(tab){
			tab = this.getTab(tab);
			
			var items = this.items,
				headers = this.headers,
				header = headers[items.indexOf(tab)];
			
			return header;
		},
		_activeTab: function(tab){
			var header = this.getTabHeader(tab);
			if (header) {
				$(header.dom).addClass("tabs-header-title-active");
			}
			tab.open();
			tab.resize();
		},
		_unActiveTab: function(tab){
			var header = this.getTabHeader(tab);
			if (header) {
				$(header.dom).removeClass("tabs-header-title-active");
			}
			tab.close();
		},
		getTab: function(tab){
			if (!tab && tab !== 0) {
				return null;
			}
			
			if (!this.items) {
				return null;
			}
			
			if (tab.$instance) {
				return tab;
			}
			
			var items = this.items || [],
				keyStr = this._keyStr,
				i, item, len = items.length;
			
			if (typeof tab === "number") {
				return items[tab];
			}
			
			for (i = 0; i < len; i++) {
				item = items[i];
				
				if (item === tab || item[keyStr] === tab) {
					return item;
				}
			}
			
			return null;
		},
		getActive: function(){
			return this.activeTab;
		},
		addTab: function(tab){
			var items = this.items;
			
			items.push(tab);
			
			this._createTabHeader(tab);
			
			this.select(tab);
		},
		closeTab: function(tab){
			tab = this.getTab(tab);
			var header = this.getTabHeader(tab),
				headers = this.headers,
				items = this.items,
				idx = items.indexOf(tab);
			
			items.splice(idx, 1);
			headers.splice(idx, 1);
			header.destory();
			tab.destory();
		},
		renderTab: function(tab){
			if (tab.$instance) {
				return tab;
			}
			
			var body = this.getTabContainer(),
				items = this.items,
				idx = items.indexOf(tab);
			
			tab.noHeader = true;
			tab.fit = true;
			tab.renderTo = body;
			
			if (tab.body) {
				tab.body = $({}, {
					xtype: PANEL,
					noHeader: true
				}, tab.body);
			}
			
			tab = $$.create(PANEL, tab);
			
			items[idx] = tab;
			
			return tab;
		},
		_createTabHeader: function(tab, container){
			if (!container) {
				container = this.getHeaderContainer();
			}
			
			this._createTitle($.extend({}, {
				closeable: true
			}, {
				title: tab.title,
				tools: tab.tools,
				icon: tab.icon,
				closeable: tab.closable
			}), container);
			
			delete tab.tools;
			delete tab.icon;
			delete tab.closable;
		},
		getTabByHeader: function(header){
			var headers = this.headers,
				items = this.items;
			
			return items[headers.indexOf(header)];
		},
		_createTitle: function(obj, container){
			var title = obj.title,
				//tools = obj.tools || [],
				icon = obj.icon,
				cfg = {
					text: title,
					icon: icon,
					tabs: this,
					renderTo: container,
					handler: function(){
						var tabs = this.tabs;
						
						tabs.select(tabs.getTabByHeader(this));
					}
				}, 
				headers = this.headers,
				btn;
			
			btn = $$.create(BUTTON, cfg);
			
			headers.push(btn);
		}
	};
};

$$.loadCss("panel/tabs.css", true);

$$.define("panel.Tabs", ["core.UIControl", "form.Button", "panel.Panel"], TABS);

})(window.jQuery, window.com.pouchen);