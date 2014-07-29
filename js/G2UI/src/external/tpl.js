(function($, $$){
var className = "Templet";
var TPL = function(CONTROL){
	/**
	 * @property {Number} IDX
	 * tpl模板idx，自動累加
	 * @private
	 */
	var IDX = 0,
		LOADER = $$.Loader,
		METAWIN;
	return {
		extend: CONTROL,
		static: true,
		/**
		 * @property {Array} supports
		 * 模板支持列表
		 * 
		 * 其中每個idx下的內容代表idx+1個表可使用的模板
		 * 
		 * 如：supports[2]表示三個表可使用的基礎模板列表
		 * 
		 * tpl：模板編號/名稱
		 * 
		 * nav：基礎模板是否需要導航區，none表示不需要，must表示必須要，其他表示可有可無
		 */
		supports: [
			[{
				tpl: "grid01",
				nav: "none"
			}, {
				tpl: "grid03",
				nav: "must"
			}], [{
				tpl: "grid05",
				nav: "none"
			}, {
				tpl: "grid04",
				nav: "must"
			}], [{
				tpl: "grid06",
				nav: "none"
			}, {
				tpl: "grid07",
				nav: "must"
			}, {
				tpl: "grid08",
				nav: "none"
			}, {
				tpl: "grid09",
				nav: "must"
			}], [{
				tpl: "grid10",
				nav: "none"
			}, {
				tpl: "grid11",
				nav: "must"
			}, {
				tpl: "grid12",
				nav: "must"
			}]
		],
		/**
		 * @method setDataSource
		 * 設置模板當前的數據源，並加載數據源結構信息
		 * @param {String} mname 模型編號
		 */
		setDataSource: function(mname){
			if (this.modelName !== mname) {
				this.modelName = mname;
				
				model = $$.Data.getRemoteData({mname: mname, opType: 0, clearData: true});
				this.currModel = model;
			}
		},
		/**
		 * @method getDefaultCnt
		 * 獲取當前數據源默認表數量
		 * @return {Number} unit數量
		 */
		getDefaultCnt: function(){
			var model = this.currModel,
				units = model ? model.units : [];
			
			return units.length || 2;
		},
		/**
		 * @property {String} [fileType=tpl]
		 * 模板文件默認文件類型
		 */
		fileType: "tpl",
		/**
		 * @property {Object} baseKey
		 * 基礎Key對照表，控件對照關係
		 */
		baseKey: {
			CELL: "cell",
			CONTAINER: "core.Container",
			TABLE: "table",
			LABELFIELD: "form.LabelField",
			LABEL: "form.Label",
			INPUT: "form.Input",
			NUMBERBOX: "form.NumberBox",
			COMBO: "form.Combo",
			CHECKBOX: "form.CheckBox",
			DATEBOX: "form.DateBox",
			BUTTON: "form.Button",
			PANEL: "panel.Panel",
			WINDOW: "panel.Window",
			GRID: "grid.Grid",
			UNIT: "data.DataUnit"
		},
		/**
		 * @property {Object} requireMapping
		 * 特殊的require對照表，如cell對應的require應該爲layout.CellLayout
		 */
		requireMapping: {
			cell: "layout.CellLayout",
			table: "layout.TableLayout"
		},
		/**
		 * @property {Object} ttype2ViewMapping
		 * 模板區域類型預覽轉化對照表
		 */
		ttype2ViewMapping: {
			"DG": {
				xtype: "grid.Grid",
				content: "Grid數據區"
			}, 
			"DF": {
				xtype: "form.Form",
				content: "Form數據區"
			},
			"NG": {
				xtype: "grid.Grid",
				content: "導航區"
			},
			"QF": {
				xtype: "form.QueryForm",
				content: "查詢區"
			}
		},
		/**
		 * @property {Object} loadedTpl
		 * 記錄已加載的基礎模板
		 */
		loadedTpl: {},
		/**
		 * @method getPath
		 * 獲取模板文件加載路徑
		 * @param {String} tpl 文件名稱
		 * @return {String} 文件路徑
		 */
		getPath: function(tpl){
			var fileType = this.fileType,
				path = LOADER.getPath(className),
				st = path.lastIndexOf("/"),
				end = path.indexOf("?"),
				tplpath;
				
			tplpath = path.substr(0, st+1) + tpl + "." + fileType + path.substr(end);
			
			return tplpath;
		},
		/**
		 * @method loadTpl
		 * 載入遠端模板文件
		 * @param {String} tpl 模板名稱
		 * @return {Object} 模板對象
		 */
		loadTpl: function(tpl){
			var loadedTpl = this.loadedTpl,
				path = this.getPath(tpl),
				res = {};
			
			$$.Ajax.ajax(path, {
				type: "GET",
				dataType: "text",
				async:false,
				success: function(msg){
					res.source = msg;
				}
			});
			
			loadedTpl[tpl] = res;
			return res;
		},
		/**
		 * @method getBaseTpl
		 * 獲取基礎模板，未加載時先呼叫loadTpl進行加載動作
		 * @param {String} tpl 模板名稱
		 * @return {Object} 模板對象
		 */
		getBaseTpl: function(tpl){
			var loadedTpl = this.loadedTpl,
				res = null;
			
			if (typeof tpl == "object") {
				return tpl;
			} else if (typeof tpl == "string") {
				res = loadedTpl[tpl];
			} 
			
			if (!res) {
				res = this.loadTpl(tpl);
			}
			
			return res || tpl;
		},
		/**
		 * @method getNeedTpl
		 * 依據基礎模板獲取所需的模板對象
		 * @param {Object} basetpl 基礎模板對象
		 * @param {Boolean} tplNav 基礎模板導航區支持狀況
		 * @param {Boolean} nav 是否需要導航區
		 * @param {Boolean} query 是否需要查詢區
		 * @return {Object} 所需模板對象，無法取得時返回null
		 */
		getNeedTpl: function(basetpl, tplNav, nav, query){
			var extended = $.extend({}, basetpl),
				source = extended.source, view;
			
			if ((tplNav == "none" && nav) || tplNav == "must" && !nav) {
				return null;
			}
			
			if (nav) {
				source = "{" +
							"layout: ${CELL}," +
							"layoutCfg: {" +
								"dir: \"|\""+
							"}," +
							"items: [{" +
								"cellWidth: 120,"+
								"ttype: \"NG\""+
							"}, "+source+"]" +
						"}";
			}
			
			if (query) {
				source = "{" +
							"layout: ${CELL}," +
							"layoutCfg: {" +
								"dir: \"-\""+
							"}," +
							"items: [{" +
								"cellWidth: 60,"+
								"ttype: \"QF\""+
							"}, "+source+"]" +
						"}";
			}
			extended.source = source;
			extended.tplID = "TPL_"+IDX++;
			view =  this.source2View(source);
			extended.view = view.source;
			extended.requires = view.requires;
			extended.cache = {};
			extended.nav = nav;
			extended.query = query;
			
			return extended;
		},
		/**
		 * @method source2View
		 * 將模板源代碼轉換爲可預覽展示的預覽代碼
		 * @param {String} source 源代碼
		 * @return {Object} source：轉化後的代碼，requires：預覽所需加載的class
		 */
		source2View: function(source){
			var requireMapping = this.requireMapping,
				baseKey = this.baseKey, 
				reqs = [],
				obj, key, reg, req, o;
			
			for (key in baseKey) {
				req = baseKey[key];
				reg = new RegExp("\\$\\{" + key + "\\}", "ig");
				source = source.replace(reg, "\"" + req + "\"");
				
				req = requireMapping[req] || req;
				if (reqs.indexOf(req) === -1) {
					reqs.push(req);
				}
			}
			
			obj = (new Function("return " + source + ";"))();
			this.parseObj(obj, reqs);
			
			return {
				source: JSON.stringify(obj),
				requires: reqs
			};
		},
		/**
		 * @method parseObj
		 * 內部方法，供source2View使用，針對模板代碼中的ttype進行轉化
		 * @param {Object} obj 待轉化對象指針
		 * @param {Array} reqs 所需加載的class列表
		 */
		parseObj: function(obj, reqs){
			var baseKey = this.baseKey,
				container = baseKey.CONTAINER,
				items = obj.items,
				ttype2ViewMapping = this.ttype2ViewMapping,
				ttype = obj.ttype,
				mp, key, o;
			//obj.fit = true;
			obj.noHeader = true;
			if (items) {
				obj.xtype = container;
				if (reqs.indexOf(container) === -1) {
					reqs.push(container);
				}
				for (var i = 0, len = items.length; i < len; i++) {
					this.parseObj(items[i], reqs);
				}
			} else if (ttype) {
				mp = ttype2ViewMapping[ttype];
				obj.xtype = mp.xtype;
				obj.styler = {
					"overflow": "hidden"
				};
				obj.content = mp.content;
				if (reqs.indexOf(mp.xtype) === -1) {
					reqs.push(mp.xtype);
				}
			}
		},
		/**
		 * @method getViewCfg
		 * 獲取模板對應預覽所用的page配置
		 * @param {Boolean} justView 是否只是單純的預覽
		 * @return {Object} page配置
		 */
		getViewCfg: function(tpl, justView){
			var el = this,
				obj = (new Function("return " + tpl.view + ";"))();
			
			obj.tpl = tpl;
			if (!justView) {
				tpl.viewId = 0;
				this.extendViewObj(obj, tpl);
			} else {
				obj.listeners = {
					"onDomClick": function(){
						el.onCheckTpled && el.onCheckTpled(tpl, this);
					}
				};
			}
			
			return obj;
		},
		/**
		 * @method extendViewObj
		 * 對非預覽模式的page配置追加內容，供getViewCfg使用
		 * @param {Object} obj 配置
		 * @param {Object} tpl 模板
		 */
		extendViewObj: function(obj, tpl){
			var el = this,
				items = obj.items;
			
			obj.fit = true;
			obj.tplViewId = "TPL_VIEW_"+tpl.viewId++;
			if (items) {
				for (var i = 0, len = items.length; i < len; i++) {
					this.extendViewObj(items[i], tpl);
				}
			} else {
				obj.listeners = {
					"onDomClick": function(){
						el.setTtype(this.ttype, this);
					}
				};
			}
		},
		/**
		 * @method setTpl
		 * 設置當前選用模板
		 * @param {Object} tpl 選用模板
		 */
		setTpl: function(tpl){
			this.currTpl = tpl;
			this.onSetTpled && this.onSetTpled(tpl);
		},
		/**
		 * @method setTtype
		 * 設置當前選中區域類型
		 * @param {Object} ttype 區域類型
		 * @param {Object} el 選中的對象
		 */
		setTtype: function(ttype, el){
			var baseKey = this.baseKey,
				container = baseKey.CONTAINER,
				cfg = {
					xtype: container,
					layout: baseKey.TABLE,
					fit: true,
					layoutCfg: {
						columns: 1,
						colWidth: 0.9
					},
					itemCfg: {
						xtype: baseKey.LABELFIELD,
						height: 30
					}
				};
			
			cfg.items = this.getTtypeItems(ttype, this.currTpl, el.tplViewId);
			this.currViewId = el.tplViewId;
			this.currTtype = ttype;
			this.onSetTtyped && this.onSetTtyped(ttype, cfg, el);
		},
		/**
		 * @method getTableData
		 * 獲取數據源對應所有的數據表列表
		 * @return {Array} 數據列表
		 */
		getTableData: function(){
			var model = this.currModel,
				units = model.units,
				i = 0, len = units.length,
				data = [], unit;
			
			for (; i < len; i++) {
				unit = units[i];
				data.push({
					no: unit.uname,
					name: unit.getCaption()
				});
			}
			
			return data;
		},
		/**
		 * @method getTopUnit
		 * 獲取最上級unit，提供查詢或導航的col
		 * @return {String} 所需的unit名稱
		 */
		getTopUnit: function(){
			var model = this.currModel,
				topUnit = model.topUnit();
			
			return topUnit ? topUnit.uname : null;
		},
		/**
		 * @method getTmpUnit
		 * 獲取臨時unit，用於meta信息配置時使用
		 * @return {Object} dataunit
		 */
		getTmpUnit: function(){
			if (this.TMPUNIT) {
				return this.TMPUNIT;
			}
			var baseKey = this.baseKey,
				tmpUnit = $$.create(baseKey.UNIT, {}),
				col;
			
			tmpUnit.aa = true;
			tmpUnit.am = true;
			tmpUnit.ad = true;
			col = tmpUnit.addCol("FIELD", "String");
			col.opt = 2;
			col.cannull = false;
			//col.def = this.columnData[0] ? this.columnData[0].no : "";
			col = tmpUnit.addCol("FIELD_DESC", "String");
			col.opt = 2;
			col.cannull = false;
			//col.def = "%%";
			col = tmpUnit.addCol("FIELD_EDITOR", "String");
			col.opt = 2;
			col.def = "none";
			col.cannull = false;
			//col = tmpUnit.addCol("SORT", "Number");
			//col.opt = 2;
			//col.cannull = true;
			//col.auto = "1";
			
			//tmpUnit.sort("SORT DESC");
			this.TMPUNIT = tmpUnit;
			return tmpUnit;
		},
		/**
		 * @method getExcludeCols
		 * 獲取unit中不允許顯示的col
		 * @param {String} val unit名稱
		 * @return {Array} 不允許顯示的col的idx列表
		 */
		getExcludeCols: function(val){
			var model = this.currModel,
				topUnit = model.topUnit(),
				unit = model.getUnit(val),
				relas = model.relas,
				i = 0, len = relas.length,
				data = [],
				rela, cunit, ccIdxs;
			
			if (unit === topUnit) {
				return data;
			}
			for (; i < len; i++) {
				rela = relas[i];
				cunit = rela.cu;
				if (cunit === unit && rela.rtype === "c") {
					ccIdxs = rela.ccIdxs;
					data = data.concat(ccIdxs);
				}
			}
			
			return data;
		},
		/**
		 * @method getMetaDefData
		 * 獲取unit默認的meta信息
		 * @param {String} val unit名稱
		 * @return {Array} 默認meta信息
		 */
		getMetaDefData: function(val){
			//SM015_01
			var model = this.currModel,
				unit = model.getUnit(val),
				currTtype = this.currTtype,
				data = [],
				notAllowType = ["I", "PIC", "SND", "VDO", "PID", "IDA", "LVL", "NOA", "NMA"],
				readOnlyType = ["CU", "CT", "MU", "MT", "S", "SU", "ST"],
				numberTypes = ["Byte", "Short", "Integer", "Long", "Float", "Double"],
				cols = unit.cols,
				i = 0, len = cols.length,
				excludeCols = this.getExcludeCols(val),
				ctype, col, dtype, editorType;
			
			if (unit) {
				for (; i < len; i++) {
					col = cols[i];
					ctype = col.ctype;
					dtype = col.dtype;
					
					if ((!ctype || notAllowType.indexOf(ctype) === -1) && excludeCols.indexOf(col.idx) === -1) {
						if (currTtype === "NG" || (ctype && readOnlyType.indexOf(ctype) !== -1)) {
							editorType = "none";
						} else {
							editorType = dtype == "Date" ? "DateBox" : (numberTypes.indexOf(dtype) == -1 ? "Input" : "NumberBox");
						}
						data.push({
							"FIELD": col.cname,
							"FIELD_DESC": col.getCaption(),
							"FIELD_EDITOR": editorType
						});
					}
				}
			}
			
			return data;
		},
		/**
		 * @method setMetaDefData
		 * 設置meta數據
		 * @param {Object} unit unit對象
		 * @param {Array} data meta數據
		 */
		setMetaDefData: function(unit, data){
			var i = 0, len = data.length,
				d;
			unit.clearData();
			unit.accept(true);
			
			for (; i < len; i++) {
				d = data[i];
				unit.newRow(d);
			}
		},
		/**
		 * @method showMetaWin
		 * 顯示meta配置window
		 * @param {String} val unit名稱
		 * @param {Object} tpl 模板對象
		 * @param {String} tplViewId 區域ID
		 */
		showMetaWin: function(val, tpl, tplViewId){
			var el = this,
				baseKey = this.baseKey,
				tmpUnit = this.getTmpUnit(),
				cache = tpl.cache,
				cacheData = cache[tplViewId],
				unitDefData = cacheData ? (cacheData.meta || this.getMetaDefData(val)) : this.getMetaDefData(val),
				cfg;
			
			this.setMetaDefData(tmpUnit, unitDefData);
			
			if (!METAWIN) {
				cfg = {
					xtype: baseKey.WINDOW,
					modal: true,
					width: 700,
					title: "數據欄位配置",
					btbar: [{
						text: "确定",
						handler: function(){
							var currTpl = el.currTpl,
								currCache = currTpl.cache,
								viewId = el.currViewId,
								currRow = tmpUnit.getRow(tmpUnit.curr);
							if (currRow) {
								el.updateCacheEditorData(currRow);
							}
							if (!currCache[viewId]) {
								currCache[viewId] = {};
							}
							
							currCache[viewId].meta = tmpUnit.getUnitData();//el.getMetaData(tmpUnit);
							METAWIN.close();
						}
					}, {
						text: "取消",
						handler: function(){
							METAWIN.close();
						}
					}],
					body: {
						xtype: baseKey.CONTAINER,
						layout: baseKey.CELL,
						fit: true,
						layoutCfg: {
							dir: "|"
						},
						items: [{
							xtype: baseKey.GRID,
							noHeader: true,
							fit: true,
							id: "META_GRID",
							ttbar: {
								id: "META_GRID_TOOLBAR",
								needButtons: ["add", "edit", "remove"],
								onRemove: function(){
									var inputing = tmpUnit.isInputing,
										curr = tmpUnit.curr, len;
									if(inputing){
										tmpUnit.endInput(true);
									}
									tmpUnit.deleteRow(curr);
									tmpUnit.accept(true);
									
									len = tmpUnit.rows.length;
									curr = len ? Math.min(curr, tmpUnit.rows.length-1) : -1;
									tmpUnit.setCurrent(curr);
								}
							},
							body: {
								columns : [{
									title: "col", field: "FIELD", editor: {}
								}, {
									title: "col 描述", field: "FIELD_DESC", editor: {}
								}, {
									title: "editor", field: "FIELD_EDITOR", editor: {
										xtype: baseKey.COMBO,
										comboData: this.getEditorData()
									}
								}],
								unit: tmpUnit
							}
						}, {
							xtype: baseKey.PANEL,
							fit: true,
							//noHeader: true,
							title: "编辑器配置",
							collapsible: false,
							minimizable: false,
							closable:  false,
							maximizable: false,
							id: "TPL_EDITOR_CFG",
							content: "",
							styler: {
								"overflow": "hidden"
							},
							cellWidth: 250
						}]
					}
				};
				
				tmpUnit.bind({
					"onSetCurrenting": function(oldRow, newRow){
						if (oldRow) {
							el.updateCacheEditorData(oldRow);
						}
					},
					"onSetCurrented": function(oldRow, newRow){
						el.setEditorType(newRow ? newRow.getData("FIELD_EDITOR") : "", el.getCacheEditorData(newRow));
					},
					"onSetDataed": function(row, col, oldVal, newVal){
						if (col && col.cname === "FIELD_EDITOR") {
							el.setEditorType(newVal, el.getCacheEditorData(row));
						}
					}
				});
				METAWIN = $$.create(baseKey.WINDOW, cfg);
			} else {
				METAWIN.open();
			}
		},
		/**
		 * @method getCacheEditorData
		 * 獲取row緩存的editor配置信息
		 * @param {Object} row row對象
		 * @return {Object} editor配置
		 */
		getCacheEditorData: function(row){
			if (!row) {
				return {};
			}
			var currTpl = this.currTpl,
				currCache = currTpl.cache,
				viewId = this.currViewId,
				cacheData = currCache[viewId],
				field = row.getData("FIELD"),
				editorCfgs;
			
			if (!cacheData) {
				return {};
			}
			editorCfgs = cacheData.editorCfgs;
			if (!editorCfgs) {
				return {};
			}
			
			return editorCfgs[field] || {};
		},
		/**
		 * @method updateCacheEditorData
		 * 更新row緩存的editor配置信息
		 * @param {Object} row row對象
		 */
		updateCacheEditorData: function(row){
			if (!row) {
				return;
			}
			var currTpl = this.currTpl,
				currCache = currTpl.cache,
				viewId = this.currViewId,
				cacheData = currCache[viewId],
				field = row.getData("FIELD"),
				editorCfgs;
			
			if (!cacheData) {
				cacheData = currCache[viewId] = {};
			}
			editorCfgs = cacheData.editorCfgs;
			if (!editorCfgs) {
				editorCfgs = cacheData.editorCfgs =  {};
			}
			
			editorCfgs[field] = this.getEditorVals();
		},
		/**
		 * @method getEditorData
		 * 更新允許選擇的editor類型列表數據
		 * @return {Object} editor類型列表
		 */
		getEditorData: function(){
			var editors = this.supportEditors,
				data = [],
				key, editor;
			
			for (key in editors) {
				editor = editors[key];
				data.push({
					"no": key,
					"name": editor.desc || key
				});
			}
			return data;
		},
		/**
		 * @property {Object} supportEditors
		 * 允許選擇的editor類型
		 */
		supportEditors: {
			"none": {
				items: []
			},
			"Input": {
				items: []
			},
			"NumberBox": {
				items: ["spinner"]
			},
			"CheckBox": {
				items: ["on", "off"]
			},
			"Combo": {
				items: ["textField", "valueField", "sqlNo"]
			},
			"DateBox": {
				items: ["min", "max", "dateType"]
			}
		},
		/**
		 * @property {Object} editorCfgMapping
		 * editor配置項對照
		 */
		editorCfgMapping: {
			textField: {def: "name"},
			valueField: {def: "no"},
			on: {def: "Y"},
			off: {def: "N"},
			opt: {
				def: "%%",
				comboData: [{
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
			}
		},
		/**
		 * @method getEditorVals
		 * 獲取當前所有的editor配置的信息
		 * @return {Object} editor配置信息
		 */
		getEditorVals: function(){
			var editorCfgEl = $$.cmp("TPL_EDITOR_CFG"),
				body = editorCfgEl.body,
				res = {},
				items, item, i, len, field, val;
			
			if (body) {
				items = body.items;
				i = 0;
				len = items.length;
				for (; i < len; i++) {
					item = items[i];
					field = item.field;
					val = item.getValue();
					if (field && val) {
						res[field] = val;
					}
				}
			}
			
			return res;
		},
		/**
		 * @method getEditorItems
		 * 獲取editor允許出現的items
		 * @param {String} val editor類型
		 * @param {Object} editorCfg 緩存數據
		 * @return {Object} editor允許的items
		 */
		getEditorItems: function(val, editorCfg){
			var baseKey = this.baseKey,
				editors = this.supportEditors,
				currTtype = this.currTtype,
				editor = editors[val],
				commoms = val === "none" ? ["formatter"] : (currTtype === "QF" ? ["formatter", "placeholder", "must", "opt"] : ["formatter", "placeholder"]),
				arr = val === "none" ? commoms : commoms.concat(editor.items || []),
				editorCfgMapping = this.editorCfgMapping,
				i = 0,
				len = arr.length,
				cfgs = [],
				a, cfg, val, mp;
			
			for (; i < len; i++) {
				a = arr[i];
				mp = editorCfgMapping[a] || {};
				val = editorCfg[a] || mp.def;
				cfg = {
					label: mp.label || a,
					field: a
				};
				if (a === "sqlNo") {
					cfg.fieldCfg = {
						xtype: baseKey.COMBO,
						textField: "SM085_06",
						valueField: "SM085_04",
						unit: {
							sqlNo: "SM085Query"
						}
					};
				} else if (a === "opt") {
					cfg.fieldCfg = {
						xtype: baseKey.COMBO,
						comboData: mp.comboData
					};
				} else if (a === "spinner" || a === "must") {
					cfg.fieldCfg = {
						xtype: baseKey.CHECKBOX,
						on: true,
						off: false
					};
				}
				if (!$$.isNullOrEmptyString(val)) {
					if (!cfg.fieldCfg) {
						cfg.fieldCfg = {};
					}
					cfg.fieldCfg.value = val;
				}
				cfgs.push(cfg);
			}
			
			return cfgs;
		},
		/**
		 * @method getEditorCfg
		 * 獲取editor允許出現的完整模塊配置
		 * @param {String} val editor類型
		 * @param {Object} editorCfg 緩存數據
		 * @return {Object} editor完整模塊配置
		 */
		getEditorCfg: function(val, editorCfg){
			if (!val) {
				return [];
			}
			var baseKey = this.baseKey,
				cfg = {
					xtype: baseKey.CONTAINER,
					layout: baseKey.TABLE,
					fit: true,
					layoutCfg: {
						columns: 1,
						colWidth: 0.9
					},
					itemCfg: {
						xtype: baseKey.LABELFIELD,
						labelWidth: 0.4,
						height: 30
					}
				};
			
			cfg.items = this.getEditorItems(val, editorCfg);
			return cfg;
		},
		/**
		 * @method setEditorType
		 * 設置當前editor類型
		 * @param {String} newVal editor類型
		 * @param {Object} editorCfg 緩存數據
		 */
		setEditorType: function(newVal, editorCfg){
			var editorCfgEl = $$.cmp("TPL_EDITOR_CFG"),
				body;
			if (editorCfgEl) {
				body = newVal ? this.getEditorCfg(newVal, editorCfg) : "";
				editorCfgEl.setBody(body);
			}
		},
		/**
		 * @method getTtypeItems
		 * 獲取模板區域類型允許出現的items
		 * @param {String} ttype 區域類型
		 * @param {Object} tpl 模板
		 * @param {String} tplViewId 區域id
		 * @return {Object} 允許出現的items
		 */
		getTtypeItems: function(ttype, tpl, tplViewId){
			var el = this,
				model = this.currModel,
				items = [],
				baseKey = this.baseKey,
				cache = tpl.cache,
				cacheData = cache[tplViewId],
				isData = ttype === "DG" || ttype === "DF",
				val = this.getTopUnit(),
				comboData, unit;
			
			unit = model.getUnit(val);
			var title = cacheData ? cacheData.title : (isData || !unit ? "" : unit.getCaption()),
				size = cacheData ? cacheData.size : (ttype === "QF" ? 60 : (ttype === "NG" ? 120 : ""));
			
			if (ttype === "QF") {
				title = "";
			}
			
			items.push({
				xtype: baseKey.LABEL,
				text: "公共配置："
			});
			
			items.push({
				label: "Title",
				id: "TPL_TITLE",
				fieldCfg: {
					value: title,
					listeners: {
						"onSetData": function(val){
							var currTpl = el.currTpl,
								currCache = currTpl.cache,
								viewId = el.currViewId;
							if (!currCache[viewId]) {
								currCache[viewId] = {};
							}
							currCache[viewId].title = val;
						}
					}
				}
			});
			
			items.push({
				label: "Size",
				//id: "TPL_SIZE",
				fieldCfg: {
					value: size,
					listeners: {
						"onSetData": function(val){
							var currTpl = el.currTpl,
								currCache = currTpl.cache,
								viewId = el.currViewId;
							if (!currCache[viewId]) {
								currCache[viewId] = {};
							}
							currCache[viewId].size = val;
						}
					}
				}
			});
			
			items.push({
				xtype: baseKey.LABEL,
				text: "專有配置："
			});
			if (isData) {
				comboData = this.getTableData();
				items.push({
					label: "數據表",
					fieldCfg: {
						xtype: baseKey.COMBO,
						id: "TPL_TABLE",
						value: cacheData ? cacheData.table : undefined,
						listeners: {
							"onSetData": function(val){
								var currTpl = el.currTpl,
									currCache = currTpl.cache,
									viewId = el.currViewId,
									titleCmp = $$.cmp("TPL_TITLE");
								if (!currCache[viewId]) {
									currCache[viewId] = {};
								}
								unit = model.getUnit(val);
								
								currCache[viewId].table = val;
								if (unit) {
									currCache[viewId].tableDesc = unit.getCaption();
									titleCmp.setValue(unit.getCaption());
								}
							}
						},
						comboData: comboData
					}
				});
				items.push({
					label: "數據欄位",
					fieldCfg: {
						xtype: baseKey.BUTTON,
						text: "編輯",
						handler: function(){
							var table = $$.cmp("TPL_TABLE"),
								val = table.value;
							if (!val) {
								alert("請先選擇數據表！");
								table.showCombo();
							} else {
								el.showMetaWin(val, tpl, tplViewId);
							}
						}
					}
				});
			} else {
				items.push({
					label: ttype === "NG" ? "導航欄位" : "查詢欄位",
					fieldCfg: {
						xtype: baseKey.BUTTON,
						text: "編輯",
						handler: function(){
							var currTpl = el.currTpl,
								currCache = currTpl.cache,
								viewId = el.currViewId,
								val = el.getTopUnit();
							
							if (!currCache[viewId]) {
								currCache[viewId] = {};
							}
							unit = model.getUnit(val);
							
							currCache[viewId].table = val;
							if (unit) {
								currCache[viewId].tableDesc = unit.getCaption();
							}
							if (val) {
								el.showMetaWin(val, tpl, tplViewId);
							}
						}
					}
				});
			}
			
			return items;
		},
		/**
		 * @method getTplPageCode
		 * 獲取模板最終的頁面code
		 * @param {Object} viewCode 預覽代碼對象
		 * @return {Object} 頁面code相關信息
		 */
		getTplPageCode: function(viewCode){
			var tpl = this.currTpl,
				cache = tpl.cache;
			
			this.view2Page(viewCode, cache, tpl);
			if (!viewCode.title) {
				var model = this.currModel,
					unit = model.topUnit();
				
				viewCode.title = unit.getCaption();
			}
			
			var source = {
				tableCnt: tpl.tableCnt,
				tplIdx: tpl.tplIdx,
				nav: tpl.nav,
				query: tpl.query,
				cache: tpl.cache,
				mname: this.modelName,
				cache: tpl.cache,
				requires: tpl.requires
			};
			
			return {
				code: JSON.stringify(viewCode),
				requires: JSON.stringify(tpl.requires),
				source: JSON.stringify(source)
			}
		},
		/**
		 * @method view2Page
		 * 預覽code轉頁面code
		 * @param {Object} obj 預覽代碼對象
		 * @param {Object} cache 緩存信息
		 * @param {Object} tpl 模板
		 */
		view2Page: function(obj, cache, tpl){
			var items = obj.items,
				tplViewId = obj.tplViewId,
				ttype = obj.ttype,
				cacheData = cache[tplViewId],
				opType = tpl.query ? 0 : 2,
				isDG = ttype === "DG",
				isDF = ttype === "DF",
				isQF = ttype === "QF",
				isNG = ttype === "NG",
				md, body;
			
			delete obj.tplViewId;
			delete obj.tpl;
			delete obj.listeners;
			delete obj.$instance;
			delete obj.panel;
			delete obj.renderTo;
			if (items) {
				for (var i = 0, len = items.length; i < len; i++) {
					this.view2Page(items[i], cache, tpl);
				}
			} else if (ttype) {
				delete obj.ttype;
				delete obj.content;
				delete obj.noHeader;
				delete obj.title;
				if (isDG || isDF) {
					obj.ttbar = true;
				}
				body = obj.body = {};
				if (cacheData) {
					if (cacheData.title) {
						obj.title = cacheData.title;
					} else {
						obj.noHeader = true;
					}
					
					if (cacheData.size) {
						obj.cellWidth = Number(cacheData.size);
					}
					
					if (isQF) {
						body.mname = this.modelName;
					} else if (isNG) {
						body.unit = {
							mname: this.modelName,
							uname: this.getTopUnit(),
							opType: opType
						};
					} else if (cacheData.table) {
						body.unit = {
							mname: this.modelName,
							uname: cacheData.table,
							opType: opType
						};
					}
					
					if (cacheData.meta) {
						md = this.getMetaCode(cacheData.meta, ttype, cacheData.editorCfgs);
						if (isDG || isNG) {
							body.columns = md;
						} else if (isDF || isQF) {
							body.items = md;
						} 
					}
				}
			}
		},
		/**
		 * @method getEditorCode
		 * 獲取editor頁面配置代碼
		 * @param {String} val editor類型
		 * @param {Object} cfg editor緩存配置
		 * @return {Object} editor頁面配置code
		 */
		getEditorCode: function(val, cfg){
			var baseKey = this.baseKey,
				supportEditors = this.supportEditors,
				editor = supportEditors[val],
				code = {}, key;
			
			if (val === "none") {
				return null;
			}
			code.xtype = baseKey[editor.xtype || String(val).toUpperCase()];
			
			for (key in cfg) {
				if (key === "sqlNo") {
					if (!code.unit) {
						code.unit = {};
					}
					code.unit[key] = cfg[key];
				} else {
					code[key] = cfg[key];
				}
			}
			
			return code;
		},
		/**
		 * @method getMetaCode
		 * 獲取某一區域meta部分頁面配置code
		 * @param {Object} metaData meta緩存配置
		 * @param {String} ttype 區域類型
		 * @param {Object} editorCfgs 所有editor緩存配置
		 * @return {Object} 區域meta部分頁面配置code
		 */
		getMetaCode: function(metaData, ttype, editorCfgs){
			//FIELD，FIELD_DESC, FIELD_EDITOR
			var i = 0,
				len = metaData.length,
				title = "title",
				editor = "editor",
				isG = ttype === "DG",
				isNG = ttype === "NG",
				data = [],
				m, d, ec;
			if (!isG && !isNG) {
				title = "label";
				editor = "fieldCfg";
			}
			
			for (; i < len; i++) {
				m = metaData[i];
				d = {};
				d[title] = m.FIELD_DESC;
				d["field"] = m.FIELD;
				ec = this.getEditorCode(m.FIELD_EDITOR, editorCfgs[m.FIELD] || {})
				if (!isNG && ec) {
					d[editor] = ec;
				}
				data.push(d);
			}
			
			return data;
		},
		/**
		 * @method openSource
		 * 開啓源文件
		 * @param {Object} source 源文件內的對象信息
		 */
		openSource: function(source){
			var tableCnt = source.tableCnt,
				tplIdx = source.tplIdx,
				nav = source.nav,
				query = source.query,
				cache = source.cache,
				mname = source.mname,
				requires = source.requires,
				supports = this.supports,
				tableSupports = supports[tableCnt-1],
				s = tableSupports[tplIdx],
				tpl = this.getBaseTpl(s.tpl);
			
			tpl = this.getNeedTpl(tpl, s.nav, nav, query);
			tpl.tableCnt = tableCnt;
			tpl.tplIdx = tplIdx;
			tpl.requires = requires;
			if (cache) {
				tpl.cache = cache;
			}
			
			this.setDataSource(mname);
			this.setTpl(tpl);
			
			this.onOpenSourced && this.onOpenSourced(tpl, source);
		},
		/**
		 * @method getSupports
		 * 獲取允許使用的模板列表
		 * @param {Number} tableCnt 維護表數量
		 * @param {Boolean} nav 是否需要導航區
		 * @param {Boolean} query 是否需要查詢區
		 * @return {Array} 模板列表
		 */
		getSupports: function(tableCnt, nav, query){
			var supports = this.supports,
				tableSupports = supports[tableCnt-1],
				res = [],
				i = 0, s, tpl;
			
			for (; i < tableSupports.length; i++) {
				s = tableSupports[i];
				tpl = this.getBaseTpl(s.tpl);
				tpl = this.getNeedTpl(tpl, s.nav, nav, query);
				
				if (tpl) {
					tpl.tableCnt = tableCnt;
					tpl.tplIdx = i;
					res.push(tpl);
				}
			}
			
			return res;
		}
	};
};

$$.define(className, ["core.Control"], TPL);

})(window.jQuery, window.com.pouchen);