(function($, $$){
var ur = function(uicontrol){
	var InputTimer = null, CurrentEl = null;
	return {
		root: true,
		extend: uicontrol,
		ctor: function(opts){
			this.apply(opts,this.defaultOpts);
			this.creat();
			if(!$$.isNull(this.value)){
				if(this.valid(this.value) === false){return;}
				var value = this.value;
				this.setData({value:value});
				this.refreshShow();
			}
			//this.render();
		},
		defCfg: {
			domw: undefined,
			text: undefined,
			formatStr: undefined,
			formatter: undefined,
			parser: undefined,
			value: undefined,
			//oldVal: undefined,
			missingMessage: undefined,
			rules: undefined,
			optState: "enable",
			noInput: undefined,
			viewState: "show"
		},
		defDomType: "div",
		errorCss: "asc-input-error",
		addRule: function(ruler,idx){
			if(this.rules.indexOf(ruler) == -1){
				this.rules.splice(isNaN(idx) ? this.rules.length : Number(idx),0,ruler);
			}
		},
		creat: function(){
			this._initInput();
			$(this.dom).css("display","inline-block"); //貌似IE7不支持！！！
			!(this.rules) && (this.rules = []);
			this.setWidth();
			this._initEvent();
		},
		_initInput: function(){
			this.input = this.input || document.createElement("input");
			this.input.el = this;
			$(this.input).addClass("asc-input-common").val("");
			$(this.input).appendTo(this.dom);
		},
		_text2value: function(text){
			return this.parser ? this.parser(this._sysParse(text)) : this._sysParse(text);
		},
		_value2text: function(value){
			return (this.formatter ? this.formatter(this._sysFormat(value)) : this._sysFormat(value));
		},
		refreshShow: function(text){
			if($$.isNull(text) || $$.isEmptyString(text)){text = this.value;}
			if(this.getInputValue() !== text){
				$(this.input).val(text);
			}
		},
		setValue: function(value){
			if(this.value != value){
				if(this.valid(value) === false){return;}
				this.setData({value: value});
				this.trigger("onSetValue",value);
			}
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
			//this.refreshShow(this.text);
			this.trigger("onSetData",sender,this.value,this.text);
		},
		clearData: function(){
			this.value = undefined;
			this.text = undefined;
			$(this.input).val("");
		},
		getInputValue: function(){
			return $(this.input).val();
		},
		_timerHandler: function(value){
			if($$.isNull(value) || $$.isEmptyString(value)){value = this.getInputValue();}
			this.setValue(value);
		},
		setMissingMsg: function(message){
			if(message){
				this.missingMessage = message;
			}else{
				message = this.missingMessage;
			}
			if(message && ($$.isNull(this.value) || $$.isEmptyString(this.value))){
				$(this.input).addClass("asc-input-missingMessage").val(message);
			}
		},
		_initEvent: function(){
			this._transformInputEvent();
			this.setMissingMsg();
			this.bind({
				//TODO 
				//add class when focus
				//remove class when blur
				onFocus: function(){
					var el = this;
					if(CurrentEl === this){return;}
					$(this.input).addClass("asc-input-active");
					if($(this.input).hasClass("asc-input-missingMessage")){
					    $(this.input).removeClass("asc-input-missingMessage").val("");
					}
					if(InputTimer){
						clearInterval(InputTimer);
						$(CurrentEl.input).blur();
					}
					var _timer = InputTimer = setInterval(function(){
					    el._timerHandler();
					},200);
					CurrentEl = el;
				},
				onBlur: function(){
					$(this.input).removeClass("asc-input-active");
					InputTimer && (clearInterval(InputTimer));
					this._timerHandler();
					this.setMissingMsg();
					InputTimer = null;
					CurrentEl = null;
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
				$$.Util.SimpleVaild.doValid(this.rules[i],value);
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
		doResize: function(width, height){
			width = width || this.domw;
			if(!isNaN(width)){
				$(this.dom).width(width);
				$(this.input).width(width-8);
				this.domw = width;
			}
		},
		setWidth: function(width){
			width = width || this.domw;
			if(!isNaN(width)){
				$(this.dom).width(width);
				$(this.input).width(width-8);
				this.domw = width;
			}
		},
		format: function(value){
			try{
				return this._value2text(value);
			}catch(e){
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
			$(this.dom).addClass("asc-input-disable");
			this.optState = "disable";
		},
		enable: function(){
			$(this.input).removeAttr("disabled");
			$(this.dom).removeClass("asc-input-disable");
			this.optState = "enable";
		}
	};
};

$$.loadCss("form/input.css", true);

$$.define("form.InputBox", ["core.UIControl"], ur);
	
})(window.jQuery, window.com.pouchen);