(function($, $$) {
var key = function (CONTROL, KEYCODE) {
	return{
		extend: CONTROL,
		_topHandler: function(){
			var editing = this.isInputing();
			if (!editing && this.layout.$self === this._defCfg.layout) {
				this.toFocusNext(true, this.layout.columns, true);
			}
		},
		_bottomHandler: function(){
			var editing = this.isInputing();
			if (!editing && this.layout.$self === this._defCfg.layout) {
				this.toFocusNext(false, this.layout.columns, true);
			}
		},
		focus: function(item){
			item = this.getItem(item) || this.toFocused || this.focused;
			if (!item) {
				return;
			}
			
			if (this.isInputing() && item.focus) {
				item.focus();
				this.focused = item;
				this.clearToFocus();
			} else {
				$("input", this.focusDom).focus();
				this.focused = null;
				this.setToFocus(item);
			}
			
			if ($$.FocusEl !== this) {
				$("input", this.focusDom).focus();
				$$.FocusEl = this;
			}
		},
		unFocus: function(){
			$("input", this.focusDom).focus();
			this.focused = null;
			this.clearToFocus();
		},
		clearToFocus: function(){
			this.toFocused = null;
			$(".grid-col-tofocus").removeClass("grid-col-tofocus");
		},
		setToFocus: function(item){
			item = this.getItem(item);
			var items = this.items;
			
			$(".grid-col-tofocus").removeClass("grid-col-tofocus");
			if (!item) {
				item = this.focused || items[0];
			}
			
			if (!item) {
				return;
			}
			
			this.toFocused = item;
			$(item.dom).addClass("grid-col-tofocus");
		},
		toFocusNext: function(flag, size, notOver){
			var items = this.items,
				len = items.length,
				toFocused = this.toFocused,
				idx;
			
			if (!size) {
				size = 1;
			}
			
			if (!toFocused) {
				toFocused = items[0];
			} else {
				idx = items.indexOf(toFocused);
				if (flag) {
					idx = idx - size < 0 ? (notOver ? idx : len - 1) : idx - size;
				} else {
					idx = idx + size >= len ? (notOver ? idx : 0) : idx + size;
				}
				toFocused = items[idx];
			}
			
			this.setToFocus(toFocused);
		},
		focusNext: function(flag){
			if (flag) {
				this.focused = null;
				this.clearToFocus();
			}
			var focused = this.focused,
				items = this.items,
				item, i, len = items.length,
				idx = -1,
				toFocused = this.toFocused;
			
			if (len === 0) {
				return;
			}
			if (toFocused) {
				idx = items.indexOf(toFocused)-1;
				toFocused = null;
			} else if (focused) {
				idx = items.indexOf(focused);
			}
			for (i = idx + 1; i < len; i++) {
				item = items[i];
				if (item.focus) {
					toFocused = item;
					break;
				}
			}
			
			if (!toFocused && idx > 0) {
				for (i = 0; i < idx; i++) {
					item = items[i];
					if (item.focus) {
						toFocused = item;
						break;
					}
				}
			}
			
			if (toFocused) {
				this.toFocused = toFocused;
				this.focus();
			}
		}
	};
};

$$.define('form.Key', ["grid.Key"], key);
})(window.jQuery, window.com.pouchen); 