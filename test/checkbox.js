$$.define(
	["form.CheckBox"],
	function(CHECKBOX){
		return {
			xtype: CHECKBOX,
			value: "Y",
			on: "Y",
			off: "N",
			listeners: {
				"onSetData": function(value){
					log(value);
				}
			}
		};
	}
);