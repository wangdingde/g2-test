$$.define(
	[], 
	function(){
		var items = [{
			field: "SDV_SORT", title: "內容排序", align: "center", width: 100
		}, {
			field: "SDV_NO", title: "內容代號", editor: {}
		}, {
			field: "SDV_NM", title: "內容描述 ", editor: {}
		}, {
			field: "SDV_STOP", title: "停用 ", align: "center", editor: {}
		}];
		
		return items;
	}
);