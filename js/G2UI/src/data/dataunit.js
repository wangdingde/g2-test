(function($, $$){
var dc = function(rc){
	
	return {
		extend: rc,
		ctor: function(opts) { //dataunit column
			//因使用$$.register框架模式﹐datacol構造函數繼承resultcol不在此寫﹐在register上處理。
			this.ori = []; //original data
			this.cap = ""; //caption
			this.totw = opts.totalW; //total width
			this.decw = opts.decimalW; //decimal width
			this.cannull = true; //allow null
			this.pk = false; //pk
			this.uni = []; //unique group
			this.def = ""; //default value
			this.auto = ""; //auto type
			this.ctype = "";
			this.opt = 0;
			this.lastId = -1; //為自動編碼預占位從-1開始每次減1
		},
		getCaption: function() {
			return this.cap ? this.cap : this.cname;
		}
	};
	
};

var dr = function(rr){
	
	return {
		extend: rr,
		ctor: function(opts) {
			this.oidx = -1; //original data index
			this.stat = "o"; //row status(i:newinserted,o:oldExists,d:deleted) //i:insert,d:delete,u:update,o:nochange
			this._upd = [];   //此行哪些列有改變
			this._updc = 0;   //此行有多少子行有改變
			this._err = [];   //此行哪些列有錯誤
			this._errmsg = [];//上述列錯誤內容
			this._errc = 0;   //此行有多少子行有錯誤
		},
		regChange: function(col,addChg,sender) {
			if (col == null) {
				var cnt = this.unit.cols.length;
				if (addChg) {
					for (var i= 0; i < cnt; i++) {
						this._regChg(i,addChg,sender);
					}
				} else {
					for (var i= cnt - 1; i >= 0; i--) {
						this._regChg(i,addChg,sender);
					}
				}
			} else {
				col = this.unit.getColIdx(col);
				this._regChg(col,addChg,sender);
			}
		},
		_regChg: function(colIdx,addChg,sender) {
			var cidx = this._upd.indexOf(colIdx);
			if (addChg && cidx < 0) {
				if (this._upd.length + this._updc == 0) {this._regUpChg(addChg,sender);}
				this._upd[this._upd.length] = colIdx;
			} else if (!addChg && cidx >=0) {
				if (this._upd.length + this._updc == 1) {this._regUpChg(addChg,sender);}
				this._upd.splice(cidx,1);
			}
			this.unit.trigger("onRegChange",sender,this,colIdx,addChg);
		},
		_regUpChg: function(addChg,sender) {
			this.unit.regChange(addChg);
			var pr = this.parentRow();
			if (pr) {pr.regSubChange(addChg,sender);}
		},
		regSubChange: function(addChg,sender) {
			var oldv = this._upd.length + this._updc;
			if (oldv == 0 && addChg || oldv == 1 && !addChg) {
				var pr = this.parentRow();
				if (pr) {pr.regSubChange(addChg,sender);}
				this.unit.regChange(addChg);
			}
			if (addChg) {
				this._updc++;
			} else {
				this._updc--;
			}
			this.unit.trigger("onRegSubChange",sender,this,addChg);
		},
		needUpd: function() {
			return this._upd.length + this._updc > 0;
		},
		regError: function(col,errMsg,sender) {
			//當col為空時表示全部add或remove,用于新增或刪除
			if (col == null) {
				var cnt = this.unit.cols.length;
				if (errMsg) {
					for (var i= 0; i < cnt; i++) {
						this._regErr(i,errMsg,sender);
					}
				} else {
					for (var i= cnt - 1; i >= 0; i--) {
						this._regErr(i,errMsg,sender);
					}
				}
			} else {
				col = this.unit.getColIdx(col);
				this._regErr(col,errMsg,sender);
			}
		},
		_regErr: function(colIdx,errMsg,sender) {
			var cidx = this._err.indexOf(colIdx);
			if (errMsg) {
				if (cidx < 0) {
					if (this._err.length + this._errc == 0) {this._regUpErr(true,sender);}
					cidx = this._err.length;
					this._err[cidx] = colIdx;
				}
				this._errmsg[cidx] = errMsg;
				this.unit.trigger("onRegError",sender,this,colIdx,errMsg);
			} else if (cidx >=0) {
				if (this._err.length + this._errc == 1) {this._regUpErr(false,sender);}
				this._err.splice(cidx,1);
				this._errmsg.splice(cidx,1);
				this.unit.trigger("onRegError",sender,this,colIdx,errMsg);
			}
			//this.unit.trigger("onRegError",sender,this,colIdx,errMsg);
		},
		_regUpErr: function(addErr,sender) {
			this.unit.regError(addErr);
			var pr = this.parentRow();
			if (pr) {pr.regSubError(addErr,sender);}
		},
		regSubError: function(addErr,sender) {
			var oldv = this._err.length + this._errc;
			if (oldv == 0 && addErr || oldv == 1 && !addErr) {
				var pr = this.parentRow();
				if (pr) {pr.regSubError(addErr,sender);}
				this.unit.regError(addErr);
			}
			if (addErr) {
				this._errc++;
			} else {
				this._errc--;
			}
			this.unit.trigger("onRegSubError",sender,this,addErr);
		},
		accept: function(sender) {
			this.unit.acceptRow(this,false,sender);
		},
		reject: function(sender) {
			this.unit.rejectRow(this,false,sender);
		}
	};
	
};

var du = function(ru, dr, dc){
	
	return {
		extend: ru,
		ctor: function(opts) { //dataunit
			this.cap = ""; //caption
			this.cn = ""; //conn name
			this.ow = ""; //owner name
			this.updCnt = 0; //updatable columns count
			this._upd = 0; //有多少行有改變。
			this._err = 0; //有多少行有錯誤。
			this.ct = "n"; //表类型，n:普通；b:基础资料；h:单头；t:树状。
			this.isInputing = false;
			this.aa = false;
			this.am = false;
			this.ad = false;
			this.bind("onSetDataed",function(row,col,oldv,newv,sender){
				this._regInputUpd(row,col,oldv,newv,sender);
			});
		},
		updateData: function(onlyDel) {
			var apater = this.createApater();
			if (!apater) {
				return;
			}
			
			if (onlyDel == undefined) {onlyDel = false;}
			return apater.updateData(this, onlyDel);
		},
		
		beginInput: function(flag,sender){
			//if(this.isInputing === true){return;}
			var units = this.mdl ? this.mdl.units : [this];
			for(var i = 0, ii = units.length; i < ii; i++){
				units[i].isInputing = true;
				var curr = units[i].getRow(units[i].curr);
				if(curr && ((units[i].aa && curr.stat == "i") || units[i].am)){
					units[i].trigger("onBeginInput",sender,units[i].curr);
				}
			}
		},
		endInput: function(flag,sender){
			if(this.isInputing === false){return;}
			var units = this.mdl ? this.mdl.units : [this];
			for(var i = 0, ii = units.length; i < ii; i++){
				if(!flag){units[i].isInputing = false;}
				units[i].trigger("onEndInput",sender,units[i].curr);
			}
		},
		regChange: function(addChg) {
			if (addChg) {
				if (this._upd == 0 && this.mdl) {this.mdl._upd++;}
				this._upd++;
			} else {
				if (this._upd == 1 && this.mdl) {this.mdl._upd--;}
				this._upd--;
			}
		},
		regError: function(addErr) {
			if (addErr) {
				if (this._err == 0 && this.mdl) {this.mdl._err++;}
				this._err++;
			} else {
				if (this._err == 1 && this.mdl) {this.mdl._err--;}
				this._err--;
			}
		},
		getCaption: function() {
			return this.cap ? this.cap : this.uname;
		},
		getOriData: function(row,col) {
			row = this.getRowIdx(row);
			col = this.getColIdx(col);
			var oi = this.rows[row].oidx;
			return oi == -1 ? null : this.cols[col].ori[oi];
		},
		setOriData: function(row,col,val) {
			row = this.getRowIdx(row);
			col = this.getColIdx(col);
			var oi = this.rows[row].oidx;
			if (oi == -1) {
				oi = this.cols[col].ori.length;
				for(var i = 0; i<this.cols.length; i++) {
					this.cols[i].ori.length = oi + 1;
				}
				this.rows[row].oidx = oi;
			}
			this.cols[col].ori[oi] = val;
		},
		addCol: function(cname,jtype,totwidth,decwidth) {
			//var col = new dc(cname,jtype,totwidth,decwidth);
			var col = $$.create(dc, {colName: cname, dType: jtype, totalW: totwidth, decw: decwidth});
			this._packCol(col);
			return col;
		},
		_newRow: function() {
			//return new dr();
			return $$.create(dr, {});
		},
		removeRow: function(row,sender) {
			var orow = this.getRow(row);
			row = this.getRowIdx(row);
			this.trigger("onRemoveRowing",sender,this.rows[row]);
			var pidx = this.rows[row].pidx,
				oidx = this.rows[row].oidx,
				xidx = this.rows.length - 1, //last pri index;
				yidx = this.cols[0].ori.length - 1, //last ori index;
				i;
			if (pidx != xidx) {
				for(i = 0; i<this.rows.length; i++) {
					if (this.rows[i].pidx == xidx) {
						this.rows[i].pidx = pidx;
						break;
					}
				}
			}
			if (oidx >=0 && oidx != yidx) {
				for(i = 0; i<this.rows.length; i++) {
					if (this.rows[i].oidx == yidx) {
						this.rows[i].oidx = oidx;
						break;
					}
				}
			}
			for(i = 0; i<this.cols.length; i++) {
				if (pidx != xidx) {
					this.cols[i].pri[pidx] = this.cols[i].pri[xidx];
				}
				if (oidx >=0 && oidx != yidx) {
					this.cols[i].ori[oidx] = this.cols[i].ori[yidx];
				}
				this.cols[i].pri.length = xidx;
				if (oidx >=0) {
					this.cols[i].ori.length = yidx;
				}
			}
			this.rows.splice(row,1);
			for(i = row; i < this.rows.length; i++) {
				this.rows[i].idx = i;
			}
			this.trigger("onRemoveRowed",sender, orow);
		},
		_loadRow: function(row,col,val) {
			this.setData(row,col,val);
			this.setOriData(row,col,val);
		},
		_loadCols: function(obj) {
			this.cols = [];
			var c;
			for(var i=0; i<obj.length; i++) {
				c = this.addCol(obj[i].n,obj[i].t,obj[i].w,obj[i].d);
				c.cannull = obj[i].an;
				c.ctype = obj[i].c;
				c.pk = obj[i].p;
				c.uni = obj[i].u;
				c.def = obj[i].f;
				c.auto = obj[i].au;
				c.opt = obj[i].l;
				c.cap = obj[i].ca;
			}
		},
		_loadUnit: function(obj) {
			if (obj.u && obj.u instanceof Number) {
				this.updCnt = obj.u;
			}
			this.ct = obj.ct;
			this.aa = obj.aa;
			this.am = obj.am;
			this.ad = obj.ad;
		},
		_clearColData: function(col) {
			col.pri = [];
			col.ori = [];
		},
		canFind: function(row) {
			return (this.getRow(row).stat.substr(0,1) != "d");
		},
		checkRow: function(row) {
			//not finished yet.
		},
		_cntUpdCol: function() {
			return this.updCnt && this.updCnt < this.cols.length ? this.udpCnt : this.cols.length;
		},
		getPkCols: function() {
			var rtn = [];
			var cnt = this._cntUpdCol();
			for (var i=0; i < cnt; i++) {
			  if (this.cols[i].pk) {rtn[rtn.length] = i;}
			}
			return rtn; //[int]
		},
		getUniqCols: function(uniqIdx) {
			var rtn = [];
			var cnt = this._cntUpdCol();
			var c;
			for (var i=0; i < cnt; i++) {
				c = this.cols[i];
				for (var j=0; j < c.uni.length; j++) {
				  if (c.uni[j] == uniqIdx) {
				  	rtn[rtn.length] = i;
				  	break;
				  }
				}
			}
			return rtn; //[int]
		},
		getColsCap: function(cols) {
			var rtn = "";
			for (var i=0; i < cols.length; i++) {
				if (i > 0) { rtn += "," ;}
			  	rtn += this.getCol(cols[i]).getCaption();
			}
			return rtn;
		},
		getColsVal: function(row,cols,col,val) {
			col = this.getColIdx(col);
			var rtn = [];
			for (var i=0; i < cols.length; i++) {
				rtn[i] = (this.getColIdx(cols[i]) == col ? val : this.getData(row,cols[i]));
			}
			return rtn;
		},
		chkNul: function(row,col,val) {
			col = this.getCol(col);
			if (col.cannull || col.auto != "") {return;}
			if (val === null || val === undefined || String(val).toString() === "") {
				throw new Error(col.getCaption() + "不能為空");
			}
		},
		chkUniq: function(row,col,val) {
			var rowidx = this.getRowIdx(row);
			var cols,vals;
			if (col.pk) {
				cols = this.getPkCols();
				vals = this.getColsVal(row,cols,col,val);
				this._chkUniq(row,cols,vals,[rowidx]);
			}
			if (col.uni && col.uni instanceof Array) {
				for (var i=0; i < col.uni.length; i++) {
					cols = this.getUniqCols(col.uni[i]);
					vals = this.getColsVal(row,cols,col,val);
					this._chkUniq(row,cols,vals,[rowidx]);
				}
			}
			
		},
		chkWidth: function(row,col,val) {
			col = this.getCol(col);
			if (col.auto != "" ||  $$.isNull(val) || $$.isEmptyString(val) || col.dtype == "Date" || col.totw == 0) {return;}
			if (String(val).toString().length > col.totw) {
				throw new Error(col.getCaption() + "最大長度為" + col.totw);
			}
		},
		chkDecw: function(row,col,val) {
			col = this.getCol(col);
			if (col.auto != "") {return;}
			val = val.toString();
			var d = val.lastIndexOf("."); 
			if (d != -1 && val.length-1-d > col.decw) {
				throw new Error(col.getCaption() + "小數位數限制為" + col.decw);
			}
		},
		chkType: function(row,col,val) {
			col = this.getCol(col);
			var numberTypes = ["Byte", "Short", "Integer", "Long", "Float", "Double"];
			var typeName = col.dtype == "Date" ? "日期" : (numberTypes.indexOf(col.dtype) == -1 ? "字符串" : "數字");
			if (col.cannull || col.auto != "") {return;}
			if (val === null && val === undefined && val.toString() === "") {
				return;
			}
			if(col.dtype == "Date"){
				typeName = "日期";
				if($$.Util.Date.isDate(val)){return;}
			}else if(col.dtype == "String"){
				typeName = "字符串";
				return;
			}else{
				typeName = "數字";
				if(!isNaN(val)){return;}
			}
			throw new Error(col.getCaption() + "類型必須為" + typeName);
		},
		_chkUniq: function(row,cols,vals,excludeRowIdxs) {
			if (this.findRow(0,cols,vals,excludeRowIdxs) != null) {
				throw new Error(this.getColsCap(cols) + "必需唯一,不可重復");
			}
		},
		_regInputUpd: function(row,col,oldv,val,sender) {
			row = this.getRowIdx(row);
			col = this.getColIdx(col);
			var r = this.rows[row];
			if (r.stat == "i" || oldv == val) {return;}
			var ori = this.getOriData(row, col);
			if (ori == oldv) {
				r.regChange(col,true,sender); //登記修改
			} else if (ori == val) {
				r.regChange(col,false,sender); //清除修改
			}
		},
		setKey: function(row,col,val,sender) {
			col = this.getCol(col);
			var rowIdx = this.getRowIdx(row), oldv = this.getData(rowIdx,col);
			if (oldv == val) {return;}
			var msgs = this.mdl ? this.mdl.subKeyChainIfKey(this,rowIdx,col,oldv,val) : [{"unit":this,"row":row,"col":col,"oldval":oldv,"newval":val}];
			for (var i=0; i < msgs.length; i++) {
				msgs[i].unit._regInputUpd(msgs[i].row,msgs[i].col,msgs[i].oldval,msgs[i].newval,sender);
				msgs[i].unit.setData(msgs[i].row,msgs[i].col,msgs[i].newval);
				msgs[i].row.regError(msgs[i].col,null,sender);
			}
		},
		input: function(col,val,sender) {
			var rowIdx = this.curr;
			//1 查有無當前行
			if(rowIdx < 0) {
				throw new Error(this.getCaption() + "沒有當前行﹐不能輸入");
			}
			var row = this.getRow(rowIdx);
			col = this.getCol(col);
			if (rowIdx >= this.rows.length || col == null) {return;}
			//2 去掉多余的尾部空格
			if (col.dtype == "String" && val != null) {
				var ostr = val.toString();
				var nstr = ostr.trim();
				if (ostr != nstr) {
					val = (nstr == "" ? " " : nstr);
				}
				//var nstr = ostr.replace(/(^\s*)|(\s*$)/g,"");
				//http://www.cnblogs.com/rubylouvre/archive/2009/09/18/1568794.html
			}
			var oldv = this.getData(rowIdx,col);
			
			//TODO 3 常規檢查. 這里暫只有非空和重復檢查﹐其他待加
			try {
				this.chkNul(rowIdx,col,val);
				this.chkUniq(rowIdx,col,val);
				this.chkType(rowIdx,col,val);
				this.chkWidth(rowIdx,col,val);
			} catch(e) {
				row.regError(col,e.message,sender); //登記錯誤
				return;
			}
			//row.regError(col,null,sender); //清除錯誤  暂时移至inputing之后
			
			//4 如果新舊無變化﹐則退出﹐不觸發后續動作。
			if (oldv == val || ($$.isNull(oldv) && $$.isEmptyString(val))) {
				return;
			}
			//5 運算同步Key用到的[unit],然后依次循環6-循環7,8-循環9
			var msgs = this.mdl ? this.mdl.subKeyChainIfKey(this,rowIdx,col,oldv,val) : [{"unit":this,"row":row,"col":col,"oldval":oldv,"newval":val}];
			var msg;
			for (var i=0; i < msgs.length; i++) {
				//6 觸發輸入前事件ing
				msg = msgs[i];
				try{
					if(msg.unit.trigger("onInputing",sender,msg.row,msg.col,msg.oldval,msg.newval) === false){
					    return;
					}
				} catch(e) {
					msg.row.regError(msg.col,e.message,sender); //登記錯誤
					return;
				}
			}
			row.regError(col,null,sender); //清除錯誤
			//if(inputingFlag === false){return;}
			for (var i=0; i < msgs.length; i++) {
				//7 變動狀態統計
				//msgs[i].unit._regInputUpd(msgs[i].row,msgs[i].col,msgs[i].oldval,msgs[i].newval,sender);
				//if (msgs[i].row.stat != "i") {
				//	var ori = msgs[i].unit.getOriData(msgs[i].row, msgs[i].col);
				//	if (ori == msgs[i].oldval) {
				//		msgs[i].row.regChange(msgs[i].col,true,sender); //登記修改
				//	} else if (ori == msgs[i].newval) {
				//		msgs[i].row.regChange(msgs[i].col,false,sender); //清除修改
				//	}
				//}
				
				//8 放入新值
				msgs[i].unit.setData(msgs[i].row,msgs[i].col,msgs[i].newval,sender);
				msgs[i].row.regError(msgs[i].col,null,sender);
			}
			for (var i=0; i < msgs.length; i++) {
				//9 觸發輸入后事件ed
				msg = msgs[i];
	            msg.unit.trigger("onInputed",sender,msg.row,msg.col,msg.oldval,msg.newval);
			}
		},
		newRow: function(vals,sender) {
			//1 先檢查
			if (this.cols.length <= 0) {
				throw new Error(this.getCaption() + "沒有任何字段欄位﹐不能新增");
			}
			var pr = this.findChildRelation(false);
			pr = pr.length > 0 ? pr[0] : null;
			if (pr != null && pr.pu.curr < 0) {
				throw new Error("上級記錄(" + pr.pu.getCaption() + ")沒有當前行﹐無法新增");
			}
			if (vals == null) {vals = {};}
			//2 觸發新增前事件ing
			if(!this.ld && this.trigger("onNewRowing",sender) === false){return;}
			//3 新增
			var row = this.addRow(vals, sender); //里面會寫入tid和pid﹐并設置當前行
			this.setCurrent(row,sender);
			row.regChange(null,true,sender); //登記修改
			row.stat = "i";
			//4 復制PK
			var colidxs = [];
			if (pr != null) {
				for(var i=0; i<pr.pcIdxs.length; i++) {
					row.setData(pr.ccIdxs[i], pr.pu.getData(pr.pu.curr,pr.pcIdxs[i]) );
					colidxs[colidxs.length] = pr.ccIdxs[i];
				}
			}
			//5 給其他欄位默認值
			var col;
			for (var i=0; i < this.cols.length; i++) {
				if (colidxs.indexOf(i) >= 0) {continue;} //已從父PK得值
				col = this.cols[i];
				
				if (col.auto) { //有自動類型
					row.setData(i,col.lastId--,sender);
				} else if (vals.hasOwnProperty([col.cname])) { //有傳入值
					row.setData(i,vals[col.cname],sender);
				} else if (col.def) { //有設默認值
					//TODO 這里可能有問題 ﹕
					//(1)input還是setData? (2)當字段是數值型時默認值是"0"會有問題嗎?
					this.input(i,col.def,sender);
				} else {
					this.input(i,null,sender);
				}
			}
			//6 觸發新增后事件ed
			!this.ld && this.trigger("onNewRowed",sender,row);
			return row;
		},
		deleteRow: function(row,sender) {
			row = this.getRow(row);
			if (row.stat.substr(0,1) == "d") {return;} //已經是刪除的﹐則中止。
			var rows = row.allSubRows(true); //includeUser
			var deleteingFlag = true;
			for (var i=rows.length - 1; i >= 0; i--) {
			    row = rows[i];
			    if(row.unit.trigger("onDeleteRowing",sender,row) === false){
			        deleteingFlag = false;
			        break;
			    }
				// 觸發刪除前事件ing
			}
			if(deleteingFlag === false){return;}
			for (var i=rows.length - 1; i >= 0; i--) {
				if(rows[i].stat == "i") {
					rows[i].regChange(null,false,sender);
					rows[i].regError(null,null,sender);
					rows[i].unit.removeRow(rows[i],sender);
				} else if (rows[i].stat == "o") {
					rows[i].stat = "d";
				}
			}
			for (var i=rows.length - 1; i >= 0; i--) {
				// 觸發刪除后事件ed
				row = rows[i];
				row.unit.trigger("onDeleteRowed",sender,row);
			}
		},
		acceptRow: function(row,onlyDel,sender) {
			row = this.getRow(row);
			if (onlyDel && row.stat != "d") {return;}
			var rst = row.stat, dataChg = (rst != "o" || row._upd.length > 0);
			!this.ld && this.trigger("onAcceptRowing",sender,row,onlyDel,dataChg);
			row.regError(null,null,sender);
			if (rst == "i") {
				for(var i=0; i<this.cols.length; i++) {
					this.setOriData(row,i,this.getData(row,i));
				}
				row.regChange(null,false,sender);
				row.stat = "o";
			} else if (rst == "o") {
				for(var i=row._upd.length - 1; i>=0; i--) {
					this.setOriData(row,row._upd[i],this.getData(row,row._upd[i]));
				}
				row.regChange(null,false,sender);
			} else {
				row.regChange(null,false,sender);
				this.removeRow(row,sender);
			}
			!this.ld && this.trigger("onAcceptRowed",sender,row,onlyDel,dataChg);
		},
		rejectRow: function(row,onlyDel,sender) {
			row = this.getRow(row);
			if (onlyDel && row.stat != "d") {return;}
			var rst = row.stat, dataChg = (rst != "o" || row._upd.length > 0);
			this.trigger("onRejectRowing",sender,row,onlyDel,dataChg);
			row.regError(null,null,sender);
			if (rst == "i") {
				row.regChange(null,false,sender);
				this.removeRow(row,sender);
				//this.trigger("onRejectRowed",sender,row,onlyDel,dataChg);
			} else if(rst == "d" || row._upd.length > 0) {
				for(var i=row._upd.length - 1; i>=0; i--) {
					this.setData(row,row._upd[i],this.getOriData(row,row._upd[i]));
				}
				row.regChange(null,false,sender);
				row.stat = "o";
				this.trigger("onRejectRowed",sender,row,onlyDel,dataChg);
			}
			//this.trigger("onRejectRowed",sender,row,onlyDel,dataChg);
		},
		accept: function(onlyDel,sender) {
			!this.ld && this.trigger("onAccepting",sender);
			for (var i=this.rows.length - 1; i >= 0; i--) {
				this.acceptRow(i,onlyDel,sender);
			}
			!this.ld && this.trigger("onAccepted",sender);
		},
		reject: function(onlyDel,sender) {
			this.trigger("onRejecting",sender);
			for (var i=this.rows.length - 1; i >= 0; i--) {
				this.rejectRow(i,onlyDel,sender);
			}
			this.trigger("onRejected",sender);
		},
		_jsonKey: function(obj,keyNm) {
			if(obj[keyNm]) {return;}
			obj[keyNm] = [];
			obj[keyNm + "t"] = [];
			for(var j=0; j<this.cols.length; j++) {
				if (keyNm == "u") {
					obj[keyNm][j] = {"p":[],"o":[]};
				} else if (keyNm == "i") {
					obj[keyNm][j] = {"p":[]};
				} else {
					obj[keyNm][j] = {"o":[]};
				}
			}
		},
		_jsonVal: function(obj,keyNm,row) {
			var fk = (keyNm == "i" ? "p" : "o");
			var ri = obj[keyNm][0][fk].length;
			obj[keyNm + "t"][ri] = row.tid;
			for(var j=0; j<this.cols.length; j++) {
				if (keyNm == "i" || keyNm == "u") {
					obj[keyNm][j].p[ri] = this.getData(row,j);
				}
				if (keyNm != "i") {
					obj[keyNm][j].o[ri] = this.getOriData(row,j);
				}
			}
		},
		updateJson: function(onlyDel) {
			if (onlyDel == undefined) {onlyDel = false;}
			var rtn = {};
			var row,keyNm;
			for(var i=0; i<this.rows.length; i++) {
				row = this.rows[i];
				keyNm = (row.stat == "o" ? (row._upd.length > 0 ? "u" : (row._updc > 0 ? "o" : "")) : row.stat); //i 或 d
				if (onlyDel && keyNm != "d") {continue;}
				if (keyNm) {
					this._jsonKey(rtn,keyNm); //i 或 d
					this._jsonVal(rtn,keyNm,row);
				}
			}
			if (rtn === {}) {return null;}
			rtn.t = "DataUnit";
			rtn.n = this.uname;
			return rtn;
		},
		checkJson: function(row) {
			row = this.getRow(row);
			if (row == null) {return null;}
			var rtn = {}, keyNm = row.stat;
			if (keyNm) {
				this._jsonKey(rtn,keyNm);
				this._jsonVal(rtn,keyNm,row);
			}
			if (rtn === {}) {return null;}
			rtn.t = "DataUnit";
			rtn.n = this.uname;
			return rtn;
		}
	};
	
};

$$.define("data.DataCol", ["data.ResultCol"], dc);

$$.define("data.DataRow", ["data.ResultRow"], dr);

$$.define("data.DataUnit", ["data.ResultUnit", "data.DataRow", "data.DataCol"], du);

})(window.jQuery, window.com.pouchen);