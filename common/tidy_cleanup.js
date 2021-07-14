//*************************************************************************
// HTML Validator
//
//  File: tidyCleanup.js
//  Description: javascript for the dialog box of the cleanup
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

//-------------------------------------------------------------

var oTidyCleanup;

function onLoadTidyCleanup() {
  onLoadTidyUtil(onLoadTidyCleanup2);
}

function onLoadTidyCleanup2() {
  oTidyCleanup = new TidyCleanup();

  // XXXXXXXXXXXXXXXXXXXXXXXXX
  var html = sessionStorage.getItem("tidy_html");
  if (html == null) {
    sessionStorage.setItem("tidy_html", "<html><head><title>Test</title><body></body>");
    sessionStorage.setItem("tidy_url", 'http://xxxxx');
  }
  var url = sessionStorage.getItem("tidy_url");
  oTidyCleanup.start();
  window.setTimeout(function () {
    onTidyCleanupNewTitle(url)
  }, 200);
  // Wait that the library is ready before to continue
  oTidyUtil.tidy.waitRunning(onRunningTidyCleanup);
}

function onRunningTidyCleanup() {
  oTidyCleanup.cleanup();
  oTidyCleanup.viewSource();
}

function onUnloadTidyCleanup() {
  onUnloadTidyUtil();
  delete oTidyCleanup;
  oTidyCleanup = null;
}

function onTidyCleanupLoadSource() {
  oTidyUtil.selectionOn(oTidyCleanup.elementBrowserSource);
}

function onTidyCleanupOnClick(event) {
  event.preventDefault();
  event.preventBubble();
  return true;
}

function onTidyCleanupNewTitle(aUrl) {
  document.title = oTidyUtil.getString("tidy_cleanup") + " - " + aUrl;
}

//-------------------------------------------------------------
// CleanupHtml
//-------------------------------------------------------------

function TidyCleanup() { }

TidyCleanup.prototype = {
  // Force output
  forceCombo: null,
  // Browsers
  elementBrowserSource: null,
  elementBrowserDiff: null,
  origHtml: null,
  cleanedHtml: null,
  // Monaco
  diffEditor: null,

  // Initialisation and termination functions
  start: function () {
    this.forceCombo = document.getElementById("tidy.options.force_output");

    this.elementBrowserSource = document.getElementById("tidy.cleanup.source");
    this.elementBrowserSource.addEventListener("load", onTidyCleanupLoadSource, true);
    this.elementBrowserDiff = document.getElementById("tidy.cleanup.diff");

  },

  cleanupHtml: function (aHtml, aUrl) {
    // The inout arguments need to be JavaScript objects
    var output = {
      value: "---"
    };
    this.origHtml = aHtml;

    // The cleanup will write down the result in a file. So that it can be shown
    // element browser. $PROFILE_DIR/tidy_cleanup.html

    var outputFile = "tidy_cleanup.html";
    var aConfig = oTidyUtil.getPrefParam();
    // configFile += "output-file " + outputFile + "\n";
    aConfig.push("--alt-text");
    aConfig.push("#########");

    /*
    if (undefined != aUrl )
      configFile += "base-url " + aUrl + "\n";
    */
    oTidyUtil.tidy.cleanupHTML(aHtml, aConfig, -1, output);

    oTidyUtil.initCheckbox("clean");
    oTidyUtil.initCheckbox("indent");
    oTidyUtil.initTextbox("indent-spaces");
    oTidyUtil.initCheckbox("uppercase-tags");
    oTidyUtil.initCheckbox("uppercase-attributes");
    oTidyUtil.initTextbox("wrap");
    oTidyUtil.initComboBox("doctype");
    oTidyUtil.initComboBox("output-encoding");

    // Force output : convert the 2 settings of tidy in a combobox
    var o_xhtml = oTidyUtil.getBoolPref("output-xhtml");
    var o_html = oTidyUtil.getBoolPref("output-html");

    if (o_html) {
      this.forceCombo.selectedIndex = 1; // "html";
    } else if (o_xhtml) {
      this.forceCombo.selectedIndex = 2; // "xhtml";
    } else {
      this.forceCombo.selectedIndex = 0; // "-";
    }

    oTidyUtil.insertHtmlAndLines(output.value, 'tidy.cleanup.source', false);

    // Save the cleaned html to allow copy to clipboard
    this.cleanedHtml = output.value;

    /*
    // Load the cleanup source and page
    var loadFlags = Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE;
    var ifile = tidyUtilGetProfileDir();
    ifile.append("tidy_base.html");
    var url= ifile.path;
    var viewSrcUrl = "view-source:" + outputFile;

    // Force the charset in the cleaned pages to UTF8 (else autodetect is used)
    var docCharset = this.elementBrowserCleanSource.docShell.QueryInterface(Components.interfaces.nsIDocCharset);
    docCharset.charset = 'UTF-8';
    this.elementBrowserCleanPage.webNavigation.loadURI(url, loadFlags, null, null, null);

    docCharset = this.elementBrowserCleanPage.docShell.QueryInterface(Components.interfaces.nsIDocCharset);
    docCharset.charset = 'UTF-8';
    this.elementBrowserCleanSource.webNavigation.loadURI(viewSrcUrl, loadFlags, null, null, null);
    */
  },

  // Cleanup the page
  cleanup: function () {
    var html = sessionStorage.getItem("tidy_html");
    var url = sessionStorage.getItem("tidy_url");
    this.cleanupHtml(html, url);
  },

  savePref: function () {
    oTidyUtil.saveCheckbox("clean");
    oTidyUtil.saveCheckbox("indent");
    oTidyUtil.saveTextbox("indent-spaces");
    oTidyUtil.saveCheckbox("uppercase-tags");
    oTidyUtil.saveCheckbox("uppercase-attributes");
    oTidyUtil.saveTextbox("wrap");
    oTidyUtil.saveComboBox("doctype");
    oTidyUtil.saveComboBox("output-encoding");

    //  Force output : convert the combobox to 2 settings of tidy
    var o_xhtml = false;
    var o_html = false;
    if (this.forceCombo.selectedIndex == 1) {
      o_html = true;
    } else if (this.forceCombo.selectedIndex == 2) {
      o_xhtml = true;
    }
    oTidyUtil.setBoolPref("output-html", o_html);
    oTidyUtil.setBoolPref("output-xhtml", o_xhtml);
  },

  onOk: function () {
    this.savePref();

    // Close the window
    window.close();
  },

  onRefresh: function () {
    this.savePref();
    this.cleanup();
  },

  onClickTab: function (tab) {
    document.getElementById("tab_clean").className = '';
    document.getElementById("tab_orig").className = '';
    document.getElementById("tab_diff").className = '';
    document.getElementById("tidy_cleanup_sidebar").style.display = 'none';
    // document.getElementById("tidy_clipboard").style.display = 'none';
    this.elementBrowserDiff.style.display = 'none';
    if (tab == "tidy.cleanup.clean.source") {
      this.elementBrowserSource.style.display = 'block';
      this.elementBrowserDiff.style.display = 'none';
      document.getElementById("tidy_cleanup_sidebar").style.display = 'block';
      // document.getElementById("tidy_clipboard").style.display = 'block';
      oTidyUtil.editor.getModel().setValue(this.cleanedHtml);
      document.getElementById("tab_clean").className = 'selected';
    } else if (tab == "tidy.cleanup.orig.source") {
      this.elementBrowserSource.style.display = 'block';
      this.elementBrowserDiff.style.display = 'none';
      oTidyUtil.editor.getModel().setValue(this.origHtml);
      document.getElementById("tab_orig").className = 'selected';
    } else {
      this.elementBrowserSource.style.display = 'none';
      this.elementBrowserDiff.style.display = 'block';
      document.getElementById("tab_diff").className = 'selected';

      if (this.thisEditor == null) {
        var originalModel = monaco.editor.createModel(this.origHtml);
        var modifiedModel = monaco.editor.createModel(this.cleanedHtml);

        this.diffEditor = monaco.editor.createDiffEditor(this.elementBrowserDiff);
        this.diffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
        var navi = monaco.editor.createDiffNavigator(this.diffEditor, {
          followsCaret: true, // resets the navigator state when the user selects something in the editor
          ignoreCharChanges: true // jump from line to line
        });
      }
    }
  },

  /** __ copyCleanedHtmlToClipboard ______________________________________________________
   *
   * copy Cleaned HTML to clipboard
   */
  copyCleanedHtmlToClipboard: function () {
    var textArea = document.createElement("textarea");

    //
    // *** This styling is an extra step which is likely not required. ***
    //
    // Why is it here? To ensure:
    // 1. the element is able to have focus and selection.
    // 2. if element was to flash render it has minimal visual impact.
    // 3. less flakyness with selection and copying which **might** occur if
    //    the textarea element is not visible.
    //
    // The likelihood is the element won't even render, not even a flash,
    // so some of these are just precautions. However in IE the element
    // is visible whilst the popup box asking the user for permission for
    // the web page to copy to the clipboard.
    //

    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;

    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';

    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;

    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';

    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';

    textArea.value = this.cleanedHtml;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }

    document.body.removeChild(textArea);
  },


  /** __ viewSource ______________________________________________________
   *
   * Load the original source and page
   */
  viewSource: function (html, url) {
    /*
    var args = window.arguments[1];
    var url = args[0];
    if (!url)
      return false;

    var loadFromURL = true;
    //
    // Parse the 'arguments' supplied with the dialog.
    //    arg[0] - URL string.
    //    arg[1] - Charset value in the form 'charset=xxx'.
    //    arg[2] - Page descriptor used to load content from the cache.
    //    arg[3] - Line number to go to.
    //
    if( args )
    {
      var arg;
      //
      // Set the charset of the viewsource window...
      //
      if (args.length >= 2) {
        arg = args[1];

        try {
          if (typeof(arg) == "string" && arg.indexOf('charset=') != -1)
          {
            var arrayArgComponents = arg.split('=');
            if (arrayArgComponents)
            {
              //we should "inherit" the charset menu setting in a new window
              getMarkupDocumentViewer().defaultCharacterSet = arrayArgComponents[1];
            }
          }
        } catch (ex) {
          // Ignore the failure and keep processing arguments...
        }
      }
      //
      // Get any specified line to jump to.
      //
      if (args.length >= 4) {
        arg = args[3];
        gGoToLine = parseInt(arg);
      }
      //
      // Use the page descriptor to load the content from the cache (if
      // available).
      //
      var viewSrcUrl = "view-source:" + url;

      if (args.length >= 3) {
        arg = args[2];

        try {
          if (typeof(arg) == "object" && arg != null)
          {
            //
            // Load the page using the page descriptor rather than the URL.
            // This allows the content to be fetched from the cache (if
            // possible) rather than the network...
            //
            var shEntry = arg.QueryInterface(Components.interfaces.nsISHEntry);
            var loadFlags = Components.interfaces.nsIRequest.VALIDATE_NEVER
                            | Components.interfaces.nsIRequest.LOAD_FROM_CACHE
                            | Components.interfaces.nsICachingChannel.LOAD_ONLY_FROM_CACHE;
            this.elementBrowserOrigSource.webNavigation.loadURI(viewSrcUrl, loadFlags, shEntry.referrerURI, shEntry.postData, null);
            this.elementBrowserOrigPage.webNavigation.loadURI(url, loadFlags, shEntry.referrerURI, shEntry.postData, null);

            loadFromURL = false;
          }
        } catch(ex) {
          // Ignore the failure.  The content will be loaded via the URL
          // that was supplied in arg[0].
        }
      }
    }

    if (loadFromURL)
    {
      //
      // Currently, an exception is thrown if the URL load fails...
      //
      var loadFlags = Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE;
      this.elementBrowserOrigPage.webNavigation.loadURI(url, loadFlags, null, null, null);
      this.elementBrowserOrigSource.webNavigation.loadURI(viewSrcUrl, loadFlags, null, null, null);
    }
    */

    return true;
  },

  onOk: function () {
    // Close the window
    if (parent) {
      if (parent.tidyOptionClose) {
        parent.tidyOptionClose();
        return;
      }
    }
    window.close()
  },
}

window.onload = function (e) {
  try {
    onLoadTidyCleanup();
  } catch (e) {
    console.error(e);
  }

  // Initialise the javascript link (else there is an error refuse to execute inline handler because it violates the security policies)
  tidyUtilSetOnclick("tidy_tab_source", function () {
    oTidyCleanup.onClickTab('tidy.cleanup.clean.source')
  });
  tidyUtilSetOnclick("tidy_tab_orig", function () {
    oTidyCleanup.onClickTab('tidy.cleanup.orig.source')
  });
  tidyUtilSetOnclick("tidy_tab_diff", function () {
    oTidyCleanup.onClickTab('tidy.cleanup.diff.source')
  });
  tidyUtilSetOnclick("tidy_clipboard", function () {
    oTidyCleanup.copyCleanedHtmlToClipboard()
  });
  tidyUtilSetOnclick("tidy_refresh", function () {
    oTidyCleanup.onRefresh()
  });
  tidyUtilSetOnclick("tidy_cleanup_ok", function () {
    oTidyCleanup.onOk()
  });

}

hljs.initHighlightingOnLoad();
