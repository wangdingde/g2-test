$$.define(
	["form.Combo"], 
	function(combo){
		var items = [{
			field: "SM060_01", title: "ID", editor: {}
		}, {
			field: "SM060_03", title: "業務ID", editor: {}
		}, {
			field: "SM060_04", title: "控制順序", editor: {}
		}];
		
		return items;
	}
);