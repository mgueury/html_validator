//*************************************************************************
// HTML Validator
//
//  File: tidy_devtools.js
//  Description: WebExtension devtools panel
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

var oTidyDevtools = function (extensionPanel) {
  var _window, callbackQueue = [];
  // Connect to the background page
  var port = chrome.runtime.connect({
    name: "devtools"
  });

  extensionPanel.onShown.addListener(function tmp(panelWindow) {
    console.log("tidy: <extensionPanel.onShown>");
    extensionPanel.onShown.removeListener(tmp); // Run once only
    tidyWxUpdateWindow(panelWindow);
    console.log("tidy: </extensionPanel.onShown>");
  });

  // For page refresh
  port.onMessage.addListener(
    function (request) {
      console.log("<tidy_devtools> request = " + JSON.stringify(request));
      updateIcon('skin/disabled.png');
      if (request.tabId == null || request.tabId == chrome.devtools.inspectedWindow.tabId) {
        // The message sent by the background page contains the name of the current URL
        if (typeof request.html == "string") {
          // Firefox 57 WA or htmlOrigin"="dom2string"
          tidyWxUpdateHtml(request.html, request.frames);
          if (request.frames) {
            console.log("<tidy_devtools> frames");
            tidyWxChangeDocList(null, null);
          }
        } else {
          // Chrome
          tidyWxChangeHtmlAndDoclist(request.url, false, null);
        }
      }
    }
  );

  // Detect Firefox: Check that the getResources is available or not
  var bIsFirefox = typeof chrome.devtools.inspectedWindow.getResources == "undefined";
  // Call the background page to get the url(chrome) or the html(firefox) 
  port.postMessage({
    from: 'tidy_devtools.open',
    bIsFirefox: bIsFirefox,
    tabId: chrome.devtools.inspectedWindow.tabId
  });
};

chrome.devtools.panels.create("HTML validator", "skin/disabled.png", "common/tidy_view_source_horiz.html", oTidyDevtools);