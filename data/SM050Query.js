$$.define(
	["data.DataModel"], 
	function(){
		var SM050Query = $$.Data.getRemoteData({accNo: "", sqlNo: "SM045Query"});
		
		return SM050Query;
	}
);