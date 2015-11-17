//*************************************************************************
// HTML Validator
//
//  File: tidyLib.js
//  Description: javascript for special install actions
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

"use strict";

//-------------------------------------------------------------
// TidyLib
//-------------------------------------------------------------

Components.utils.import("resource://gre/modules/ctypes.jsm");

function TidyLib()
{
  this.init();
}


TidyLib.prototype =
{
  getPlatformLibName: function( name )
  {
     var platform = Components.classes["@mozilla.org/xre/app-info;1"]
                    .getService(Components.interfaces.nsIXULRuntime).OS;
     var s;
     if (platform=='WINNT')
     {
       s = name + ".dll";
     }
     else if (platform=='Darwin')
     {
       s = "lib" + name + ".dylib";
     }
     else
     {
       s = "lib" + name + ".so";
     }
     return s;
   },

   init: function()
   {
     var home = tidyUtilGetHome();
     var libFile = home.clone();
     libFile.append("components");
     libFile.append( this.getPlatformLibName("nstidy") );
     // alert( libFile.path );
     try
     {
       this.lib = ctypes.open(libFile.path);
     }
     catch(ex)
     {
		   try
       {
         Components.utils.reportError( "Tidy: Can not load 32 bit library " + libFile.path );
         var home = tidyUtilGetHome();
         var libFile = home.clone();
         libFile.append("components");
         libFile.append( this.getPlatformLibName("nstidy64") );
         this.lib = ctypes.open(libFile.path);
       }
       catch(ex)
       {
		     Components.utils.reportError( "Tidy: Can not load the DYNAMIC LIBRARY in user profile: " + libFile.path );
         var home2 = tidyUtilGetHome2();
         libFile = home2.clone();
         libFile.append("components");
         libFile.append( this.getPlatformLibName("nstidy") );
         this.lib = ctypes.open(libFile.path);
       }
     }

     // this.lib = ctypes.open("C:/my_prog/mozilla/src/tidy_jsc/xpi/components/nsTidy.dll");

     // DllExport NS_IMETHODIMP libTidyResetFilter();
     this.libTidyResetFilter = this.lib.declare("libTidyResetFilter",
                                ctypes.default_abi,
                                ctypes.bool );

     // DllExport NS_IMETHODIMP libTidyInitDiagLog(const char * aDir, PRInt32 bDebug );
     this.libTidyInitDiagLog = this.lib.declare("libTidyInitDiagLog",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.int);

     // DllExport NS_IMETHODIMP libTidyGetLibraryVersion( PRInt32 *aVersion);
     this.libTidyGetLibraryVersion = this.lib.declare("libTidyGetLibraryVersion",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.int.ptr);


     // DllExport NS_IMETHODIMP libTidyLog(const char * aMsg);
     this.libTidyLog = this.lib.declare("libTidyLog",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr );

     // DllExport NS_IMETHODIMP libTidyFilterMsg(PRInt32 aCode );
     this.libTidyFilterMsg = this.lib.declare("libTidyFilterMsg",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.int);

     // DllExport NS_IMETHODIMP libTidyInitTranslation(PRInt32 *_retval);
     this.libTidyInitTranslation = this.lib.declare("libTidyInitTranslation",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.int.ptr);

     // DllExport NS_IMETHODIMP libTidySpInit(const char * aSgmlLibPath, const char * aXmlLibPath );
     this.libTidySpInit = this.lib.declare("libTidySpInit",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.char.ptr );

     // DllExport NS_IMETHODIMP libTidyAddTranslations( const char * aTranslation );
     this.libTidyAddTranslations = this.lib.declare("libTidyAddTranslations",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr );

     // DllExport NS_IMETHODIMP libTidySetTranslationPrefix( const char * aPrefix, const char * aLineCol );
     this.libTidySetTranslationPrefix = this.lib.declare("libTidySetTranslationPrefix",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.char.ptr );

     // DllExport NS_IMETHODIMP libTidyCheckTranslation();
     this.libTidyCheckTranslation = this.lib.declare("libTidyCheckTranslation",
                                ctypes.default_abi,
                                ctypes.bool );

     // DllExport NS_IMETHODIMP libTidyPrintEnglishTranslation();
     this.libTidyPrintEnglishTranslation = this.lib.declare("libTidyPrintEnglishTranslation",
                                ctypes.default_abi,
                                ctypes.bool );

     // DllExport NS_IMETHODIMP libTidyFree(void * ptr );
     this.libTidyFree = this.lib.declare("libTidyFree",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr );

     // DllExport NS_IMETHODIMP libTidyGetErrorsInHTML(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
     this.libTidyGetErrorsInHTML = this.lib.declare("libTidyGetErrorsInHTML",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.char.ptr,
                                ctypes.int,
                                ctypes.char.ptr.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr );


     // DllExport NS_IMETHODIMP libTidyCleanupHTML(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aCleanupHTML );
     this.libTidyCleanupHTML = this.lib.declare("libTidyCleanupHTML",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.char.ptr,
                                ctypes.int,
                                ctypes.char.ptr.ptr );

     // DllExport NS_IMETHODIMP libTidyGetLinks(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aLinks, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
     this.libTidyGetLinks = this.lib.declare("libTidyGetLinks",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.char.ptr,
                                ctypes.int,
                                ctypes.char.ptr.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr );

     // DllExport NS_IMETHODIMP libTidySpGetErrorsInHTML(const char * aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
     this.libTidySpGetErrorsInHTML = this.lib.declare("libTidySpGetErrorsInHTML",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr,
                                ctypes.char.ptr,
                                ctypes.int,
                                ctypes.char.ptr.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr,
                                ctypes.int.ptr );


     // DllExport NS_IMETHODIMP libTidyGetErrorDescription( PRInt32 aErrorId, char ** aErrorDesc );
     this.libTidyGetErrorDescription = this.lib.declare("libTidyGetErrorDescription",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.int,
                                ctypes.char.ptr.ptr);

     // DllExport NS_IMETHODIMP libTidyGetIdOfAllErrors( char ** aErrorList );
     this.libTidyGetIdOfAllErrors = this.lib.declare("libTidyGetIdOfAllErrors",
                                ctypes.default_abi,
                                ctypes.bool,
                                ctypes.char.ptr.ptr);


  },

  initDiagLog : function( aDir, bDebug )
  {
     var b=(bDebug==true)?1:0;
     // alert( "initDiagLog aDir:"+aDir + " /bDebug:"+bDebug+"/b:"+b );
     return this.libTidyInitDiagLog( aDir, bDebug );
  },

  getLibraryVersion : function( aVersion )
  {
    var a = ctypes.int(0);
    var res = this.libTidyGetLibraryVersion(a.address());
    aVersion = a;
    return res;

  },

  log : function( aMsg )
  {
     return this.libTidyLog( aMsg );
  },

  resetFilter : function()
  {
     return this.libTidyResetFilter();
  },

  filterMsg: function( aCode )
  {
     var i = ctypes.int(aCode);
     return this.libTidyFilterMsg( i );
  },

  initTranslation : function()
  {
    var a = ctypes.int(0);
    this.libTidyInitTranslation(a.address());
    return a.value;
  },

  spInit : function( aSgmlLibPath, aXmlLibPath )
  {
    return this.libTidySpInit( aSgmlLibPath, aXmlLibPath );
  },

  addTranslations : function( aTranslation )
  {
    return this.libTidyAddTranslations( aTranslation );
  },

  setTranslationPrefix : function( aPrefix, aLineCol )
  {
    return this.libTidySetTranslationPrefix( aPrefix, aLineCol );
  },

  checkTranslation : function()
  {
    return this.libTidyCheckTranslation();
  },

  printEnglishTranslation : function()
  {
    return this.libTidyPrintEnglishTranslation();
  },

  // DllExport NS_IMETHODIMP libTidyGetErrorsInHTML(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
  getErrorsInHTML : function( aHtml, aListConfig, aAccessLevel, aError, aNbError, aNbWarning, aNbAccessWarning, aNbHidden )
  {
    var iAccessLevel = ctypes.int(aAccessLevel);
    var lNbError = ctypes.int(0);
    var lNbWarning = ctypes.int(0);
    var lNbAccessWarning = ctypes.int(0);
    var lNbHidden = ctypes.int(0);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyGetErrorsInHTML( aHtml, aListConfig, iAccessLevel, p, lNbError.address(), lNbWarning.address(), lNbAccessWarning.address(), lNbHidden.address() );
    aError.value = s.readString();
    aNbError.value = lNbError.value;
    aNbWarning.value = lNbWarning.value;
    aNbAccessWarning.value = lNbAccessWarning.value;
    aNbHidden.value = lNbHidden.value;
    var res = this.libTidyFree( s );
    return res;
  },

  // DllExport NS_IMETHODIMP libTidyCleanupHTML(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aCleanupHTML );
  cleanupHTML : function( aHtml, aListConfig, aAccessLevel, aCleanupHTML )
  {
    var iAccessLevel = ctypes.int(aAccessLevel);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyCleanupHTML( aHtml, aListConfig, iAccessLevel, p );
    aCleanupHTML.value = s.readString();
    var res = this.libTidyFree( s );
    return res;
  },

  // DllExport NS_IMETHODIMP libTidyGetLinks(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aLinks, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
  getLinks : function( aHtml, aListConfig, aAccessLevel, aLinks, aNbError, aNbWarning, aNbAccessWarning, aNbHidden )
  {
    var iAccessLevel = ctypes.int(aAccessLevel);
    var lNbError = ctypes.int(0);
    var lNbWarning = ctypes.int(0);
    var lNbAccessWarning = ctypes.int(0);
    var lNbHidden = ctypes.int(0);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyGetLinks( aHtml, aListConfig, iAccessLevel, p, lNbError.address(), lNbWarning.address(), lNbAccessWarning.address(), lNbHidden.address() );
    aLinks.value = s.readString();
    aNbError.value = lNbError.value;
    aNbWarning.value = lNbWarning.value;
    aNbAccessWarning.value = lNbAccessWarning.value;
    aNbHidden.value = lNbHidden.value;
    var res = this.libTidyFree( s );
    return res;
  },

  // DllExport NS_IMETHODIMP libTidySpGetErrorsInHTML(const char * aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
  spGetErrorsInHTML : function( aHtml, aListConfig, aAccessLevel, aError, aNbError, aNbWarning, aNbAccessWarning, aNbHidden )
  {
    var iAccessLevel = ctypes.int(aAccessLevel);
    var lNbError = ctypes.int(0);
    var lNbWarning = ctypes.int(0);
    var lNbAccessWarning = ctypes.int(0);
    var lNbHidden = ctypes.int(0);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidySpGetErrorsInHTML( aHtml, aListConfig, iAccessLevel, p, lNbError.address(), lNbWarning.address(), lNbAccessWarning.address(), lNbHidden.address() );
    aError.value = s.readString();
    aNbError.value = lNbError.value;
    aNbWarning.value = lNbWarning.value;
    aNbAccessWarning.value = lNbAccessWarning.value;
    aNbHidden.value = lNbHidden.value;
    var res = this.libTidyFree( s );
    return res;
  },

  // DllExport NS_IMETHODIMP libTidyGetErrorDescription( PRInt32 aErrorId, char ** aErrorDesc );
  getErrorDescription : function( aErrorId, aErrorDesc )
  {
    var iErrorId = ctypes.int(aErrorId);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyGetErrorDescription( iErrorId, p );
    aErrorDesc.value = s.readString();
    var res = this.libTidyFree( s );
    return res;
  },

  // DllExport NS_IMETHODIMP libTidyGetIdOfAllErrors( char ** aErrorList );
  getIdOfAllErrors : function( aErrorId, aErrorDesc )
  {
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyGetIdOfAllErrors( p );
    aErrorDesc.value = s.readString();
    var res = this.libTidyFree( s );
    return res;
  }
}

