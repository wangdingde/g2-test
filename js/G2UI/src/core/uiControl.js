(function($, $$){
var TO = false, flag = true, overflow;
$(window).bind("mousedown.com.asc.drag",function(){
	if($$.UIControl && $$.UIControl.dragUiCtrl){return false;}
}).bind("mousemove.com.asc.drag",function(event){
	if (!$$.UIControl) {return;}
	var ui = $$.UIControl.dragUiCtrl;
	if(!ui){return;}
	if(window.getSelection){
		window.getSelection && window.getSelection().removeAllRanges(); 
	}else{
		try {
			document.execCommand ("unselect", false, true);
		}catch (e) {};
	}
	var p = $$.UIControl.dragProxy;
	if (!p) {
		p = document.createElement("div");
		document.body.appendChild(p);
		$(p).addClass("asc-drag-proxy-ui").hide();
		$$.UIControl.dragProxy = p;
	}
	if(!ui._dragInited){
		if(Math.abs(event.pageX - ui._oriX) <= 5 && Math.abs(event.pageY - ui._oriY) <= 5){return;}
		ui._dragInited = true;
		ui._initProxy(p,event);
		
		p.startX = event.pageX;
		p.startY = event.pageY;
		p.oldOverflow = $(document.body).css("overflow");
		$(document.body).css("overflow", "hidden");
		$(p).show();
	}
	ui._moveProxy($$.UIControl.dragProxy,event.pageX,event.pageY,event);
}).bind("mouseup.com.asc.drag",function(event){
	if (!$$.UIControl) {return;}
	var ui = $$.UIControl.dragUiCtrl, p = $$.UIControl.dragProxy;
	$$.UIControl.dragUiCtrl = null;
	if(!ui || !ui._dragInited){return;}
	$(p).hide();
	var dx = event.pageX - p.startX, dy = event.pageY - p.startY;
	if (dx != 0 || dy != 0) {
		ui.trigger("onDragEnd",ui,dx,dy,event.pageX,event.pageY,p,event);
	}
	$(document.body).css("overflow", p.oldOverflow);
	ui._dragInited = false;
	$$.UIControl.dragUiCtrl = null;
}).bind('resize.com.ASC',function(){
	//延時處理，防止多次重複觸發
	var body = $$.getBody();
	if (!overflow) {
		overflow = $(body).css("overflow");
		$(body).css("overflow", "hidden");
	}
	if (!flag) {return;}
	if (TO !== false) {clearTimeout(TO);}
	TO = setTimeout(function() {
		flag = false;
		$(body).width($(window).width()-($$.isIE7?2:0)).height($(window).height()-($$.isIE7?2:0));
		//TODO
		//需要改进，如何选取最近的cmp
		//如何由dom至cmp
		//当页面有多个outer？？？
		if ($$.outerCmp) {
			$$.outerCmp.resize();
		}
		//$("[xtype]").each(function(index, dom){
		//	this.xel.resize();
		//});
		$(body).css("overflow", overflow);
		overflow = null;
		flag = true;
		TO = false;
	}, 200);
	return false;
});

var uiControl = function(CONTROL, ZCENTER){
	
	return {
		root: true,
		extend: CONTROL,
		ctor: function(opts) {
			var el = this;
			if (!this.dom && opts.selector) {
				this.dom = typeof opts.selector == "object" ? opts.selector : $(opts.selector)[0];
			}
			if (!this.dom && this.elementType) {
				this.dom = document.createElement(this.elementType);
			}
			
			if (this.dom) {
				$(this.dom).attr("xtype", this.$self.$className).click(function(){
					el.trigger("onDomClick");
				});
				//this.dom.xel = this;
			}
			
			if (this.supportFocus) {
				this.focusDom = $("<div class=\"focus-input\"><input></input></div>").appendTo(this.dom)[0];
				$("input", this.focusDom).bind({
					"focus": function(){
						$$.FocusEl = el;
					}
				});
				
				$(this.dom).bind({
					"mouseup": function(e){
						if ($$.FocusEl !== el || !el.focused) {
							$("input", el.focusDom).focus();
							
							el.trigger("onFocused");
						}
						
						return true;
					}
				});
				
				if (this.needFocus) {
					setTimeout(function(){
						$("input", el.focusDom).focus();
					}, 0)
				}
			}
			//if (!opts || !this.dom) {return false;}
			//this.noable = false; //或不定義此屬性﹐它影響enable和disable
			//this.anchor = opts.anchor || [0,null,0,null]; //上下左右
			//this.dataReal = undefined; //內部真實值
			//this.dataDisp = undefined; //外部顯示值
			//this.label = undefined; //相關聯的標簽控件
			this._dragDom = undefined; //指定可接收拖動操作的dom﹐如未指定表示此控件不能拖
			//this._initSizeEvent();
			this.render(null, true);
		},
		elementType: "div",
		autoRender: true,
		render: function(fn, inited) {
			var dom = this.dom,
				pdom = this.renderTo || document.body;
			
			if (!dom) {
				return this;
			}
			this.trigger("onRendering");
			
			if (pdom.$self && pdom.$self.$isClass === true) {
				pdom = pdom.dom;
			}
			if (fn) {
				fn.call(this, dom, pdom);
			} else {
				if (!$(pdom).find(dom)[0]) {
					if (!(inited && this.autoRender !== true)) {
						$(pdom).append(this.dom);
					}
				}
			}
			if (this.domCls) {
				$(dom).addClass(this.domCls);
			}
			//this.resize();
			this.trigger("onRendered");
			return this;
		},
		destroy: function() {
			$(this.dom).remove();
			this.onDestroy();
		},
		onDestroy: $$.emptyFn,
		show: function() {
			this.resize();
			$(this.dom).show();
		},
		hide: function() {
			$(this.dom).hide();
		},
		enable: function() {
			if(this.noable) {return;}
			$(this.dom).removeAttr("disabled");
		},
		disable: function() {
			if(this.noable) {return;}
			$(this.dom).attr("disabled",true);
		},
		_parsePos: function(a) {
			if (a == "auto") {return 0;}
			if (a == null) {return null;}
			if (isNaN(a)) {return null;}
			return Number(a);
		},
		_getEdge: function(a1,a2,flag) {
			a1 = this._parsePos(a1);
			a2 = this._parsePos(a2);
			if (a1 != null && a2 != null) {
				var jq = $(this.dom), jqP = (this.dom.nodeName == "BODY" ? $(window) : jq.parent()), len = null;
				if (flag == "-" || flag === true) {
					len = jqP.width() - jq.outerWidth(true) + jq.width();
				} else {
					len = jqP.height() - jq.outerHeight(true) + jq.height();
				}
				return {"a1":a1, "a2":null, "len":Math.ceil(len - a1 - a2 + ($$.isIE7?3:0))}; //TODO 這里ie7的3也許不准確
			}
			return {"a1":(a1 == null && a2 == null ? 0 : a1), "a2":a2, "len":null};
		},
		resize: function(width, height, flag){
			//log(this.$self.$className);
			var d1 = (new Date()).getTime(), d2;
			var dom = this.dom, $dom = $(this.dom),
				styler = this.styler || {},
				fit = this.fit,
				anchor = fit === true ? null : this.anchor,
				resized = false, 
				$pdom = dom ? (dom.nodeName == "BODY" ? $(window) : $dom.parent()) : null,
				domw, domh, tb, lr;
				
			if (!this.dom) {
				resized = true;
			} else {
				domw = $dom.width(), domh = $dom.height();
				//$pdom = dom.nodeName == "BODY" ? $(window) : $dom.parent();
				//domw = dom.clientWidth, domh = dom.clientHeight;
				if (anchor) {
					tb = this._getEdge(anchor[0], anchor[1], "|"); //上下
					lr = this._getEdge(anchor[2], anchor[3], "-");
					
					width = lr.len;
					height = tb.len;
				} else if (fit === true) {
					width = $pdom.width(); //TODO 需要调整，比如边框或者。。。
					height = $pdom.height(); //TODO 需要调整，比如边框或者。。。
					
					this.oldOverFlow = $pdom.css("overflow");
					$pdom.css("overflow", "hidden");
				} else {
					if (styler.width || (!width && this.width)) {
						width = styler.width || this.width;
					}
					if (styler.height || (!height && this.height)) {
						height = styler.height || this.height;
					}
				}
				
				if (!this.fit && this.oldOverFlow) {
					$pdom.css("overflow", this.oldOverFlow);
					this.oldOverFlow = undefined;
				}
				if (width === "fit") {
					width = $pdom.width();
				}
				
				if (height === "fit") {
					height = $pdom.height();
				}
				
				resized = height !== domh || width !== domw;
				
				if (this.trigger("onResizing", width ,height) === false) {
					return;
				}
				
				if (this.styler) {
					$dom.css(this.styler);
				}
				
				if (height != null) {
					$dom.height(height);
					this.height = height;
				}
				if (width != null) {
					$dom.width(width);
					this.width = width;
				}
				
				if (anchor) {
					$dom.css({top: tb.a1, bottom: tb.a2, left: lr.a1, right: lr.a2});
				}
				
			}
			
			if (resized || flag) {
				this.doResize(width, height);
			}
			
			this.trigger("onResized", width ,height);
			return this;
		},
		getWidth: function(){
			var w = this.width;
			if (isNaN(w)) {
				w = $(this.dom).width();
			}
			
			return w;
		},
		getHeight: function(){
			var h = this.height;
			if (isNaN(h)) {
				h = $(this.dom).height();
			}
			
			return h;
		},
		doResize: $$.emptyFn,
		setDragDom: function(dragdom,dragendFn) {
			if (this._dragDom == dragdom) {return;}
			if (this._dragDom) {
				$(this._dragDom).unbind("mousedown.com.asc.drag");
			}
			this._dragDom = dragdom;
			if (!dragdom) {return;}
			
			$(this._dragDom).bind("mousedown.com.asc.drag",{dragctrl:this},function(event){
				var el = $$.UIControl.dragUiCtrl = event.data.dragctrl;
				el._dragInited = false;
				el._oriX = event.pageX;
				el._oriY = event.pageY;
			});
			
			dragendFn && this.bind("onDragEnd",dragendFn);
			
		},
		_initProxy: function(proxy) {
			var jq = $(this.dom), offs = jq.offset();
			proxy._oriPos = offs;
			$(proxy).width(jq.width()).height(jq.height()).css({left:offs.left,top:offs.top});
			ZCENTER.toFront(proxy);
		},
		_moveProxy: function(proxy,pageX,pageY) {
			$(proxy).css({left:proxy._oriPos.left + pageX - proxy.startX,top:proxy._oriPos.top + pageY - proxy.startY});
		}
	};
	
};

$$.loadCss("common.css", true);

$$.define("core.UIControl", ["core.Control", "tools.ZCenter"], uiControl);

})(window.jQuery, window.com.pouchen);