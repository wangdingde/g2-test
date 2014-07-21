$$.define(
	["core.Container", "layout.CellLayout", "grid.Grid2", "form.Form", "meta.SD", "meta.SDV", "data.SM_DEFINE"], 
	function(CONTAINER, CELL, GRID, FORM, SD, SDV, SM_DEFINE){
		return {
			title: "系統定義",
			xtype: CONTAINER,
			layout: CELL,
			layoutCfg: {
				dir: "|"
			},
			fit: true,
			items: [{
				cellWidth: 200,
				title: "定義代號",
				unit: SM_DEFINE.getUnit("SD"),
				needFocus: true,
				columns: SD,
				fit: true,
				ttbar: true,
				strip: true,
				xtype: GRID
			}, {
				xtype: FORM,
				unit: SM_DEFINE.getUnit("SD"),
				items: [{
					label: "系统定义",
					field: "SD_NO"
				}, {
					label: "系统定义",
					field: "SD_NM"
				}]
			}]
		};
	}
);