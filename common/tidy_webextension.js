var _window, callbackQueue = [];

function openCleanup() {
  // port.postMessage({
  console.log("openCleanup");
  chrome.runtime.sendMessage({
    from: "tidy_webextension",
    window_open: "tidy_cleanup.html"
  });
}

function updateIcon(newIcon) {
  // port.postMessage({
  console.log("updateIcon: " + newIcon);
  chrome.runtime.sendMessage({
    tabId: chrome.devtools.inspectedWindow.tabId,
    path: newIcon,
    badge: "",
    title: "Html Validator"
  });
}

function tidyWxUpdateHtml(html) {
  console.log("tidy: <tidyWxUpdateHtml>");
  if (typeof oTidyViewSource != 'undefined') {
    console.log("tidy: <tidyWxUpdateHtml>oTidyViewSource exists");
    tidy_pref.setHtml(html);
    oTidyViewSource.validateHtmlFromNode()
  } else {
    if (_window) {
      console.log("tidy: <tidyWxUpdateHtml>_window exists");
      _window.tidy_pref.setHtml(html);
      if (_window.oTidyViewSource) {
        _window.oTidyViewSource.validateHtmlFromNode();
      }
    } else {
      console.log("tidy: <tidyWxUpdateHtml>oTidyViewSource does not exist. Add to queue");
      // For Firefox 57
      lastHtml = html;
      //
      callbackQueue.push(function() {
        tidyWxUpdateHtml(html);
      });
    }
  }
  console.log("tidy: </tidyWxUpdateHtml>");
}

function tidyWxUpdateDocList(docList, url) {
  console.log("tidy: <tidyWxUpdateDocList>");
  if (_window) {
    console.log("tidy: <tidyWxUpdateDocList>2");
    // It is possible that the window is there but that the pref are not loaded yet.
    _window.tidyUtilUpdateDocList(docList, url);
  } else {
    console.log("tidy: <tidyWxUpdateDocList>3");
    callbackQueue.push(function() {
      tidyWxUpdateDocList(docList, url);
    });
  }
  console.log("tidy: </tidyWxUpdateDocList>");
}

function tidyWxUpdateHtmlReport(url, bChangeFrame) {
  console.log("tidy: <tidyWxUpdateHtmlReport>" + url);

  // If the url is not specified. Use the URL of the tab.
  if (typeof url == 'undefined') {
    //  url = result.entries[0].request.url;
  }
  var docList = [];
  // Could not get the HTML of the page with the network.getHAR. Let's try inspectedWindow.getResources.
  console.log("before inspectedWindow.getResources");
  if (chrome.devtools.inspectedWindow.getResources) {
    chrome.devtools.inspectedWindow.getResources(function(resources) {
      console.log("inside inspectedWindow.getResources: " + resources.length);
      var i = 0;
      var bFound = false;
      while (i < resources.length) {
        var resource = resources[i];
        console.log("inside inspectedWindow.getResources 2:" + resource);
        if (resource.type == "document") {
          console.log("inside inspectedWindow.getResources 3: document");
          if (!bFound) {
            if (typeof url == 'undefined' || resource.url == url) {
              console.log("inside inspectedWindow.getResources 3: found");
              resource.getContent(function(content, encoding) {
                var body = content;
                tidyWxUpdateHtml(body);
              });
              bFound = true;
            }
          }
          docList.push(resource.url);
        }
        i++;
      }
      if (!bChangeFrame) {
        tidyWxUpdateDocList(docList, url);
      }
      if (!bFound) {
        // Found nothing neither with inspectedWindow.getResources
        // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Extending_the_developer_tools
        var body = null; 
        updateIcon('skin/question.png');
        tidyWxUpdateHtml(body);
      }
    });
  } else {
    // In Firefox 57, the chrome.devtools.inspectedWindow.getResources is not yet available
    // Let's be stupid and get the HTML from the DOM ?
    // var body = "<html>Firefox 57</html>";
    // tidyWxUpdateHtml(null);
    tidyWxUpdateDocList(docList);
  }
  console.log("tidy: </tidyWxUpdateHtmlReport>");
}

function tidyWxUpdateWindow(panelWindow) {
  _window = panelWindow;
  if (_window.tidy_pref) {
    tidyWxCallbackQueue();
  }
}

function tidyWxCallbackQueue() {
  // Release queued data
  console.log("tidy: <tidyWxCallbackQueue>callbackQueue size = " + callbackQueue.length);
  var callback = callbackQueue.shift();
  while (callback) {
    console.log("tidy: <tidyWxCallbackQueue>callback");
    callback();
    callback = callbackQueue.shift()
  }
  console.log("tidy: </tidyWxCallbackQueue>");
}
