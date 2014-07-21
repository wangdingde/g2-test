$$.define(
	["core.Container", "grid.Grid", "meta.SM085", "data.SM085"], 
	function(CONTAINER, GRID, META_085, SM085){
		return {
			title: "SQL定義",
			body: {
				unit: SM085,
				columns: META_085
			},
			fit: true,
			ttbar: true,
			xtype: GRID
		};
	}
);