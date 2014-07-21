(function($, $$){
	
var domChanged = function(dom){
	var locale = $$.Class.get("core.Locale");
	locale.refresh(dom);
};
	
var _HTML = $.fn.html,
	_APPEND = $.fn.append;
$.fn.html = function() {
	var results = _HTML.apply(this, arguments);
	if (arguments[0] && arguments[1] !== true) {
		domChanged(results);
	}
	return results;
};
$.fn.append = function() {
	var results = _APPEND.apply(this, arguments);
	if (typeof arguments[0] === "string") {
		domChanged(results);
	}
	return results;
};
	
var LOCALE = function(){
	return {
		static: true,
		mapping: {},
		currLocale: "en",//"zh_TW",
		setLocale: function(locale){
			var curr = this.currLocale;
			
			if (curr !== locale) {
				this.currLocale = locale;
				this.refresh();
			}
		},
		set: function(locale){
			var mapping = this.mapping,
				lm = mapping[locale],
				obj = arguments[1],
				i, len;
			
			if (!lm) {
				mapping[locale] = lm = {};
			}
			
			if (typeof obj === "object") {
				for (i in obj) {
					lm[i] = obj[i];
				}
			} else {
				i = 1;
				len = arguments.length;
				while(i < len) {
					lm[arguments[i]] = arguments[i+1];
					i += 2;
				}
			}
		},
		get: function(key, locale){
			if (!locale) {
				locale = this.currLocale;
			}
			var mapping = this.mapping,
				lm = mapping[locale];
			
			return lm ? (lm[key] || key) : key;
		},
		refresh: function(container){
			if (!container) {
				container = $$.getBody();
			}
			
			var el = this,
				locale = this.currLocale,
				p = $(container).not(":has('*')").add($("*[lang!='"+locale+"']", container).not(":has('*')")),
				notNode = ["SCRIPT", "STYLE", "IFRAME"],
				olocale, nodeName;
			
			p.each(function(){
				var html = $(this).html();
				if (html) {
					html.trim();
				}
				nodeName = this.nodeName;
				
				if (notNode.indexOf(nodeName) === -1){
					olocale = $(this).attr("locale");
					if (html && html !== "|") {
						if (!olocale){
							$(this).attr("oriKey", html.trim());
							html = el.get(html.trim());
						} else if (olocale !== locale) {
							html = el.get($(this).attr("oriKey"));
						} else {
							return;
						}
						$(this).attr("locale", locale).html(html.trim(), true);
					}
				}
			});
		}
	};
};

$$.define("core.Locale", [], LOCALE);
	
})(window.jQuery, window.com.pouchen);