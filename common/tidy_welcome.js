//*************************************************************************
// HTML Validator
//
//  File: tidyWelcome.js
//  Description: javascript for the dialog box of the options window
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

//-------------------------------------------------------------

var otidyWelcome;

function onLoadTidyWelcome() {
  onLoadTidyUtil(onLoadTidyWelcome2);
}

function onLoadTidyWelcome2() {
  otidyWelcome = new tidyWelcome();
  // otidyWelcome.start();
}

function onUnloadtidyWelcome() {
  onUnloadTidyUtil();
  delete otidyWelcome;
  otidyWelcome = null;
}

function tidyWelcomeChoose(value) {
  oTidyUtil.setCharPref('algorithm', value);
  if (parent) {
    if (parent.oTidyOptions) {
      parent.oTidyOptions.onCloseModal('tidy.welcome.modal');
      return;
    }
  }
  window.close()
}

//-------------------------------------------------------------
// otidyWelcome
//-------------------------------------------------------------

function tidyWelcome() {}

tidyWelcome.prototype = {}

window.onload = function(e)
{
   onLoadTidyWelcome();

   // Initialise the javascript link (else there is an error refuse to execute inline handler because it violates the security policies)
   tidyUtilSetOnclick( "tidy_welcome_tidy", function(){ tidyWelcomeChoose('tidy') });
   tidyUtilSetOnclick( "tidy_welcome_sp", function(){ tidyWelcomeChoose('sp') });
   tidyUtilSetOnclick( "tidy_welcome_serial", function(){ tidyWelcomeChoose('serial') });
}
