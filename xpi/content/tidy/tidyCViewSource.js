/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { utils: Cu, interfaces: Ci, classes: Cc } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "BrowserUtils",
  "resource://gre/modules/BrowserUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "DeferredTask",
  "resource://gre/modules/DeferredTask.jsm");

var global = this;

/**
 * tidyCViewSource should be loaded in the <xul:browser> of the
 * view source window, and initialized as soon as it has loaded.
 */
var tidyCViewSource = {

  /**
   * These are the messages that tidyCViewSource is prepared to listen
   * for. If you need tidyCViewSource to handle more messages, add them
   * here.
   */
  messages: [
    "TidyViewSource:getHtmlFromNode",
    "TidyViewSource:goToLineCol",
    "TidyViewSource:colorizeLines",
  ],

  /**
   * This should be called as soon as this frame script has loaded.
   */
  init() {
    this.messages.forEach((msgName) => {
      addMessageListener(msgName, this);
    });
  },

  /**
   * This should be called when the frame script is being unloaded,
   * and the browser is tearing down.
   */
  uninit() {
    this.messages.forEach((msgName) => {
      removeMessageListener(msgName, this);
    });
  },

  /**
   * Anything added to the messages array will get handled here, and should
   * get dispatched to a specific function for the message name.
   */
  receiveMessage(msg) {
    let data = msg.data;
    let objects = msg.objects;
    this.debug_log( '<receiveMessage> : ' + msg.name );
    switch(msg.name) {
      case "TidyViewSource:getHtmlFromNode":
        this.getHtmlFromNode(data.callback);
        break;
      case "TidyViewSource:goToLineCol":
        this.goToLineCol(data.line, data.col, data.aToSelect);
        break;
      case "TidyViewSource:colorizeLines":
        this.goToLineCol(data.colorLines);
        break;
    }
  },

  /**
   * Any events should get handled here, and should get dispatched to
   * a specific function for the event type.
   */
  handleEvent(event) {
    switch(event.type) {
      case "pageshow":
        this.onPageShow(event);
        break;
    }
  },

  /** __ debug_log __________________________________________________________
   */
  debug_log(s) {
	dump( "<tidyCViewSource>" + s );
  },

  /** __ getHtmlFromNode _________________________________________________
   *
   * Build the HTML from the text of all the source view nodes
   * This is done to avoid another network request
   */
  getHtmlFromNode: function(callback)
  {
	this.debug_log( '<getHtmlFromNode>' );

	var viewsource = this.getParentPre();
    var sHtml = "";
    var pre;

    //
    // Walk through each of the text nodes
    //
    for (var i = 0; i < viewsource.childNodes.length; i++ )
    {
      pre = viewsource.childNodes[i];
      if( pre.id!="line12345678" )
      {
		// NodeFilter.SHOW_TEXT == 4
        var treewalker = content.document.createTreeWalker(pre, 4, null, false);

        for( var textNode = treewalker.firstChild(); textNode; textNode = treewalker.nextNode())
        {
          sHtml = sHtml + textNode.data;
        }
      }
    }
    sendAsyncMessage("TidyViewSource:"+callback, { html: sHtml, docType: content.document.contentType });
  },


  /** __ colorizeLines ______________________________________________________
   *
   * Color a array of lines
   */
  colorizeLines: function( colorLines )
  {
    for (var line in colorLines)
    {
      this.colorizeOneLine( parseInt(line) );
    }
  },

  /** __ colorizeOneLine ____________________________________________________
   *
   * Color one line of the HTML source
   *
   * @param line : (number) line number
   */
  colorizeOneLine: function( line )
  {
    // This code is inspired by the goToLine of viewSource.js
    // it is the same, except that the range is highlighted
    var viewsource = this.getParentPre();
    var pre;
    for (var lbound = 0, ubound = viewsource.childNodes.length; ; ) {
      var middle = (lbound + ubound) >> 1;
      pre = viewsource.childNodes[middle];

      var firstLine = parseInt(pre.id.substring(4));

      if (lbound == ubound - 1) {
        break;
      }

      if (line >= firstLine) {
        lbound = middle;
      } else {
        ubound = middle;
      }
    }

    var result = {};
    // E10S_problem
    // This function is now in viewSource-content.js and is unaccessible from here...
    // var found = findLocation(pre, line, null, -1, false, result);
    var found = false;

    if (!found) {
      return;
    }

    this.colorizeRange(result.range);
  },

  /** __ colorizeRange ____________________________________________________
   *
   * Color a range of the HTML source
   *
   * @param range : (range) the range
   */
  colorizeRange: function( range )
  {
    var doc = content.document;
    var node = doc.createElement("b");
    node.setAttribute("style", "background-color: #DDDDFF;");
    node.setAttribute("id", "__firefox-tidy-id");


    // Firefox 20 - new line numbering
    var parent = range.startContainer.parentNode;
		range.setStart( parent.nextSibling, 0 );

		// This code is inspired by the highlight function of browser.js
		var startContainer = range.startContainer;
		var startOffset = range.startOffset;
		var endOffset = range.endOffset;
		var docfrag = range.extractContents();
		node.appendChild(docfrag);
		// insertAfter
		parent.parentNode.insertBefore(node, parent.nextSibling);

    return node;
  },

  /** __ removeColorFromLines ___________________________________________
   *
   * Remove the color added to the lines
   */
  removeColorFromLines: function()
  {
    var doc = content.document;
    var elem = null;

    while ((elem = doc.getElementById("__firefox-tidy-id")))
    {
      var child = null;
      var docfrag = doc.createDocumentFragment();
      var next = elem.nextSibling;
      var parent = elem.parentNode;
      while((child = elem.firstChild))
      {
        docfrag.appendChild(child);
      }
      parent.removeChild(elem);
      parent.insertBefore(docfrag, next);
    }
    return;
  },

  /** __ getParentPre ___________________________________________________
   *
   * Get the parent of all pre tags
   */
  getParentPre: function()
  {
    var parent = content.document.getElementById('parent_pre');
    if( parent==null )
    {
      parent = content.document.body;
    }
    return parent;
  },

  /** __ goToLineCol ____________________________________________________
   *
   * Go to the line and col in the HTML source
   *
   * @param line : (number) line
   * @param col  : (number) column
   */
  goToLineCol: function(line, col, aToSelect)
  {
    var viewsource = this.getParentPre();

    var pre;
    for (var lbound = 0, ubound = viewsource.childNodes.length; ; ) {
      var middle = (lbound + ubound) >> 1;
      pre = viewsource.childNodes[middle];

      var firstLine = parseInt(pre.id.substring(4));

      if (lbound == ubound - 1) {
        break;
      }

      if (line >= firstLine) {
        lbound = middle;
      } else {
        ubound = middle;
      }
    }

    var result = {};
    var found = this.getLineColRange(pre, line, col, aToSelect, result);

    if (!found) {
      return false;
    }

    var selection = content.getSelection();
    selection.removeAllRanges();
    // selection.QueryInterface(Components.interfaces.nsISelectionPrivate).interlinePosition = true;
    selection.addRange(result.range);
    if (!selection.isCollapsed)
    {
      selection.collapseToEnd();

      var offset = result.range.startOffset;
      var node = result.range.startContainer;
      if (offset < node.data.length) {
        // The same text node spans across the "\n", just focus where we were.
        selection.extend(node, offset);
      }
      else {
        // There is another tag just after the "\n", hook there. We need
        // to focus a safe point because there are edgy cases such as
        // <span>...\n</span><span>...</span> vs.
        // <span>...\n<span>...</span></span><span>...</span>
        node = node.nextSibling ? node.nextSibling : node.parentNode.nextSibling;
        selection.extend(node, 0);
      }
    }

    var selCon = this.getSelectionController();
    selCon.setDisplaySelection(Components.interfaces.nsISelectionController.SELECTION_ON);
    selCon.setCaretEnabled(true);
    selCon.setCaretVisibilityDuringSelection(true);

    // Scroll the beginning of the line into view.
    selCon.scrollSelectionIntoView(
      Components.interfaces.nsISelectionController.SELECTION_NORMAL,
      Components.interfaces.nsISelectionController.SELECTION_FOCUS_REGION,
      true);

    gLastLineFound = line;

    // Commented - 2010-09-04 for FF4
    /*
      // needed to avoid problem in Firefox
      var statusbar = content.document.getElementById("statusbar-line-col");
      if( statusbar )
      {
         statusbar.label = getViewSourceBundle().getFormattedString("statusBarLineCol", [line, 1]);
      }
    */
    return true;
  },


  /** __ getLineColRange ____________________________________________________
   *
   * get the range for a line and a column
   *
   * @param
   */
  getLineColRange : function (pre, line, col, aToSelect, result)
  {
    var curLine = parseInt(pre.id.substring(4));

    //
    // Walk through each of the text nodes and count newlines.
    // NodeFilter.SHOW_TEXT = 4
    var treewalker = content.document
        .createTreeWalker(pre, 4, null, false);

    //
    // The column number of the first character in the current text node.
    //
    var firstCol = 1;

    var found = false;
    for (var textNode = treewalker.firstChild();
         textNode && !found;
         textNode = treewalker.nextNode())
    {
      //
      // \r is not a valid character in the DOM, so we only check for \n.
      //
      var lineArray = textNode.data.split(/\n/);
      var lastLineInNode = curLine + lineArray.length - 1;

      //
      // Check if we can skip the text node without further inspection.
      //

      var nextFirstCol = firstCol;
      if (lineArray.length > 1)
      {
        nextFirstCol = 1;
      }
      nextFirstCol += lineArray[lineArray.length - 1].length;

      if(
          lastLineInNode < line ||
          ( lastLineInNode==line && nextFirstCol<=col )
        )
      {
        firstCol = nextFirstCol;
        curLine = lastLineInNode;
        continue;
      }

      //
      // curPos is the offset within the current text node of the first
      // character in the current line.
      //
      for (var i = 0, curPos = 0;
           i < lineArray.length;
           curPos += lineArray[i++].length + 1)
      {

        if (i > 0)
        {
          curLine++;
          firstCol = 1;
        }

        if (curLine == line && !("range" in result))
        {
          // The default behavior is to select 1 character.
          result.range = content.document.createRange();
          var pos = curPos+col-firstCol;
          result.range.setStart(textNode, pos);
          result.range.setEnd(textNode, pos+1);
          found = true;


          // Check if the text does not contain a selectable string

          // get first the maximum len of the selectable string
          var j, len, maxlen = 0;
          for( j=0; j<aToSelect.length; j++ )
          {
            len = aToSelect[j].length;
            if( len>maxlen ) maxlen = len;
          }

          // get the rest of the text of the node where the text starts
          var textAfter = textNode.data.substr( pos );

          // we will potentially look 2 node further
          for ( var n=0; n<3; n++ )
          {
            // Search in the selectable string array
            for( j=0; j<aToSelect.length; j++ )
            {
              var s = aToSelect[j].toLowerCase();
              len = s.length;
              var s2 = textAfter.substr( 0, len ).toLowerCase();
              if( s==s2 )
              {
                result.range.setEnd(textNode, pos+len);
              }
              // If it is a tag, '<TAG>', '<TAG' is also good
              else if( s.charAt(0)=='<' && s.charAt(len-1)=='>' )
              {
                s = s.substr(0,len-1);
                s2 = s2.substr(0,len-1);
                if( s==s2 )
                {
                  result.range.setEnd(textNode, pos+len-1);
                }
              }
            }

            // If the text searched is bigger than the biggest string to search,
            // stop the search
            len = textAfter.length
            if( len>=maxlen )
            {
              break;
            }
            pos = -len;
            // Go to the next node
            textNode = treewalker.nextNode()
            if( textNode )
            {
              // Concatenate the next node text
              textAfter += textNode.data;
            }
            else
            {
              break;
            }
          }
        }
      }
    }

    return found;
  },

  /** __ hideValidator ____________________________________________________
   *
   * Hide the html validator
   *
   * @param bHide : (boolean) hide or not hide
   */
  hideValidator : function( bHide )
  {
	var doc = content.document;
    var box = doc.getElementById("tidy-view_source-box");
    var splitter = doc.getElementById("tidy-splitter");
    box.hidden = bHide;
    splitter.hidden = bHide;
    this.xulMenuHide.setAttribute("checked", !bHide);

    // The validation has already been done ?
    if( !bHide && !this.bIsValidated )
    {
      oTidyViewSource.validateHtmlFromNode();
    }
    else
    {
      oTidyViewSource.loadHelp( oTidyViewSource.currentHelpPage );
    }
  },

  /** __ getSelectionController _________________________________________
   *
   * This is to avoid repeatless bugs and change about this function
   * in Firefox where it becomes tiring
   */
  getSelectionController : function()
  {
     return docShell
     .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
     .getInterface(Components.interfaces.nsISelectionDisplay)
     .QueryInterface(Components.interfaces.nsISelectionController);
  },
};
tidyCViewSource.init();
