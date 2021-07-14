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

//-------------------------------------------------------------

function onLoadTidyUtil(callback) {
  if (callback) {
    var f = function () {
      tidy_pref.isNewInstall();
      oTidyUtil = new TidyUtil();
      callback();
    }
    tidy_pref.load(f); // Ask to be call back when the preferences are loaded
  } else {
    tidy_pref.isNewInstall();
    oTidyUtil = new TidyUtil();
    var f = function () { }
    tidy_pref.load(f);
  }
}

function onUnloadTidyUtil() {
  oTidyUtil = null;
}

function tidyUtilOpenUrl(aEvent, aTWC) {
  var url = aEvent.currentTarget.getAttribute("url");
  tidyUtilOpenUrl2(url)
}

function tidyUtilOpenUrl2(url) {
  //get a navigator window
  // XXXXXXXXXXXXX
  window.open(url);
  /*
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
  */
}

function tidyShowExceptionInConsole(ex) {
  console.error("Tidy Exception: ", ex, " / Stack: ", ex.stack);
}

function tidyUtilSetOnclick(id, f) {
  document.getElementById(id).onclick = f;
}

//-------------------------------------------------------------
// TidyUtil
//-------------------------------------------------------------

function TidyUtil() {
  // init all the control with the values from the preferences
  // XXXXXXXXXXXXXXXXXXXXXXXXX
  this.pref = new TidyPref();

  /*
    if (false) {
      try {
        // It it an new install but is it an upgrade ?
        if (this.getIntPref("highlight_max") > -1) {
          this.bUpgrade = true;
        }
      } catch (ex) {}
      // this.setBoolPref( "browser_hide", false );
      this.setBoolPref("warning_line_number", true);
    }
  */

  // Check if the preferences exists
  this.setDefaultValueBool("show-warnings", true);
  this.setDefaultValueInt("show-errors", 6);
  this.setDefaultValueInt("accessibility-check", -1);

  this.setDefaultValueBool("indent", false);
  this.setDefaultValueInt("indent-spaces", 2);
  this.setDefaultValueBool("uppercase-tags", false);
  this.setDefaultValueBool("uppercase-attributes", false);
  this.setDefaultValueInt("wrap", 68);
  this.setDefaultValueBool("output-xhtml", false);
  this.setDefaultValueBool("output-html", false);
  this.setDefaultValueBool("clean", false);
  this.setDefaultValueChar("filter", "");
  this.setDefaultValueChar("doctype", "auto");
  this.setDefaultValueChar("output-encoding", "utf8");

  this.setDefaultValueBool("debug", false);
  // this.setDefaultValueBool( "browser_hide",          false );
  this.setDefaultValueBool("highlight_line", true);
  this.setDefaultValueInt("highlight_max", 100);
  this.setDefaultValueChar("disabled_action", "viewsource");
  this.setDefaultValueBool("background", false);
  this.setDefaultValueBool("force_frame_revalidation", false);
  this.setDefaultValueChar("version", "0.0");
  // this.setDefaultValueBool( "warning_line_number",   true );
  this.setDefaultValueChar("online_url", tidy_pref.online_default_url);
  // this.setDefaultValueChar("algorithm", "serial"); // tidy, sp, serial
  this.setDefaultValueChar("algorithm", "tidy"); // tidy, sp, serial

  try {
    this.tidy = new TidyLib();
  } catch (ex) {
    console.error("Tidy: Can not load the DYNAMIC LIBRARY");
    console.error("Ex: " + ex);
  }
  if (this.tidy) {
    this.debug = this.getBoolPref("debug");
    // XXXXX
    this.tidy.initDiagLog("c:\\todo\\", this.debug);
    // this.tidy.getLibraryVersion(libraryVersion);
    // this.tidy.log("Library version: " + libraryVersion.value);

    this.buildFilterArray();

    try {
      // XXXXXXXXXXXX
      var lang = "en";
      this.defaultLanguage = lang.length == 2 ? lang + "-" + lang.toUpperCase() : lang;
    } catch (ex) { }
  }
}

TidyUtil.prototype = {

  stringBundle: {
    "tidy_validator": "HTML Validator",
    "tidy_extension_desc": "Adds HTML validation to the View Page Source of the browser. The validation is done by Tidy from W3c.",

    "tidy_enable_browser": "Enable the HTML Validation in the Browser ?",
    "tidy_enable": "Enable",
    "tidy_disable": "Disable",

    // There are 3 variations of "error" with or without s, because grammatical plural
    // rules depends of the language. Ex:
    // > English : 2 errors,  1 error,  0 errors  (0 takes 's')
    // > French  : 2 erreurs, 1 erreur, 0 erreur  (0 takes no 's')
    "tidy_error": "error",
    "tidy_errors": "errors",
    "tidy_0_errors": "errors",

    "tidy_warning": "warning",
    "tidy_warnings": "warnings",
    "tidy_0_warnings": "warnings",

    "tidy_access_warning": "access warning",
    "tidy_access_warnings": "access warnings",
    "tidy_0_access_warnings": "access warnings",

    "tidy_hidden": "hidden",
    "tidy_disabled": "Disabled",

    "tidy_cap_error": "Error",
    "tidy_cap_warning": "Warning",
    "tidy_cap_access_warning": "Access",
    "tidy_cap_info": "Info",
    "tidy_cap_message": "Message",

    "tidy_cleanup": "Cleanup the page",
    "tidy_view_source": "View Source",
    "tidy_cleanup_error": "This document has %S that must be fixed before using Tidy to generate a cleanup version.\r\n\r\nAre you sure you want to continue ?",

    "tidy_result": "HTML Tidy result",
    "sp_result": "SGML Parser result",
    "serial_result": "HTML Validator result",
    "cse_result": "CSE Validator result",
    "tidy_page": "Page",
    "tidy_frame": "Frame",

    "tidy_too_many_error": "Too many errors. Not all warnings/errors were shown.\n",
    "tidy_not_html": "The document content type is not HTML :",

    "tidy_filter_title": "Hide HTML error or warning",
    "tidy_filter_msg": "Are you sure that you want to hide the following HTML error or warning ?\r\n\r\n",

    "tidy_wrap_msg": "The line numbering will be disabled. It happened because 'Wrap Long Lines' was enabled.",

    "tidy_not_in_domain": "Not in domain list",

    "tidy_browser_loading": "Please try later - the browser is still loading",
    "tidy_invalid_char": "Error: The HTML contains invalid characters ",

    "tidy_perm_title": "Allowed Sites - HTML Validator",
    "tidy_perm_intro": "You can specify which sites are allowed or blocked for HTML Validator.",

    "tidy_disable_site": "Disable for",
    "tidy_enable_site": "Enable for",

    "tidy_empty": "HTML Cache is empty",

    //-- WARNING/ERROR/ACCESS MESSAGES -------------------------------------------

    "tidy_prefix": "Info: ,Warning: ,Config: ,Access: ,Error: ,Document: ,Panic: ",
    "tidy_linecol": "line %d column %d - ",

    "tidy_80": "specified input encoding (%s) does not match actual input encoding (%s)",
    "tidy_76": "%s invalid character code %s",
    "tidy_77": "%s invalid character code %s",
    "tidy_78": "%s invalid UTF-8 bytes (char. code %s)",
    "tidy_79": "%s invalid UTF-16 surrogate pair (char. code %s)",
    "tidy_82": "%s invalid numeric character reference %s",
    "tidy_1": "entity '%s' doesn't end in ';'",
    "tidy_2": "numeric character reference '%s' doesn't end in ';'",
    "tidy_4": "unescaped & which should be written as &amp;",
    "tidy_3": "unescaped & or unknown entity '%s'",
    "tidy_5": "named entity &apos; only defined in XML/XHTML",
    "tidy_49": "%s inserting '%s' attribute",
    "tidy_50": "%s attribute '%s' lacks value",
    "tidy_48": "%s unknown attribute '%s'",
    "tidy_53": "%s proprietary attribute '%s'",
    "tidy_68": "%s joining values of repeated attribute '%s'",
    "tidy_57": "%s has XML attribute '%s'",
    "tidy_71": "%s ID '%s' uses XML ID syntax",
    "tidy_70": "%s attribute value '%s' must be lower case for XHTML",
    "tidy_54": "%s proprietary attribute value '%s'",
    "tidy_66": "%s anchor '%s' already defined",
    "tidy_51": "%s attribute '%s' has invalid value '%s'",
    "tidy_73": "%s attribute '%s' had invalid value '%s' and has been replaced",
    "tidy_72": "%s attribute name '%s' (value='%s') is invalid",
    "tidy_55": "%s dropping value '%s' for repeated attribute '%s'",
    "tidy_74": "%s cannot copy name attribute to id",
    "tidy_52": "%s missing '>' for end of tag",
    "tidy_58": "%s unexpected or duplicate quote mark",
    "tidy_59": "%s attribute with missing trailing quote mark",
    "tidy_75": "%s end of file while parsing attributes",
    "tidy_60": "%s id and name attribute value mismatch",
    "tidy_61": "%s URI reference contains backslash. Typo?",
    "tidy_62": "%s converting backslash in URI to slash",
    "tidy_63": "%s improperly escaped URI reference",
    "tidy_64": "%s escaping malformed URI reference",
    "tidy_65": "%s discarding newline in URI reference",
    "tidy_69": "%s unexpected '=', expected attribute name",
    "tidy_56": "%s should use client-side image map",
    "tidy_86": "%s lacks '%s' attribute",
    "tidy_9": "nested emphasis %s",
    "tidy_40": "nested q elements, possible typo.",
    "tidy_20": "replacing obsolete element %s by %s",
    "tidy_85": "<%s> is probably intended as </%s>",
    "tidy_23": "trimming empty %s",
    "tidy_83": "replacing %s by %s",
    "tidy_24": "<%s> is probably intended as </%s>",
    "tidy_84": "replacing unexpected %s by %s",
    "tidy_6": "missing </%s>",
    "tidy_7": "missing </%s> before %s",
    "tidy_8": "discarding unexpected %s",
    "tidy_10": "replacing unexpected %s by </%s>",
    "tidy_11": "%s isn't allowed in <%s> elements",
    "tidy_12": "missing <%s>",
    "tidy_13": "unexpected </%s>",
    "tidy_38": "too many %s elements",
    "tidy_14": "using <br> in place of %s",
    "tidy_15": "inserting implicit <%s>",
    "tidy_19": "%s can't be nested",
    "tidy_21": "%s is not approved by W3C",
    "tidy_25": "%s shouldn't be nested",
    "tidy_26": "%s not inside 'noframes' element",
    "tidy_36": "unexpected end of file %s",
    "tidy_41": "%s element not empty or not closed",
    "tidy_47": "unexpected </%s> in <%s>",
    "tidy_46": "too many %s elements in <%s>",
    "tidy_39": "unescaped %s in pre content",
    "tidy_34": "<!DOCTYPE> isn't allowed after elements",
    "tidy_17": "inserting missing 'title' element",
    "tidy_28": "HTML DOCTYPE doesn't match content",
    "tidy_44": "missing <!DOCTYPE> declaration",
    "tidy_27": "content occurs after end of body",
    "tidy_29": "adjacent hyphens within comment",
    "tidy_30": "expecting -- or >",
    "tidy_32": "'<' + '/' + letter not allowed here",
    "tidy_33": "HTML namespace doesn't match content",
    "tidy_45": "removing whitespace preceding XML Declaration",
    "tidy_35": "discarding malformed <!DOCTYPE>",
    "tidy_31": "XML comments can't contain --",
    "tidy_37": "SYSTEM, PUBLIC, W3C, DTD, EN must be upper case",
    "tidy_42": "Output encoding does not work with standard output",
    "tidy_16": "missing quote mark for attribute value",
    "tidy_18": "repeated FRAMESET element",
    "tidy_22": "%s is not recognized!",
    "tidy_1001": "[1.1.1.1]: <img> missing 'alt' text.",
    "tidy_1002": "[1.1.1.2]: suspicious 'alt' text (filename).",
    "tidy_1003": "[1.1.1.3]: suspicious 'alt' text (file size).",
    "tidy_1004": "[1.1.1.4]: suspicious 'alt' text (placeholder).",
    "tidy_1005": "[1.1.1.10]: suspicious 'alt' text (too long).",
    "tidy_1006": "[1.1.1.11]: <img> missing 'alt' text (bullet).",
    "tidy_1007": "[1.1.1.12]: <img> missing 'alt' text (horizontal rule).",
    "tidy_1008": "[1.1.2.1]: <img> missing 'longdesc' and d-link.",
    "tidy_1009": "[1.1.2.2]: <img> missing d-link.",
    "tidy_1010": "[1.1.2.3]: <img> missing 'longdesc'.",
    "tidy_1011": "[1.1.2.5]: 'longdesc' not required.",
    "tidy_1012": "[1.1.3.1]: <img> (button) missing 'alt' text.",
    "tidy_1013": "[1.1.4.1]: <applet> missing alternate content.",
    "tidy_1014": "[1.1.5.1]: <object> missing alternate content.",
    "tidy_1015": "[1.1.6.1]: audio missing text transcript (wav).",
    "tidy_1016": "[1.1.6.2]: audio missing text transcript (au).",
    "tidy_1017": "[1.1.6.3]: audio missing text transcript (aiff).",
    "tidy_1018": "[1.1.6.4]: audio missing text transcript (snd).",
    "tidy_1019": "[1.1.6.5]: audio missing text transcript (ra).",
    "tidy_1020": "[1.1.6.6]: audio missing text transcript (rm).",
    "tidy_1021": "[1.1.8.1]: <frame> may require 'longdesc'.",
    "tidy_1022": "[1.1.9.1]: <area> missing 'alt' text.",
    "tidy_1023": "[1.1.10.1]: <script> missing <noscript> section.",
    "tidy_1024": "[1.1.12.1]: ascii art requires description.",
    "tidy_1025": "[1.2.1.1]: image map (server-side) requires text links.",
    "tidy_1026": "[1.4.1.1]: multimedia requires synchronized text equivalents.",
    "tidy_1027": "[1.5.1.1]: image map (client-side) missing text links.",
    "tidy_1028": "[2.1.1.1]: ensure information not conveyed through color alone (image).",
    "tidy_1029": "[2.1.1.2]: ensure information not conveyed through color alone (applet).",
    "tidy_1030": "[2.1.1.3]: ensure information not conveyed through color alone (object).",
    "tidy_1031": "[2.1.1.4]: ensure information not conveyed through color alone (script).",
    "tidy_1032": "[2.1.1.5]: ensure information not conveyed through color alone (input).",
    "tidy_1033": "[2.2.1.1]: poor color contrast (text).",
    "tidy_1034": "[2.2.1.2]: poor color contrast (link).",
    "tidy_1035": "[2.2.1.3]: poor color contrast (active link).",
    "tidy_1036": "[2.2.1.4]: poor color contrast (visited link).",
    "tidy_1037": "[3.2.1.1]: <doctype> missing.",
    "tidy_1038": "[3.3.1.1]: use style sheets to control presentation.",
    "tidy_1039": "[3.5.1.1]: headers improperly nested.",
    "tidy_1040": "[3.5.2.1]: potential header (bold).",
    "tidy_1041": "[3.5.2.2]: potential header (italics).",
    "tidy_1042": "[3.5.2.3]: potential header (underline).",
    "tidy_1043": "[3.5.3.1]: header used to format text.",
    "tidy_1044": "[3.6.1.1]: list usage invalid <ul>.",
    "tidy_1045": "[3.6.1.2]: list usage invalid <ol>.",
    "tidy_1046": "[3.6.1.4]: list usage invalid <li>.",
    "tidy_1047": "[4.1.1.1]: indicate changes in language.",
    "tidy_1048": "[4.3.1.1]: language not identified.",
    "tidy_1049": "[4.3.1.2]: language attribute invalid.",
    "tidy_1050": "[5.1.2.1]: data <table> missing row/column headers (all).",
    "tidy_1051": "[5.1.2.2]: data <table> missing row/column headers (1 col).",
    "tidy_1052": "[5.1.2.3]: data <table> missing row/column headers (1 row).",
    "tidy_1053": "[5.2.1.1]: data <table> may require markup (column headers).",
    "tidy_1054": "[5.2.1.2]: data <table> may require markup (row headers).",
    "tidy_1055": "[5.3.1.1]: verify layout tables linearize properly.",
    "tidy_1056": "[5.4.1.1]: invalid markup used in layout <table>.",
    "tidy_1057": "[5.5.1.1]: <table> missing summary.",
    "tidy_1058": "[5.5.1.2]: <table> summary invalid (null).",
    "tidy_1059": "[5.5.1.3]: <table> summary invalid (spaces).",
    "tidy_1060": "[5.5.1.6]: <table> summary invalid (placeholder text).",
    "tidy_1061": "[5.5.2.1]: <table> missing <caption>.",
    "tidy_1062": "[5.6.1.1]: <table> may require header abbreviations.",
    "tidy_1063": "[5.6.1.2]: <table> header abbreviations invalid (null).",
    "tidy_1064": "[5.6.1.3]: <table> header abbreviations invalid (spaces).",
    "tidy_1065": "[6.1.1.1]: style sheets require testing (link).",
    "tidy_1066": "[6.1.1.2]: style sheets require testing (style element).",
    "tidy_1067": "[6.1.1.3]: style sheets require testing (style attribute).",
    "tidy_1068": "[6.2.1.1]: <frame> source invalid.",
    "tidy_1069": "[6.2.2.1]: text equivalents require updating (applet).",
    "tidy_1070": "[6.2.2.2]: text equivalents require updating (script).",
    "tidy_1071": "[6.2.2.3]: text equivalents require updating (object).",
    "tidy_1072": "[6.3.1.1]: programmatic objects require testing (script).",
    "tidy_1073": "[6.3.1.2]: programmatic objects require testing (object).",
    "tidy_1074": "[6.3.1.3]: programmatic objects require testing (embed).",
    "tidy_1075": "[6.3.1.4]: programmatic objects require testing (applet).",
    "tidy_1076": "[6.5.1.1]: <frameset> missing <noframes> section.",
    "tidy_1077": "[6.5.1.2]: <noframes> section invalid (no value).",
    "tidy_1078": "[6.5.1.3]: <noframes> section invalid (content).",
    "tidy_1079": "[6.5.1.4]: <noframes> section invalid (link).",
    "tidy_1080": "[7.1.1.1]: remove flicker (script).",
    "tidy_1081": "[7.1.1.2]: remove flicker (object).",
    "tidy_1082": "[7.1.1.3]: remove flicker (embed).",
    "tidy_1083": "[7.1.1.4]: remove flicker (applet).",
    "tidy_1084": "[7.1.1.5]: remove flicker (animated gif).",
    "tidy_1085": "[7.2.1.1]: remove blink/marquee.",
    "tidy_1086": "[7.4.1.1]: remove auto-refresh.",
    "tidy_1087": "[7.5.1.1]: remove auto-redirect.",
    "tidy_1088": "[8.1.1.1]: ensure programmatic objects are accessible (script).",
    "tidy_1089": "[8.1.1.2]: ensure programmatic objects are accessible (object).",
    "tidy_1090": "[8.1.1.3]: ensure programmatic objects are accessible (applet).",
    "tidy_1091": "[8.1.1.4]: ensure programmatic objects are accessible (embed).",
    "tidy_1092": "[9.1.1.1]: image map (server-side) requires conversion.",
    "tidy_1093": "[9.3.1.1]: <script> not keyboard accessible (onMouseDown).",
    "tidy_1094": "[9.3.1.2]: <script> not keyboard accessible (onMouseUp).",
    "tidy_1095": "[9.3.1.3]: <script> not keyboard accessible (onClick).",
    "tidy_1096": "[9.3.1.4]: <script> not keyboard accessible (onMouseOver).",
    "tidy_1097": "[9.3.1.5]: <script> not keyboard accessible (onMouseOut).",
    "tidy_1098": "[9.3.1.6]: <script> not keyboard accessible (onMouseMove).",
    "tidy_1099": "[10.1.1.1]: new windows require warning (_new).",
    "tidy_1100": "[10.1.1.2]: new windows require warning (_blank).",
    "tidy_1101": "[10.2.1.1]: <label> needs repositioning (<label> before <input>).",
    "tidy_1102": "[10.2.1.2]: <label> needs repositioning (<label> after <input>).",
    "tidy_1103": "[10.4.1.1]: form control requires default text.",
    "tidy_1104": "[10.4.1.2]: form control default text invalid (null).",
    "tidy_1105": "[10.4.1.3]: form control default text invalid (spaces).",
    "tidy_1106": "[11.2.1.1]: replace deprecated html <applet>.",
    "tidy_1107": "[11.2.1.2]: replace deprecated html <basefont>.",
    "tidy_1108": "[11.2.1.3]: replace deprecated html <center>.",
    "tidy_1109": "[11.2.1.4]: replace deprecated html <dir>.",
    "tidy_1110": "[11.2.1.5]: replace deprecated html <font>.",
    "tidy_1111": "[11.2.1.6]: replace deprecated html <isindex>.",
    "tidy_1112": "[11.2.1.7]: replace deprecated html <menu>.",
    "tidy_1113": "[11.2.1.8]: replace deprecated html <s>.",
    "tidy_1114": "[11.2.1.9]: replace deprecated html <strike>.",
    "tidy_1115": "[11.2.1.10]: replace deprecated html <u>.",
    "tidy_1116": "[12.1.1.1]: <frame> missing title.",
    "tidy_1117": "[12.1.1.2]: <frame> title invalid (null).",
    "tidy_1118": "[12.1.1.3]: <frame> title invalid (spaces).",
    "tidy_1119": "[12.4.1.1]: associate labels explicitly with form controls.",
    "tidy_1120": "[12.4.1.2]: associate labels explicitly with form controls (for).",
    "tidy_1121": "[12.4.1.3]: associate labels explicitly with form controls (id).",
    "tidy_1122": "[13.1.1.1]: link text not meaningful.",
    "tidy_1123": "[13.1.1.2]: link text missing.",
    "tidy_1124": "[13.1.1.3]: link text too long.",
    "tidy_1125": "[13.1.1.4]: link text not meaningful (click here).",
    "tidy_1126": "[13.1.1.5]: link text not meaningful (more).",
    "tidy_1127": "[13.1.1.6]: link text not meaningful (follow this).",
    "tidy_1128": "[13.2.1.1]: Metadata missing.",
    "tidy_1129": "[13.2.1.2]: Metadata missing (link element).",
    "tidy_1130": "[13.2.1.3]: Metadata missing (redirect/auto-refresh).",
    "tidy_1131": "[13.10.1.1]: skip over ascii art."
  },

  pref: null,
  tidy: null,
  debug: false,
  filterArrayTidy: null,
  filterArrayOnline: null,
  tidyFaqUrl: null,
  permManager: null,
  defaultLanguage: "en-US",
  bNewInstall: false,
  bUpgrade: false,
  bTranslation: false,
  iTotalTimer: 0,
  editor: null, // Monaco Editor

  getPrefParam: function () {
    var aConfig = [];

    this.prefConfigBool("show-warnings", aConfig);
    this.prefConfigInt("show-errors", aConfig);
    this.prefConfigBool("indent", aConfig);
    this.prefConfigInt("indent-spaces", aConfig);
    this.prefConfigBool("uppercase-tags", aConfig);
    this.prefConfigBool("uppercase-attributes", aConfig);
    this.prefConfigInt("wrap", aConfig);
    this.prefConfigBool("output-xhtml", aConfig);
    this.prefConfigBool("output-html", aConfig);
    this.prefConfigBool("clean", aConfig);
    this.prefConfigChar("doctype", aConfig);
    // XXXX
    // this.prefConfigChar("output-encoding", aConfig);

    // accessibility check "-1" is a trick for removing
    // the table summary and img alt warnings.
    // 0 is the default value
    if (this.getIntPref("accessibility-check") > 0) {
      this.prefConfigInt("accessibility-check", aConfig);
    }

    return aConfig;
  },

  //-------------------------------------------------------------------------

  getBoolPref: function (pref) {
    return (this.pref.getBoolPref(pref));
  },
  setBoolPref: function (name, value) {
    this.pref.setBoolPref(name, value);
  },
  getIntPref: function (pref) {
    return (this.pref.getIntPref(pref));
  },
  setIntPref: function (name, value) {
    this.pref.setIntPref(name, value);
  },
  getCharPref: function (pref) {
    return (this.pref.getCharPref(pref));
  },
  setCharPref: function (name, value) {
    this.pref.setCharPref(name, value);
  },

  //-------------------------------------------------------------------------

  prefConfigBool: function (pref, aConfig) {
    aConfig.push("--" + pref);
    aConfig.push(this.pref.getBoolPref(pref) ? "yes" : "no");
  },
  prefConfigInt: function (pref, aConfig) {
    aConfig.push("--" + pref);
    aConfig.push(this.pref.getIntPref(pref).toString());
  },
  prefConfigChar: function (pref, aConfig) {
    aConfig.push("--" + pref);
    aConfig.push(this.pref.getCharPref(pref));
  },

  //-------------------------------------------------------------------------

  initCheckbox: function (name) {
    var control_name = "tidy.options." + name
    document.getElementById(control_name).checked = this.pref.getBoolPref(name);
  },
  saveCheckbox: function (name) {
    var control_name = "tidy.options." + name
    this.pref.setBoolPref(name, document.getElementById(control_name).checked);
  },
  initTextbox: function (name) {
    var control_name = "tidy.options." + name
    document.getElementById(control_name).value = this.pref.getIntPref(name);
  },
  saveTextbox: function (name) {
    var control_name = "tidy.options." + name
    this.pref.setIntPref(name, document.getElementById(control_name).value);
  },
  initCharTextbox: function (name) {
    var control_name = "tidy.options." + name
    document.getElementById(control_name).value = this.pref.getCharPref(name);
  },
  saveCharTextbox: function (name) {
    var control_name = "tidy.options." + name
    this.pref.setCharPref(name, document.getElementById(control_name).value);
  },
  initComboBox: function (name) {
    var control_name = "tidy.options." + name
    document.getElementById(control_name).value = this.pref.getCharPref(name);
  },
  saveComboBox: function (name) {
    var control_name = "tidy.options." + name
    this.pref.setCharPref(name, document.getElementById(control_name).value);
  },

  //-------------------------------------------------------------------------

  setDefaultValueBool: function (name, value) {
    if (!this.pref.prefHasUserValue(name)) {
      this.pref.setBoolPref(name, value);
    }
  },
  setDefaultValueInt: function (name, value) {
    if (!this.pref.prefHasUserValue(name)) {
      this.pref.setIntPref(name, value);
    }
  },
  setDefaultValueChar: function (name, value) {
    if (!this.pref.prefHasUserValue(name)) {
      this.pref.setCharPref(name, value);
    }
  },

  //-------------------------------------------------------------------------

  /**
   * resetFilterArray
   */
  resetFilterArray: function () {
    // List of the shown errors and warnings
    this.filterArrayTidy = new Array();
    this.filterArrayOnline = new Array();
    // Reset the fast filter in the tidylib
    this.tidy.resetFilter();
  },

  /**
   * addToFilterArray
   */
  addToFilterArray: function (id) {
    var shortId = id.substring(1);

    if (id[0] == 'o') {
      this.filterArrayOnline[shortId] = false;
    } else if (id[0] == 't') {
      this.filterArrayTidy[shortId] = false;
    }
  },

  /**
   * Build the Filter array
   */
  buildFilterArray: function () {
    this.resetFilterArray();

    // List of the hidden errors and warnings
    var filterString = this.getCharPref("filter");
    //alert("filterString.length"+filterString.length);
    if (filterString && filterString.length > 0) //here is the bug
    {
      var filterHideArray = filterString.split(',');
      for (var o in filterHideArray) {
        this.addToFilterArray(filterHideArray[o]);
      }
    }
  },

  /**
   * Save the filter array in pref
   */
  saveFilterArrayInPref: function () {
    var value = "";
    var bFirst = true;

    // Tidy
    for (var o in this.filterArrayTidy) {
      if (this.filterArrayTidy[o] == false) {
        value = value + "t" + o + ",";
      }
    }
    // Online
    for (var o in this.filterArrayOnline) {
      if (this.filterArrayOnline[o] == false) {
        value = value + "o" + o + ",";
      }
    }
    value = value.substring(0, value.length - 1);
    this.setCharPref("filter", value);
  },

  /** __ showFaq ________________________________________________________________
   *
   * Show the faq URL (called by a timer)
   */
  showFaq: function () {
    if (this.bNewInstall || this.bUpgrade) {
      oTidyUtil.tidy.log('showFaq');

      // Add the new toolbaritem in the navbar or addon bar.
      try {
        var addonbar = document.getElementById("addon-bar");
        var toolbarItem = document.getElementById("tidy-toolbar-item");

        if (toolbarItem) {
          oTidyUtil.tidy.log('showFaq:  toolbaritem is found');
          // Do nothing the toolbaritem is already there
        } else {
          var bar;
          var toolbarId;
          if (addonbar && addonbar.collapsed) {
            // if addon bar not visible, add it in the navbar
            toolbarId = "nav-bar";
          } else {
            // if addon bar is visible, add it there
            toolbarId = "addon-bar";
          }
          oTidyUtil.tidy.log('showFaq:  toolbarId=' + toolbarId);
          var toolbar = document.getElementById(toolbarId);
          toolbar.insertItem("tidy-toolbar-item", null);
          toolbar.setAttribute("currentset", toolbar.currentSet);
          oTidyUtil.tidy.log('showFaq:  toolbar.currentSet=' + toolbar.currentSet);
          document.persist(toolbar.id, "currentset");
        }
      } catch (e) {
        oTidyUtil.tidy.log('showFaq-002 - exception =' + e);
      }
    }

    if (this.bNewInstall && !this.bUpgrade) {
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
    tidyUtilOpenUrl2(this.tidyFaqUrl);
  },

  /** __ debug_log  ___________________________________________________________
   */
  debug_log: function (s) {
    console.log('<TidyDebugLog>' + s);
    /*
    if (this.debug) {
      console.log('<TidyDebugLog>' + s);
      oTidyUtil.tidy.log(s);
    }
    */
  },

  /** __ debug_start_timer  ___________________________________________________________
   */
  debug_start_timer: function (title) {
    if (this.debug) {
      this.debug_log('<TIMER> ' + title);
      return new Date().getTime();
    }
  },

  /** __ debug_stop_timer  ___________________________________________________________
   */
  debug_stop_timer: function (title, start) {
    if (this.debug) {
      var stop = new Date().getTime();
      var time = stop - start;
      this.iTotalTimer = this.iTotalTimer + time;
      this.debug_log('</TIMER> ' + title + ': Execution time: ' + time + ' / total: ' + this.iTotalTimer);
    }
  },

  /** __ cleanupDialog ___________________________________________________________
   *
   * Call the cleanup dialog box
   */
  cleanupDialog: function (aResult, aHtml, aWinArg) {
    if (aResult == null || (aResult.algorithm != "tidy" && aResult.algorithm != "serial")) {
      aResult = new TidyResult();
      aResult.validate_with_algorithm(aHtml, "tidy");
    }

    if (aResult.iNbError > 0) {
      // Show a confirmation dialog
      // XXXXXX
      var err = aResult.iNbError + " " + this.getString((aResult.iNbError > 1 ? "tidy_errors" : "tidy_error"));
      var msg = stringBundle.getFormattedString("tidy_cleanup_error", [err]);
      alert(msg);
      /*
        if( result==1 )
        {
          return;
        }
      */
    }
    // XXXXXXXXXXXXXXX
    sessionStorage.setItem("tidy_html", aHtml);
    sessionStorage.setItem("tidy_url", 'http://xxxxx');
    document.getElementById('tidy.iframe.option').src = "tidy_cleanup.html";
    document.getElementById('tidy.option.modal').style.display = "block";
    /*
    openDialog(
        "chrome://tidy/content/tidyCleanup.xul",
        "",
        "centerscreen,dialog=no,chrome,resizable",
        aHtml,
        aWinArg
    );
    */
  },

  /** __ permDialog ___________________________________________________________
   *
   * Call the permission dialog box
   */
  permDialog: function () {
    // XXXXXXXXXXXXXXXXXX
    /*
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
    */
  },

  /** __ getString ___________________________________________________________
   */
  getString: function (aName) {
    /*
    if (this.stringBundle == null) {
        this.stringBundle = document.getElementById("tidy.string.bundle");
        if (this.stringBundle == null) {
            return "";
        }
    }
    return this.stringBundle.getString(aName);
    */
    if (this.stringBundle[aName]) {
      return this.stringBundle[aName];
    } else {
      throw "getString"
    }

  },

  /** __ isInDomainList ___________________________________________________________
   */
  isInDomainList: function (doc) {
    if( doc.location.protocol=="about:" )
    {
      return false;
    }
    if( doc.location.protocol=="chrome:" )
    {
      return false;
    }
    return true;
  },

  /** __ getDocHost ____________________________________________________________
   */
  /*
  getDocURI: function (doc) {
      try {
          var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
          var host = doc.location.host;
          var uri = ioService.newURI("http://" + host, null, null);
          return uri;
      } catch (exc) {
          return null;
      }
  },
  */

  /** __ translation ___________________________________________________________
   *
   * Load the translation from the tidy.properties file in the tidy lib
   */
  translation: function () {
    if (this.tidy.initTranslation()) {
      var f = "/sgml.soc";
      var f2 = "/xml.soc";
      this.tidy.spInit(f, f2);

      try {
        // Does not load the us translation when not in debug mode
        if (oTidyUtil.getBoolPref("debug") || this.defaultLanguage != "en-US") {
          var id_list = {
            value: ""
          };
          this.tidy.getIdOfAllErrors(id_list);
          var id_array = id_list.value.split(',');
          var t = "";
          for (var id in id_array) {
            t += this.getString("tidy_" + id_array[id]) + "\n";
          }
          this.tidy.addTranslations(t);
          var prefix = this.getString("tidy_prefix");
          var linecol = this.getString("tidy_linecol") + " ";

          this.tidy.setTranslationPrefix(prefix, linecol);
          this.tidy.checkTranslation();

          this.buildFilterArray();
        }
        // Translate the description of the extension.
        // XXXXXXXXXXXX
      } catch (e) {
        oTidyUtil.tidy.log('<ERROR>translation exception, defaultLanguage= ' + this.defaultLanguage);
      }
    }
  },

  /** __ getErrors ___________________________________________________________
   *
   * Load the translation from the tidy.properties file in the tidy lib
   */
  getErrors: function (ahtml, config, nbError, nbWarning, nbAccessWarning, nbHidden) {
    // TODO
  },

  /** __ sortArray _____________________________________________________________
   *
   */
  sortArray: function (array, col, descending) {
    array.sort(
      function (l1, l2) {
        var v1 = l1[col];
        var v2 = l2[col];
        if (l1.errorId < 0) {
          if (l2.errorId < 0) {
            return l1.errorId < l2.errorId ? 1 : -1;
          }
          return -1;
        }
        if (l2.errorId < 0) {
          return 1;
        }

        var res = 0;
        if (v1 > v2) {
          res = 1;
        } else if (v1 < v2) {
          res = -1;
        } else {
          // second criteria line number
          if (l1.line > l2.line) {
            res = 1;
          } else if (l1.line < l2.line) {
            res = -1;
          } else {
            if (l1.column > l2.column) {
              res = 1;
            } else if (l1.column < l2.column) {
              res = -1;
            }
          }
        }
        return descending ? -res : res;
      }
    );
  },

  /** __ onlineSplash ___________________________________________________________________
   *
   * Show the splah before online validation
   */

  onlineSplash: function (title) {
    var page = window.open("about:blank");
    var doc = page.document;
    var body = doc.body;

    body.appendChild(doc.createElement("br"));
    var center = doc.createElement("center");
    var div = doc.createElement("div");
    div.setAttribute("style", "width: 400px; background-color: #eee; border: solid 1px;");
    div.appendChild(doc.createElement("br"));
    div.appendChild(doc.createTextNode(title));
    div.appendChild(doc.createElement("br"));
    div.appendChild(doc.createTextNode("Please wait"));
    div.appendChild(doc.createElement("br"));
    div.appendChild(doc.createElement("br"));
    center.appendChild(div);
    body.appendChild(center);
    return doc;
  },

  /** __ onlineHtmlValidate _____________________________________________________________
   *
   * Validate the HTML online to W3C Validator
   */
  onlineHtmlValidate: function (html) {
    var doc = this.onlineSplash("Contacting the W3C HTML Validator");

    var formElement = doc.createElement("form")
    formElement.setAttribute("method", "post");
    formElement.setAttribute("enctype", "multipart/form-data");
    formElement.setAttribute("action", "https://validator.w3.org/nu/");
    // formElement.setAttribute("action", this.getCharPref("online_url"));
    formElement.setAttribute("style", "display: none;");

    var text = doc.createElement("text")
    text.setAttribute("name", "showsource");
    text.appendChild(doc.createTextNode("yes"));
    formElement.appendChild(text);

    var textAreaElement = doc.createElement("textarea")
    textAreaElement.setAttribute("name", "content");
    textAreaElement.appendChild(doc.createTextNode(html));
    formElement.appendChild(textAreaElement);

    doc.body.appendChild(formElement);
    formElement.submit();
  },

  /** __ onlineCssValidate _____________________________________________________________
   *
   * Validate the CSS online to W3C CSS Validator
   */
  onlineCssValidate: function (url) {
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
  getDocInnerHtml: function (doc) {
    var sHtml = "";
    var isXhtml = false;
    if (doc.doctype) {
      if (doc.doctype.publicId == "") {
        sHtml = "<!doctype html>\n";
        // HTML 5
      } else {
        sHtml = "<!DOCTYPE " + doc.doctype.name + " PUBLIC \"" + doc.doctype.publicId + "\">\n";
        isXhtml = (sHtml.toUpperCase().indexOf("XHTML") >= 0);
        if (isXhtml) {
          if (doc.doctype.publicId.indexOf("Transitional") >= 0) {
            sHtml = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\" \"http://www.w3.org/TR/html4/loose.dtd\">\n";
          } else {
            sHtml = "<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">\n";
          }
          sHtml += "<!-- XHTML doctype changed to HTML 4.0.1 (See documentation) -->\n";
        }
      }
    }

    sHtml += "<!-- HTML after JavaScript execution -->\n" +
      "<html>\n" +
      "<head>\n" +
      doc.getElementsByTagName("head")[0].innerHTML + "\n" +
      "</head>\n" +
      "<body>\n" +
      doc.body.innerHTML +
      "</body>\n" +
      "</html>\n";

    return sHtml;
  },

  /** __ writeFile ________________________________________________________________
   *
   */
  writeFile: function (file, content) {
    this.tidy.writeFile(file, content);
  },

  /** __ readFile ________________________________________________________________
   *
   */
  readFile: function (file) {
    return (this.tidy.readFile(file));
  },

  /** __ insertHtmlAndLines ________________________________________________________________
   *
   */
  insertHtmlAndLines: function (html, source_name, bMinimap) {
    var source = document.getElementById(source_name);
    if (html != null) {
      // XXXXXXX
      console.log('before monaco');
      if (this.editor == null) {
        this.editor = monaco.editor.create(source, {
          value: html,
          language: 'html',
          automaticLayout: true,
          minimap: {
            enabled: bMinimap
          }
        });
      } else {
        this.editor.getModel().setValue(html);
      }
      console.log('after monaco');
    } else {
      source_pre.textContent = 'No html content';
    }
  },

  /** __ onHamburger ________________________________________________________________
   *
   */
  onHamburger: function () {
    var menu = document.getElementById("menu");
    if (menu.style.width == "20em") {
      menu.style.width = "0px";
    } else {
      menu.style.width = "20em";
    }
  },

  closeHamburger: function () {
    var menu = document.getElementById("menu");
    menu.style.width = "0px";
  }
}

//-------------------------------------------------------------
// TidyResult
//-------------------------------------------------------------

function TidyResult(doc) {
  if (doc != null) {
    this.lastURL = doc.URL;
  }
}

TidyResult.prototype = {
  lastURL: null,
  algorithm: "tidy",
  iNbError: 0,
  iNbWarning: 0,
  iNbAccessWarning: 0,
  iNbHidden: 0,
  bInDomainList: true,
  bValidated: false,
  bUConvFailed: false,
  bEmpty: false,
  bHTML5: false,

  /** __ getPluralString ______________________________________________________
   */
  getPluralString: function (nb, s) {
    if (nb == 0) {
      return "tidy_0_" + s + "s";
    } else if (nb == 1) {
      return "tidy_" + s;
    } else {
      return "tidy_" + s + "s";
    }
  },

  /** __ getErrorString ______________________________________________________
   *
   * Build a error string for a page
   */
  getErrorString: function () {
    var str;
    if (this.bUConvFailed) {
      str = oTidyUtil.getString('tidy_invalid_char');
    } else if (!this.bValidated) {
      if (this.bHTML5) {
        // XXXX needs translation
        str = "HTML 5 - see Page Source";
      } else if (this.algorithm == "cse") {
        // XXXXXXXXXXXXXXX
        str = "CSE - see Page Source";
      } else {
        // XXXXXXXXXXXXXXX
        str = "Not validated";
      }
    } else if (this.bInDomainList) {
      if (this.bEmpty) {
        str = oTidyUtil.getString('tidy_empty');
      } else {
        str =
          this.iNbError + " " + oTidyUtil.getString(this.getPluralString(this.iNbError, "error")) + " / " +
          this.iNbWarning + " " + oTidyUtil.getString(this.getPluralString(this.iNbWarning, "warning")) +
          (this.iNbAccessWarning == 0 ? "" : " / " + this.iNbAccessWarning + " " + oTidyUtil.getString(this.getPluralString(this.iNbAccessWarning, "access_warning"))) +
          (this.iNbHidden == 0 ? "" : " (" + this.iNbHidden + " " + oTidyUtil.getString("tidy_hidden") + ")");
      }
    } else {
      str = oTidyUtil.getString("tidy_not_in_domain");
    }
    return str;
  },

  /** __ getIcon _______________________________________________________
   *
   * Build a error icon for a page
   */
  getIcon: function () {
    var icon = "good";
    if (this.bUConvFailed)
    // Normally bUConvFailed page are not validated. But in the case of a SUM of page. The sum is validated
    // and a frame can be "bUConvFailed"
    {
      icon = "charset";
    } else if (!this.bValidated) {
      if (this.bHTML5) {
        icon = "html5";
      } else {
        icon = "not_validated";
      }
    } else if (this.bInDomainList) {
      if (this.bEmpty) {
        icon = "empty";
      } else if (this.iNbError > 0) {
        icon = "error";
      } else if (this.iNbWarning > 0) {
        icon = "warning";
      } else if (this.iNbHidden > 0) {
        icon = "hidden";
      }
    } else {
      icon = "exclude";
    }
    return icon;
  },

  /** __ getErrorIcon _______________________________________________________
   *
   * Build a error icon for a page
   */
  getErrorIcon: function () {
    return "../skin/" + this.getIcon();
  },

  /** __ updateIcon _______________________________________________________
   *
   * Build a error icon for a page
   */
  updateIcon: function () {
    var icon = "skin/" + this.getIcon() + ".png";
    var badge = "";
    var title = "Html Validator\n " + this.iNbError + " error" + (this.iNbError > 1 ? "s" : "") + " / " + this.iNbWarning + " warning" + (this.iNbWarning > 1 ? "s" : "");
    if (this.iNbError > 0) {
      badge = this.iNbError;
    } else if (this.iNbWarning > 0) {
      badge = this.iNbWarning;
    }
    oTidyUtil.tidy.updateIconBadgeTitle(icon, badge, title);
  },

  /** __ validate _______________________________________________________
   */
  validate: function (aHtml, aDocType) {
    return this.validate_with_algorithm(aHtml, aDocType, oTidyUtil.getCharPref("algorithm"));
  },

  /** __ validate_with_algorithm ________________________________________
   */
  validate_with_algorithm: function (aHtml, aDocType, aAlgorithm) {
    // The inout arguments need to be JavaScript objects

    // Activate the button if it is on the screen
    var button_online = document.getElementById('tidy_online2');
    var button_offline = document.getElementById('tidy_offline');
    if (button_online) {
      if (aAlgorithm == "online") {
        button_online.classList.add("button_activated");
        button_offline.classList.remove("button_activated");
      } else {
        button_offline.classList.add("button_activated");
        button_online.classList.remove("button_activated");
      }
    }

    var nbError = {
      value: 0
    };
    var nbWarning = {
      value: 0
    };
    var nbAccessWarning = {
      value: 0
    };
    var nbHidden = {
      value: 0
    };
    var error = {
      value: "---"
    };
    var accessLevel = oTidyUtil.getIntPref("accessibility-check");

    if (aHtml != null) {
      var reg5 = /^\s*<\!doctype html>/i;
      var reg5_leg = /^\s*<\!doctype html system .about:legacy-compat.>/i;
      // /i is for case insensitive
      // /s at the beginning to skip the spaces
      if (aAlgorithm != "online" && aAlgorithm != "cse" && (aHtml.match(reg5) || aHtml.match(reg5_leg))) {
        this.bHTML5 = true;
        /*
        if (window.oTidyViewSource) {
          // XXXXXXXXXXXXXX TODO ADD A DIALOG BOX TO ASK YES/NO
          aAlgorithm = "online";
        } else {
          error = {
            value: "HTML5 detected: validation cancelled"
          };
          return error;
        }
        */
      }
      this.algorithm = aAlgorithm;
      if (aAlgorithm == "tidy") {
        this.tidy_Filter(aHtml, oTidyUtil.getPrefParam(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden);
        // oTidyUtil.tidy.getErrorsInHTML(aHtml, oTidyUtil.getPrefParam(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden);
        //alert(error.value);
      } else if (aAlgorithm == "online") {
        if (window.oTidyViewSource) {
          this.validateOnline(aHtml, aDocType, oTidyUtil.getPrefParam(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden);
        } else {
          //XXXXXXXXXXXXXXXXXXXXXXX
          error = {
            value: "online disabled"
          };
          return error;
        }
      } 
      /* else // serial
      {
        this.algorithm = "sp";
        this.sp_Filter(aHtml, oTidyUtil.getPrefParam(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden);
        if (nbWarning.value == 0 && nbError.value == 0) {
          this.algorithm = "tidy";
          this.tidy_Filter(aHtml, oTidyUtil.getPrefParam(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden);
          if (nbWarning.value == 0 && nbError.value == 0 && nbAccessWarning.value == 0) {
            // Promote to serial if all is perfect
            this.algorithm = "serial";
          }
        }
      }
      */
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

  /** __ tidy_Filter _______________________________________________________
   */
  tidy_Filter: function (aHtml, PrefConfig, accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden) {
    error.value = ".";
    oTidyUtil.tidy.getErrorsInHTML(aHtml, oTidyUtil.getPrefParam(), accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden);

    // Filter enabled for OpenSP ?
    if (oTidyUtil.filterArrayTidy.length > 0) {
      try {
        // XXX maybe try to combine this with ViewSource.validateHtml
        // More than 500 errors, we skip the filter
        // Without this, it can cause sometimes an error in the UI: Script: chrome://tidy/content/tidyUtil.js:1161 (Stop) (Continue Script)
        if (nbError.value + nbWarning.value < 500 || oTidyViewSource != null) {
          var tmperror = {
            value: ""
          };
          var rows = error.value.split('\n');
          var isLastSkip = false;
          for (var o in rows) {
            var row = new TidyResultRow();
            row.parse("tidy", rows[o], 0);
            if (oTidyUtil.filterArrayTidy[row.errorId] == false) {
              if (row.type == 4) {
                nbHidden.value++;
                nbError.value--;
              } else if (row.type == 1) {
                nbHidden.value++;
                nbWarning.value--;
              }
            } else {
              tmperror.value += rows[o] + "\r\n";
            }
          }
          error.value = tmperror.value;
        }
      } catch (e) {
        console.log(e);
      }
    }
  },

  /** __ validateOnline _______________________________________________________
   */
  validateOnline: function (aHtml, aDocType, PrefConfig, accessLevel, error, nbError, nbWarning, nbAccessWarning, nbHidden) {
    error.value = null;
    error.async = true;

    // Validate only in view source
    if (!window.oTidyViewSource) {
      return;
    }
    var boundary = "---------------------------7da2de3a20016a"
    var message = "--" + boundary + "\r\n" +
      "Content-Disposition: form-data; name=\"out\"\r\n\r\n" +
      "json\r\n" +
      "--" + boundary + "\r\n" +
      "Content-Disposition: form-data; name=\"fragment\"\r\n\r\n" +
      aHtml + "\r\n" +
      "--" + boundary + "--\r\n";

    var http = new XMLHttpRequest();
    var url = "https://validator.w3.org/nu/";
    var params = "output=json";
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "multipart/form-data; boundary=" + boundary);
    http.setRequestHeader("Accept", "*/*");

    /*
    X-W3C-Validator-Errors: 0
    X-W3C-Validator-Recursion: 1
    X-W3C-Validator-Status: Valid
    X-W3C-Validator-Warnings: 2
    */

    http.result = this;
    http.onreadystatechange = function () {
      //Call a function when the state changes.
      if (http.readyState == 4) {

        console.log( "http.responseText: " + http.responseText );
        var error = null;
        if (http.status == 200) {
          try {
            error = JSON.parse(http.responseText);
          } catch (ex) {
            tidyShowExceptionInConsole(ex);
            // Init a dummy error message with the exception
            error = {
              messages: new Array()
            };
            error.messages = new Array();
            error.messages[0] = {
              type: "error",
              message: "Online parser error"
            };
            error.messages[1] = {
              type: "error",
              message: "Go to menu: HTML Validator/W3c Online validator to see the error"
            };
          }
        } else {
          error = {
            messages: new Array()
          };
          error.messages = new Array();
          error.messages[0] = {
            type: "error",
            message: "Can not contact the url: " + oTidyUtil.getCharPref("online_url")
          };
        }

        var result = http.result;
        result.iNbError = 0;
        result.iNbWarning = 0;
        for (var i = 0; i < error.messages.length; i++) {
          if (error.messages[i].type == "warning") {
            result.iNbWarning++;
          } else if (error.messages[i].type == "error") {
            result.iNbError++;
          }
        }

        if (window && window.oTidyViewSource) {
          // XXXX There should be a filtering function call here
          window.oTidyViewSource.parseError(error, result, aDocType);
        }
        // alert(http.responseText);
      }
    }
    http.send(message);
  },

}

//-------------------------------------------------------------
// TidyResultRow
//
// Contains and parse the structure of a result row
//-------------------------------------------------------------

function TidyResultRow() { }

TidyResultRow.prototype = {
  data: "",
  line: -1,
  column: -1,
  type: -1,
  errorId: -1,
  arg1: "",
  arg2: "",
  arg3: "",
  icon: null,
  icon_text: null,
  skip: false,
  explanation: null,

  /** __ isMessageHidable ______________________________________________
   */
  isMessageHidable: function () {
    if (this.type != 0) {
      return true;
    }
    return false;
  },

  /** __ init ______________________________________________________
   */
  init: function (_data, _line, _column, _type, _errorId, _arg1, _arg2, _arg3, _icon, _icon_text) {
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
  parse: function (algorithm, d, unsorted) {
    if (d.search("\r") >= 0) {
      d = d.substring(0, d.search("\r"));
    }
    if (d.length == 0) {
      this.skip = true;
    } else {
      if (algorithm == "tidy" || algorithm == "serial") {
        var ds = d.split('\t');
        this.line = parseInt(ds[0]);
        this.column = parseInt(ds[1]);
        this.errorId = ds[2];
        this.type = ds[3];
        this.data = ds[4];
        // XXXXXXXXXXXX TODO get arg1, arg2, arg3
      } else if (algorithm == "sp") {
        try {
          var pos = d.search(".html:");
          var d1 = d.substring(pos + 6);
          pos = d1.search(" ");
          this.data = d1.substring(pos + 1);
          var d2 = d1.substring(0, pos);
          var ds = d2.split(':');
          this.line = parseInt(ds[0]);
          this.column = parseInt(ds[1]);
          if (ds[3] == "") {
            this.type = 0; // Info
            this.errorId = -1;
          } else {
            var ds2 = ds[2].split('.');
            if (ds[3] == "E") {
              this.type = 4; // Error
            } else if (ds[3] == "W") {
              this.type = 1; // Warning
            } else {
              this.type = 0; // Info
            }

            this.errorId = ds2[1];
            if (this.errorId == 435) {
              this.type = 0;
              this.skip = true;
            } else if (oTidyUtil.filterArraySP[this.errorId] == false) {
              this.skip = true;
            }
          }
        } catch (ex) {
          // alert('line decode issue:\n'+d);
        }
      } else {
        alert('parse: Algorithm unknown\n' + d);
      }
    }

    this.parseIcon(d);
  },

  /** __ parseIcon  ______________________________________________________
   */
  parseIcon: function (d) {
    if (this.type == 4) {
      this.icon = "error";
      this.icon_text = oTidyUtil.getString("tidy_cap_error");
    } else if (this.type == 1) {
      this.icon = "warning";
      this.icon_text = oTidyUtil.getString("tidy_cap_warning");
    } else if (this.type == 3) {
      this.icon = "access";
      this.icon_text = oTidyUtil.getString("tidy_cap_access_warning");
    } else if (this.type == 0) {
      this.icon = "info";
      this.icon_text = oTidyUtil.getString("tidy_cap_info");
    } else if (this.type == 5) {
      this.icon = "message";
      this.icon_text = oTidyUtil.getString("tidy_cap_message");
    } else {
      this.data = d;
    }
  },



  /** __ online2row ______________________________________________________
   */

  // Get a number from a string that hope to be unique
  // Note: this algorithm is really dumb and bad :)
  // It seems that error parameters are always in special quote “input”, “alt”
  // Replace first by ... to get more consistant numbers
  online_string2number: function (s) {
    var id;
    var res = 0;
    s = s.replace(/\u201C.*?\u201D/gi, "...");
    for (var i = 0; i < s.length; i++) {
      id = s.charCodeAt(i);
      res += id;
    }
    // alert( "String : " + s + " / " + res );
    return res;
  },

  online2row: function (d) {
    /*
              "firstColumn": 1,
              "lastLine": 7,
              "lastColumn": 2871,
              "message": "Attribute width not allowed on element div at this point.",
              "messageid": "html5",
              "explanation": "\n<div class=\"ve html5\"><dl xmlns=\"http://www.w3.org/1999/xhtml\"><dt>Element-specific attributes for element <a href=\"http://www.whatwg.org/specs/web-apps/current-work/#the-div-element\"><code>div</code></a>:</dt>\n   <dd><a href=\"http://www.whatwg.org/specs/web-apps/current-work/#global-attributes\">Global attributes</a></dd>\n   </dl></div>\n",
              "type": "error"
    */
    this.line = d.lastLine;
    this.column = d.firstColumn;
    // The errorID is always hmtl5, it is useless.
    // Using a very dummy and stupid algorithm until fixed.
    //  this.errorId = d.messageid;
    this.errorId = this.online_string2number(d.message);
    this.data = d.message;
    this.explanation = d.explanation;


    // Hide
    // XXXX Filtering to improve
    if (oTidyUtil.filterArrayOnline.length > 0) {
      if (oTidyUtil.filterArrayOnline[this.errorId] == false) {
        this.skip = true;
      }
    }

    if (d.type == "error") {
      this.type = 4;
    } else if (d.type == "info") {
      this.type = 0;
      if (typeof d.subtype !== "undefined") {
        if (d.subtype == "warning") {
          this.type = 1;
        }
      }
    } else if (d.type == "warning") {
      this.type = 1;
    }

    this.parseIcon(d.type);
  },

  /** __ cse2row ______________________________________________________
   */
  cse2row: function (d) {
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
    if (d.messagetype == "ERROR") {
      this.type = 4;
    } else if (d.messagetype == "MESSAGE") {
      this.type = 5;
    } else if (d.messagetype == "COMMENT") {
      this.type = 0;
    } else if (d.messagetype == "WARNING") {
      this.type = 1;
    }
    this.parseIcon(d.type);
  },

  /** __ getString ______________________________________________________
   */
  getString: function () {
    var s = "";
    if (this.line > 0) {
      s += "line " + this.line;
      if (this.column > 0) {
        s += " column " + this.column;
      }
      s += " - ";
    }
    s += this.icon_text + ": " + this.data;
    return s;
  }
}

//-------------------------------------------------------------
// TidyItemQueue
//-------------------------------------------------------------

function TidyItemQueue(_html, _tidyResult, _iLocation) {
  this.html = _html;
  this.tidyResult = _tidyResult;
  this.iLocation = _iLocation;
}

TidyItemQueue.prototype = {
  html: null,
  tidyResult: null,
  iLocation: null,
  nextItem: null
}

//-------------------------------------------------------------
// TidyFifoQueue (Implemented as a list of TidyItemQueue)
//-------------------------------------------------------------

function TidyFifoQueue() { }

TidyFifoQueue.prototype = {
  firstItem: null,
  lastItem: null,


  /** __ push ______________________________________________________
   */
  push: function (item) {
    try {
      if (this.firstItem == null) {
        this.firstItem = item;
        this.lastItem = item;
      } else {
        this.lastItem.nextItem = item;
        this.lastItem = item;
      }
    } catch (ex) {
      // It seems that in some case, the document is cleanup before that we can use it
      // or after hibernate. In such a case a "Error: TypeError: can't access dead object" is raised
      // In such case, let's reset the queue.
      this.firstItem = item;
      this.lastItem = item;
      tidyShowExceptionInConsole(ex);
    }
  },

  /** __ pop _______________________________________________________
   *
   * RemoveItem at the  beginning of the list
   * Return null if no item
   */
  pop: function () {
    var item = this.firstItem;
    if (this.firstItem != null) {
      this.firstItem = this.firstItem.nextItem;
      if (this.firstItem == null) {
        this.lastItem = null;
      }
    }
    return item;
  },

  /** __ clear _______________________________________________________
   *
   * Remove all
   */
  clear: function () {
    this.firstItem = null;
    this.lastItem = null;
  }


}
