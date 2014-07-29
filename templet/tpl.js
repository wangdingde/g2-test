$$.define(
	["Templet", "core.Container", "layout.CellLayout", "layout.TableLayout", "panel.Panel", "tools.Toolbar", "panel.Window", "form.Combo", "form.CheckBox"],
	function(TEMPLET, CONTAINER, CELL, TABLELAYOUT, PANEL, TOOLBAR, WIN, COMBO, CHECKBOX){
		//TEMPLET.initData(SM015, SM050);
		
		//TEMPLET.setDataSource("SM085");
		TEMPLET.onSetTtyped = function(ttype, cfg, el){
			var optCfgEl = $$.cmp("optCfg");
			
			optCfgEl.setBody(cfg);
		};
		TEMPLET.onCheckTpled = function(tpl, el){
			var tplViewEl = $$.cmp("tplView");
			$(".tpl-current", tplViewEl.dom).removeClass("tpl-current").css({
				"border": "none"
			});
			
			$(el.dom).parent().addClass("tpl-current").css({
				"border": "1px solid #FF0000"
			});
			
			TMPTPL = tpl;
		};
		TEMPLET.onSetTpled = function(tpl){
			CURRTPL = TMPTPL = tpl;
			var tplEditEl = $$.cmp("tplEdit");
			
			CURRTPLVIEW = TEMPLET.getViewCfg(CURRTPL);
			tplEditEl.setBody(CURRTPLVIEW);
		};
		TEMPLET.onOpenSourced = function(tpl, source){
			var optCfgEl = $$.cmp("optCfg");
			optCfgEl.setBody("");
		};
		//var res = TEMPLET.getSupports(1, true, true)[0];
		var CURRTPL, TMPTPL, CURRTPLVIEW;
		//res.requires
		//var view = TEMPLET.getViewCfg(res);
		//log(view);
		var defNav = true,
			defQuery = true,
			TABLECNTDATA = [{
				no: 1, name: "单表"
			}, {
				no: 2, name: "雙表"
			}, {
				no: 3, name: "三表"
			}, {
				no: 4, name: "四表"
			}, {
				no: 5, name: "五表"
			}, {
				no: 6, name: "六表"
			}, {
				no: 7, name: "七表"
			}];
		var refreshTplView = function(){
			var tableCntEl = $$.cmp("tableCnt"),
				navNeedEl = $$.cmp("navNeed"),
				queryNeedEl = $$.cmp("queryNeed"),
				tpls = TEMPLET.getSupports(tableCntEl.value, navNeedEl.value === 1, queryNeedEl.value === 1),
				tplViewEl = $$.cmp("tplView"),
				obj = {
					xtype: CONTAINER,
					layout: TABLELAYOUT,
					fit: true,
					layoutCfg: {
						columns: 2,
						colWidth: 0.5
					},
					itemCfg: {
						height: 200
					}
				}, items = [];
			
			for (var i = 0, len = tpls.length; i < len; i++) {
				items.push(TEMPLET.getViewCfg(tpls[i], true));
			}
			if (items.length % 2 === 1) {
				items.push({
					xtype: CONTAINER
				});
			}
			obj.items = items;
			tplViewEl.setBody(obj);
		}, stopRefresh = false;
		var SELECTWINCFG = {
				xtype: WIN,
				title: "模板選擇",
				closed: true,
				listeners: {
					"onOpened": function(){
						var tableCnt = TEMPLET.getDefaultCnt(),
							tableCntEl = $$.cmp("tableCnt"),
							navNeedEl = $$.cmp("navNeed"),
							queryNeedEl = $$.cmp("queryNeed");
						
						stopRefresh = true;
						tableCntEl.setValue(tableCnt);
						navNeedEl.setValue(defNav ? 1 : 0);
						queryNeedEl.setValue(defQuery ? 1 : 0);
						stopRefresh = false;
						
						refreshTplView();
					}
				},
				btbar: [{
					text: "确定",
					handler: function(){
						if (TMPTPL && TMPTPL !== CURRTPL) {
							TEMPLET.setTpl(TMPTPL);
						}
						SELECTWIN.close();
					}
				}, {
					text: "取消",
					handler: function(){
						SELECTWIN.close();
					}
				}],
				body: {
					xtype: CONTAINER,
					layout: CELL,
					layoutCfg: {
						dir: "-"
					},
					fit: true,
					items: [{
						cellWidth: 40,
						xtype: TOOLBAR,
						items: [{
							xtype: COMBO,
							id: "tableCnt",
							comboData: TABLECNTDATA,
							listeners: {
								"onSetData": function(value){
									if (!stopRefresh && !$$.isNullOrEmptyString(value)) {
										refreshTplView();
									}
								}
							}
						}, {
							xtype: CHECKBOX,
							id: "navNeed",
							listeners: {
								"onSetData": function(value){
									if (!stopRefresh && !$$.isNullOrEmptyString(value)) {
										refreshTplView();
									}
								}
							}
						}, {
							xtype: CHECKBOX,
							id: "queryNeed",
							listeners: {
								"onSetData": function(value){
									if (!stopRefresh && !$$.isNullOrEmptyString(value)) {
										refreshTplView();
									}
								}
							}
						}]
					}, {
						xtype: PANEL,
						noHeader: true,
						id: "tplView",
						styler: {
							"overflow": "hidden"
						}
					}]
				},
				modal: true
			},
			DATAWINCFG = {
				xtype: WIN,
				title: "數據源設定",
				width: 300,
				height: 200,
				body: {
					xtype: COMBO,
					id: "dataSelect",
					fit: false,
					unit: {
						sqlNo: "SM050Query"
					},
					textField: "SM050_03",
					valueField: "SM050_02"
				},
				btbar: [{
					text: "下一步",
					handler: function(){
						var cmp = $$.cmp("dataSelect");
						cmp.value && TEMPLET.setDataSource(cmp.value);
						
						DATAWIN.close();
						if (!SELECTWIN) {
							SELECTWIN = $$.create(WIN, SELECTWINCFG);
						}
						SELECTWIN.open();
					}
				}, {
					text: "取消",
					handler: function(){
						DATAWIN.close();
					}
				}],
				modal: true
			},
			OPENWINCFG = {
				xtype: WIN,
				title: "打開文件",
				width: 300,
				height: 200,
				body: {
					xtype: COMBO,
					id: "fileSelect",
					fit: false
				},
				btbar: [{
					text: "確定",
					handler: function(){
						var cmp = $$.cmp("fileSelect");
						if (cmp.value) {
							$$.Ajax.post(cmp.value, {}, function(data){
								if (data) {
									data = (new Function("return " + data + ";"))();
									TEMPLET.openSource(data);
								}
							}, "text");
						}
						OPENWIN.close();
					}
				}, {
					text: "取消",
					handler: function(){
						OPENWIN.close();
					}
				}],
				modal: true
			},
			SELECTWIN, DATAWIN, OPENWIN;
		return {
			title: "模板精靈",
			xtype: CONTAINER,
			layout: CELL,
			layoutCfg: {
				dir: "-"
			},
			fit: true,
			items: [{
				xtype: PANEL,
				cellWidth: 40,
				noHeader: true,
				styler: {
					"overflow": "hidden"
				},
				body: {
					xtype: TOOLBAR,
					items: [{
						text: "新建",
						handler: function(){
							if (!DATAWIN) {
								DATAWIN = $$.create(WIN, DATAWINCFG);
							} else {
								DATAWIN.open();
							}
						}
					}, {
						text: "打開",
						handler: function(){
							if (!OPENWIN) {
								OPENWIN = $$.create(WIN, OPENWINCFG);
								var cmp = $$.cmp("fileSelect");
								$$.Ajax.post("getPageList.jsp", {}, function(data){
									if (data) {
										cmp.loadComboData(data);
									}
								}, "json");
							} else {
								OPENWIN.open();
							}
						}
					}, {
						text: "保存",
						handler: function(){
							var pageCode = TEMPLET.getTplPageCode(CURRTPLVIEW);
							var name=prompt("請輸入文件名稱","");
							if (!$$.isNullOrEmptyString(name)) {
								$$.Ajax.post("savePage.jsp", {
									name: name,
									code: pageCode.code,
									source: pageCode.source,
									requires: pageCode.requires
								}, function(){
									log("success");
								});
							}
						}
					}]
				}
			}, {
				xtype: CONTAINER,
				layout: CELL,
				layoutCfg: {
					dir: "|"
				},
				fit: true,
				items: [{
					xtype: PANEL,
					id: "tplEdit",
					noHeader: true,
					content: "",
					styler: {
						"overflow": "hidden"
					}
				}, {
					xtype: PANEL,
					cellWidth: 250,
					id: "optCfg",
					noHeader: true,
					content: "",
					styler: {
						"overflow": "hidden"
					}
				}]
			}]
		};
	}
);