$$.define(
	["core.Container", "grid.Grid"], 
	function(CONTAINER, GRID){
		return {
			title: "數據庫連接池",
			fit: true,
			xtype: GRID,
			ttbar: true,
			body: {
				unit: {
					mname: "SM080",
					uname: "SM080",
					listeners: {
						"onInputing": function(row, col, oldVal, newVal){
							if (col && col.cname === "SM080_01") {
								if (newVal === "ADMIN") {
									throw new Error(col.getCaption()+"值非法！");
								}
							}
						},
						"onSetDataed": function(row, col, oldVal, newVal){
							if (col && col.cname === "SM080_03") {
								this.setData(row, "SM080_04", newVal);
							} else if (col && col.cname === "SM080_01") {
								this.input("SM080_02", newVal);
							}
						}
					},
					opType: 2
				},
				columns: [{
					field: "SM080_01", title: "服務器編號", editor: {}
				}, {
					field: "SM080_02", title: "連接編號", editor: {}
				}, {
					field: "SM080_03", title: "初始個數", editor: {}
				}, {
					field: "SM080_04", title: "最小個數", editor: {}
				}, {
					field: "SM080_05", title: "最大個數", editor: {}
				}, {
					field: "SM080_06", title: "閑置分鐘", editor: {}
				}, {
					field: "SM080_07", title: "檢查間隔秒", editor: {}
				}, {
					field: "SM080_08", title: "超時秒", editor: {}
				}, {
					field: "SM080_09", title: "關閉前提交", editor: {}
				}]
			}
		};
	}
);