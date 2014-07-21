(function(WIN){
	"use strict";
	var $$ = {},
		doc = WIN.document;
	
	function Theme(curr,supports){
		this.curr = curr || "default";
		this.supports = supports || ["default"];
	};
	Theme.prototype.loadCss = function(cls, theme){
		if (!$$.mapping) {
			return;
		}
		
		var cssSrc, cssDom;
		
		var classMap = $$.mapping.get(cls);
		
		if (!classMap) {
			cssSrc = $$.class.getSrc(cls.replace(/[.]/ig,'/') + ".css", true);
		} else {
			cssSrc = $$.class.getSrc(classMap.css);
		}
		if(cssSrc){
			cssDom = $$.file.get(cssSrc);
		}
	};
	Theme.prototype.add = function(theme){
		
	};
	Theme.prototype.remove = function(theme){
		
	};
	Theme.prototype.setActive = function(theme){
		
	};
	
	function Lang(){
		
	};
	
	function File(){
		
	};
	File.prototype.get = function(src, onLoad){
		var type = this.type(src),
			obj = null;
		$$.debug.info("Load file from server, the src is: " + src + "!");
		
		if (type === "js") {
			obj=document.createElement("script");
	        obj.type = "text/javascript";
	        obj.src = src;
	        obj.onload = obj.onreadystatechange = onLoad;
		} else if (type === "css"){
			obj=document.createElement("link");
            obj.rel = "stylesheet";
            obj.type = "text/css";
            obj.media = "screen";
            obj.href = src;
		}
		
        document.getElementsByTagName("head")[0].appendChild(obj);
		
        return obj;
	};
	File.prototype.type = function(src){
		var idx = src.lastIndexOf("?");
		if(idx !== -1){
			src = src.substring(0, idx);
		}
		return src.substring(src.lastIndexOf(".") + 1).toLowerCase();
	};
	
	function Debug(lvl){
		this.setLvl(lvl);
	};
	Debug.prototype.setLvl = function(lvl){
		if (typeof lvl === "number"){
			this.lvl = lvl;
		} else {
			this.lvl = lvl ? (lvl === "dev" ? 0 : (lvl === "none" ? 4 : (lvl === "error" ? 3 : (lvl === "info" ? 1 : 2)))) : 2;
		}
	};
	Debug.prototype.info = function(info){
		if (this.lvl <= 1) {
			console.log(info);
		}
	};
	Debug.prototype.warn = function(warn){
		if (this.lvl <= 2) {
			console.warn(warn);
		}
	};
	Debug.prototype.error = function(error){
		if (this.lvl <= 3) {
			console.error(error);
		}
	};
	
	function Class(){
		this.loaded = [];
		this.loading = [];
		this.waiting = [];
		this.isLoading = false;
	};
	Class.prototype.load = function(cls){
		if (!$$.mapping) {
			this.waiting[this.waiting.length] = cls;
			return;
		}
		
		if (this.loaded.indexOf(cls) !== -1 || this.loading.indexOf(cls) !== -1) {
			return;
		}
		var list = $$.mapping.calculate(cls);
		
		this.addToQueue(list);
	};
	Class.prototype.loadWaiting = function(){
		var waiting = this.waiting,
			i, len = waiting.length;
		for (i = 0; i < len; i++) {
			this.load(waiting[i]);
		}
		this.waiting = [];
	};
	Class.prototype.get = function(cls){
		if (!$$.mapping || this.loaded.indexOf(cls) !== -1) {
			return;
		}
		
		var classMap = $$.mapping.get(cls);
		
		$$.debug.info("Class [" + cls + "] is loading!");
		
		var jsSrc, jsDom;
		
		if (!classMap) {
			jsSrc = this.getSrc(cls.replace(/[.]/ig,'/') + ".js", true);
		} else {
			$$.theme.loadCss(cls);
			jsSrc = this.getSrc(classMap.src);
		}
		
		if(!jsSrc){
			$$.class.next();
			return;
		}
		
		jsDom = $$.file.get(jsSrc, function(){
			$$.class.next();
		});
		if (!jsDom) {
			return;
		}
	};
	Class.prototype.getSrc = function(src, abs){
		if(!src){
			return null;
		}
		src = this.calculateSrc(src, abs);
		return src ? src + "?version=" + $$.version.no + "&time=" + $$.version.time : null;
	};
	Class.prototype.calculateSrc = function(src, abs){
		if (!src) {
			return;
		}
		var type = $$.file.type(src);
		var abs = abs === true ? "" : $$.absoluteUrl;
		
		if (type === "js") {
			return abs + ($$.version.needVer ? "V" + $$.version.needVer + "/" : "") + src;
		} else if (type === "css"){
			return abs + ($$.version.needVer ? "V" + $$.version.needVer + "/" : "") + "themes/default/" + src;
		}
	};
	Class.prototype.addToQueue = function(list){
		if (!list) {
			return;
		}
		
		if (typeof list === "string") {
			list = list.split(",");
		}
		
		var loading = this.loading = this.loading.concat(list);
		
		if (!this.isLoading && loading.length > 0) {
			this.begin();
		}
	};
	Class.prototype.begin = function(){
		if (!$$.mapping || this.isLoading) {
			return;
		}
		this.isLoading = true;
		var loading = this.loading,
			first = loading[0],
			loaded = this.loaded;
		while (first) {
			if (loaded.indexOf(first) === -1) {
				this.get(first);
				break;
			}
			loading.splice(0,1);
			first = loading[0];
		}
		if(!first){
			this.end();
		}
	};
	Class.prototype.next = function(){
		var loading = this.loading,
			first = loading[0],
			loaded = this.loaded;
		if (!first) {
			return;
		}
		if (!this.isLoading) {
			this.begin();
			return;
		}
		if (loaded.indexOf(first) === -1) {
			$$.debug.info("Class [" + first + "] has been loaded!");
			loaded[loaded.length] = first;
		}
		
		loading.splice(0,1);
		first = loading[0];
		
		if (!first) {
			this.end();
			return;
		}
		if (loaded.indexOf(first) !== -1) {
			this.next();
			return;
		}
		this.get(first);
	};
	Class.prototype.end = function(){
		if (!this.isLoading) {
			return;
		}
		this.isLoading = false;
		if (!$$.inited) {
			setTimeout(function(){
				$$.onloaded();
				$$.inited = true;
			},0);
		}
	};
	Class.prototype.create = function(){
		//form.InputBox
		//form.Combo
	};
	Class.prototype.define = function(){
		/**
		 * $$.define("form.Combo", {
		 * 		extend: "",
		 * 		requires: [],
		 * 		mixins: [],
		 * 		global: true,
		 * 		toTop: true,
		 * 		cons: function(opts){
		 * 			this.input = $$.create("InputBox");
		 * 		}
		 * }
		 */
	};
	Class.prototype.requires = function(){
		
	};
	Class.prototype.extend = function(){
		
	};
	Class.prototype.mixins = function(){
		
	};
	Class.prototype.ns = function(){
		
	};
	
	if (!WIN.com) {
		WIN.com = {};
	}
	
	$$ = {
		debug: new Debug("dev"),
		theme: new Theme(),
		class: new Class(),
		lang: new Lang(),
		file: new File(),
		absoluteUrl: "../js/G2UI/",
		mapping: null,
		ready: function(fn){
			$$._delaySeq[$$._delaySeq.length] = fn;
		},
		onloaded: function(){
			$$.debug.info("-->>The page is loaded!");
			var del = $$._delaySeq,
				i, len = del.length;
			for (i = 0; i < len; i++) {
				del[i].call(WIN);
			}
		},
		_delaySeq: [],
		inited: false,
		_startTime: (new Date()).getTime(),
		version: {
			needVer: null //"1.00.000"
		},
		create: function(){
			return this.class.create();
		},
		register: function(){
			return this.class.register();
		},
		use: function(){
			
		}
	};
	
	$$.debug.info("===========Base is ready now!=============");
		
	$$.file.get($$.class.calculateSrc("version.js?time=" + (new Date()).getTime()), function(){
		$$.debug.info("The current version is " + $$.version.no + "!");
		
		if ($$.debug.lvl === 0) {
			$$.debug.info("-->>Begin in debug model!");
			$$.version.time = $$._startTime;
		}
		
		$$.file.get($$.class.getSrc("mapping.js"), function(){
			$$.debug.info("The mapping is OK now!");
			if ($$.class.waiting.length > 0) {
				$$.class.loadWaiting();
			} else {
				$$.class.begin();
			}
		});
	});
	
	WIN.$$ = WIN.com.pouchou = $$;
})(window);