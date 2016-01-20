//*************************************************************************
// HTML Validator
//
//  File: tidyUtil.js
//  Description: common javascript functions used by the extension
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

"use strict";

//-------------------------------------------------------------

var oTidyUtil;
var tidyExtensionGUID = '{3b56bcc7-54e5-44a2-9b44-66c3ef58c13e}';

//-------------------------------------------------------------

function onLoadTidyUtil()
{
  oTidyUtil = new TidyUtil();
}

function onUnloadTidyUtil()
{
  oTidyUtil = null;
}

function tidyUtilOpenUrl(aEvent, aTWC)
{
  var url = aEvent.currentTarget.getAttribute("url");
  tidyUtilOpenUrl2( url )
}

function tidyUtilOpenUrl2(url)
{
  //get a navigator window
  var windowManager = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService();
  var windowManagerInterface = windowManager.QueryInterface( Components.interfaces.nsIWindowMediator);
  var win = windowManagerInterface.getMostRecentWindow("navigator:browser");
  if( !win )
  {
    win = window.openDialog("chrome://browser/content/browser.xul", "_blank", "chrome,all,dialog=no", "about:blank", null, null);
  }
  var browser = win.document.getElementById("content");
  // open a new tab and focus on it
  var tab = browser.addTab(url);
  browser.selectedTab = tab;
  //  browser.loadURI(url);
}

function tidyShowExceptionInConsole( ex )
{
  Components.utils.import("resource://gre/modules/devtools/Console.jsm");
  console.error("Tidy Exception: ", ex, " / Stack: ", ex.stack );
}

//-------------------------------------------------------------

function tidyUtilGetInstallDir()
{
  var dirServiceProp = Components.classes["@mozilla.org/file/directory_service;1"];
  dirServiceProp = dirServiceProp.getService(Components.interfaces.nsIProperties);
  var dir = dirServiceProp.get("CurProcD", Components.interfaces.nsIFile);
  return dir;
}

function tidyUtilGetProfileDir()
{
  var dirServiceProp = Components.classes["@mozilla.org/file/directory_service;1"];
  dirServiceProp = dirServiceProp.getService(Components.interfaces.nsIProperties);
  var profileDir = dirServiceProp.get("ProfD", Components.interfaces.nsIFile);
  return profileDir;
}

function tidyUtilGetHome()
{
  var profileDir = tidyUtilGetProfileDir();
  var home = profileDir.clone();
  home.append('extensions');
  home.append(tidyExtensionGUID);
  return home;
}

function tidyUtilGetHome2()
{
  var profileDir = tidyUtilGetInstallDir();
  var home = profileDir.clone();
  home.append('extensions');
  home.append(tidyExtensionGUID);
  return home;
}

function tidyUtilGetXPIFile(filename)
{
  var home = tidyUtilGetHome();
  var componentFile = home.clone();
  componentFile.append(filename);
  return componentFile;
}

// Works only in Firefox 1.5+
// Get the extension directory using the nsIExtensionManager
function tidyUtilGetExtensionDir()
{
  var ext = Components.classes["@mozilla.org/extensions/manager;1"]
                      .getService(Components.interfaces.nsIExtensionManager)
                      .getInstallLocation(tidyExtensionGUID)
                      .getItemLocation(tidyExtensionGUID);
  return ext;
}

//-------------------------------------------------------------

function tidyUtilGetPlatform()
{
  var platform = navigator.platform.toLowerCase();
  if (platform.indexOf('linux') != -1)
  {
    return 'unix';
  }
  if (platform.indexOf('mac') != -1)
  {
    return 'mac';
  }
  if (platform.indexOf('bsd') != -1)
  {
    return 'unix';
  }
  return 'windows';
}

//-------------------------------------------------------------
// TidyUtil
//-------------------------------------------------------------

function TidyUtil()
{
  // init all the control with the values from the preferences
  var pref_service = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
  this.branch = pref_service.getBranch("tidy.options.");

  this.bNewInstall = this.isNewInstall();
  if( this.bNewInstall )
  {
    try
    {
      // It it an new install but is it an upgrade ?
      if( this.getIntPref("highlight_max")>-1 )
      {
         this.bUpgrade = true;
      }
    }
    catch (ex) {}
    // this.setBoolPref( "browser_hide", false );
    this.setBoolPref( "browser_enable", true );
    this.setBoolPref( "warning_line_number", true );
  }
  // WA for 0.964
  // There are 2 problems with it
  // 1) this code should be in this.bNewInstall
  // 2) ideally the HTML validator should work with View Source Tab too (this will probably brake fast)
  var view_source_branch = pref_service.getBranch("view_source.");
  view_source_branch.setBoolPref( "syntax_highlight", true );
  view_source_branch.setBoolPref( "wrap_long_lines", false );
  view_source_branch.setBoolPref( "tab", false );

  // Check if the preferences exists
  this.setDefaultValueBool( "show-warnings",         true );
  this.setDefaultValueInt ( "show-errors",           6 );
  this.setDefaultValueInt ( "accessibility-check",   -1 );
  this.setDefaultValueBool( "viewsource_enable",     true );
  this.setDefaultValueBool( "viewsource_enable_once",false );

  this.setDefaultValueBool( "indent",                false );
  this.setDefaultValueInt ( "indent-spaces",         2 );
  this.setDefaultValueBool( "uppercase-tags",        false );
  this.setDefaultValueBool( "uppercase-attributes",  false );
  this.setDefaultValueInt ( "wrap",                  68 );
  this.setDefaultValueBool( "output-xhtml",          false );
  this.setDefaultValueBool( "output-html",           false );
  this.setDefaultValueBool( "clean",                 false );
  this.setDefaultValueChar( "filter",                "" );
  this.setDefaultValueChar( "doctype",               "auto" );
  this.setDefaultValueChar( "output-encoding",       "utf8" );

  this.setDefaultValueBool( "debug",                 false );
  this.setDefaultValueChar( "browser_icon",          "icon_only" );
  this.setDefaultValueBool( "browser_enable",        true );
  // this.setDefaultValueBool( "browser_hide",          false );
  this.setDefaultValueBool( "highlight_line",        true );
  this.setDefaultValueInt ( "highlight_max",         100 );
  this.setDefaultValueBool( "show_line_number",      true );
  this.setDefaultValueChar( "disabled_action",       "viewsource" );
  this.setDefaultValueChar( "dbclick_action",        "viewsource" );
  this.setDefaultValueBool( "background",            false );
  this.setDefaultValueBool( "force_frame_revalidation",      false );
  this.setDefaultValueChar( "version",               "0.0" );
  // this.setDefaultValueBool( "warning_line_number",   true );

  this.setDefaultValueChar( "algorithm",             "serial" ); // tidy, sp, serial

  try
  {
    this.tidy = new TidyLib();
  }
  catch(ex)
  {
    Components.utils.reportError( "Tidy: Can not load the DYNAMIC LIBRARY" );
  }
  if( this.tidy )
  {
    var libraryVersion = {value:0};
    var platform = tidyUtilGetPlatform();
    var file = tidyUtilGetProfileDir();
    file.append("tidy");
    if( !file.exists() || !file.isDirectory() )
    {  // if it doesn't exist, create
      var PERMS_DIRECTORY = parseInt("0755", 8);
      file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, PERMS_DIRECTORY);
    }
    this.tidy.initDiagLog( file.path, this.getBoolPref("debug") );
    this.tidy.getLibraryVersion( libraryVersion );
    this.tidy.log( "Library version: " + libraryVersion.value );

    this.buildFilterArray();

    try
    {
      var lS = Components.classes ["@mozilla.org/intl/nslocaleservice;1"].getService(Components.interfaces.nsILocaleService);
      var lang = lS.getLocaleComponentForUserAgent();
      this.defaultLanguage = lang.length == 2? lang+"-"+lang.toUpperCase():lang;
    }
    catch (ex) {}
  }

  try
  {
    this.permManager = Components.classes["@mozilla.org/permissionmanager;1"].getService(Components.interfaces.nsIPermissionManager);
  }
  catch(ex)
  {
    // Permission manager exists in Firefox 1.5 and higher only
  }
}

TidyUtil.prototype =
{
  branch          : null,
  tidy            : null,
  filterArrayTidy : null,
  filterArraySP   : null,
  filterArrayOnline : null,
  stringBundle    : null,
  tidyFaqUrl      : null,
  permManager     : null,
  defaultLanguage : "en-US",
  bNewInstall     : false,
  bUpgrade        : false,
  bTranslation    : false,

  isNewInstall : function()
  {
    try
    {
      var prefVersion = this.getCharPref( "version" );
      var curVersion = "0.964";
      if (curVersion > prefVersion)
      {
        this.setCharPref("version", curVersion);
        return true;
      }
    }
    catch (ex)
    {
      tidyShowExceptionInConsole( ex );
      return true;
    }
    return false;
  },

  getPrefConfig : function()
  {
    var sConfig = "";

    sConfig += this.prefConfigLineBool( "show-warnings" );
    sConfig += this.prefConfigLineInt ( "show-errors" );
    sConfig += this.prefConfigLineBool( "indent" );
    sConfig += this.prefConfigLineInt ( "indent-spaces" );
    sConfig += this.prefConfigLineBool( "uppercase-tags" );
    sConfig += this.prefConfigLineBool( "uppercase-attributes" );
    sConfig += this.prefConfigLineInt ( "wrap" );
    sConfig += this.prefConfigLineBool( "output-xhtml" );
    sConfig += this.prefConfigLineBool( "output-html" );
    sConfig += this.prefConfigLineBool( "clean" );
    sConfig += this.prefConfigLineChar( "doctype" );
    sConfig += this.prefConfigLineChar( "output-encoding" );

    // accessibility check "-1" is a trick for removing
    // the table summary and img alt warnings.
    // 0 is the default value
    if( this.getIntPref( "accessibility-check" )>0 )
    {
      sConfig += this.prefConfigLineInt ( "accessibility-check" );
    }

    return sConfig;
  },

  //-------------------------------------------------------------------------

  getBoolPref : function( pref )
  {
    return( this.branch.getBoolPref( pref ) );
  },
  setBoolPref : function(name, value)
  {
    this.branch.setBoolPref( name, value );
  },
  getIntPref : function( pref )
  {
    return( this.branch.getIntPref( pref ) );
  },
  setIntPref : function(name, value)
  {
    this.branch.setIntPref( name, value );
  },
  getCharPref : function( pref )
  {
    return( this.branch.getCharPref( pref ) );
  },
  setCharPref : function(name, value)
  {
    this.branch.setCharPref( name, value );
  },

  //-------------------------------------------------------------------------

  prefConfigLineBool : function( pref )
  {
    return( pref + " " + (this.branch.getBoolPref( pref )?"yes":"no") + "\n" );
  },
  prefConfigLineInt : function( pref )
  {
    return( pref + " " + this.branch.getIntPref( pref ) + "\n" );
  },
  prefConfigLineChar : function( pref )
  {
    return( pref + " " + this.branch.getCharPref( pref ) + "\n" );
  },

  //-------------------------------------------------------------------------

  initCheckbox : function( name )
  {
    var control_name = "tidy.options."+name
    document.getElementById(control_name).checked = this.branch.getBoolPref( name );
  },
  saveCheckbox : function( name )
  {
    var control_name = "tidy.options."+name
    this.branch.setBoolPref( name, document.getElementById(control_name).checked );
  },
  initTextbox : function( name )
  {
    var control_name = "tidy.options."+name
    document.getElementById(control_name).value = this.branch.getIntPref( name );
  },
  saveTextbox : function( name )
  {
    var control_name= "tidy.options."+name
    this.branch.setIntPref( name, document.getElementById(control_name).value );
  },
  initCharTextbox : function( name )
  {
    var control_name = "tidy.options."+name
    document.getElementById(control_name).value = this.branch.getCharPref( name );
  },
  saveCharTextbox : function( name )
  {
    var control_name= "tidy.options."+name
    this.branch.setCharPref( name, document.getElementById(control_name).value );
  },
  initComboBox : function( name )
  {
    var control_name = "tidy.options."+name
    document.getElementById(control_name).value = this.branch.getCharPref( name );
  },
  saveComboBox : function( name )
  {
    var control_name= "tidy.options."+name
    this.branch.setCharPref( name, document.getElementById(control_name).value );
  },

  //-------------------------------------------------------------------------

  setDefaultValueBool : function(name, value)
  {
    if( !this.branch.prefHasUserValue(name) )
    {
      this.branch.setBoolPref( name, value );
    }
  },
  setDefaultValueInt : function(name, value)
  {
    if( !this.branch.prefHasUserValue(name) )
    {
      this.branch.setIntPref( name, value );
    }
  },
  setDefaultValueChar : function(name, value)
  {
    if( !this.branch.prefHasUserValue(name) )
    {
      this.branch.setCharPref( name, value );
    }
  },

  //-------------------------------------------------------------------------

  /**
   * resetFilterArray
   */
  resetFilterArray : function()
  {
    // List of the shown errors and warnings
    this.filterArrayTidy = new Array();
    this.filterArraySP = new Array();
    this.filterArrayOnline = new Array();
    // Reset the fast filter in the tidylib
    this.tidy.resetFilter();
  },

  /**
   * addToFilterArray
   */
  addToFilterArray : function(id)
  {
    var shortId = id.substring(1);

    if( id[0]=='s' )
    {
      this.filterArraySP[shortId] = false;
    }
    else if( id[0]=='o' )
    {
      this.filterArrayOnline[shortId] = false;
    }
    else if( id[0]=='t' )
    {
      this.filterArrayTidy[shortId] = false;
      this.tidy.filterMsg( shortId );
    }
    else
    { // old format
      this.filterArrayTidy[id] = false;
      this.tidy.filterMsg( id );
    }
  },

  /**
   * Build the Filter array
   */
  buildFilterArray : function()
  {
    this.resetFilterArray();

    // List of the hidden errors and warnings
    var filterString = this.getCharPref( "filter" );
    //alert("filterString.length"+filterString.length);
    if( filterString.length > 0 )//here is the bug
    {
      var filterHideArray = filterString.split(',');
      for( var o in filterHideArray )
      {
        this.addToFilterArray( filterHideArray[o] );
      }
    }
  },

  /**
   * Save the filter array in pref
   */
  saveFilterArrayInPref : function()
  {
    var value = "";
    var bFirst = true;

    // Tidy
    for( var o in this.filterArrayTidy )
    {
      if( this.filterArrayTidy[o]==false )
      {
        value = value+"t"+o+",";
      }
    }
    // SP
    for( var o in this.filterArraySP )
    {
      if( this.filterArraySP[o]==false )
      {
        value = value+"s"+o+",";
      }
    }
    // Online
    for( var o in this.filterArrayOnline )
    {
      if( this.filterArrayOnline[o]==false )
      {
        value = value+"o"+o+",";
      }
    }
    value = value.substring( 0, value.length-1 );
    this.setCharPref( "filter", value );
  },

  /** __ showFaq ________________________________________________________________
   *
   * Show the faq URL (called by a timer)
   */
  showFaq : function()
  {
    if( this.bNewInstall || this.bUpgrade )
    {
       oTidyUtil.tidy.log( 'showFaq' );

      // Add the new toolbaritem in the navbar or addon bar.
      try
      {
        var addonbar = document.getElementById("addon-bar");
        var toolbarItem = document.getElementById("tidy-toolbar-item");

        if( toolbarItem )
        {
           oTidyUtil.tidy.log( 'showFaq:  toolbaritem is found' );
          // Do nothing the toolbaritem is already there
        }
        else
        {
          var bar;
          var toolbarId;
          if( addonbar && addonbar.collapsed )
          {
            // if addon bar not visible, add it in the navbar
            toolbarId = "nav-bar";
            this.setCharPref( "browser_icon", "icon_only" );
          }
          else
          {
            // if addon bar is visible, add it there
            toolbarId = "addon-bar";
          }
          oTidyUtil.tidy.log( 'showFaq:  toolbarId='+ toolbarId );
          var toolbar = document.getElementById(toolbarId);
          toolbar.insertItem("tidy-toolbar-item", null);
          toolbar.setAttribute("currentset", toolbar.currentSet);
          oTidyUtil.tidy.log( 'showFaq:  toolbar.currentSet='+ toolbar.currentSet );
          document.persist(toolbar.id, "currentset");
        }
      }
      catch(e)
      {
        oTidyUtil.tidy.log( 'showFaq-002 - exception ='+ e );
      }
    }

    if( this.bNewInstall && !this.bUpgrade )
    {
      /*
      // Enable the addon-bar
      var addonbar = document.getElementById("addon-bar");
      if( addonbar )
      {
        addonbar.collapsed = false;
      }
      */
      openDialog(
                  "chrome://tidy/content/tidyWelcome.xul",
                  "",
                 "centerscreen,dialog,chrome,dependent,modal"
                );
    }
    tidyUtilOpenUrl2( this.tidyFaqUrl );
  },

  /** __ saveFile ________________________________________________________________
   *
   * Utility function to save data to a file
   */
  /// XXXXXXXXX NOT USED ANYMORE
  saveFile : function(data, url)
  {
    const MODE = 0x2A;                // MODE_WRONLY | MODE_CREATE | MODE_TRUNCAT
    const PERM = parseInt("0644", 8); // PERM_IRUSR | PERM_IWUSR | PERM_IRGRP | PERM_IROTH

    try
    {
      var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(url);
      var os = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
      os.init(file, MODE, PERM, 0);
      os.write(data, data.length);
    }
    catch (ex)
    {
      alert(ex);
    }
  },

  /** __ selectionOn ___________________________________________________________
   *
   * Reenable the selection after a new page is shown.
   * Why is it needed ? Mystery ?
   */
  selectionOn : function(xulBrowser)
  {
    const nsISelectionController = Components.interfaces.nsISelectionController;
    var selCon = xulBrowser.docShell
       .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
       .getInterface(Components.interfaces.nsISelectionDisplay)
       .QueryInterface(nsISelectionController);
    selCon.setDisplaySelection(nsISelectionController.SELECTION_ON);
  },

  /** __ cleanupDialog ___________________________________________________________
   *
   * Call the cleanup dialog box
   */
  cleanupDialog : function(aResult, aHtml, aWinArg)
  {
    if( aResult==null || (aResult.algorithm!="tidy" && aResult.algorithm!="serial") )
    {
      aResult = new TidyResult();
      aResult.validate_with_algorithm( aHtml, "tidy" );
    }

    if( aResult.iNbError>0 )
    {
      // Show a confirmation dialog
      var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                          .getService(Components.interfaces.nsIPromptService);
      var flags=promptService.BUTTON_TITLE_YES * promptService.BUTTON_POS_0 +
                promptService.BUTTON_TITLE_NO * promptService.BUTTON_POS_1;
      var stringBundle = document.getElementById("tidy.string.bundle");
      var err = aResult.iNbError+" "+stringBundle.getString( (aResult.iNbError>1?"tidy_errors":"tidy_error") );
      var msg = stringBundle.getFormattedString("tidy_cleanup_error", [err]);

      var result = promptService.confirmEx(window, this.getString("tidy_cleanup"), msg, flags, null, null, null, null, {} );

      if( result==1 )
      {
        return;
      }
    }
    openDialog(
               "chrome://tidy/content/tidyCleanup.xul",
               "",
               "centerscreen,dialog=no,chrome,resizable",
               aHtml,
               aWinArg
             );
   },

  /** __ permDialog ___________________________________________________________
   *
   * Call the permission dialog box
   */
  permDialog: function()
  {
    var params =
    {
      permissionType: "tidy",
      windowTitle: oTidyUtil.getString("tidy_perm_title"),
      introText: oTidyUtil.getString("tidy_perm_intro"),
      blockVisible: true, sessionVisible: false, allowVisible: true, prefilledHost: ""
    };
    openDialog( "chrome://browser/content/preferences/permissions.xul",
                "_blank",
                "resizable,dialog=no,centerscreen,dependent,modal",
                params
              );
  },

  /** __ getString ___________________________________________________________
   */
  getString : function(aName)
  {
    if( this.stringBundle==null )
    {
      this.stringBundle = document.getElementById("tidy.string.bundle");
      if( this.stringBundle==null )
      {
        return "";
      }
    }
    return this.stringBundle.getString( aName );
  },

  /** __ isPerm....... ___________________________________________________________
   */
  isPermAllowed: function(uri)
  {
    if( this.permManager && uri )
      return (this.permManager.testPermission(uri, "tidy") == Components.interfaces.nsIPermissionManager.ALLOW_ACTION );
    else
      return false;
  },

  isPermDenied: function(uri)
  {
    if( this.permManager && uri )
      return (this.permManager.testPermission(uri, "tidy") == Components.interfaces.nsIPermissionManager.DENY_ACTION );
    else
      return false;
  },

  /** __ addPermList ___________________________________________________________
   */
  addPermList: function(uri)
  {
    var browser_enable = this.getBoolPref( "browser_enable" );
    var bAllow = ( browser_enable  && !this.isPermDenied( uri ) ) || this.isPermAllowed( uri );

    if( uri )
    {
      if( !bAllow )
      {
        if( this.isPermDenied( uri ) )
          this.permManager.remove(uri.host, "tidy");
        else
          this.permManager.add(uri, "tidy", Components.interfaces.nsIPermissionManager.ALLOW_ACTION);
      }
      else
      {
        if( this.isPermAllowed( uri ) )
          this.permManager.remove(uri.host, "tidy");
        else
          this.permManager.add(uri, "tidy", Components.interfaces.nsIPermissionManager.DENY_ACTION);
      }
    }
  },

  /** __ isInDomainList ___________________________________________________________
   */
  isInDomainList : function(doc)
  {
    try
    {
      if( doc.location.protocol=="about:" )
      {
        return false;
      }

      if( doc.location.protocol=="file:" )
      {
        return true;
      }

      if( this.isPermDenied( this.getDocURI(doc) ) )
      {
        return false;
      }
    }
    catch(ex)
    {}
    return true;
  },

  /** __ getDocHost ____________________________________________________________
  */
  getDocURI: function(doc)
  {
    try
    {
       var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
       var host = doc.location.host;
       var uri = ioService.newURI("http://" + host, null, null);
       return uri;
    }
    catch (exc)
    {
     return null;
    }
  },

  /** __ translation ___________________________________________________________
   *
   * Load the translation from the tidy.properties file in the tidy lib
   */
  translation : function()
  {
    if( this.tidy.initTranslation() )
    {
      // Init SGML path for DTDs
      // In Seamonkey, it is the install dir
      var f = tidyUtilGetInstallDir();
      f.append("sgml-lib");
      if( !f.exists() )
      {
        // On other platforms, it stays in the extension directory
        f = tidyUtilGetHome();
        f.append("sgml-lib");
        if( !f.exists() )
        {
          // When installed with --install-global-extension, it is again somewhere else...
          f = tidyUtilGetExtensionDir();
          f.append("sgml-lib");
        }
      }
      var f2 = f.clone();
      f.append("sgml.soc");
      f2.append("xml.soc");
      this.tidy.spInit( f.path, f2.path );

      try
      {
        // Does not load the us translation when not in debug mode
        if( oTidyUtil.getBoolPref("debug") || this.defaultLanguage!="en-US" )
        {
          var id_list ={value:""};
          this.tidy.getIdOfAllErrors( id_list );
          var id_array = id_list.value.split(',');
          var t = "";
          for (var id in id_array)
          {
            t += this.getString("tidy_"+id_array[id]) + "\n";
          }
          this.tidy.addTranslations( t );
          var prefix = this.getString("tidy_prefix") ;
          var linecol = this.getString("tidy_linecol")+" ";

          this.tidy.setTranslationPrefix( prefix, linecol );
          this.tidy.checkTranslation();

          this.buildFilterArray();
        }
        // Translate the description of the extension.
        var tidydesc = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService).getBranch("extensions.{3b56bcc7-54e5-44a2-9b44-66c3ef58c13e}.");
        var descstr  = Components.classes[ "@mozilla.org/supports-string;1" ].createInstance( Components.interfaces.nsISupportsString );
        descstr.data = this.getString("tidy_extension_desc");
        tidydesc.setComplexValue("description", Components.interfaces.nsISupportsString, descstr);
      }
      catch( e )
      {
        oTidyUtil.tidy.log( '<ERROR>translation exception, defaultLanguage= ' + this.defaultLanguage );
      }
    }
  },

  /** __ getErrors ___________________________________________________________
   *
   * Load the translation from the tidy.properties file in the tidy lib
   */
  getErrors : function( ahtml, config, nbError, nbWarning, nbAccessWarning, nbHidden )
  {
    // TODO
  },

 /** __ sortArray _____________________________________________________________
  *
  */
  sortArray : function( array, col, descending )
  {
    array.sort
    (
      function( l1, l2 )
      {
        var v1 = l1[col];
        var v2 = l2[col];
        if( l1.errorId<0 )
        {
          if( l2.errorId<0 )
          {
            return l1.errorId<l2.errorId?1:-1;
          }
          return -1;
        }
        if( l2.errorId<0 )
        {
          return 1;
        }

        var res = 0;
        if( v1>v2 )
        {
          res = 1;
        }
        else if( v1<v2 )
        {
          res = -1;
        }
        else
        {
          // second criteria line number
          if( l1.line>l2.line )
          {
            res = 1;
          }
          else if ( l1.line<l2.line )
          {
            res = -1;
          }
          else
          {
            if( l1.column>l2.column )
            {
             res = 1;
            }
            else if ( l1.column<l2.column )
            {
             res = -1;
            }
          }
        }
        return descending?-res:res;
      }
    );
  },

 /** __ onlineSplash ___________________________________________________________________
  *
  * Show the splah before online validation
  */

  onlineSplash: function( title )
  {
     var page = window.open("about:blank");
     var doc = page.content.document;
     var body = doc.body;

     body.appendChild( doc.createElement("br") );
     var center = doc.createElement("center");
     var div = doc.createElement("div");
     div.setAttribute("style", "width: 400px; background-color: #eee; border: solid 1px;");
     div.appendChild( doc.createElement("br") );
     div.appendChild( doc.createTextNode(title));
     div.appendChild( doc.createElement("br") );
     div.appendChild( doc.createTextNode("Please wait"));
     div.appendChild( doc.createElement("br") );
     div.appendChild( doc.createElement("br") );
     center.appendChild( div );
     body.appendChild( center );
     return doc;
  },

 /** __ onlineHtmlValidate _____________________________________________________________
  *
  * Validate the HTML online to W3C Validator
  */
  onlineHtmlValidate: function( html )
  {
    var doc = this.onlineSplash("Contacting the W3C HTML Validator");

    var formElement = doc.createElement("form")
    formElement.setAttribute("method", "post");
    formElement.setAttribute("enctype", "multipart/form-data");
    formElement.setAttribute("action", "http://validator.w3.org/nu");
    formElement.setAttribute("style", "display: none;");

    var textAreaElement = doc.createElement("textarea")
    textAreaElement.setAttribute("name", "fragment");
    textAreaElement.appendChild( doc.createTextNode(html) );
    formElement.appendChild(textAreaElement);

    doc.body.appendChild(formElement);
    formElement.submit();
  },

 /** __ onlineCssValidate _____________________________________________________________
  *
  * Validate the CSS online to W3C CSS Validator
  */
  onlineCssValidate: function( url )
  {
    var doc = this.onlineSplash("Contacting the W3C CSS Validator");

    var formElement = doc.createElement("form")
    formElement.setAttribute("method", "get");
    formElement.setAttribute("action", "http://jigsaw.w3.org/css-validator/validator");
    formElement.setAttribute("style", "display: none;");

    var inputElement = doc.createElement("input")
    inputElement.setAttribute("name", "uri");
    inputElement.setAttribute("value", url);
    formElement.appendChild(inputElement);

    var inputElement2 = doc.createElement("input")
    inputElement2.setAttribute("name", "usermedium");
    inputElement2.setAttribute("value", "all");
    formElement.appendChild(inputElement2);

    doc.body.appendChild(formElement);
    formElement.submit();
  },

 /** __ getDocInnerHtml _________________________________________________________
  *
  * Get the document.body.innerHTML enveloped in a dummy html/body tags
  */
  getDocInnerHtml: function( doc )
  {
    var sHtml = "";
    var isXhtml = false;
    if( doc.doctype )
    {
      if( doc.doctype.publicId=="" )
      {
        sHtml = "<!doctype html>\n";
        // HTML 5
      }
      else
      {
        sHtml = "<!DOCTYPE "+doc.doctype.name+" PUBLIC \""+doc.doctype.publicId+"\">\n";
        isXhtml = ( sHtml.toUpperCase().indexOf("XHTML") >= 0 );
        if( isXhtml )
        {
          if( doc.doctype.publicId.indexOf("Transitional") >= 0 )
          {
            sHtml = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n";
          } else
          {
            sHtml = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n";
          }
          sHtml += "<!-- XHTML doctype changed to HTML 4.0.1 (See documentation) -->\n";
        }
      }
    }

    sHtml += "<!-- HTML after JavaScript execution -->\n"
          + "<html>\n"
          + "<head>\n"
          + doc.getElementsByTagName("head")[0].innerHTML + "\n"
          + "</head>\n"
          + "<body>\n"
          + doc.body.innerHTML
          + "</body>\n"
          + "</html>\n";

    return sHtml;
  },

 /** __ writeFile ________________________________________________________________
  *
  */
  writeFile: function( file, content )
  {
    const PERM = parseInt("0644", 8);
    if ( file.exists()==false )
    {
      file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, PERM );
    }
    var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance( Components.interfaces.nsIFileOutputStream );
    fos.init( file, 0x04 | 0x08 | 0x20, PERM, 0 );

    var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
    os.init(fos, "UTF-8", 0, 0x0000);
    os.writeString( content );

    os.close();
    fos.close();
  },

 /** __ readFile ________________________________________________________________
  *
  */
  readFile: function( file )
  {
    var data = "";
    var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"].
    createInstance(Components.interfaces.nsIFileInputStream);
    var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].
    createInstance(Components.interfaces.nsIConverterInputStream);
    fstream.init(file, -1, 0, 0);
    cstream.init(fstream, "UTF-8", 0, 0);
    var str = {};
    var read = 0;
    do {
        read = cstream.readString(0xffffffff, str); // read as much as we can and put it in str.value
        data += str.value;
    } while (read != 0);
    cstream.close(); // this closes fstream
    return( data );
  },

 /** __ firefoxVersionHigherThan ___________________________________________________
  *
  */
  firefoxVersionHigherThan: function( sVersion )
  {
    // assuming we're running under Firefox
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
    return (versionChecker.compare(appInfo.version, sVersion) >= 0);
  },

 /** __ firefoxVersionEqual ___________________________________________________
  *
  */
  firefoxVersionEqual: function( sVersion )
  {
    // assuming we're running under Firefox
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
    return (versionChecker.compare(appInfo.version, sVersion) == 0);
  },

 /** __ getCSEInstallDir ____________________________________________________________
  *
  */
  getCSEInstallDir: function()
  {
    // HKEY_CURRENT_USER\Software\AI Internet Solutions\CSE HTML Validator v4\InstallDir
    var sInstallDir = null;
    try
    {
      var wrk = Components.classes["@mozilla.org/windows-registry-key;1"].createInstance(Components.interfaces.nsIWindowsRegKey);
      wrk.open(wrk.ROOT_KEY_CURRENT_USER, "Software", wrk.ACCESS_READ);
      if (wrk.hasChild("AI Internet Solutions")) {
      var subkey = wrk.openChild("AI Internet Solutions\\CSE HTML Validator v4", wrk.ACCESS_READ);
      if (subkey.hasValue("InstallDir"))
        sInstallDir = subkey.readStringValue("InstallDir");
      subkey.close();
      }
      wrk.close();
    }
    catch (ex) {};
    return sInstallDir;
  },

 /** __ runCSE ____________________________________________________________
  *
  */
  runCSE: function( args, bWait )
  {
    /*
    var prog = oTidyUtil.getCSEInstallDir() + "\\cmdlineprocessor.exe";
    // create an nsILocalFile for the executable
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(prog);

    // create an nsIProcess
    var process = Components.classes["@mozilla.org/process/util;1"].createInstance(Components.interfaces.nsIProcess);
    process.init(file);

    // Run the process.
    // If first param is true, calling thread will be blocked until
    // called process terminates.
    // Second and third params are used to pass command-line arguments
    // to the process.
    process.run(bWait, args, args.length);
    */
  }
}

//-------------------------------------------------------------
// TidyResult
//-------------------------------------------------------------

function TidyResult( doc )
{
  if( doc!=null )
  {
    this.lastURL = doc.URL;
  }
}

TidyResult.prototype =
{
  lastURL : null,
  algorithm : "tidy",
  iNbError : 0,
  iNbWarning : 0,
  iNbAccessWarning : 0,
  iNbHidden : 0,
  bInDomainList : true,
  bValidated : false,
  bUConvFailed : false,
  bEmpty : false,
  bHTML5 : false,

  /** __ getPluralString ______________________________________________________
   */
  getPluralString : function(nb,s)
  {
    if( nb==0 )
    {
      return "tidy_0_"+s+"s";
    }
    else if( nb==1 )
    {
      return "tidy_"+s;
    }
    else
    {
      return "tidy_"+s+"s";
    }
  },

  /** __ getErrorString ______________________________________________________
   *
   * Build a error string for a page
   */
  getErrorString : function()
  {
    var str;
    if( this.bUConvFailed )
    {
       str = oTidyUtil.getString('tidy_invalid_char');
    }
    else if( ! this.bValidated )
    {
      if( this.bHTML5 )
      {
        // XXXX needs translation
        str = "HTML 5 - see Page Source";
      }
      else if( this.algorithm=="cse" )
      {
        // XXXXXXXXXXXXXXX
        str = "CSE - see Page Source";
      }
      else
      {
        // XXXXXXXXXXXXXXX
        str = "Not validated";
      }
    }
    else if( this.bInDomainList )
    {
      if( this.bEmpty )
      {
        str = oTidyUtil.getString('tidy_empty');
      }
      else
      {
        str =
          this.iNbError    + " " + oTidyUtil.getString( this.getPluralString( this.iNbError, "error") ) + " / " +
          this.iNbWarning  + " " + oTidyUtil.getString( this.getPluralString( this.iNbWarning, "warning")  ) +
          ( this.iNbAccessWarning==0 ? "" : " / "+this.iNbAccessWarning+" "+oTidyUtil.getString( this.getPluralString( this.iNbAccessWarning, "access_warning") )) +
          ( this.iNbHidden==0 ? "" : " ("+this.iNbHidden+" "+oTidyUtil.getString("tidy_hidden")+")" );
      }
    }
    else
    {
      str = oTidyUtil.getString("tidy_not_in_domain");
    }
    return str;
  },

  /** __ getIcon _______________________________________________________
   *
   * Build a error icon for a page
   */
  getIcon : function()
  {
    var icon = "good";
    if( this.bUConvFailed )
    // Normally bUConvFailed page are not validated. But in the case of a SUM of page. The sum is validated
    // and a frame can be "bUConvFailed"
    {
      icon = "charset";
    }
    else if( !this.bValidated )
    {
      if( this.bHTML5 )
      {
        icon = "html5";
      }
      else
      {
        icon = "not_validated";
      }
    }
    else if( this.bInDomainList )
    {
      if( this.bEmpty )
      {
        icon = "empty";
      }
      else if( this.iNbError>0 )
      {
        icon = "error";
      }
      else if( this.iNbWarning>0 )
      {
        icon = "warning";
      }
      else if( this.iNbHidden>0 )
      {
        icon = "hidden";
      }
    }
    else
    {
      icon = "exclude";
    }
    return icon;
  },

  /** __ getErrorIcon _______________________________________________________
   *
   * Build a error icon for a page
   */
  getErrorIcon : function()
  {
    return "chrome://tidy/skin/" + this.getIcon();
  },

  /** __ validate _______________________________________________________
   */
  validate : function( aHtml )
  {
    return this.validate_with_algorithm( aHtml, oTidyUtil.getCharPref("algorithm") );
  },

  /** __ validate_with_algorithm ________________________________________
   */
  validate_with_algorithm : function( aHtml, aAlgorithm )
  {
    // The inout arguments need to be JavaScript objects
    var nbError = {value:0};
    var nbWarning = {value:0};
    var nbAccessWarning = {value:0};
    var nbHidden = {value:0};
    var error ={value:"---"};
    var accessLevel = oTidyUtil.getIntPref( "accessibility-check" );

    var reg5 = /^\s*<\!doctype html>/i;
    var reg5_leg = /^\s*<\!doctype html system .about:legacy-compat.>/i;
    // /i is for case insensitive
    // /s at the beginning to skip the spaces
    if( aAlgorithm!="online" && aAlgorithm!="cse" && ( aHtml.match(reg5) || aHtml.match(reg5_leg) ) )
    {
      this.bHTML5 = true;
      if( window.oTidyViewSource )
      {
        // XXXXXXXXXXXXXX TODO ADD A DIALOG BOX TO ASK YES/NO
        aAlgorithm ="online";
      }
      else
      {
        error = {value:"HTML5 detected: validation cancelled"};
        return error;
      }
    }

    this.algorithm = aAlgorithm;
    if( aAlgorithm=="tidy" )
    {
      oTidyUtil.tidy.getErrorsInHTML( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
      //alert(error.value);
    }
    else if( aAlgorithm=="sp" )
    {
      this.sp_Filter( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
      if( !error.value )
      {
        error = {value:"No error"};
      }
    }
    else if( aAlgorithm=="cse" )
    {
      if( window.oTidyViewSource )
      {
      this.validateCSE( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
      }
      else
      {
        //XXXXXXXXXXXXXXXXXXXXXXX
        error = {value:"cse disabled"};
        return error;
      }
    }
    else if( aAlgorithm=="online" )
    {
      if( window.oTidyViewSource )
      {
        this.validateOnline( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
      }
      else
      {
        //XXXXXXXXXXXXXXXXXXXXXXX
        error = {value:"online disabled"};
        return error;
      }
    }
    else // serial
    {
      this.algorithm = "sp";
      this.sp_Filter( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
      if( nbWarning.value==0 && nbError.value==0 )
      {
        this.algorithm = "tidy";
        oTidyUtil.tidy.getErrorsInHTML( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );
        if( nbWarning.value==0 && nbError.value==0 && nbAccessWarning.value==0 )
        {
          // Promote to serial if all is perfect
          this.algorithm = "serial";
        }
      }
    }
    // alert( "error: " + nbError.value + " / warning : " + nbWarning.value );

    this.iNbError = nbError.value;
    this.iNbWarning = nbWarning.value;
    this.iNbAccessWarning = nbAccessWarning.value;
    this.iNbHidden = nbHidden.value;
    this.bValidated = true;

    return error;
  },

  /** __ isMessageHidable ______________________________________________
    */
/*  isMessageHidable : function()
  {
    if( this.algorithm=="tidy" )
    {
      return true;
    }
    return true;
  },    */

  /** __ sp_Filter _______________________________________________________
    */
  sp_Filter : function( aHtml, PrefConfig, accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden )
  {
    error.value = ".";
    oTidyUtil.tidy.spGetErrorsInHTML( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );

    // Filter enabled for OpenSP ?
    if( oTidyUtil.filterArraySP.length>0 )
    {
      try
      {
        // XXX maybe try to combine this with ViewSource.validateHtml
        // More than 500 errors, we skip the filter
        // Without this, it can cause sometimes an error in the UI: Script: chrome://tidy/content/tidyUtil.js:1161 (Stop) (Continue Script)
        if( nbError.value+nbWarning.value<500 || oTidyViewSource!=null )
        {
          var tmperror ={value:""};
          var rows = error.value.split('\n');
          var isLastSkip=false;
          for (var o in rows)
          {
            var row = new TidyResultRow();
            row.parse( "sp", rows[o], 0 );
            if( row.type==0 && isLastSkip ) //in case the preceding error is followed by a 'start tag was here' info message and that error has been hidden
            {
              //alert("info message to hide detected");
            }
            else
            {
              isLastSkip = row.skip;
              if( row.skip )
              {
                if( row.type==4 )
                {
                  nbHidden.value++;
                  nbError.value--;
                }
                else if( row.type==1 )
                {
                  nbHidden.value++;
                  nbWarning.value--;
                }
              }
              else
              {
                tmperror.value += rows[o] + "\r\n";
              }
            }
          }
          error.value = tmperror.value;
        }
      }
      catch(e)
      {
        // do nothing, we get this exception if nbError.value+nbWarning.value>500 && oTidyViewSource does not exist
      }
    }
  },

  /** __ validateOnline _______________________________________________________
    */
  validateOnline : function( aHtml, PrefConfig, accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden )
  {
    error.value = null;

    // Validate only in view source
    if( !window.oTidyViewSource )
    {
      return;
    }
    var boundary = "---------------------------7da2de3a20016a"
    var message = "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"out\"\r\n\r\n"
                + "json\r\n"
                + "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"fragment\"\r\n\r\n"
                + aHtml + "\r\n"
                + "--" + boundary + "--\r\n";

    var http = new XMLHttpRequest();
    var url = "http://validator.w3.org/nu/";
    var params = "output=json";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "multipart/form-data; boundary="+boundary);
    http.setRequestHeader("Connection", "close");
    http.setRequestHeader("Accept", "*/*");

    /*
    X-W3C-Validator-Errors: 0
    X-W3C-Validator-Recursion: 1
    X-W3C-Validator-Status: Valid
    X-W3C-Validator-Warnings: 2
    */

    http.result = this;
    http.onreadystatechange = function()
    {
      //Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200)
      {

        var error = null;
        try
        {
          error = JSON.parse(http.responseText);
        }
        catch( ex )
        {
          tidyShowExceptionInConsole( ex );
          // Init a dummy error message with the exception
          error = { messages: new Array() };
          error.messages = new Array();
          error.messages[0] = { line: 0, column: 0, type: "error", message: "Online parser error" };
          error.messages[1] = { line: 0, column: 0, type: "error", message: "Go to menu: HTML Validator/W3c Online validator to see the error" };
        }

        var result = http.result;
        result.iNbError = 0;
        result.iNbWarning = 0;
        for (var i = 0; i < error.messages.length; i++)
        {
          if( error.messages[i].type=="warning" )
          {
            result.iNbWarning++;
		  }
          else if( error.messages[i].type=="error" )
          {
            result.iNbError++;
		  }
        }

        if( window && window.oTidyViewSource )
        {
          // XXXX There should be a filtering function call here
          window.oTidyViewSource.parseError( error, result );
        }
        // alert(http.responseText);
      }
    }
    http.send(message);
  },

  /** __ validateCSE _______________________________________________________
    */
  validateCSE : function( aHtml, PrefConfig, accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden )
  {
    error.value = null;

    // Validate only in view source
    if( !window.oTidyViewSource )
    {
      return;
    }
    var input_file = tidyUtilGetProfileDir();
    input_file.append("tidy");
    input_file.append("cse_input.html");
    oTidyUtil.writeFile( input_file, aHtml );

    var output_file = tidyUtilGetProfileDir();
    output_file.append("tidy");
    output_file.append("cse_input.html.val");

    // cmd /c cmdlineprocessor.exe -e,(stdout),0,16 c:\temp\a.html > c:\temp\a.out5
    var args = ["-e,(stdout),0,16", input_file.path ];
    oTidyUtil.runCSE( args, true );

    var output =  oTidyUtil.readFile( output_file );
    error.value = JSON.parse( output );
    nbError.value = error.value.numberoferrors;
    nbWarning.value = error.value.numberofwarnings;
  },

/*
  sp_Filter : function( aHtml, PrefConfig, accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden )
  {
    oTidyUtil.tidy.spGetErrorsInHTML( aHtml, oTidyUtil.getPrefConfig(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden );

    // Filter enabled for OpenSP ?
    if( oTidyUtil.filterArraySP.length>0 )
    {
      // Without this, it can cause sometimes an error in the UI: Script: chrome://tidy/content/tidyUtil.js:1161 (Stop) (Continue Script)
      try
      {
        if( nbError.value+nbWarning.value<500 || oTidyViewSource!=null )
        {
          // XXXXXXXXX  Todo  This should maybe use TidyResultRow parse to improve the code
          var tmperror ={value:""};
          var rows = error.value.split('\n');
          var num=0;
          var isLastSkip=false;
          for (var o in rows)
          {
            var d = rows[o];
            var pos = d.search(".html:");
            var d1 = d.substring(pos+6);
            pos = d1.search(" ");
            var d2 = d1.substring(0,pos);
            var ds = d2.split(':');
            num = ds[2];
            if (o<rows.length-1)
            {
              if(num==" start tag was here" && isLastSkip==true) //in case the preceding error is followed by a 'start tag was here' info message and that error has been hidden
              {
                //alert("info message to hide detected");
              }
              else
              {
                isLastSkip=false;
                var nums = num.split(".");
                num = nums[1];
                if( oTidyUtil.filterArraySP[num]==false )
                {
                  isLastSkip=true;
                  nbHidden.value++;
                  if (ds[3]='E')
                  {
                    nbError.value--;
                  }
                  else if( ds[3]='W' )
                  {
                    nbWarning.value--;
                  }
                }
                if (!isLastSkip)
                {
                  tmperror.value += d + "\r\n";
                }
              }
            }
          }
          error.value = tmperror.value;
        }
        else
        {
          // more than 500 errors, we skip the filter
          nbHidden.value = 0;
        }
      }
      catch(e)
      {
        // do nothing, we get this exception if nbError.value+nbWarning.value>500 && oTidyViewSource does not exist
      }
    }
  }
  */

}

//-------------------------------------------------------------
// TidyResultRow
//
// Contains and parse the structure of a result row
//-------------------------------------------------------------

function TidyResultRow()
{
}

TidyResultRow.prototype =
{
  data      : "",
  line      : -1,
  column    : -1,
  type      : -1,
  errorId   : -1,
  arg1      : "",
  arg2      : "",
  arg3      : "",
  icon      : null,
  icon_text : null,
  skip      : false,
  explanation : null,

  /** __ isMessageHidable ______________________________________________
    */
  isMessageHidable : function()
  {
    if( this.type!=0 )
    {
      return true;
    }
    return false;
  },

  /** __ init ______________________________________________________
   */
  init: function(_data, _line, _column, _type, _errorId, _arg1, _arg2, _arg3, _icon, _icon_text )
  {
    this.data = _data + "\r\n";
    this.line = parseInt(_line);
    this.column = parseInt(_column);
    this.type = _type;
    this.errorId = _errorId;
    this.arg1 = _arg1;
    this.arg2 = _arg2;
    this.arg3 = _arg3;
    this.icon = _icon;
    this.icon_text = _icon_text;
  },

  /** __ parse ______________________________________________________
   */
  parse: function( algorithm, d, unsorted )
  {
    if( d.search( "\r" ) >= 0 )
    {
      d = d.substring(0, d.search( "\r" ) );
    }
    if( d.length==0 )
    {
      this.skip = true;
    }
    else
    {
      if( algorithm=="tidy" || algorithm=="serial" )
      {
        var ds = d.split('\t');
        this.line = parseInt(ds[0]);
        this.column = parseInt(ds[1]);
        this.errorId = ds[2];
        this.type = ds[3];
        this.data = ds[4];
        // XXXXXXXXXXXX TODO get arg1, arg2, arg3
      }
      else if( algorithm=="sp" )
      {
        try
        {
          var pos = d.search(".html:");
          var d1 = d.substring(pos+6);
          pos = d1.search(" ");
          this.data = d1.substring(pos+1);
          var d2 = d1.substring(0,pos);
          var ds = d2.split(':');
          this.line = parseInt(ds[0]);
          this.column = parseInt(ds[1]);
          if( ds[3]=="" )
          {
            this.type = 0; // Info
            this.errorId = -1;
          }
          else
          {
            var ds2 = ds[2].split('.');
            if( ds[3]=="E" )
            {
              this.type = 4; // Error
            }
            else if( ds[3]=="W" )
            {
              this.type = 1; // Warning
            }
            else
            {
              this.type = 0; // Info
            }

            this.errorId = ds2[1];
            if( this.errorId==435 )
            {
              this.type = 0;
              this.skip = true;
            }
            else if( oTidyUtil.filterArraySP[this.errorId]==false )
            {
              this.skip = true;
            }
          }
        }
        catch( ex )
        {
          // alert('line decode issue:\n'+d);
        }
      }
      else
      {
          alert('parse: Algorithm unknown\n'+d);
      }
    }

    this.parseIcon( d );
  },

  /** __ parseIcon  ______________________________________________________
   */
  parseIcon: function( d )
  {
    if( this.type==4 )
    {
     this.icon = "error";
     this.icon_text = oTidyUtil.getString("tidy_cap_error");
    }
    else if( this.type==1 )
    {
     this.icon = "warning";
     this.icon_text = oTidyUtil.getString("tidy_cap_warning");
    }
    else if( this.type==3 )
    {
     this.icon = "access";
     this.icon_text = oTidyUtil.getString("tidy_cap_access_warning");
    }
    else if( this.type==0 )
    {
     this.icon = "info";
     this.icon_text = oTidyUtil.getString("tidy_cap_info");
    }
    else if( this.type==5 )
    {
     this.icon = "message";
     this.icon_text = oTidyUtil.getString("tidy_cap_message");
    }
    else
    {
      this.data = d;
    }
  },



  /** __ online2row ______________________________________________________
   */

  // Get a number from a string that hope to be unique
  // Note: this algorithm is really dumb and bad :)
  string2number: function (string) {
    var id;
    var res = 0;
    var lMessageLength = string.length;
    for( var i = 0; i < string.length; i++) {
       id = string.charCodeAt(i);
       res += id;
    }
    // alert( "String : " + string + " / " + res );
    return res;
  },

  online2row: function( d )
  {
    /*
              "lastLine": 7,
              "lastColumn": 2871,
              "message": "Attribute width not allowed on element div at this point.",
              "messageid": "html5",
              "explanation": "\n<div class=\"ve html5\"><dl xmlns=\"http://www.w3.org/1999/xhtml\"><dt>Element-specific attributes for element <a href=\"http://www.whatwg.org/specs/web-apps/current-work/#the-div-element\"><code>div</code></a>:</dt>\n   <dd><a href=\"http://www.whatwg.org/specs/web-apps/current-work/#global-attributes\">Global attributes</a></dd>\n   </dl></div>\n",
              "type": "error"
    */
      this.line = d.lastLine;
      this.column = d.lastColumn;
      // The errorID is always hmtl5, it is useless.
      // Using a very dummy and stupid algorithm until fixed.
      //  this.errorId = d.messageid;
      this.errorId = this.string2number( d.message );
      this.data = d.message;
      this.explanation = d.explanation;


      // Hide
      // XXXX Filtering to improve
      if( oTidyUtil.filterArrayOnline.length>0 )
      {
        if( oTidyUtil.filterArrayOnline[this.errorId]==false )
        {
          this.skip = true;
        }
      }

      if( d.type=="error" )
      {
        this.type = 4;
      } else if( d.type=="info" ) {
        this.type = 0;
        if( typeof d.subtype !== "undefined")
        {
		  if( d.subtype=="warning" )
          {
            this.type = 1;
          }
	    }
      } else if( d.type=="warning" ) {
        this.type = 1;
      }

      this.parseIcon( d.type );
   },

  /** __ cse2row ______________________________________________________
   */
  cse2row: function( d )
  {
    /*
      "messagetype":"ERROR",
      "messagenumber":1,
      "linenumber":7,
      "charlocation":2,
      "charlocationlength":6,
      "message":"The end tag for \"table\" was found, but no start tag for \"table\" was found. This appears to be a misplaced end tag that should be removed."
    */
      this.line = d.linenumber;
      this.column = d.charlocation;
      this.errorId = d.messageid;
      this.data = d.message;
      this.explanation = d.message;
      if( d.messagetype=="ERROR" )
      {
        this.type = 4;
      } else if( d.messagetype=="MESSAGE" ) {
        this.type = 5;
      } else if( d.messagetype=="COMMENT" ) {
        this.type = 0;
      } else if( d.messagetype=="WARNING" ) {
        this.type = 1;
      }
      this.parseIcon( d.type );
   },

  /** __ getString ______________________________________________________
   */
  getString : function()
  {
    var s = "";
    if( this.line>0 )
    {
      s += "line " + this.line;
      if( this.column>0 )
      {
        s += " column " + this.column;
      }
      s += " - ";
    }
    s += this.icon_text +": "+this.data;
    return s;
  }
}

//-------------------------------------------------------------
// TidyItemQueue
//-------------------------------------------------------------

function TidyItemQueue( _html, _tidyResult, _iLocation )
{
  this.html = _html;
  this.tidyResult = _tidyResult;
  this.iLocation = _iLocation;
}

TidyItemQueue.prototype =
{
  html : null,
  tidyResult : null,
  iLocation : null,
  nextItem : null
}

//-------------------------------------------------------------
// TidyFifoQueue (Implemented as a list of TidyItemQueue)
//-------------------------------------------------------------

function TidyFifoQueue()
{
}

TidyFifoQueue.prototype =
{
  firstItem : null,
  lastItem : null,


  /** __ push ______________________________________________________
   */
  push : function( item )
  {
    try
    {  if( this.firstItem==null )
      {
        this.firstItem = item;
        this.lastItem = item;
      }
      else
      {
        this.lastItem.nextItem = item;
        this.lastItem = item;
      }
    }
    catch(ex)
    {
      // It seems that in some case, the document is cleanup before that we can use it
      // or after hibernate. In such a case a "Error: TypeError: can't access dead object" is raised
      // In such case, let's reset the queue.
      this.firstItem = item;
      this.lastItem = item;
      tidyShowExceptionInConsole( ex );
    }
  },

  /** __ pop _______________________________________________________
   *
   * RemoveItem at the  beginning of the list
   * Return null if no item
   */
  pop : function()
  {
    var item = this.firstItem;
    if( this.firstItem!=null )
    {
      this.firstItem = this.firstItem.nextItem;
      if( this.firstItem==null )
      {
        this.lastItem = null;
      }
    }
    return item;
  },

  /** __ clear _______________________________________________________
   *
   * Remove all
   */
  clear : function()
  {
    this.firstItem = null;
    this.lastItem = null;
  }


}

