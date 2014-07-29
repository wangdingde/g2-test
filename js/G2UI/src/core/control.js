(function($, $$){
	/**
	 * @author dd.wang <dd.wang@yydg.com.cn>
	 * @class core.Control
	 * @alternateClassName com.pouchen.core.Control
	 * Control类为底层所有类的基类，所有类均直接或间接继承Control，Control本身继承自Object。
	 * 
	 * 主要为JS库下所有的class提供一些基本方法：{@link #apply}, {@link #bind}, {@link #unbind}等。
	 * 
	 */
var control = function(){
	
	return {
		root: true,
		/**
		 * @constructor
		 * 创建一个Control类实例。
		 * @param {Object} opts 实例相关配置项
		 */
		ctor: function(opts){
			this._beforeCreate(opts);
			this.apply(opts, $.extend({}, this._defCfg || {}, this.defCfg || {}), this.excludeCfg || []);
			/**
			 * @property {Object} [_eventList={}] 事件处理函数列表。
			 * @private
			 */
			this._eventList = {};
			/**
			 * @property {Object} [_eventSuspend=false] 事件挂起标志。
			 * @private
			 */
			this._eventSuspend = false;
			opts.listeners && this.bind(opts.listeners);
			this._afterCreate();
		},
		_beforeCreate: $$.emptyFn,
		_afterCreate: $$.emptyFn,
		/**
		 * @method apply
		 * 参数自动初始化，自动将opts中的参数与默认参数象结合并追加至类实例上。
		 * @param {Object} opts 用户传入的参数值。
		 * @param {Object} def 默认参数值。
		 */
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
		/**
		 * @method clone
		 * 复制一份新的实例，方法暂未启用。
		 */
		clone: function() { //TODO 還未實現
			
		},
		destroy: function() {
			this.onDestroy();
		},
		onDestroy: $$.emptyFn,
		/**
		 * @method _parseKey
		 * 解析传入的key字符串，解析出其中的事件名与事件作用域。
		 * @param {String} key 完整的事件字符串。
		 * @return {Object} {"enm":"","area":""},enm：事件名，area：事件域。
		 * @private
		 */
		_parseKey: function(key) {
			var rtn = {"enm":"","area":""};
			if (key) {
				var i = key.lastIndexOf(".");
				rtn.enm = i == -1 ? key : key.substr(i+1),
				rtn.area = i == -1 ? " " : key.substr(0,i+1);
			}
			return rtn;
		},
		/**
		 * @method bind
		 * 给实例绑定事件响应处理函数，具有如下特性：
		 * 
		 * 支持多事件绑定；
		 * 
		 * 支持事件域；
		 * 
		 * 支持制定监听者，防止死循环。
		 * 
		 * 使用方式如下：
		 * 
		 * 		var el = $$.create("Control",{});
		 * 		var dom = document.createElement("div");
		 * 		简单用法：
		 * 		el.bind("onSetDataed",function(oldVal, newVal){
		 * 			alert(newVal);
		 * 		});
		 * 		一次绑定多个事件：
		 * 		el.bind({
		 * 			"myArea.onSetDataed": function(){},
		 * 			"onClick": function(){}
		 * 		});
		 * 		
		 * 		进阶用法：
		 * 		el.bind("onSetDataed",function(oldVal, newVal){},dom);
		 * 		注意：此用法下当呼叫el.trigger("onSetDataed", dom, oldVal, newVal)时以上处理函数不被触发;
		 * 		
		 * @param {String/Object} key 完整事件名,一次绑定多个处理函数时此参数为Object，其中key为事件名，value为处理函数。
		 * @param {Function/Object} handler 事件处理函数，一次绑定多个事件时此参数为Object的监听者。
		 * @param {Object} listrner 事件监听者，可空，此参数与{@link #trigger}中的sender配合使用，当二者相同时，事件处理函数将不会被处理.
		 * @return {Object} 实例本身
		 */
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
		/**
		 * @method unbind
		 * 解绑事件，使用方式如下：
		 * 
		 * 		var el = $$.create("Control",{});
		 * 		按事件名解绑：el.unbind("onSetData");
		 * 		按域解绑：el.unbind("myArea.");
		 * 		按域与事件名解绑：el.unbind("myArea.onSetData");
		 * 
		 * @param {String} key 完整事件名，允许只传域。
		 * @return {Object} 实例本身。
		 */
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
		/**
		 * @method trigger
		 * 触发事件，呼叫方式：el.trigger(eName,sender[,arg1,arg2....]);
		 * @param {String} key 完整事件名。
		 * @param {Object} sender 呼叫者，可空，结合{@link #bind}中的listenser使用。
		 * @param {Object} args 事件消息参数，可多个。
		 * @return {Boolean} 事件触发结果。
		 */
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
					//log(this);
					//log(k.enm);
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