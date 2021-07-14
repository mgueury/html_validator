var _window, callbackQueue = [];

function openCleanup() {
  // port.postMessage({
  console.log("openCleanup");
  chrome.runtime.sendMessage({
    from: "tidy_webextension.open_cleanup",
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

// html - html source
// frames - frameList
function tidyWxUpdateHtml(html, frames) {
  console.log("tidy: <tidyWxUpdateHtml>");
  if (typeof oTidyViewSource != 'undefined') {
    console.log("tidy: <tidyWxUpdateHtml>oTidyViewSource exists");
    tidy_pref.setHtml(html);
    tidy_pref.setFrames(frames);
    oTidyViewSource.validateHtmlFromNode()
  } else {
    if (_window) {
      console.log("tidy: <tidyWxUpdateHtml>_window exists");
      _window.tidy_pref.setHtml(html);
      _window.tidy_pref.setFrames(frames);      
      if (_window.oTidyViewSource) {
        _window.oTidyViewSource.validateHtmlFromNode();
      }
    } else {
      // For Firefox 57, when the devtools start
      console.log("tidy: <tidyWxUpdateHtml>oTidyViewSource does not exist. Add to queue");
      callbackQueue.push(function() {
        tidyWxUpdateHtml(html,frames);
      });
    }
  }
  console.log("tidy: </tidyWxUpdateHtml>");
}

// Update the list of Document/Frame referred by the page 
function tidyWxChangeDocList(docList, url) {
  console.log("tidy: <tidyWxChangeDocList>");
  if (_window) {
    // It is possible that the window is there but that the pref are not loaded yet.
    _window.tidyUtilUpdateDocList(docList, url);
  } else {
    callbackQueue.push(function() {
      tidyWxChangeDocList(docList, url);
    });
  }
  console.log("tidy: </tidyWxChangeDocList>");
}


function tidyWxChangeHtmlAndDoclist(url, bChangeFrame, htmlOrigin) {
  // url: url of the page
  // bChangeFrame
  // htmlOrigin: null or dom2string to force Dom2string HTML on Chrome

  console.log("tidy: <tidyWxChangeHtmlAndDoclist>" + url);

  // If the url is not specified. Use the URL of the tab.
  if (typeof url == 'undefined') {
    //  url = result.entries[0].request.url;
  }
  var docList = [];
  // Could not get the HTML of the page with the network.getHAR. Let's try inspectedWindow.getResources.
  console.log("before inspectedWindow.getResources");
  if (htmlOrigin!="dom2string" && chrome.devtools.inspectedWindow.getResources) {
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
                var html = content;
                tidyWxUpdateHtml(html, null);
              });
              bFound = true;
            }
          }
          docList.push(resource.url);
        }
        i++;
      }
      if (!bChangeFrame) {
        tidyWxChangeDocList(docList, url);
      }
      if (!bFound) {
        // Found nothing neither with inspectedWindow.getResources
        // https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Extending_the_developer_tools
        var html = null; 
        updateIcon('skin/question.png');
        tidyWxUpdateHtml(html, null);
      }
    });
  }
  else {
    // In Firefox 57, the chrome.devtools.inspectedWindow.getResources is not yet available
    // Let's be stupid and get the HTML from the DOM ?
    // var body = "<html>Firefox 57</html>";
    // tidyWxUpdateHtml(null);
    /*
    chrome.webNavigation.getAllFrames( { "tabId": chrome.devtools.inspectedWindow.tabId }, 
      function(details) {
        console.log( "getAllFrames:" + details.length );
        for (const detail of details) {
          doclist.push(detail.url);;
        }
        tidyWxChangeDocList(doclist, url);
      }
    );
    */
  } 
  console.log("tidy: </tidyWxChangeHtmlAndDoclist>");
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
