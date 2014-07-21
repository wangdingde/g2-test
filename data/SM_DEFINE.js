$$.define(
	["data.DataModel"], 
	function(){
		var sm_define = $$.Data.getRemoteData({accNo: "G2FW", mname: "SM_DEFINE", opType: 2}),
			sd = sm_define.getUnit("SD"),
			sdv = sm_define.getUnit("SDV");
		
		sdv.sort("SDV_SORT");
		
		sdv.bind({
			"onNewRowed": function(row){
				var prow = row.parentRow(),
					sort = prow ? prow.childRows(this).length : 1;
					
				row.setData("SDV_SORT", sort);
			},
			"onRemoveRowed": function(row){
				var punit = this.parent(),
					prow = punit.getRow(punit.curr),
					crows = prow ? prow.childRows(this) : [],
					col = this.getCol("SDV_SORT"),
					i, len = crows.length;
					
				for (i = 0; i < len; i++) {
					crows[i].setData(col, i + 1);
				}
			}
		});
		
		return sm_define;
	}
);