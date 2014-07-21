(function($, $$){
var ur = function(control){
	return {
		extend: control,
		ctor : function(opts) { //unit relation
			this.mdl = null; //data model
			this.idx = -1; //index in model
			this.rtype = "c"; //type(c:child,d:detail,e:extension,u:user)
			this.rname = "";
			this.pu = null; //parent unit.因前端不記載引用關系﹐所以直接記unit句柄﹐不記unit名稱
			this.cu = null; //child unit
			this.pcIdxs = []; //parent columns index
			this.ccIdxs = []; //child columns index
			this.lcIdx = -1; //detail limit column index
		},
		loadJson : function(obj) {
			this.rname = obj.n;
			this.rtype = obj.t.substr(0,1);
			this.cu = this.mdl.getUnit(obj.s);
			this.ccIdxs = [];
			for (var i=0; i < obj.sc.length; i++) {
				this.ccIdxs[i] = this.cu.getColIdx(obj.sc[i]);
			}
			this.pu = this.mdl.getUnit(obj.o);
			this.pcIdxs = [];
			for (var i=0; i < obj.oc.length; i++) {
				this.pcIdxs[i] = this.pu.getColIdx(obj.oc[i]);
			}
		}
	};
};

var dm = function(control, ru, du, ur){
	
	return {
		extend: control,
		ctor : function(opts) { //datamodel
			this.mname = opts.modName;
			this.cap = null;
			this.cls = "";
			this.units = [];
			this.relas = []; //relations
			this._upd = 0; //有多少unit有改變。
			this._err = 0; //有多少unit有錯誤。
		},
		getCaption : function() {
			return this.cap ? this.cap : this.mname;
		},
		getUnitIdx : function(unit) {
			if (typeof unit == "string") {
				for(var i = 0; i <this.units.length; i++) {
					if (this.units[i].uname == unit) {return i;}
				}
			} else if (typeof col == "object") {
				return unit.idx;
			} else if (typeof col == "number") {
				return unit;
			}
			return -1;
		},
		getUnit : function(unit) {
			if (typeof unit == "string") {
				for(var i = 0; i <this.units.length; i++) {
					if (this.units[i].uname == unit) {return this.units[i];}
				}
			} else if (typeof unit == "number") {
				return this.units[unit];
			} else if (typeof unit == "object") {
				return unit;
			}
			return null;
		},
		addUnit : function(unit) {
			unit.mdl = this;
			unit.idx = this.units.length;
			this.units[unit.idx] = unit;
		},
		removeUnit : function(unit) {
			var idx = this.getUnitIdx(unit);
			if (idx >= 0) {
				for (var i=idx + 1; i < this.units.length; i++) {
				  this.units[i].idx--;
				}
				this.units.splice(idx,1);
			}
		},
		getRelaIdx : function(rela) {
			if (typeof rela == "string") {
				for(var i = 0; i <this.relas.length; i++) {
					if (this.relas[i].rname == rela) {return i;}
				}
			} else if (typeof col == "object") {
				return rela.idx;
			} else if (typeof col == "number") {
				return rela;
			}
			return -1;
		},
		getRela : function(rela) {
			if (typeof rela == "string") {
				for(var i = 0; i <this.relas.length; i++) {
					if (this.relas[i].rname == rela) {return this.relas[i];}
				}
			} else if (typeof rela == "number") {
				return this.relas[rela];
			} else if (typeof rela == "object") {
				return rela;
			}
			return null;
		},
		addRelation : function(rela) {
			rela.mdl = this;
			rela.idx = this.relas.length;
			this.relas[rela.idx] = rela;
		},
		removeRelation : function(rela) {
			var idx = this.getRelaIdx(rela);
			if (idx >= 0) {
				for (var i=idx + 1; i < this.relas.length; i++) {
				  this.relas[i].idx--;
				}
				this.relas.splice(idx,1);
			}
		},
		findChildRelation : function(unit,findChild,includeUser) {
			var rtn = [], r;
			for (var i=0; i < this.relas.length; i++) {
				r = this.relas[i];
				if (r.rtype == "d" || (r.rtype == "u" && !includeUser)) {continue;}
				if ((findChild ? r.pu : r.cu) === unit) {
					rtn[rtn.length] = r;
				}
			}
			return rtn;
		},
		parent : function(unit) {
			var rs = this.findChildRelation(unit,false);
			if (rs.length > 0) {
				return rs[0].pu;
			} else {
				return null;
			}
		},
		children : function(unit) {
			var rs = this.findChildRelation(unit,true);
			var us = [];
			for (var i=0; i < rs.length; i++) {
			  us[i] = rs[i].cu;
			}
			return us;
		},
		topUnit : function() {
			if (this.units.length <= 0) {
				return null;
			} else {
				var u = this.units[0], c = null;
				do {
					c = u;
					u = this.parent(c);
				} while(u != null);
				return c;
			}
		},
		allSubUnits : function(unit) {
			var rtn = [unit], cus = null;
			for (var i=0; i < rtn.length; i++) {
			  cus = this.children(rtn[i]);
			  for (var j=0; j < cus.length; j++) {
				rtn[rtn.length] = cus[j];
			  }
			}
			return rtn;
		},
		parentRow : function(row) {
			if (row == null || row.unit == null) {return null;}
			var rs = this.findChildRelation(row.unit,false);
			if (rs.length == 0) {return null;}
			var p = rs[0].pu, c = rs[0].cu, pcs = rs[0].pcIdxs, ccs = rs[0].ccIdxs;
			if (row.pid == -1) {
				var cval = new Array (ccs.length);
				for (var j=0; j < ccs.length; j++) {
					cval[j] = row.getData(ccs[j]);
				}
				var pr = p.findRow(0,pcs,cval,null);
				if (pr != null) { row.pid = pr.tid; }
				return pr;
			} else {
				for (var i=0; i < p.rows.length; i++) {
					if (!p.canFind(p.rows[i])) {continue;}
					if (p.rows[i].tid == row.pid) {return p.rows[i];}
				}
				return null;
			}
		},
		childRows : function(row,child,findAll) {
			child = this.getUnit(child);
			if (row == null || child == null) {return [];}
			for (var i=0; i < this.relas.length; i++) {
			  if (this.relas[i].rtype == "u") {continue;}
			  if (row.unit === this.relas[i].pu && child === this.relas[i].cu) {
			  	return this.childRelaRows(row,this.relas[i],findAll);
			  }
			}
			return [];
		},
		childRelaRows : function(row,rela,findAll) {
			var rtn = [];
			rela = this.getRela(rela);
			if (row == null || rela == null) {return rtn;}
			if (row.unit != rela.pu) {
				throw new Error("childRelaRows傳入參數錯誤﹐row與relation的unit不匹配");
			}
			var c = rela.cu, crows = rela.cu.rows;
			if (row.tid == -1 || rela.rtype == "u") {
				var pval = new Array(rela.pcIdxs.length);
				for(var i = 0; i < pval.length; i++) {
					pval[i] = row.getData(rela.pcIdxs[i]);
				}
				var fr = c.findRow(0,rela.ccIdxs,pval,null,null,findAll);
				while(fr != null) {
					rtn[rtn.length] = fr;
					fr = c.findRow(fr.idx + 1,rela.ccIdxs,pval,null,null,findAll);
				}
			} else {
				for (var i=0; i < crows.length; i++) {
					if (!findAll && !c.canFind(crows[i])) {continue;}
					if (crows[i].pid == -1) {
						this.parentRow(crows[i]);
					}
					if (crows[i].pid == row.tid) {
						rtn[rtn.length] = crows[i];
					}
				}
			}
			return rtn;
		},
		allSubRows : function(unit,row,includeUser) {
			if (unit == null || row == null) {return [];}
			var rtn = [unit.getRow(row)];
			var ou = null,rs,crs;
			for (var i=0; i < rtn.length; i++) {
				if (rtn[i].unit != ou) {
					rs = this.findChildRelation(rtn[i].unit,true,includeUser);
					ou = rtn[i].unit;
				}
				for (var j=0; j < rs.length; j++) {
					crs = this.childRelaRows(rtn[i],rs[j]);
					for (var k=0; k < crs.length; k++) {
						rtn[rtn.length] = crs[k];
					}
				}
			}
			return rtn;
		},
		subKeyChainIfKey : function(unit,row,col,oldval,newval) {
			if (unit == null || row == null || col == null) {return [];}
			unit = this.getUnit(unit);
			row = unit.getRow(row);
			col = unit.getCol(col);
			var msg = {"unit":unit,"row":row,"col":col,"oldval":oldval,"newval":newval};
			var rtn = [msg];
			var crelas,crows,kidx,ccol;
			for (var i=0; i < rtn.length; i++) {
				if (!rtn[i].col.pk) {continue;} //本列非pk則無需刷子
				crelas = this.findChildRelation(rtn[i].unit,true,true);//取得全部子關系
				for (var j=0; j < crelas.length; j++) {
					kidx = crelas[j].pcIdxs.indexOf(rtn[i].col.idx);
					if (kidx < 0) {continue;}
					ccol = crelas[j].cu.cols[crelas[j].ccIdxs[kidx]];
					crows = rtn[i].row.childRelaRows(crelas[j]);
					for (var k=0; k < crows.length; k++) {
						rtn[rtn.length] = {"unit":crelas[j].cu,"row":crows[k],"col":ccol,"oldval":crows[k].getData(ccol),"newval":newval};
					}
				}
			}
			return rtn;
		},
		loadJson : function(obj,clearOld,sender) {
			if (!obj || !obj.t || obj.t != "DataModel") {return;}
			if (!obj.n || typeof obj.n != "string" ||obj.n == "") {return;}
			this.mname = obj.n;
			this.cls = obj.c ? obj.c : "";
			if(!obj.u || !(obj.u instanceof Array)) {return;}
			var ut;
			var rtn = {},r;
			for (var i=0; i < obj.u.length; i++) {
				ut = this.getUnit(obj.u[i].n);
				if (ut == null) {
					if(obj.u[i].t == "DataUnit") {
						//ut = new $$.dataUnit(obj.u[i].n);
						ut = $$.create(du,{unitName: obj.u[i].n});
					} else {
						//ut = new $$.resultUnit(obj.u[i].n);
						ut = $$.create(ru,{unitName: obj.u[i].n});
					}
					this.addUnit(ut);
				}
				r = ut.loadJson(obj.u[i],clearOld,sender);
				rtn[ut.uname] = r;
			}
			this.trigger("onLoadJsoned",sender,rtn,clearOld);
			if(!obj.r || !(obj.r instanceof Array)) {return;}
			for (var i=0; i < obj.r.length; i++) {
				ut = this.getRela(obj.r[i].n);
				if (ut == null) {
					//ut = new $$.unitRelation();
					ut = $$.create(ur,{});
					this.addRelation(ut);
				}
				ut.loadJson(obj.r[i]);
			}
		},
		updateJson : function(onlyDel) {
			if (onlyDel == undefined) {onlyDel = false;}
			var rtn = {"t":"DataModel"};
			rtn.c = this.cls;
			rtn.n = this.mname;
			rtn.u = [];
			var us = this.allSubUnits(this.topUnit());
			var uo;
			for (var i=0; i < us.length; i++) {
				uo = us[i].updateJson(onlyDel);
				if (uo) {rtn.u[rtn.u.length] = uo;}
			}
			return rtn;
		},
		checkJson : function(unit,row,col) {
			unit = this.getUnit(unit);
			if (unit == null) {return null;}
			row = unit.getRow(row);
			col = unit.getCol(col);
			if (row == null || col == null) {return null;}
			var rtn = {"t":"DataModel"};
			rtn.c = this.cls;
			rtn.n = this.mname;
			rtn.cu = unit.uname; //check unit
			rtn.cc = col.cname;  //check column
			rtn.u = [];
			while(row != null) {
				rtn.u[rtn.u.length] = row.unit.checkJson(row);
				row = row.parentRow();
			}
			return rtn;
		},
		accept : function(onlyDel,sender) {
			var us = this.allSubUnits(this.topUnit());
			for(var i=us.length - 1; i>=0; i--) {
				us[i].accept(onlyDel,sender);
			}
		},
		reject : function(onlyDel,sender) {
			var us = this.allSubUnits(this.topUnit());
			for(var i=us.length - 1; i>=0; i--) {
				us[i].reject(onlyDel,sender);
			}
			this.trigger("onRejected",sender);
		}
	};
	
};

$$.define("data.UnitRelation", ["core.Control"], ur);

$$.define("data.DataModel", ["core.Control", "data.ResultUnit", "data.DataUnit", "data.UnitRelation"], dm);
	
})(window.jQuery, window.com.pouchen);