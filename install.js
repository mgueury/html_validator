// constants which may be translated

const X_MSG =      "Install Html Validator";
const X_LOCALE1 =  "locale/en-US/tidy/";
const X_INSTMSG1 = "HTML Validator, version"
const X_INSTMSG2 = "is now installed.\n\nPlease restart mozilla."
const X_ERR202_1 = "You need to have write permissions to the chrome directory and subfolders:"
const X_ERR202_2 = "and to the components directory:"
const X_ERR202_3 = "On most Unix, it means, start Mozilla with root before to install the extension."
const X_ERR210_1 = "Installation cancelled by user"
const X_ERR_MSG1 = "An unknown error occured.  Error code: "
const X_ERR_MSG2 = "Look at the following URL for a description of the error code:"
const X_ERR_MSG3 = "http://developer.netscape.com/docs/manuals/xpinstall/err.html"

// constants which should not be translated
const X_NAME =     "/tidy";
const X_NAME_COM = "/tidy_com";
const X_VER  =     "0.9.5.9";
const X_JAR_FILE = "tidy.jar";
const X_COM_FILE = "nstidy.dll";
const X_CONTENT =  "content/";
const X_SKIN =     "skin/";

var err = initInstall(X_MSG, X_NAME, X_VER);
logComment("initInstall: " + err);
logComment("Installation started...");
resetError();

var chromeFolder = getFolder("Profile", "chrome");
var componentDir = getFolder("Components");
var iconFolder = getFolder(getFolder("Profile", "icons"), "default");
var programDir = getFolder("Program");

addFile(X_NAME, "chrome/" + X_JAR_FILE, chromeFolder, "");
err = getLastError();


if (err == SUCCESS || err == REBOOT_NEEDED) 
{
  addFile(X_NAME_COM, "components/.autoreg", programDir, "");
  addFile(X_NAME_COM, "components/nstidy.dll", componentDir, "");
  addFile(X_NAME_COM, "components/nstidy.xpt", componentDir, "");
  addDirectory(X_NAME_COM, "sgml-lib", programDir, "sgml-lib");  
}

if (err == SUCCESS || err == REBOOT_NEEDED) 
{
  registerChrome(PROFILE_CHROME | CONTENT, getFolder(chromeFolder, X_JAR_FILE), X_CONTENT);
  registerChrome(PROFILE_CHROME | SKIN, getFolder(chromeFolder, X_JAR_FILE), X_SKIN);
  registerChrome(PROFILE_CHROME | LOCALE, getFolder(chromeFolder, X_JAR_FILE), X_LOCALE1);
}
err = getLastError();

if (err == SUCCESS || err == REBOOT_NEEDED) 
{
  performInstall();
  err = getLastError();
  if (err == SUCCESS || err == REBOOT_NEEDED) 
  {
    alert(X_INSTMSG1+" "+X_VER+" "+X_INSTMSG2);
  } 
  else 
  {
    // Nothing to do, Mozilla will display an error message himself
  }
} 
else 
{
  cancelInstall();
  if (err == -202) 
  {
    alert(X_ERR202_1 + "\n" + chromeFolder + " " + X_ERR202_2 + "\n" + componentDir + "\n" + X_ERR202_3);
  } 
  else if (err == -210) 
  {
    alert(X_ERR210_1);
  }
  else 
  {
    alert(X_ERR_MSG1 + " " + err + "\n " + X_ERR_MSG2 + "\n" + X_ERR_MSG3);
  }
}

