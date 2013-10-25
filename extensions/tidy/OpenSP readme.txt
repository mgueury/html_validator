//////////////////////////////////////////////////////////////////////////////////////
  OPEN SP COMPILATION
//////////////////////////////////////////////////////////////////////////////////////

BACKUP

1) copy firefox/mozilla/extension/tidy -> tidy.004
2) remove the directory opensp
   XXXX lost spvalid.exe !
3) unzip opensp_1_5_branch.zip
4) rename opensp_1_5_branch to opensp
5) remove C:\my_prog\mozilla\src\firefox\mozilla\extensions\tidy\spvalid\osp152.lib
   -> will point to the real one next time

PRECOMPILATION TASK

1) Download OpenSP from cvs

set CVS_RSH=ssh
cvs -d:pserver:anonymous@cvs.sourceforge.net:/cvsroot/openjade login 
cvs -d:pserver:anonymous@cvs.sourceforge.net:/cvsroot/openjade co -r opensp_1_5_branch -d opensp_1_5_branch sp 

2) Correction to make the compilation work 

correct this at the top of mssgen.pl (maybe configure would make the trick too?)

------------------------------------------------------
# Copyright (c) 1994 James Clark
# Copyright (c) 2000 Peter Nilsson
# See the file COPYING for copying permission.

use POSIX;

# Package and version.
$package = 'OPENSP';
$version = '1.5.2';
------------------------------------------------------

cd C:\my_prog\mozilla\src\firefox\mozilla\extensions\tidy\opensp
unix2dos SP.dsw
unix2dos lib/lib.dsp
unix2dos nsgmls/nsgmls.dsp
unix2dos sgmlnorm/sgmlnorm.dsp
unix2dos spam/spam.dsp
unix2dos spent/spent.dsp
unix2dos sx/sx.dsp
unix2dos spcat/spcat.dsp

-------------------------------------------------------

Correct content of ns

-------------------------------------------------------

3) compiling

4) readd the opensp/lib/open_static.dsp project in the project
   readd the opensp/sp.dsw in the project   

> build-win32.bat
or 
> msdev SP.dsw /make "osp_static - win32 release"


------------------------------------------------------------------------------------------------------------------------
BUG
------------------------------------------------------------------------------------------------------------------------

set SP_CHARSET_FIXED=NO
set SP_ENCODING=UTF-8
set SP_BCTF=UTF-8
define SP_WIDE_SYSTEM 

c:/www/opensp/onsgmls.exe -n -c C:\www\validator\htdocs\sgml-lib\sgml.soc -wvalid -wnon-sgml-char-ref -wno-duplicate -E0 c:\temp\propriétaire\valid.html > out.txt 

c:/www/opensp/onsgmls.exe:554586320.2201:E: cannot open "c:\temp\propriï¿½taire\valid.html" (No such file or directory)

------------------------------------

-> The problem seems to be that the filename sent is not in UTF8 

Why :

What happens is that OpenSP use the codingSystem for the file and the filename:
- The file is UTF8
- The filename is in SystemCharset (OpenSP think it is UTF8 too)
When starting, 
- the filename is changed from UTF8 to the internal charset of OpenSP
- the file is changed from UTF8 to the internal charset of OpenSP
When loading a file, 
- the filename is changed to the internal charset to UTF8 
  But this filename is wrong since the encryption is wrong. And file.open expect a name in SystemCharset
-> error

The change does this:
- add a new codingSystem : identity
- and use it for the input of the command line (this make the conversion from Command line to internal charset)
- and for the PosixStorageManager (File Storage Manager) (this make the conversion from internal charset to file.open) 



------------------------------------

Problem fix:
------------

include/CmdLineApp.h-50-  void usage();
include/CmdLineApp.h-51-  const CodingSystem *codingSystem();
include/CmdLineApp.h:52:  // MGUEURY
include/CmdLineApp.h-53-  const CodingSystem *fileCodingSystem();
include/CmdLineApp.h-54-  const CodingSystem *outputCodingSystem();
--
include/CmdLineApp.h-93-  const CodingSystem *lookupCodingSystem(const AppChar *codingName);
include/CmdLineApp.h-94-  const CodingSystem *codingSystem_;
include/CmdLineApp.h:95:  // MGUEURY
include/CmdLineApp.h-96-  const CodingSystem *fileCodingSystem_;
include/CmdLineApp.h-97-};
--
include/CmdLineApp.h-113-}
include/CmdLineApp.h-114-
include/CmdLineApp.h:115:// MGUEURY
include/CmdLineApp.h-116-inline
include/CmdLineApp.h-117-const CodingSystem *CmdLineApp::fileCodingSystem()
--
lib/CmdLineApp.cxx-525-    codingSystem_ = codingSystemKit_->identityCodingSystem();
lib/CmdLineApp.cxx-526-
lib/CmdLineApp.cxx:527:  // MGUEURY
lib/CmdLineApp.cxx-528-  fileCodingSystem_ = codingSystemKit_->identityCodingSystem();
lib/CmdLineApp.cxx-529-}
--
lib/CmdLineApp.cxx-557-    str += Char(s[i]);
lib/CmdLineApp.cxx-558-#else
lib/CmdLineApp.cxx:559:  // MGUEURY
lib/CmdLineApp.cxx-560-  StringC str(fileCodingSystem_->convertIn(s));
lib/CmdLineApp.cxx-561-#endif
--
lib/EntityApp.cxx-110-                        &systemCharset(),
lib/EntityApp.cxx-111-#ifndef SP_WIDE_SYSTEM
lib/EntityApp.cxx:112:                            // MGUEURY
lib/EntityApp.cxx-113-                        fileCodingSystem(),
lib/EntityApp.cxx-114-                        // codingSystem(),



------------------------------------------

Problem is not finished....

I think more and more that I need
- SP_WIDE_SYSTEM
- It does not work with users with name like the one given here:
  http://www.htmlpedia.org/phpBB/viewtopic.php?f=9&t=7

- Interesting articles : 
  http://msdn.microsoft.com/library/default.asp?url=/library/en-us/intl/unicode_2bj9.asp
  http://msdn.microsoft.com/library/default.asp?url=/library/en-us/intl/unicode_17si.asp

MultiByteToWideChar(CP_UTF8, 0, pInput, -1, pOutput, nLen);

void FromUTF8(LPBYTE pUTF8) {
    WCHAR wszResult[MAX_CHAR+1];
    DWORD dwResult = MAX_CHAR;

    int iRes = MultiByteToWideChar(CP_UTF8,
                  0,
                  (LPCSTR)pUTF8,
                  -1,
                  wszResult,
                  dwResult);

    if (iRes == 0) {
        DWORD dwErr = GetLastError();
        printf("MultiByteToWideChar() failed - > %d\n", dwErr);
    } else {
        printf("MultiByteToWideChar() returned "
               "%s (%d) wide characters\n",
               wszResult,
               iRes);
    }
}

void main() {
    // Get Unicode for 0x5c; should be '\'.
    BYTE pUTF8_1[] = {0x5C};
    FromUTF8( pUTF8_1 );

    // Get Unicode for 0xC0 0xAF. 
    // Should fail because this is 
    // an overlong '/'.
    BYTE pUTF8_2[] = {0xC0, 0xAF};
    FromUTF8( pUTF8_2 );

    // Get Unicode for 0xC2 0xA9; should be 
    // a '©' symbol.
    BYTE pUTF8_3[] = {0xC2, 0xA9};
    FromUTF8( pUTF8_3 );
}

-------------------------------------------------

0) Added SP_WIDE_SYTEM in the project of ospstatic project

1) in Dialog.cpp
   - created a function utf8ToUtf16
   - created a function openUtf8Filename 

2) in nstidy.idl
    void initDiagLog( in string aDir, in PRInt32 bDebug );
    void spInit(in string aSgmlLibPath,in string aXmlLibPath );

    void initDiagLog( in AUTF8String aDir, in PRInt32 bDebug );
    void spInit(in AUTF8String aSgmlLibPath,in AUTF8String aXmlLibPath );

3) in dialog.cpp, nsOpenSP.cpp change

       if( (f=fopen(m_sDiagFileName,"a")==0 )       
       if( (f=openUtf8Filename(m_sDiagFileName,"a")==0 )
       
4) Added in Makefile and Makefile.in

#XXXXXXXXXXXXXXXXXXXXX WINDOWS ONLY XXXXXXXXXXXXXXXXXXXXXXXXXXX TODO TODO
DEFINES         += -DSP_WIDE_SYSTEM

5) in SpValid.cpp

#ifdef WIN32
  extern int spvalid( int argc, unsigned short **argv, SpResult * res );
  extern int spValidMem( int argc, unsigned short **argv, SpResult * res, nsACString& aError );
#else
  extern int spvalid( int argc, char **argv, SpResult * res );
  extern int spValidMem( int argc, char **argv, SpResult * res, nsACString& aError );
#endif

-------------------------------------------------------------------------

Final Solution
--------------
set SP_CHARSET_FIXED=NO
set SP_ENCODING=UTF-8
set SP_BCTF=UTF-8
# On Windows only
define SP_WIDE_SYSTEM 


