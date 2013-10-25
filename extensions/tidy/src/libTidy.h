/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef __LIB_TIDY_H
#define __LIB_TIDY_H

#include "diaglog.h"


//--------------------------------------------------------------------------
//                            D E F I N E
//--------------------------------------------------------------------------

#define PRInt32 int
#define NS_IMETHODIMP bool
#define NS_OK 1

#ifdef WIN32
#define DllExport  extern __declspec( dllexport )
#else
#define DllExport  extern
#endif

//--------------------------------------------------------------------------
//                         F U N C T I O N S
//--------------------------------------------------------------------------

extern void libTidyCopyString( char ** dest, const char * source );

extern "C"
{
	DllExport NS_IMETHODIMP libTidyGetLibraryVersion( PRInt32 *aVersion);
	DllExport NS_IMETHODIMP libTidyGetErrorsInHTML(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
	DllExport NS_IMETHODIMP libTidyCleanupHTML(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aCleanupHTML );
	DllExport NS_IMETHODIMP libTidyGetLinks(const char *aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aLinks, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
	DllExport NS_IMETHODIMP libTidyGetErrorDescription( PRInt32 aErrorId, char ** aErrorDesc );
	DllExport NS_IMETHODIMP libTidyGetIdOfAllErrors( char ** aErrorList );
	DllExport NS_IMETHODIMP libTidyInitDiagLog(const char * aDir, PRInt32 bDebug );
	DllExport NS_IMETHODIMP libTidyLog(const char * aMsg);
	DllExport NS_IMETHODIMP libTidyInitTranslation(PRInt32 *_retval);
	DllExport NS_IMETHODIMP libTidyAddTranslations( const char * aTranslation );
	DllExport NS_IMETHODIMP libTidyFilterMsg(PRInt32 aCode );
	DllExport NS_IMETHODIMP libTidyResetFilter();
	DllExport NS_IMETHODIMP libTidySetTranslationPrefix( const char * aPrefix, const char * aLineCol );
	DllExport NS_IMETHODIMP libTidyCheckTranslation();
	DllExport NS_IMETHODIMP libTidyPrintEnglishTranslation();
	DllExport NS_IMETHODIMP libTidySpInit(const char * aSgmlLibPath, const char * aXmlLibPath );
	DllExport NS_IMETHODIMP libTidySpGetErrorsInHTML(const char * aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden );
	DllExport NS_IMETHODIMP libTidyFree(char * ptr );

	NS_IMETHODIMP libTidySetConfig( TidyDoc tdoc, const char *aListConfig );
	NS_IMETHODIMP libTidyGetConfig( char **aListConfig );
	NS_IMETHODIMP libTidyAnalyzeLine( const char * aError, PRInt32 * aLine, PRInt32 * aColumn, PRInt32 * aType, char** aText, PRInt32 * aErrorId, char** aArg1, char** aArg2, char** aArg3 );

}

int libTidySpIsXhtml( const char * utf8_html );


/*
class nsTidyImpl
{
public:
    nsTidyImpl();
    ~nsTidyImpl();

private:
    NS_IMETHODIMP SetConfig( TidyDoc tdoc, const char *aListConfig );
    int SpIsXhtml( const char * utf8_html );
//    char * MozStrdup( const char * utf8_str );
};
*/

extern char * mBaseUrl;

#endif // __LIB_TIDY_H
