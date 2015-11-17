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

