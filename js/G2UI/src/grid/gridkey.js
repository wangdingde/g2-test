(function($, $$) {
var key = function (CONTROL) {
	return{
		extend: CONTROL,
		_initKey: function(){
			this.bind({
				"onFocused": function(){
					var editing = this.isInputing();
					if (!editing) {
						this.setToFocus(this.toFocused);
					}
				}
			});
		},
		_newHandler: function(){
			this.onAdd && this.onAdd();
		},
		_enterHandler: function(){
			var source = this.getDataSource(),
				editing = this.isInputing();
			
			if (!editing) {
				source.beginInput();
			}
			this.focusNext();
		},
		_cancelHandler: function(){
			var source = this.getDataSource(),
				editing = this.isInputing();
			
			if (editing) {
				source.endInput();
				this.focus();
			}
		},
		_topHandler: function(){
			var editing = this.isInputing();
			if (!editing) {
				this.prevRow();
			}
		},
		_bottomHandler: function(){
			var editing = this.isInputing();
			if (!editing) {
				this.nextRow();
			}
		},
		_leftHandler: function(){
			var editing = this.isInputing();
			if (!editing) {
				this.toFocusNext(true);
			}
		},
		_rightHandler: function(){
			var editing = this.isInputing();
			if (!editing) {
				this.toFocusNext();
			}
		},
		_deleteHandler: function(){
			this.onRemove && this.onRemove();
		},
		_helpHandler: function(){
			this.showKeyHelp();
		},
		_saveHandler: function(){
			this.onSave && this.onSave();
		},
		showKeyHelp: function(){
			alert("This is keyHelp!!");
		},
		focus: function(col, index){
			if (!index) {
				index = $(this.getSelected().last()).attr("index");
			}
			if (!index && index !== 0) {
				return;
			}
			
			index = Number(index);
			col = this.getColumn(col) || this.toFocused || this.focused;
			if (!col) {
				return;
			}
			
			var row = this.getRow(index);
			
			if (this.isInputing() && col.editor && col.editor.focus) {
				col.editor.focus();
				this.focused = col;
				this.clearToFocus();
			} else {
				$("input", this.focusDom).focus();
				this.focused = null;
				this.setToFocus(col);
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
		setToFocus: function(col){
			col = this.getColumn(col);
			var dataCols = this.dataColumns,td;
			
			if (!col) {
				col = this.focused || dataCols[0];
			}
			
			this.toFocused = col;
			var selected = this.getSelected(),
				td;
			$(".grid-col-tofocus").removeClass("grid-col-tofocus");
			if (selected[0]) {
				td = this.getTd(Number(selected.attr("index")), col);
				td.addClass("grid-col-tofocus");
			}
		},
		toFocusNext: function(flag){
			var dataCols = this.dataColumns,
				len = dataCols.length,
				toFocused = this.toFocused,
				idx;
			
			if (!toFocused) {
				toFocused = dataCols[0];
			} else {
				idx = dataCols.indexOf(toFocused);
				if (flag) {
					idx = idx - 1 < 0 ? len - 1 : idx - 1;
				} else {
					idx = idx + 1 >= len ? 0 : idx + 1;
				}
				toFocused = dataCols[idx];
			}
			
			this.setToFocus(toFocused);
		},
		focusNext: function(flag){
			if (flag) {
				this.focused = null;
				this.clearToFocus();
			}
			var focused = this.focused,
				dataCols = this.dataColumns,
				col, i, len = dataCols.length,
				idx = -1,
				toFocused = this.toFocused;
			
			if (len === 0) {
				return;
			}
			if (toFocused) {
				idx = dataCols.indexOf(toFocused)-1;
				toFocused = null;
			} else if (focused) {
				idx = dataCols.indexOf(focused);
			}
			for (i = idx + 1; i < len; i++) {
				col = dataCols[i];
				if (col.editor) {
					toFocused = col;
					break;
				}
			}
			
			if (!toFocused && idx > 0) {
				for (i = 0; i < idx; i++) {
					col = dataCols[i];
					if (col.editor) {
						toFocused = col;
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

$$.define('grid.Key', ["core.Key"], key);
})(window.jQuery, window.com.pouchen); 