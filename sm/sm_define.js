$$.define(
	["core.Container", "layout.CellLayout", "grid.Grid", "meta.SD", "meta.SDV", "data.SM_DEFINE", "form.QueryForm"], 
	function(CONTAINER, CELL, GRID, SD, SDV, SM_DEFINE, QUERYFORM){
		return {
			title: "系統定義",
			xtype: CONTAINER,
			layout: CELL,
			layoutCfg: {
				dir: "-"
			},
			fit: true,
			itemCfg: {
				fit: true,
				ttbar: true,
				xtype: GRID
			},
			items: [
			/*{
				xtype: QUERYFORM,
				fit: false,
				cellWidth: 60,
				noHeader: true,
				body: {
					layoutCfg: {
						styler: {
							height: 30
						},
						columns: 3
					},
					unit: SM_DEFINE.getUnit("SD"),
					items: [{
						field: "SD_NO", label: "類別代號 "
					}, {
						field: "SD_NM", label: "類別描述 "
					}]
				}
			}, */{
				title: "定義代號",
				body: {
					strip: true,
					unit: SM_DEFINE.getUnit("SD"),
					needFocus: true,
					columns: SD
				}
			}, {
				title: "定義值",
				body: {
					strip: true,
					unit: SM_DEFINE.getUnit("SDV"),
					columns:SDV
				}
			}]
		};
	}
);