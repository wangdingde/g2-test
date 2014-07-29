(function($, $$){
	
var gd = function(BASEDATA, RESULTUNIT){
	return {
		extend: BASEDATA,
		accept: function(){
			var ds = this.getDataSource(),
				mdl = ds ? (ds.mdl || ds) : null;
				
			if (!mdl) {
				return true;
			}
			mdl.accept();
		},
		reject: function(){
			var ds = this.getDataSource(),
				mdl = ds ? (ds.mdl || ds) : null;
				
			if (!mdl) {
				return true;
			}
			mdl.reject();
		},
		update: function(onlyDel){
			//return true 成功
			//return false 不做任何操作
			//return string 後臺錯誤信息
			var ds = this.getDataSource(),
				needUpdate = false,
				mdl = ds ? (ds.mdl || ds) : null,
				updData, us, u, i, ii, rows, j, jj, z, zz,
				uname, msg = "", row, t, resp;
			
			if (!mdl) {
				return true;
			}
			onlyDel = onlyDel === true ? true : false;
			
			if(!onlyDel && ds._err > 0){
				us = mdl.units || [mdl];
				for (i = 0, ii = us.length; i < ii; i++) {
					u = us[i];
					if (!u._err) {
						continue;
					}
					
					rows = u.rows;
					uname = u.getCaption();
					for (j = 0, jj = rows.length; j < jj; j++) {
						row = rows[j];
						t = "表[" + uname + "],行[" + row.idx + "],";
						
						for (z = 0, zz = (row._err || []).length; z < zz; z++) {
							msg += t + "列[" + u.getCol(row._err[z]).getCaption() + "]存在錯誤,錯誤信息爲:" + row._errmsg[z] + ".\\n";
						}
					}
				}
				/*
				$.messager.show({
					title:'提示',
					msg: msg,
					timeout:2000,
					showType:'slide'
				});
				*/
				//alert(msg);
				return msg;
			}
			
			updData = mdl.updateJson(onlyDel);
			us = updData.u || [updData];
			if(onlyDel || mdl._upd <= 0){
				for(var i = 0, ii = us.length; i < ii; i++){
					u = us[i];
					if (onlyDel ? u.d : (u.i || u.d || u.u)) {
						needUpdate = true;
						break;
					}
				}
				
				if (!needUpdate) {
					return true;
				}
			}
			
			try{
				resp = $$.Data.update(updData, undefined, mdl.dataFrom).responseText;
				resp = (new Function("return "+resp+";"))();
			}catch(e){
				return resp || e.message;
			}
			
			return true;
		},
		isInputing: function(){
			var currUnit = this.bindingUnit || this.createUnit();
			return currUnit.isInputing;
		},
		onAdd: function(){
			var dataSource = this.getDataSource();
			
			if (dataSource.isInputing) {
				dataSource.endInput();
			}
			dataSource.newRow();
			dataSource.beginInput();
			this.focusNext && this.focusNext(true);
		},
		onEdit: function(){
			var dataSource = this.getDataSource();
				
			dataSource.beginInput();
			this.focus && this.focus();
		},
		_getRemoved: function(){
			var currs = this.currs,
				removed = [], i, len = currs.length;
				
			for (i = 0; i < len; i++) {
				 removed.push(currs[i]);
			}
			return removed;
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
					index = this.getRowIndex(this.currs[0]),
					isInputing = this.isInputing();
				this.lastCurr = index;
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
		onSave: function(callback){
			var dataSource = this.getDataSource(),
				isInputing = this.isInputing();
			if (isInputing) {
				dataSource.endInput();
			}
			
			var res = this.update();
				
			if(res !== true){
				res === false && (res = "系統錯誤，請稍後再試！");
				if(typeof res != "object"){
					//$.messager.alert("錯誤",res,'error');
					alert(res);
				}
				
				if (isInputing) {
					dataSource.beginInput();
				}
				return false;
			}
			
			(dataSource.mdl || dataSource).accept();
			
			callback && callback();
			this.focus && this.focus();
		},
		onCancel: function(){
			var dataSource = this.getDataSource(),
				isInputing = this.isInputing();
			
			if (isInputing) {
				dataSource.endInput();
			}
			(dataSource.mdl || dataSource).reject();
			this.changeCurrent(null, true);
			
			this.focus && this.focus();
		},
		changeCurrent: function(index, flag){
			var el = this;
			var rows = this.getRows(), st, len = rows.length,
				lastCurr = this.lastCurr;
			
			if (!index && index !== 0) {
				index = lastCurr || lastCurr === 0 ? lastCurr : (this.currs[0] || rows[0]);
			}
			if (!index && index !== 0) {
				return;
			}
			
			row = this.getRow(index);
			
			if (!row) {
				row = el.getRow(len === 0 ? -1 : Math.min(index + 1, len - 1));
			}
			
			var dataSource = this.getDataSource(),
				isInputing = this.isInputing();
			
			if (!flag && isInputing) {
				dataSource.endInput();
			}
			dataSource.setCurrent(row);
			if (!flag && isInputing) {
				dataSource.beginInput();
			}
		},
		nextRow: function(){
			var rows = this.getRows(),
				curr = this.currs[0] || rows[0],
				index = this.getRowIndex(curr);
			
			this.changeCurrent(Math.min(rows.length - 1, index + 1));
		},
		prevRow: function(){
			var rows = this.getRows(),
				curr = this.currs[0] || rows[0],
				index = this.getRowIndex(curr);
			
			this.changeCurrent(Math.max(0, index - 1));
		},
		//綁定unit
		_getColumnInfo: function(row, field){
			row = this.getRow(row);
		},
		_bindUnit: function(unit){
			var el = this;
			
			unit.bind({
				"onFiltered": function(filterExp){
					el.filter(filterExp, el);
				},
				"onSorted": function(sortExp){
					el.sort(sortExp, el);
				},
				"onloadJsoned": function(data){
					el.loadData(null, el);
				},
				"onAddRowed": function(row){
					var data = row.unit.getRowData(row);
					data.uid = el.getRowUid(row);
					el.appendRow(data, el);
				},
				"onRemoveRowed": function(row){
					row = this.getRow(row);
					el.removeRow(el.getRowIndex(row), el);
				},
				"onSetCurrented": function(oldRow, newRow){
					el.select(el.getRowIndex(newRow), el);
				},
				"onBeginInput": function(curr){
					el.beginEdit(el.getRowIndex(this.getRow(curr)), el);
				},
				"onEndInput": function(curr){
					el.endEdit(el.getRowIndex(this.getRow(curr)), el);
				},
				"onParentSetCurrented": function(oldRow,newRow){
					if((newRow || oldRow) && oldRow === newRow){
						return false;
					}
					el.loadData(null, el);
					/*
					var childRows = newRow ? newRow.childRows(this) : [],
						punit = (newRow || oldRow).unit,
						rela = punit.findChildRelation(this),
						where = "", args = {}, 
						re, pcols, ccols, pcol, ccol, ccname, pcname,
						i, j, ilen = rela.length, jlen;
					
					for (i = 0; i < ilen; i++) {
						re = rela[i];
						pcols = re.pcIdxs;
						ccols = re.ccIdxs;
						jlen = pcols.length;
						
						for (j = 0; j < jlen; j++) {
							pcol = punit.getCol(pcols[j]);
							pcname = pcol.cname;
							ccol = this.getCol(ccols[j]);
							ccname = ccol.cname;
							
							where = (where ? " AND " : "") + ccname + " = :" + pcname;
							args[pcname] = newRow.getData(pcol);
						}
					}
					
					this.filter({where: where, args: args});
					*/
					//TODO initCurrent in grid or unit
					//this.setCurrent(childRows[0] ? childRows[0].idx : -1);
				},
				"onAccepted": function(){
					el.loadData(null, el);
				},
				"onRejected": function(){
					el.loadData(null, el);
				},
				"onSetDataed": function(row, col, oldVal, newVal){
					el.input(row, col.cname, newVal, el);
				},
				"onRegError": function(row, colIdx, errMsg){
					//el.regError(row, this.getCol(colIdx).cname, errMsg);
				},
				"onRegChange": function(row, colIdx, addChg){
					//el.regChange(row, this.getCol(colIdx).cname, addChg);
				}
			}, el);
		},
		_unbindUnit: function(){
			var unit = this.unit;
			
		},
		//每個el不管unit如何變化，只需要bind一次即可
		_bindEl: function(){
			var el = this;
			
			el.bind({
				"onFiltering": function(filterExp){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit && currUnit.filter(filterExp, el);
				},
				"onSorting": function(sortExp){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit && currUnit.sort(sortExp, el);
				},
				"onLoadDataing": function(data){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit && currUnit.loadData(data, el);
					
				},
				"onSelectRowing": function(index, row){
					var currUnit = el.bindingUnit || el.createUnit(),
						oldRow = currUnit.getRow(currUnit.curr);
					
					if (oldRow && this.isInputing()){
						var dcs = el.dataColumns,
							pri, ori, col, editor, i, len = dcs.length;
							
						for (i = 0; i < len; i++) {
							col = dcs[i];
							editor = col.editor;
							
							if (editor && editor.$instance) {
								ori = oldRow.getData(col.field);
								pri = editor.getValue();
								if (pri != ori) {
									if ((pri === null || pri === undefined) && (ori === null || ori === undefined)) {
										continue;
									}
									//log("=====11======pri:"+pri+"=======ori:"+ori);
									currUnit._regInputUpd(oldRow, col.field, ori, pri, el);
									//log("=====22======pri:"+pri+"=======ori:"+ori);
									oldRow.setData(col.field, pri, el);
									//log("=====33======pri:"+pri+"=======ori:"+ori);
								}
								//editor.setData({value: null}, col);
								//editor.refreshShow();
							}
						}
					}
					currUnit && currUnit.setCurrent(row, el);
				},
				"onDeleteRowing": function(index, row){
					var currUnit = el.bindingUnit || el.createUnit();
					if (currUnit) {
						if (currUnit.deleteRow) {
							currUnit.deleteRow(row, el);
						} else {
							currUnit.removeRow(row, el);
						}
					}
				},
				"onInsertRowing": function(index, rowData){
					var currUnit = el.bindingUnit || el.createUnit();
					if (currUnit) {
						if (currUnit.newRow) {
							var r = currUnit.newRow(rowData, el);
						} else {
							currUnit.addRow(rowData, el);
						}
					}
				},
				"onEndEditing": function(){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit.endInput(null, el);
				},
				"onBeginEditing": function(){
					var currUnit = el.bindingUnit || el.createUnit();
					currUnit.beginInput(el);
				},
				"onSetDataing": function(row, col, val){
					var currUnit = el.bindingUnit || el.createUnit();
					if (currUnit) {
						if (currUnit.input) {
							//TODO
							//need el??
							row = currUnit.getRow(currUnit.curr);
							row && currUnit.input(col.field, val, el);
						} else {
							currUnit.setData(row, col.field, val, el);
						}
					}
				}
			}, el);
		}
	};
	
};


$$.define("data.GridData", ["data.BaseData", "data.ResultUnit"], gd);

})(window.jQuery, window.com.pouchen);