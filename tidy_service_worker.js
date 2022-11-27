// History
// 2022-08-08 : Merge of tidy_background.js and tidy_platform_fake.js
//http://stackoverflow.com/questions/11661613/chrome-devpanel-extension-communicating-with-background-page

// Function to send a message to all devtool.html views:
var ports = {};
var tidyFrames = [];

// For Chrome
function notifyDevtoolsUrl(aTabId, aUrl) {
  Object.keys(ports).forEach(function (portId_) {
    ports[portId_].postMessage({
      from: "tidy_background.url_only",
      tabId: aTabId,
      url: aUrl
    });
  });
};

// For Firefox
function notifyDevtoolsHtml(aTabId, aHtml) {
  Object.keys(ports).forEach(function (portId_) {
    ports[portId_].postMessage({
      from: "tidy_background.dom2string",
      tabId: aTabId,
      html: aHtml,
      frames: tidyFrames
    });
  });
}

var g_bIsFirefox = false;
var iLastTabId = null;

function call_dom2string(tabId, frameId) {
  // Firefox WA - execute a content script to get the HTML
  console.log("tidy_background: call_dom2string");
  iLastTabId = tabId;
  chrome.scripting.executeScript({
    target: {tabId: tabId},
    files: ['tidy_dom2string.js'],
  });
/* chrome.tabs.executeScript(tabId, {
      frameId: frameId,
      file: "tidy_dom2string.js"
  }, function () {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      console.log('Tidy_background: error injecting script : \n' + chrome.runtime.lastError.message);
    }
  });
  */
}

function firefox_get_frames_then_call_dom2string(tabId) {
  chrome.webNavigation.getAllFrames({ "tabId": tabId },
    function (details) {
      console.log("tidyBackground: getAllFrames:" + details.length);
      tidyFrames = [];
      for (const detail of details) {
        tidyFrames.push({ url: detail.url, frameId: detail.frameId });
      }
      console.log("tidyBackground: getAllFrames:" + frames);
      // 2)  calls dom2string to get the HTML source of the top page (frameId=0)
      call_dom2string(tabId, 0);
    }
  );
}

// Fired when a connection is made from either an extension process or a content script (by runtime.connect).
chrome.runtime.onConnect.addListener(function (port) {
  if (port.name !== "devtools") return;

  ports[port.portId_] = port;

  // Remove port when destroyed (eg when devtools instance is closed)
  port.onDisconnect.addListener(function (port) {
    delete ports[port.portId_];
    return true;
  });

  port.onMessage.addListener(function (request) {
    console.log("tidy_background-onMessage (devtools): " + JSON.stringify(request));

    if (typeof request.from == 'string' && request.from == 'tidy_devtools.open') {
      // This is the "tidy_devtools open" message
      // Or a refresh (change of htmlOrigin, url) from tidy_view_source
      console.log("tidy_background: request.tabId: " + request.tabId);
      if (request.tabId) {
        /// There is not tabId for internal pages.
        chrome.tabs.get(request.tabId, function (tab) {
          var url = tab.url;
          console.log("devtools_started: " + url);
          notifyDevtoolsUrl(request.tabId, url);
        });
        // Store for usage other messages 
        g_bIsFirefox = request.bIsFirefox;
        if (request.bIsFirefox) {
          // In Firefox, chrome.webNavigation.getAllFrames does not exist in Devtools. 
          // 1) get a list of frames and store it in the global variable: tidyFrames
          firefox_get_frames_then_call_dom2string( request.tabId );
        }
      }
    }
    return true;
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("tidy_background-onMessage (other): " + JSON.stringify(request));
  if (typeof request.from == 'string' && request.from == 'tidy_dom2string') {
    // Firefox WA - get the HTML from the content script and send it to devtools
    notifyDevtoolsHtml(iLastTabId, request.source);
  } else if (typeof request.from == 'string' && request.from == 'tidy_webextension.open_cleanup') {
    window.open("tidy_cleanup.html", "_blank");
  } else if (typeof request.from == 'string' && request.from == 'tidy_view_source.refresh') {
    call_dom2string(request.tabId, request.frameId);
  } else if (typeof request.from == 'string' && request.from == 'tidy_content.new_page') {
    // New page detected in tidy_content.js
    if (g_bIsFirefox) {
      // Disable the icon when a new page is seen and that devtools is just closed.
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function (tabs) {
        console.log("background: " + JSON.stringify(tabs));
        if (tabs.length > 0) {
          var tabId = tabs[0].id;
          chrome.action.setIcon({
            path: "skin/disabled.png",
            tabId: tabs[0].id
          });
          chrome.action.setBadgeText({
            tabId: tabs[0].id,
            text: ""
          });
          chrome.action.setTitle({
            tabId: tabs[0].id,
            title: "Html Validator"
          });
          firefox_get_frames_then_call_dom2string(tabId);
        }
      });
    } else {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function (tabs) {
        // XXX broken since the usage of chrome.runtime
        console.log("background: " + JSON.stringify(tabs));
        var url = null;
        var tabId = null;
        if (tabs.length > 0) {
          url = tabs[0].url;
          tabId = tabs[0].id;
        }
        notifyDevtoolsUrl(tabId, url);
      });
    }
  }
  if (typeof request.path == 'string') {
    // Change of icon - badge - tooltip
    chrome.action.setIcon({
      path: request.path,
      tabId: request.tabId
    });
    chrome.action.setBadgeText({
      tabId: request.tabId,
      text: request.badge.toString()
    });
    chrome.action.setTitle({
      tabId: request.tabId,
      title: request.title.toString()
    });
  }
  return true;
});

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
