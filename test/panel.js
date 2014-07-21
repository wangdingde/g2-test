$$.define(
	["panel.Panel", "form.Input", "tools.Icons", "core.Locale", "test.locale"], 
	function(PANEL, INPUTBOX, ICONS){
		
		return {
			xtype: PANEL,
			//tools: [{
			//	icon: ICONS.REMOVE,
			//	text: "123123"
			//}],
			title: "這是我的第一個面板",
			content: "測試",
			//draggable: true,
			//maximized: true,
			ttbar: [{
				text: "新增",
				handler: function(){
					console.log(this.text);
				}
			}, {
				text: "修改"
			}]
		};
	}
);