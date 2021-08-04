HTML Validator Extension Source code
Author: Marc Gueury

See also : https://www.gueury.com/mozilla/architecture.html

Content
-------
- tidy_build_js.tgz contains the source code the HTML Tidy 5 used to create tidy_emscripten.js
  See https://www.html-tidy.org/
- The rest of the code is the code of the WebExtension.
- The Monaco Editor files are from the version 0.24. 
  See https://github.com/microsoft/monaco-editor/archive/refs/tags/v0.24.0.zip

Comment about permissions used in the manifest
----------------------------------------------
- "<all_urls>"
  - Needed To be able to validate any page on internet
- API: "clipboardWrite"
  - Needed To be able to copy the HTML of the cleanup page to the clipboard
- API: "storage"
  - To store temporary global variables passed by the background page to the devtools page.
- API: webnavigation: 
  - API used : chrome.webNavigation.getAllFrames
  - Needed to get the list of Frames to be able to select them:
  - Needed to find the frameId of a URL and get the HTML of the page from the DOM (HTML after Javascript)
- Content script
  - Needed to detect when the browser navigate to another page to refresh the HTML validator
  - File : tidy_content.js (about 10 lines big)

Old permissions
---------------
- API: "tabs",
  - Not needed anymore. Seems to have been included in <all_urls>


