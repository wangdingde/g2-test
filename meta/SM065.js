$$.define(
	["form.Combo"], 
	function(combo){
		var SM065_02Data = [
			{ no: 'SqlServer', name: "SqlServer" },
			{ no: 'Oracle', name: "Oracle" },
			{ no: 'DB2', name: "DB2" },
			{ no: 'MySql', name: "MySql" },
			{ no: 'Sqlite', name: "Sqlite" }
		];
		var items = [{
			field: "SM065_01", title: "服務器編號 ", width: 0.15, editor: {}
		}, {
			field: "SM065_02", title: "數據庫類型 ", width: 0.15, editor: {
				xtype: combo,
				comboData: SM065_02Data
			}
		}, {
			field: "SM065_03", title: "JDBC驅動名 ", width: 0.15
		}, {
			field: "SM065_04", title: "JDBC連接字 ", editor: {}
		}];
		
		return items;
	}
);