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