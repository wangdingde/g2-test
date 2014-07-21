(function($, $$){
	
var control = function(){
	
	return {
		root: true,
		ctor: function(opts){
			this._beforeCreate(opts);
			this.apply(opts, this.defCfg || {}, this.excludeCfg || []);
			this._eventList = {};
			opts.listeners && this.bind(opts.listeners);
			this._afterCreate();
		},
		_beforeCreate: $$.emptyFn,
		_afterCreate: $$.emptyFn,
		apply: function(opts, def, excludeCfg) { //以鍵值對opts為准﹐以鍵值對def為默認補充﹐將內容加到this
			var key;
			if(!opts){opts = {};}
			if(!def){def = {};}
			var fullopts = $.extend(true, {}, def, opts);
			for (key in fullopts) {
				if (!excludeCfg || excludeCfg.indexOf(key) === -1) {
					this[key] = fullopts[key];
				}
			}
		},
		clone: function() { //TODO 還未實現
			
		},
		_parseKey: function(key) {
			var rtn = {"enm":"","area":""};
			if (key) {
				var i = key.lastIndexOf(".");
				rtn.enm = i == -1 ? key : key.substr(i+1),
				rtn.area = i == -1 ? " " : key.substr(0,i+1);
			}
			return rtn;
		},
		bind: function(key,handler,listener){
			var el = this._eventList || {};
			var map = {};
			if (typeof key == "string") {
				map[key] = handler;
			} else if (typeof key == "object"){
				map = key;
				listener = handler;
			} else {
				return this;
			}
			//bind("asc.ui.textbox.onClick",fn1);
			//bind("onClick",fn2);
			//bind("asc.onFocus",fn3);
			//eventList結構是﹕
			//{"onClick":{"area":["asc.ui.textbox."," "],"fn":[fn1,fn2]},
			// "onFocus":{"area":["asc."],"fn":[fn3]}
			//}
			for (key in map) {
				var k = this._parseKey(key);
				if (!k.enm) {continue;}
				var es = el[k.enm] = el[k.enm] || {"area": [], "fn": [], "rec":[]};
				i = es.fn.length;
				es.area[i] = k.area ? k.area : " ";
				es.fn[i] = map[key];
				es.rec[i] = listener; //消息的接收ui控件
			}
			this._eventList = el;
			return this;
		},
		unbind: function(key) {
			var	el = this._eventList;
			//unbind()或unbind("")或unbind(".")﹐清除全部事件的處理函數
			if (!key) { el = {}; return; }
			var k = this._parseKey(key);
			if (!k.enm && !k.area) {el = {}; return this;}
			//unbind("onClick")清除onClick下所有域的處理方法
			if (k.enm && !k.area) {delete el[k.enm]; return this;}
			//unbind("asc.onClick")清除onClick下以asc.開頭的所有域下的處理方法
			//unbind("asc.")清除各事件下以asc.開頭的所有域下的處理方法
			var sl = {};
			if (k.enm) {sl[k.enm] = el[k.enm];} else {sl = el;}
			for (key in sl) {
				for (var i=sl[key].area.length -1; i>=0; i--) {
					if (sl[key].area[i].indexOf(k.area) != 0) {continue;}
					sl[key].area.splice(i,1);
					sl[key].fn.splice(i,1);
					sl[key].rec.splice(i,1);
				}
			}
			return this;
		},
		trigger: function(key,sender) {
			var	el = this._eventList, rtn = true;
			if (!el || !key) {return rtn;}
			var k = this._parseKey(key), p = [];
			if (!k.enm || !el[k.enm]) {return rtn;}
			for (var i=2; i < arguments.length; i++) {
				p[i-2] = arguments[i];
			}
			p[p.length] = sender; //填入觸發者
			p[p.length] = null; //先給接收者變量占位
			for (var i=0; i < el[k.enm].area.length; i++) {
				if ((k.area == " " || el[k.enm].area[i].indexOf(k.area) == 0) && (el[k.enm].rec[i] == null || sender == null || el[k.enm].rec[i] != sender)) {
					p[p.length - 1] = el[k.enm].rec[i]; //后實際填入接收者
					if (el[k.enm].fn[i].apply(this,p) === false) {
						rtn = false;
						break;
					}
				}
			}
			return rtn;
		}
	};
	
};

$$.define("core.Control", [], control);

})(window.jQuery, window.com.pouchen);