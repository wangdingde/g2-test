(function($, $$){
var TO = false, flag = true, overflow;
$(window).bind("mousedown.com.asc.drag",function(){
	if($$.UIControl && $$.UIControl.dragUiCtrl){return false;}
}).bind("mousemove.com.asc.drag",function(event){
	var ui = $$.UIControl ? $$.UIControl.dragUiCtrl : null;
	if(!ui){return;}
	ui._moveProxy($$.UIControl.dragProxy,event.pageX,event.pageY);
}).bind("mouseup.com.asc.drag",function(event){
	var ui = $$.UIControl ? $$.UIControl.dragUiCtrl : null, 
		p = $$.UIControl ? $$.UIControl.dragProxy : null;
	if(!ui){return;}
	$(p).hide();
	var dx = event.pageX - p.startX, dy = event.pageY - p.startY;
	if (dx != 0 || dy != 0) {
		ui.trigger("onDragEnd",ui,dx,dy);
	}
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

var uiControl = function(control){
	
	return {
		root: true,
		extend: control,
		ctor: function(opts) {
			if (!this.dom) {
				this.dom = typeof opts.selector == "object" ? opts.selector : $(opts.selector)[0];
			}
			
			if (!this.dom && this.elementType) {
				this.dom = document.createElement(this.elementType);
			}
			
			if (this.dom) {
				$(this.dom).attr("xtype", this.$self.$className);
				//this.dom.xel = this;
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
			
			//this.resize();
			this.trigger("onRendered");
			return this;
		},
		destroy: function() {
			$(this.dom).remove();
		},
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
			var d1 = (new Date()).getTime(), d2;
			var dom = this.dom, $dom = $(this.dom),
				styler = this.styler || {},
				fit = this.fit,
				anchor = fit === true ? null : this.anchor,
				resized = false, $pdom, domw, domh, tb, lr;
			
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
					$pdom = dom.nodeName == "BODY" ? $(window) : $dom.parent();
					
					width = $pdom.width(); //TODO 需要调整，比如边框或者。。。
					height = $pdom.height(); //TODO 需要调整，比如边框或者。。。
					
					$pdom.css("overflow", "hidden");
				} else {
					if (styler.width) {
						width = styler.width;
					}
					if (styler.height) {
						height = styler.height;
					}
				}
				
				if (width === "fit") {
					if (!$pdom) {
						$pdom = dom.nodeName == "BODY" ? $(window) : $dom.parent();
					}
					width = $pdom.width();
				}
				
				if (height === "fit") {
					if (!$pdom) {
						$pdom = dom.nodeName == "BODY" ? $(window) : $dom.parent();
					}
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
		doResize: $$.emptyFn,
		/*
		resizeChildren: function() {
			var jq = $(this.dom),
				u = $$.findNearest(this.dom,this.clsName),
				ovf = jq.css("overflow");
			jq.css("overflow","hidden");
			for(var i=0; i<u.length; i++) {
				var up = $(u[i].dom).parent();
					upof = jq[0] == up[0] ? null : up.css("overflow");
				upof && upof.css("overflow","hidden");
				u[i].trigger("onResize");
				upof && upof.css("overflow",upof);
			}
			setTimeout(function(){jq.css("overflow",ovf);},0);
		},
		_initSizeEvent: function() {
			if (!$$.windowResizeBound) {
				var TO = false, flag = true;
				$(window).bind('resize.com.ASC',function(){
					//延時處理，防止多次重複觸發
					if (!flag) {return;}
					if (TO !== false) {clearTimeout(TO);}
					TO = setTimeout(function() {
						flag = false;
						var u = $$.findNearest(window,"Cell");
						$('body').width($(window).width()-($$.isIE7?2:0)).height($(window).height()-($$.isIE7?2:0));
						var el;
						for(var i=0; i<u.length; i++) {
							el = $$.El(u[i],"Cell");
							el.trigger("onResize");
						}
						//u[i].trigger("onResize");
						//cell.resizeChildren();
						flag = true;
						TO = false;
					}, 200);
					return false;
				});
				$$.windowResizeBound = true;
			}
			//this.bind("onResize",function(){
			//	if (this.dom != document.body && this._resize() === false) {return;}
			//	this.resizeChildren();
			//});
		},
		width: function(set) {
			var jq = $(this.dom);
			if (set == null) {return jq.width();} //取寬度
			if (isNaN(set)) {return;} //無法設寬度(數值無效)
			var len = Number(set), al = this._parsePos(this.anchor[2]), ar = this._parsePos(this.anchor[3]);
			if (al != null && ar != null) {return;} //無法設寬度(左右已錨定)
			if (jq.width() == len){return;} //前後一致
			jq.width(len);//設寬度
			this.trigger("onResize");
		},
		height: function(set) {
			var jq = $(this.dom);
			if (set == null) {return jq.height();} //取高度
			if (isNaN(set)) {return;} //無法設高度(數值無效)
			var len = Number(set), al = this._parsePos(this.anchor[0]), ar = this._parsePos(this.anchor[1]);
			if (al != null && ar != null) {return;} //無法設高度(上下已錨定)
			if (jq.height() == len){return;} //前後一致
			jq.height(len);//設高度
			this.trigger("onResize");
		},
		*/
		setDragDom: function(dragdom,dragendFn) {
			if (this._dragDom == dragdom) {return;}
			if (this._dragDom) {
				$(this._dragDom).unbind("mousedown.com.asc.drag");
			}
			this._dragDom = dragdom;
			if (!dragdom) {return;}
			
			$(this._dragDom).bind("mousedown.com.asc.drag",{dragctrl:this},function(event){
				var p = $$.UIControl.dragProxy;
				if (!p) {
					p = document.createElement("div");
					document.body.appendChild(p);
					$(p).addClass("asc-drag-proxy-ui");
					$$.UIControl.dragProxy = p;
				}
				var el = $$.UIControl.dragUiCtrl = event.data.dragctrl;
				el._initProxy(p);
				p.startX = event.pageX;
				p.startY = event.pageY;
				$(p).show();
			});
			dragendFn && this.bind("onDragEnd",dragendFn);
		},
		_initProxy: function(proxy) {
			var jq = $(this.dom), offs = jq.offset();
			$(proxy).width(jq.width()).height(jq.height()).css({left:offs.left,top:offs.top});
		},
		_moveProxy: function(proxy,pageX,pageY) {
		    $(proxy).css({left:pageX,top:pageY});
		},
		getFormMap: function() {
			var paramMap = {};
			$(this.dom).find('input[name][type!=button][type!=radio][type!=checkbox]').each(function(index){
				var name = $(this).attr("name");
				//val 不存在時是否需要返回？
				if(name && $(this).val()){
					paramMap[name] = $(this).val();
				}
			});
			$(this.dom).find('input:checked').each(function(index){
				var name = $(this).attr("name");
				if(name){
					var type = $(this).attr("type"), opt = paramMap[name];
					paramMap[name] = type == "checkbox" && opt ? (opt+","+$(this).val()) : $(this).val();
				}
			});
			return paramMap;
		},
		setFormMap: function(map) {
			$(this.dom).find('input[name][type!=button]').each(function(index) {
				var jqinput = $(this);
				switch(jqinput.attr("type")) {
				case "radio":
					jqinput.attr("checked", jqinput.val() == map[jqinput.attr("name")]);
					break;
				case "checkbox":
					jqinput.attr("checked", map[jqinput.attr("name")].indexOf(jqinput.val())>=0);
					break;
				default:
					jqinput.val(map[jqinput.attr("name")]);
					break;
				}
			});
		}
	};
	
};

$$.define("core.UIControl", ["core.Control"], uiControl);

})(window.jQuery, window.com.pouchen);