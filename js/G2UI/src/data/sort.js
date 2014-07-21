(function($$){
    var ext = {
        filter: function(opts){
            
        },
        filterBy: function(fn){
            
        },
        sort: function(str){
            if(!str){return;}
            var sorts = str.split(",");
            try{
                for (var i=0; i < sorts.length; i++) {
                    sorts[i] = sorts[i].trim().split(" ");
                    if(!sorts[i][1]){sorts[i][1] = "ASC";}
                }
            }catch(e){
                //console.error("oder string is invalid！");
                throw e;
            }
            var rows = this.rows;
            var ds = [];
            var types = [];
            var dscs = [];
            var sortedRows = new Array(rows.length);
            var numberTypes = ["Byte", "Short", "Integer", "Long", "Float", "Double"];
            for (var i=0; i < rows.length; i++) {
                var row = rows[i];
                var d = ds[i] = {idx: i, data: [], row: row};
                for (var j=0; j < sorts.length; j++) {
                    var col = this.getCol(sorts[j][0]);
                    d["data"][j] = this.getData(row,col);
                    if(i == 0){
                        var type = col.dtype;
                        if(type == "String"){
                            type = "C";
                        }else if(numberTypes.indexOf(type) != -1){
                            type = "N";
                        }else if(type == "Date"){
                            type = "D";
                        }            
                        var dsc = String(sorts[j][1]).toUpperCase() == "DESC" ? -1 : 1; 
                        types[j] = type;
                        dscs[j] = dsc;
                    }
                }
            }
            //console.log(ds);
            var fn = this.a2b;
            ds.sort(function(a,b){
                 var v;
                 for (var i=0; i < a.data.length; i++) {
                    v = fn(a.data[i],b.data[i],types[i])*dscs[i];
                    if(v !== 0){return v;}
                 }
                 if(v === 0){
                     v = a.idx < b.idx ? -1 : 1;
                 }
                 return v;
            });
            //console.log(ds)
            var sortedRows = [];
            for (var i=0; i < ds.length; i++) {
                sortedRows[i] = ds[i].row;
                sortedRows[i].idx = i;
            }
            //console.log(sortedRows);
        },
        a2b: function(a,b,type){
            if($$.isNull(a) || $$.isEmptyString(a)){
                if($$.isNull(b) || $$.isEmptyString(b)){
                    return 0;
                }
                return -1;
            }
            if(type == "D"){
                a = a.getTime();
                b = b.getTime();
            }
            if(type == "C"){
                return a.localeCompare(b);
            }
            return a==b ? 0 : (a-b>0 ? 1 : -1);
        },
        sortBy: function(fn){
            
        }
    };
    $$.extMethod("ResultUnit",ext);
})(window.com.ASC);
