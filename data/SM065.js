$$.define(
	["data.DataModel"], 
	function(){
		var sm065 = $$.Data.getRemoteData({accNo: "SYS", mname: "SM065", opType: 2}),
			unit065 = sm065.getUnit("SM065"),
			unit070 = sm065.getUnit("SM070"),
			unit075 = sm065.getUnit("SM075");
		
		unit065.bind({
			"onInputed": function(row,col,oldVal,newVal){
				if(col.cname == "SM065_02"){
					var sm065_03 = newVal;
					switch (newVal)
					{
						case "SqlServer":
							sm065_03 = "com.microsoft.sqlserver.jdbc.SQLServerDriver";
							break;
						case "Oracle":
							sm065_03 = "oracle.jdbc.driver.OracleDriver";
							break;
						case "DB2":
							sm065_03 = "COM.ibm.db2.jdbc.app.DB2Driver";
							break;
						case "MySql":
							sm065_03 = "com.mysql.jdbc.Driver";
							break;
						case "Sqlite":
							sm065_03 = "org.sqlite.JDBC";
							break;
						default :
							break;
					}
					this.input("SM065_03", sm065_03);
				}
			}
		});
		
		return sm065;
	}
);