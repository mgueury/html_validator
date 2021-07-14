// This detects when a new page is loaded
chrome.runtime.sendMessage({
  from: "tidy_content.new_page"
}, function(response) {});
