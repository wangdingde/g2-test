(function($, $$){
	
var input = function(UICONTROL, UTIL){
	var INPUTTIMER = null, CURRENTEL = null,
		CSS = UTIL.Css,
		SIMPLEVALID = UTIL.SimpleValid;
	return {
		root: true,
		extend: UICONTROL,
		ctor: function(){
			this.renderInput();
			if(!$$.isNull(this.value)){
				if(this.valid(this.value) === false){return;}
				var value = this.value;
				this.setData({value:value});
			}
			
			if (this.disabled === true) {
				this.disable();
			}
		},
		defDomType: "div",
		domCls: "input-container",
		errorCss: "input-error",
		tipCss: "input-tips",
		_defCfg: {
			width: 160,
			height: 25,
			required: false,
			text: undefined,
			formatStr: undefined,
			formatter: undefined,
			parser: undefined,
			value: undefined,
			//oldVal: undefined,
			placeholder: undefined,
			rules: undefined,
			noInput: undefined
		},
		renderInput: function(){
			this._initInput();
			$(this.dom).addClass(CSS.inlineBlock());
			!(this.rules) && (this.rules = []);
			if (this.required) {
				this.addRule("notNull");
			}
			this.resize();
			this._initEvent();
		},
		_initInput: function(){
			this.input = this.input || document.createElement("input");
			this.input.el = this;
			$(this.input).addClass("input-common").val("");
			$(this.input).appendTo(this.dom);
		},
		doResize: function(width, height){
			this.setWidth(width);
			this.setHeight(height);
		},
		setWidth: function(width){
			width = width || this.getWidth();
			if($$.isNumber(width)){
				$(this.dom).width(width);
				$(this.input).width(width-8);
				this.domw = width;
			}
		},
		setHeight: function(height){
			if (!$$.isNumber(height)) {
				height = 25;
			}
			$(this.input).css({
				"height": height-4+"px",
				"line-height": height+"px",
				"font-size": height/2+"px"
			});
		},
		focus: function(){
			$(this.input).focus();
		},
		addRule: function(ruler, idx){
			if(this.rules.indexOf(ruler) == -1){
				this.rules.splice(isNaN(idx) ? this.rules.length : Number(idx),0,ruler);
			}
		},
		refreshShow: function(text){
			if($$.isNull(text) || $$.isEmptyString(text)){text = this.value;}
			if(this.getInputValue() !== text){
				$(this.input).val(text);
			}
		},
		setValue: function(value, sender){
			if(this.value != value){
				if(this.valid(value) === false){return;}
				this.setData({value: value}, sender);
				this.trigger("onSetValue", sender, value);
			}
		},
		getValue: function(){
			return this.value;
		},
		setText: function(text){
			if($$.isNull(text) || $$.isEmptyString(text)){text = this.getInputValue();}
			var value = this.parse(text) || text;
			if(!$$.isNull(value) && this.value != value){
				if(this.valid(value) === false){return;}
				this.setData({text: text});
				this.trigger("onSetText",text);
			}
		},
		setData: function(data,sender){
			this.value = $$.isNull(data.value) ? this.parse(data.text) : data.value;
			this.text = $$.isNull(data.text) ? this.format(data.value) : data.text;
			this.refreshShow(this.text);
			this.trigger("onSetData",sender,this.value,this.text);
		},
		clearData: function(){
			this.value = undefined;
			this.text = undefined;
			$(this.input).val("");
		},
		_text2value: function(text){
			var value = this._sysParse(text);
			return this.parser ? this.parser(value) : value;
		},
		_value2text: function(value){
			var text = this._sysFormat(value);
			return this.formatter ? this.formatter(text) : text;
		},
		getInputValue: function(){
			return $(this.input).val();
		},
		_timerHandler: function(value, sender){
			if($$.isNull(value) || $$.isEmptyString(value)){value = this.getInputValue();}
			this.setValue(value);
		},
		setPlaceHolder: function(message){
			if(message){
				this.placeholder = message;
			}else{
				message = this.placeholder;
			}
			if(message && $$.isNullOrEmptyString(this.value)){
				$(this.input).addClass(this.tipCss).val(message);
			}
		},
		_initEvent: function(){
			this._transformInputEvent();
			this.setPlaceHolder();
			this.bind({
				//TODO 
				//add class when focus
				//remove class when blur
				onFocus: function(){
					var el = this;
					if(CURRENTEL === this){return;}
					$(this.input).addClass("input-active");
					if($(this.input).hasClass(this.tipCss)){
						$(this.input).removeClass(this.tipCss).val("");
					}
					if(INPUTTIMER){
						clearInterval(INPUTTIMER);
						$(CURRENTEL.input).blur();
					}
					var _timer = INPUTTIMER = setInterval(function(){
						el._timerHandler();
					},200);
					CURRENTEL = el;
				},
				onBlur: function(){
					$(this.input).removeClass("input-active");
					INPUTTIMER && (clearInterval(INPUTTIMER));
					this._timerHandler();
					this.setPlaceHolder();
					INPUTTIMER = null;
					CURRENTEL = null;
				}
			});
		},
		_transformInputEvent: function(){
			var el = this;
			$(this.input).bind("focus.com.ASC",function(e){
				el.trigger("onFocus",e);
			}).bind("blur.com.ASC",function(e){
				el.trigger("onBlur",e);
			}).bind("click.com.ASC",function(e){
				el.trigger("onClick",e);
			}).bind("keydown.com.ASC",function(e){
				return el.trigger("onKeydown",e);
			}).bind("mouseover.com.ASC",function(e){
				return el.trigger("onMouseover",e);
			}).bind("mouseout.com.ASC",function(e){
				return el.trigger("onMouseout",e);
			}).bind("paste.com.ASC",function(e){
				return el.trigger("onPaste",e);
			});
		},
		_sysParse: function(value){return value;},
		_sysFormat: function(text){return text;},
		_doValid: function(value){
			//TODO
			//each sub class must override this inner method to valid the value
			//if it is not ok, please throw an error
			for(var i = 0, ii = this.rules.length; i < ii; i++){
				SIMPLEVALID.doValid(this.rules[i],value);
			}
		},
		_errorHandler: function(errObj){
			//if($(this.input).hasClass("inputError")){return;}
			$(this.input).addClass(this.errorCss);
			$(this.input).attr("title",errObj.message);
		},
		_clearError: function(){
			if($(this.input).hasClass(this.errorCss)){
				$(this.input).removeClass(this.errorCss);
				$(this.input).removeAttr("title");
			}
		},
		format: function(value){
			try{
				return this._value2text(value);
			} catch (e) {
				return value;
			}
		},
		parse: function(text){
			return this._text2value(text);
		},
		valid: function(value){
			try{
				this._doValid(value);
				this.trigger("onValid",value);
				this._clearError();
			}catch(e){
				e.oldVal = this.value;
				return this._errorHandler(e);
			}
			return true;
		},
		disable: function(){
			$(this.input).attr("disabled","disabled");
			$(this.dom).addClass("input-disable "+ CSS.opacity());
			this.disabled = true;
		},
		enable: function(){
			$(this.input).removeAttr("disabled");
			$(this.dom).removeClass("input-disable "+ CSS.opacity());
			this.disabled = false;
		}
	};
};
	
$$.loadCss("form/input.css", true);

$$.define("form.Input", ["core.UIControl", "core.Util"], input);
	
})(window.jQuery, window.com.pouchen);