(function($, $$){
var cellLayout = function(layout){
	return {
		extend: layout,
		ctor: function(opts){
			$(this.container.dom).parent().css("overflow", "hidden");
		},
		elementType: undefined,
		defCfg: {
			dir: "-",
			noborder: false,
			resizable: true
		},
		_initSpResizeEvent: function (spdiv){
			var container = this.container,
				spEl = $$.create("layout.SpProxy",{dom: spdiv, spdir: this.dir});
			spEl.setDragDom(spdiv,function(dx,dy){
				var target = container.dom,
					isH = this.spdir == "-",
					flag = false,  //默認修改前一個cell分隔比，當前一個分隔比為null時修改下一個cell
					d = isH ? dy : dx,
					method = isH ? "height" : "width",
					index = Number($(spdiv).attr("index")),
					child1 = container.items[index],
					child2 = container.items[index+1],
					ori1 = child1.cellWidth,
					ori2 = child2.cellWidth,
					key1 = isH ? 1 : 3,
					key2 = isH ? 0 : 2,
					pos = $(spdiv).position(),
					//TODO
					//WHY??Why it always has something wrong in IE7 or body tag!
					brobug = $$.isIE7 ? (target.nodeName=="BODY" ? 0 : 1) : (target.nodeName=="BODY" ? 2 : 0);
				
				child1.anchor[key1] -= d;
				child2.anchor[key2] += d;
				if(isH){
					$(spdiv).css("top",pos.top+d+brobug);
				}else{
					$(spdiv).css("left",pos.left+d+brobug);
				}
				//$(child1.target).trigger('_resize.'+ $$.packageName);
				//$(child2.target).trigger('_resize.'+ $$.packageName);
				child1.resize();
				child2.resize();
				if (ori1) {
					if(ori1 < 1){d /= $(target)[method]();}
					child1.cellWidth = ori1+d; 
				} else {
					child1.cellWidth = $(child1.dom)[method]();
				}
				
				if (ori2) {
					if(ori2 < 1){d /= $(target)[method]();}
					child2.cellWidth = ori2-d;
				} else {
					child2.cellWidth = $(child2.dom)[method]();
				}
				
				//取消選中，防止IE7、8出現選中文本造成下一次拖動時觸發drag
				try {
					document.execCommand("unselect", false, true);
				}catch(e){};
			});
		},
		renderItems: function(opts){
			var dom = this.container.dom,
				len = opts.length, i, opt, item;
			
			$(dom).addClass(dom.nodeName == "BODY" ? "asc-cell-BODY" : "asc-cell-base");
			this.noborder && $(dom).addClass("asc-cell-noborder");
			
			dom.nodeName != "BODY" && ($(dom).addClass("asc-cell-spliter"));
			
			for (i = 0; i < len; i++) {
				opt = opts[i];
				item = opt.item;
				dom = $(item.dom);
				
				$(dom).addClass(dom.nodeName == "BODY" ? "asc-cell-BODY" : "asc-cell-base");
				this.noborder && $(dom).addClass("asc-cell-noborder");
				
				if(!dom.hasClass("asc-cell-spliter") && !dom.hasClass("asc-cell-noborder")){
					dom.addClass("asc-cell-spliter-normal");
				}
			}
			
			return this;
		},
		calculate: function(items){
			var target = this.container.dom, spdiv, 
				resizable = this.resizable,
				dir = this.dir = this.dir == "H" ? "-" : (this.spdir == "V" ? "|" : this.dir),
				isH = dir == "-",
				key1 = isH ? 0 : 2, key2 = isH ? 1 : 3,
				size = isH ? $(target).height() : $(target).width(),
				nullSize = size, p_resize = 0,
				nullItems = [], _itemWidths = [], opts = [],
				len = items.length, i, item, cellWidth, reLen;
				
			resizable = this.resizable = resizable instanceof Array ? resizable : (resizable ? [true] : [false]);
			reLen = resizable.length;
			
			for (i = 0; i < len; i++) {
				item = items[i];
				cellWidth = item.cellWidth;
				
				item.fit = false;
				
				if (cellWidth !== null && cellWidth !== undefined) {
					_itemWidths[i] = cellWidth = cellWidth < 1 ? cellWidth*size : cellWidth;
					nullSize -= cellWidth;
				} else {
					nullItems.push(i);
				}
				//TODO 待完善，应该存在bug!!
				
				if (i > 0 && resizable && resizable[Math.min(reLen-1, i-1)] === true) {
					nullSize -= 3;
				}
			}
			
			cellWidth = nullSize/nullItems.length;
			i = nullItems.pop();
			
			while (i !== null && i !== undefined) {
				_itemWidths[i] = cellWidth;
				i = nullItems.pop();
			}
			
			for (i = 0; i < len; i++) {
				item = items[i];
				cellWidth = _itemWidths[i];
				if (!item.anchor) {
					item.anchor = [0, 0, 0, 0];
				}
				item.anchor[key1] = p_resize;
				item.anchor[key2] = size - cellWidth - p_resize;
				p_resize += cellWidth;
				
				if(resizable && resizable[Math.min(reLen-1, i)] && i != len - 1){
					spdiv = $(target).children(".asc-cell-spdiv"+i)[0];
					if (!spdiv) {
						spdiv = document.createElement("div");
						$(spdiv).addClass("asc-cell-spdiv"+i).addClass(isH ? "asc-cell-spdiv-h" : "asc-cell-spdiv-v")
							.appendTo(target).attr("index",i);
						this._initSpResizeEvent(spdiv);
					}
					
					$(spdiv).css({
						left: isH ? 0 : p_resize,
						top: isH ? p_resize : 0
					}).width(isH ? $(target).width() : 2).height(isH ? 2 : $(target).height());
					
					p_resize += 3;
				}
				
				opts.push({cellWidth: cellWidth, anchor: item.anchor, item: item});
			}
			
			return opts;
		}
	};
};

var spProxy = function(uiControl){
	return {
		extend: uiControl,
		ctor: function(opts){
			this.spdir = opts.spdir;
		},
		_initProxy: function(proxy,event) {
			var jq = $(this.dom), offs = jq.offset();
			$(proxy).width(jq.width()).height(jq.height()).css({left:offs.left,top:offs.top}).addClass("asc-spproxy");;
		},
		_moveProxy: function(proxy,pageX,pageY) {
			var spdir = this.spdir;
			if(spdir == "-"){
				$(proxy).css({top: pageY});
			}else{
				$(proxy).css({left: pageX});
			}
		}
	};
};

$$.loadCss("cell.css", true);

$$.define("layout.CellLayout", ["layout.Layout"], cellLayout);

$$.define("layout.SpProxy", ["core.UIControl"], spProxy);
	
})(window.jQuery, window.com.pouchen);