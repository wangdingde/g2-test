$$.define(
	["form.Combo"], 
	function(COMBO){
		return {
			xtype: COMBO,
			valueField: "SM045_01",
			textField: "SM045_02",
			//tpl: "${SM045_02}[${SM045_01}]",
			unit: {
				//mname: "SM045",
				//uname: "SM045",
				//opType: 2
				sqlNo: "SM045Query"
			}
		};
	}
);