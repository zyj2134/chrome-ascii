function open() {  
  chrome.tabs.create({"url":"/Ascii.html"});  
}  
chrome.browserAction.onClicked.addListener(open);