(function($, $$){

var cd = function(BASEDATA){
	return {
		extend: BASEDATA,
		_bindUnit: function(unit){
			var el = this;
			
			unit.bind({
				"onLoadJsoned": function(data){
					el.loadComboData(this.getUnitData(), false, false, el);
				},
				"onAccepted": function(){
					el.loadComboData(this.getUnitData(), false, false, el);
				}
			}, el);
		},
		//每個el不管unit如何變化，只需要bind一次即可
		_bindEl: $$.emptyFn
	};
	
};

$$.define("data.ComboData", ["data.BaseData"], cd);

})(window.jQuery, window.com.pouchen);