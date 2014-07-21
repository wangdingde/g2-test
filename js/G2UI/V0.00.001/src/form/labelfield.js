(function($, $$){
var lf = function(uicontrol, input, label){
	var _idCnt = 0;
	return {
		root: true,
		extend: uicontrol,
		ctor: function(opts){
			this._init();
			this.setWidth();
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
			var field = this.field;
			
			if (!field) {
				field = {};
			}
			
			if (typeof field === "string" || field.$isClass) {
				field = {
					xtype: field
				};
			}
			
			field.renderTo = this;
			field = this.field = $$.create(field.xtype || input, field);
			
			field.input.id = "label-field-input-" + _idCnt++;
		},
		_initLf: function(){
			var label = this.label,
				field = this.field;
			
			label.field = field;
			field.label = label;
			
			$(label.dom).attr("for", field.input.id);
		},
		doResize: function(width, height){
			var labelW = this.labelWidth || 0.3;
			
			if (labelW < 1) {
				labelW = width * labelW;
			}
			
			labelW = Math.floor(Math.min(labelW, width * 0.9));
			
			this.label.resize(labelW, height);
			this.field.resize(Math.floor(width - labelW), height);
		},
		setWidth: function(width, height){
			var flag = false,
				labelW = this.labelWidth || 0.3;
			
			if (!width) {
				width = this.width;
				flag = true;
			}
			
			if (flag || width !== this.width) {
				if (labelW < 1) {
					labelW = width * labelW;
				}
				
				labelW = Math.min(labelW, width * 0.9);
				
				//this.label.setWidth(labelW);
				//this.field.setWidth(width - labelW);
				
				this.width = width;
			}
		},
		setHeight: function(height){
			//this.label.setHeight(height);
			//this.field.setHeight(height);
		}
	};
};

$$.define("form.LabelField", ["core.UIControl", "form.InputBox", "form.Label"], lf);
	
})(window.jQuery, window.com.pouchen);