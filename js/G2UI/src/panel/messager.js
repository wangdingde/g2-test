(function ($, $$) {
var messager = function (WINDOW, ICONS) {
	return {
		extend: WINDOW,
		_buttons: {
			"Y": {
				text: "確定",
				icon: ICONS.OK,
				handler: function(){
					var owner = this.container.owner;
					if (owner) {
						owner.close();
						owner.callback && owner.callback.call(owner);
					}
				}
			},
			"N": {
				text: "否",
				icon: ICONS.CANCEL,
				handler: function(){
					var owner = this.container.owner;
					if (owner) {
						owner.close();
					}
				}
			},
			"C": {
				text: "取消",
				icon: ICONS.CANCEL,
				handler: function(){
					var owner = this.container.owner;
					if (owner) {
						owner.close();
					}
				}
			}
		},
		ctor: function(opts){
			var el = this,
				_buttons = this._buttons,
				buttons = this.buttons || [],
				cfg = [],
				body = this.getBody(),
				i = 0, len = buttons.length, btn, bd;
			
			if (len > 0) {
				for (; i < len; i++) {
					btn = buttons[i];
					if (typeof btn === "string") {
						btn = _buttons[btn];
					}
					if (btn) {
						cfg.push($.extend({}, btn));
					}
				}
				
				this.buttons = $$.create("tools.Toolbar", {
					owner: el,
					items: cfg,
					renderTo: body
				});
				
				bd = this.buttons.dom;
			}
			
			this.resize();
			
			if (bd) {
				$(bd).css({
					"position": "relative",
					"margin": "auto"
				});
			}
		},
		defCfg: {
			width: 300,
			height: "auto",
			title:'Info',
			content:'info message',
			bodyCls: "messager-body",
			collapsible:false,
			minimizable:false,
			closable: true,
			maximizable: false,
			draggable: false,
			resizable: false,
			modal: true
		}
	};
};

$$.apply($$, {
	"alert": function(title, msg, icon, fn){
		if (icon && typeof icon !== "string") {
			fn = icon;
			icon = undefined;
		}
		
		$$.create("panel.Messager", {
			title: title,
			content: msg,
			bodyIcon: icon,
			buttons: ["Y"],
			callback: fn
		});
	},
	"confirm": function(title, msg, fn){
		$$.create("panel.Messager", {
			title: title,
			content: msg,
			bodyIcon: "help",
			buttons: ["Y", "C"],
			focus: "C",
			callback: fn
		});
	}
});

$$.loadCss("panel/messager.css", true);

$$.define('panel.Messager', ["panel.Window", "tools.Icons"], messager);

})(window.jQuery, window.com.pouchen);