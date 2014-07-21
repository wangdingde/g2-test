$$.define(
	["grid.Grid"],
	function(GRID){
		return {
			title: "定義代號",
			xtype: GRID,
			fit: true,
			ttbar: true,
			//btbar: true,
			body: {
				strip: true,
				needFocus: true,
				columns: [{
					field: "SD_NO", title: "類別代號 ", editor: {}
				}, {
					field: "SD_NM", title: "類別描述 ", editor: {}
				}],
				unit: {
					accNo: "G2FW",
					mname: "SM_DEFINE",
					uname: "SD",
					//sortExp: "SD_NO DESC",
					//filterExp: "SD_NO %% 'SE'",
					opType: 2
				}
			}
		};
	}
);

