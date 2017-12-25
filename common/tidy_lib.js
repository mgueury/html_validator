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

var report = "";

function _writeReport(data) {
  var s = String.fromCharCode(data);
  report += s;
  // console.log('_writeReport: ' +s );
}


function TidyLib() {
  this.init();
}


TidyLib.prototype = {
  m_bDebug: false,
  m_bWaiting : true,


  init: function() {
    // XXXX
    // InitEmscripten ??
    FS.init(function() {
      return null;
    }, _writeReport, _writeReport);
    shouldRunNow = false;
  },

  initDiagLog: function(aDir, bDebug) {
    this.m_bDebug = bDebug;
  },

  getLibraryVersion: function(aVersion) {
    var a = ctypes.int(0);
    var res = this.libTidyGetLibraryVersion(a.address());
    aVersion = a;
    return res;

  },

  log: function(aMsg) {
    // XXXXXXXX
    // It would be nice to be able to write in a real log file
    console.log(aMsg);
  },

  resetFilter: function() {},

  filterMsg: function(aCode) {
    var i = ctypes.int(aCode);
    return this.libTidyFilterMsg(i);
  },

  initTranslation: function() {
    /*
    var a = ctypes.int(0);
    this.libTidyInitTranslation(a.address());
    return a.value;
    */
    return true;
  },

  spInit: function(aSgmlLibPath, aXmlLibPath) {
    /*
    return this.libTidySpInit(aSgmlLibPath, aXmlLibPath);
    */
  },

  addTranslations: function(aTranslation) {
    return this.libTidyAddTranslations(aTranslation);
  },

  setTranslationPrefix: function(aPrefix, aLineCol) {
    return this.libTidySetTranslationPrefix(aPrefix, aLineCol);
  },

  checkTranslation: function() {
    return this.libTidyCheckTranslation();
  },

  printEnglishTranslation: function() {
    return this.libTidyPrintEnglishTranslation();
  },

  sleep: function(ms) {
    console.log('sleep: ' + ms);
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Wait that the Module is ready
  waitRunning: async function(callBack) {
    var i = 0;
    while (Module.currentStatus != "Running..." && Module.currentStatus != "") {
      console.log('waitRunning: ' + i);
      await this.sleep(100);
      i++;
    }
    console.log('</waitRunning>: ' + i);
    this.m_bWaiting = false;
    callBack();
  },

  getErrorsInHTML: function(aHtml, aConfig, aAccessLevel, aError, aNbError, aNbWarning, aNbAccessWarning, aNbHidden) {
    report = "";
    try {
      FS.writeFile('/input.html', aHtml, {
        encoding: "utf8"
      });
      aConfig.push("-qe");
      aConfig.push("-utf8");
      aConfig.push("-access");
      aConfig.push(aAccessLevel.toString());
      aConfig.push("--tab-size");
      aConfig.push("1");
      aConfig.push("input.html");
      console.log(aConfig);
      Module.callMain(aConfig);
      console.log('--');
      console.log(report);
      console.log('--');
    } catch (e) {
      console.error(e);
      console.error(e.stack);
    } finally {
      FS.unlink('/input.html');
    }

    // ERROR: xx WARNING: XX
    var pos = report.lastIndexOf("ERROR: ");
    var pos2 = report.indexOf("WARNING: ", pos);
    var pos3 = report.indexOf("\n", pos2);
    var nbError = Number(report.slice(pos + 7, pos2));
    var nbWarning = Number(report.slice(pos2 + 9, pos3));

    aError.value = report.slice(0, pos);
    aNbError.value = nbError;
    aNbWarning.value = nbWarning;
    // XXXXXXXXXXXXXXXXXXXXXXXXXX
    aNbAccessWarning.value = 0;
    aNbHidden.value = 0;
  },

  cleanupHTML: function(aHtml, aConfig, aAccessLevel, aCleanupHTML) {
    try {
      report = "";
      FS.writeFile('/input.html', aHtml, {
        encoding: "utf8"
      });
      aConfig.push("-utf8");
      aConfig.push("-o");
      aConfig.push("output.html");
      aConfig.push("-access");
      aConfig.push("" + aAccessLevel);
      aConfig.push("input.html");
      console.log(aConfig);
      // var args = ['-o','output.html','-access', ""+aAccessLevel, 'input.html'];
      Module.callMain(aConfig);
      console.log('--');
      console.log(report);
      console.log('--');
    } catch (e) {
      console.error(e);
      console.error(e.stack);
    } finally {
      try {
        console.log(FS.stat('/output.html'));
        aCleanupHTML.value = FS.readFile('/output.html', {
          encoding: 'utf8'
        });
      } catch (e) {
        console.log("cleanupHTML:Error: /output.html not found");
        aCleanupHTML.value = report;
      }
      FS.unlink('/input.html');
      FS.unlink('/output.html');
    }
  },

  getLinks: function(aHtml, aListConfig, aAccessLevel, aLinks, aNbError, aNbWarning, aNbAccessWarning, aNbHidden) {},

  spGetErrorsInHTML: function(aHtml, aListConfig, aAccessLevel, aError, aNbError, aNbWarning, aNbAccessWarning, aNbHidden) {
    /*
    var iAccessLevel = ctypes.int(aAccessLevel);
    var lNbError = ctypes.int(0);
    var lNbWarning = ctypes.int(0);
    var lNbAccessWarning = ctypes.int(0);
    var lNbHidden = ctypes.int(0);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidySpGetErrorsInHTML(aHtml, aListConfig, iAccessLevel, p, lNbError.address(), lNbWarning.address(), lNbAccessWarning.address(), lNbHidden.address());
    aError.value = s.readString();
    aNbError.value = lNbError.value;
    aNbWarning.value = lNbWarning.value;
    aNbAccessWarning.value = lNbAccessWarning.value;
    aNbHidden.value = lNbHidden.value;
    var res = this.libTidyFree(s)
    return res;
    */
    return "";
  },

  getErrorDescription: function(aErrorId, aErrorDesc) {
    var iErrorId = ctypes.int(aErrorId);
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyGetErrorDescription(iErrorId, p);
    aErrorDesc.value = s.readString();
    var res = this.libTidyFree(s);
    return res;
  },

  getIdOfAllErrors: function(aErrorId, aErrorDesc) {
    var s = ctypes.char.ptr();
    var p = s.address();
    var res = this.libTidyGetIdOfAllErrors(p);
    aErrorDesc.value = s.readString();
    var res = this.libTidyFree(s);
    return res;
  },

  /** __ updateIconBadgeTitle ____________________________________________________
   *
   */
  updateIconBadgeTitle: function(aIcon, aBadge, aTitle) {
    // port.postMessage({
    console.log("updateIcon: " + aIcon);
    if (typeof chrome != 'undefined') {
      chrome.runtime.sendMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        path: aIcon,
        badge: aBadge,
        title: aTitle
      });
    }
  },

  /** __ writeFile ________________________________________________________________
   *
   */
  writeFile: function(file, content) {
    const PERM = parseInt("0644", 8);
    if (file.exists() == false) {
      file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, PERM);
    }
    var fos = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
    fos.init(file, 0x04 | 0x08 | 0x20, PERM, 0);

    var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"].createInstance(Components.interfaces.nsIConverterOutputStream);
    os.init(fos, "UTF-8", 0, 0x0000);
    os.writeString(content);

    os.close();
    fos.close();
  },

  /** __ readFile ________________________________________________________________
   *
   */
  readFile: function(file) {
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
    return (data);
  },

  /** __ firefoxVersionHigherThan ___________________________________________________
   *
   */
  firefoxVersionHigherThan: function(sVersion) {
    // assuming we're running under Firefox
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
    return (versionChecker.compare(appInfo.version, sVersion) >= 0);
  },

  /** __ firefoxVersionEqual ___________________________________________________
   *
   */
  firefoxVersionEqual: function(sVersion) {
    // assuming we're running under Firefox
    var appInfo = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo);
    var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator);
    return (versionChecker.compare(appInfo.version, sVersion) == 0);
  },

}
