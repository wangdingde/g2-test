(function($, $$){
var tableLayout = function(layout){
	return {
		extend: layout,
		ctor: function(opts){
			//this.columns = opts.columns;
			//this.colWidth = opts.colWidth || [50];
			$(this.dom).attr({
				cellspacing: 0,
				cellpadding: 0
			}).css({
				//"table-layout": "fixed"
			}).appendTo(this.container.dom);
			
		},
		elementType: "table",
		defCfg: {
			columns: 1,
			colWidth: 50,
			colHeight: 30
		},
		doResize: function(width, height){
			var items = this.getLayoutItems(),
				columns = this.columns,
				_itemOpts = this.calculate(items),
				i, item, len = items.length;
			
			$(this.dom).height("auto");
			for (i = 0; i < len; i++) {
				item = items[i];
				item.resize(_itemOpts[i].width, null, true);
			}
		},
		renderItems: function(opts){
			var idx = 0, opt, item, styler, itemPos,
				i, len = opts.length,
				html = "<tr>";
			
			for (i = 0; i < len; i++) {
				opt = opts[i];
				if (opt.rowIdx !== idx) {
					html += "</tr><tr>";
					idx = opt.rowIdx;
				}
				//+ (opt.width ? "width=\"" + opt.width + "\"" : "")
				//html += "<td colspan=\"" + opt.colspan + "\" rowspan=\"" + opt.rowspan + "\">"+i+"</td>";
				//<div style=\"width: "+opt.width+"px;\">"+i+"</div>
				html += "<td colspan=\"" + opt.colspan + "\" rowspan=\"" + opt.rowspan + "\"></td>";
			}
			
			html += "</tr>";
			
			$(this.dom).html(html);
			
			$("td", this.dom).each(function(index, el){
				item = opts[index].item;
				itemPos = item.itemPos;
				styler = {};
				
				if (itemPos) {
					itemPos = itemPos.split(" ");
					itemPos[0] && (styler["text-align"] = itemPos[0]);
					itemPos[1] && (styler["vertical-align"] = itemPos[1]);
				}
				
				$(this).css(styler);
				$(item.dom).appendTo(this);
			});
			
			return this;
		},
		calculate: function(items){
			var columns = this.columns,
				colWidth = this.colWidth || [],
				domw = this.width || $(this.dom).width(),
				lastWidth, i, j, idx, len = items.length,
				maxCol, colspan, rowspan, item, w, cw,
				rowIdx = 0, colIdx = 0, rowcols;
			var opts = [];
			
			if (this.singleLine === true) {
				columns = len;
			}
			rowcols = [columns];
			
			if(typeof colWidth === "number"){
				colWidth = [colWidth];
			}
			lastWidth = colWidth[colWidth.length - 1];
			lastWidth = lastWidth < 1 ? domw * lastWidth : lastWidth;//Math.min(1, lastWidth) * lastWidth;
			
			for (i = 0; i < len; i++) {
				item = items[i];
				w = null;
				colspan = item.colspan || 1;
				rowspan = item.rowspan || 1;
				maxCol = rowcols[rowIdx];
				while (maxCol === 0) {
					maxCol = rowcols[++rowIdx];
				}
				if (!maxCol) {
					maxCol = rowcols[rowIdx] = columns;
				}
				
				if (colspan > maxCol) {
					colspan = maxCol;
					//item.colspan = colspan;
				}
				
				if (i === len-1  && maxCol !== 0) {
					colspan = maxCol;
				}
				//if (rowIdx === 0) {
				w = 0;
				for (j = 0; j < colspan; j++) {
					cw = colWidth[(colIdx + j)%columns] || lastWidth;
					cw = cw < 1 ? domw * cw : cw;//Math.min(1, cw) * cw;
					w += cw;
				}
				//}
				
				if (item.rowspan > 0) {
					for (j = 0; j < item.rowspan; j++) {
						idx = rowIdx + j;
						if (!rowcols[idx]) {
							rowcols[idx] = columns;
						}
						rowcols[idx] -= colspan;
					}
				}
				
				opts.push({colspan: colspan, rowspan: rowspan, item: item, rowIdx: rowIdx, width: w});
				
				rowcols[rowIdx] = maxCol -= colspan;
				colIdx += colspan;
				//item.rowIdx = rowIdx;
			}
			
			return opts;
		}
	};
};

//$$.define(tableLayout);
$$.define("layout.TableLayout", ["layout.Layout"], tableLayout);
	
})(window.jQuery, window.com.pouchen);