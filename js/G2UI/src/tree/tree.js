(function($, $$){
	$$.Class.define(["plugin.zTree"], function(){
		var parseFn = function(fn, scope){
			return function(){
				return fn.apply(scope, arguments);
			};
		};
		
		var obj = {
			root: true,
			ctor: function(opts){
				this.dom = $(opts.dom)[0];
				if (!opts.callback) {
					opts.callback = {};
				}
				$$.apply(opts.callback, opts.listeners || {});
				this.model = opts.model;
				
				delete opts.listeners;
				delete opts.dom;
				delete opts.model;
				
				$(this.dom).addClass("ztree");
				
				this.treeObj = $.fn.zTree.init($(this.dom), opts, this.model);
				
				if (!this.classInited) {
					var pro = this.self.prototype,
						i, o;
					
					for (i in this.treeObj) {
						o = this.treeObj[i];
						
						if(typeof o === "function") {
							pro[i] = parseFn(o, this.treeObj);
						} else {
							pro[i] = o;
						}
					}
					
					pro.classInited = true;
				}
			}
		};
		
		return obj;
	});
})(window.jQuery,window.com.pouchou);
