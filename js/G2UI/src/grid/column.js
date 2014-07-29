(function($, $$){

var column = function(uicontrol){
	return {
		extend: uicontrol,
		ctor: function(opts){
			this._initColOpts();
			
			if (this.columns) {
				var colLev = this.colLev + 1,
					grid = this.grid,
					maxLev = grid.maxColLev;
					
				if (colLev >= maxLev) {
					grid.maxColLev = colLev + 1;
				}
				
				this.children = $$.create("grid.head.Container", {
					renderTo: this,
					//grid: this,
					itemCfg: {
						colLev: colLev,
						groupCol: this,
						grid: grid
					},
					items: this.columns
				});
				
				this.columns = this.children.items;
			} else {
				if (this.sortable) {
					this.enableSort(true);
				}
				
				$(".grid-editor tr", this.grid.dom).append("<td col-index=\"" + this.index + "\"></td>");
			}
			
			this.initMenu();
			//this.itemManager();
		},
		beginEdit: function(rowIndex){
			this.initEditor(rowIndex || 0);
		},
		endEdit: function(){
			var editor = this.editor;
			if (editor && editor.$instance) {
				$(editor.dom).css({
					left: -99999,
					top: -99999
				});
			}
		},
		initEditor: function(rowIndex){
			var editor = this.editor;
			if (editor && !editor.$instance) {
				this._initEditorProxy(rowIndex);
			} else if (editor) {
				this._replaceEditor(rowIndex);
			}
		},
		_initEditorProxy: function(rowIndex){
			var editor = this.editor;
			if (typeof editor === "string") {
				editor = this.editor = {xtype: editor};
			}
			
			var el = this,
				grid = el.grid;
			
			editor.renderTo = $(".grid-editor [col-index='" + this.index + "']", grid.dom);
			editor = el.editor = $$.create(editor.xtype || "form.Input", editor);
			
			editor.bind("onSetData", function(value){
				el.grid.input(null, el, value);
			}, el);
			
			var context = grid._getTdContext(grid.getRow(rowIndex), el.field);
			$(editor.input).removeClass("grid-td-error grid-td-change").addClass(context.css)
				.attr("title", context.errMsg).bind({
					"focus": function(){
						grid.focused = el;
						grid.toFocused = null;
					}
				});
			
			$(editor.dom).addClass("grid-column-editor").click(function(){
				grid.focus(el);
			});
			el._replaceEditor(rowIndex);
		},
		_replaceEditor: function(rowIndex){
			var grid = this.grid,
				editor = this.editor,
				td = grid.getTd(rowIndex, this),
				pos = td.offset(),
				w = td.width();
			
			editor.setWidth(w);
			editor.setValue(grid.getColumnData(grid.getRow(rowIndex), this.field), this);
			editor.refreshShow();
			/*if (!pos) {
				this.endEdit();
			} else {
				editor.setWidth(w);
				$(editor.dom).css({
					left: pos.left,
					top: pos.top
				});
				
				editor.setValue(grid.getColumnData(rowIndex, this.field), this);
				editor.refreshShow();
			}*/
		},
		initMenu: function(){
			if (this.groupCol) {
				return;
			}
			var el = this;
			$(this.titleDom).parent().bind({
				"mouseover": function(){
					//if (el.sortable === true || el.locked === true) {
					el._showDropDownBtn();
					//}
				},
				"mouseout": function(){
					var menu = el.$self._dropDownMenu;
					
					if (!menu || menu.el !== el) {
						el._hideDropDownBtn();
					}
				}
			});
		},
		_showDropDownBtn: function(){
			var el = this,
				btn = this._dropDownBtn;
			if (!btn) {
				btn = this._dropDownBtn = $("<div class=\"grid-column-dropdown-btn\"></div>").appendTo($(this.titleDom).parent())[0];
				$(btn).height(this.grid.colHeight).bind({
					"click": function(){
						el._showDropDownMenu();
						return false;
					},
					"contextmenu": function(){
						return false;
					}
				});
			}
			
			//$('.grid-column-dropdown-btn', this.grid.dom).hide();
			$(btn).show();
		},
		_showDropDownMenu: function(){
			var el = this,
				menu = this.$self._dropDownMenu,
				btn = this._dropDownBtn,
				btnPos  = $(btn).offset();
			
			menu && menu.el && menu.el._dropDownBtn && $(menu.el._dropDownBtn).hide();
			
			var menuHtml = "";
			
			if (this.sortable === true) {
				menuHtml += "<div handler=\"sortASC\" class=\"menu-item menu-item-sort-asc\">Sort Ascending</div>"+
							"<div handler=\"sortDESC\" class=\"menu-item menu-item-sort-desc\">Sort Descending</div>"+
							"<div handler=\"cancelSort\" class=\"menu-item menu-item-sort-cancel\">Cancel Sort</div>";
			}
			
			menuHtml += "<div handler=\"lock\" class=\"menu-item menu-item-lock\">Lock</div><div handler=\"unlock\" class=\"menu-item menu-item-unlock\">Unlock</div>";
			
			if (menu) {
				menu.el = el;
			}
			
			if (menuHtml && !menu) {
				menu = this.$self._dropDownMenu = $("<div class=\"grid-column-dropdown-menu\"></div>").appendTo($$.getBody())[0];
				menu.el = el;
				
				$(menu).bind({
					"mouseover": function(){
						this.el._showDropDownBtn();
					}
				});
				
				$(window).bind({
					"click": function(){
						$(menu).hide();
						if (menu.el) {
							menu.el._hideDropDownBtn();
							menu.el = null;
						}
					}
				});
			}
			
			$(menu).html(menuHtml).css({
				left: Math.min($(window).width() - $(menu).width(), btnPos.left),
				top: btnPos.top + this.grid.colHeight
			});
			
			$(menu).find(".menu-item").click(function(){
				var handler = $(this).attr("handler");
				handler && el[handler] && el[handler]();
			});
			
			menu && $(menu).show();
		},
		_hideDropDownBtn: function(){
			var btn = this._dropDownBtn;
			btn && $(btn).hide();
		},
		enableSort: function(init){
			if (init === true || !this.sortable) {
				var el = this;
				
				$(this.titleDom).parent().bind({
					"click.column.sort": function(){
						el.sort();
					},
					"contextmenu.column.sort": function(){
						el.cancelSort();
						return false;
					}
				});
				
				this.sortable = true;
			}
		},
		disableSort: function(){
			if (this.sortable) {
				$(this.titleDom).parent().unbind("click.column.sort").unbind("contextmenu.column.sort");
				this.sortable = false;
			}
		},
		sort: function(){
			var grid = this.grid;
			grid._sortCol(this);
		},
		refreshSortView: function(){
			var sortDir = this.sortDir,
				idx = this.sortIdx;
				
			if (!sortDir || (!idx && idx !== 0)) {
				$(this.sortTipDom).empty();
			} else {
				$(this.sortTipDom).html("-" + (idx+1) + "-" + sortDir);
			}
		},
		cancelSort: function(){
			this.grid._cancelSortCol(this);
		},
		lock: function(dir){
			this.grid.lock(this, dir, "column");
		},
		unlock: function(){
			this.grid.unlock(this, "column");
		},
		_initColOpts: function(){
			var sortable = this.sortable,
				grid = this.grid;
			
			$(this.dom).addClass("grid-column-column");
			this.index = grid.maxColIndex++;
			
			//sortable = sortable !== false;
			
			sortable = typeof sortable === "boolean" ? sortable : grid.sortable !== false;
			this.sortable = sortable;
			
			this.setTitle();
		},
		setTitle: function(title){
			var titleDom = this.titleDom, pdom,
				changed = title && title !== this.title;
			if (!titleDom) {
				if (!title) {
					title = this.title;
				}
				
				pdom = this.dom;
				if (this.columns) {
					pdom = $("<div></div>").appendTo(pdom)[0];
				}
				$(pdom).addClass("grid-column-title");
				
				titleDom = $("<span class=\"grid-column-text\" title=\"" + title + "\">" + title + "</span>").appendTo(pdom)[0];
				
				this.sortTipDom = $("<span class=\"grid-column-sort\"></span>").appendTo(pdom)[0];
				this.titleDom = titleDom;
				this.outerDom = pdom;
			} else if (changed) {
				$(titleDom).html(title);
				$(titleDom).attr({title: title});
			}
			
			if (changed) {
				this.title = title;
			}
			
			return this;
		},
		defCfg: {
			title: undefined,
			head: undefined,
			field: undefined,
			preColumn: undefined,
			iconCls: undefined,
			width: undefined,
			theight: 25,
			dheight: 20,
			rowspan: 1,
			colspan: 1,
			dAlign: "left",
			tAlign: "center",
			sortable: true,
			resizable: false,
			hidden: false,
			formatter: undefined,
			styler: undefined,
			//lockDir: undefined,
			editor: undefined,
			data: undefined,
			items: undefined,
			grid: undefined,
			owner: undefined
		},
		setWidth: function(width){
			this.width = width;
			var items = this.items;
			for (var i = 0, ii = items.length; i < ii; i++) {
				(items[i].setWidth || Object)(width);
			}
			this.editor && (this.editor.setWidth || Object)(width);
		}
	};
};

$$.define("grid.column.Column", ["core.UIControl"], column);
	
})(window.jQuery, window.com.pouchen);