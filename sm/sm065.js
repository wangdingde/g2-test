$$.define(
	["core.Container", "layout.CellLayout", "grid.Grid", "meta.SM065", "meta.SM070", "meta.SM075", "data.SM065"], 
	function(CONTAINER, CELL, GRID, META_065, META_070, META_075, SM065){
		return {
			title: "數據庫連接",
			xtype: CONTAINER,
			layout: CELL,
			layoutCfg: {
				dir: "-"
			},
			fit: true,
			itemCfg: {
				ttbar: true,
				xtype: GRID
			},
			items: [{
				title: "數據庫服務器",
				body: {
					unit: SM065.getUnit("SM065"),
					columns: META_065
				}
			}, {
				title: "數據庫連接",
				body: {
					unit: SM065.getUnit("SM070"),
					columns:META_070
				}
			}, {
				title: "廠別連接",
				body: {
					unit: SM065.getUnit("SM075"),
					columns:META_075
				}
			}]
		};
	}
);