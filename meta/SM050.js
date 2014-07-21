$$.define(
	["form.Combo"], 
	function(combo){
		var items = [{
			field: "SM050_02", title: "模型編號", editor: {}
		}, {
			field: "SM050_03", title: "模型名稱", editor: {}
		}, {
			field: "SM050_04", title: "工廠類", editor: {}
		}, {
			field: "SM050_05", title: "工廠方法", editor: {}
		}, {
			field: "SM050_06", title: "工廠用模型", editor: {}
		}, {
			field: "SM050_07", title: "組裝后委托", editor: {}
		}, {
			field: "SM050_08", title: "實用需池化", editor: {}
		}, {
			field: "SM050_09", title: "修改時間", editor: {}
		}];
		
		return items;
	}
);