//*************************************************************************
// HTML Validator
//
//  File: tidyInstall.js
//  Description: javascript for special install actions
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

function tidyInstallIsInFirefox() 
{
  return (navigator.userAgent.search(/Firefox/gi) != -1);
}

function tidyInstallIsInThunderbird() 
{
  return (navigator.userAgent.search(/Thunderbird/gi) != -1);
}

function tidyInstallIsInFlock()
{
  return (navigator.userAgent.search(/Flock/gi) != -1);
}

function tidyInstallIsInMozilla()
{
  return (!tidyInstallIsInFirefox() && !tidyInstallIsInThunderbird() && !tidyInstallIsInFlock());
}

function tidyIsNewInstall() 
{
  if (tidyInstallIsInMozilla()) 
  {
    // We are in Mozilla, this can be only done by install.js
    return false;
  }
 
  //
  // Check if the new_install.txt file is there. If so, it is a new install
  //
  var sourceFile = tidyUtilGetXPIFile("new_install.txt");
  if( sourceFile.exists() ) 
  {
    sourceFile.remove(true);
    return true;
  }
  return false;
}

