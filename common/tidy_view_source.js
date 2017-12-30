//*************************************************************************
// HTML Validator
//
//  File: tidyBrowser.js
//  Description: javascript to validate the HTML in the view source window
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

//-------------------------------------------------------------
// Public functions
//-------------------------------------------------------------

var oTidyViewSource;

function onLoadTidyViewSource() {
  /// XXXXXXXXXXXXXXXX
  // oTidyViewSource = new TidyViewSource();
  onLoadTidyUtil(onLoadTidyViewSource2);
  /*
    OK
    onLoadTidyUtil();
    onLoadTidyViewSource2();
  */
}

function onLoadTidyViewSource2() {
  oTidyViewSource = new TidyViewSource();
  oTidyViewSource.start();

  // Hide the validator here to avoid a "splash" effect
  if (!oTidyUtil.getBoolPref("viewsource_enable")) {
    if (oTidyUtil.getBoolPref("viewsource_enable_once")) {
      oTidyUtil.setBoolPref("viewsource_enable_once", false);
    } else {
      oTidyViewSource.hideValidator(true);
    }
  }

  // Initialise the javascript link (else there is an error refuse to execute inline handler because it violates the security policies)
  document.getElementById("body").onresize = viewSourceResize;
  tidyUtilSetOnclick("tidy_hamburger", function() {
    oTidyUtil.onHamburger()
  });
  tidyUtilSetOnclick("tidy_hamburger2", function() {
    oTidyUtil.onHamburger()
  });
  tidyUtilSetOnclick("tidy_cleanup", function() {
    tidyCleanup()
  });
  tidyUtilSetOnclick("tidy_cleanup2", function() {
    tidyCleanup()
  });
  tidyUtilSetOnclick("tidy_online", function() {
    tidyOnline()
  });
  tidyUtilSetOnclick("tidy_online2", function() {
    oTidyViewSource.bForceOnline = true;
    tidyValidateHtml();
  });
  tidyUtilSetOnclick("tidy_gotoline_open", function() {
    tidyGoToLineOpen()
  });
  tidyUtilSetOnclick("tidy_wrapline", function() {
    tidyWrapLine()
  });
  tidyUtilSetOnclick("tidy_optionopen", function() {
    tidyOptionOpen()
  });
  tidyUtilSetOnclick("tidy_hmlpedia", function() {
    tidyHtmlPedia()
  });
  tidyUtilSetOnclick("tidy_gotoline_ok", function() {
    tidyGoToLine()
  });
  tidyUtilSetOnclick("tidy_gotoline_close", function() {
    tidyGoToLineClose()
  });
  tidyUtilSetOnclick("tidy_confirm_ok", function() {
    tidyConfirm()
  });
  tidyUtilSetOnclick("tidy_confirm_close", function() {
    tidyConfirmClose()
  });
  /*
    document.getElementById("source").onscroll = function(ev) {
      // When scrolling left, keep the line numbers always visible
      var s = document.getElementById("source");
      var sl = document.getElementById("source_line");
      sl.style.left = s.scrollLeft + "px";
    };
  */
  document.getElementById("select_frame").onchange = function() {
    oTidyViewSource.changeFrame()
  };
  // Wait that the library is ready before to continue
  oTidyUtil.tidy.waitRunning(tidyValidateHtml);

  // Register the onLoad trigger, when the page is loaded -> validate
  // getBrowser().addEventListener("load", tidyValidateHtml, true);

  // Call the webextension
  tidyWxCallbackQueue();
}

function onUnloadTidyViewSource() {
  onUnloadTidyUtil();
  oTidyViewSource.stop();
  oTidyViewSource = null;
}

function tidyValidateHtml(event) {
  oTidyViewSource.validateHtmlFromNode();
}

/**
 * Open a modal dialog
 */
function tidyOptionOpen() {
  document.getElementById('tidy.iframe.option').src = "tidy_option.html";
  document.getElementById('tidy.option.modal').style.display = "block";
}

/**
 * Close a modal dialog
 */
function tidyOptionClose() {
  document.getElementById('tidy.option.modal').style.display = "none";
  oTidyUtil.closeHamburger();
  // rebuild the filter array
  oTidyUtil.buildFilterArray();
  // remove the color from the lines
  oTidyViewSource.removeColorFromLines();
  // revalidate with the new options
  oTidyViewSource.validateHtmlFromNode();
}

function tidyGoToLineOpen() {
  document.getElementById('tidy.gotoline.modal').style.display = "block";
  var line = document.getElementById("tidy.line")
  line.focus();
  line.value = "";
  // Go to line when pressing enter
  line.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) { //checks whether the pressed key is "Enter"
      tidyGoToLine();
    }
  });
}

function tidyGoToLine() {
  var line = Number(document.getElementById('tidy.line').value);
  tidyGoToLineClose();
  oTidyUtil.closeHamburger();
  window.location = "#l" + line;
}

function tidyGoToLineClose() {
  document.getElementById('tidy.gotoline.modal').style.display = "none";
}

//---------------------------------------------------------------
var confirmLine;

function tidyConfirmOpen(s, line) {
  document.getElementById('tidy.confirm.modal').style.display = "block";
  var l = document.getElementById("tidy.confirm")
  l.innerHTML = s;
  confirmLine = line;
}

function tidyConfirm() {
  tidyConfirmClose();
  oTidyViewSource.onTreeHideConfirmed(confirmLine);
}

function tidyConfirmClose() {
  document.getElementById('tidy.confirm.modal').style.display = "none";
}
//---------------------------------------------------------------

function tidyWrapLine() {
  var code = document.getElementById('source_code_pre');
  var source_line = document.getElementsByClassName('source_line')[0];
  if (code.style.whiteSpace == "pre-wrap") {
    code.style.whiteSpace = "pre";
    code.style.wordWrap = "initial";
    source_line.style.display = "block";
  } else {
    code.style.whiteSpace = "pre-wrap";
    code.style.wordWrap = "break-word";
    source_line.style.display = "none";
  }
  oTidyUtil.closeHamburger();
}

function tidyCleanup() {
  oTidyViewSource.cleanup();
  oTidyUtil.closeHamburger();
}

function tidyHtmlPedia() {
  var help = oTidyViewSource.currentHelpPage.substring(0, oTidyViewSource.currentHelpPage.lastIndexOf('.'));
  var url = "http://www.htmlpedia.org/wiki/" + help;
  window.open(url, "_blank");
}

function tidyOnline() {
  var sHtml = tidy_pref.getHtml();
  oTidyUtil.onlineHtmlValidate(sHtml);
  oTidyUtil.closeHamburger();
}

function tidyHideValidator() {
  var box = document.getElementById("tidy-view_source-box");
  oTidyViewSource.hideValidator(!box.hidden);
}

function tidyViewSourceLoadExplainError() {
  oTidyUtil.selectionOn(document.getElementById("tidy-explain-error"));
}

function tidySelectAll() {}

/** __ tidyUtilAddOption  ___________________________________________
 */
function tidyUtilAddOption(select, sUrl) {
  var option = document.createElement("option");
  option.value = sUrl;
  // The text is limited to 40 characters
  var s = sUrl;
  if (s.length > 40) {
    var s1 = s.substring(0, 18);
    var s2 = s.substring(s.length - 18);
    s = s1 + '...' + s2;
  }
  option.text = s;
  select.add(option);
}

/** __ tidyUtilUpdateDocList  ___________________________________________
 */
function tidyUtilUpdateDocList(docList, main_url) {
  // currentFrame is used in getHtml to get the current frame.
  var select = document.getElementById("select_frame");
  select.options.length = 0;
  // add the main_url on the top
  if (main_url) {
    tidyUtilAddOption(select, main_url);
  }
  for (i = 0; i < docList.length; i++) {
    if (docList[i] != main_url) {
      tidyUtilAddOption(select, docList[i]);
    }
  }
}

//-------------------------------------------------------------
// TidyViewSource
//-------------------------------------------------------------

function TidyViewSource() {
  this.aRow = new Array(); //Data for each row
  this.atoms = new Array(); //Atoms for tree's styles
}

TidyViewSource.prototype = {
  // xul elements
  elementErrorListTbody: null,
  xulScrollBar: null,
  elementErrorHelp: null,

  // Tidy initialized or not yet
  bIsValidated: false,
  bForceOnline: false,
  iLastErrorId: -1,
  sLastError: "-",
  tidyResult: null,
  currentHelpPage: "",
  docType: "",
  currentFrame: null,

  // Style
  STYLE_NORMAL: 1,
  STYLE_RED: 2,
  STYLE_SUMMARY: 3,

  // Tree interface
  rows: 0, // number of rows of the tree
  tree: null, // tree interface

  // Horizontal scrolling
  hScrollPos: 0,
  hScrollMax: 0,
  datapresent: "datapresent",

  /** __ start ________________________________________________________________
   *
   * Initialisation and termination functions
   */
  start: function() {
    oTidyUtil.debug_log('TidyViewSource:initXUL');

    // Tree
    this.elementErrorListTbody = document.getElementById("error_list_tbody");
    this.elementErrorHelp = document.getElementById("error_help");

    /*
    // Set scrollbar
    this.xulScrollBar = document.getElementById("tidy-view_source-tree-scroll");
    setInterval(this.hScrollHandler,100);
    */

    /*
    // Enable the selection in the explain-error (Firefox 1.0 only)
    // Firefox 1.4 raise an exception but it works out of the box
    try
    {
      var selCon = this.xulExplainError.docShell
         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
         .getInterface(Components.interfaces.nsISelectionDisplay)
         .QueryInterface(Components.interfaces.nsISelectionController);
      selCon.setDisplaySelection(Components.interfaces.nsISelectionController.SELECTION_ON);
      selCon.setCaretEnabled(true);
      selCon.setCaretVisibilityDuringSelection(true);
    }
    catch(ex)
    {
    }
    */

    // Menu
    /*
    this.xulMenuHide = document.getElementById('tidy.hide');
    this.xulMenuHide.setAttribute("checked", "false");
    */
  },

  stop: function() {
    this.elementErrorListTbody = null;
  },


  /** __ treeView ________________________________________________________________
   *
   * Implementation of all needed function for the tree interface
   */
  set rowCount(c) {
    throw "rowCount is a readonly property";
  },
  get rowCount() {
    return this.rows;
  },
  getCellText: function(row, col) {
    var id = (col.id ? col.id : col); // Compatibility Firefox 1.0.x
    if (id == "col_line") {
      var line = this.aRow[row].line;
      return line > 0 ? line : "";
    } else if (id == "col_column") {
      var column = this.aRow[row].column;
      return column > 0 ? column : "";
    } else if (id == "col_icon") {
      return " " + this.aRow[row].icon_text;
    } else if (id == "col_data") {
      return this.aRow[row].data.substr(this.hScrollPos).match(/^.*/);
    }
    return null;
  },
  setCellText: function(row, column, text) {},
  setTree: function(tree) {
    this.tree = tree;
  },
  isContainer: function(index) {
    return false;
  },
  isSeparator: function(index) {
    return false;
  },
  isSorted: function() {},
  getLevel: function(index) {
    return 0;
  },
  getImageSrc: function(row, col) {
    var id = (col.id ? col.id : col);
    if (id == "col_icon" && this.aRow[row].icon != null) {
      return "../skin/" + this.aRow[row].icon + ".png";
    } else {
      return null;
    }
  },
  getCellProperties: function(row, col) {
    if (this.aRow[row].type == 4) // error
    {
      // XXXXXXXXXXXXXXXXXX
      // props.AppendElement(this.atoms[this.STYLE_RED]);
    } else if (this.aRow[row].type == 10) // summary
    {
      // props.AppendElement(this.atoms[this.STYLE_SUMMARY]);
      return this.STYLE_SUMMARY;
    }
  },
  getColumnProperties: function(column, elem) {},
  getRowProperties: function(row) {},

  isContainerOpen: function(index) {},
  isContainerEmpty: function(index) {
    return false;
  },
  canDropOn: function(index) {
    return false;
  },
  canDropBeforeAfter: function(index, before) {
    return false;
  },
  drop: function(row, orientation) {
    return false;
  },
  getParentIndex: function(index) {
    return 0;
  },
  hasNextSibling: function(index, after) {
    return false;
  },
  getProgressMode: function(row, column) {},
  getCellValue: function(row, column) {},
  toggleOpenState: function(index) {},
  cycleHeader: function(col, elem) {
    var id = (col.id ? col.id : col); // Compatibility Firefox 1.0.x
    id = id.substring(4);
    if (id == "icon") id = "icon_text";

    if (!elem) {
      elem = col.element;
    }

    var descending = elem.getAttribute("sortDirection") == "ascending";
    elem.setAttribute("sortDirection", descending ? "descending" : "ascending");
    oTidyUtil.sortArray(this.aRow, id, descending);
    this.tree.invalidate();
  },
  selectionChanged: function() {},
  cycleCell: function(row, column) {},
  isEditable: function(row, column) {
    return false;
  },
  performAction: function(action) {},
  performActionOnRow: function(action, row) {},
  performActionOnCell: function(action, row, column) {},

  /** __ addRow ________________________________________________________________
   *
   * Tree utility function : add a row
   */
  addRow: function(_row) {
    // Add the row
    this.rows = this.aRow.push(_row);
    if (_row.data.length > this.hScrollMax) {
      this.sethScroll(_row.data.length);
    }

    var tr, td, t, img, img2;
    tr = document.createElement("TR");
    // XXXXXXXXXXXXXXXX

    var pos = oTidyViewSource.aRow.length - 1;
    tr.onclick = function() {
      oTidyViewSource.onSelect(pos)
    };

    td = document.createElement("TD");
    tr.appendChild(td);
    img = document.createElement("IMG");
    img.src = "../skin/" + _row.icon + ".png";
    td.appendChild(img);
    t = document.createTextNode(" " + _row.icon_text);
    td.appendChild(t);

    td = document.createElement("TD");
    tr.appendChild(td);
    t = document.createTextNode(_row.line);
    td.appendChild(t);

    td = document.createElement("TD");
    tr.appendChild(td);
    t = document.createTextNode(_row.column);
    td.appendChild(t);

    td = document.createElement("TD");
    tr.appendChild(td);
    t = document.createTextNode(_row.data);
    td.appendChild(t);

    td = document.createElement("TD");
    tr.appendChild(td);
    img = document.createElement("IMG");
    img.src = "../skin/hide_16.png";
    img.className = "tidy_icon_hide";
    img.onclick = function() {
      oTidyViewSource.onTreeHide(pos);
    };
    td.appendChild(img);
    // This is to avoid hover display effect
    img2 = document.createElement("IMG");
    img2.src = "../skin/white_16.png";
    img2.className = "tidy_icon_white";
    td.appendChild(img2);
    this.elementErrorListTbody.appendChild(tr);
  },

  /** __ rowCountChanged ______________________________________________________
   *
   * Tree utility function : notice the tree that the row count is changed
   */
  rowCountChanged: function(index, count) {
    if (this.tree) {
      var lvr = this.tree.getLastVisibleRow();
      this.tree.rowCountChanged(index, count);
      // If the last line of the tree is visible on screen, we will autoscroll
      // if (lvr >= index) this.tree.ensureRowIsVisible(this.rows-1);
    }
  },

  /** __ sethScroll ___________________________________________________________
   *
   * Horizontal scrolling function
   */
  sethScroll: function(max) {
    /*
    // Set the new maximum value and page increment to be 5 steps
    var maxpos = this.xulScrollBar.attributes.getNamedItem("maxpos");
    var pageincrement=this.xulScrollBar.attributes.getNamedItem("pageincrement");
    maxpos.value = (max>2 ? max-3 : 0);
    pageincrement.value = max/5;
    this.hScrollMax = max;
    */
  },

  /** __ hScrollHandler _____________________________________________________
   *
   * Horizontal scrolling function : call back function
   */
  hScrollHandler: function() {
    var base = oTidyViewSource;
    var curpos = base.xulScrollBar.attributes.getNamedItem("curpos").value;
    if (curpos != base.hScrollPos) {
      base.hScrollPos = curpos;
      base.tree.invalidate();
    }
  },

  /** __ clear ________________________________________________________________
   *
   * Clear the tree
   */
  clear: function() {
    var oldrows = this.rows;
    if (oldrows > 0) {
      this.rows = 0;
      this.aRow = new Array();
      this.rowCountChanged(0, -oldrows);
      this.hScrollMax = 0;
      this.sethScroll(0);
    }
    // Clear the table rows
    while (this.elementErrorListTbody.firstChild) {
      this.elementErrorListTbody.removeChild(this.elementErrorListTbody.firstChild);
    }
  },

  /** __ validateHtml ________________________________________________________
   *
   * Validate the HTML and add the results in the tree
   */
  validateHtml: function(aHtml, aDocType) {
    oTidyUtil.debug_log('<validateHtml>' + aDocType);

    if (oTidyUtil.tidy.m_bWaiting) {
      console.log("<validateHtml>Cancel : Waiting for Module");

      /*
      // No need to clear, this happens only at startup
      row = new TidyResultRow();
      row.init("W3c Online Validation", 0, 0, 0, unsorted--, null, null, null, "info", oTidyUtil.getString("tidy_cap_info"));
      this.addRow(row);
      */
      return;
    }

    // Set the initialization flag
    this.bIsValidated = true;

    // Load the translation (if not done)
    oTidyUtil.translation();

    // Validate
    var res = new TidyResult();
    var error;
    if (this.bForceOnline) {
      error = res.validate_with_algorithm(aHtml, aDocType, "online");
      this.bForceOnline = false;
    } else {
      error = res.validate(aHtml, aDocType);
    }

    if (error) {
      // For online validation, the result is asynchronous. Clear the list to give a visual feedback
      if (error.async) {
        this.clear();
      } else {
        var aDocType2 = aDocType;
        this.parseError(error, res, aDocType);
        res.updateIcon();
      }
    }
  },

  /** __ parseError ________________________________________________________
   *
   * Parse the error of the validation
   */
  parseError: function(error, res, aDocType) {
    var unsorted = -1;
    var row;

    this.clear();
    var oldrows = this.rowCount;

    // Show an error if the mime/type is not text/html or xhtml
    if (aDocType != "text/html" &&
      aDocType != "application/xhtml+xml") {
      row = new TidyResultRow();
      row.init(oTidyUtil.getString("tidy_not_html") + " " + aDocType, 0, 0, 4, unsorted--, null, null, null, "error", oTidyUtil.getString("tidy_cap_error"));
      this.addRow(row);
    }

    // Show the number of errors/warnings
    row = new TidyResultRow();
    row.init(res.getErrorString(), 0, 0, 10, unsorted--, null, null, null, res.getIcon(), oTidyUtil.getString("tidy_cap_info"));
    this.addRow(row);

    // There is no error message if online failed to validate completely (ex: file too long)
    if (error) {
      var colorLines = new Array();
      var nbColorLines = 0;
      if (res.algorithm == "online") {
        row = new TidyResultRow();
        row.init("W3c Online Validation", 0, 0, 0, unsorted--, null, null, null, "info", oTidyUtil.getString("tidy_cap_info"));
        this.addRow(row);

        if (error.messages) {
          for (var i = 0; i < error.messages.length; i++) {
            row = new TidyResultRow();
            row.online2row(error.messages[i]);
            if (!row.skip) {
              this.addRow(row);
            }
            if (row.line > 0) {
              if (!colorLines[row.line]) nbColorLines++;
              colorLines[row.line] = true;
            }
          }
        } else {
          // Show a message when there is no response from the server. (ex: no connection to Internet, proxy no set, ...)
          row.init("No response from the server", 0, 0, 0, unsorted--, null, null, null, "error", oTidyUtil.getString("tidy_cap_error"));
          this.addRow(row);
        }
      } else {
        var rows = error.value.split('\n');
        for (var o in rows) {
          row = new TidyResultRow();
          row.parse(res.algorithm, rows[o], unsorted);

          if ((res.algorithm == "tidy" && row.type == 0)) {
            row.errorId = unsorted--;
          }
          if (!row.skip) {
            this.addRow(row);
          }
          if (row.line > 0) {
            if (!colorLines[row.line]) nbColorLines++;
            colorLines[row.line] = true;
          }
          i++;
        }
      }
    }
    // save the value for the cleanup button
    this.tidyResult = res;

    this.rowCountChanged(oldrows, (this.rows - oldrows));

    if (oTidyUtil.getBoolPref("highlight_line") && nbColorLines <= oTidyUtil.getIntPref("highlight_max")) {
      this.colorizeLines(colorLines);
    }
    // Load start page
    if (res.iNbError == 0 && res.iNbWarning == 0) {
      this.loadHelp(res.algorithm + "_good.html");
    } else {
      this.loadHelp(res.algorithm + "_start.html");
    }

    // Enable or not the "Hide..." function of the error message
    /*var xulHide = document.getElementById("tidy-view_source-tree-hide");
    xulHide.hidden = !res.isMessageHidable();*/
  },

  /** __ onSelect ____________________________________________________
   *
   * Select function
   */
  onSelect: function(row) {
    // A warning/error line is something like : 'line 10 column 20 ...'
    if (row < 0 || row >= this.rows) return;

    var d = this.aRow[row].data;

    // No line is selected ?
    if (!d) return;

    var src = this.tidyResult.algorithm + "_start.html"
    var line = this.aRow[row].line;
    var col = this.aRow[row].column;

    if (line > 0) {
      if (col < 1) col = 1;
      var arg1 = this.aRow[row].arg1;
      var arg2 = this.aRow[row].arg2;
      var arg3 = this.aRow[row].arg3;

      // build the array of potentially selectable strings
      var aToSelect = new Array();
      if (arg1.length > 0) {
        aToSelect.push(arg1);
        if (arg2.length > 0) {
          aToSelect.push(arg2);
          if (arg3.length > 0) {
            aToSelect.push(arg3);
          }
        }
      }
      this.goToLineCol(line, col, aToSelect);
    }

    var error_id = this.aRow[row].errorId;
    this.iLastErrorId = error_id;
    this.sLastError = this.aRow[row].data;

    if (this.aRow[row].type == 3) {
      var pos1 = d.indexOf('[');
      var pos2 = d.indexOf(']');
      var access_id = d.substring(pos1 + 1, pos2);
      // alert( access_id );
      src = "access_" + access_id + ".html";
    } else if (this.aRow[row].type == 0) {
      src = "info.html";
    } else if (error_id > 0 && error_id < 1200 && this.tidyResult.algorithm == "tidy") {
      // In the tidy HTML 5, the error starts at 200
      src = "tidy_" + (error_id - 200) + ".html";
    } else if (error_id > 0 && error_id < 1200 || this.tidyResult.algorithm == "online") {
      src = this.tidyResult.algorithm + "_" + error_id + ".html";
    } else if (error_id > 0 && error_id > 1200) {
      src = this.tidyResult.algorithm + "_" + error_id.substring(2) + ".html";
    }
    // Enable or not the "Hide..." function of the error message
    /*
    var xulHide = document.getElementById("tidy-view_source-tree-hide");
    xulHide.hidden = !this.aRow[row].isMessageHidable();
    */

    if (this.loadHelp(src) == false || this.aRow[row].type == 0) {
      // If there is no help of this error message. Listen on the load even and try to add
      // the text of the error message in the HTML of the help
      onTidyViewSourceHelpLoad();
    }
  },

  /** __ loadHelp ____________________________________________________
   *
   * load an help file
   */
  loadHelp: function(src) {
    function getHelp(fileName) {
      try {
        var req = new XMLHttpRequest();
        req.open('GET', fileName, false);
        req.send(null);
      } catch (ex) {
        return null;
      }
      if (req.status == 404) {
        return null;
      }
      return req.response;
    }

    if (src.length == 0) return;

    var url = [
      "help/" + oTidyUtil.defaultLanguage + "/" + src,
      "help/en-US/" + src,
      "help/" + oTidyUtil.defaultLanguage + "/no_help.html",
      "help/en-US/no_help.html"
    ];

    for (var i = 0; i < url.length; ++i) {
      var b = getHelp(url[i]);
      if (b != null) {
        this.currentHelpPage = src;
        this.elementErrorHelp.innerHTML = b;
        // return false for no_help.html
        return (i < 2);
      }
    }
    return false;
  },


  /** __ onTreeHide ____________________________________________________
   *
   * Hide a message when right clicking on it
   */
  onTreeHide: function(line) {
    // The inout arguments need to be JavaScript objects
    var data = this.aRow[line].data;
    var errorId = this.aRow[line].errorId;

    tidyConfirmOpen('Are you sure you want to hide the message :\n\n' + data, line);
  },

  onTreeHideConfirmed: function(line) {
    // The inout arguments need to be JavaScript objects
    var errorId = this.aRow[line].errorId;
    if (this.tidyResult.algorithm == "tidy") {
      oTidyUtil.addToFilterArray('t' + errorId);
    } else if (this.tidyResult.algorithm == "online") {
      oTidyUtil.addToFilterArray('o' + errorId);
    } else {
      oTidyUtil.addToFilterArray('s' + errorId); // SP
    }
    oTidyUtil.saveFilterArrayInPref();

    // rebuild the filter array
    oTidyUtil.buildFilterArray();
    // remove the color from the lines
    oTidyViewSource.removeColorFromLines();
    // revalidate with the new options
    oTidyViewSource.validateHtmlFromNode();
  },

  /** __ onTreeCopy ____________________________________________________
   *
   * Copy the current error message in clipboard
   */
  onTreeCopy: function(line) {
    var selection = line;
    var data = "",
      rStart = {},
      rEnd = {};
    var ranges = selection.getRangeCount();
    for (var range = 0; range < ranges; range++) {
      selection.getRangeAt(range, rStart, rEnd);
      if (rStart.value >= 0 && rEnd.value >= 0) {
        for (var row = rStart.value; row <= rEnd.value; row++) {
          data += this.aRow[row].getString() + "\n";
        }
      }
    }
    if (oTidyUtil.getBoolPref("debug")) {
      // In debug mode, show the ID and the desc of the error
      var aErrorDesc = {
        value: ""
      };
      oTidyUtil.tidy.getErrorDescription(this.iLastErrorId, aErrorDesc);

      data += "ErrorId: " + this.iLastErrorId + " / Desc: " + aErrorDesc.value;
    }

    if (data) {
      // clipboard helper
      try {
        const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
        clipboardHelper.copyString(data);
      } catch (e) {
        // do nothing, later code will handle the error
        dump("Unable to get the clipboard helper\n");
      }
    }
  },

  /** __ onTreeSelectAll ____________________________________________________
   *
   * Select all
   */
  onTreeSelectAll: function() {
    // return this.xulTree.view.selection.selectAll();
  },

  /** __ validateHtmlFromNode ___________________________________________
   *
   * Get the HTML from the view source tree then validate it.
   */
  validateHtmlFromNode: function() {
    oTidyUtil.debug_log('<validateHtmlFromNode>');
    var html = tidy_pref.getHtml();
    // html is not defined in FF57 at startup
    if (html) {
      // Reset the scrolling
      var s = document.getElementById("source");
      s.scrollLeft = 0;
      s.scrollTop = 0;
      oTidyUtil.insertHtmlAndLines(html, 'source_code_pre', 'source_line_pre');
      var docType = "text/html";
      this.validateHtml(html, docType);
    } else {
      oTidyUtil.debug_log('<validateHtmlFromNode>No html');
    }
    oTidyUtil.debug_log('</validateHtmlFromNode>');
  },

  /** __ cleanup ___________________________________________
   *
   * Call content script to get back the html
   */
  cleanup: function() {
    oTidyUtil.debug_log('<cleanup>');
    var html = tidy_pref.getHtml();
    this.cleanupDialog(html);
  },

  /** __ cleanupDialog ___________________________________________
   *
   * Call by the content script to show the cleanup dialog
   */
  cleanupDialog: function(sHtml) {
    oTidyUtil.cleanupDialog(oTidyViewSource.tidyResult, sHtml, window.arguments);
  },

  /** __ goToLineCol ____________________________________________________
   *
   * Go to the line and col in the HTML source
   *
   * @param line : (number) line
   * @param col  : (number) column
   */
  goToLineCol: function(line, col, aToSelect) {
    oTidyUtil.debug_log('<goToLineCol>');
    // Simulate nagivation to anchor #l<lineNumber>
    var anchor = "#l" + line;
    location.hash = anchor;

    // remove previous line/col "focus"
    var af = document.getElementsByClassName('focus');
    for (var i = 0; i < af.length; i++) {
      // There should be only 1
      var f = af[i];
      var parent = f.parentElement;
      var textnode = document.createTextNode(f.textContent);
      parent.replaceChild(textnode, f);
    }

    // Hightlight the character at line/col in red
    var s = document.getElementById("source_code_pre").innerHTML;
    // Loop in all the characters of the html.
    // Count the line and column.
    // Skip when in html span tag (added for syntax color)
    var res = "";
    var currentLine = 1;
    var currentCol = 0;
    var bInTag = false;
    for (var i = 0, len = s.length; i < len; i++) {
      var c = s[i];
      if (c == '<') {
        bInTag = true;
      } else if (c == '&') {
        // Entity like &lt;
        do {
          i++;
          var c2 = s[i];
          c += c2;
        } while (c2 != ';')
      }
      if (!bInTag) {
        currentCol++;
      }
      if (!bInTag && currentLine == line && currentCol == col) {
        res += "<span class='focus'>" + c + "</span>";
      } else {
        res += c;
      }
      if (c == '\n') {
        currentLine++;
        currentCol = 0;
      } else if (c == '>') {
        bInTag = false;
      }
    }
    document.getElementById("source_code_pre").innerHTML = res;
    af = document.getElementsByClassName('focus');
    if (af.length == 1) {
      // scroll the element in the top/left corner of the container
      var container = document.getElementById("source");
      const element = af[0];
      const x = element.offsetLeft - container.offsetLeft - container.clientWidth / 8;
      const y = element.offsetTop - container.offsetTop - container.clientHeight / 8;
      container.scrollLeft = x;
      container.scrollTop = y;
    }
  },


  /** __ hideValidator ____________________________________________________
   *
   * Hide the html validator
   *
   * @param bHide : (boolean) hide or not hide
   */
  hideValidator: function(bHide) {
    var footer = document.getElementById("footer");
    var dragbar = document.getElementById("dragbar_h1");
    if (bHide) {
      footer.style.display = 'none';
      dragbar.style.display = 'none';
    } else {
      footer.style.display = 'block';
      dragbar.style.display = 'block';
    }
    // this.xulMenuHide.setAttribute("checked", !bHide);

    // The validation has already been done ?
    if (!bHide && !this.bIsValidated) {
      oTidyViewSource.validateHtmlFromNode();
    } else {
      oTidyViewSource.loadHelp(oTidyViewSource.currentHelpPage);
    }
  },

  /** __ colorizeLines ______________________________________________________
   *
   * Color a array of lines
   */
  colorizeLines: function(colorLines) {

    if (colorLines.length == 0) return;

    var s = document.getElementById("source_code_pre").innerHTML;

    // Loop in all the characters of the html.
    // Count the line and add a color when before and after the line
    var res = "";
    var currentLine = 1;
    var bFirstCharacter = true;
    var tagLevel = 0;
    var tagList = [];
    var tagInProgress = false;

    function add_text(tag) {
      for (l = 1; l <= tagLevel; l++) {
        res += "</span>";
      }
      // console.log('add_text('+tagLevel+'): ' + tag);
      res += tag;
      for (l = 1; l <= tagLevel; l++) {
        res += tagList[l];
      }
    }

    // console.log('start: ' + s);
    for (var i = 0, len = s.length; i < len; i++) {
      if (bFirstCharacter && colorLines[currentLine]) {
        add_text("<span class='hl_error'>");
      }
      bFirstCharacter = false;

      var c = s[i];
      if (c == '<') {
        var c2 = s[i + 1];
        if (c2 == '/') {
          tagList[tagLevel] = null;
          tagLevel--;
          // console.log('end  line' + currentLine +' tag(' + tagLevel + ') ');
        } else {
          tagInProgress = true;
          tagList[tagLevel + 1] = c;
        }
      } else if (tagInProgress) {
        tagList[tagLevel + 1] += c;
        if (c == '>') {
          tagLevel++;
          tagInProgress = false;
          // console.log('start line' + currentLine +' tag(' + tagLevel + ') ' + tagList[tagLevel]);
        }
      }
      if (c == '\n') {
        if (colorLines[currentLine]) {
          add_text("</span>");
        }
        currentLine++;
        bFirstCharacter = true;
      }
      res += c;
    }
    // Last line
    if (colorLines[currentLine]) {
      add_text("</span>");
    }

    // console.log('end: ' + res);
    document.getElementById("source_code_pre").innerHTML = res;
  },

  /** __ changeFrame  ___________________________________________
   */
  changeFrame: function() {
    // currentFrame is used in getHtml to get the current frame.
    // XXXXXXXXXXXXXXXX Todo
    var url = document.getElementById("select_frame").value;
    // Call tidy_devtools
    tidyWxUpdateHtmlReport(url, true);
  },

  /** __ removeColorFromLines ___________________________________________
   *
   * Remove the color added to the lines
   */
  removeColorFromLines: function() {
    /*
    var doc = document;
    var elem = null;

    while ((elem = doc.getElementById("__firefox-tidy-id"))) {
      var child = null;
      var docfrag = doc.createDocumentFragment();
      var next = elem.nextSibling;
      var parent = elem.parentNode;
      while ((child = elem.firstChild)) {
        docfrag.appendChild(child);
      }
      parent.removeChild(elem);
      parent.insertBefore(docfrag, next);
    }
    */
  },
}

//---------------------------------------------------------------------------
// Copy from browser.js
function tidyFindParentNode(node, parentNode) {
  if (node && node.nodeType == Node.TEXT_NODE) {
    node = node.parentNode;
  }
  while (node) {
    var nodeName = node.localName;
    if (!nodeName)
      return null;
    nodeName = nodeName.toLowerCase();
    if (nodeName == "body" || nodeName == "html" ||
      nodeName == "#document") {
      return null;
    }
    if (nodeName == parentNode)
      return node;
    node = node.parentNode;
  }
  return null;
}


function tidyExplainErrorOnClick(event) {
  var target = event.target;
  var linkNode;

  var local_name = target.localName;

  if (local_name) {
    local_name = local_name.toLowerCase();
  }

  switch (local_name) {
    case "a":
    case "area":
    case "link":
      if (target.hasAttribute("href"))
        linkNode = target;
      break;
    default:
      linkNode = tidyFindParentNode(event.originalTarget, "a");
      // <a> cannot be nested.  So if we find an anchor without an
      // href, there is no useful <a> around the target
      if (linkNode && !linkNode.hasAttribute("href"))
        linkNode = null;
      break;
  }
  if (linkNode && event.button == 0) {
    openUILinkIn(linkNode.href, "window");
    // openNewWindowWith(linkNode.href, linkNode, false);
    event.preventDefault();
    event.preventBubble();
    return true;
  }
  return true;
}

/*
// Copy from viewsource.js
function wrapLongLines()
{
  var myWrap = window.content.document.body;

  if (myWrap.className != 'wrap')
    myWrap.className = 'wrap';
  else myWrap.className = '';

  if (gPrefs){
    try {
      if (myWrap.className == '') {
        gPrefs.setBoolPref("view_source.wrap_long_lines", false);
      }
      else {
        gPrefs.setBoolPref("view_source.wrap_long_lines", true);
        oTidyUtil.setBoolPref( "show_line_number", false );
        oTidyViewSource.xulMenuShowLineNumber.setAttribute("checked", false );
        if( oTidyUtil.getBoolPref("warning_line_number") )
        {
          // Show a warning the 1rst time line numbering is disabled
          var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                              .getService(Components.interfaces.nsIPromptService);
          var result = promptService.alert( window,oTidyUtil.getString("tidy_validator"),oTidyUtil.getString("tidy_wrap_msg") );
          oTidyUtil.setBoolPref( 'warning_line_number', false );
        }
      }
    } catch (ex) {
    }
  }
}
*/

function onTidyViewSourceHelpLoad() {
  if (oTidyViewSource != null) {
    try {
      // Try to put the message in the HTML if no help, inside the item with the "message" id
      var doc = this.elementErrorHelp;
      var node = doc.getElementById("message");
      var t = doc.createTextNode(oTidyViewSource.sLastError);
      node.appendChild(t);
    } catch (ex) {}
  }
}

//---------------------------------------------------------------------------------------

var i = 0;
var DRAGBAR_SIZE = 3;
var eSource = document.getElementById("source");
var eFooter = document.getElementById("footer");
var eErrorList = document.getElementById("error_list");
var eFooterToolbar = document.getElementById("footer_toolbar");
var iLastHeight = 0;
var iLastWidth = 0;

function is_horizontal_mode() {
  if (document.getElementById("dragbar_v1") == null) {
    return true;
  } else {
    return false;
  }
}
var isHorizontalMode = is_horizontal_mode();

function debug(l) {
  console.log(l);
}

function get_html_height() {
  var html = document.documentElement;
  // return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  return html.clientHeight;
}

function get_html_width() {
  var html = document.documentElement;
  // return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  return html.clientWidth;
}

//
function dragbar_resize_h1(y) {
  var height = get_html_height();
  debug("dragbar_resize_h1 " + y + "," + height);
  eSource.style.height = y + "px";
  eFooter.style.top = y + DRAGBAR_SIZE + "px";
  var h = height - y - DRAGBAR_SIZE + "px";
  eFooter.style.height = h;
  document.getElementById("dragbar_v1").style.height = h;
  document.getElementById("error_detail").style.height = h;

  var w = eErrorList.offsetWidth;
  dragbar_resize_v1(w);
}

function dragbar_resize_h2(y) {
  var h = y - eFooterToolbar.offsetHeight;
  if (h > 0) {
    debug("dragbar_resize_h2 " + y + "," + h);
    eErrorList.style.height = h + "px";
  }
}

function dragbar_resize_v1(x) {
  var width = eFooter.clientWidth;
  debug("dragbar_resize_v1 " + x + "," + width);
  eErrorList.style.width = x + "px";
  document.getElementById("error_detail").style.width = width - x - DRAGBAR_SIZE - 1 + "px";
}

function dragbar_resize_v2(x) {
  var width = get_html_width();
  if (width > 0) {
    debug("dragbar_resize_v2 " + x + "," + width);
    eSource.style.width = x + "px";
    eFooter.style.width = width - x - DRAGBAR_SIZE - 1 + "px";

    var y = eFooterToolbar.offsetHeight + eErrorList.offsetHeight;
    dragbar_resize_h2(y);
  }
}

if (!isHorizontalMode) {
  function viewSourceResize() {
    // Keep the height of the footer constant
    var h2 = get_html_height() - eFooter.offsetHeight - DRAGBAR_SIZE;
    dragbar_resize_h1(h2);
    // keep the witdh of error_list constant
    var w = eErrorList.offsetWidth;
    dragbar_resize_v1(w);
  }
  document.getElementById("dragbar_v1").onmousedown = function(e) {
    e.preventDefault();
    debug("v1 mousedown " + i++);
    window.onmousemove = function(e) {
      dragbar_resize_v1(e.pageX);
    };
    debug("v1 mouseDown : leaving");
  };

  document.getElementById("dragbar_h1").onmousedown = function(e) {
    e.preventDefault();
    debug("h1 mousedown " + i++);
    window.onmousemove = function(e) {
      dragbar_resize_h1(e.pageY);

    };
    debug("h1 mouseDown : leaving");
  };
} else {
  function viewSourceResize() {
    // Keep the height of the footer constant
    // Previous formula inverted
    var width = get_html_width();
    var widthp = eSource.offsetWidth + eFooter.offsetWidth + DRAGBAR_SIZE + 1;
    var diff = width - widthp;
    var w = eSource.offsetWidth;
    if (diff > 0 && w < width / 2) {
      w = Math.min(w + diff, width / 2);
    }
    if (diff < 0 && w > width / 2) {
      w = Math.max(w + diff, width / 2);
    }
    dragbar_resize_v2(w);
  }
  document.getElementById("dragbar_v2").onmousedown = function(e) {
    e.preventDefault();
    debug("v2 mousedown " + i++);
    window.onmousemove = function(e) {
      dragbar_resize_v2(e.pageX);
    };
    debug("v2 mouseDown : leaving");
  };

  document.getElementById("dragbar_h2").onmousedown = function(e) {
    e.preventDefault();
    debug("h2 mousedown " + i++);
    window.onmousemove = function(e) {
      dragbar_resize_h2(e.pageY);
    };
    debug("h2 mouseDown : leaving");
  };
}

window.onmouseup = function(e) {
  debug("onmouseup");
  window.onmousemove = null;
};

window.onload = function(e) {
  onLoadTidyViewSource();
}

// Init syntax highlighting
hljs.initHighlightingOnLoad();
