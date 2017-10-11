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

function updateHtml(html) {
  console.log("tidy: <updateHtml>");
  if (typeof oTidyViewSource != 'undefined') {
    oTidyUtil.pref.setHtml(html);
    oTidyViewSource.validateHtmlFromNode()
  } else {
    if (_window) {
      console.log("tidy: <updateHtml>2");
      _window.oTidyUtil.pref.setHtml(html);
      _window.oTidyViewSource.validateHtmlFromNode();
    } else {
      console.log("tidy: <updateHtml>3");
      callbackQueue.push(function() {
        updateHtml(html);
      });
    }
  }
  console.log("tidy: </updateHtml>");
}

function updateDocList(docList) {
  console.log("tidy: <updateDocList>");
  if (_window) {
    console.log("tidy: <updateDocList>2");
    _window.oTidyViewSource.updateDocList(docList);
  } else {
    console.log("tidy: <updateDocList>3");
    callbackQueue.push(function() {
      updateDocList(docList);
    });
  }
  console.log("tidy: </updateDocList>");
}

function updateHtmlReport(url, bChangeFrame) {
  console.log("tidy: <updateHtmlReport>" + url);

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
                updateHtml(body);
              });
              bFound = true;
            }
          }
          docList.push(resource.url);
        }
        i++;
      }
      if (!bChangeFrame) {
        updateDocList(docList);
      }
      if (!bFound) {
        // Found nothing neither with inspectedWindow.getResources
        // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Extending_the_developer_tools
        var body = 'Please reload the page.';
        const scriptToAttach = "document.body.innerHTML = 'Hi from the devtools';";
        window.addEventListener("click", () => {
          browser.runtime.sendMessage({
            from: "tidy_webextension",
            tabId: chrome.devtools.inspectedWindow.tabId,
            script: scriptToAttach
          });
        });
        updateIcon('skin/question.png');
        updateHtml(body);
      }
    });
  } else {
    // In Firefox 57, the chrome.devtools.inspectedWindow.getResources is not yet available
    // Let's be stupid and get the HTML from the DOM ?
    // var body = "<html>Firefox 57</html>";
    // updateHtml(null);
    updateDocList(docList);
  }
  console.log("tidy: </updateHtmlReport>");
}

function updateWindow(panelWindow) {
  _window = panelWindow;

  // Release queued data
  var callback;
  while (callback = callbackQueue.shift()) {
    callback();
  }
}
