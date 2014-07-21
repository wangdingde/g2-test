(function($, $$){
	
var ap = function(){
	
	return {
		static: true,
		loadData: function(unit, obj, clearOld){
			var rtn = [];
			unit._loadUnit(obj);
			if(obj.c && obj.c instanceof Array) {
				unit._loadCols(obj.c);
			}
			var cnt,row,rtn = [];
			if(obj.d && obj.d instanceof Array && obj.d.length > 0) {
				cnt = obj.d[0].p.length;
				for(var i=0; i<cnt; i++) {
					row = unit.addRow();
					for(var j=0; j<unit.cols.length; j++) {
						unit._loadRow(row,j,obj.d[j].p[i]);
					}
					rtn.push(row);
				}
			}
			
			return rtn;
		},
		updateData: function(unit, onlyDel){
			var rtn = {};
			var row,keyNm;
			for(var i=0; i<this.rows.length; i++) {
				row = unit.rows[i];
				keyNm = (row.stat == "o" ? (row._upd.length > 0 ? "u" : (row._updc > 0 ? "o" : "")) : row.stat); //i 或 d
				if (onlyDel && keyNm != "d") {continue;}
				if (keyNm) {
					this._jsonKey(unit, rtn, keyNm); //i 或 d
					this._jsonVal(unit, rtn, keyNm,row);
				}
			}
			if (rtn === {}) {return null;}
			rtn.t = "DataUnit";
			rtn.n = unit.uname;
			
			return rtn;
		},
		checkData: function(unit, row) {
			row = unit.getRow(row);
			if (row == null) {return null;}
			var rtn = {}, keyNm = row.stat;
			if (keyNm) {
				this._jsonKey(rtn,keyNm);
				this._jsonVal(rtn,keyNm,row);
			}
			if (rtn === {}) {return null;}
			rtn.t = "DataUnit";
			rtn.n = unit.uname;
			return rtn;
		},
		_jsonKey: function(unit, obj, keyNm) {
			if(obj[keyNm]) {return;}
			obj[keyNm] = [];
			obj[keyNm + "t"] = [];
			for(var j=0; j<unit.cols.length; j++) {
				if (keyNm == "u") {
					obj[keyNm][j] = {"p":[],"o":[]};
				} else if (keyNm == "i") {
					obj[keyNm][j] = {"p":[]};
				} else {
					obj[keyNm][j] = {"o":[]};
				}
			}
		},
		_jsonVal: function(unit, obj, keyNm, row) {
			var fk = (keyNm == "i" ? "p" : "o");
			var ri = obj[keyNm][0][fk].length;
			obj[keyNm + "t"][ri] = row.tid;
			for(var j=0; j<unit.cols.length; j++) {
				if (keyNm == "i" || keyNm == "u") {
					obj[keyNm][j].p[ri] = unit.getData(row,j);
				}
				if (keyNm != "i") {
					obj[keyNm][j].o[ri] = unit.getOriData(row,j);
				}
			}
		},
	};
	
};

$$.define("data.Apater", [], ap);

})(window.jQuery, window.com.pouchen);