(function($, $$){
var lf = function(uicontrol, input, label){
	var _idCnt = 0;
	return {
		root: true,
		extend: uicontrol,
		ctor: function(opts){
			this._init();
			this.setWidth();
			
			if (this.disabled === true) {
				this.disable();
			}
		},
		focus: function(){
			this.fieldEl.focus();
		},
		_init: function(){
			$(this.dom).css({
				"display": "inline-block"
			});
			this._initLabel();
			this._initField();
			this._initLf();
		},
		_initLabel: function(){
			var labelOpt = this.label;
			
			if (!labelOpt) {
				labelOpt = {
					text: "Label"
				};
			}
			
			if (typeof labelOpt === "string") {
				labelOpt = {
					text: labelOpt
				};
			}
			
			labelOpt.hasField = true,
			labelOpt.renderTo = this;
			this.label = $$.create(labelOpt.xtype || label, labelOpt);
		},
		_initField: function(){
			var field = this.field,
				fieldEl = this.fieldCfg;
			
			if (!fieldEl) {
				fieldEl = {};
			}
			
			if (typeof fieldEl === "string" || fieldEl.$isClass) {
				fieldEl = {
					xtype: fieldEl
				};
			}
			
			fieldEl.renderTo = this;
			fieldEl.field = field;
			fieldEl = this.fieldEl = $$.create(fieldEl.xtype || this.fieldType || input, fieldEl);
			
			var cnt = this.container;
			if (cnt) {
				fieldEl.bind({
					"onSetData": function(val){
						//log(val);
						cnt.input && cnt.input(null, field, val);
					}
				}, this);
			}
			
			if (fieldEl.input) {
				fieldEl.input.id = "label-field-input-" + _idCnt++;
			}
		},
		_initLf: function(){
			var label = this.label,
				fieldEl = this.fieldEl;
			
			label.field = fieldEl;
			fieldEl.label = label;
			
			if (fieldEl.input) {
				$(label.dom).attr("for", fieldEl.input.id);
			}
		},
		doResize: function(width, height){
			var labelW = this.labelWidth || 0.3;
			
			if (labelW < 1) {
				labelW = width * labelW;
			}
			
			labelW = Math.floor(Math.min(labelW, width * 0.9));
			
			this.label.resize(labelW, height);
			//TODO
			//the width!!!!
			this.fieldEl.resize(Math.floor(width - labelW - 5), height);
		},
		setValue: function(val){
			this.fieldEl.setValue(val);
			this.fieldEl.refreshShow();
		},
		getValue: function(){
			return this.fieldEl.getValue();
		},
		getInput: function(){
			return this.fieldEl.input;
		},
		setWidth: function(width, height){
			var flag = false,
				labelW = this.labelWidth || 0.3;
			
			if (!width) {
				width = this.width;
				flag = true;
			}
			if (flag || width !== $(this.dom).width()) {
				if (labelW < 1) {
					labelW = width * labelW;
				}
				
				labelW = Math.min(labelW, width * 0.9);
				this.label.setWidth(labelW);
				if (this.fieldEl && this.fieldEl.setWidth) {
					this.fieldEl.setWidth(width - labelW - 1);
				}
				
				this.width = width;
			}
		},
		setHeight: function(height){
			//this.label.setHeight(height);
			//this.field.setHeight(height);
		},
		disable: function(){
			this.fieldEl.disable();
		},
		enable: function(){
			this.fieldEl.enable();
		}
	};
};

$$.define("form.LabelField", ["core.UIControl", "form.Input", "form.Label"], lf);
	
})(window.jQuery, window.com.pouchen);