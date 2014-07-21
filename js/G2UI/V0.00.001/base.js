(function(WIN){
	"use strict";
	var $$ = {
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
		global: WIN
	};
	
	$$.apply(Array.prototype, {
		indexOf: Array.prototype.indexOf || function(elemToSearch,fromIndex) {
			(!fromIndex || isNaN(fromIndex) || fromIndex < 0) && (fromIndex = 0);
			for(var i = Math.floor(fromIndex); i<this.length; i++) {
				if (this[i] === elemToSearch) return i;
			}
			return -1;
		}
	});
	
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
		count: 0,
		counters: {error: 0, warn: 0, info: 0},
		out: [],
		max: 750,
		lvl: 2, //dev
		info: function(msg){
			log({level: "info", msg: msg});
		},
		warn: function(msg){
			log({level: "warn", msg: msg});
		},
		error: function(msg){
			log({level: "error", msg: msg});
		},
		setLvl: function(lvl){
			if (typeof lvl === "number"){
				this.lvl = lvl;
			} else {
				this.lvl = lvl ? (lvl === "dev" ? 0 : (lvl === "none" ? 4 : (lvl === "error" ? 3 : (lvl === "info" ? 1 : 2)))) : 2;
			}
		},
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
	
	var Version = {
		now: (new Date()).getTime(),
		needVer: null
	};

	var Loader = new function(){
		var loader = this,
			Class = $$.Class,
			queue = [],
			classLoaded = [],
			readyList = [],
			bodyInitSized = false;
		
		$$.apply(loader, {
			mapping: {
				"Version": "version.js",
				"Loader.mapping": "mapping.js"
			},
			charset: "UTF-8",
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
			getRelPath: function(path, cls){
				var verStr;
				
				if (log.lvl === 0 || cls === "Version" || cls === "Loader.mapping") {
					verStr = "time=" + Version.now;
				}else {
					verStr = "version=" + Version.no + "&time=" + Version.time;
				}
				
				return path ? path + "?" + verStr : null;
			},
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
			queue: queue,
			classLoaded: classLoaded,
			readyList: readyList,
			isReady: false,
			isLoading: false,
			syncMode: false,
			addToQueue: function(list){
				if (!list) {
					return loader;
				}
				
				if (!(list instanceof Array)) {
					list = [list];
				}
				
				list.splice(0, 0, queue.length > 0 ? 1 : 0, 0);
				queue.splice.apply(queue, list);
				
				if (!loader.isLoading) {
					this.refreshQueue();
				}
				return loader;
			},
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
					loader.loadScript(path, onLoadFn, onErrorFn, scope, synchronous);
				} else {
					var requires = queue[0].requires;
					onErrorFn.call(scope, "類[" + requires[0] + "]找不到路徑， 請嘗試使用$$.Loader.setPath()設置文件路徑。");
					requires.splice(0,1);
					loader.refreshQueue();
				}
				return loader;
			},
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
	
	var Class = new function(){
		var Class = this,
			deferList = [],
			classCreated = {};
		
		$$.apply(Class, {
			classCreated: classCreated,
			deferList: deferList,
			inheritProt : function(parentFun,childFun) {
				function tmp(){};
				tmp.prototype = parentFun.prototype;
				childFun.prototype = new tmp();
				childFun.prototype.constructor = childFun;
				childFun.prototype.pp = parentFun.prototype;
			},
			//使用空殼函數完成
			inheritsPrototype: function(pCls,tCls){
				var classes = this.load([pCls,tCls]);
			
				pCls = classes[0];
				tCls = classes[1];
				
				function Tmp(){};
				Tmp.prototype = typeof pCls === "function" ? pCls.prototype : pCls;
				tCls.prototype = new Tmp();
			},
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
			reg: function(nm, opts){
				var pCls, con, tCls, mixins, i, len;
				opts = opts || {};
				pCls = opts.extend;
				mixins = opts.mixins;
				
				if (pCls) {
					pCls = Class.get(pCls);
					
					if (!pCls) {
						log.error("父類["+pCls+"]無法構造！");
						return;
					}
				}
				
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
				
				con = function(params){
					!params && (params = {}); 
					
					if (pCls) {
						pCls.call(this, params);
					}
					opts.ctor && (opts.ctor.call(this, params));
				};
				
				tCls = this.ns(nm, con, opts.root, opts.golbal);
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
					if (typeof mixins === "string") {
						mixins = mixins.split(",");
					}
					
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
			create: function(nm, opts){
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
						cmp = new cls(opts);
						if (cmp.id) {
							$$.cmp(cmp.id, cmp);
						}
					}
				} else {
					cmp = jQuery.extend(true, cls instanceof Array ? [] : {}, cls);
				}
				return cmp;
			},
			extend: function(nm, opts){
				if (opts) {
					opts.extend = nm;
				}
				this.define(nm, opts);
			},
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
				
				return obj[clsName] || $$.global[clsName] || $$[clsName];
			},
			get: function(nm){
				var cls;
				if (!nm) {return null;}
				if (typeof nm === "string") {
					cls = this.classCreated[nm] || Class.ns(nm) || WIN[nm];
					return cls;
				}
				return nm;
			},
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
	
	$$.apply($$, {
		getBody: (function(){
			var body;
			return function() {
				return body || (body = document.body);
			};
		})(),
		getHead: (function(){
			var head;
			return function() {
				return head || (head = document.getElementsByTagName("head")[0]);
			};
		})(),
		getDoc: (function() {
			var doc;
			return function() {
				return doc || (doc = document);
			};
		}()),
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
	
	var Data = {
		service: "",
		setService: function(service){
			
		},
		request: function(obj){
			var service = obj.url || Data.service;
			
			if (!service) {
				log.error("沒有相應的service，無法發送請求！請使用$$.setService設置全局service或者指定此次請求的url");
				return null;
			}
			
			//數據全部使用同步進行操作
			obj.async = false;
			
			return $$.Ajax.ajax(service, obj);
		}
	};
	
	$$.apply($$, {
		rootPath: "../js/G2UI/",
		theme: "default",
		emptyFn: function(){
			
		},
		log: log,
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
		},
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
		},
		isEmpty: function(obj){
			return this.isNull(obj) || this.isEmptyString(obj) || this.isEmptyArray(obj) || this.isEmptyObject(obj) ;
		},
		isEmptyString: function(str){
			return typeof str != "object" && str.toString().trim() === "";
		},
		isEmptyArray: function(arr){
			return arr instanceof Array && arr.length == 0;
		},
		isEmptyObject: function(obj){
			for(var key in obj){
				return false;
				break;
			}
			return true;
		},
		isNull: function(obj){
			return obj === null || obj === undefined;
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
		
		var Ajax = {
			ajax: function(url, setting){
				return $.ajax(url, setting);
			},
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