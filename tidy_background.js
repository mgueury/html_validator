//http://stackoverflow.com/questions/11661613/chrome-devpanel-extension-communicating-with-background-page

// Function to send a message to all devtool.html views:
var ports = {},

  notifyDevtools = function(aTabId, aUrl) {
    Object.keys(ports).forEach(function(portId_) {
      ports[portId_].postMessage({
        tabId: aTabId,
        url: aUrl
      });
    });
  },
  notifyDevtoolsFF57 = function(aTabId, aHtml) {
    Object.keys(ports).forEach(function(portId_) {
      ports[portId_].postMessage({
        tabId: aTabId,
        html: aHtml
      });
    });
  }

var bFF57 = false;
var iLastTabId = null;

function call_execute_script(tabId) {
  // FF57 WA - execute a content script to get the HTML
  iLastTabId = tabId;
  chrome.tabs.executeScript(tabId, {
    file: "tidy_execute_script.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      console.log('Tidy_background: error injecting script : \n' + chrome.runtime.lastError.message);
    }
  });
}

chrome.runtime.onConnect.addListener(function(port) {
  // chrome.runtime.onMessage.addListener(function(port) {
  if (port.name !== "devtools") return;
  ports[port.portId_] = port;
  // Remove port when destroyed (eg when devtools instance is closed)
  port.onDisconnect.addListener(function(port) {
    delete ports[port.portId_];
  });
  port.onMessage.addListener(function(request) {
    // Whatever you wish
    console.log("tidy_background-port: " + JSON.stringify(request));

    if (typeof request.from == 'string' && request.from == 'tidy_devtools') {
      // This is the "devtools_started" message
      // XXXX
      bFF57 = request.ff57;
      // bFF57 = true;
      if (request.tabId) {
        /// There is not tabId for internal pages.
        chrome.tabs.get(request.tabId, function(tab) {
          var url = tab.url;
          console.log("devtools_started: " + url);
          notifyDevtools(request.tabId, url);
        });
        if (bFF57) {
          // When devtools open, call the execute_script to get the HTML source
          call_execute_script(request.tabId);
        }
      }
    }
  });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("tidy_background-onMessage: " + JSON.stringify(request));
  if (typeof request.from == 'string' && request.from == 'tidy_execute_script') {
    // FF57 WA - get the HTML from the content script and send it to devtools
    notifyDevtoolsFF57(iLastTabId, request.source);
  } else if (typeof request.from == 'string' && request.from == 'tidy_webextension') {
    window.open("tidy_cleanup.html", "_blank");
  } else if (typeof request.from == 'string' && request.from == 'tidy_content') {
    if (bFF57) {
      // Disable the icon when a new page is seen and that devtools is just closed.
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function(tabs) {
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
          call_execute_script(tabId);
        }
      });
    } else {
      chrome.tabs.query({
        currentWindow: true,
        active: true
      }, function(tabs) {
        // XXX broken since the usage of chrome.runtime
        console.log("background: " + JSON.stringify(tabs));
        var url = null;
        var tabId = null;
        if (tabs.length > 0) {
          url = tabs[0].url;
          tabId = tabs[0].id;
        }
        notifyDevtools(tabId, url);
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
