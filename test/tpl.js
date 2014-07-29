$$.define(
	["Templet"],
	function(TEMPLET){
		//TEMPLET.setModel("");
		TEMPLET.onSetTtyped = function(ttype, cfg){
			log(ttype);
			log(cfg);
		};
		var res = TEMPLET.getSupports(1, true, true)[0];
		
		//res.requires
		var view = TEMPLET.getViewCfg(res);
		log(view);
		return view;
	}
);