(function ($, $$) {
var panel = function (UICONTROL, TOOLBAR, ICONS, UTIL) {
	return{
		//ttbar, btbar ,sbar, noHeader, noFooter, context, url, iframe
		//headerCls, bodyCls, tools
		//title, iconCls
		//minimizabel, maximizable, closable, collapsible
		//minimized, maximized, closed, collapsed
		extend: UICONTROL,
		root: true,
		ctor: function (opts) {
			this.renderPanel();
			
			if (this.draggable) {
				this.setDragDom($(".panel-header", this.dom), function(dx, dy, x, y){
					var offset = $(this.dom).offset();
					this.move({left: offset.left + dx, top: offset.top + dy});
				});
			}
		},
		defBarType: TOOLBAR,
		defBodyType: "panel.Panel",
		_defCfg: {
			title:'New Panel',
			content:'This is a Panel',
			width: 500,
			height: 400,
			iconCls: ICONS.SAVE,
			noHeader: false,
			noFooter: true,
			collapsed: false,
			closed: false,
			minimized: false,
			maximized: false,
			collapsible:true,
			minimizable:true,
			closable: true,
			maximizable:true,
			closeToDestroy: false,
			draggable: false
		},
		domCls: "panel-container",
		renderPanel: function(){
			var $dom = $(this.dom),
				html = "";
			if (!this.noHeader) {
				html += "<div class=\"panel-header "+(this.headerCls || "")+"\"></div>";
			}
			
			if (this.ttbar) {
				html += "<div class=\"panel-toolbar panel-toolbar-top\"></div>";
			}
			
			html += "<div class=\"panel-body "+(this.bodyCls || "")+"\">" +
						//"<div class=\"panel-body-content "+(this.bodyCls || "")+"\">"+
							//url
							//content
							//body >> el
							//iframe
							//this.content+
						//"</div>"+
					"</div>";
			
			if (this.btbar) {
				html += "<div class=\"panel-toolbar panel-toolbar-bottom\"></div>";
			}
			
			if (this.sbar) {
				html += "<div class=\"panel-toolbar panel-toolbar-status\"></div>";
			}
			
			if (!this.noFooter) {
				html += "<div class=\"panel-footer\"></div>";
			}
			
			$(html).appendTo($dom);
			
			this.renderHeader();
			this.renderBody();
			
			this.ttbar && (this.ttbar = this._initBar(this.ttbar, $(".panel-toolbar-top", $dom)));
			this.btbar && (this.btbar = this._initBar(this.btbar, $(".panel-toolbar-bottom", $dom)));
			this.sbar && (this.ttbar = this._initBar(this.sbar, $(".panel-toolbar-status", $dom)));
			
		},
		renderBody: function(){
			var bodyP = $(".panel-body", this.dom);
			
			if (this.body) {
				this.body = $$.create(this.body.xtype || this.defBodyType, this.body, {
					renderTo: bodyP,
					panel: this
				});
			} else if (this.url) {
				if (this.iframe) {
					bodyP.append(UTIL.Html.getIframe(this.url));
				} else {
					bodyP.load(this.url);
				}
			} else if (this.content) {
				bodyP.append(this.content);
			}
		},
		renderHeader: function(){
			if (!this.noHeader) {
				var html = $("<table cellpadding='0' cellspacing='0'>" +
						"<tr>" +
							"<td class='panel-header-icon "+this.iconCls+"'></td>" +
							"<td class='panel-header-title'>"+this.title+"</td>" +
							"<td class='panel-header-tools'></td>" +
						"</tr>" +
					"</table>");
				
				$(".panel-header", this.dom).html(html);
				
				this.renderTools();
			}
		},
		renderTools: function(){
			var _this = this,
				items = this.tools || [];
			
			if (this.collapsible) {
				var collapsed = this.collapsed;
				items.push({title: collapsed ? "展開" : "收起", icon: collapsed ? ICONS.EXPAND : ICONS.COLLAPSE, handler: function(){
					var flag = this.icon == ICONS.COLLAPSE;
					this.title = flag ? "展開" : "收起";
					this.setText();
					this.setPic(null, flag ? ICONS.EXPAND : ICONS.COLLAPSE);
					_this[flag ? "collapse": "expand"]();
				}});
				
				if (collapsed) {
					this.collapsed = false;
					this.collapse();
				}
			}
			
			if (this.minimizable) {
				items.push({title: "最小化", icon: ICONS.MIN, handler: function(){
					_this.min();
				}});
				if (this.minimized) {
					this.min();
				}
			}
			
			if (this.maximizable) {
				var maximized = this.maximized;
				items.push({title: maximized ? "恢復" : "最大化", icon: maximized ? ICONS.RESTORE : ICONS.MAX, handler: function(){
					var flag = this.icon == ICONS.MAX;
					this.title = flag ? "恢復" : "最大化";
					this.setText();
					this.setPic(null, flag ? ICONS.RESTORE : ICONS.MAX);
					
					_this[flag ? "max": "restore"]();
				}});
				if (maximized) {
					this.max();
				}
			}
			
			if (this.closable) {
				items.push({title: "關閉", icon: ICONS.CLOSE, handler: function(){
					_this[_this.closeToDestroy ? "destroy" : "close"]();
				}});
				
				if (this.closed) {
					this.close();
				}
			}
			
			
			if (this.maximized) {
				this.max();
				this.oriWidth = this.defCfg.width;
				this.oriHeight = this.defCfg.height;
			}
			if (this.collapsed) {
				this.collapse();
			}
			
			this._initBar({
				xtype: TOOLBAR,
				itemCfg: {
					
				},
				items: items
			}, $(".panel-header .panel-header-tools", this.dom));
		},
		_initBar: function(bar, dom){
			//var xtype;
			if (!bar) {
				return undefined;
			}
			
			if (bar.$instance) {
				bar.source = this;
				bar.render(dom);
				return bar;
			}
			
			if ($$.isArray(bar)) {
				bar = {items: bar};
			}
			
			if (bar === true) {
				bar = {};
			}
			
			bar.source = this._getBarSource();
			bar.renderTo = dom;
			return $$.create(bar.$isClass ? bar : (bar.xtype || this.defBarType), bar);
		},
		_getBarSource: function(){
			return this.body || this;
		},
		getBody: function(){
			return $(".panel-body", this.dom)[0];
		},
		getHead: function(){
			return $(".panel-head", this.dom)[0];
		},
		doResize: function(width, height){
			var $dom = $(this.dom),
				$header = $dom.find(".panel-header"),
				bw, bh;
			
			bw = width;
			bh = height - $(".panel-header", $dom).height()
					- $(".panel-toolbar-top", $dom).height()
					- $(".panel-toolbar-bottom", $dom).height()
					- $(".panel-toolbar-status", $dom).height()
					- $(".panel-footer", $dom).height();
			
			$(".panel-body", $dom).width(bw).height(bh);
			this.resizeBody(bw, bh);
		},
		resizeBody: function(width, height){
			var b = this.body;
			b && b.resize(width, height);
		},
		collapse: function(){
			if (this.collapsible && !this.collapsed) {
				$(this.dom).children(":not('.panel-header')").slideToggle();
				this.collapsed = true;
			}
		},
		expand: function(){
			if (this.collapsible && this.collapsed) {
				$(this.dom).children(":not('.panel-header')").slideToggle();
				this.collapsed = false;
			}
		},
		max: function(sender){
			if (this.maximizable) {
				this.trigger("onMaxing", sender);
				this.fit = true;
				this.oriWidth = this.width;
				this.oriHeight = this.height;
				this.oriLeft = $(this.dom).css("left");
				this.oriTop = $(this.dom).css("top");
				this.trigger("onMaxing", sender);
				$(this.dom).css({
					left: "0px",
					top: "0px"
				});
				this.resize();
				this.maximized = true;
				this.trigger("onMaxed", sender);
			}
		},
		min: function(sender){
			if (this.minimizable) {
				this.trigger("onMining", sender);
				$(this.dom).hide();
				this.minimized = true;
				this.trigger("onMined", sender);
			}
		},
		open: function(sender){
			if (this.closed) {
				this.trigger("onOpening", sender);
				this.show();
				
				if (!$(".panel-body", this.dom)[0]) {
					this.renderPanel();
				}
				this.closed = false;
				this.trigger("onOpened", sender);
			}
		},
		close: function(sender){
			if (this.closable) {
				this.trigger("onClosing", sender);
				this.hide();
				this.closed = true;
				
				this.trigger("onClosed", sender);
			}
		},
		restore: function(sender){
			if (this.maximized) {
				this.trigger("onRestoring", sender);
				this.fit = false;
				this.resize(this.oriWidth, this.oriHeight);
				$(this.dom).css({
					left: this.oriLeft,
					top: this.oriTop
				});
				this.oriWidth = undefined;
				this.oriHeight = undefined;
				this.oriLeft = undefined;
				this.oriTop = undefined;
				this.trigger("onRestored", sender);
			}
		},
		move: function(opt){
			$(this.dom).css({
				"position":"absolute",
				"left":opt.left,
				"top":opt.top
			});
		},
		onDestroy: function(){
			
		},
		setTitle: function (title) {
			$('table tr td.panel-header-title', this.header).html(title);
		}
	};
};

$$.loadCss("panel/panel.css", true);

$$.define('panel.Panel', ["core.UIControl", "tools.Toolbar", "tools.Icons", "core.Util"], panel);

})(window.jQuery, window.com.pouchen);
