(function($, $$) {
var key = function (CONTROL, KEYCODE) {
	return{
		extend: CONTROL,
		_initKey: $$.emptyFn,
		initKeyManager: function(){
			var el = this;
			this._initKey();
			if (this.editable !== false) {
				$(this.dom).bind({
					"keydown": function(e){
						var code = e.which,
							alt = KEYCODE.isAlt(e),
							ctrl = KEYCODE.isCtrl(e),
							domEvent = true;
						//log(code);
						if (code === KEYCODE.N && ctrl) {
							el._newHandler();
							domEvent = false;
						} else if (code === KEYCODE.ENTER) {
							el._enterHandler();
						} else if (code === KEYCODE.ESC) {
							el._cancelHandler();
						} else if (code === KEYCODE.TOP) {
							el._topHandler();
						} else if (code === KEYCODE.BOTTOM) {
							el._bottomHandler();
						} else if (code === KEYCODE.LEFT) {
							el._leftHandler();
						} else if (code === KEYCODE.RIGHT) {
							el._rightHandler();
						} else if (code === KEYCODE.DELETE) {
							el._deleteHandler();
						} else if (code === KEYCODE.F1) {
							el._helpHandler();
						} else if (ctrl && code === KEYCODE.S) {
							el._saveHandler();
							domEvent = false;
						}
						
						return domEvent;
					}
				});
			}
		},
		_newHandler: $$.emptyFn,
		_enterHandler: $$.emptyFn,
		_cancelHandler: $$.emptyFn,
		_topHandler: $$.emptyFn,
		_bottomHandler: $$.emptyFn,
		_leftHandler: $$.emptyFn,
		_rightHandler: $$.emptyFn,
		_deleteHandler: $$.emptyFn,
		_helpHandler: $$.emptyFn,
		_saveHandler: $$.emptyFn
	};
};

$$.define('core.Key', ["core.Control", "core.KeyCode"], key);
})(window.jQuery, window.com.pouchen); 