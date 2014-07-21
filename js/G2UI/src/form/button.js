(function($, $$) {
var button = function (UICONTROL) {
	return{
		extend: UICONTROL,
		ctor : function(opts) {
			$(this.dom).addClass(this.cssName).addClass(this.cssContainer).css("display", "inline-block");
			this.outer = $("<div></div>").addClass(this.cssInnerContainer).appendTo(this.dom)[0];
			this.innerDom = $("<div></div>").appendTo(this.outer)[0];
			this.textDom = $("<span></span>").addClass('asc-button-text').css({
			"text-align": this.picPos == "L" || this.picPos == "R" ? "left" : "center"
			}).appendTo(this.innerDom)[0];
			$(this.innerDom).click({
				me : this
			}, function(e) {
				var el = e.data.me;
				if (!el.disabled) {
					if (!$(el.innerDom).hasClass(el.cssPressed)) {
						$(el.innerDom).addClass(el.cssPressed);
					}
					el.trigger("onClick");
				}
				//$(me.dom).toggleClass(me.cssPressed);
				//return false;
			}).mouseover({
				me : this
			}, function(e) {
				var el = e.data.me;
				if (!el.disabled) {
					$(el.dom).addClass(el.cssHover);
					el.trigger("onMouseOver");
				}
				return false;
			}).mouseout({
				me : this
			}, function(e) {
				var el = e.data.me;
				if (!el.disabled) {
					$(el.dom).removeClass(el.cssHover);
					el.trigger("onMouseOut");
				}
				return false;
			}).addClass(this.cssCommon);
			
			this.bind("onClick", function() {
				this.handler && this.handler();
			});
			//this.render();
			this.paint();
		},
		disable: function(){
			if (!this.disabled) {
				$(this.dom).removeClass(this.cssHover + " " + this.cssPressed).addClass("form-button-disabled");
				this.disabled = true;
			}
		},
		enable: function(){
			//if (this.disabled) {
				$(this.dom).removeClass("form-button-disabled");
				this.disabled = false;
			//}
		},
		defDomType : "div",
		domWidth : undefined,
		domHeight : undefined,
		picPos : "L", // L R T B
		picWidth : 16,
		picHeight : 16,
		cssName : "asc-button", //功能型+樣式型
		cssContainer : "asc-button-container",
		cssInnerContainer : "asc-button-innerContainer",
		cssCommon : "asc-button-common",
		cssPressed : "asc-button-pressed", //樣式型
		cssHover : "asc-button-hover", //樣式型
		_defCfg : {
			handler : undefined,
			text : "",
			backPic : "",
			pic : ""
		},
		_initSize : function() {
			if (this.domWidth) {
				$(this.dom).width(this.domWidth);
				$(this.innerDom).width(this.domWidth - 10);
				$(this.textDom).width(this.domWidth - 10 - (this.picPos == "L" || this.picPos == "R" ? this.picWidth : 0));
			}
			if (this.domHeight) {
				$(this.dom).height(this.domHeight);
				$(this.innerDom).height(this.domHeight - 10);
				var _textHeight = this.domHeight - 10 - (this.picPos == "T" || this.picPos == "B" ? this.picHeight : 0);
				$(this.textDom).height(_textHeight);
				//解決文字居中問題，但出現多行文本時會出現問題，日後再行優化
				$(this.textDom).css("line-height", _textHeight + "px");
			}
		},
		setText : function(text) {
			!text && ( text = this.text);
			if (text) {
				$(this.innerDom).attr("title", text);
				$(this.textDom).html(text);
				this.text = text;
			}
			if (this.title) {
				$(this.innerDom).attr("title", this.title);
			}
		},
		setPic : function(pic, icon) {
			!pic && (pic = this.pic);
			!icon && (icon = this.icon);
			
			if (pic || icon) {
				var picStyle = {};
				if (!icon) {
					picStyle["background-image"] = "url(\"" + pic + "\")";
				}
				picStyle["background-repeat"] = "no-repeat";
				//picStyle["background-position"] = "left center";
				switch(this.picPos) {
					case "R":
						picStyle["padding-right"] = this.picWidth;
						picStyle["background-position"] = "right center";
						break;
					case "B":
						picStyle["padding-bottom"] = this.picHeight;
						picStyle["display"] = "inline-block";
						picStyle["background-position"] = "center bottom";
						break;
					case "T":
						picStyle["padding-top"] = this.picHeight;
						picStyle["display"] = "inline-block";
						picStyle["background-position"] = "center top";
						break;
					default:
						picStyle["padding-left"] = this.picWidth;
						break;
				}
				//picStyle["background-repeat"] = "no-repeat";
				//picStyle["background-position"] = "";
				if ($$.isEmptyString(this.text) || $$.isNull(this.text)) {
					picStyle.width = this.picWidth;
					picStyle.height = this.picHeight;
					picStyle.padding = 0;
				}
				
				if (this.icon) {
					$(this.textDom).removeClass(this.icon);
				}
				
				if (icon) {
					$(this.textDom).addClass(icon);
				}
				
				$(this.textDom).css(picStyle);
			}
			
			icon && (this.icon = icon);
			pic && (this.pic = pic);
		},
		paint : function() {//TODO
			var dom = this.dom;
			this.setText();
			this.setPic();
			this._initSize();
		}
	};
};

$$.loadCss("form/button.css", true);

$$.define('form.Button', ['core.UIControl'], button);
})(window.jQuery, window.com.pouchen); 
