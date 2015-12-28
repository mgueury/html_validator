//*************************************************************************
// HTML Validator
//
//  File: tidyBrowser.js
//  Description: javascript to validate the HTML in the browser window
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

"use strict";

//-------------------------------------------------------------

var oTidyBrowser = null;
var oTidyTabChangeObserver = null;
onLoadTidyBrowser();

//-------------------------------------------------------------

function onLoadTidyBrowser()
{
  onLoadTidyUtil();
  // oTidyBrowser = new TidyBrowser();
  window.top.removeEventListener("load", onTidyBrowserTopLoad, true);
  window.top.addEventListener("load", onTidyBrowserTopLoad, true);
  window.top.removeEventListener("pageshow", onTidyBrowserTopPageShow, true);
  window.top.addEventListener("pageshow", onTidyBrowserTopPageShow, true);
}

function onUnloadTidyBrowser()
{
  oTidyBrowser = null;

  var main_frame = document.getElementById("content");
  main_frame.removeProgressListener(oTidyTabChangeObserver);
}

function onTidyBrowserClicked(event)
{
  return;
}

function onTidyBrowserCopyHtmlToClipboard()
{
  try
  {
    const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
    var html = oTidyBrowser.getHtmlFromCache( window.content.document, false );
    clipboardHelper.copyString(html);
  }
  catch(e)
  {
    // do nothing, later code will handle the error
    dump("Unable to get the clipboard helper\n");
  }
}

function onTidyBrowserCopyErrorToClipboard()
{
  try
  {
    if( !oTidyBrowser.isLoading() )
    {
      var data = oTidyUtil.getString("serial_result")+"\n----------------------\n"+oTidyBrowser.getErrorList(window.content);
      const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
      clipboardHelper.copyString(data);
    }
  }
  catch(e)
  {
    // do nothing, later code will handle the error
    dump("Unable to get the clipboard helper\n");
  }
}


//-------------------------------------------------------------
// TidyTabChangeObserver
//-------------------------------------------------------------

function TidyTabChangeObserver()
{
}

TidyTabChangeObserver.prototype =
{
  state : null,

  onProgressChange : function (aWebProgress, aRequest,
                                  aCurSelfProgress, aMaxSelfProgress,
                                  aCurTotalProgress, aMaxTotalProgress)
  {
    oTidyUtil.tidy.log( '<JAVASCRIPT>onProgressChange' );
  },

  onStateChange : function(aWebProgress, aRequest, aStateFlags, aStatus)
  {
    oTidyUtil.tidy.log( '<JAVASCRIPT>onStateChange : ' + aWebProgress.isLoadingDocument );
  },

  onLocationChange : function(aWebProgress, aRequest, aLocation)
  {
    if( aWebProgress)
    {    
      oTidyUtil.tidy.log( '<JAVASCRIPT>onLocationChange : ' + aWebProgress.isLoadingDocument );
      if( aWebProgress.isLoadingDocument==false )
      {
        oTidyBrowser.validateFrame( window.content );
        oTidyBrowser.updateStatusBar();
      }          
    }
  },

  onStatusChange : function(aWebProgress, aRequest, aStatus, aMessage)
  {
    oTidyUtil.tidy.log( '<JAVASCRIPT>onStatusChange' );
  },

  onSecurityChange : function(aWebProgress, aRequest, aState)
  {},

  onLinkIconAvailable : function(aBrowser, aHref)
  {},

  QueryInterface : function(aIID)
  {
    if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsISupports))
    return this;
    throw Components.results.NS_NOINTERFACE;
  }
}


//-------------------------------------------------------------
// onTidyPageLoad
//-------------------------------------------------------------

function onTidyPageLoad( event )
{
  if( !window.oTidyBrowser )
  {
    return;
  }

  doc = event.originalTarget;
  if (doc instanceof HTMLDocument) {
    // is this an inner frame?
    if (doc.defaultView.frameElement) {
      // Frame within a tab was loaded.
      // Find the root document:
      while (doc.defaultView.frameElement) {
        doc = doc.defaultView.frameElement.ownerDocument;
      }
    }
  }

  if( oTidyBrowser.bTopLoadBusy==false )
  {
    oTidyUtil.tidy.log( '<JAVASCRIPT>onTidyPageLoad' );
    oTidyBrowser.bTopLoadBusy = true;
    try
    {
      // Validate the 1rst request
      oTidyBrowser.bIgnorePageShow = true;
      // oTidyBrowser.validateCache( event.originalTarget );
      oTidyBrowser.validateFrame( window.content );
      // oTidyBrowser.validateCache( subject.document, true );

      // Process the events that fired during the 1rst one
      // ex: page with frames.
      var doc = oTidyBrowser.oEventQueue.pop();
      while( doc )
      {
        oTidyBrowser.oEventQueue.clear();
        oTidyBrowser.validateFrame( window.content );
        // oTidyBrowser.validateCache( doc, true );
        doc = oTidyBrowser.oEventQueue.pop();
      }
    }
    catch(ex)
    {
      tidyShowExceptionInConsole( ex );
    }
    oTidyUtil.tidy.log( '</JAVASCRIPT>onTidyPageLoad' );
    oTidyBrowser.bTopLoadBusy = false;
  }
  else
  {
    // Parallel events are placed in a event queue.
    oTidyBrowser.oEventQueue.push( event.originalTarget );
  }
}

//-------------------------------------------------------------
// tidyEndDocumentLoadObserver
//-------------------------------------------------------------

var tidyEndDocumentLoadObserver =
{
  observe: function(subject, topic, data)
  {
    if( !window.oTidyBrowser )
    {
      // Do nothing
    }
    else if( oTidyBrowser.bTopLoadBusy==false )
    {
      oTidyUtil.tidy.log( '<JAVASCRIPT>tidyEndDocumentLoadObserver' );
      oTidyBrowser.bTopLoadBusy = true;
      try
      {
        // Validate the 1rst request
        oTidyBrowser.bIgnorePageShow = true;
        oTidyBrowser.validateFrame( window.content );
        // oTidyBrowser.validateCache( subject.document, true );

        // Process the events that fired during the 1rst one
        // ex: page with frames.
        var doc = oTidyBrowser.oEventQueue.pop();
        while( doc )
        {
          oTidyBrowser.validateCache( doc, true );
          doc = oTidyBrowser.oEventQueue.pop();
        }
      }
      catch(ex)
      {
        tidyShowExceptionInConsole( ex );
      }
      oTidyUtil.tidy.log( '</JAVASCRIPT>tidyEndDocumentLoadObserver' );
      oTidyBrowser.bTopLoadBusy = false;
    }
    else
    {
      // Parallel events are placed in a event queue.
      oTidyBrowser.oEventQueue.push( event.originalTarget );
    }
  }
};

//-------------------------------------------------------------
// TidyBrowser
//-------------------------------------------------------------

function TidyBrowser()
{
  try
  {
    this.initIcon();
  }
  catch(ex)
  {
  }
}

TidyBrowser.prototype =
{
  xulMenuIconText : null,
  xulMenuIconOnly : null,
  xulMenuHtmlClipboard : null,
  xulTooltip: null,
  iCounter : 0,
  oEventQueue : new TidyFifoQueue(),
  bTopLoadBusy : false,

  /**
   * initXUL
   */
  initXUL : function()
  {
    // checkbox
    this.xulMenuIconText = document.getElementById('tidy.browser.menu.icon_text');
    this.xulMenuIconOnly = document.getElementById('tidy.browser.menu.icon_only');
    this.xulMenuHtmlClipboard = document.getElementById('tidy.browser.menu.html_clipboard');
  },

  /**
   * initIcon
   */
  initIcon : function()
  {
    this.initXUL();

    this.validateFrame( window.content );
    this.updateStatusBar();
  },

  /** __ showIcon __________________________________________________________
   */
  showIcon : function( icon_path )
  {
    var toolbarButton = document.getElementById("tidy-toolbar-button");
    toolbarButton.setAttribute("image", icon_path );
  },

  /** __ updateStatusBar __________________________________________________________
   */
  updateStatusBar : function()
  {
    var tooltip, icon, lblparent, lbl;

    var browser_icon = oTidyUtil.getCharPref( "browser_icon" );
    var browser_enable = oTidyUtil.getBoolPref( "browser_enable" );
    var toolbarLabel  = document.getElementById("tidy-toolbar-label");
    var toolbarItem = document.getElementById("tidy-toolbar-item");
    var xulMenuDisableSite = document.getElementById('tidy.browser.menu.disable_site');
    var xulMenuDisableSite2 = document.getElementById('tidy.browser.menu.disable_site2');
    var xulMenuDisable = document.getElementById('tidy.browser.menu.disable');
    var xulMenuDisable2 = document.getElementById('tidy.browser.menu.disable2');

    this.initXUL();

    if( !toolbarItem )
    {
      return;
    }

    if (toolbarItem.hasAttribute("tooltip"))
    {
      // In Firefox 1.1, avoid several tooltips
      tooltip = document.getElementById("tidy.browser.hbox.tooltip");
      while( tooltip!=null )
      {
        tooltip.parentNode.removeChild(tooltip);
        toolbarItem.removeAttribute("tooltip");
        tooltip = document.getElementById("tidy.browser.hbox.tooltip");
      }
    }

    this.xulMenuIconText.setAttribute("checked", browser_icon=="icon_text");
    this.xulMenuIconOnly.setAttribute("checked", browser_icon=="icon_only");
    xulMenuDisable.setAttribute("label", oTidyUtil.getString( (browser_enable?"tidy_disable":"tidy_enable") ));
    xulMenuDisable2.setAttribute("label", oTidyUtil.getString( (browser_enable?"tidy_disable":"tidy_enable") ));

    // Maybe to uncomment in a next version
    this.xulMenuHtmlClipboard.hidden = !oTidyUtil.getBoolPref( "debug" );

    toolbarLabel.hidden = false;

    if( browser_icon!="icon_text" )
    {
      toolbarLabel.hidden = true;
    }

    var doc = window.content.document;
    var sum = new TidyResult( null ); // virtual result
    sum.algorithm = oTidyUtil.algorithm;

    ////
    //// Enable/Disable for ...
    ////
    var uri = oTidyUtil.getDocURI(doc);
    var b = browser_enable;

    if ( oTidyUtil.permManager && uri && uri.host!="" )
    {
      xulMenuDisableSite.removeAttribute("hidden");
      xulMenuDisableSite2.removeAttribute("hidden");

      // XXX why is tidyUtil.isInDomainList not used here ? why is isPermAllowed not used in isInDomainList ?
      b = ( b && !oTidyUtil.isPermDenied( uri ) ) || oTidyUtil.isPermAllowed( uri );
      var s = oTidyUtil.getString((b ? "tidy_disable_site":"tidy_enable_site")) + " " + uri.host;
      xulMenuDisableSite.setAttribute("label", s );
      xulMenuDisableSite2.setAttribute("label", s );
    }
    else
    {
      xulMenuDisableSite.setAttribute("hidden", "true");
      xulMenuDisableSite2.setAttribute("hidden", "true");
    }

    if( b )
    {
      ////
      //// Sum
      ////
      var pageResult = doc.tidyResult;
      var iNbFrame = this.getNbFrame( window.content );

      sum.bInDomainList = false;
      sum.bEmpty = true;
      sum.bValidated = false;
      this.sumResult( sum, window.content );

      // The page is HTML 5 if the root page is HTML5
      if( pageResult )
      {
        sum.algorithm = pageResult.algorithm;
        sum.bHTML5 = pageResult.bHTML5;
      }

      if( toolbarItem.parentNode && toolbarItem.parentNode.id=="nav-bar" )
      {
        var str = "";
        var color = "";
        if( sum.bValidated && sum.bInDomainList && !sum.bEmpty && !sum.bUConvFailed )
        {
          if ( sum.iNbError > 0 )
          {
            str = sum.iNbError;
            color = "#f88";
          }
          else if ( sum.iNbWarning > 0 )
          {
            str = sum.iNbWarning;
            color = "#ff4";
          }
          else if ( sum.iNbAccessWarning > 0 )
          {
            str = sum.iNbAccessWarning;
            color = "#9cf";
          }
          else
          {
            toolbarLabel.hidden = true;
          }
        }
        else
        {
          toolbarLabel.hidden = true;
        }
        toolbarLabel.value = str;
        toolbarLabel.style.background = color;
        toolbarLabel.style.padding = "2px";
      }
      else
      {
        var str = sum.getErrorString();
        if( oTidyUtil.getBoolPref( "debug" ) )
        {
          str += " #"+this.iCounter + "/"+iNbFrame;
        }
        toolbarLabel.value = str;
        toolbarLabel.style.background = "";
      }

      ////
      //// Icon in status bar
      ////
      icon = sum.getErrorIcon();
    }
    else
    {
      if( browser_enable )
      {
        icon = "chrome://tidy/skin/exclude";
      } else {
        icon = "chrome://tidy/skin/disabled";
      }
      toolbarLabel.hidden = true;
    }

    ////
    //// tooltip ( create empty tip / populate it )
    ////
    tooltip = document.createElement("tooltip");
    tooltip.setAttribute("id", "tidy.browser.hbox.tooltip");
    tooltip.setAttribute("noautohide", true);

    var hbox_main = document.createElement("hbox");
    var vbox1 = document.createElement("vbox");
    var vbox2 = document.createElement("vbox");

    var img1 = document.createElement("image");
    img1.setAttribute("src", "chrome://tidy/skin/serial_logo_big.png");
    img1.setAttribute("width", "70" );
    img1.setAttribute("height","56" );
    vbox1.appendChild(img1);

    lbl = document.createElement("label");

    if( !b || (sum.bEmpty && sum.bInDomainList) )
    {
      this.showIcon( icon + ".png" );

      lbl.setAttribute("value", oTidyUtil.getString("tidy_validator") );
      vbox2.appendChild(lbl);
      lbl = document.createElement("label");
      lbl.setAttribute("value", (browser_enable?oTidyUtil.getString('tidy_empty'):oTidyUtil.getString("tidy_disabled")) );
      vbox2.appendChild(lbl);
    }
    else
    {
      // Due to a bug in Firefox removing the back button in a new page
      setTimeout(function () { oTidyBrowser.showIcon( icon+".png" )},10)

      if( sum.algorithm!=null )
      {
        oTidyUtil.tidy.log( '<JAVASCRIPT>sum.algorithm: '+ sum.algorithm );
        lbl.setAttribute("value", oTidyUtil.getString(sum.algorithm+"_result") );
        vbox2.appendChild(lbl);
      }

      if( !sum.bInDomainList )
      {
        toolbarLabel.hidden = true;
      }

      if( iNbFrame==0 )
      {
        var hbox1 = document.createElement("hbox");
        vbox2.appendChild(hbox1);
        var vbox3 = document.createElement("vbox");
        hbox1.appendChild(vbox3);

        var img2 = document.createElement("image");
        img2.setAttribute("src", icon + "_big.png");
        img2.setAttribute("width", "32" );
        img2.setAttribute("height","32" );
        vbox3.appendChild(img2);

        var vbox4 = document.createElement("vbox");
        hbox1.appendChild(vbox4);
        lbl = document.createElement("label");

        if( sum.bUConvFailed )
        {
          lbl.setAttribute("value", oTidyUtil.getString("tidy_invalid_char"));
          vbox4.appendChild(lbl);
        }
        else if( sum.bHTML5 )
        {
          // XXXX needs translation
          lbl.setAttribute("value", "HTML 5 - see Page Source");
          vbox4.appendChild(lbl);
        }
        else  if( sum.bInDomainList )
        {
          lbl.setAttribute("value", sum.iNbError+" "+oTidyUtil.getString( sum.getPluralString(sum.iNbError,"error") ));
          vbox4.appendChild(lbl);

          lbl = document.createElement("label");
          lbl.setAttribute("value", sum.iNbWarning+" "+oTidyUtil.getString( sum.getPluralString(sum.iNbWarning,"warning") ));
          vbox4.appendChild(lbl);

          if( sum.iNbAccessWarning!=0 )
          {
            lbl = document.createElement("label");
            lbl.setAttribute("value", sum.iNbAccessWarning+" "+oTidyUtil.getString( sum.getPluralString(sum.iNbAccessWarning,"access_warning") ));
            vbox4.appendChild(lbl);
          }
          if( sum.iNbHidden>0 )
          {
            lbl = document.createElement("label");
            lbl.setAttribute("value", sum.iNbHidden+" "+oTidyUtil.getString("tidy_hidden"));
            vbox4.appendChild(lbl);
          }
        }
        else
        {
          lbl.setAttribute("value", oTidyUtil.getString("tidy_not_in_domain"));
          vbox4.appendChild(lbl);
        }
      }
      else
      {
        this.addIconLabelToVbox( vbox2, window.content );
      }
    }

    hbox_main.appendChild(vbox1);
    hbox_main.appendChild(vbox2);
    tooltip.setAttribute("orient", "horizontal");
    tooltip.appendChild(hbox_main);
    this.xulTooltip = tooltip;
  },
  /** __ addTooltip _________________________________________________________________
   *
   * add the tooltip in a mouseover trigger to WA an focus conflict with Firebug
   */
  addTooltip : function()
  {
    if( this.xulTooltip )
    {
      var parent = document.getElementById("tidy-dummy-popup");
      parent.appendChild( this.xulTooltip );

      var toolbarItem = document.getElementById("tidy-toolbar-item");
      toolbarItem.setAttribute("tooltip", "tidy.browser.hbox.tooltip");

      this.xulTooltip = null;
    }
  },
  /** __ isLoading _________________________________________________________________
   *
   * return true if the current browser is still loading
   */
  isLoading : function()
  {
    var res = document.getElementById("content").mCurrentBrowser.webProgress.isLoadingDocument;
    if( res )
    {
      oTidyUtil.tidy.log( '<JAVASCRIPT>isLoading = true' );
    }
    return res;
  },

  /** __ getHtmlFromCache __________________________________________________________
   *
   * get the HTML of the current window
   */
  getHtmlFromCache : function( doc, safe_call )
  {
    oTidyUtil.tidy.log( '<JAVASCRIPT>getHtmlFromCache: ' + doc.URL  );

    // Cleanup with a lost tidyResult : icon (?)
    var res = doc.tidyResult;
    if( doc.tidyResult==null )
    {
      res = new TidyResult( doc );
      doc.tidyResult = res;
    }
    res.bEmpty = true;

    // Check that the page is not loading to prevent hanging
    if( !safe_call && this.isLoading() )
    {
      return '';
    }

    ////
    //// Part 1 : get the history entry (nsISHEntry) associated with the document
    ////
    var webNav = null;
    try
    {
      // Get the DOMWindow for the requested document.  If the DOMWindow
      // cannot be found, then just use the content window...
      //
      // XXX:  This is a bit of a hack...
      var win = doc.defaultView;
      if (win == window)
      {
        win = window.content;
      }
      var ifRequestor = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
      webNav = ifRequestor.getInterface(Components.interfaces.nsIWebNavigation);
    } catch(err) {
      // If nsIWebNavigation cannot be found, just get the one for the whole
      // window...
      oTidyUtil.tidy.log( 'Exception 1' );
      webNav = getWebNavigation();
    }

    //
    // Twitter trick for bug https://bugzilla.mozilla.org/show_bug.cgi?id=839414
    // Due that HTML5 validation does not happen anyway today for HTML5 in the browser
    // If the doctype is HTML5 then skip the page
    // To remove as soon as bug 839414 is solved
    //
    if( doc.doctype )
    {
      if( doc.doctype.publicId=="" )
      {
        // HTML 5
        oTidyUtil.tidy.log( '</JAVASCRIPT>getHtmlFromCache twitter trick' );
        res.bEmpty = false;
        return "<!doctype html>\n";
      }
    }

    //
    // Get the 'PageDescriptor' for the current document. This allows the
    // to access the cached copy of the content rather than refetching it from
    // the network...
    try
    {
      var PageLoader = webNav.QueryInterface(Components.interfaces.nsIWebPageDescriptor);
      var pageCookie = PageLoader.currentDescriptor;
      var shEntry = pageCookie.QueryInterface(Components.interfaces.nsISHEntry);
    } catch(err) {
      // If no page descriptor is available, just use the URL...
      oTidyUtil.tidy.log( 'Exception 2' );
    }

    ////
    //// Part 2 : open a nsIChannel to get the HTML of the doc
    ////
    var url = doc.URL;
    var urlCharset = doc.characterSet;

    var ios = Components.classes["@mozilla.org/network/io-service;1"]
                        .getService(Components.interfaces.nsIIOService);
    var channel = ios.newChannel( url, urlCharset, null );
    channel.loadFlags |= Components.interfaces.nsIRequest.VALIDATE_NEVER;
    channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_FROM_CACHE;
    channel.loadFlags |= Components.interfaces.nsICachingChannel.LOAD_ONLY_FROM_CACHE;

    // Bad trick : Avoid problem with file directory before Firefox 3.0
    try
    {
      if( !oTidyUtil.firefoxVersionHigherThan("3.0a1") )
      {
        if( channel.contentType=="application/x-unknown-content-type" )
        {
          return("<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\"><html><head><title></title></head><body></body></html>");
        }
      }
    }
    catch(e)
    {
      oTidyUtil.tidy.log( 'Exception 3' );
    }

    try
    {
      // Use the cache key to distinguish POST entries in the cache (see nsDocShell.cpp)
      var cacheChannel = channel.QueryInterface(Components.interfaces.nsICachingChannel);
      cacheChannel.cacheKey = shEntry.cacheKey;
    }
    catch(e)
    {
      oTidyUtil.tidy.log( 'Exception 4' );
    }

    var stream = channel.open();

    const scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                             .createInstance(Components.interfaces.nsIScriptableInputStream);
    scriptableStream.init( stream );
    var s = "";

    // XXX Maybe there should be a flag for controlling this ?
    while( scriptableStream.available()>0 )
    // if( scriptableStream.available()>0 )
    {
      res.bEmpty = false;
      s += scriptableStream.read(scriptableStream.available());
    }
    scriptableStream.close();
    stream.close();

    ////
    //// Part 3 : convert the HTML in unicode
    ////
    try
    {
      var ucConverter =  Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                         .getService(Components.interfaces.nsIScriptableUnicodeConverter);
      ucConverter.charset = urlCharset;
      var s2 = ucConverter.ConvertToUnicode( s );
    }
    catch(e)
    {
      res.bUConvFailed = true;
    }

    oTidyUtil.tidy.log( '</JAVASCRIPT>getHtmlFromCache' );
    return( s2 );
  },

  /** __ validateCacheHtml ______________________________________________________
   *
   * Validate the HTML and add the results in the tree
   */
  validateCacheHtml : function( aHtml, aResult )
  {
    // Set the initialization flag
    this.iCounter = this.iCounter + 1;
    // Load the translation (if not done)
    oTidyUtil.translation();

    aResult.validate( aHtml );
  },

  /** __ getResult ______________________________________________________
   */
  getResult : function( doc )
  {
    var bFrame = false;
    var pageDoc = window.content.document;
    // check that it is the current document seen
    if( doc!=pageDoc )
    {
      if( doc.tidyResult==null && this.isDocumentFrameOf( doc, window.content ) )
      {
        // Hidden preference to force frame revalidation
        var force_frame_revalidation = oTidyUtil.getBoolPref( "force_frame_revalidation" );
        if( !force_frame_revalidation )
        {
          // WA 1.Do not validate a frame if the root page if already loaded
          // WA 2.Do not validate a frame if the root page has the same URL
          // (This is not perfect WAs but it avoid crashes due to Javascript frames)
          if( (pageDoc.tidyResult!=null && pageDoc.tidyResult.bValidated)
           || (pageDoc.URL==doc.URL) )
          {
            return null;
          }
        }
        bFrame = true;
      }
      else
      {
        return null;
      }
    }

    // check that the main page is changed
    // a frame can be validated before the main page
    var pageResult = new TidyResult( pageDoc );
    // var bChanged = pageDoc.tidyResult==null || !pageDoc.tidyResult.compare( pageResult );
    var bChanged = pageDoc.tidyResult==null;
    if( bChanged )
    {
      pageResult.bInDomainList = oTidyUtil.isInDomainList( pageDoc );
      pageDoc.tidyResult = pageResult;
    }

    if( bFrame )
    {
      var frameResult = new TidyResult( doc );
      doc.tidyResult = frameResult;
      return frameResult;
    }
    else
    {
      if( !pageDoc.tidyResult.bValidated )
      {
        return pageDoc.tidyResult;
      }
      return null;
    }
  },

  /** __ validateCache ______________________________________________________
   *
   * Validate only after that the page is fully loaded
   */
  validateCache : function( doc, safe_call )
  {
    if( this.isLoading() )
    {
      return;
    }

    if( oTidyUtil.getBoolPref("browser_enable") || oTidyUtil.isPermAllowed(oTidyUtil.getDocURI(doc)) )
    {
      // Show some help page
      // - if tidy lib is not found
      // - if it is a new install
      if( oTidyUtil.tidy==null )
      {
        if( oTidyUtil.tidyFaqUrl==null )
        {
          oTidyUtil.tidyFaqUrl = "http://users.skynet.be/mgueury/mozilla/no_tidy_lib_jsc.html";
          setTimeout(function () {oTidyUtil.showFaq();}, 500);
        }
        return;
      }
      else if( oTidyUtil.bNewInstall && oTidyUtil.tidyFaqUrl==null )
      {
        if( oTidyUtil.bUpgrade )
        {
          oTidyUtil.tidyFaqUrl = "http://users.skynet.be/mgueury/mozilla/new_upgrade4.html";
        }
        else
        {
          oTidyUtil.tidyFaqUrl = "http://users.skynet.be/mgueury/mozilla/new_install4.html";
        }
        setTimeout(function () {oTidyUtil.showFaq();}, 1000);
        return;
      }
      // Check that the toolbarItem is visible
      // This is not perfect but better than validate when not necessary.
      var toolbarItem = document.getElementById("tidy-toolbar-item");
      if( toolbarItem )
      {
        if( toolbarItem.collapsed )
        {
          // The code goes probably never here
          return;
        }
      }
      else
      {
        // Code goes here when the toolbar item is not visible
        return;
      }

      oTidyUtil.tidy.log( '<JAVASCRIPT>validateCache' + doc.URL );

      // doc = window.content.document for the main frame
      if( doc.contentType == "text/html"
       || doc.contentType == "application/xhtml+xml"
      )
      {
        var result = this.getResult( doc );
        if( result!=null )
        {
          result.bInDomainList = oTidyUtil.isInDomainList( doc );
          if( result.bInDomainList )
          {
            var html = this.getHtmlFromCache( doc, safe_call );
            if( !result.bEmpty && !result.bUConvFailed )
            {
              this.validateCacheHtml( html, result );
            }
          }
        }
      }
    }
    this.updateStatusBar();
  },

  /** __ getNbFrame ______________________________________________________
   */
  getNbFrame : function( main_frame )
  {
    const framesList = main_frame.frames;
    var r = framesList.length;
    for(var i = 0; i < framesList.length; i++)
    {
      r += this.getNbFrame( framesList[i] );
    }
    return r;
  },

  /** __ validateFrame ______________________________________________________
   */
  validateFrame : function( main_frame )
  {
    // Loop through the frames
    var framesList = main_frame.frames;

    oTidyUtil.tidy.log( '<JAVASCRIPT>validateFrame : ' + framesList.length );

    for(var i = 0; i < framesList.length; i++)
    {
      this.validateFrame( framesList[i] );
    }
    if( main_frame.document!=null && (main_frame.document.tidyResult==null || !main_frame.document.tidyResult.bValidated) )
    {
      this.validateCache( main_frame.document, false );
      /*
      var age = new Date() - new Date(main_frame.document.mozAnimationStartTime);
      if( age < 300000 )
      {
        this.validateCache( main_frame.document, false );
      }
      else
      {
         oTidyUtil.tidy.log( 'validateFrame skip : url : ' + main_frame.document.URL + '\n'
                          + '- age : ' + age + 'ms\n'
                          + '- mozAnimationStartTime : ' + main_frame.document.mozAnimationStartTime );
      }
      */
    }
    oTidyUtil.tidy.log( '</JAVASCRIPT>validateFrame' );
  },

  /** __ addIconLabelToVbox ______________________________________________________
   */
  addIconLabelToVbox : function( vbox2, main_frame )
  {
    var hbox1 =  document.createElement("hbox");

    var icon = "chrome://tidy/skin/question";
    var str = "";

    var res = main_frame.document.tidyResult;
    if( res!=null )
    {
      icon = res.getErrorIcon();
      str = res.getErrorString();
    }
    str = oTidyUtil.getString((main_frame==window.content?"tidy_page":"tidy_frame"))+ ": "+str;

    var img2 = document.createElement("image");
    img2.setAttribute("src", icon + ".png");
    img2.setAttribute("width", "16" );
    img2.setAttribute("height","16" );
    hbox1.appendChild(img2);

    var lbl = document.createElement("label");
    lbl.setAttribute("value", str );
    hbox1.appendChild(lbl);

    vbox2.appendChild(hbox1);

    // Loop through the frames
    const framesList = main_frame.frames;
    for(var i = 0; i < framesList.length; i++)
    {
      this.addIconLabelToVbox( vbox2, framesList[i] );
    }
  },


  /** __ sumResult ______________________________________________________
   */
  sumResult : function( sum, main_frame )
  {
    var res = main_frame.document.tidyResult;
    if( res!=null )
    {
      sum.iNbError += res.iNbError;
      sum.iNbWarning += res.iNbWarning;
      sum.iNbAccessWarning += res.iNbAccessWarning;
      sum.iNbHidden += res.iNbHidden;
      sum.bInDomainList |= res.bInDomainList;
      sum.bUConvFailed |= res.bUConvFailed;
      sum.bEmpty &= res.bEmpty;
      sum.bValidated |= res.bValidated;
    }

    // Loop through the frames
    var framesList = main_frame.frames;
    for(var i = 0; i < framesList.length; i++)
    {
      this.sumResult( sum, framesList[i] );
    }
  },

  /** __ isDocumentFrameOf ______________________________________________________
   */
  isDocumentFrameOf : function( doc, main_frame )
  {
    const framesList = main_frame.frames;

    // Loop through the frames
    for(var i = 0; i < framesList.length; i++)
    {
      if( framesList[i].document == doc )
      {
        oTidyUtil.tidy.log( '<JAVASCRIPT>isDocumentFrameOf: '+ (framesList[i].name?framesList[i].name:"-") );
        return true;
      }
      if( this.isDocumentFrameOf( doc, framesList[i] ) )
      {
        return true;
      }
    }

    return false;
  },

  /** __ getErrorList ______________________________________________________
   */
  getErrorList : function( main_frame )
  {
    var data = main_frame.document.URL+"\n\n";
    var html = this.getHtmlFromCache( main_frame.document, false );

    // Validate
    var res = new TidyResult();
    var error = res.validate( html );

    var multi = error.value.split('\n');
    for (var o in multi)
    {
      row = new TidyResultRow();
      row.parse( res.algorithm, multi[o], 0 );
      if( !row.skip )
      {
        data += row.getString()+"\n";
      }
    }

    if( res.algorithm=="tidy" && res.iNbError>=oTidyUtil.getIntPref("show-errors") )
    {
      data += oTidyUtil.getString("tidy_too_many_error");
    }
    data += res.getErrorString()+"\n\n";

    // Loop through the frames
    var framesList = main_frame.frames;
    for(var i = 0; i < framesList.length; i++)
    {
      data += this.getErrorList( framesList[i] );
    }
    return data;
  },

  /** __ findDocWithURL ______________________________________________________
   */
  findDocWithURL : function( url, main_frame )
  {
    if( main_frame.document.URL==url )
    {
      return main_frame.document;
    }

    // Loop through the frames
    const framesList = main_frame.frames;
    for(var i = 0; i < framesList.length; i++)
    {
      var res = this.findDocWithURL( url, framesList[i] );
      if( res!=null )
      {
        return res;
      }
    }
    return null;
  },

  /** __ onToolbarViewSource ______________________________________________________
   */

  // Used to avoid a double-event
  onToolbarViewSource : function(aEvent)
  {
    if( aEvent!=null && aEvent.originalTarget.id!=null && aEvent.originalTarget.id=="" )
    {
      this.onViewSource(aEvent);
    }
  },

  /** __ onViewSource ______________________________________________________
   */
  onViewSource : function(aEvent)
  {
    // Behavior depending of the user action and config
    //
    //  Action                    DbClick        ViewSource...  Cleanup...
    //  DbClick config    ViewSource    Cleanup
    //  -----------------------------------------------------------------
    //  Icon enabled      ViewSource    Cleanup  ViewSource     Cleanup
    //  Icon disabled     ViewSource    Enable   ViewSource     Enable
    //
    var id = aEvent.originalTarget.id;
    var action = "viewsource";

    // alert( "ID = " +  id );

    // XXXXXXXXXXXXXX
    if( id=="tidy.browser.menu.cleanup"
     || (id=="tidy-status-bar-img" && oTidyUtil.getCharPref("dbclick_action")=="cleanup") )
    {
      action = "cleanup";
    }
    else if( id=="tidy.browser.menu.online.html" )
    {
      action = "online.html";
    }
    else if( id=="tidy.browser.menu.online.css" )
    {
      action = "online.css";
    }
    else if( id=="tidy.browser.menu.innerHTML" || id=="key_innerHTML" )
    {
      action = "innerHTML";
    }

    if( !oTidyUtil.getBoolPref("browser_enable") && action=="cleanup" )
    {
      // If the validation is disabled, ask to reenable it
      var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                          .getService(Components.interfaces.nsIPromptService);
      var flags=promptService.BUTTON_TITLE_YES * promptService.BUTTON_POS_0 +
                promptService.BUTTON_TITLE_NO * promptService.BUTTON_POS_1;
      var res = promptService.confirmEx(window,oTidyUtil.getString("tidy_validator"),
                 oTidyUtil.getString("tidy_enable_browser"),
                 flags, null, null, null, null, {} );

      if( res==0 )
      {
        oTidyUtil.setBoolPref( "browser_enable", true );
        this.initIcon();
      }
    }
    else
    {
      if( this.getNbFrame(window.content)==0 )
      {
        this.processAction(window.content.document, aEvent, action);
      }
      else
      {
        var result = new Array();
        openDialog(
                   "chrome://tidy/content/tidyChooseSource.xul",
                   "",
                   "centerscreen,dialog=no,chrome,resizable,dependent,modal",
                   window.content,
                   result,
                   action
                  );
        for( var i=0; i<result.length; i++ )
        {
          var doc = this.findDocWithURL( result[i], window.content );
          if( doc )
          {
            this.processAction(doc, aEvent, action);
          }
        }
      }
    }
  },

  /** __ openViewSource _______________________________________________________
   *
   * This wa a problem to open the viewSource that depends of the browser version
   * BrowserViewSourceOfURL does not exist anymore in Firefox 2.0
   */
  openViewSource: function( spec, docCharset, pageCookie, aEvent, doc )
  {
    try
    {
      // Firefox 3.0
      gViewSourceUtils.openInInternalViewer(spec, pageCookie, doc);
    }
    catch(e)
    {
      try
      {
        BrowserViewSourceOfURL( spec, docCharset, pageCookie, aEvent );
      }
      catch(e)
      {
        // Firefox 2.0
        openDialog("chrome://global/content/viewSource.xul",
                   "_blank",
                   "scrollbars,resizable,chrome,dialog=no",
                   spec, docCharset, pageCookie);
      }
    }
  },

  /** __ processAction ______________________________________________________
   *
   * !! Nearly a copy paste of BrowserViewSourceOfDocument
   */
  processAction: function(doc, aEvent, action)
  {
    var pageCookie;
    var webNav;

    // Get the document charset
    var docCharset = "charset=" + doc.characterSet;

    // Get the nsIWebNavigation associated with the document
    try
    {
        // Get the DOMWindow for the requested document.  If the DOMWindow
        // cannot be found, then just use the content window...
        //
        // XXX:  This is a bit of a hack...
        var win = doc.defaultView;
        if (win == window)
        {
          win = window.content;
        }
        var ifRequestor = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor);
        webNav = ifRequestor.getInterface(nsIWebNavigation);
    } catch(err) {
        // If nsIWebNavigation cannot be found, just get the one for the whole
        // window...
        webNav = getWebNavigation();
    }
    //
    // Get the 'PageDescriptor' for the current document. This allows the
    // view-source to access the cached copy of the content rather than
    // refetching it from the network...
    //
    try
    {
      var PageLoader = webNav.QueryInterface(Components.interfaces.nsIWebPageDescriptor);

      pageCookie = PageLoader.currentDescriptor;
    } catch(err) {
      // If no page descriptor is available, just use the view-source URL...
    }

    if( action=="viewsource" )
    {
      // Double-clicking on the disabled icon show the HTML error
      // in the viewsource even if the validator is completely disabled
      if( !oTidyUtil.getBoolPref("viewsource_enable") )
      {
        oTidyUtil.setBoolPref( "viewsource_enable_once", true );
      }
      this.openViewSource(webNav.currentURI.spec, docCharset, pageCookie, aEvent, doc);
    }
    else if( action=="innerHTML" )
    {
      // get the innerHTML of the doc
      var sHtml = oTidyUtil.getDocInnerHtml( doc );
      var ifile = tidyUtilGetProfileDir();
      ifile.append("tidy_inner.html");
      oTidyUtil.writeFile( ifile, sHtml );
      this.openViewSource("file://"+ifile.path, "charset=UTF-8", null, aEvent, null);
    }
    else
    {
      var sHtml = this.getHtmlFromCache(doc,false);

      if( action=="online.html" )
      {
        oTidyUtil.onlineHtmlValidate( sHtml );
      }
      else if( action=="online.css" )
      {
        oTidyUtil.onlineCssValidate( doc.URL );
      }
      else
      {
        var win_arg = new Array();
        win_arg[0] = webNav.currentURI.spec;
        win_arg[1] = docCharset;
        win_arg[2] = pageCookie;

        oTidyUtil.cleanupDialog(doc.tidyResult, sHtml, win_arg);
      }
    }
  },

  /** __ onAbout ______________________________________________________
   */
  onAbout : function()
  {
    openDialog(
               "chrome://tidy/content/tidyHelp.xul",
               "",
               "centerscreen,dialog,chrome,dependent"
              );
  },

  /** __ onOptions ______________________________________________________
   */
  onOptions : function()
  {
    openDialog(
               "chrome://tidy/content/tidyOptions.xul",
               "",
               "centerscreen,dialog=no,chrome,resizable,dependent,modal"
              );
    this.initIcon();
  },

  /** __ onLinks ______________________________________________________
   */
  onLinks : function()
  {
    openDialog(
               "chrome://tidy/content/tidyLinks.xul",
               "",
               "centerscreen,dialog=no,chrome,resizable",
               window.content.document.URL
              );
  },


  /** __ onIcon ______________________________________________________
   */
  onIcon : function( value )
  {
    // Values are icon_text, icon_only
    oTidyUtil.setCharPref( "browser_icon", value );
    this.initIcon();
  },

  /** __ onDisable ______________________________________________________
   */
  onDisable : function()
  {
    oTidyUtil.setBoolPref( "browser_enable", !oTidyUtil.getBoolPref( "browser_enable" ) );
    this.initIcon();
  },

  /** __ onDisableSite ______________________________________________________
   */
  onDisableSite : function()
  {
    oTidyUtil.addPermList( oTidyUtil.getDocURI(window.content.document) );
    oTidyUtil.permDialog();
    this.initIcon();
  },

  /** __ changeParser ______________________________________________________
   */
  changeParser : function()
  {
    var isTidyParser = oTidyUtil.getCharPref("algorithm") == "tidy";
    oTidyUtil.setCharPref("algorithm", isTidyParser? "sp":"tidy");

    this.emptyTidyResult( window.content );
    this.validateFrame( window.content );
    this.updateStatusBar();
  },

  /** __ emptyTidyResult ______________________________________________________
   *
   * It sets tidyResult properties to null
   * parameter requires window.content
   */
  emptyTidyResult : function( main_page )
  {
      main_page.document.tidyResult = null;

      var frm = main_page.frames;
      for (var i=0; i<frm.length; ++i)
      {
        this.emptyTidyResult( frm[i] );
      }
  },

  /** __ TEST TEST TEST ______________________________________________________
   */
  onTestLinks: function()
  {
    const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
    var main_frame=window.content;
    var data = main_frame.document.URL+"\n\n";
    var html = oTidyBrowser.getHtmlFromCache( main_frame.document, false );

    // The inout arguments need to be JavaScript objects
    var nbError = {value:0};
    var nbWarning = {value:0};
    var nbAccessWarning = {value:0};
    var nbHidden = {value:0};
    var links ={value:"---"};
    var accessLevel = oTidyUtil.getIntPref( "accessibility-check" );

    oTidyUtil.tidy.getLinks( html, oTidyUtil.getPrefConfig(), accessLevel, links, nbError, nbWarning, nbAccessWarning, nbHidden );
    data += links.value + "\n";

    var res = new TidyResult();
    res.iNbError = nbError.value;
    res.iNbWarning = nbWarning.value;
    res.iNbAccessWarning = nbAccessWarning.value;
    res.iNbHidden = nbHidden.value;

    clipboardHelper.copyString(data);
  },

  onTestSp: function()
  {
    const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
    var main_frame=window.content;
    var data = main_frame.document.URL+"\n\n";
    var html = oTidyBrowser.getHtmlFromCache( main_frame.document, false );

    // The inout arguments need to be JavaScript objects
    var nbError = {value:0};
    var nbWarning = {value:0};
    var nbAccessWarning = {value:0};
    var nbHidden = {value:0};
    var error ={value:"---"};
    var accessLevel = oTidyUtil.getIntPref( "accessibility-check" );

    oTidyUtil.tidy.spGetErrorsInHTML( html, "", accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
    // alert( "error: " + nbError.value + " / warning : " + nbWarning.value );

    data += "\n error: "+ nbError.value-1;
    data += "\n warning: "+ nbWarning.value;
    data += "\n access warning: "+ nbAccessWarning.value;
    data += "\n hidden: "+ nbHidden.value;

    clipboardHelper.copyString(data);
  },

  onTestQueue: function()
  {
    var item1 = new TidyItemQueue( "1", null, 0 );
    var item2 = new TidyItemQueue( "2", null, 0 );
    var item3 = new TidyItemQueue( "3", null, 0 );
    var item4 = new TidyItemQueue( "4", null, 0 );
    oTidyBrowser.oEventQueue.firstItem = null;
    oTidyBrowser.oEventQueue.lastItem = null;
    oTidyBrowser.oEventQueue.push( item1 );
    oTidyBrowser.oEventQueue.push( item2 );
    oTidyBrowser.oEventQueue.push( item3 );
    oTidyBrowser.oEventQueue.push( item4 );
    var item;
    item = oTidyBrowser.oEventQueue.pop();
    alert( item.html );
    item = oTidyBrowser.oEventQueue.pop();
    alert( item.html );
    item = oTidyBrowser.oEventQueue.pop();
    alert( item.html );
    item = oTidyBrowser.oEventQueue.pop();
    alert( item.html );
  }
}

//----------------------------------------------------------------------------------------------

function onTidyBrowserTopLoad( event )
{
  if( oTidyBrowser==null )
  {
    oTidyBrowser = new TidyBrowser();
    if( oTidyTabChangeObserver==null )
    {
      oTidyUtil.tidy.log( '<JAVASCRIPT>onTidyBrowserTopLoad' );

      oTidyTabChangeObserver = new TidyTabChangeObserver();
      var main_frame = document.getElementById("content");
      main_frame.addProgressListener(oTidyTabChangeObserver);

      // var oObsService = Components.classes["@mozilla.org/observer-service;1"].getService();
      // var oObsInterface = oObsService.QueryInterface(Components.interfaces.nsIObserverService);
      // oObsInterface.addObserver(tidyEndDocumentLoadObserver, "EndDocumentLoad", false);
      gBrowser.addEventListener("load", onTidyPageLoad, true);
    }
  }
}

/**
 * New event in Firefox 1.4
 * If the extension was Firefox 1.4 only onTidyBrowserTopLoad could be removed
 */
function onTidyBrowserTopPageShow( event )
{
  try
  {
     oTidyUtil.tidy.log( '<JAVASCRIPT>onTidyBrowserTopPageShow' );

    if( !oTidyBrowser.bIgnorePageShow )
    {
      oTidyBrowser.updateStatusBar();
      // Work-around for bug 312027
      onTidyBrowserTopLoad( event );
    }
    oTidyBrowser.bIgnorePageShow = false;
  }
  catch(ex)
  {}
}