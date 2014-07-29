(function($, $$) {
var adqbutton = function(BUTTON, BASEDATA, DATAUNIT, WIN, GRID, COMBO){
	return {
		extend: BUTTON,
		mixins: [BASEDATA],
		ctor: function(){
			this.handler = function(){
				this.showWin();
			};
		},
		defCfg: {
			text: "高级筛选"
		},
		showWin: function() {
			var queryWin = this.win;
			if (!queryWin) {
				this.initColumnData();
				this.initQueryUnit();
				this.initWin();
			} else {
				queryWin.open();
			}
		},
		getSourceUnit: function(){
			var unit = this.getDataSource();
			
			if (unit.topUnit) {
				unit = unit.topUnit();
			}
			return unit;
		},
		initColumnData: function() {
			var ds = this.getSourceUnit(),
				cols = ds.cols,
				columns = this.columns || [],
				notAllowType = ["I", "PIC", "SND", "VDO", "PID", "IDA", "LVL", "NOA", "NMA"],
			//excludes = this.excludes || [],
			//colNames = this.colNames || {},
				columnData = [], item, col, cp;
			if (columns.length === 0) {
				for ( var i = 0; i < cols.length; i++) {
					col = cols[i];
					cp = col.ctype;
					if (cp && notAllowType.indexOf(cp) !== -1) {
						continue;
					}
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
					col = ds.getCol(item.field);
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
		initQueryUnit: function() {
			var queryUnit = $$.create(DATAUNIT, {});
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
			col.def = "%%";
			col = queryUnit.addCol("value", "String");
			col.opt = 2;
			col.cannull = false;

			this.queryUnit = queryUnit;
		},
		initWin: function() {
			var el = this,
				queryWin = this.win, 
				queryUnit = this.queryUnit, 
				optData = this.optData, 
				columnData = this.columnData;
			
			queryWin = $$.create(WIN, {
				title: this.text,
				width: 500,
				height: 300,
				closed: false,
				collapsible: false,
				minimizable: false,
				maximizable: false,
				modal: true,
				btbar: [{
					text: "確定",
					handler: function(){
						el.query();
					}
				}, {
					text: "取消",
					handler: function(){
						queryWin.close();
					}
				}],
				body: {
					xtype: GRID,
					noHeader: true,
					ttbar: {
						needButtons: ["add", "remove"],
						onRemove: function(){
							if(queryUnit.isInputing){
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
					},
					body: {
						unit: queryUnit,
						columns: [{
							field : 'column', title : '条件名', editor : {
								xtype: COMBO,
								editable : false,
								comboData : columnData
							}
						}, {
							field : 'opt', title : '比较符', editor : {
								xtype: COMBO,
								editable : false,
								comboData : optData
							}
						}, {
							field : 'value', title : '条件值', editor: {}
						}]
					}
				}
			});
			
			this.win = queryWin;
			//this.table = queryTable;
		},
		getColCaption: function(col) {
			return col.getCaption();
		},
		getQueryParmas: function() {
			var unit = this.getSourceUnit(), 
				queryUnit = this.queryUnit,
				rows = queryUnit.rows,
				whereStr = this.whereStr || "", 
				params = this.params ? $.extend({}, this.params) : {}, 
				idx = 0,
				row, column, opt, val, colKey, col, isDate;
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
			for (var i = 0, len = rows.length; i < len; i++) {
				row = rows[i];
				column = row.getData("column");
				col = unit.getCol(column);
				isDate = this.isDateType(col.dtype);
				colKey = "P"+idx++;
				if (isDate) {
					colKey += "_DATE";
				}
				opt = row.getData("opt");
				val = row.getData("value");
				if (isDate) {
					try {
						val = $$.Util.Date.parse(val, "yyyymmdd").getTime();
					} catch (e) {
						$.messager.alert("警告", this.getColCaption(col)
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
			var queryWin = this.win, 
				queryUnit = this.queryUnit;
			if (queryUnit._err > 0) {
				$.messager.show({
					title : '提示',
					msg : '请按提示输入完整条件再进行查询！',
					timeout : 2000
				});
			} else {
				var res = this.getQueryParmas();
				
				this._query(res);
				queryWin.close();
			}
		},
		_query : function(queryParams) {
			var unit = this.getSourceUnit(),
				mdl = unit.mdl;
			if (mdl) {
				$$.Data.loadRemoteData({mname: mdl.mname, whereStr: queryParams.whereStr, parmMap: queryParams.params, opType: 1, clearData: true});
			}
		},
		optData: [{
			no : "=", name : "等于"
		}, {
			no : "<>", name : "不等于"
		}, {
			no : "%%", name : "包含"
		}, {
			no : "=%", name : "开头是"
		}, {
			no : "%=", name : "结尾是"
		}, {
			no : ">=", name : "大于等于"
		}, {
			no : "<=", name : "小于等于"
		}, {
			no : ">", name : "大于"
		}, {
			no : "<", name : "小于"
		}]
	};
};
	
$$.define("form.AdqButton", ["form.Button", "data.BaseData", "data.DataUnit", "panel.Window", "grid.Grid", "form.Combo"], adqbutton);

})(window.jQuery, window.com.pouchen);
