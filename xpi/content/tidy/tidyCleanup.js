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
const pageLoaderIface = Components.interfaces.nsIWebPageDescriptor;

function onLoadTidyCleanup()
{
  onLoadTidyUtil();
  oTidyCleanup = new TidyCleanup();
  oTidyCleanup.start();  
  oTidyCleanup.cleanup();
  oTidyCleanup.viewSource();
}

function onUnloadTidyCleanup()
{
  onUnloadTidyUtil();
  delete oTidyCleanup;
  oTidyCleanup = null;
}

function onTidyCleanupLoadCleanSource()
{
  oTidyUtil.selectionOn( oTidyCleanup.xulBrowserCleanSource );
}
    
function onTidyCleanupLoadCleanPage()
{
  oTidyUtil.selectionOn( oTidyCleanup.xulBrowserCleanPage );
}

function onTidyCleanupOrigSource()
{
  oTidyUtil.selectionOn( oTidyCleanup.xulBrowserOrigSource );
}

function onTidyCleanupLoadOrigPage()
{
  oTidyUtil.selectionOn( oTidyCleanup.xulBrowserOrigPage );
}

function onTidyCleanupOnClick(event)
{
  event.preventDefault();
  event.preventBubble();
  return true;
}

function onTidyCleanupNewTitle()
{
  document.title = oTidyUtil.getString("tidy_cleanup")+" - " +window.arguments[1][0];
}

//-------------------------------------------------------------
// CleanupHtml
//-------------------------------------------------------------

function TidyCleanup()
{
}

TidyCleanup.prototype =
{  
  // Progress meter
  meter: null,
  // Force output
  forceCombo: null, 
  // Browsers
  xulBrowserCleanSource : null,
  xulBrowserCleanPage : null,
  xulBrowserOrigSource : null,
  xulBrowserOrigPage : null,
  
  // Initialisation and termination functions
  start : function()
  {
    // Progress meter
    this.meter = document.getElementById("tidy-progress");
    this.meter.setAttribute("value", 1);
    
    this.forceCombo = document.getElementById("tidy.options.force_output");
    
    this.xulBrowserCleanSource = document.getElementById("tidy.cleanup.clean.source");
    this.xulBrowserCleanPage = document.getElementById("tidy.cleanup.clean.page");
    this.xulBrowserOrigSource = document.getElementById("tidy.cleanup.orig.source");
    this.xulBrowserOrigPage = document.getElementById("tidy.cleanup.orig.page");
    
    this.xulBrowserCleanSource.addEventListener("load", onTidyCleanupLoadCleanSource, true);
    this.xulBrowserCleanPage.addEventListener("load", onTidyCleanupLoadCleanPage, true);
    this.xulBrowserOrigSource.addEventListener("load", onTidyCleanupOrigSource, true);
    this.xulBrowserOrigPage.addEventListener("load", onTidyCleanupLoadOrigPage, true);
    
    this.xulBrowserCleanSource.docShell.allowJavascript = false;
    this.xulBrowserCleanPage.docShell.allowJavascript = false;
    this.xulBrowserOrigSource.docShell.allowJavascript = false;
    this.xulBrowserOrigPage.docShell.allowJavascript = false;
    
    window.setTimeout(function () { onTidyCleanupNewTitle() }, 200);
  },

  cleanupHtml: function( aHtml )
  {
    // The inout arguments need to be JavaScript objects
    var output ={value:"---"};
    
    // The cleanup will write down the result in a file. So that it can be shown 
    // xul browser. $PROFILE_DIR/tidy_cleanup.html
    var ifile = tidyUtilGetProfileDir();
    ifile.append("tidy_cleanup.html");
    var outputFile = ifile.path;
    var configFile = oTidyUtil.getPrefConfig();
    configFile += "output-file " + outputFile + "\n";
    configFile += "alt-text #########\n";

    var args = window.arguments[1];
    url = args[0];
    if (url)
      configFile += "base-url " + url + "\n";
      
    oTidyUtil.tidy.cleanupHTML( aHtml, configFile, -1, output );
    
    this.meter.setAttribute("value", 0);
    this.meter.setAttribute("mode", "determined");
    this.meter.setAttribute("hidden", "true");
    
    oTidyUtil.initCheckbox( "clean" );    
    oTidyUtil.initCheckbox( "indent" );
    oTidyUtil.initTextbox ( "indent-spaces" );
    oTidyUtil.initCheckbox( "uppercase-tags" );
    oTidyUtil.initCheckbox( "uppercase-attributes" );    
    oTidyUtil.initTextbox ( "wrap" );
    oTidyUtil.initComboBox( "doctype" );
    oTidyUtil.initComboBox( "output-encoding" );
    
    // Force output : convert the 2 settings of tidy in a combobox
    var o_xhtml = oTidyUtil.getBoolPref( "output-xhtml" );
    var o_html  = oTidyUtil.getBoolPref( "output-html" );
    
    if( o_html )
    {
      this.forceCombo.selectedIndex = 1; // "html";
    }
    else if( o_xhtml )
    {
      this.forceCombo.selectedIndex = 2; // "xhtml";
    } 
    else 
    {
      this.forceCombo.selectedIndex = 0; // "-";
    }
  
    // Load the cleanup source and page
    var loadFlags = Components.interfaces.nsIWebNavigation.LOAD_FLAGS_NONE;
    var ifile = tidyUtilGetProfileDir();
    ifile.append("tidy_base.html");
    var url= ifile.path;
    var viewSrcUrl = "view-source:" + outputFile;

    // Force the charset in the cleaned pages to UTF8 (else autodetect is used)    
    var docCharset = this.xulBrowserCleanSource.docShell.QueryInterface(Components.interfaces.nsIDocCharset);
    docCharset.charset = 'UTF-8';
    this.xulBrowserCleanPage.webNavigation.loadURI(url, loadFlags, null, null, null);

    docCharset = this.xulBrowserCleanPage.docShell.QueryInterface(Components.interfaces.nsIDocCharset);
    docCharset.charset = 'UTF-8';
    this.xulBrowserCleanSource.webNavigation.loadURI(viewSrcUrl, loadFlags, null, null, null);
  },
  
  // Cleanup the page
  cleanup: function()
  {
    var args = window.arguments;
    this.cleanupHtml( args[0] );
  },
    
  savePref: function()
  {
    oTidyUtil.saveCheckbox( "clean" );
    oTidyUtil.saveCheckbox( "indent" );
    oTidyUtil.saveTextbox ( "indent-spaces" );
    oTidyUtil.saveCheckbox( "uppercase-tags" );
    oTidyUtil.saveCheckbox( "uppercase-attributes" );
    oTidyUtil.saveTextbox ( "wrap" );
    oTidyUtil.saveComboBox( "doctype" );
    oTidyUtil.saveComboBox( "output-encoding" );
    
    //  Force output : convert the combobox to 2 settings of tidy    
    var o_xhtml = false;
    var o_html  = false;
    if( this.forceCombo.selectedIndex==1 )
    {
      o_html = true;
    }  
    else if( this.forceCombo.selectedIndex==2  )
    {
      o_xhtml = true;
    }
    oTidyUtil.setBoolPref( "output-html",  o_html );
    oTidyUtil.setBoolPref( "output-xhtml", o_xhtml );    
  },
  
  onOk : function()
  {
    this.savePref();
      
    // Close the window
    window.close();
  },

  onRefresh : function()
  {
    this.savePref();
    this.cleanup();
  },
  
  /** __ viewSource ______________________________________________________
   *
   * Load the original source and page
   */
  viewSource : function()
  {
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
            this.xulBrowserOrigSource.webNavigation.loadURI(viewSrcUrl, loadFlags, shEntry.referrerURI, shEntry.postData, null);
            this.xulBrowserOrigPage.webNavigation.loadURI(url, loadFlags, shEntry.referrerURI, shEntry.postData, null);

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
      this.xulBrowserOrigPage.webNavigation.loadURI(url, loadFlags, null, null, null);
      this.xulBrowserOrigSource.webNavigation.loadURI(viewSrcUrl, loadFlags, null, null, null);
    }

    return true;
  }
}