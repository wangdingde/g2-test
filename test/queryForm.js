$$.define(
	["form.QueryForm"], 
	function(QUERYFORM){
		
		return {
			xtype: QUERYFORM,
			body: {
				layoutCfg: {
					styler: {
						height: 30
					},
					columns: 2
				},
				items: [{
					label: "No", field: "NO", must: true
				}, {
					label: "Name", field: "NAME"
				}, {
					label: "Email", field: "EMAIL"
				}, {
					label: "Fact No", field: "FACT_NO"
				}]
			}
		};
	}
);