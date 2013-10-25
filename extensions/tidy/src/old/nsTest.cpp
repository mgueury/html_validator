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
 *   Marc Gueury <mgueury@skynet.be>
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

//--------------------------------------------------------------------------
//                           I N C L U D E
//--------------------------------------------------------------------------

#include <stdio.h>
#include <string.h>


// For firefox 1.1
// #define MOZILLA_STRICT_API 1

extern "C"
{
#include "buffio.h"
#include "lexer.h"
#include "tidy.h"
#include "tidy-int.h"
#include "tmbstr.h"
#include "translation.h"
}

#include "nsTidy.h"
#include "nsMemory.h"
#include "nsEmbedString.h"
#include "links.h"
#include "nsIClassInfoImpl.h"

//--------------------------------------------------------------------------
//                            D E F I N E
//--------------------------------------------------------------------------

#define max(a,b) ((a)>(b)?(a):(b))
#define min(a,b) ((a)<(b)?(a):(b))
#define SIZE_STRING 4096

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

/**
 * Constructor
 */
nsTidyImpl::nsTidyImpl()
{
  mBaseUrl = TY_(tmbstrdup)(TALLOC, "" );
}

/**
 * Destructor
 */
nsTidyImpl::~nsTidyImpl()
{
  free( mBaseUrl ); // TidyFree( ( TALLOC, mBaseUrl );
}

NS_IMPL_CLASSINFO(nsTidyImpl, NULL, 0, NS_TIDY_CID)
NS_IMPL_ISUPPORTS1_CI(nsTidyImpl, nsITidy)
// Removed ";" for Linux 64

/**
 * GetLibraryVersion
 */
NS_IMETHODIMP nsTidyImpl::GetLibraryVersion(PRInt32 *aVersion)
{
  *aVersion = 20100903;
  return NS_OK;
}

/**
 * Copy a string and reallocate it with the memory allocator of Firefox
 */
char * nsTidyImpl::MozStrdup( const char * utf8_str )
{
  return (char*)nsMemory::Clone(utf8_str, strlen(utf8_str) + 1);
}

/**
 * GetErrorsInHTML
 *
 * @param aHtml            : HTML string to be analysed
 * @param aAccessLevel     : level of accessibility (ex: blind) : 0->3
 * @param aError           : out - errors
 * @param aNbError         : number of errors
 * @param aNbWarning       : number of warnings
 * @param aNbAccessWarning : number of accessibility warnings
 */
NS_IMETHODIMP nsTidyImpl::GetErrorsInHTML(const nsACString& aHtml, const char *aListConfig, PRInt32 aAccessLevel, nsACString& aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::GetErrorsInHTML" );
  mDiagLog.log( "<END> nsTidyImpl::GetErrorsInHTML" );
  return NS_OK;
}

/**
 * CleanupHTML
 *
 * @param aHtml            : HTML string to be analysed
 * @param aAccessLevel     : level of accessibility (ex: blind) : 0->3
 * @param aCleanupHTML     : out - errors
 */
NS_IMETHODIMP nsTidyImpl::CleanupHTML(const nsACString& aHtml, const char *aListConfig, PRInt32 aAccessLevel, nsACString& aCleanupHTML )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::CleanupHTML" );
  mDiagLog.log( "<END> nsTidyImpl::CleanupHTML" );
  return NS_OK;
}

/**
 * GetErrorsAndLinks
 *
 * @param aHtml            : HTML string to be analysed
 * @param aAccessLevel     : level of accessibility (ex: blind) : 0->3
 * @param aError           : out - errors
 * @param aNbError         : number of errors
 * @param aNbWarning       : number of warnings
 * @param aNbAccessWarning : number of accessibility warnings
 * @param
 */

NS_IMETHODIMP nsTidyImpl::GetLinks(const nsACString& aHtml, const char *aListConfig, PRInt32 aAccessLevel, nsACString& aLinks, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::GetErrorsAndLinks" );
  mDiagLog.log( "<ARG> aAccessLevel=%d",aAccessLevel );
  mDiagLog.log( "<ARG> aListConfig=%s",aListConfig );
  mDiagLog.log( "<END> nsTidyImpl::GetErrorsAndLinks" );
  return NS_OK;
}

/**
 * SetConfig
 *
 * @param aListConfig      : List of the configuration options "name" space "value\n"
 */
NS_IMETHODIMP nsTidyImpl::SetConfig( TidyDoc tdoc, const char *aListConfig )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::SetConfig" );
  mDiagLog.log( "<END> nsTidyImpl::SetConfig" );
  return NS_OK;
}

/**
 * GetConfig
 *
 * @param aListConfig      : List of the configuration option "name" space "value"
 */
NS_IMETHODIMP nsTidyImpl::GetConfig( char **aListConfig )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::GetConfig" );
  mDiagLog.log( "<END> nsTidyImpl::GetConfig" );
  return NS_OK;
}

/**
 * AnalyzeLine
 *
 * @param aError    : the line with the error/warning
 * @param aErrorId  : the ID of the error
 * @param aArg1     : the argument 1 of the error
 * @param aArg2     : the argument 2 of the error
 */

NS_IMETHODIMP nsTidyImpl::AnalyzeLine( const nsACString& aError, PRInt32 * aLine, PRInt32 * aColumn, PRInt32 * aType, char** aText, PRInt32 * aErrorId, char** aArg1, char** aArg2, char** aArg3 )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::AnalyzeLine" );
  mDiagLog.log( "<END_1> nsTidyImpl::AnalyzeLine" );
  // not found
  return NS_OK;
}

/**
 * GetErrorDescription
 *
 * @param aErrorId    : Id of the error
 * @param aErrorDesc  : Text of the error (with ... replacing all attributes)
 */
NS_IMETHODIMP nsTidyImpl::GetErrorDescription( PRInt32 aErrorId, nsACString& aErrorDesc )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::GetErrorDescription" );
  mDiagLog.log( "<END> nsTidyImpl::GetErrorDescription" );
  return NS_OK;
}

/**
 * GetIdOfAllErrors
 *
 * @param aErrorId    : Id of the error
 * @param aErrorList  : a comma separated list with all message id in tidy
 */
NS_IMETHODIMP nsTidyImpl::GetIdOfAllErrors( char ** aErrorList )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::GetIdOfAllErrors" );
  mDiagLog.log( "<END> nsTidyImpl::GetIdOfAllErrors" );
  return NS_OK;
}

/**
 * Init Diagnostics logging and Enable debugging
 */
NS_IMETHODIMP nsTidyImpl::InitDiagLog(const nsACString& aDir, PRInt32 bDebug )
{
  const char * utf8_dir = NULL;
  NS_CStringGetData(aDir, &utf8_dir);

  mDiagLog.init( utf8_dir, bDebug );
  return NS_OK;
}

/**
 * Log a message
 */
NS_IMETHODIMP nsTidyImpl::Log(const nsACString& aMsg)
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::Log" );
  mDiagLog.log( "<END> nsTidyImpl::Log" );
  return NS_OK;
}

/**
 * Add a translation
 */
NS_IMETHODIMP nsTidyImpl::InitTranslation(PRInt32 *_retval)
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::InitTranslation" );
  mDiagLog.log( "<END> nsTidyImpl::InitTranslation" );
  return NS_OK;
}

/**
 * Add a translation
 */
NS_IMETHODIMP nsTidyImpl::AddTranslations( const nsACString & aTranslation )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::AddTranslation" );
  mDiagLog.log( "<END> nsTidyImpl::AddTranslation" );
  return NS_OK;
}

/**
 * FilterMsg
 */
NS_IMETHODIMP nsTidyImpl::FilterMsg(PRInt32 aCode )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::FilterMsg" );
  mDiagLog.log( "<END> nsTidyImpl::FilterMsg" );
  return NS_OK;
}

/**
 * ResetFilter
 */
NS_IMETHODIMP nsTidyImpl::ResetFilter()
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::ResetFilter" );
  mDiagLog.log( "<END> nsTidyImpl::ResetFilter" );
  return NS_OK;
}

/**
 * SetTranslationPrefix
 */
NS_IMETHODIMP nsTidyImpl::SetTranslationPrefix( const nsACString & aPrefix, const nsACString & aLineCol )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::SetTranslationPrefix" );
  mDiagLog.log( "<END> nsTidyImpl::SetTranslationPrefix" );
  return NS_OK;
}

/**
 * Check translation
 */
NS_IMETHODIMP nsTidyImpl::CheckTranslation()
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::CheckTranslation" );
  mDiagLog.log( "<END> nsTidyImpl::CheckTranslation" );
  return NS_OK;
}

/**
 * PrintEnglishTranslation
 */
NS_IMETHODIMP nsTidyImpl::PrintEnglishTranslation()
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::PrintEnglishTranslation" );
  mDiagLog.log( "<END> nsTidyImpl::PrintEnglishTranslation" );
  return NS_OK;
}
