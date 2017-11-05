//*************************************************************************
// HTML Validator
//
//  File: tidyPopup.js
//  Description:
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

chrome.runtime.getPlatformInfo(function(info) {
    // Display host OS in the console
    console.log(info.os);
    if( info.os=='mac' )
    {
      var e = document.getElementById('command');
      e.innerHTML = "⌥⌘I"
    }
});
