(function($, $$){
	
var gridCell = function(uicontrol){
	return {
		cons: function(opts){
            this.apply(opts,this.defaultOpts);
            this.create();
        },
        defaultOpts: {
            text: undefined,
            value: undefined,
            width: undefined,
            align: "left",
            styler: undefined,
            owner: undefined,
            column: undefined,
            target: undefined,
            field: undefined,
            rowIndex: undefined,
            state: 0
        },
        create: function(){
            var obj = document.createElement("td");
            obj.innerHTML = this.text;
            obj._value = this.value;
            obj.style.width = this.width;
            $(obj).attr({align: this.align, field: this.field, rowIndex: this.rowIndex}).css(this.styler || {});
            this.target = obj;
            this.owner = this.owner ? $(this.owner)[0] : undefined;
            this.setWidth();
        },
        renderTo: function(){
            $(this.target).appendTo(this.owner || document.body);
        },
        setWidth: function(width){
            width = this.width = width || this.width;
            $(this.target).width(width);
        },
        setText: function(text){
            text = this.text = text || this.text;
            this.target.innerHTML = text;
        },
        setValue: function(value){
            this.value = value || this.value;
        },
        destory: function(){
            $(this.target).remove();
        },
        show: function(){
            $(this.target).show();
        },
        hide: function(){
            $(this.target).hide();
        }
	};
};

$$.define("grid.Cell", ["core.UIControl"], gridCell);
	
})(window.jQuery, window.com.pouchen);