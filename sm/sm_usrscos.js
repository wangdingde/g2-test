$$.define(
	["core.Container", "layout.CellLayout", "layout.TableLayout", "grid.Grid", 
	 "form.Form", "form.QueryForm", "meta.USRS", "data.SM_USR_COS"], 
	function(CONTAINER, CELL, TABLELAYOUT, GRID, FORM, QUERYFORM, USRS, SM_USR_COS){
		
		return {
			xtype: CONTAINER,
			layout: CELL,
			title: "系统用户",
			fit: true,
			items: [{
				body: {
					model: SM_USR_COS,
					items: [USRS[0], USRS[1]]
				},
				noHeader: true,
				xtype: QUERYFORM,
				cellWidth: 40,
				styler: {
					"overflow": "hidden"
				},
				fit: true
			}, {
				title: "系统用户",
				xtype: CONTAINER,
				layout: CELL,
				layoutCfg: {
					dir: "|"
				},
				fit: true,
				items: [{
					cellWidth: 250,
					title: "系统用户",
					body: {
						unit: SM_USR_COS.getUnit("USRS"),
						columns: [USRS[0], USRS[1]],
						editable: false
					},
					fit: true,
					xtype: GRID
				}, {
					xtype: CONTAINER,
					layout: CELL,
					fit: true,
					items: [{
						xtype: FORM,
						title: "用戶信息",
						ttbar: true,
						styler: {
							"overflow": "hidden"
						},
						body: {
							unit: SM_USR_COS.getUnit("USRS"),
							needFocus: true,
							items: USRS
						}
					}, {
						xtype: GRID,
						title: "用戶組織",
						ttbar: true,
						body: {
							unit: SM_USR_COS.getUnit("USRCOS"),
							columns: [{
								title: "USRCOS_USRS", field: "USRCOS_USRS"
							}, {
								title: "USRCOS_COS", field: "USRCOS_COS", editor: {
									xtype: "form.Combo",
									textField: "COS_NM",
									valueField: "COS_ID",
									unit: {
										accNo: "G2FW",
										sqlNo: "COSQuery",
										whereStr: "COS_ID <> 0"
									}
								}
							}]
						}
					}]
				}]
			}]
		};
	}
);