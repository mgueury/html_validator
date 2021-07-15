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
  chrome.tabs.executeScript(tabId, {
    frameId: frameId,
    file: "tidy_dom2string.js"
  }, function () {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      console.log('Tidy_background: error injecting script : \n' + chrome.runtime.lastError.message);
    }
  });
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
          chrome.browserAction.setIcon({
            path: "skin/disabled.png",
            tabId: tabs[0].id
          });
          chrome.browserAction.setBadgeText({
            tabId: tabs[0].id,
            text: ""
          });
          chrome.browserAction.setTitle({
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
    chrome.browserAction.setIcon({
      path: request.path,
      tabId: request.tabId
    });
    chrome.browserAction.setBadgeText({
      tabId: request.tabId,
      text: request.badge.toString()
    });
    chrome.browserAction.setTitle({
      tabId: request.tabId,
      title: request.title.toString()
    });
  }
});
