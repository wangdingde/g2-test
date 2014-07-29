$$.define(
	["data.DataModel"], 
	function(){
		var SM050 = $$.Data.getRemoteData({accNo: "", mname: "SM050"});
		
		return SM050;
	}
);