$$.define(
	["core.Container", "layout.CellLayout", "grid.Grid", "meta.SM050", "meta.SM055", "meta.SM060"], 
	function(CONTAINER, CELL, GRID, META_050, META_055, META_060){
		var cfg = {
			fit: true,
			ttbar: true,
			xtype: GRID
		};
		return {
			title: "數據模型",
			xtype: CONTAINER,
			layout: CELL,
			layoutCfg: {
				dir: "-"
			},
			fit: true,
			itemCfg: cfg,
			items: [{
				title: "數據模型",
				body: {
					unit: {
						mname: "SM050",
						opType: 2,
						uname: "SM050"
					},
					columns: META_050
				}
			}, {
				xtype: CONTAINER,
				layout: CELL,
				layoutCfg: {
					dir: "|"
				},
				fit: true,
				itemCfg: cfg,
				items: [{
					title: "模型單元",
					body: {
						unit: {
							mname: "SM050",
							uname: "SM055"
						},
						columns: META_055
					}
				}, {
					title: "單元業務",
					body: {
						unit: {
							mname: "SM050",
							uname: "SM060"
						},
						columns:META_060
					}
				}]
			}]
		};
	}
);