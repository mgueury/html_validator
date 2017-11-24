// FAKE

var tidy_pref = {};
tidy_pref.prefs = {};
tidy_pref.load = function(callback) {
  if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {
    chrome.storage.sync.get(null, function(items) {
      console.log("items:" + JSON.stringify(items))
      tidy_pref.prefs = items;
      callback();
    });
  }
};
tidy_pref.load(isNewInstall);

// Check if this is a new install/update. If yes, show a popup
function isNewInstall() {
  if (typeof chrome != 'undefined') {
    var cur_version = chrome.runtime.getManifest().version;
    var pref = new TidyPref();
    var last_version = pref.getPref('version');
    pref.setPref('version', cur_version);
    console.log("current_version: " + cur_version + "/ last_version: " + last_version);

    var sBrowser = "";
    if (typeof chrome !== "undefined") {
      if (typeof browser !== "undefined") {
        sBrowser = "Firefox";
      } else {
        sBrowser = "Chrome";
      }
    } else {
      sBrowser = "Edge";
    }

    // In devtools, chrome.runtime is not accessible
    if (typeof chrome != 'undefined' && typeof chrome.runtime != 'undefined') {
      chrome.runtime.getPlatformInfo(function(info) {
        // Display host OS in the console
        console.log(info.os);
        if (!last_version) {
          // is install
          chrome.tabs.create({
            url: "http://users.skynet.be/mgueury/mozilla/new_webextension.html?version=" + cur_version + "&browser=" + sBrowser + "&platform=" + info.os,
            active: true
          });
        } else if (last_version != cur_version) {
          chrome.tabs.create({
            url: "http://users.skynet.be/mgueury/mozilla/new_webextension.html?version=" + cur_version + "&browser=" + sBrowser + "&platform=" + info.os,
            active: true
          });
        }
      });
    }
    return last_version != cur_version;
  } else {
    // Browser mode
    return false;
  }
}

function TidyPref() {};

TidyPref.prototype = {
  /*
    dummy preference system for HTML fake
  */
  html: null,
  // '<html>\n<title>Main</title>\n</abc>\n<body>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\n123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890</def><br>\n</body>\n',

  prefs: {
    "abc": "123"
  },

  setPref: function(name, value) {
    var s = "tidy_pref_" + name;
    if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {
      var p = {};
      p[s] = value;
      tidy_pref.prefs[s] = value;
      chrome.storage.sync.set(p, function() {});
    } else {
      localStorage.setItem(s, value);
    }
    // this.prefs[name] = value;
  },
  /** __ getIntPref _______________________________________________________
   */
  getPref: function(name) {
    var s = "tidy_pref_" + name;
    if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {
      return tidy_pref.prefs[s];
    } else {
      return localStorage.getItem(s);
    }
  },

  /** __ prefHasUserValue ___________________________________________
   */
  prefHasUserValue: function(name) {
    var value = this.getPref(name);
    if (value) {
      return true;
    }
    return false;
  },

  /** __ setBoolPref _______________________________________________________
   */
  setBoolPref: function(name, value) {
    this.setPref(name, value);
  },

  /** __ setIntPref _______________________________________________________
   */
  setIntPref: function(name, value) {
    this.setPref(name, value);
  },

  /** __ setCharPref _______________________________________________________
   */
  setCharPref: function(name, value) {
    this.setPref(name, value);
  },

  /** __ getBoolPref _______________________________________________________
   */
  getBoolPref: function(name) {
    var val = this.getPref(name)
    var bool = val == 'true' || val == true;
    return bool;
  },

  /** __ getIntPref _______________________________________________________
   */
  getIntPref: function(name) {
    return Number(this.getPref(name));
  },

  /** __ getCharPref _______________________________________________________
   */
  getCharPref: function(name) {
    return this.getPref(name);
  },

  /** __ setHtml ___________________________________________
   *
   */
  setHtml: function(aHtml) {
    this.html = aHtml;
  },

  /** __ getHtml ___________________________________________
   *
   * Remove the color added to the lines
   */
  getHtml: function() {
    if (oTidyViewSource.currentFrame == "sub") {
      return '<html>\n<title>Sub</title>\n</abc>\n<body>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\n12345</def><br>\n</body>\n';
    } else if (oTidyViewSource.currentFrame == "subsub") {
      return '<!doctype html>\n<html>\n<head>\n<title>SubSub</title>\n</head>\n<body>\ntext<br>\n</body>\n</html>\n';
    } else {
      return this.html
    }
  },
}
