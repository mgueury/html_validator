// FAKE

var tidy_pref = {};
// I expect that this gives new errors.
// 0.985 // tidy_pref.prefs = null;
tidy_pref.prefs = {};
tidy_pref.online_default_url = "http://validator.w3.org/nu/";
tidy_pref.html = null;
tidy_pref.frames = null;
// '<html>\n<title>Main</title>\n</abc>\n<body>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\n123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890</def><br>\n</body>\n',

tidy_pref.load = function (callback) {
  if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {
    // Webextension mode
    chrome.storage.local.get(null, function (items) {
      console.log("items:" + JSON.stringify(items))
      tidy_pref.prefs = items;
      callback();
    });
  } else {
    // Html mode
    callback();
  }
};

// Check if this is a new install/update. If yes, show a popup
tidy_pref.isNewInstall = function () {
  if (typeof chrome != 'undefined' && typeof chrome.runtime != 'undefined' && typeof chrome.runtime.getManifest == 'function') {
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
    try {
      chrome.runtime.getPlatformInfo(function (info) {
        // Display host OS in the console
        console.log(info.os);
        if (!last_version) {
          // is install
          chrome.tabs.create({
            url: "https://www.gueury.com/mozilla/new_webextension.html?version=" + cur_version + "&browser=" + sBrowser + "&platform=" + info.os,
            active: true
          });
        } else if (last_version != cur_version) {
          chrome.tabs.create({
            url: "https://www.gueury.com/mozilla/new_webextension.html?version=" + cur_version + "&browser=" + sBrowser + "&platform=" + info.os,
            active: true
          });
        }
      });
    } catch (e) {
      console.log("getPlatformInfo not accessible in devtools");
    }
    return last_version != cur_version;
  } else {
    // Browser mode
    return false;
  }
}

/** __ setHtml ___________________________________________
 */
tidy_pref.setHtml = function (aHtml) {
  console.log("<setHtml>");
  tidy_pref.html = aHtml;
},

  /** __ getHtml ___________________________________________
   */
  tidy_pref.getHtml = function () {
    if (typeof chrome != 'undefined') {
      return tidy_pref.html;
    } else {
      return '<html>\n<title>Sub</title>\n</abc>\n<body>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\ntext<br>\n12345</def><br>\n</body>\n';
    }
  }

/** __ setFrames ___________________________________________
 */
tidy_pref.setFrames = function (aFrames) {
  console.log("<setFrames>");
  tidy_pref.frames = aFrames;
}

/** __ getFrames ___________________________________________
 */
tidy_pref.getFrames = function () {
  console.log("<getFrames>");
  return tidy_pref.frames;
}

/** __ getFrameUrl ___________________________________________
 */
tidy_pref.getFrameUrl = function () {
  var urls = [];
  if (tidy_pref.frames != null) {
    for (const frame of tidy_pref.frames) {
      urls.push(frame.url);
    }
  }
  return urls;
}

/** __ getFrameId ___________________________________________
 */
tidy_pref.getFrameId = function (url) {
  var frameId = 0;
  if (tidy_pref.frames != null) {
    for (const frame of tidy_pref.frames) {
      if (url == frame.url) {
        return frame.frameId;
      }
    }
  }
  return frameId;
}

tidy_pref.load(tidy_pref.isNewInstall);

function TidyPref() { };

TidyPref.prototype = {

  prefs: {
    "abc": "123"
  },

  setPref: function (name, value) {
    var s = "tidy_pref_" + name;
    if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {
      var p = {};
      p[s] = value;
      tidy_pref.prefs[s] = value;
      chrome.storage.local.set(p, function () { });
    } else {
      localStorage.setItem(s, value);
    }
    // this.prefs[name] = value;
  },
  /** __ getIntPref _______________________________________________________
   */
  getPref: function (name) {
    var s = "tidy_pref_" + name;
    if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {
      return tidy_pref.prefs[s];
    } else {
      return localStorage.getItem(s);
    }
  },

  /** __ prefHasUserValue ___________________________________________
   */
  prefHasUserValue: function (name) {
    var value = this.getPref(name);
    if (typeof value != 'undefined') {
      return true;
    }
    return false;
  },

  /** __ setBoolPref _______________________________________________________
   */
  setBoolPref: function (name, value) {
    this.setPref(name, value);
  },

  /** __ setIntPref _______________________________________________________
   */
  setIntPref: function (name, value) {
    this.setPref(name, value);
  },

  /** __ setCharPref _______________________________________________________
   */
  setCharPref: function (name, value) {
    this.setPref(name, value);
  },

  /** __ getBoolPref _______________________________________________________
   */
  getBoolPref: function (name) {
    var val = this.getPref(name)
    var bool = val == 'true' || val == true;
    return bool;
  },

  /** __ getIntPref _______________________________________________________
   */
  getIntPref: function (name) {
    return Number(this.getPref(name));
  },

  /** __ getCharPref _______________________________________________________
   */
  getCharPref: function (name) {
    return this.getPref(name);
  }
}
