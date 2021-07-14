Needed for review:

Comment about permissions:
--------------------------
- "<all_urls>"
  - Needed To be able to validate any page on internet
- API: "clipboardWrite"
  - Needed To be able to copy the HTML of the cleanup page to the clipboard
- API: "storage"
  - I do not use storage API. But when not there the extension does not work
    and seems to have issue to find some global variables.
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



