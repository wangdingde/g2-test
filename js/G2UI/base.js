(function(WIN){
	"use strict";
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class com.pouchen
	 * @alternateClassName $$
	 * @singleton
	 * 基础文件，作爲框架的基礎js文件，主要提供一些基础方法，主要包括：
	 * 
	 * Class對象管理器；
	 * 
	 * Loader加載器；
	 * 
	 * Log日誌管理；
	 * 
	 * Data管理;
	 * 
	 * 全局设置等。
	 */
	var $$ = {
		/**
		 * @method apply
		 * 對象屬性copy，類似與extend，淺備份。
		 * 
		 * @param {Object} obj 需要被備份的對象
		 * @param {Object} config 備份的對象
		 * @param {Object} defaults 默認值
		 */
		apply: function(obj, config, defaults){
			if (defaults) {
				this.apply(obj, defaults);
			}
			
			if (obj && config && typeof config === 'object') {
				var i;
	
				for (i in config) {
					obj[i] = config[i];
				}
			}
			
			return obj;
		},
		/**
		 * @property {Object} global
		 * Window對象
		 */
		global: WIN
	};
	
	$$.apply($$, {
		/**
		 * @method getBody
		 * 獲取Body dom對象
		 * 
		 * @return {Object} body dom
		 */
		getBody: (function(){
			var body;
			return function() {
				return body || (body = document.body);
			};
		})(),
		/**
		 * @method getHead
		 * 獲取Head dom對象
		 * 
		 * @return {Object} head dom
		 */
		getHead: (function(){
			var head;
			return function() {
				return head || (head = document.getElementsByTagName("head")[0]);
			};
		})(),
		/**
		 * @method getDoc
		 * 獲取Doc dom對象
		 * 
		 * @return {Object} doc object
		 */
		getDoc: (function() {
			var doc;
			return function() {
				return doc || (doc = document);
			};
		}()),
		/**
		 * @method clearSelection
		 * 清楚doc中的選中文本
		 */
		clearSelection: function(){
			if(WIN.getSelection){
				WIN.getSelection && WIN.getSelection().removeAllRanges(); 
			}else{
				try {
					document.execCommand ("unselect", false, true);
				}catch (e) {};
			}
		}
	});
	
	$$.apply($$, {
		/**
		 * @property {String} rootPath 對於頁面而言根目錄位置
		 */
		rootPath: "js/G2UI/",
		/**
		 * @property {String} theme 當前theme
		 */
		theme: "default",
		/**
		 * @property {Function} emptyFn 空函數
		 */
		emptyFn: function(){
			
		},
		/**
		 * @method setTheme
		 * 設置當前主題
		 * 
		 * @param {String} theme 所需要設置的主題
		 */
		setTheme: function(theme){
			if ($$.theme !== theme) {
				var head = $$.getHead(),
					links = $("link[theme=\"" + $$.theme + "\"]", head),
					relPath, link;
				$(links).each(function(index, el){
					relPath = $(el).attr("relPath");
					link = $("link[theme=\"" + theme + "\"][relPath=\"" + relPath + "\"]", head)[0];
					if (!link) {
						link = Loader.loadCss(relPath, false, theme);
					}
					link.disabled = false;
				});
				$(links).attr("disabled",true);
				$$.theme = theme;
			}
		}
	});
	
	$$.apply($$, {
		/**
		 * @method type
		 * 獲取對象類型
		 * 
		 * @param {Object} obj 所需處理的對象
		 * @return {String} 對象類型
		 */
		type: function(obj){
			
		},
		/**
		 * @method is
		 * 判斷對象是否爲指定類型
		 * 
		 * @param {Object} obj 所需判斷的對象
		 * @param {String} type 判斷類型
		 * @return {Boolean} 判斷結果
		 */
		is: function(obj, type){
			
		},
		/**
		 * @method isNumber
		 * 判斷對象是否爲Number
		 * 
		 * @param {Object} obj 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isNumber: function(num){
			return !isNaN(num);
		},
		/**
		 * @method isArray
		 * 判斷對象是否爲數組
		 * 
		 * @param {Object} obj 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isArray: function(obj){
			return obj instanceof Array;
		},
		/**
		 * @method isEmpty
		 * 判斷對象是否空
		 * 
		 * @param {Object} obj 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isEmpty: function(obj){
			return this.isNull(obj) || this.isEmptyString(obj) || this.isEmptyArray(obj) || this.isEmptyObject(obj) ;
		},
		/**
		 * @method isEmptyString
		 * 判斷對象是否空字符串
		 * 
		 * @param {Object} str 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isEmptyString: function(str){
			return typeof str != "object" && str.toString().trim() === "";
		},
		/**
		 * @method isNullOrEmptyString
		 * 判斷對象是否爲null或空字符串
		 * 
		 * @param {Object} str 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isNullOrEmptyString: function(str) {
			return this.isNull(str) || this.isEmptyString(str);
		},
		/**
		 * @method isEmptyArray
		 * 判斷對象是否爲空數組
		 * 
		 * @param {Object} arr 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isEmptyArray: function(arr){
			return arr instanceof Array && arr.length == 0;
		},
		/**
		 * @method isEmptyObject
		 * 判斷對象是否爲空Object
		 * 
		 * @param {Object} obj 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isEmptyObject: function(obj){
			for(var key in obj){
				return false;
				break;
			}
			return true;
		},
		/**
		 * @method isNull
		 * 判斷對象是否爲Null
		 * 
		 * @param {Object} obj 所需判斷的對象
		 * @return {Boolean} 判斷結果
		 */
		isNull: function(obj){
			return obj === null || obj === undefined;
		},
		findNearest: function(selector,clsName,flag,strict){
			var method = flag ? "parent" : "children",
				children = selector === window ? $(document.body) : $(selector)[method](),
				nearest = [];
			if (children[0]) {
				children.each(function(){
					if($$.domEl(this,clsName,null,strict)){
						nearest[nearest.length] = this;
					}
				});
				return nearest;
			} else {
				$(this)[method]().each(function(){
					var tmp = $$.findNearest(this,flag);
					for(var i in tmp){
						if($$.domEl(this,clsName,null,strict)){
							nearest[nearest.length] = tmp[i];
						}
					}
				});
				return nearest;
			}
		},
		domEl: function(selector,clsName,el,strict){
			var obj = $(selector)[0];
			if(!obj){return null;}
			if(!clsName){return obj.El;}
			!obj.El && (obj.El = {});
			el && (obj.El[clsName] = el);
			if(el || strict){return el ? el : obj.El[clsName]; }
			for(var key in obj.El){
				if(obj.El[key].isFamily(clsName)){return obj.El[key];}
			}
			return null;
		}
	});
	
	
	$$.apply(Array.prototype, {
		indexOf: Array.prototype.indexOf || function(elemToSearch,fromIndex) {
			(!fromIndex || isNaN(fromIndex) || fromIndex < 0) && (fromIndex = 0);
			for(var i = Math.floor(fromIndex); i<this.length; i++) {
				if (this[i] === elemToSearch) return i;
			}
			return -1;
		}
	});
	
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class com.pouchen.log
	 * @alternateClassName log
	 * @singleton
	 * 日誌管理輸出
	 * 
	 * 可設置log等級
	 */
	function log(message){
		var options, stack,
			con = $$.global.console,
			level = 'info',
			out, max;
		if (message === null || message === undefined) {
			message = "";
		}
		if (typeof message != 'string' && message.msg) {
			options = message;
			message = options.msg || '';
			level = options.level || level;
			stack = options.stack;
		}

		var lvl = log.lvl,
			currLvl = level === "warn" ? 2 : (level === "error" ? 3 : 1);
			
		if (lvl > currLvl) {
			return;
		}

		if (typeof message == 'string') {
			message = '[' + level.toUpperCase() + '] ' + message;
		}

		if (con) {
			if (con[level]) {
				con[level](message);
			} else {
				con.log(message);
			}

			if (stack && con.trace) {
				if (!con.firebug || level != 'error') {
					con.trace();
				}
			}
		} else {
			//TODO
			if ($$.isOpera) {
				opera.postError(message);
			}
		}

		if (lvl === 0) {
			out = log.out;
			max = log.max;
	
			if (out.length >= max) {
				out.splice(0, out.length - 3 * Math.floor(max / 4));
			}

			out.push(message);
		}

		++log.count;
		++log.counters[level];
	}
	
	$$.apply(log, {
		/**
		 * @property {Number} count
		 * 當前log數量
		 */
		count: 0,
		/**
		 * @property {Object} counters
		 * 每種類型log數量
		 */
		counters: {error: 0, warn: 0, info: 0},
		/**
		 * @property {Array} out
		 * log輸出
		 */
		out: [],
		/**
		 * @property {Number} [max=750]
		 * log最大輸出上限
		 */
		max: 750,
		/**
		 * @property {Number} [lvl=2]
		 * log等級
		 * 
		 * 0:dev, 1:info, 2:warn, 3:error, 4:none
		 */
		lvl: 2, //dev
		/**
		 * @method info
		 * 輸出info信息
		 * 
		 * @param {String} msg 需要輸出的信息
		 */
		info: function(msg){
			log({level: "info", msg: msg});
		},
		/**
		 * @method warn
		 * 輸出warn信息
		 * 
		 * @param {String} msg 需要輸出的信息
		 */
		warn: function(msg){
			log({level: "warn", msg: msg});
		},
		/**
		 * @method error
		 * 輸出error信息
		 * 
		 * @param {String} msg 需要輸出的信息
		 */
		error: function(msg){
			log({level: "error", msg: msg});
		},
		/**
		 * @method setLvl
		 * 設置當前log等級
		 * 
		 * @param {Number} lvl 需要設置的等級
		 */
		setLvl: function(lvl){
			if (typeof lvl === "number"){
				this.lvl = lvl;
			} else {
				this.lvl = lvl ? (lvl === "dev" ? 0 : (lvl === "none" ? 4 : (lvl === "error" ? 3 : (lvl === "info" ? 1 : 2)))) : 2;
			}
		},
		/**
		 * @method show
		 * 顯示所有log信息
		 */
		show: function(){
			window.open('','extlog').document.write([
			'<html><head><script type="text/javascript">',
				'var lastCount = 0;',
				'function show () {',
				'var $$ = window.opener.$$,',
					'log = $$ && $$.log;',
					'if (log && log.out && lastCount != log.count) {',
						'lastCount = log.count;',
						'var s = "<tt>" + log.out.join("~~~").replace(/[&]/g, "&amp;").replace(/[<]/g, "&lt;").replace(/[ ]/g, "&#160;").replace(/\\~\\~\\~/g, "<br/>") + "</tt>";',
						'document.body.innerHTML = s;',
					'}',
					'setTimeout(show, 1000);',
				'}',
				'setTimeout(show, 1000);',
			'</script></head><body></body></html>'].join(''));
		}
	});
	
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class com.pouchen.Version
	 * @singleton
	 * 版本控制
	 */
	var Version = {
		/**
		 * @property {Long} [now=new Date()]
		 * 當前時間
		 */
		now: (new Date()).getTime(),
		/**
		 * @property {String} needVer
		 * 所需版本
		 */
		needVer: null
		/**
		 * @property {String} no
		 * 當前版本號
		 */
		/**
		 * @property {String} time
		 * 當前版本時間
		 */
	};
	
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class com.pouchen.Loader
	 * @singleton
	 * Class加載器
	 * 
	 * 負責Class加載，有同步加載與異步加載兩種模式
	 * 
	 * 使用時請儘量使用異步模式
	 */
	var Loader = new function(){
		var loader = this,
			Class = $$.Class,
			queue = [],
			classLoaded = [],
			readyList = [],
			bodyInitSized = false;
		
		$$.apply(loader, {
			/**
			 * @property {Object} mapping
			 * Class對應源文件對照表
			 */
			mapping: {
				"Version": "version.js",
				"Loader.mapping": "mapping.js"
			},
			/**
			 * @property {String} [charset=UTF-8]
			 * Class加載時使用的字符集
			 */
			charset: "UTF-8",
			/**
			 * @method setPath
			 * 設置對照關係
			 * 
			 * @param {String} cls Class名稱
			 * @param {String} path Class源文件位置
			 */
			setPath: function(cls, path){
				var obj;
				if (!cls) {
					cls = {};
				}
				
				if (typeof cls === "string"){
					obj[cls] = path;
				} else {
					obj = cls;
				}
				
				$$.apply(loader.mapping, obj);
			},
			/**
			 * @method getRelPath
			 * 獲取真正的path，防止緩存的存在
			 * 對於開發模式下，將會追加time爲當前時間保證每次都取最新文件
			 * 對於非開發模式下，會追加上版本號與版本時間，保證取最新的版本文件
			 * 
			 * 注意，部分Class始終使用最新版本，如Version與Mapping
			 * 
			 * @param {String} path 原始path
			 * @param {String} cls Class名稱
			 * @return {String} 處理後的path
			 */
			getRelPath: function(path, cls){
				var verStr;
				
				if (log.lvl === 0 || cls === "Version" || cls === "Loader.mapping") {
					verStr = "time=" + Version.now;
				}else {
					verStr = "version=" + Version.no + "&time=" + Version.time;
				}
				
				return path ? path + "?" + verStr : null;
			},
			/**
			 * @method getPath
			 * 獲取Class對於的path
			 * 當對照關係存在時，直接從對照中抓取對於的path，
			 * 否則直接取相對目錄下的js文件
			 * 
			 * @param {String} cls Class名稱
			 * @return {String} Class對應的源文件path
			 */
			getPath: function(cls){
				var src = loader.mapping[cls];
					
				if (src) {
					src = $$.rootPath + (Version.needVer ? Version.needVer + "/" : "") + src;
				} else {
					src = cls.replace(/[.]/ig,"/") + ".js";
				}
				
				return loader.getRelPath(src, cls);
			}
		});
		
		$$.apply(loader, {
			/**
			 * @property {Array} queue
			 * 異步加載隊列
			 * 異步加載時將按此隊列從前往後的順序逐個加載
			 */
			queue: queue,
			/**
			 * @property {Array} classLoaded
			 * 以完成加載的Class列表
			 */
			classLoaded: classLoaded,
			/**
			 * @property {Array} readyList
			 * ready列表，加載完畢後即將執行函數列表
			 */
			readyList: readyList,
			/**
			 * @property {Boolean} isReady
			 * 加載完畢標記
			 */
			isReady: false,
			/**
			 * @property {Boolean} isLoading
			 * 加載標記，標記正在加載Class
			 */
			isLoading: false,
			/**
			 * @property {Boolean} syncMode
			 * 同步加載標記
			 */
			syncMode: false,
			/**
			 * @method addToQueue
			 * 追加異步加載隊列
			 * 當isLoading=false時將立即開始加載動作
			 * 
			 * @param {Array} list 即將被追加的列表
			 * @return {Object} Loader本身
			 */
			addToQueue: function(list){
				if (!list) {
					return loader;
				}
				
				if (!(list instanceof Array)) {
					list = [list];
				}
				/*
				for(var i = 0; i < list.length; i++) {
					log(">>>>"+list[i].requires.join("==="));
				}
				*/
				list.splice(0, 0, queue.length > 0 ? 1 : 0, 0);
				queue.splice.apply(queue, list);
				
				if (!loader.isLoading) {
					this.refreshQueue();
				}
				return loader;
			},
			/**
			 * @method refreshQueue
			 * 刷新加載隊列
			 * 判斷是否進入下一加載隊列
			 * 全部加載完成時結束加載，並觸發onReady
			 * 
			 * @return {Object} Loader本身
			 */
			refreshQueue: function(){
				var len = queue.length,
					item, i, j, requires;
				
				if (len === 0) {
					return loader.triggerReady();
				}
				
				for (i = 0; i < len; i++) {
					item = queue[i];
					if (item) {
						if (!item.used) {
							item.used = [];
						}
						requires = item.requires;
						
						for (j = 0; j < requires.length;) {
							if (classLoaded.indexOf(requires[j]) !== -1) {
								item.used.push(requires[j]);
								requires.splice(j, 1);
							} else {
								loader.load(requires[j], null, null, loader, false);
								return loader;
							}
						}
						if (item.requires.length === 0) {
							queue.splice(i, 1);
							if (item.callback) {
								var used = $$.Class.transNameClass(item.used);
								if (item.used.length > 0 && !used) {
									$$.Class.deferList.push({
										fn: item.callback,
										used: item.used,
										scope: item.scope
									});
								} else {
									item.callback.apply(item.scope, used);
								}
							}
							delete item.used;
							loader.refreshQueue();
							break;
						}
					}
				}
				
				return loader;
			},
			/**
			 * @method syncRequire
			 * 使用同步的方式加載Cls
			 * 加載完成後執行回調
			 * 內部直接呼叫require
			 * 
			 * @param {Array} cls 所需要加載的Class列表
			 * @param {Function} fn 所有Class加載完成後執行的回調函數
			 * @param {Object} scope 回調函數執行時的caller
			 */
			syncRequire: function(cls, fn, scope, excludes){
				var syncMode = loader.syncMode;

				if (!syncMode) {
					loader.syncMode = true;
				}
	
				loader.require.apply(loader, arguments);
	
				if (!syncMode) {
					loader.syncMode = false;
				}
	
				loader.refreshQueue();
			},
			/**
			 * @method require
			 * 使用加載Cls
			 * 加載完成後執行回調
			 * 加載模式使用目前Loader所處模式，不特殊指定
			 * 
			 * @param {Array} cls 所需要加載的Class列表
			 * @param {Function} fn 所有Class加載完成後執行的回調函數
			 * @param {Object} scope 回調函數執行時的caller
			 * @return {Object} 加載器本身
			 */
			require: function(cls, fn, scope, excludes){
				var syncMode = loader.syncMode,
					loaded = [],
					i, len, onLoad, onError;
					
				if (!cls) {return;}
				if(typeof cls === "string") {
					cls = cls.split(",");
				}
				
				if (!syncMode) {
					loader.addToQueue({
						requires: cls,
						callback: fn,
						scope: scope
					});
					return loader;
				}
				
				len = cls.length;
				onLoad = function(cls){
					return function(){
						if (classLoaded.indexOf(cls) === -1) {
							classLoaded.push(cls);
						}
					};
				};
				onError = function(cls){
					return function(){
						log.error("加载类[" + cls + "]失败！");
					};
				};
				for (i = 0; i < len; i++) {
					if (classLoaded.indexOf(cls[i]) === -1) {
						loader.load(cls[i], onLoad(cls[i]), onError(cls[i]), null, true);
					}
				}
				
				if (fn) {
					cls = $$.Class.transNameClass(cls);
					
					fn.apply(scope, cls);
				}
				
				return loader;
			},
			/**
			 * @method load
			 * 加載Class資源文件
			 * 
			 * @param {String} cls 所需要加載的Class
			 * @param {Function} onLoad Class加載成功後回調
			 * @param {Function} onError Class加載失敗後回調
			 * @param {Object} scope 回調函數執行時的caller
			 * @param {Boolean} synchronous 是否使用同步方式
			 * @return {Object} 加載器本身
			 */
			load: function(cls, onLoad, onError, scope, synchronous){
				loader.loadingCls = cls;
				var path = loader.getPath(cls),
					onLoadFn = function(){
						onLoad && onLoad.call(scope);
						!synchronous && loader.onFileLoaded();
					},
					onErrorFn = function(errMsg){
						onError && onError.call(scope, errMsg);
						!synchronous && loader.onFileLoadError();
					};
				
				if (path) {
					log(">>begin load class [" + cls + "] in " + (synchronous ? "sync" : "asyn") + " model.");
					loader.loadScript(path, onLoadFn, onErrorFn, scope, synchronous);
				} else {
					var requires = queue[0].requires;
					onErrorFn.call(scope, "類[" + requires[0] + "]找不到路徑， 請嘗試使用$$.Loader.setPath()設置文件路徑。");
					requires.splice(0,1);
					loader.refreshQueue();
				}
				return loader;
			},
			/**
			 * @method loadCss
			 * 加載css文件
			 * 
			 * @param {String} url css路徑
			 * @param {Boolean} sys 是否爲底層所屬css
			 * @param {String} theme 所需主題
			 * @return {Object} link dom
			 */
			loadCss: function(url, sys, theme){
				var link = document.createElement("link");
				link.rel = "stylesheet";
				link.type = "text/css";
				link.media = "screen";
				if (sys) {
					url = $$.rootPath + "themes/" + "${theme}/" + url;
				}
				
				$(link).attr("relPath", url);
				$(link).attr("theme", theme || $$.theme);
				
				link.href = loader.getRelPath(url.replace(/\$\{theme\}/ig, theme || $$.theme));
				$$.getHead().appendChild(link);
				
				return link;
			},
			/**
			 * @method loadScript
			 * 加載script文件
			 * 
			 * @param {String} url script路徑
			 * @param {Function} onLoad Class加載成功後回調
			 * @param {Function} onError Class加載失敗後回調
			 * @param {Object} scope 回調函數執行時的caller
			 * @param {Boolean} synchronous 是否使用同步方式
			 */
			loadScript: function(url, onLoad, onError, scope, synchronous){
				var isCrossRestricted = false,
					xhr, status, onScriptError;
	
				scope = scope || loader;
	
				loader.isLoading = true;
				
				if (!synchronous) {
					onScriptError = function() {
						onError.call(scope, "文件加載失敗 '" + url + "', 請確認文件是否存在。", synchronous);
					};
	
					loader.loadScriptByTag(url, onLoad, onScriptError, scope);
				} else {
					if (typeof XMLHttpRequest != 'undefined') {
						xhr = new XMLHttpRequest();
					} else {
						xhr = new ActiveXObject('Microsoft.XMLHTTP');
					}
	
					try {
						xhr.open('GET', url, false);
						xhr.send(null);
					} catch (e) {
						isCrossRestricted = true;
					}
					
					status = (xhr.status === 1223) ? 204 :
					(xhr.status === 0 && (self.location || {}).protocol == 'file:') ? 200 : xhr.status;
	
					isCrossRestricted = isCrossRestricted || (status === 0);
	
					if (isCrossRestricted) {
						onError.call(Loader, "同步加載文件失敗: '" + url + "'; 同步加載不允許跨域訪問，請使用$$.Loader.require()嘗試異步加載。", synchronous);
					} else if ((status >= 200 && status < 300) || (status === 304)) {
						($$.global.execScript || (new Function (xhr.responseText)))(xhr.responseText);

						onLoad && onLoad.call(scope);
					} else {
						onError && onError.call(scope, "同步加載文件失敗: '" + url + "'; 請確認文件存在。XHR 狀態代碼: " + status, synchronous);
					}
	
					xhr = null;
				}
			},
			/**
			 * @method loadScriptByTag
			 * 使用標籤的方式加載script文件，用於異步加載模式
			 * 
			 * @param {String} url script路徑
			 * @param {Function} onLoad Class加載成功後回調
			 * @param {Function} onError Class加載失敗後回調
			 * @param {Object} scope 回調函數執行時的caller
			 * @param {String} charset 加載時使用的字符集
			 * @return {Object} script dom
			 */
			loadScriptByTag: function(url, onLoad, onError, scope, charset){
				var script = document.createElement("script"),
					charset,
					onLoadFn = function() {
						onLoad && onLoad.call(scope);
						loader.cleanScriptTag(script, false, false);
					},
					onErrorFn = function(arg) {
						onError && onError.call(scope);
						loader.cleanScriptTag(script, true, true);
					};

				script.type = 'text/javascript';
				script.onerror = onErrorFn;
				charset = charset || log.charset;
				if (charset) {
					script.charset = charset;
				}
	
				if ('addEventListener' in script ) {
					script.onload = onLoadFn;
				} else if ('readyState' in script) {
					script.onreadystatechange = function() {
						if ( this.readyState == 'loaded' || this.readyState == 'complete' ) {
							onLoadFn();
						}
					};
				} else {
					script.onload = onLoadFn;
				}
				
				script.src = url;
				$$.getHead().appendChild(script);
	
				return script;
			},
			/**
			 * @method cleanScriptTag
			 * 清除標籤加載script時的script標籤
			 * 
			 * @param {Object} script script標籤
			 * @param {Boolean} remove 是否從dom中刪除script標籤
			 * @param {Boolean} collect 是否進行內存回收
			 * @return {Object} Loader本身
			 */
			cleanScriptTag: function(script, remove, collect){
				var prop;
				script.onload = script.onreadystatechange = script.onerror = null;
				if (remove) {
					script.parentNode.removeChild(script);
					if (collect) {
						for (prop in script) {
							try {
								script[prop] = null;
								delete script[prop];
							} catch (cleanEx) {

							}
						}
					}
				}
	
				return loader;
			},
			/**
			 * @method ready
			 * 登記ready，當onReady時將被執行
			 * 
			 * @param {Function} fn 所需要登記的回調
			 * @param {Object} scope 回調執行時的caller
			 * @param {Boolean} withDomReady 是否需要等待dom ready
			 */
			//TODO withDomReady
			ready: function(fn, scope, withDomReady){
				if (!Loader.isLoading) {
					fn.call(scope);
				} else {
					readyList.push({
						fn: fn,
						scope: scope
					});
				}
			},
			/**
			 * @method triggerReady
			 * 觸發ready，執行ready列表中所有待處理回調
			 */
			triggerReady: function(){
				var li;
				loader.isLoading = false;
				loader.loadingCls = null;
				if (!bodyInitSized) {
					$('body').width($(window).width()-($$.isIE7?2:0)).height($(window).height()-($$.isIE7?2:0));
					bodyInitSized = true;
				}
				$$.Class.excuteDefer();
				while (readyList.length && !loader.isLoading) {
					li = readyList.shift();
					li.fn.call(li.scope);
				}
			},
			/**
			 * @method onFileLoaded
			 * 異步方式文件加載成功後的處理函數
			 */
			onFileLoaded: function(){
				var len = queue.length,
					item = queue[0],
					requires = item ? item.requires : [],
					cls = requires[0],
					i, j;
				
				if (!loader.isLoading || !cls) {
					loader.refreshQueue();
					return;
				}
				
				if (classLoaded.indexOf(cls) === -1) {
					classLoaded[classLoaded.length] = cls;
				}
				
				item.used.push(requires[0]);
				requires.splice(0,1);
				
				loader.refreshQueue();
			},
			onFileLoadError: function(){
				
			}
		});
	};
	
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class com.pouchen.Class
	 * @singleton
	 * Class類管理器
	 * 
	 * Class定義
	 * 
	 * Class實例化
	 * 
	 * Class繼承、mixins、extend
	 */
	var Class = new function(){
		var Class = this,
			deferList = [],
			classCreated = {};
		
		$$.apply(Class, {
			/**
			 * @property {Array} classCreated
			 * 已被定義的Class列表
			 */
			classCreated: classCreated,
			/**
			 * @property {Array} deferList
			 * 延遲處理隊列
			 * 當Class需要依賴的Class未被定義時會暫時進入延遲等待列表
			 */
			deferList: deferList,
			/**
			 * @method inheritProt
			 * 繼承處理
			 * 
			 * @param {Function} parentFun 父構造器本身
			 * @param {Function} childFun 子構造器本身
			 */
			inheritProt : function(parentFun,childFun) {
				function tmp(){};
				tmp.prototype = parentFun.prototype;
				childFun.prototype = new tmp();
				childFun.prototype.constructor = childFun;
				childFun.prototype.pp = parentFun.prototype;
			},
			/**
			 * @method inheritsPrototype
			 * Class繼承處理
			 * 
			 * @param {String} pCls 父Class
			 * @param {String} tCls 子Class
			 */
			//使用空殼函數完成
			inheritsPrototype: function(pCls,tCls){
				var classes = this.load([pCls,tCls]);
			
				pCls = classes[0];
				tCls = classes[1];
				
				function Tmp(){};
				Tmp.prototype = typeof pCls === "function" ? pCls.prototype : pCls;
				tCls.prototype = new Tmp();
			},
			/**
			 * @method extMethod
			 * Class擴展
			 * 
			 * @param {String} tClsName 需要擴展的Class
			 * @param {Object} opts 待擴展屬性或方法
			 */
			//擴展某一對象的方法
			extMethod: function(tClsName,opts){
				var cls = Class.get(tClsName);
				
				if (!cls) {
					cls = this.load(tClsName)[0];
				}
				
				if (cls) {
					$$.apply(cls.prototype, opts);
				}
			},
			/**
			 * @method reg
			 * 登記註冊Class
			 * 
			 * @param {String} nm Class名稱
			 * @param {Object} opts Class相關配置，屬性、方法、構造器等
			 */
			reg: function(nm, opts){
				var pCls, con, tCls, mixins, i, len;
				opts = opts || {};
				pCls = opts.extend;
				mixins = opts.mixins;
				//log("11111111>>>>>"+nm);
				if (pCls) {
					pCls = Class.get(pCls);
					
					if (!pCls) {
						log.error("父類["+pCls+"]無法構造！");
						return;
					}
				}
				log(">>begin create class [" + nm + "].");
				if (opts.$instance === true) {
					tCls = this.ns(nm, opts);
				} else if (opts.static !== true && !opts.ctor && !(pCls && pCls.$isClass)) {
					tCls = this.ns(nm, opts, opts.root, opts.golbal);
					
					if(pCls){
						$$.apply(pCls, tCls);
					}
				} else if (opts.static === true || (pCls && pCls.$static)) {
					delete opts.static;
					
					tCls = this.ns(nm, opts, opts.root, opts.golbal);
					
					if (pCls) {
						$$.apply(tCls, pCls);
					}
					tCls.$isClass = true;
					tCls.$static = true;
				}
				
				if (tCls) {
					return tCls;
				}
				if (pCls) {
					opts.$parent = pCls.prototype;
				}
				if (mixins) {
					if (typeof mixins === "string") {
						mixins = mixins.split(",");
					}
				}
				
				con = function(params){
					!params && (params = {}); 
					
					if (pCls) {
						pCls.call(this, params);
					}
					opts.ctor && (opts.ctor.call(this, params));
				};
				
				tCls = this.ns(nm, con, opts.root, opts.golbal);
				//log(tCls);
				opts.$self = tCls;

				if(pCls){
					//super 呼叫父類方法
					//this.super();
					//this.parent.methodA.call(this);
					$$.apply(tCls, pCls);
					this.inheritsPrototype(pCls, tCls);
				}
				
				tCls.$isClass = true;
				tCls.$className = nm;
				
				if (opts.statics) {
					for (i in opts.statics) {
						tCls[i] = opts.statics[i];
					}
					delete opts.statics;
				}
				
				if (mixins) {
					var key, mix, mp;
					
					len = mixins.length;
					for (i = 0; i < len; i++) {
						mix = Class.get(mixins[i]);
						if (!mix) {
							log.warn("類["+mixins[i]+"]不存在，無法mixin！");
						}
						
						mp = !mix.$isClass || mix.$static ? mix : mix.prototype;
						Class.extMethod(tCls, mp);
					}
				}
				for (i in opts) {
					if(i == "ctor"){
						tCls.prototype.constructor = con;
					}else{
						tCls.prototype[i] = opts[i];
					}
				}
				
				return tCls;
			},
			/**
			 * @method define
			 * 定義Class
			 * 
			 * @param {String} nm Class名稱
			 * @param {Array} reqs 完成該Class所需要使用的其他Class列表
			 * @param {Object} opts Class相關配置
			 */
			define: function(nm, reqs, opts){
				var tmp;
				if (!nm) {
					return;
				}
				
				if (typeof nm !== "string") {
					opts = reqs;
					reqs = nm;
					
					nm = Class.get(Loader.loadingCls) ? "Temp" : Loader.loadingCls;
				}
				
				if (!opts) {
					opts = reqs;
					reqs = [];
					
					tmp = opts.extend;
					if (tmp) {
						reqs = reqs.concat([tmp]);
					}
					
					tmp = opts.requires;
					if (tmp) {
						if (typeof tmp === "string") {
							tmp = tmp.split(",");
						}
						reqs = reqs.concat(tmp);
					}
					
					tmp = opts.mixins;
					if (tmp) {
						if (typeof tmp === "string") {
							tmp = tmp.split(",");
						}
						reqs = reqs.concat(tmp);
					}
				}
				if (typeof reqs === "string") {
					reqs = reqs.split(",");
				}
				//log(nm);
				Loader.require(reqs, function(){
					if (typeof opts === "function") {
						opts = opts.apply(this, arguments);
					}
					Class.reg(nm, opts);
				});
				
				var classLoaded = Loader.classLoaded;
				if (classLoaded.indexOf(nm) === -1) {
					classLoaded.push(nm);
				}
			},
			/**
			 * @method create
			 * 實例化Class
			 * 當Class未被定義時，先執行加載動作，然後再進行實例化
			 * 注意：
			 * 對於static Class直接放回Class
			 * 對於非Class類型將copy返回
			 * 
			 * @param {String} nm Class名稱
			 * @param {Object} opts Class實例化配置
			 * @param {Object} defs Class實例化默認配置
			 * @return {Object} 實例化的Class對象
			 */
			create: function(nm, opts, defs){
				var cls = Class.get(nm), cmp;
				
				if (!cls) {
					cls = Class.load(nm)[0];
				}
				
				if (!cls) {
					log.error("對象[" + nm + "]不存在，實例化對象失敗！");
					return;
				}
				
				if (cls.$instance === true){
					return cls;
				} else if (cls.$isClass === true) {
					if (cls.$static) {
						cmp = cls;
					} else {
						opts.$instance = true;
						//log.info(">>begin create el [" + cls.$className + "].")
						cmp = new cls($.extend(true, opts, defs));
						if (cmp.id) {
							$$.cmp(cmp.id, cmp);
						}
					}
				} else {
					cmp = jQuery.extend(true, cls instanceof Array ? [] : {}, cls);
				}
				return cmp;
			},
			/**
			 * @method extend
			 * 繼承派生出一子類
			 * 
			 * @param {String} nm 需要繼承的Class名稱
			 * @param {Object} opts 派生子Class配置
			 */
			extend: function(nm, opts){
				if (opts) {
					opts.extend = nm;
				}
				this.define(nm, opts);
			},
			/**
			 * @method excuteDefer
			 * 執行回調
			 */
			excuteDefer: function(){
				var def, clss;
				while (deferList.length && !Loader.isLoading) {
					def = deferList.pop();
					if (def.fn) {
						clss = this.transNameClass(def.used);
						if (!clss) {
							//alert(def.used.join(","));
							deferList.splice(0, 0, def);
							continue;
						}
						def.fn.apply(def.scope, clss);
					}
				}
				//if ($$.Loader)
			},
			/**
			 * @method ns
			 * 登記或者獲取命名空間下的Class
			 * 
			 * @param {String} nm Class名稱
			 * @param {Object} cls Class自身
			 * @param {Boolean} toRoot 是否登記到$$下
			 * @param {Boolean} toGolbal 是否登記到golbal下
			 * @return {Object} 命名空間下的Class
			 */
			ns: function(nm, cls, toRoot, toGolbal){
				if (!nm) {
					return null;
				}
				var classLoaded = Loader.classLoaded,
					arr = nm.split("."),
					obj = $$, o = {},
					len = arr.length - 1, i, 
					clsName;
				for(i = 0 ; i < len; i++){
					obj = obj[arr[i]] = obj[arr[i]] || {};
				}
				
				clsName = arr[len];
				if(cls){
					obj[clsName] = cls;
					o[clsName] = cls;
					if(toRoot){
						$$.apply($$, o);
					}
					if(toGolbal){
						$$.apply($$.global, o);
					}
					if (toRoot || toGolbal) {
						if (classLoaded.indexOf(clsName) === -1) {
							classLoaded.push(clsName);
						}
						classCreated[clsName] = cls;
					}
					classCreated[nm] = cls;
					return cls;
				}
				return obj[clsName] || $$.global[nm] || $$[clsName];
			},
			/**
			 * @method get
			 * 獲取指定名稱的Class對象
			 * 
			 * @param {String} nm Class名稱
			 * @return {Object} 所需的Class
			 */
			get: function(nm){
				var cls;
				if (!nm) {return null;}
				
				if (typeof nm === "string") {
					cls = this.classCreated[nm] || Class.ns(nm) || WIN[nm];//|| ;
					return cls;
				}
				return nm;
			},
			/**
			 * @method load
			 * 加載Class文件，使用同步方式
			 * 
			 * @param {Array} nms 所需加載的Class列表
			 * @param {Function} fn 加載完成後的回調
			 * @param {Object} scope 回調執行時的caller
			 * @return {Array} 所需要的Class對象數組
			 */
			load: function(nms, fn, scope){
				var classLoaded = Loader.classLoaded,
					nmsStr, classes;
				if (!nms) {return null;}
				if (typeof nms === "string") {
					nms = nms.split(",");
				}
				
				classes = this.transNameClass(nms);
				
				if (!classes) {
					nmsStr = nms.join(",");
					log.warn("正在同步加載類[" + nmsStr + "],建議在類開頭使用$$.require(\"" + nmsStr + "\")方式異步加載");
					
					Loader.syncRequire(nms, fn, scope);
					
					classes = this.transNameClass(nms);
					
				} else {
					fn && fn.apply(scope, classes);
				}
				return classes;
			},
			/**
			 * @method transNameClass
			 * Class名稱對象直接轉換
			 * 
			 * @param {Array} list 所有待轉換的Class列表
			 * @return {Array} 轉換後的Class對象數組
			 */
			transNameClass: function(list){
				var classes = [],
					i, len, cls;
				if (!list) {return null;}
				if (typeof list === "string") {
					list = list.split(",");
				}
				
				var len = list.length;
				
				for (var i = 0; i < len; i++) {
					cls = this.get(list[i]);
					if (!cls) {
						return null;
					}
					//if (!cls.prototype) {
					//	cls = this.create(cls);
					//}
					classes.push(cls);
				}
				return classes;
			}
		});
	};
	
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class com.pouchen.Data
	 * @singleton
	 * Data管理器
	 * 
	 * 負責Data加載處理
	 */
	var modelMap = {};
	var Data = {
		/**
		 * @property {String} service
		 * 默認加載數據service
		 */
		service: "getData.jsp",
		/**
		 * @property {String} getService
		 * 默認讀取數據時service
		 */
		getService: "getData.jsp",
		/**
		 * @property {String} postService
		 * 默認保存數據時service
		 */
		postService: "saveData.jsp",
		/**
		 * @property {String} queryService
		 * 默認調用查詢數據時service
		 */
		queryService: "getQuery.jsp",
		/**
		 * @property {String} accNo
		 * 默認數據庫廠別連接代號
		 */
		accNo: "SYS",
		/**
		 * @method setService
		 * 設置默認service
		 * 
		 * @param {String} service 設置的service
		 */
		setService: function(service){
			Data.service = service;
		},
		/**
		 * @method setGetService
		 * 設置讀取數據時service
		 * 
		 * @param {String} service 設置的service
		 */
		setGetService: function(service){
			Data.getService = service;
		},
		/**
		 * @method setPostService
		 * 設置保存數據時service
		 * 
		 * @param {String} service 設置的service
		 */
		setPostService: function(service){
			Data.postService = service;
		},
		/**
		 * @method request
		 * 向service請求讀取數據
		 * 
		 * @param {Object} params 請求參數
		 * @param {Function} success 請求成功後的回調
		 * @param {Function} error 請求失敗後的回調
		 * @return {Object} Ajax返回結果
		 */
		request: function(params, success, error){
			var service = params.url || (params.sqlNo ? Data.queryService : Data.getService) || Data.service;
			var obj = {
				async: false,
				success: success,
				error: error,
				data: params
			};
			if (!service) {
				log.error("沒有相應的service，無法發送請求！請使用$$.setService設置全局service或者指定此次請求的url");
				return obj;
			}
			
			//數據全部使用同步進行操作
			return $$.Ajax.ajax(service, obj);
		},
		/**
		 * @method update
		 * 向service請求保存數據
		 * 
		 * @param {Object} data 需要保存的JSON數據
		 * @param {String} url 保存service，沒有時使用默認service
		 * @param {String} dataFrom 數據保存所使用的廠別連接代號
		 * @return {Object} Ajax返回結果
		 */
		update: function(data, url, dataFrom){
			var service = url || Data.postService || Data.service;
			
			if (!service) {
				var msg = "沒有相應的service，無法發送請求！請使用$$.setService設置全局service或者指定此次請求的url";
				log.error(msg);
				return msg;
			}
			
			var obj = {
				data: {data: JSON.stringify(data), accNo: dataFrom !== undefined ? dataFrom : Data.accNo}
			};
			//數據全部使用同步進行操作
			obj.async = false;
			
			return $$.Ajax.ajax(service, obj);
		},
		/**
		 * @method loadRemoteData
		 * 加載遠端數據
		 * 
		 * @param {Object} obj 相關參數
		 * @return {Object} 數據對象，Unit或Model
		 */
		loadRemoteData: function(obj){
			var mname = obj.mname,
				sqlNo = obj.sqlNo,
				url = obj.url,
				data = obj, model, unit;
			 
			
			if (!mname && !sqlNo && !url) {
				return data;
			}
			
			if (mname) {
				model = Data.getModel(mname);
			} 
			
			if (!obj.opType) {
				obj.opType = sqlNo ? 2 : 0;
			}
			if (!obj.accNo && model) {
				obj.accNo = model.dataFrom;
			}
			if (obj.parmMap) {
				obj.parmMap = JSON.stringify(obj.parmMap);
			}
			var data =  Data.request(obj).responseText;
			//Ready
			try {
				data = (new Function("return "+ data))();
				//console.log(data);
			} catch (e) {
				alert(data);
			}
			
			if (mname) {
				if (!model) {
					model = $$.create("data.DataModel",{modName: mname});
					model.dataFrom = obj.accNo;
					Data.setModel(mname, model);
				}
				model.loadJson(data, obj.clearData);
				data = model;
			} else if (sqlNo) {
				unit = $$.create("data.ResultUnit",{});
				unit.loadJson(data);
				
				data = unit;
			}
			
			return data;
		},
		/**
		 * @method getRemoteData
		 * 獲取遠端數據
		 * 
		 * 當數據對象已存在時直接返回使用
		 * 
		 * 否則則從遠端進行加載
		 * 
		 * @param {Object} obj 相關參數
		 * @return {Object} 數據對象，Unit或Model
		 */
		getRemoteData: function(obj){
			var mname = obj.mname,
				uname = obj.uname,
				sqlNo = obj.sqlNo,
				url = obj.url,
				data = obj, model, unit;
			 
			
			if (!mname && !sqlNo && !url) {
				return data;
			}
			
			if (mname) {
				unit = uname ? Data.getUnit(mname, uname) : Data.getModel(mname);
				
				if (unit) {
					return unit;
				}
			}
			
			var data = Data.loadRemoteData(obj);
			
			if (mname && uname) {
				data = Data.getUnit(mname, uname);
			}
			
			return data;
		},
		/**
		 * @method setModel
		 * 登記模型
		 * 
		 * @param {String} mname 模型名稱
		 * @param {Object} model 模型對象
		 * @return {Object} 模型對象
		 */
		setModel: function(mname, model){
			if (!model) {
				return null;
			}
			modelMap[mname] = model;
			
			return model;
		},
		/**
		 * @method getModel
		 * 獲取模型對象
		 * 
		 * @param {String} mname 模型名稱
		 * @return {Object} 模型對象
		 */
		getModel: function(mname){
			return modelMap[mname];
		},
		/**
		 * @method getUnit
		 * 獲取Unit模型對象
		 * 
		 * @param {String} mname 模型名稱
		 * @param {String} uname Unit名稱
		 * @return {Object} Unit對象
		 */
		getUnit: function(mname, uname){
			var model = Data.getModel(mname);
			
			return model ? (uname ? model.getUnit(uname) : model.topUnit()) : null;
		}
	};
	
	$$.apply($$, {
		log: log,
		loadCss: Loader.loadCss,
		Loader: Loader,
		Version: Version,
		Class: Class,
		Data: Data,
		require: Loader.require,
		ready: Loader.ready,
		define: Class.define,
		create: Class.create
	});
	
	var Components = {};
	$$.apply($$, {
		cmp: function(id, component){
			var c = Components[id];
			if (component) {
				if (c) {
					log.warn("組件ID[" + id + "]可能被重複定義。");
				} else {
					log("已登記組件，組件ID爲[" + id + "]。");
				}
				c = Components[id] = component;
			}
			return c;
		}
	});
	
	//apply something to window
	$$.apply($$.global, {
		log: log,
		require: Loader.require,
		define: Class.define,
		create: Class.create
	});
	
	$$.require(["Version", "Loader.mapping", "jQuery", "JSON"], function(){
		var $ = WIN.jQuery;
		
		$.ajaxSetup({
			timeout: 30
		});
		
		$(WIN).ajaxError(function(event, XMLHttpRequest, ajaxOptions, thrownError){
			
		});
		/**
		 * @author dd.wang <dd.wang@yydg.com.cn>
		 * @class com.pouchen.Ajax
		 * @singleton
		 * Ajax工具類
		 */
		var Ajax = {
			/**
			 * @method ajax
			 * 使用ajax加載資源
			 * 
			 * @param {String} url 加載路徑
			 * @param {Object} setting 加載配置
			 * @return {Object} ajax返回結果
			 */
			ajax: function(url, setting){
				return $.ajax(url, setting);
			},
			/**
			 * @method get
			 * 使用get方式加載資源
			 * 
			 * @param {String} url 加載路徑
			 * @param {Object} data data參數
			 * @param {Function} success 加載成功後的回調
			 * @param {String} dataType 加載的數據類型
			 * @return {Object} ajax返回結果
			 */
			get: function(url, data, success, dataType){
				if (!url) {
					return;
				}
				
				return Ajax.ajax({
					url: url, 
					type: "GET",
					dataType: dataType,
					data: data,
					success: success
				});
			},
			/**
			 * @method post
			 * 使用post方式加載資源
			 * 
			 * @param {String} url 加載路徑
			 * @param {Object} data data參數
			 * @param {Function} success 加載成功後的回調
			 * @param {String} dataType 加載的數據類型
			 * @return {Object} ajax返回結果
			 */
			post: function(url, data, success, dataType){
				if (!url) {
					return;
				}
				
				return Ajax.ajax({
					url: url, 
					type: "POST",
					dataType: dataType,
					data: data,
					success: success
				});
			},
			/**
			 * @method getJSON
			 * 使用get方式加載JSON資源
			 * 
			 * @param {String} url 加載路徑
			 * @param {Object} data data參數
			 * @param {Function} success 加載成功後的回調
			 * @return {Object} ajax返回結果
			 */
			getJSON: function(url, data, success){
				if (!url) {
					return;
				}
				
				return Ajax.ajax({
					url: url, 
					type: "GET",
					dataType: "json",
					data: data,
					success: success
				});
			},
			/**
			 * @method getScript
			 * 加載script資源
			 * 
			 * @param {String} url 加載路徑
			 * @param {Function} success 加載成功後的回調
			 * @return {Object} ajax返回結果
			 */
			getScript: function(url, success){
				if (!url) {
					return;
				}
				
				return Ajax.ajax({
					url: url,
					dataType: "script",
					success: success
				});
			},
			load: function(url, data, complete){
				return $.load(url, data, complete);
			}
		};
		
		$$.apply($$, {
			Ajax: Ajax
		});
		
	});
	
	if (!WIN.com) {
		WIN.com = {};
	}
	WIN.$$ = WIN.com.pouchen = $$;
})(window);