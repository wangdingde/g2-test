(function($, $$){

var fd = function(GRIDDATA){
	return {
		extend: GRIDDATA,
		getRow: function(row){
			var ds = this.getDataSource();
			return ds.getRow(row);
		},
		getCurrentRow: function(){
			var ds = this.getDataSource();
			
			return ds.getRow(ds.curr);
		},
		_getRemoved: function(){
			var curr = this.getCurrentRow();
			return curr ? [curr] : [];
		},
		onRemove: function(callback){
			var removed = this._getRemoved(),
				i, len = removed.length;
			if (len === 0) {
				return;
			}
			var c = confirm("是否確定刪除數據？刪除后不可恢復！");
			if(c){
				var dataSource = this.getDataSource(),
					isInputing = this.isInputing();
				for (i = 0; i < len; i++) {
					dataSource.deleteRow(removed[i], this);
				}
				
				var res = this.update(true);
				if(res !== true){
					res === false && (res = "系統錯誤，請稍後再試！");
					if(typeof res != "object"){
						$.messager.alert("錯誤",res,'error');
					}
					return false;
				}
				
				if (isInputing) {
					dataSource.endInput(true);
				}
				(dataSource.mdl || dataSource).accept();
				this.changeCurrent(null, true);
				if (isInputing) {
					dataSource.beginInput();
				}
				callback && callback();
				
			}
			this.focus && this.focus();
		},
		_bindUnit: function(unit){
			var el = this;
			
			unit.bind({
				"onFiltered": function(filterExp){
					el.setCurrent(null, el);
				},
				"onSorted": function(sortExp){
					el.setCurrent(null, el);
				},
				"onLoadDataed": function(data){
					el.setCurrent(null, el);
				},
				/*
				"onAddRowed": function(row){
					el.setCurrent(row, el);
				},
				"onRemoveRowed": function(row){
					el.clearData(null, el);
				},
				*/
				"onSetCurrented": function(oldRow, newRow){
					el.setCurrent(newRow, el);
				},
				"onBeginInput": function(curr){
					el.beginEdit(this.getRow(curr), el);
				},
				"onEndInput": function(curr){
					el.endEdit(this.getRow(curr), el);
				},
				"onParentSetCurrented": function(oldRow,newRow){
					if((newRow || oldRow) && oldRow === newRow){
						return false;
					}
					el.setCurrent(row, el);
				},
				"onAccepted": function(){
					el.endEdit(null, el);
				},
				"onRejected": function(){
					el.setCurrent(null, el);
				},
				"onSetDataed": function(row, col, oldVal, newVal){
					el.input(row, col.cname, newVal, el);
				}
			}, el);
		},
		//每個el不管unit如何變化，只需要bind一次即可
		_bindEl: function(){
			var el = this;
			el.bind({
				"onSetCurrenting": function(row){
					var currUnit = el.bindingUnit || el.createUnit(),
						oldRow = currUnit.getRow(currUnit.curr);
					
					if (oldRow && this.isInputing()){
						var dcs = el.dataColumns,
							pri, ori, col, editor, i, len = dcs.length;
							
						for (i = 0; i < len; i++) {
							col = dcs[i];
							editor = col.editor;
							if (editor) {
								ori = oldRow.getData(col.field);
								pri = editor.getValue();
								if (pri != ori) {
									if ((pri === null || pri === undefined) && (ori === null || ori === undefined)) {
										continue;
									}
									currUnit._regInputUpd(oldRow, col.field, ori, pri, el);
									oldRow.setData(col.field, pri, el);
								}
							}
						}
					}
					
					currUnit && currUnit.setCurrent(row, el);
				},
				"onEndEditing": function(){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit.endInput(null, el);
				},
				"onBeginEditing": function(){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit.beginInput(el);
				},
				"onSetDataing": function(row, field, val){
					var currUnit = el.bindingUnit || el.createUnit();
					if (currUnit) {
						if (currUnit.input) {
							row = currUnit.getRow(currUnit.curr);
							row && currUnit.input(field, val, el);
						} else {
							currUnit.setData(row, field, val, el);
						}
					}
				}
			}, el);
		}
	};
	
};

$$.define("data.FormData1", ["data.GridData"], fd);

})(window.jQuery, window.com.pouchen);