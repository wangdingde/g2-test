(function($$) {
	var adqbutton = function(BUTTON){
		return {
			
		};
	};
	
	
	var AdqButton = {
		cons : function(opts) {
			this.apply(opts, {});
			var el = this;

			$(this.dom).linkbutton({
				key : "advanceQuery",
				text : this.text || "高级查询",
				iconCls : "icon-search",
				plain : true
			});

			$(this.dom).click(function() {
				if ($(this).linkbutton("options").disabled) {
					return;
				}
				el.showWin();
			});
		},
		disable : function() {
			$(this.dom).linkbutton("disable");
		},
		enable : function() {
			$(this.dom).linkbutton("enable");
		},
		showWin : function() {
			var queryWin = this.win;
			if (!queryWin) {
				this.init();
			} else {
				$(queryWin).dialog("open");
			}
		},
		init : function() {
			this.initColumnData();
			this.initQueryUnit();
			this.initWin();
		},
		getColCaption : function(col) {
			return col.getCaption();
		},
		initColumnData : function() {
			var cols = this.unit.cols, columns = this.columns || [],
			//excludes = this.excludes || [],
			//colNames = this.colNames || {},
			columnData = [], item, col;
			if (columns.length === 0) {
				for ( var i = 0; i < cols.length; i++) {
					col = cols[i];
					columnData.push({
						no : col.cname,
						name : this.getColCaption(col)
					});
				}
			} else {
				for ( var i = 0; i < columns.length; i++) {
					item = columns[i];
					if (!item.field) {
						continue;
					}
					col = this.unit.getCol(item.field);
					if (!col) {
						continue;
					}
					columnData.push({
						no : item.field,
						name : item.title || this.getColCaption(col)
					});
				}
			}
			this.columnData = columnData;
		},
		initQueryUnit : function() {
			var queryUnit = $$.create("DataUnit", {});
			queryUnit.aa = true;
			queryUnit.am = true;
			queryUnit.ad = true;
			var col = queryUnit.addCol("column", "String");
			col.opt = 2;
			col.cannull = false;
			col.def = this.columnData[0] ? this.columnData[0].no : "";
			col = queryUnit.addCol("opt", "String");
			col.opt = 2;
			col.cannull = false;
			col.def = "=";
			col = queryUnit.addCol("value", "String");
			col.opt = 2;
			col.cannull = false;

			this.queryUnit = queryUnit;
		},
		getTableId : function() {
			return this.unit.uname + "_queryTable";
		},
		initWin : function() {
			var el = this, unit = this.unit, queryWin = this.win, queryUnit = this.queryUnit, queryTable = this.table, optData = this.optData, columnData = this.columnData;

			queryWin = document.createElement("div");
			queryTable = document.createElement("div");
			queryTable.id = this.getTableId();
			$(queryTable).appendTo(queryWin);
			$(queryWin).appendTo(document.body);
			$(queryWin).dialog({
				title : this.text || "高级查询",
				width : 500,
				closed : false,
				collapsible : false,
				minimizable : false,
				modal : true,
				height : 300,
				buttons : [ {
					text : '查询',
					iconCls : 'icon-search',
					plain : true,
					handler : function() {
						el.query();
					}
				}, {
					text : '取消',
					iconCls : 'icon-cancel',
					plain : true,
					handler : function() {
						$(queryWin).dialog("close");
					}
				} ]
			});

			$(queryTable).datagrid({
				columns : [ [ {
					field : 'column',
					title : '条件名',
					width : 50,
					editor : {
						type : "asc",
						options : {
							type : "Combo",
							editable : false,
							comboData : columnData
						}
					},
					formatter : function(value, row, index) {
						var rec;
						for ( var i = 0; i < columnData.length; i++) {
							if (columnData[i].no === value) {
								rec = columnData[i].name;
								break;
							}
						}
						return rec || value
					}
				}, {
					field : 'opt',
					title : '比较符',
					width : 50,
					editor : {
						type : "asc",
						options : {
							type : "Combo",
							editable : false,
							comboData : optData
						}
					},
					formatter : function(value, row, index) {
						var rec;
						for ( var i = 0; i < optData.length; i++) {
							if (optData[i].no === value) {
								rec = optData[i].name;
								break;
							}
						}
						return rec || value
					}
				}, {
					field : 'value',
					title : '条件值',
					width : 50,
					editor : 'asc'
				} ] ]
			});

			$$.create("Toolbar", {
				tid : queryTable.id,
				noRefresh : true,
				sysBtns : [ "add", "remove" ],
				userButtons : {
					add : {
						key : "add",
						text : "增加条件"
					},
					remove : {
						key : "remove",
						text : "删除条件",
						handler : function() {
							if (queryUnit.isInputing) {
								queryUnit.endInput(true);
							}
							queryUnit.deleteRow(queryUnit.curr);
							queryUnit.accept(true);

							var curr = $$.getNextRow(queryUnit);
							queryUnit.curr = -1;
							queryUnit.setCurrent(curr);
							if (queryUnit.isInputing) {
								queryUnit.beginInput();
							}
						}
					}
				}
			});

			$$.bindingSorce(queryUnit, queryTable, "G");

			this.win = queryWin;
			this.table = queryTable;
		},
		getQueryParmas : function() {
			var unit = this.unit, queryWin = this.win, queryUnit = this.queryUnit, queryTable = this.table;
			var whereStr = this.whereStr || "", params = this.params ? $
					.extend({}, this.params) : {}, row, column, opt, val, colKey, col, isDate;
			if (this.onQuery) {
				var obj = this.onQuery(), key;
				if (obj) {
					if (obj.whereStr) {
						whereStr += (whereStr ? " AND " : " ") + obj.whereStr;
					}

					if (obj.params) {
						for (key in obj.params) {
							params[key] = obj.params[key];
						}
					}
				}
			}
			for ( var i = 0; i < queryUnit.rows.length; i++) {
				row = queryUnit.rows[i];
				column = row.getData("column");
				col = unit.getCol(column);
				isDate = this.isDateType(col.dtype);
				colKey = isDate ? column + "_DATE" : column;
				opt = row.getData("opt");
				val = row.getData("value");
				if (isDate) {
					try {
						val = $$.Util.Date.parse(val, "yyyymmdd").getTime();
					} catch (e) {
						$.messager.alert("警告", col.getCaption()
								+ "日期格式不符合(年年年年月月日日)！", "warning");
						return;
					}
				}
				if (opt === "=") {
					opt = " = ";
				} else if (opt === "<=") {
					opt = " <= ";

				} else if (opt === "<>") {
					opt = " <> ";
				} else if (opt === "%%") {
					opt = " LIKE ";
					val = "%" + val + "%";
				} else if (opt === "%=") {
					opt = " LIKE ";
					val = "%" + val;
				} else if (opt === "=%") {
					opt = " LIKE ";
					val = val + "%";
				} else if (opt === ">=") {
					opt = " >= ";
				} else if (opt === ">") {
					opt = " > ";
				} else if (opt === "<") {
					opt = " < ";
				}
				whereStr += (whereStr ? " AND " : " ") + column + opt + ":"
						+ colKey;
				params[colKey] = val;
			}
			return {
				whereStr : whereStr,
				params : params
			};
		},
		isDateType : function(type) {
			return type === "Date";
		},
		query : function() {
			var unit = this.unit, queryWin = this.win, queryUnit = this.queryUnit, queryTable = this.table;
			if (queryUnit._err > 0) {
				$.messager.show({
					title : '提示',
					msg : '请按提示输入完整条件再进行查询！',
					timeout : 2000
				});
			} else {
				var queryParams = this.getQueryParmas();
				this._query(queryParams);
				$(queryWin).dialog("close");
			}
		},
		_query : function(queryParams) {
			var unit = this.unit;
			if (unit.mdl) {
				$$.getRemoteData({
					accNo : "",
					clazz : "",
					name : unit.mdl.mname,
					opType : 1,
					whereStr : queryParams.whereStr,
					parmMap : queryParams.params
				}, true);
			}
		},
		optData : [ {
			no : "=",
			name : "等于"
		}, {
			no : "<>",
			name : "不等于"
		}, {
			no : "%%",
			name : "包含"
		}, {
			no : "=%",
			name : "开头是"
		}, {
			no : "%=",
			name : "结尾是"
		}, {
			no : ">=",
			name : "大于等于"
		}, {
			no : "<=",
			name : "小于等于"
		}, {
			no : ">",
			name : "大于"
		}, {
			no : "<",
			name : "小于"
		} ]
	};
	$$.register("UIControl", "AdqButton", AdqButton);

})(window.com.ASC);
