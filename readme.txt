Description
-----------
HTML Validator is a Mozilla extension that adds HTML validation inside Firefox and Mozilla.
The number of errors of a HTML page is seen on the form of  an icon in the status bar when browsing.
The details of the errors are seen when looking the HTML source of the page.

The extension is based on Tidy. Tidy, was originally developed by the Web Consortium W3C. And now extended and improved by a lot of persons. Tidy is embedded inside Mozilla/Firefox and makes the validation locally on your machine, without sending  HTML to a third party server.

Tidy is a helpful program that tries to help people to correct their HTML errors. It finds HTML errors and classifies them in 3 categories:

* errors: HTML errors that Tidy cannot fix or understand.
* warnings: HTML errors that Tidy can fix automatically
* (optional) accessibility warnings: HTML warnings for the 3 priority levels defined in W3c WAI

Linux version (also available on Windows and MacOsX)

Added in
--------
mozilla/configure
mozilla/configure.in 

Old:
MOZ_EXTENSIONS_DEFAULT=" cookie ... negotiateauth"

New:
MOZ_EXTENSIONS_DEFAULT=" tidy cookie ... negotiateauth"


mozilla/allmakefile.sh

[...]
        sql ) MAKEFILES_extensions="$MAKEFILES_extensions
            $MAKEFILES_sql"
            ;;
        tidy ) MAKEFILES_extensions="$MAKEFILES_extensions
            extensions/tidy/Makefile
            extensions/tidy/src/Makefile
            extensions/tidy/test/Makefile
            " ;;
    esac
done         
[...]

To change to debug
------------------

set MOZ_DEBUG=1
touch the file .mozconfig.mk
make -f client.mk clean
make -f client.mk build


Compiling Firefox 0.9.2/0.9.3
-----------------------------

Enabling venkman in browser/config/mozconfig

ac_add_options --enable-extensions=cookie,xml-rpc,xmlextras,pref,transformiix,universalchardet,typeaheadfind,webservices,inspector,gnomevfs,negotiateauth,venkman
ac_add_options --enable-jsd

         
Done
-----
- Learn how to write an overlay
- Write a menu command with a shortcut
  -> alert only
- Look the view source of a document:

C:\my_prog\mozilla\src\original\mozilla\xpfe\browser\resources\content\viewsource.xul
C:\my_prog\mozilla\src\original\mozilla\xpfe\browser\resources\content\viewsource.js

      <menuitem id="context-viewsource"
                label="&viewPageSourceCmd.label;"
                accesskey="&viewPageSourceCmd.accesskey;"
                oncommand="BrowserViewSourceOfDocument(_content.document);"/>

-----------------------------------------------------------------------------

function BrowserViewSourceOfDocument(aDocument)
{
  var docCharset;
  var pageCookie;
  var webNav;

  // Get the document charset
  docCharset = "charset=" + aDocument.characterSet;

  // Get the nsIWebNavigation associated with the document
  try {
      var win;
      var ifRequestor;

      // Get the DOMWindow for the requested document.  If the DOMWindow
      // cannot be found, then just use the _content window...
      //
      // XXX:  This is a bit of a hack...
      win = aDocument.defaultView;
      if (win == window) {
        win = _content;
      }
      ifRequestor = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor);

      webNav = ifRequestor.getInterface(nsIWebNavigation);
  } catch(err) {
      // If nsIWebNavigation cannot be found, just get the one for the whole
      // window...
      webNav = getWebNavigation();
  }
  //
  // Get the 'PageDescriptor' for the current document. This allows the
  // view-source to access the cached copy of the content rather than
  // refetching it from the network...
  //
  try{
    var PageLoader = webNav.QueryInterface(Components.interfaces.nsIWebPageDescriptor);

    pageCookie = PageLoader.currentDescriptor;
  } catch(err) {
    // If no page descriptor is available, just use the view-source URL...
  }

  BrowserViewSourceOfURL(webNav.currentURI.spec, docCharset, pageCookie);
}

function BrowserViewSourceOfURL(url, charset, pageCookie)
{
  // try to open a view-source window while inheriting the charset (if any)
  openDialog("chrome://global/content/viewSource.xul",
             "_blank",
             "scrollbars,resizable,chrome,dialog=no",
             url, charset, pageCookie);
}

---------------------------------------------------------------------------
-- viewsource.js
---------------------------------------------------------------------------

function goToLine(line)
{
[...]

---------------------------------------------------------------------------
-- PageLoader
---------------------------------------------------------------------------

C:\my_prog\mozilla\src\firefox\mozilla\docshell\base\nsDocShell.cpp

//*****************************************************************************
// nsDocShell::nsIWebPageDescriptor
//*****************************************************************************   
NS_IMETHODIMP
nsDocShell::LoadPage(nsISupports *aPageDescriptor, PRUint32 aDisplayType)
{

      
-------------------------------------------------------------------------------

N'ai pas reussi a faire marcher ceci. L'overlay etait toujours en dessous ?
Et pas affiché convenablement ??
      
  <RDF:Seq about="urn:mozilla:overlays">
    <RDF:li resource="chrome://communicator/content/tasksOverlay.xul"/>
    <RDF:li resource="chrome://navigator/content/viewSource.xul"/>
  </RDF:Seq>
  <RDF:Seq about="chrome://communicator/content/tasksOverlay.xul">
    <RDF:li>chrome://tidy/content/ToolsMenu.xul</RDF:li>
  </RDF:Seq>
  <RDF:Seq about="chrome://navigator/content/viewSource.xul">
    <RDF:li>chrome://tidy/content/viewSourceAndValidate.xul</RDF:li>
  </RDF:Seq>
  
--------------------------------------------------------------------------------

About ampersand:

Unescaped ampersands are illegal most of the time in HTML and XHTML and
user agents treat them differently. Tidy tries a best guess on what you
really wanted to write and escapes the ampersands accordingly. For
example,

  ... href="http://www.example.org/script?x=1&y=2"

will become

  ... href="http://www.example.org/script?x=1&amp;y=2"

Tidy does not change your URI, it changes the (X)HTML representation of
it. While your script might stop working if you pass the URI including
the &amp; directly, the link will still work, since user agents will
unescape the &amp; and request the right thing. Tidy doesn't break
anything here, it corrects your possible error and increases stability
of your document. This is not a bug. However, *if you /really/ want to
change this behaivour* you may use the `--QuoteAmpersand no`
configuration option to prevent proper escaping of ampersands, but don't
do this for reasons of validity and [potential problems this might
cause] (http://ppewww.ph.gla.ac.uk/~flavell/www/formgetbyurl.html).
Please also take a look at [Appendix B.2.2 of the HTML 4.01
recommendation] (http://www.w3.org/TR/html4/appendix/notes.html#h-B.2.2)
discussing the same issue.


---------------------------------------------------------------------------------

Tidy default values and name

Done
  wrap 68
  show-warnings yes
  indent no
  uppercase-tags no
  uppercase-attributes no
  accessibility-check 0
  output-xml no
  output-xhtml no
  output-html no
  clean no

To do
  drop-proprietary-attributes no
  drop-font-tags no
  drop-empty-paras yes

Will not do
  char-encoding us-ascii
  input-encoding iso-8859-1
  output-encoding us-ascii
  newline CRLF
  alt-text 
  error-file 
  output-file 
  write-back no
  input-xml no
  fix-bad-comments yes
  quote-nbsp yes
  wrap-attributes no
  wrap-script-literals no
  wrap-sections yes
  wrap-asp yes
  wrap-jste yes
  wrap-php yes
  show-errors 6
  join-classes no
  join-styles yes
  indent-spaces 2
  tab-size 8
  
Mistery
  doctype-mode 1
  doctype auto
  repeated-attributes keep-last
  slide-style 
  markup yes
  quiet no
  hide-endtags no
  add-xml-decl no
  bare no
  logical-emphasis no
  break-before-br no
  split no
  numeric-entities no
  quote-marks no
  quote-ampersand yes
  fix-backslash yes
  indent-attributes no
  assume-xml-procins no
  add-xml-space no
  enclose-text no
  enclose-block-text no
  keep-time no
  word-2000 no
  tidy-mark yes
  gnu-emacs no
  gnu-emacs-file 
  literal-attributes no
  show-body-only no
  fix-uri yes
  lower-literals yes
  hide-comments no
  indent-cdata no
  force-output no
  ascii-chars yes
  escape-cdata no
  language 
  ncr yes
  output-bom auto
  replace-color no
  css-prefix 
  new-inline-tags 
  new-blocklevel-tags 
  new-empty-tags 
  new-pre-tags 
  vertical-space no
  punctuation-wrap no
  merge-divs yes

--------------------------------------------------------------------------------

Real Time Validation:

From WebDeveloper:
------------------

1. Interesting due to the scriptableStream !!

// Loads new CSS
function webdeveloper_loadCSS()
{
    const filePicker   = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
    const stringBundle = document.getElementById("webdeveloper-string-bundle");

    filePicker.appendFilter(stringBundle.getString("webdeveloper_styleSheetDescription"), "*.css");
    filePicker.init(window, stringBundle.getString("webdeveloper_editCSSLoadStyleSheetTitle"), filePicker.modeOpen);

    // If the user selected a style sheet
    if(filePicker.show() == filePicker.returnOK)
    {
        const inputStream      = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
        const scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);

        inputStream.init(filePicker.file, 0x01, 0444, null);
        scriptableStream.init(inputStream);

        webdeveloper_getSelectedPanel().firstChild.value = scriptableStream.read(scriptableStream.available());

        scriptableStream.close();
        inputStream.close();
    }
}


2. XMLHttpRequest -> it works -> problem XMLHttpRequest set up explicitely a loadflags - skip_cache

function webdeveloper_validateLocalHTML()
{
    const oldURL  = window.content.document.URL;
    const request = new XMLHttpRequest();

    var formElement   = null;
    var generatedPage = null;
    var inputElement  = null;

    generatedPage = webdeveloper_generatePage("about:blank");

    // This must be done to make generated content render
    request.open("GET", oldURL, false);
    request.send("");

    formElement = generatedPage.content.document.createElement("form")
    formElement.setAttribute("method", "post");
    formElement.setAttribute("action", "http://www.htmlhelp.com/cgi-bin/validate.cgi");

    inputElement = generatedPage.content.document.createElement("input");
    inputElement.setAttribute("type", "hidden");
    inputElement.setAttribute("name", "input");
    inputElement.setAttribute("value", "yes");
    formElement.appendChild(inputElement);

    inputElement = generatedPage.content.document.createElement("input");
    inputElement.setAttribute("type", "hidden");
    inputElement.setAttribute("name", "warnings");
    inputElement.setAttribute("value", "yes");
    formElement.appendChild(inputElement);

    inputElement = generatedPage.content.document.createElement("input")
    inputElement.setAttribute("type", "hidden");
    inputElement.setAttribute("name", "area");
    inputElement.setAttribute("value", request.responseText);
    formElement.appendChild(inputElement);

    generatedPage.content.document.body.appendChild(formElement);
    formElement.submit();
}

3. in editcss.js (version 0.8)

    window.top.removeEventListener("load", webdeveloper_contentPageLoad, true);
    window.top.addEventListener("load", webdeveloper_contentPageLoad, true);

4. in editcss.js (version 0.8)

function webdeveloper_contentPageLoad(event)
{
    // If the page is the target
    if(event.target.getAttribute && event.target.getAttribute("id") == "content")
    {
        webdeveloper_resetCSS();
    }
}


From PageInfo.js
----------------

function makeGeneralTab()
{
  var title = (theDocument.title) ? theBundle.getFormattedString("pageTitle", [theDocument.title]) : theBundle.getString("noPageTitle");
  document.getElementById("titletext").value = title;

  var url = theDocument.location;
  document.getElementById("urltext").value = url;

  var mode = ("compatMode" in theDocument && theDocument.compatMode == "BackCompat") ? theBundle.getString("generalQuirksMode") : theBundle.getString("generalStrictMode");
  document.getElementById("modetext").value = mode;

  var referrer = ("referrer" in theDocument && theDocument.referrer) || theBundle.getString("generalNoReferrer");
  document.getElementById('refertext').value = referrer;

  // find out the mime type
  var mimeType = theDocument.contentType || gStrings.unknown;
  document.getElementById("typetext").value = mimeType;
  
  // get the meta tags
  var metaNodes = theDocument.getElementsByTagName("meta");
  var metaTree = document.getElementById("metatree");

  metaTree.treeBoxObject.view = metaView;

  var length = metaNodes.length;
  for (var i = 0; i < length; i++)
    metaView.addRow([metaNodes[i].name || metaNodes[i].httpEquiv, metaNodes[i].content]);

  metaView.rowCountChanged(0, length);
  
  // get the document characterset
  var encoding = theDocument.characterSet;
  document.getElementById("encodingtext").value = encoding;

  // get the date of last modification
  var modifiedText = formatDate(theDocument.lastModified, gStrings.notSet);
  document.getElementById("modifiedtext").value = modifiedText;
  
  // get cache info
  var sourceText = theBundle.getString("generalNotCached");
  var expirationText = theBundle.getString("generalNoExpiration");
  var sizeText = gStrings.unknown;

  var pageSize = 0; 
  var kbSize = 0;
  var expirationTime = 0;

  try
  {
    var cacheEntryDescriptor = httpCacheSession.openCacheEntry(url, Components.interfaces.nsICache.ACCESS_READ, false);
    if (cacheEntryDescriptor)
    { 
      switch(cacheEntryDescriptor.deviceID)
      {
        case "disk":
          sourceText = theBundle.getString("generalDiskCache");
          break;
        case "memory":
          sourceText = theBundle.getString("generalMemoryCache");
          break;
        default:
          sourceText = cacheEntryDescriptor.deviceID;
          break;
      }

      pageSize = cacheEntryDescriptor.dataSize;
      kbSize = pageSize / 1024;
      sizeText = theBundle.getFormattedString("generalSize", [Math.round(kbSize*100)/100, pageSize]);

      expirationText = formatDate(cacheEntryDescriptor.expirationTime*1000, gStrings.notSet);
    }
  }
  catch(ex)
  {
    try
    {
      cacheEntryDescriptor = ftpCacheSession.openCacheEntry(url, Components.interfaces.nsICache.ACCESS_READ, false);
      if (cacheEntryDescriptor)
      {
        switch(cacheEntryDescriptor.deviceID)
        {
          case "disk":
            sourceText = theBundle.getString("generalDiskCache");
            break;
          case "memory":
            sourceText = theBundle.getString("generalMemoryCache");
            break;
          default:
            sourceText = cacheEntryDescriptor.deviceID;
            break;
        }

        pageSize = cacheEntryDescriptor.dataSize;
        kbSize = pageSize / 1024;
        sizeText = theBundle.getFormattedString("generalSize", [Math.round(kbSize*100)/100, pageSize]);

        expirationText = formatDate(cacheEntryDescriptor.expirationTime*1000, gStrings.notSet);
      }
    }
    catch(ex2)
    {
      sourceText = theBundle.getString("generalNotCached");
    }
  }
  document.getElementById("sourcetext").value = sourceText;
  document.getElementById("expirestext").value = expirationText;
  document.getElementById("sizetext").value = sizeText;
}

nsCacheEntryDescriptor
----------------------

nsICacheEntryInfo
[...]
    /**
     * Find out whether or not the cache entry is stream based.
     */
    boolean  isStreamBased();
[...]
    nsIInputStream openInputStream(in unsigned long offset);
[...]


XMLHTTP request
---------------
See http://www-128.ibm.com/developerworks/web/library/wa-ie2mozgd/


Synchronous request: 

  var myXMLHTTPRequest = new XMLHttpRequest(); 
  myXMLHTTPRequest.open("GET", "data.xml", false); 
  myXMLHTTPRequest.send(null); 
  var myXMLDocument = myXMLHTTPRequest.responseXML; 

Asynchronous request: 

  var myXMLHTTPRequest; 

  function xmlLoaded() 
  { 
    var myXMLDocument = myXMLHTTPRequest.responseXML; 
  } 

  function loadXML()
  { 
    myXMLHTTPRequest = new XMLHttpRequest();
    myXMLHTTPRequest.open("GET", "data.xml", true);
    myXMLHTTPRequest.onload = xmlLoaded; 
    myXMLHTTPRequest.send(null); 
  } 

---------------------------------------------------------------------------------

Comparison addLineNumber
------------------------
V1:  adds lines inside the HTML SOURCE
V2:  - adds lines with a table with 2 cells, left with an iframe
     - right with the line number generated on the fly
V3:  - adds lines with a table with 2 cells, left a table cell
     - right the line numbers generated on the fly
V4:  - adds lines with a pre styled with CSS at the end of the HTML
     - right the line numbers generated on the fly
V5:  - TODO
     - Write in the statusbar line the line and col number.
V6:  - TODO
     - add a browser next to the one with the source
     - generate line numbers there and sync the scrolling
     

                            V1           V2               V3               V4
                            --           --               --               --
Works for all tested files  OK           No               OK               OK                            
Issue after 1024 lines      OK           BLOCKING         OK               OK
Speed                       Slow         Fast             Fast             Fast
Break something:            Yes          Yes              Yes              Yes
                            - Select all - GoToLine       - GoToLine       None  
                            not fixable  - Print Preview  - Print Preview  
                                         - Select all     - Select all     
                                         - Wrap long line - Wrap long line 
                                         - Home key       - Home key       

---------------------------------------------------------------------------------
  
  
  
Done
----
  
- Send the content of the HTML page to the windows.

- goToLine( 16 ) does not work for google (report bug ?, fix it ?)
  -> logged bug 253905  

- Option 1 : reconstruire le contenu de l'HTML a partir 
             du FindLocation en concatenant toutes les strings.
- validateHtmlFromNode, there is only one part to the HTML ?

- See the source and the error at the same time.
  -> clicking on one will show the error line on the other.

- Line does not match maybe with empty lines ?
  - http://fr.rendez-vous.be/scripts/friends/indexfr.cfm
  
- afficher le resultat de validation HTML a l'ouverture  

- Integration avec le vrai ViewSource
  - viewSource.xul
  - comprendre pourquoi la status bar n'est pas affichée. (marche avec le vrai view source!)

- Colorize errors in red.

- Make the syntax verification only if the mime/type is text/html
  (View source does this automatically)  

- Make QA test for AnalyzeLine

- Layout
-----------------------------------------------------------------
Html
....
-----------------------------------------------------------------
| Errors and warnings   |   Help about this warning/error
|                       |  
|                       |----------------------------------------
|                       |  Options  Propose a corrected HTML page
-----------------------------------------------------------------
Status bar
-----------------------------------------------------------------

- Rajouter la possibilite de faire un cleanup du fichier.
  -> Ajouter les fonctions pour le faire

- Validate.xul -> validate.xul.
  use another convention for name
  - tidyValidate.xul
  - tidyOptions.xul
  - tidyCleanup.xul

- Add a tidy page in www.gueury.com

- send mail to i8n of netscape for utf8 strings.
  Got an answer :) It is working !!
 
- verification de UCPA.FR donne un ASSERT de convertion.
  This is due the Unicode character Bullet U+2022 (= 0x2022)
  The problem appears in xpcconvert.cpp
  
    791       if(nsnull != (chars = JS_GetStringChars(str)))
              {
                  PRBool legalRange = PR_TRUE;
                  int len = JS_GetStringLength(str);
                  jschar* t;
                  PRInt32 i=0;
                  for(t=chars; (i< len) && legalRange ; i++,t++) {
                    if(ILLEGAL_RANGE(*t))
                        legalRange = PR_FALSE;
                  }
                  NS_ASSERTION(legalRange,"U+0080/U+0100 - U+FFFF data lost");
              }
            
  ILLEGAL_RANGE is defined:           
  #define ILLEGAL_RANGE(c) (0!=((c) & 0xFF80))

  -> 0x2022 & 0xFF80 -> 0x2000
  
  This is because non-ascii character are lost !!
  Question unicode ??
  Solved by using AUTF8String.
  
- 3rd argument for AnalyzeLine ?

- read the XPI doc and see if I can do a XPI with a .dll or .so

- The option page should be a dialog.

- boite de dialogue d'options pour les options de verifications
   (ex: accessibility level)
   - option pour retirer les message d'accessibilité comme alt et summary
      dans les pages HTML (off par default)
   - etudier les options de la command-line
     -> tidy -help-config ? 
     -> S'en inspirer ? voir config.c
  
- small usability improvement
  - Move the output options to the Cleanup the page windows.  
  - add HTML+XHTML choose in cleanup
  - add wrap in cleanup
  - understand why I can not select the text  
  - persist the size of the cleanup window
  - open the link in new window in Firefox  

- have an option in the view source menu to hide the validation
  
- Content-type: The page info shows it. Need to find how they do.
  The view source must know it too.   
  
- try to remove the validation for View Message source (of mail)
  not important for Firefox.
  remove the validation for XML files.
  -> find the mime/type and validate based on it  

- make a page with all the errors
  and link to their explanations 
  
- problem with the column number when a page contains tabs:
  ex  http://webmail.belgacom.net/page.html?partner=belgacomslf&lang=fr

- highlight all lines with errors with a blue-light color:
  Find inspiration by the 
    - browser.js 
    - function highlightDoc(color, word, win)
    - baseNode.setAttribute("style", "background-color: " + color + ";");
      (tested and it works !!!)  

- ask to add Platform information on the download page. 


Done in version 0.3.2

- option to hide the validator by default 
- add a X to close the HTML validator
- Filter with the list of message not to see.
- add an option to refresh the HTML source from the webserver to allow not to reload 
  the page in the browser and to revalidate it again.
  - it exists partially in mozilla by default : View / Reload / Ctrl+R
  - added in Firefox
- option to copy the error messages 
  option to select them all
- number of accessibility errors
- Cleanup : set by default the tidy-mark off  
- Cleanup : add 2 tabs in the dialog.
  - a preview of the corrected source like in Tidy UI 
  - show also the original source
  -> add a base tag to get the image and so on.  
- add a netstat image to one of the page of my mozilla html page
  see : http://users.skynet.be/luc.dens/
        http://www.nedstat.com/f31_index.htm
- procedure to remove the line colors
  -> call it when changing the options

Bugs solved in 0.3.2
--------------------
- line are not colored if:
  - validate html by default is off
  - then show HTML validator -> no color on lines.
- hide does not work for accessibility messages
- can not select the text in the explain-error after that the clicking on an error
  happens in Mozilla and Firefox.
  It works before to select an error
- 1. install html validator
  2. set the "accessibility level" to 3.
  3. browse to http://yergler.net/projects/mozcc/install
  4. view the page source 
  -> crash
  -> logged a bug in tidy
- add the comment of 
  http://www.aprompt.ca/Tidy/accessibilitychecks.html
  -> make a perl script to convert this page to html val. format.

Version 0.41
------------
- disable or show an message when pressing on cleanup and that the 
  numbers of errors is > 0

- make a function in the C library that returns for a given message id,
  the type of the arguments of the message.
  ex: tag
      tag,attr
      tag,attr,value
      etc
  by copy/pasting the localize file.

- more options in the cleanup
  - output in ascii to have keep entities (ex: copyright of google)
  - output in strict XHTML  

Version 0.50
------------
- validation in real time:
  - View an icon after downloading the file with 
    - broken (warning)
    - broken in red (errors)
    - ok (no errors, no warning).
  - Possibly use the nsXMLHttpRequest.cpp
  - overwrite the method : send (line 
    /* void send (in nsIVariant aBody); */
    NS_IMETHODIMP 
    nsXMLHttpRequest::Send(nsIVariant *aBody)
    {}

  // Bypass the network cache.
  nsLoadFlags flags;
  mChannel->GetLoadFlags(&flags);
  flags |= nsIRequest::LOAD_BYPASS_CACHE | nsIRequest::INHIBIT_CACHING;
  mChannel->SetLoadFlags(flags);
  - better change the code of nsXMLHttpRequest.cpp and remove the flags, see if it does
    what I want.
  - add something in the status bar like ForecastFox 
  - got an mail asking to put green (nothing), yellow (warnings), red (errors)
  - validation in real time works partially !!!  
  - make icons no error, warning, errors
  - show them after validation
  - Think about the nice yellow hint with more info from ForecastFox  
  - Had a request to add view source to the toolbar ! 
    Is that possible?  I ask because I found an extension in which this is
    done for the Print Preview (http://www.snide.com/freesoftware/).  Once
    installed, go to the 'Customize Toolbar' and drag it up.
    (replaced by the validation in real time)
  - show a nice tooltip
    - the tidy logo
    - design a sample in Gimp 2.
      -> Big icons with the result ?
    - with the list of the page + frames + the errors (small icons)
    - with the accessibility errors
  - sum errors of sub frames
  - sum errors of iframes
  - make a testcase with frames 
  - make a testcase with iframes
  - there is a problem when loading a set of bookmark like WORK6
    -> the validation is rerunned a lot of time for the 1rst tab
  - there is a problem when loading a page with frames
    -> the validation is done for the top frames each time
  - when double-clicking, show a choice of frames/iframes and the number of errors for each ones
  - store the pageToValidate : lastPage, lastPageFrame directly in the documents
  - Final options list should be
    - About... (done)
    - View Source... (done)
    - Cleanup... (done)
    - Disable or Enable (done)
    - Options... (done)
      - Show - icon only (done)
             - icon and text (done)
    - Copy error to clipboard (done)
  - detect when we change of tabs
    - onSecurityChange is called when the protocol security change and when
     the tab is changed too !
  - Copy Error to clipboard should copy the error of all frames.
  - Double click when disabled should pop up to enable.
  - Problem for validation directories on the file system !

- Cleanup
  - options to choose the size of the indentation
  - add the URL of the page or the title in the cleanup title of the window
    (like in viewsource)

- tidy.debug preference.
  -> when set: show the #xx number in the status bar
  -> show the error id and understand when copying only one 
     line of the error line to the clipboard

- Report a bug for the cleanup introducing error
  - make a testcase
  - find the reason of the error
  - find a fix ... if lucky
  - report a bug
  -> FOUND -> this is due to the bug 57724 (firefox changes the HTML source text)
     -> fixed in Firefox 1.1
  - show the errors of the current page only

- Some errors of http://www.google.com/search?hl=en&lr=&q=toto&btnG=Search
  can not be hidden ? They look like not recognized by the Tidy C extension ?
  > line 58 column 558 - Warning: <img> lacks "src" attribute
  > ErrorId: -1 / desc GetErrorDescription: error id does not exist
  - part 1 : solved internally and submitted bug in tidy - 1103993  
  - part 2 : error 86 documented

- tidyChooseSource
  - Ok, should be the default button
  - The list should selected, with the focus by default
  - Enter should work when selecting with keys

- Website:     
  - remake the website to use iframes and removes the errors with frames.
  - add a comment in the download page with the site blocking thing for extensions.
  - http://users.skynet.be/mgueury/main_frame.html does not work in IE....

- About 
  - Like Firefox 
  - WeatherFox is a really good sample.
    -> associate it too with the about of the extension menu

- Options  
  - Browser Disable  
  - Show - icon only 
         - icon and text
  - change the text in the validation option
    OLD: validate HTML page by default
    NEW: disable validation in View Source
    
Version 0.52
------------
- It hangs when loading page with this HTTP tags:
  > https://bugzilla.mozilla.org/buglist.cgi?query_format=&short_desc_type=allwordssubstr&short_desc=&product=Browser&product=Bugzilla&product=Calendar&product=Camino&product=CCK&product=Composer&product=Derivatives&product=Directory&product=Documentation&product=Firefox&product=Grendel&product=JSS&product=MailNews&product=Marketing&product=Minimo&product=Mozilla+Localizations&product=mozilla.org&product=MozillaClassic&product=NSPR&product=NSS&product=PSM&product=Rhino&product=Tech+Evangelism&product=Thunderbird&product=Webtools&long_desc_type=substring&long_desc=&bug_file_loc_type=allwordssubstr&bug_file_loc=&status_whiteboard_type=allwordssubstr&status_whiteboard=&keywords_type=allwords&keywords=&bug_status=UNCONFIRMED&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&bug_status=RESOLVED&bug_status=VERIFIED&bug_status=CLOSED&resolution=---&emailtype1=notregexp&email1=&emailassigned_to2=1&emailreporter2=1&emailqa_contact2=1&emailtype2=exact&email2=&bugidtype=include&bug_id=&votes=&chfieldfrom=&chfieldto=Now&chfieldvalue=&cmdtype=doit&order=Reuse+same+sort+as+last+time&field0-0-0=status_whiteboard&type0-0-0=substring&value0-0-0=fixed-aviary1.0&field0-0-1=keywords&type0-0-1=substring&value0-0-1=fixed-aviary1.0
    HTTP/1.x 200 OK
    Date: Wed, 26 Jan 2005 11:22:21 GMT
    Server: Apache/1.3.27 (Unix)  (Red-Hat/Linux) mod_ssl/2.8.12 OpenSSL/0.9.6b DAV/1.0.3 PHP/4.1.2 mod_perl/1.26
    content-disposition: "inline; filename=bugs-2005-01-26.html"
    Connection: close
    Transfer-Encoding: chunked
    Content-Type: multipart/x-mixed-replace;boundary="------- =_aaaaaaaaaa0"
- New option 'highlight lines can be disabled'
- Show a message when number errror > show-errors
- Seems to hang when changing of tab and that the tab is not completely 
  loaded until that the tab is there.
- Problem with Firefox 1.0 only.
  The URL of the browser does not change anymore with tabs.
  -> onLinkIconAvailable was missing in listener
  
Version 0.53
------------
Bug
  - Observed once in Firefox 1.1 that the tooltip was always the one of 
    the previous tab. Even after changing tabs a lot of time. Unhappily 
    javascript debugger did not work and I could not debug and reproduced 
    again ( an user complained of it too).
    It looks that it used the doc of the previous screen ? The strangest
    is that the toolbar status was right ?
    Testcase: (in firefox 1.1)
    - open 2 windows
      - open several tabs
      - switch between the tabs
      
Version 0.55
------------
Bug
  - Empty lines with errors in the view source (Linux, MacOS)
  - caching problem:
    www.lasalabanzas.net
  - it can be reproduced simply with 
    http://mgueury-be.be.oracle.com/servlet/MozillaServlet 
    Step by step:
    - look the page.
    - click on refresh 
    - it is needed to click several times to see the id changes !
    - disable the extension and it works ??
  - http://www.ailis.de/~k/test/cache.php 
    141.143.54.240,127.0.0.1,be.oracle.com,us.oracle.com,uk.oracle.com,oraclecorp.com,192.168.0.*,localhost,spirou.be
  - I love your extension for Firefox! However, I’ve noticed that it causes a problem at times.
    I have developed a site where I’ve set explicit response headers for the browser to NOT cache 
    the pages. Everything has been working as expected, until I installed your extension. 
    For some reason, whenever your extension is enabled, I get a cached version of the page 
    when hitting F5. I’ll get the same cached page for a few seconds, then it will update. 
    When I disable your extension, the problem goes away. I just thought you should know.
    -> TODO : diagnose
  - Bug session lost
    You can reproduce the problem by using our demo account which is
    unfortunately in German only. Thus I describe how to reproduce the
    error.

    1. https://ww2.homebanking-berlin.de/cgi/anfang.cgi/Berliner_Bank
    2. Login with "1234567890" and "12345" an click [senden]
    3. Click "Banking" in the left navigation
    4. Click "Ubertrag" in the left navigation
    5. Click the first radiobutton in the upper selection and the second
       in the lower selection an continue with a click on [weiter]
    6. Enter any amount in "Betrag" and click on [weiter]
    7. Click on [Korrigieren] in the lower left corner  
    => The session is terminated and you get an error (German: "Fehler") 
    With HTML Validator switched off this bug does not occur.

    The page where the problem appear give this HTML header:
      HTTP/1.x 200 OK
      Date: Mon, 21 Feb 2005 11:10:14 GMT
      Server: Apache
      Pragma: no-cache
      Expires: 0
      Cache-Control: private, no-cache, no-store
      Connection: close
      Transfer-Encoding: chunked
      Content-Type: text/html; charset=iso-8859-1

    -> there is no cookie
    -> TODO : try with proxytrace to see if 2 requests are sent
       in that case

   This is due a POST with a URL containing a query string
   ... check nsICachingChannel
    
Version 0.56
------------
- Crash: Cleanup : big baseURL (>128 char) crashes firefox
- Crash: Accessibility bug : [ 1154302 ] Accessibility : empty PRE tag crashes firefox
  Base Tidy bug: http://sourceforge.net/tracker/index.php?func=detail&aid=1154302&group_id=27659&atid=390963
- Crash: Empty PHP tags in attribute crashes firefox
  Base Tidy bug: http://sourceforge.net/tracker/index.php?func=detail&aid=1158650&group_id=27659&atid=390963
- Added a tooltip for the icon when validation in the browser is disabled   
- Translation 
  - Put all strings in the xul and javascript in the dtd file
  - Use the string bundle thing
  - Look in ForecastFox
  
Version 0.57
------------
- Problem of the Options dialog box is missing the OK button when the users
  are using big fonts on Windows NT. (the vertical size is too small)
  The window has now also a minimize and maximize button.

Version 0.58
------------
- Contextual menu in the cleanup to select all or copy the cleanup source
- Licence: change the licence to MPL 1.1 
- validation in real time
  - Exclude all URLs to validation and add an exception list
  
Version 0.59
------------
- It is now possible to translate the description of the extension
  in the tidy.properties file
- New build system for Windows/Linux/MacOsX  
- Added a 's' for 0 errors.
   There are 3 variations of "error" with or without s, because grammatical plural 
   rules depends of the language. Ex:
   > English : 2 errors,  1 error,  0 errors  (0 takes 's')
   > French  : 2 erreurs, 1 erreur, 0 erreur  (0 takes no 's')  
- I found a page which does not indicate any errors, yet there are many.
  http://www.hollandsentinel.com/    
  it was due to the convertion in unicode. But it is not happening anymore probably
  because the page is dynamic ... AARGH and I do not have a copy of the page 
  Error: [Exception... "Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIScriptableUnicodeConverter.ConvertToUnicode]"  nsresult: "0x80004005 (NS_ERROR_FAILURE)"  location: "JS frame :: chrome://tidy/content/tidyBrowser.js :: anonymous :: line 461"  data: no]
  Source File: chrome://tidy/content/tidyBrowser.js Line: 461
  Testcase : C:\my_prog\mozilla\src\bug\2005_05_04_charset_problem  

  The problem is because the code of the ScriptableUnicodeConverter does not handle the characterset convertion
  error. 
  A sample of code hanling it correctly can be found in :
  > nsresult nsScanner::Append(const char* aBuffer, PRUint32 aLen){

  Solution:
  - current version: report an error with a new icon
  - future versions: logged bug 289947    
- Crash report : 
  Testcase C:\my_prog\mozilla\src\bug\2005_03_30_crash_tidy
  Reproduced in 0.58 !
  Logged bug: http://sourceforge.net/tracker/index.php?func=detail&aid=1062661&group_id=27659&atid=390963
  Solution: used the "buffer overflow" settings in Tidy
            Fixed in the 08/04/2005 in tidy main code.
- The cleanup of the euro sign gives does not work when charset=unicode
  > Testcase in C:\my_prog\mozilla\src\bug\cleanup_euro_sign
  Solution: forced the UTF8 charset in the cleaned page in place of using the 
            auto-detection
- Logging added to the C part to help analyzing problems.            
- Take a long running page 
  http://talkback-public.mozilla.org/talkback/fastfind.jsp?search=1&searchby=stacksig&match=contains&searchfor=nstidy.dll&vendor=All&product=All&platform=All&buildid=&sdate=&stime=&edate=&etime=&sortby=bbid
  Then choose cleanup before the page is fully loaded -> it hangs. 
  Solution: added a function to check if the page is still loading
- make a project in sourceforge
- Options  
  - validation in real time
    - Include all URLs to validation and add an exception list
- Build system
  - Automatize the build on linux (copy file, ssh, build.sh, copy xpi back)
  - add the platform to the XPI name
  - adapt it for MacOSX 
- Since the change of this week-end=
  -> replacement of the javascript nsIScriptableUConv 
  -> and the change to tidy 24mar2005
  -> Saw 3 crashes today about the JS3250.DLL, but I have no idea why and always
     by editing the bug database.
     SOLUTION: remove my UTF8 convertion function  
- Add a disagnostic logging
     
Version 0.60
------------
- the 'Cleanup' shows the right cleaned html & browser, but the originals 
  html & browsers are as if there was no post datas.
- broken: copy errors to Clipboard introduced in 0.59 introduced by isLoading()
- right side is cut on MacOsX of about 20px.
- Request from an user:
  > However, there is one minor "bug" I would ask you to fix: You have used a 
    fixed window size both for tidyCleanup.xul and tidyOptions.xul. People like 
    me with bigger fonts won't see the whole window - especially not the OK button!
    I think you can just remove the width/height attributes - which I just did locally 
    and Mozilla/Firefox will calculate the optimum size of the dialogs. At least it does 
    it here for me.
- Do not validate the about:xxxx files. 
- A warning was shown in the java console when viewing a page source
  > Error: redeclaration of const kSaveAsType_Complete
  > Source File: chrome://browser/content/contentAreaUtils.js
  > Line: 156
- Change the C extension to 
  - sent also the list of ID of the filter
  - implement a fast filter based on the last id used in GetMessageNode of localize.c
  - change the C library such that it returns data in a more understandable way:
    - in another "table"
    - error,line,col,message_id,attribute1,attribute1,attribute3,attribute4
  - the fast filter takes 2/3 sec at startup of mozilla. It is too long just to store strings.
  - See how the localization is done on the C level.
    I think, there is none.   
- Make a prettier big green icon from valid page with Decadry Soft.
- With Firefox 1.0+
  "The procedure entry point ?Clone@nsMemory@@SAPAXPBXI@Z could not be located in the dynamic link library xpcom.dll."
  Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8a6) Gecko/20041204 Firefox/1.0+
  Solved by 1.0+ beta.
  
Version 0.62
------------
- There was a bug in the nsTidy::SetConfig causing this stack trace due to 
  a wrong test in the search of the values:
  
  MSVCRT! 7801065f()
  nsTidyImpl::GetErrorsInHTML(nsTidyImpl * const 0x60313590, const nsACString & {...}, const char * 0x07b9cf40, int -1, char * * 0x0012d464, int * 0x0012d474, int * 0x0012d484, int * 0x0012d494, int * 0x0012d4a4) line 120
  XPCOM! 6030613e()
  FIREFOX! 0041cd23()
  ...
  It was corrupting the memory. By improving the loop it should be solved.
  - bug 295950: Problem with upgrade to 1.1 with extensions containing native C library  
  - bug 297318: Firefox C++ Extension are incompatible between version 1.0, 1.1: entry point ?Clone@nsMemory@@SAPAXBXI@Z
  
- The same extension works now for Firefox 1.0 and 1.1.
  It is due to a new library linked with the DLL: xpcomglue   

- Lot of translation fix thanks to sergey:
  - In version 0.6.0 I try to translate error names but they don't work in
    both linux and windows version  :( 
    Maybe this feature else not implemented or some error?


Version 0.63
------------

- Back button in Firefox 1.1 after new window
  1. Install current Firefox Deer Park Alpha Trunk build
  2. Create a new Mozilla profile for this test.
  3. Confirm whether browser history works:
    a) go to http://users.skynet.be/mgueury/mozilla/
    b) right-click the first "What's it?" link (under Mozilla) and select "Open
       Link in New Window"
    c) click the "Screenshots" link

  4. observe that browser history exists (i.e. you can click the "Back"
  button.

  5. Now install HTML Validator 0.60 or 0.62
  6. Restart the browser
  7. Repeat Step #3
  8. Notice that browser history DOES NOT exist (i.e. you cannot click the
  "Back" button. 
  Source : browser.js : function UpdateBackForwardButtons()

  This is solved by a very bad trick. 
  I should log a bug in the javascript engine anyway for this.
  
- In the latest alpha version (post alpha 2) of Firefox (deerpark) 
  my extension does not show his panel anymore in the viewsource.
  This is due to a change in viewsource.xul

  BEFORE (OK): <window id="main-window"
  AFTER (BUG): <window id="viewSource"
  
  https://bugzilla.mozilla.org/show_bug.cgi?id=303060

- ?? Could not reproduce ??
  In Firefox 1.1 beta > 12 jul
  In TidyUtil.js method "buildFilterArray" I had to comment out
  line 253 before Tidy would work, otherwise I would get a blank
  screen in the show source window:
  function()
  {
     // List of the shown errors and warnings
    this.filterArray = new Array();
    /// Reset the fast filter in the tidylib
    /// this.tidy.resetFilter(); <-- line 253
    ...etc        
    
- "I have another problem while translating HTML VALIDATOR into german language: 
   If I change ",Access:" on line 52 in tidy.properties into another word 
   (like "Barrierefreiheit"), no help messages will appear!"    

Version 0.70
------------
- Help: files in XHTML
- Help: new CSS with smaller fonts
- Copy Errors to clipboard got a hardcoded string
- Translation: entry for the translator in the tidyAbout.xul
- Translation: if prefix error is translated, the errors are not in red anymore
- bug 294146: browser hangs when seeing this page after 5 sec (when using DHTML)
  It seems to hang/crash the browser when going to this URL:  
  https://www.ebetonline.co.nz/racing/  
  Testcase : C:\my_prog\mozilla\src\bug\2005_04_01_hang_racing
  https://bugzilla.mozilla.org/show_bug.cgi?id=294146      
  Fixed in Mozilla 1.1 post alpha 2
- Icon Empty 
  - comes forward when I disable (memory and disk) cache in
    Firefox, then Tidy writes a wrong warning to Firefox's footer.
    He does this with the webdev toolbar
  - When a page return an HTTP-404 and an HTML page, the page fetched from the cache is
    empty. I should show a special icon when the page is empty.
- Batch validation
  - tag to find:
    <img src="xx">
    <a href="xx">
    <link href="xx">
    <iframe src="xx">
    <frame src="xx">
  - write a C function to get all of these links from tidy 
- Cache
  The statusbar icon validation thinks a iframe links to an empty page when doing 
  POST requests. This was due to a wrong algorithm when looking for such pages
  in the cache.
- New: if an help file is not exist in a choosen translation. The en-US
  help file is shown in place. 
- Line and Columns are now translated
- the description of the extension contains a (TEST) and the tidy.proporties
  tidy_extension_desc is not more used.
- build an international version
- freeze the translations for version 0.70
- if an HTML help is not translated, show the english version

Version 0.72
------------
- Tidy bug 1282835 - AREA tags report missing HREF attribute (fixed in Tidy too)
- Tidy bug 1263391 - ADDRESS tag is wrongly defined as BLOCK container (fixed in Tidy too)
- Tidy bug 1286029 - Warning about empty action attribute in Form (fixed in Tidy too)

Version 0.73
------------
- In Firefox 1.4, when doing a back, the icon in the borwser does not change
  It worked in 1.0. Fixed with the BF cache triggers.

Version 0.74
------------
- IMPORTANT !!!! Firefox 1.4.1 only
  I make special site for you: http://remik.org/test.html when I click
  on "ok" then FF segfault, when I disable your extension than working 
  good.  
  Testcase: C:\my_prog\mozilla\src\bug\2005_10_10_javascript_open_hang

  Logged bug https://bugzilla.mozilla.org/show_bug.cgi?id=312027

Version 0.76
------------
- When installing the version 0.74 on a Firefox version in Portuguese, the extension
  is shown in Czech...
  
Version 0.77
------------
- I select the error that I want to hide, select Hide in the context menu and that's all, 
  no popup, no message in the error console could it be due to a problem with the translation? 
  I'm using Firefox 1.5RC2 es-ES Or a problem with some other extension? I don't have too 
  many extensions, maybe the more related ones are "Open source with" and "Console2"
  Is there something that I can do to help find the problem? 
  -> forward port in 0.80 too.
- function onTidyChooseSourceNewTitle()
  window.title is deprecated
  document.title = oTidyUtil.getString(window.arguments[2]=="cleanup"?"tidy_cleanup":"tidy_view_source");
- line-col was encoded twice in UTF8
  fix in translation.c
- detect issue with missing tidylib.dll or .so
- Show a warning if the extension is installed on a unsupported platform  

Version 0.79
------------
- by default googlesyndication pages are not validated anymore
- None should remove the summary attribute but not the alt one !!!
  Solved with a hack...
- New icon for the not in domain websites

Version 0.794
-------------
Added Polish
Fix compatibility issue with Firefox 2.0

Version 0.796
-------------
Added Finish


Version 0.80
------------
- Help error 27 - content occurs after end of body
- Added code to make the HTML version on which the validation is done 
  shown as info in the view source
- Hi Marc,
  in the attached file tidy.jar.zip I've added all tidy-help-files with the new css from 
  mike. I also added new tidy-help-files for tidy-warnings 17, 18, 20, 27, 46 and 85. 
  Please remember to adapt tidyValidate.js at line 500. Please put the flag-files in the 
  attachement into the skin-directory.
  In the de-DE.zip-file there are the up-to-date german tidy-help-files. Not the last throw, 
  but today's state. Please add the files to the next version.
  Thanks in advance
  Ansgar
- applied fix for tidy bug 1345637 -> big performance increase for big files
  Testcase: www.dermika.be/fftest/my_namelist.php.htm the browser hangs 
  From 20-50 seconds -> 0.x sec
- rewritten the onTidyBrowserTopLoad to 
  - create the oTidyBrowser at the first validation
  - log exceptions to the javascript console
  - queue the events and treat them serially in place of parallel like before
- Bug 
   Refreshing file:///C:/my_prog/mozilla/src/bug/2005_11_28_bigfile/testcase_frame.html
   gives random result, mostly visible with background validation
   Sometimes 0 errors, 0 warnings
   Sometimes 0 errors, 6 warnings
   -> solved by onTidyBrowserTopLoad rewritting  
- Since firefox 1.0.3, There are a lot of (?) next to the icon of the frames.
  - open http://users.skynet.be/mgueury/mozilla/
  - double click on the icon to see the list of frame
  - there are question mark next to the frame list (sometimes only)
     It does not happens in Mozilla
  Testcase: file:///C:/my_prog/mozilla/src/bug/2005_04_21_icon_frame/test.html  
  - happily, it works fine in Firefox 1.1 beta   
- with javascript.options.strict some error are reported to the javascript 
  console.
  For example,
       var icon = sum.getErrorIcon();  Warning: redeclaration of var tooltip
       Source File: chrome://tidy/content/tidyBrowser.js
       Line: 267, Column: 8
       Source Code:
       var tooltip, parent, lblparent, lbl; 
- Small usability improvement
  - Double click on the icon open the 
    - view-source (or cleanup)
  - Make 3 columns for the errors : error/warning, line/column, message
    (or an order by line)
  - The count of errors / warnings should be outside the list of errors in its own 
    part of the gui - e.g. to the left of the "options..." button or at the top 
    of the errors list
  - You should display the !DOCTYPE against which the page is being validated 
    in the case where it is missing
  - When view source opens the list of HTML errors is always scrolled to the bottom 
    it should be at the top.
  - Request from an user:
    It would be great if I had the option to just click (a "Validate Now" button) and have 
    it check just the page I am looking at.
  - Request from an user:
    I've been using this tool a lot and found something that I would really like.
    Right now the errors and warnings are sorted by lines. I'd like to see
    the option to sort by error / warning so that I can fix similar errors /
    warnings at the same time. If this can be done, I'd appreciate it.
  - option to order the errors by line and column
    (default)
  - it's obvious that someone who doubleclicks the Validator icon wants a
    validation of the source at that moment I'd suggest to automatically enable
    the validation in the source when that icon is doubleclicked, at least
    optional. 
  - when double-click choice between viewsource and cleanup
  - ChooseSource    
    - The only thing I wish It could do is list the frame name in the popup when you double 
      click the icon in the bottom right..    
  -  I minor suggestion for future improvement:
    you should have some sort of small "created with tidy" logo, like
     http://www.w3.org/Icons/valid-html401
    or
     http://images.google.se/images?q=tbn:1FaWVHgr3AblLM:ned.ucam.org/~sdh31/notepad.png  
 - SGML Parser
   
   Need to choose between sgml.soc and xml.soc
 
   #
   # Overall parsing algorithm for documents returned as text/html:
   #
   # For documents that come to us as text/html,
   #
   #  1. check if there's a doctype
   #  2. if there is a doctype, parse/validate against that DTD
   #  3. if no doctype, check for an xmlns= attribute on the first element
   #  4. if there is an xmlns= attribute, check for XML well-formedness
   #  5. if there is no xmlns= attribute, and no DOCTYPE, punt.
   #
   Testcase : 
   http://validator.w3.org hangs when validating
   
   -> got a simpler test that looks for the DOCTYPE and XHTML in the doctype
- Doc
  I often use ISO-HTML (http://purl.org/NET/ISO+IEC.15445/15445.html), but
  tidy-based cleaner does not support it. Please add supported HTML
  versions to your FAQs. 
  -> will be supported by the SGML parser
- SGML parser only.
  Go to www.yahoo.com
  Search for HTML validator
  View source -> crash

Version 0.83
------------
- LINUX
 - after a new install, the startup is not detected
 - SGML-lib is not copied automatically
 - size of the executable
   -> probably because of CXX_FLAGS=-g -02
 - Line numbers do not work
 - Tidy 0.8x and 0.79x crash with a normal HTML page
 
   C:\my_prog\mozilla\src\bug\2006_06_10_perl_crash\bug.html
   http://sourceforge.net/tracker/index.php?func=detail&aid=1503897&group_id=27659&atid=390963
   (Backported to 0.793)
 - Tibor bug: Fix for TidyUtil.js

Version 0.831
-------------
  - Opening http://www.cs.cf.ac.uk/fun/welsh/LexiconForms.html with HTML Validator installed causes 
    Firefox to crash after growing to about 2GB in memory. I tried several times and Firefox 
    crashed each time. After uninstalling the validator the page loads without a problem.
    http://tidy.sf.net/bug/1098012
  - if document is XHTML, validation is done and work fine, but you can't 
    see source page:
     + double click on icons in status bar doesn't work
     + right click on icons in status -> "Page Source.." doesn't work too
     + right click on page -> "Page Source.." works  ;-) 
  - some help files contain some errors (they don't pass validation by 
    Tidy/SGML)
     + info.html
     + no_help.html
     + sp_good.html
     + sp_start.html
     + tidy_1.html
     + tidy_27.html
     + tidy_46.html
     + tidy_51.html
     + tidy_53.html
     + tidy_85.html
     + tidy_good.html
     + tidy_start.html

Version 0.832
-------------
  - Fix for the double-click on the icon breaks the extension on Mozilla and Seamonkey.
    Solved by adding openViewSource.
  - I use Mozilla 1.7.8 on Debian Sarge, and when I try to install Tidy

      http://htmlvalidator.sourceforge.net/mozilla/tidy_firefox_linux_0794.xpi

    as non-root, I get the error message that I need write permission on
    /home/*/chrome and /usr/lib/mozilla/components. This is a wrong error message,
    because I _do_ have recursive write permission on both dirs! Installing as
    root works. I think this is a bug in Tidy, and the error message should be
    corrected: ``Run Mozilla as root and install Tidy from there.''.     

  - Cleanup: alt are not corrected automatically by Firefox
    http://sourceforge.net/tracker/index.php?func=detail&aid=1543753&group_id=27659&atid=390963
    
  - Algorithm: New Serial algorithm to validate with SGML Parser then Tidy
  
  - Doc: Regenerated the doc to have the validator link working in the sp help.
  
  - Cleanup: When other algorithms are used check the number of error before cleanup with Tidy

Version 0.834
-------------
- Validate online with W3C has been moved to the menu in place of a very visible button
- Menu items are checkbox in place of radio buttons.

  http://www.mozilla.org/xpfe/xulref/menuitem.html#type

  Or to show the code change that works for me:

  <menuitem label="&tidy.options.icon_text;" name="tidy.browser.menu.icontype" id="tidy.browser.menu.icon_text" type="radio" oncommand="oTidyBrowser.onIconText()"/>
  <menuitem label="&tidy.options.icon_only;" name="tidy.browser.menu.icontype" id="tidy.browser.menu.icon_only" type="radio" oncommand="oTidyBrowser.onIconOnly()"/>

  That is it! Simply give them both a name attribute with identical name, and chnage type to "radio".
  That will make it offically a radio menu item, which in some skins (or the cutemenu extention) will actually show
  up as radio buttons (or images that look like radio buttons anyway).

  No code changes are needed, because of how similar radio menu items and checkbox menu items are.

Version 0.835
-------------
- UI changes
  View Source
  - button are now in the toolbar
  - renamed the mnu Tools to  Html Validator
  - removed Ctrl+R reload in Firefox since it came back as a standard feature in Firefox 2.0
  - line numbers have a better look
  - line numbers works now better on Linux
  About
  - New about screen with a lot more links
- validate now is working against after bug introduced when making the extension
  compatible with Firefox 2.0
- error with line without column are now highlighted/selectable : ex:
  line 574 - Error: unclosed end-tag requires SHORTTAG YES
  ErrorId: 248 / Desc: GetErrorDescription: error id does not exist
  

-------------------------------------------------------------------------------

TODO
----
- Buy WebSite
  http://www.hostexcellence.com/express_plan.php
  www.collabhtml.com 
  
- Buy PHP / MySQL book  

- Comment the tidyValidate.js file   

- Make a marketing campaign 
   - in Tidy mailing list
   - in Mozilla bug
   - in Mozilla mailing list
   - in Mozilla forums
   - in WebStandard Awards

- Find people to help me
  http://devedge.netscape.com/viewsource/2002/browser-detection/
  http://www.bclary.com/ 

- Get help for the translation at babelfish. See email in 
  C:\my_prog\mozilla\src\bug\2006_06_07_babelfish

- Possible integration in Mozilla
   -> Composer/NVU : check the Syntax
     
- Add a help for each type of errors.
  - Need to give a sense to the corrections !
 
- Small usability improvement
  - add a contextual menu to see the explanation in full screen
  - make a list of all the parameters and put a cross to the one I will include.
  - add a firefox type of find in the cleanup
  - add options to show attributes and tag on a separate line in cleanup
  - it takes a double-click on the icon to launch the validator window. Every other 
    extension I've used that adds something to the statusbar uses a single-click. 
    A double-click doesn't make sense when a single-click does nothing. 
  - Request from a user:
    I want to add some additional flags to the call to 'tidy', namely 
    --word-2000 yes 
    --bare yes  
    --drop-proprietary-attributes yes".
    Where in the code can I add additional flags to pass to tidy?
    I also want to be able to set the value of "clean" to true, but can't figure out what 
    to put in user.js to do that. Could you write up a few sentences about how to override 
    the default values that you have set for various tidy flags?     
  - Also I would love the ability to filter warnings by the message, rather than just 
    the warning itself.
    For example if I filter the warning:
          Warning: <form> attribute "id" has invalid value "__aspnetForm"
    It filters any attribute with an invalid value, but I just want it to filter 
    out that exact message.           
    
- Validate XML or RSS XML based files    
          
- Change the C extension to 
  - put the initialisation in a separate function called by oTidyUtil
      
- missing </...> before ...
  Problem seem that it is recognized as a missing <...>
  ex: see dot.kde.org
  -> should be solved by fast filter... it is not
  
- color warnings and errors in a different way in the line colors

- option to highlight the columns with the error
          
- make the source and extension in the firefox directory
  - make so that the tidy xpi is builded by the make ? 
  - if it is possible ?
  
- small icons next to the error like in tidy GUI ?

- problems with line numbers when looking the error of www.gamespot.com
  about at line 375
  
- Validation in real time:
  - make a procedure that when an option is changed like the icon text
    then all the windows are changed. (see tidyUtil and windowManager)
  - if disable in view source is choosen, clicking on the icon show the source
    but with the validation !
  - Instant source: view the source the the current page. pointer under the mouse
    or selection (www.blazingtools.com) - Aardvard
  - I should add a function in the extension to find the bad characters when an A 
    is shown.
  - If the seperators are dragged to resize the panels in the view source window 
    this should be remembered and used as the default positions for the next view 
    source window opened.
  - Run the validation is a separate thread
    Then update the UI.   
  - I will think to change the default behavior (when the extension is disabled)
    to:
    - when you click on the extension icon,
    - you go to the view source
    - and show the validation results. 
  - Would it be possible to add an option to display the icon in toolbar-menubar?    
  - History log file with the validation result and list of URL validated.
    (+ the HTTP headers if possible or posted data)
  - Validate in background to improve the rendering speed:
    Testcase:  C:\my_prog\mozilla\src\bug\2005_11_28_bigfile\test2.html
  - I like your HTML validator extension a lot.  One option that might be
    nice is when validation is disable, being able to click the status bar
    icon once to validate the page, but leaving validation disabled.    
  - how about an optional button to replace the activity-button of Firefox?
    (animated if it's loading and then your color coding if it's loaded) - it
    would save a little space on my (allways too small) screen :)
    
- Options  
  - validation in real time
  - option to hide the icon in the browser when disabled.
    - tidy.options.browser_icon=hide
    - tidy.options.browser_disabled=true

- Help 
  - People do not understand that the testfile in accessibility is 
    a file with the issue. It is missing a correction. GOOD/BAD    
  - Accessibility help
    - rewrite the accessibility doc and use http://www.w3.org/TR/AERT
      as a lot better base.
  - On linux, when clicking in the help, it does now always navigate to a new page.
 
- Website:     
  - make a dynamic website with the errors
    - maybe a forum
    - maybe use the forum of tidy
    - allow people to make comment of it
  - make an user guide.
    - good sample: http://extensions.roachfiend.com/howto.php 
    
- Translation 
  - Ask to the tidy community to put the strings of the errors
    in a translatable file.
  - not sure if the translation really work on Linux
  - tidy.properties contains the version number, it is annoying for translations.
    Find a way to read it from the install.rdf.
    
- Batch validation
  - write a javascript program that 
    - make all the URL absolute 
    - remove the #anchors
    - add them to a list on the screen if they do not exist
  - validate all page liked to a particular page
  - to XX level
  - limited to a domain or not
  - with XX threads
    - In the result, show the mime/type, size for HTML pages
  - Integration with Selenium IDE
    
- Cleanup
  - if the source file is file://
  - option to save the cleanup file in place of the original file
  - option to keep a backup version or not
  - add a save as... button at the bottom to save the generated file
  - Comment from user: A FIND function for the cleaned code windows would be 
                       nice as would a "Highlight changed code" option. Good work.
  - Add a diff between the corrected version and original one 
  - gray out tags and attribute in uppercase if the output is forced to XHTML.
    (better if the output is XHTML ?)
      
- View Source
  - Ctrl+A 
  - Ctrl+C should work to copy the list of errors in the clipboard
  - Speed
    -> fast filter ?
       - Enh 
         I would like to see structural warnings (like 'missing </div>', 'unexpected </form>')
         as errors. I just looked at the Tidy documentation, but did not find a suitable parameter.
    -> colorize the lines in background
    -> maybe create a testcase ?
    -> www.jeuxvideo.com for example ?
    -> or https://bugzilla.mozilla.org/buglist.cgi?query_format=&short_desc_type=allwordssubstr&short_desc=&product=Browser&product=Bugzilla&product=Calendar&product=Camino&product=CCK&product=Composer&product=Derivatives&product=Directory&product=Documentation&product=Firefox&product=Grendel&product=JSS&product=MailNews&product=Marketing&product=Minimo&product=Mozilla+Localizations&product=mozilla.org&product=MozillaClassic&product=NSPR&product=NSS&product=PSM&product=Rhino&product=Tech+Evangelism&product=Thunderbird&product=Webtools&long_desc_type=substring&long_desc=&bug_file_loc_type=allwordssubstr&bug_file_loc=&status_whiteboard_type=allwordssubstr&status_whiteboard=&keywords_type=allwords&keywords=&bug_status=UNCONFIRMED&bug_status=NEW&bug_status=ASSIGNED&bug_status=REOPENED&bug_status=RESOLVED&bug_status=VERIFIED&bug_status=CLOSED&resolution=---&emailtype1=notregexp&email1=&emailassigned_to2=1&emailreporter2=1&emailqa_contact2=1&emailtype2=exact&email2=&bugidtype=include&bug_id=&votes=&chfieldfrom=&chfieldto=Now&chfieldvalue=&cmdtype=doit&order=Reuse+same+sort+as+last+time&field0-0-0=status_whiteboard&type0-0-0=substring&value0-0-0=fixed-aviary1.0&field0-0-1=keywords&type0-0-1=substring&value0-0-1=fixed-aviary1.0
    -> http://sptserv.us.oracle.com/lxr/source//wws/pobpagh.pkb#L4
  - Add line numbers in the view source
  - Save the position and size of the panes (possible ?)
  - Options to close the validation if there is no error.
  - You should add a "goto error" context menu item to the view source panel so you 
    can right click on a highlighed error in the source code, select view source and 
    have the corresponding error selected in the list of errors.
  - Translations does not work ????
  - Thank you very much for developing this extension - I just love it.
    And I've got an idea that would make it even better IMHO...
    If I could just edit and save the source right there, from the View
    Source window that would be great. 
  
- ChooseSource 
  - increase the size of the listbox when increasing the since of the window in ChooseSource 
    
- Testcase
  - should make a testcase with a very very big file
  - should make a testcase with a very very slow webserver giving part by part  
 
- Bug  
  - Il faudrait logger un bug dans Tidy pour ajouter un test de la case du Doctype.    
    validator.w3.org reports it
  - ADDRESS with DIV inside
    So the 2 elements address in the code after are incorrect (the W3C validator said 
    it correctly)... I think this is a bug but i'm not sure. What do you think?    
    Testcase: file:///C:/my_prog/mozilla/src/bug/2005_08_18_address_inline/address.html
    Tidy bug : 1263391 
    -> still need to wait Bjoern feedback and integrate to code
  - http://esu.ust.hk/?dst=exco
    gives HTML Cache is empty. It seems to be due to 
    [...]
    HTTP/1.x 200 OK
    Transfer-Encoding: chunked
    Date: Tue, 23 Aug 2005 10:13:55 GMT
    [...]
  - Multizilla / TBE compatility problem 

    I made some modifications in the attached copies of
    tidyBrowser.js and browserStatusBar.xul, to make your
    add-on fully compatible with
    Mozilla(SeaMonkey)/MultiZilla. I hope that you will
    include it in your next update so enable everyone to
    have a go with it!

    I also had to fix some compatibility issues in
    MultiZilla so our next version will have no problems
    anymore. It took me 8 hours so I really hope that you
    will include my changes, or everything was done be for
    nothing (:
    
    C:\my_prog\mozilla\src\bug\2005_08_26_multizilla   
  
  - ACTIVEX extension are not given as warning ....
    http://adm.elpasoco.com/infosvcs/gis/data_distribution_policy.asp

    HTML Validator and Firefox don't show any sign that there is a PDF
    linked here.  This is an example of validating but non-functional.
    
    Testcase : C:\my_prog\mozilla\src\bug\2005_09_27_activex
    Todo : send a mail to the tidy mailing list.
    
  - Tidy bug: URL with non-ascii characters (umlaut) reports an error
    http://sourceforge.net/tracker/index.php?func=detail&aid=1324642&group_id=27659&atid=390963
    I do not know the solution then logged a bug
    
    Testcase: file:///C:/my_prog/mozilla/src/bug/2005_10_12_umlaut_in_url/umlaut.html
    
  - If validating a page with no <title> element, the "HTML Errors and Warnings" pane shows 
    the warning, but the "Help" pane provides no additional information when you click 
    the warning in the "HTML Errors and Warnings" pane.
    Also, when validating a page that has a table with no caption or summary and with 
    "Accessibility Level" set to 3, the "Help" pane shows you how to add a summary when 
    you click on the caption warning, and how to add a caption when you click on the summary 
    warning.
    I'm using HTML Validator 0.7.6 on Firefox 1.0.4, Windows XP.     
        
 - In the Live-HTTP-Header log there are two requests, first the (expected POST) an then the 
   (unexpected GET).   
   -> testcase : You can test it with http://home.arcor.de/a.gerlach/ an then button [Kontakt] 
                 r with the "pure" source:
   -> C:\my_prog\mozilla\src\bug\2005_11_21_double_request\post.html
   
 - Hello,
   Open www.nike.com and navigate to...
   > North America->USA->Running->Products->Footwear->Men
   It  just  Freezed  but  processor  utilization  is zero? I have traced
   problem  to  "HTML Validator" 0.7.6 Plugin but it is strange that if I
   disabled the plugin the page load just fine and when I enable it again
   and  program  cache is no cleaned up the page load just fine, but when
   clean cache files, the firefox freezed again.    
   
   -> Logged bug https://bugzilla.mozilla.org/show_bug.cgi?id=323874
   
 - Received a patch for Tibor to add translation to the description
   I find a article from extension description localization.
   http://kb.mozillazine.org/Localize_extension_descriptions 

   -> C:\my_prog\mozilla\src\bug\2006_01_12_description
   
 - Just did a minor upgrade and found that your extension
   no longer works.  It does work in version 1.5.0, but
   not the new release candidate.   
   
 - My suggestion: You might want to disable the status bar icon if the
   IE Tab extension is installed and the currently selected tab is being
   viewed using the IE engine.

   You can figure out what to detect by switching to the IE engine and
   double-clicking on the validator icon; you'll view the source generated
   by IE Tab.  It has an embed tag that looks like this, basically:

   <embed id="IETab" type="application/ietab" width="100%" height="100%" />
 
   Or you might be able to find a way to still get to the page source.
   
 - <table>
   <thead>[whatever]</thead>
   <tfoot>[whatever]</tfoot>
   <tbody>[whatever]</tbody>
   </table>

   is correct.

   <table>
   <thead>[whatever]</thead>
   <tbody>[whatever]</tbody>
   <tfoot>[whatever]</tfoot>
   </table>

   is wrong, but tidyfirefox does not find it. There is some specification that 
   thead, tfoot and then a unlimited Number of tbody is allowed, but no tfoot 
   after tbody.
   
 - FYI, HTML Validator 0.7.6 on Firefox Mozilla/5.0 (Macintosh; U; PPC Mac
   OS X Mach-O; en-US; rv:1.8.0.1) Gecko/20060111 Firefox/1.5.0.1 crashes
   when viewing the source of http://www.bankisrael.gov.il/
   But generally an excellent addin: thank you nonetheless.    
   
   This is due to hightlight lines. Disabling solves the issue.
 
 - On a lot of pages I get a red cross and  'HTML Cache is empty' message
   I've attached an image of the message.
   This appears on lots of different types of pages including google.com  
   -> it seems that clearing the cache solves the issue....
   
 - Error with W3c SGML Validator and not with tidy:
   Here is a link with the error.     
   http://mcgo.sitesled.com/test/
   
 - Hi: firefox crash when visit here:
   http://tahiti.oracle.com/
   Click here for Oracle9i documentation, Release 2 (9.2).
   http://www.oracle.com/pls/db92/homepage?remark=tahiti
   it crash with firefox 1.0.5 and 1.5
   Regards
   More info in 2006_02_27_oracle_crash 
   
 - Please take a look at https://bugzilla.mozilla.org/show_bug.cgi?id=321639.
   If you have a tab with a page using javascript:alert(), but have another
   tab in foreground, the browser will switch the tab, but freezes
   immediatly. 
   
   Testcase: needs to be in HTTP server:
   
   C:\my_prog\mozilla\src\bug\2006_02_27_alert_hang
   http://mgueury-be.be.oracle.com/firefox/main_page.html
   
   NOT !! Solved by checking for all page if loading is happening.
 
 - Access Level 1 gives a warning for non-existing doctype by
   Tidy accept it.
   
   Testcase C:\my_prog\mozilla\src\bug\2006_03_20_doctype_access\test_tidy.html
   
 - Go to 
   http://webiv.oraclecorp.com/cgi-bin/webiv/do.pl/GET?WwwID=Note.369436.1.FullHdr&List=KRQUEUE&KRQUEUE.Idx=1#
   Click edit in Authoring Wizard -> crash

   
 - I use your extension for firefox and it is realy nice!
   I have one problem with it. When i tidy my code everything is ok but if i copy the 
   cleaned code and paste it in a textdocument or editor, here and there i have blank 
   lines between the code lines about each 10 lines (reproduces on all pages)
   
 - Crash with the new Yahoo mail ....
   
 - I installed the version 0.791 and firefox hangs up again.
   Here are my steps:
   Open http://www.ebay.de/
   Klick "Uhren & Schmuck" (Watches and smag)
   Klick "Weitere Kategorien anzeigen..." (Show more Categories)
   Firefox hangs up :-(   
   
   Direct link: http://schmuck.ebay.de/_W0QQmorecatidZ26088
   
 - LINUX
   - strange : it is linked statically !

 - A dialog box after the install should give the choice between Tidy and the SGML parser

 - When wrapping is disabled. Show an indication that line numbers do not work.
 
 - Publish 0.793 with no_help.html
                      tidy_good.html
                      
 - Validate Now problem
   The page I'm validating (www.stchristoffel.nl , Dutch) is written in
   XHTML 1.0 Transitional, so all empty tags like <br /> have to be ended
   with a slash. When using the normal validation everything works fine,
   but when validating after javascript all those tags have their slashes
   stripped: <br /> becomes, <img src="blah" /> becomes <img src="blah"> etc.  
   
   -> Todo log a bug in Firefox.
   
 - At first, thank you for this great extension !
   I'm using it on different computers, and os's sucessfully... but...
   I can install and use it on my debian/amd64, but if i try automatic upgrade, 
   it seems to install the i386 one ! (=> goto mozilla/no_tidy_lib.html, another 
   good thing to have done it :)
 
   I simply do not upgrade it automatically, but just wanted to tell you that 
   it happened...    

   -> Todo log a bug in Firefox.
   
 - Tibor bugs
   - Problem with some line numbers not given in the info tags.
   - Problem with linenumbers not seen. 
     -> maybe the solution is to disable always the wrapping when line numbers are on.
     -> then show the 
   - Hide does not work for OpenSP
   - I'm sorry, it works fine. But if the resultbox contains few info rows
     then they will be always on top after the ordering.
   - Change the icon to HTML in place of SGML or Tidy
   
 - Some page with frames do not work when I do CTRL+U the viewsource is empty.   
 
 - Online access to http://www.cssoptimiser.com/

 - Feedback of 0.83 
 
    - my advice: can you change order of "WARNING/ERROR/ACCESS MESSAGES"
      in tidy.properties file (eg. order by name)? I don't know why these 
      messages are in that order,
      but currently is very hard to find some string (eg. "tidy_55") in this 
      file without search function. 

  - The version beta testers use currently is the 2.0b1.   
  
  - Need to be installed twice for Seamonkey
  
  - Thought I should let you know that when visiting (http://www.acad.ab.ca/) 
    (Alberta College of Art and Design) the HTML Validator extension for Firefox 
    crashes the browser.  I have since had to add the website to the "Don't 
    Validate This Page" list otherwise the browser will crash every time somebody 
    visits the site from my computer (which happens reasonably regularly because 
    my girlfriend attends the school). 
 
  - There's some issues with accessibility checks:
    Access: [13.1.1.1]: link text not meaningful(Priority 2)
    This occurs if the link test has 5 or less characters.
    For example, <a href="path/to/file">DVD</a> will lead to a warning. But, there's an issue!
    Example: <a><abbr title="Digital Versatile Disk">DVD</abbr></a> will not lead into a warning, despite still being 3 chars long!

    Access: [3.2.1.1]: missing (Priority 2) and Access: [4.3.1.1]: language not identified (Priority 3)
    Well, look at my first code lines:

    <?xml version="1.0" encoding="ISO-8859-1"?>
    <?xml-stylesheet href="stylesheet.css" type="text/css"?>
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd ">
    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
    <head>
    <title>This is a Title</title>
    </head>

  Everything it's there, but, since it's XHTML (1.*)... it gives me those warnings... There should be some conditions to work on this.
  
  - XHTML TAGs in uppercase. You can use

     http://ugweb.cs.ualberta.ca/~stef/index.shtml

    (The problem's at the first and only <OL>.  The Tidy-based
    validator doesn't flag this as invalid, but
    http://validator.w3.org/ does.)

    I'm _assuming_ that taking a valid xhtml file and changing
    any tag to uppercase will result in a test case.
    
  -  Fantastic extension - use it countless times every day!

     I have a problem though:

     Browse to directorycritic.com/free-directory-list.html
     Now try to validate page (view source)
     I get 100% cpu and the only way to get out is to end program in Task Manager.
     I am on Windows XP Pro SP2, 2.0 Pentium Centrino with 1 GB ram.
     Attached log files
     Best rgds and many thanks for an excellent extension.
     Richard. 
     
  - I have noticed a small issue with the accessibility check:

    If there is a URI in the header, I see:
    line 13 column 1 - Access: [7.5.1.1]: remove auto-redirect.
    line 13 column 1 - Access: [13.2.1.3]: Metadata missing
    (redirect/auto-refresh).

    However, the line in question is actually valid Dublin Core metadata:
    <meta name="DC.identifier" content="http://foo.bar/baz" />
    Otherwise, great extension!

  - Problem to use Exension 0.831 with a non-default profile    
    Hi Jesper,
    It is strange it looks that it does not maybe work with maybe several profiles ??
    At the first start, there is normally a copy of 1 file and 1 directory.
    To have SGML working you have to have
    - osp152.dll
    - and sgml-lib
    in c:\Program Files\firefox (or whatever directory your firefox uses)
    Marc
    Ps: cc to the mailing list for archiving     
    -> copying the files, solved the problem !!!
    
  - 0.8.3.1 with SGML parser enabled shows two errors, that are no errors.
    <hr size="1" noshade="noshade"> is valid HTML 4.01. See the attachments.
    (The TIDY parser shows no errors on that page.) 
    
  - The TIDY parser (0.7.x / 0.8.x) shows an error "escaping malformed URI reference" 
    on that page: http://webservice.keks.de/ -- But there is now way to encode 
    special characters in domain names (IDN) like the German a-Umlaut "ä". 
    ("&auml;" and "%E4" don't work.) The SGML parser shows no error here.

  - I like the new feature "validate now". Maybe the option "Double-click 
    the status-bar icon stars" could be extended by the feature "Validate now"!? ;)     
    
  - 0.7x    Firefox can not start when the path is too long on Windows ! 
            Bugzilla Bug 349820: https://bugzilla.mozilla.org/show_bug.cgi?id=349820 
     
  - 0.8x 2. SGML Parser don't work if extension has been installed globally with
            key --install-global-extension SGML parser can't find sgml-lib folder
  - 0.8x 3. Cleanup don't work if path of user profile contains russian letters -
            tidy can't find temp files in profile     
            
  - I've just got to the bottom of a silent failure in:
    Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.0.6) Gecko/20060808
    Fedora/1.5.0.6-2.fc5 Firefox/1.5.0.6 pango-text
    HTML Validator: 0.8.3
    Symptoms:
    ---------
    On visiting an invalid page the extension reports "0 Errors/0 Warnings",
    however as root it shows validation errors.

    Investigation:
    ---------

    strace shows the line:
    ---------
    open("/home/steve/.mozilla/firefox/kyr2ulfu.default/tidy/tidy_last_validated.html",
    O_WRONLY|O_CREAT|O_TRUNC, 0666) = -1 EACCES (Permission denied)
    >ls -ld /home/steve/.mozilla/firefox/kyr2ulfu.default/tidy
    >    
    >
    drw-r--r-- 2 steve steve 4096 Aug 19 13:17
    /home/steve/.mozilla/firefox/kyr2ulfu.default/tidy/

    Workaround:
    ---------
    chmod 744 /home/steve/.mozilla/firefox/kyr2ulfu.default/tidy/
    I thought it was a little odd that it needed execute permissions on that
    folder.
    I hope that is of some help, thank you for creating this extension - it
    really has made an immense difference to my working life.
            
- Bug without testcase
  - bug 282847: https://bugzilla.mozilla.org/show_bug.cgi?id=282847 
    
- <td scope="column"> not valid
  There is a accessibility related attribute that one can use 
  when creating HTML tables.
  In other validators it doesn't complain about the "scope" attribute,
  but does in the HTML Validator 0.7.9.
  Can you look into this to make this work correctly?
  Another thing that would be useful would be to be able to push a 
  button or select a menu item to to directly to an editor, or have one 
  built in to the validator itself so we can correct our code.  
  
- J'ai installé tidy_firefox_win_0833.xpi sur Firefox 1.5.0.7 et je n'ai eu
  aucun problème majeur. Tout semble fonctionner parfaitement en ce qui a
  trait à la validation. Je n'ai pas encore essayé 0.833 sur Firefox 2.0 RC2
  mais je vais le faire.

  2 points digne d'être mentionnés:
  a- Le retour à la ligne (linewrap) dans "Code Source de la page" ne
  fonctionne plus.

  Dans about:config, j'ai pourtant:
  view_source.wrap_long_lines  avec la valeur true

  tidy.options.wrap est configuré à 72 caractères.

  b- Le bogue sur <del> et <ins> persiste toujours:
  http://www.gtalbot.org/NvuSection/TestingTidy.html
  
- I apologize for not explaining how switching between
  the Firefox rendering
  engine and the IE rendering engine is done.  It's when
  I use a really neat
  Firefox extension called IE Tab 1.1.1.4
  http://ietab.mozdev.org/ 
    
- Very nice but I would suggest adding the Accessibility Level in the type column next 
  to each entry.  Currently you have to actually select each item to discover what 
  level the warning refers to.  
  
- i'm using Mozilla/5.0 (X11; U; Linux i686; en-US; rv:1.8.1)
   Gecko/20060601 Firefox/2.0 (Ubuntu-edgy)

   Tidy Validator 0.7.9.5

   How to reproduce problem:
      when i type url
      https://wifigw.cis.vutbr.cz/login.php
      and tidy validator is enabled firefox crash (without backtrace - i
      have'nt version with debuging symbols)
   in case tidy validator is disabled page firefox is working normaly..  

- I have a suggestion:
  in the vn mode (validate now) the plugin shouldnt show the following errors
   because Ff causes them:
   br hr img input meta ... tags arent properly colosed.
   The problem is that Ff makes <br> from every <br />, and so on.    
   
- 1. Progress bar height increases each time when a step is added to the
     progress indicator. This makes the progress bar very big (see attached
     image). I'm not sure if this happens only with 1600x1200 resolution.   
     
- Problem with Windows Vista and look of the screen:
 
  I don’t even know if this is an H-V issue or a  firefox issue, but When I double-clicked 
  the H-V tick Icon, on a valid page, the attached window  came up.  The text-overflow 
  on the error-list frame(?) kinda makes it look a bit messy.
  OS: Windows Vista Business RTM
  Firefox: 2.0.  HTML-V 0.8.3.3 (Beta)
  I find your plugin invaluable and I’m not complaining, but if you’re looking for bug reports 
  then I hope this is helpful. 
  
- I installed HTML Validator 0.7.9.5 for Linux today from https://addons.mozilla.org/firefox/249/ . 
  When I logged into my Yahoo mail account (new beta version), Firefox crashed after I typed 
  my username and password. I uninstalled your extension, then logged in Yahoo mail again 
  and all was fine.

  My OS is Fedora Core 6, up to date (with Firefox 1.5.08 from the official repositories). 
  32-bit, Intel CPU. I did what was suggested at item #17 at 
  http://users.skynet.be/mgueury/mozilla/faq.html. I am sending you, attached, the two files.  
  
  : <BEGIN> nsTidyImpl::ResetFilter
  Sun Dec 10 20:49:34 2006
  : <END> nsTidyImpl::ResetFilter
  Sun Dec 10 20:49:34 2006
  : <BEGIN> nsTidyImpl::GetErrorsInHTML
  Sun Dec 10 20:49:34 2006
  : <ARG> aAccessLevel=-1
  Sun Dec 10 20:49:34 2006
  : <ARG> aListConfig=show-warnings yes
  show-errors 6
  indent no
  indent-spaces 2
  uppercase-tags no
  uppercase-attributes no
  wrap 68
  output-xhtml no
  output-html no
  clean no
  doctype auto
  output-encoding utf8
  ...Then HANG...
  
- hi,
  first, let me thank you for providing such a plugin! albeit i do not like  firefox 
  very much, addons like yours make it a great tool for  web-development.
  now me little problem: i use a display w/ 1600x1200 resolution -- and the  font used 
  in the lower right part, "Help", is very small, nearly  unreadable.
  is there an easy way to fix this? I use 0.834 (beta) in linux.   
  
- I've been experiencing this annoying problem ever since the 2.0 release and I still 
  have it in 2.0.0.1. What happens: when I first open FF, for the first few minutes, I can't 
  enter data in any forms without it instead opening the 'find' bar at the bottom, right above 
  the status bar. At first I thought it was only affecting WP forms, but then I noticed it 
  everywhere (except the FF searchbar form up on the menubar).   
  
Beta 0.80 Feedback
------------------
- Hi Marc,

  Well, I took the plunge and tried to figure this one out ...  it's been many 
  years since I had to worry about DLLs and the like, but I found a tool 
  "dependency walker" and pulled up your nstidy.dll in it.  Turns out it was 
  just missing msvcrtd.dll (the debug version).  I managed to track down a 
  version of msvcrtd.dll (6.0.8337.0, don't know if that's the right one) 
  and now things seem to work!!

  Andy
            
Top priority
------------
1) find why xpcom-glue does not compile on MacOSX
2) make a request for the tidy community to change the format
   decide to
   - write like this : 1, arg1, arg2, arg3
   - or have a filter called with the code number

Known problem in other program
------------------------------
Tidy
  - Basically, the Tidy extension doesn't seem to detect a missing </td> before 
    the </tr> at line 128, but it's definitely missing and the HTML is definitely 
    malformed, yet Tidy is saying "0 errors, 0 warnings" to me.
    When I run this though "HTML Tidy for Linux/x86 released on 1st August 2004" 
    A missing <TD> is not seen on line 128 
    Testcase: C:\my_prog\mozilla\src\bug\arrival_php_unseen_error
    Reproduced in 0.58 !
    Reproduced in tidy 24 March 2005 !
    -> This is a known problem in Tidy : BUG 1174233 / ENH 1160584
  - Summary attr is missing from table is reported.  
    Sent a mail to the tidy-dev mailing list
    
Firefox
  - bug 57724 : fixed in mozilla https://bugzilla.mozilla.org/show_bug.cgi?id=57724
  - bug 289947: nsIScriptableUnicodeConverter::ConvertToUnicode is not able to handle error in convertion
                https://bugzilla.mozilla.org/show_bug.cgi?id=289947 
  - bug 294029: XUL listitem with "listitem-iconic" loose his icons when scrolling down or up
                When there are too many frames in a page, the icon in the listbox 
                disappears when scrolling 
                Testcase: file:///C:/my_prog/mozilla/src/bug/2005_04_21_icon_frame/test.html
                https://bugzilla.mozilla.org/show_bug.cgi?id=294029
  - bug 304427: The window is too big when the status bart take more place than the HTML
                Testcase : 2005_07_21_width_window
                http://dale.us/html-tidy-testcase/
                https://bugzilla.mozilla.org/show_bug.cgi?id=204743 
  - bug 317732  tamperdata: adamsplugins@gmail.com
                https://bugzilla.mozilla.org/show_bug.cgi?id=317732
                Hangs in combination with other extension

  
LIST OF QUESTIONS FOR FOSDEM
----------------------------
- How to enable javascript error message in Firefox like in Mozilla
- How to install an extension with a batch file
- Bad tricks in tidyUtils.js
- How to buld a XPI in the make of mozilla    

    
BUG to follow
-------------
Mozilla View source corrupt text:
> http://bugzilla.mozilla.org/show_bug.cgi?id=57724

Ex: http://west-penwith.org.uk/schools.htm 

Mozilla goToLine does not work for the last line.
- follow bug 253905 
  - make the request trunk change
             
- Make my own selection mechanism to jump to the column too.
  To avoid bug 253905.
  
- UMO shows the extension for one platform at a time
  bugzilla bug https://bugzilla.mozilla.org/show_bug.cgi?id=325577
  
The problem with empty script and column number in Tidy    

Rejected ENH
------------
- When hiding an error you should be able to choose whether to hide it for 
  "this instance only", "this page only" or "this site only" or "always". 
  E.g. For warnings such as ensuring animated gifs do not flicker it would be 
  useful to hide the error for each gif that you have checked rather than hiding 
  the warning for all gifs on all URLs

  
REPORTED PROBLEMS
-----------------
rick3@west-penwith.org.uk
- Problem when installing the extension without administrator privileges.
rick3@west-penwith.org.uk
- Can not save cleanup page.
terry.teague
- select a range with the potential error.
- problem with MOOX

Website Redesign
----------------
- More icons
- More portal ...
- See the donate link ...
- Have a mailing list
- http://www.google.com/webmasters/sitemaps/login

  mgueury@gmail.com password: .....1
http://www.associateprograms.com/search/adsense.shtml