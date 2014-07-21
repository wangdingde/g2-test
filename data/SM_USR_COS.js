$$.define(
	["data.DataModel"], 
	function(){
		var sm_usr_cos = $$.Data.getRemoteData({accNo: "G2FW", mname: "SM_USR_COS", opType: 2}),
			usrs = sm_usr_cos.getUnit("USRS"),
			usros = sm_usr_cos.getUnit("USRCOS");
		
		return sm_usr_cos;
	}
);