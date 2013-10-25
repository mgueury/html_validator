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
  // free( mBaseUrl ); // TidyFree( ( TALLOC, mBaseUrl );
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
  mDiagLog.log( "<ARG> aAccessLevel=%d",aAccessLevel );
  mDiagLog.log( "<ARG> aListConfig=%s",aListConfig );

  TidyBuffer errbuf;
  char buffer[256];
  int rc = -1;
  nsresult rv = NS_OK;

  const char * utf8_html = NULL;
  NS_CStringGetData(aHtml, &utf8_html);
  if( mDiagLog.m_bDebug )
  {
    mDiagLog.writeHtml( utf8_html );
  }

  tidyBufInit( &errbuf );
  TidyDoc tdoc = tidyCreate();                     // Initialize "document"
  tidySetCharEncoding( tdoc, "utf8" );
  SetConfig( tdoc, aListConfig );
  tidyOptParseValue(tdoc, "tab-size", "1" );
  tidyOptSetInt( tdoc, TidyAccessibilityCheckLevel, aAccessLevel );

  mDiagLog.log( "<STEP1>" );

  rc = tidySetErrorBuffer( tdoc, &errbuf );        // Capture diagnostics
  if ( rc >= 0 )
    rc = tidyParseString( tdoc, utf8_html );     // Parse the input
  if ( rc >= 0 )
    rc = tidyCleanAndRepair( tdoc );             // Tidy it up!

  mDiagLog.log( "<STEP2>" );
  TidyDocImpl * doc = tidyDocToImpl( tdoc );

  // XXXXXXXXXX if( aAccessLevel>=0 )
  if( aAccessLevel>0 )
  {
    if ( rc >= 0 )
    {
      TY_(AccessibilityChecks)( doc );
      rc = tidyDocStatus( doc );
      //tidyRunDiagnostics( tdoc );              // Accessibility + more info
    }
  }

  mDiagLog.log( "<STEP3>" );

  if ( rc >= 0 )
  {
    TY_(ReportMarkupVersion)(doc);
    *aNbError = tidyErrorCount (tdoc);
    *aNbWarning = tidyWarningCount (tdoc);
    *aNbAccessWarning  = tidyAccessWarningCount( tdoc );
    *aNbHidden  = tidyHiddenCount( tdoc );
  }

  if ( rc >= 0 )
  {
    // printf( "\nDiagnostics:\n\n%s", errbuf.bp );
    if( errbuf.size > 0 )
    {
      rv = NS_CStringSetData( aError, (const char *)errbuf.bp );
    }
    else
    {
      rv = NS_CStringSetData( aError, "-" );
    }
  }
  else
  {
    sprintf( buffer, "Tidy: A severe error (%d) occurred.\n\0", rc );
    rv = NS_CStringSetData( aError, buffer );
  }

  tidyBufFree( &errbuf );
  tidyRelease( tdoc );

  mDiagLog.log( "<END> nsTidyImpl::GetErrorsInHTML" );
  return rv;
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

  TidyBuffer output;
  TidyBuffer errbuf;
  char buffer[256];
  int rc = -1;
  nsresult rv = NS_OK;

  const char * utf8_html = NULL;
  NS_CStringGetData(aHtml, &utf8_html);
  if( mDiagLog.m_bDebug )
  {
    mDiagLog.writeHtml( utf8_html );
  }

  tidyBufInit( &output );
  tidyBufInit( &errbuf );
  TidyDoc tdoc = tidyCreate();                   // Initialize "document"
  tidySetCharEncoding( tdoc, "utf8" );
  SetConfig( tdoc, aListConfig );
  tidyOptParseValue(tdoc, "tab-size", "1" );
  tidyOptParseValue(tdoc, "tidy-mark", "no" );

  rc = tidySetErrorBuffer( tdoc, &errbuf );      // Capture diagnostics
  if ( rc >= 0 )
    rc = tidyParseString( tdoc, utf8_html );   // Parse the input
  if ( rc >= 0 )
    rc = tidyCleanAndRepair( tdoc );           // Tidy it up!
  if ( rc >= 0 )
    rc = tidyRunDiagnostics( tdoc );           // Kvetch
  if ( rc > 1 )                                  // If error, force output.
    rc = ( tidyOptSetBool(tdoc, TidyForceOutput, yes) ? rc : -1 );
  if ( rc >= 0 )
  {
    rc = tidySaveBuffer( tdoc, &output );      // Pretty Print
    ctmbstr outfil = tidyOptGetValue( tdoc, TidyOutFile );
    if ( outfil )
    {
      char * basefil = TY_(tmbstrdup)( TALLOC, outfil );
      char * pos = strstr( basefil, "tidy_cleanup.html" );
      strcpy( pos, "tidy_base.html\0" );

      rc = tidySaveFile( tdoc, outfil );

      if( strlen(mBaseUrl)>0 )
      {
        // Add a base tag in the HTML header
        // And save the file a second time.
        Node * content;
        TidyDocImpl * doc = tidyDocToImpl( tdoc );
        Node * html = TY_(FindHTML)( doc );
        if( html )
        {
          for ( content = html->content; content; content = content->next )
          {
            if( content->element!=NULL && strcmp( content->element, "head" )==0 )
            {
              Node * node = TY_(NewNode)( TALLOC, NULL );
              node->type = StartEndTag;
              node->element = TY_(tmbstrdup)( TALLOC, "base" );
              TY_(AddAttribute)( doc, node, (ctmbstr)"href", (ctmbstr)mBaseUrl );
              node->next = content->content;
              content->content = node;
              break;
            }
          }
        }
        rc = tidySaveFile( tdoc, basefil);
      }
      // free( basefil ); // TidyFree( ( TALLOC, basefil );
    }

  }

  if ( rc >= 0 )
  {
    if( output.size>0 )
    {
      rv = NS_CStringSetData( aCleanupHTML, (const char *)output.bp );
    }
    else
    {
      rv = NS_CStringSetData( aCleanupHTML, "Tidy: no output" );
    }
  }
  else
  {
    sprintf( buffer, "Tidy: A severe error (%d) occurred.\n", rc );
    rv = NS_CStringSetData( aCleanupHTML, buffer );
  }

  tidyBufFree( &output );
  tidyBufFree( &errbuf );
  tidyRelease( tdoc );

  mDiagLog.log( "<END> nsTidyImpl::CleanupHTML" );
  return rv;
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

  TidyBuffer output;
  TidyBuffer errbuf;
  // char buffer[256];
  int rc = -1;
  nsresult rv = NS_OK;

  const char * utf8_html = NULL;
  NS_CStringGetData(aHtml, &utf8_html);
  if( mDiagLog.m_bDebug )
  {
    mDiagLog.writeHtml( utf8_html );
  }

  tidyBufInit( &output );
  tidyBufInit( &errbuf );
  TidyDoc tdoc = tidyCreate();                     // Initialize "document"
  tidySetCharEncoding( tdoc, "utf8" );
  SetConfig( tdoc, aListConfig );
  tidyOptParseValue(tdoc, "tab-size", "1" );
  tidyOptSetInt( tdoc, TidyAccessibilityCheckLevel, aAccessLevel );

  mDiagLog.log( "<STEP1>" );

  rc = tidySetErrorBuffer( tdoc, &errbuf );        // Capture diagnostics
  if ( rc >= 0 )
    rc = tidyParseString( tdoc, utf8_html );       // Parse the input
  if ( rc >= 0 )
    rc = tidyCleanAndRepair( tdoc );               // Tidy it up!

  mDiagLog.log( "<STEP2>" );

  if( aAccessLevel>=0 )
  {
    if ( rc >= 0 )
      tidyRunDiagnostics( tdoc );              // Accessibility + more info
  }

  mDiagLog.log( "<STEP3>" );

  if ( rc >= 0 )
  {
    *aNbError = tidyErrorCount (tdoc);
    *aNbWarning = tidyWarningCount (tdoc);
    *aNbAccessWarning  = tidyAccessWarningCount( tdoc );
    *aNbHidden  = tidyHiddenCount( tdoc );

    mDiagLog.log( "<STEP4>" );
    tidyGetLinks( tdoc, &output );
  }
  mDiagLog.log( "<STEP5>" );

  if ( rc >= 0 )
  {
    if( output.size>0 )
    {
      rv = NS_CStringSetData( aLinks, (const char *)output.bp );
    }
    else
    {
      rv = NS_CStringSetData( aLinks, "" );
    }
  }
  else
  {
    mDiagLog.log( "Tidy: A severe error (%d) occurred.\n", rc );
  }
  mDiagLog.log( "<STEP6>" );
  tidyBufFree( &errbuf );
  tidyBufFree( &output );
  tidyRelease( tdoc );

  mDiagLog.log( "<END> nsTidyImpl::GetErrorsAndLinks" );
  return rv;
}

/**
 * SetConfig
 *
 * @param aListConfig      : List of the configuration options "name" space "value\n"
 */
NS_IMETHODIMP nsTidyImpl::SetConfig( TidyDoc tdoc, const char *aListConfig )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::SetConfig" );

  char * next_pos = (char *) aListConfig;
  char sName[SIZE_STRING];
  char sValue[SIZE_STRING];

  do
  {
    char * start_pos = next_pos;
    next_pos = strchr( next_pos+1, ' ' );
    if( next_pos!=NULL )
    {
      int size = min(next_pos-start_pos,SIZE_STRING-1);
      strncpy( sName, start_pos, size );
      sName[size] = 0;
      next_pos++;
      char * start_pos = next_pos;
      next_pos = strchr( next_pos, '\n' );
      if( next_pos!=NULL )
      {
        size = min(next_pos-start_pos,SIZE_STRING-1);
        strncpy( sValue, start_pos, size );
        sValue[size] = 0;
        next_pos++;
        // printf( "name: %s, value: %s\n", sName, sValue );
        if( strcmp( sName, "base-url" )==0 )
        {
          // free( mBaseUrl ); // TidyFree( ( TALLOC, mBaseUrl );
          mBaseUrl = TY_(tmbstrdup)( TALLOC, sValue );
        }
        else
        {
          tidyOptParseValue(tdoc, sName, sValue );
        }
      }
    }
  }
  while( next_pos!=NULL && next_pos[0]!=0 );

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

  char line[512];
  char optbuf[16000];
  optbuf[0] = 0;

  TidyDoc tdoc = tidyCreate();
  TidyIterator pos = tidyGetOptionList( tdoc );

  while ( pos )
  {
    TidyOption topt = tidyGetNextOption( tdoc, &pos );
    TidyOptionId optId = tidyOptGetId( topt );
    TidyOptionType optTyp = tidyOptGetType( topt );

    Bool bval = no;
    ctmbstr sval = NULL;
    uint ival = 0;

    tmbstr name = (tmbstr) tidyOptGetName( topt );

    tmbstr type = "String";
    tmbchar tempvals[80] = {0};
    tmbstr vals = &tempvals[0];

    /* Handle special cases first.
    */
    switch ( optId )
    {
    case TidyIndentContent:
#if SUPPORT_UTF16_ENCODINGS
    case TidyOutputBOM:
#endif
      type = "AutoBool";
      vals = (tmbstr) tidyOptGetCurrPick( tdoc, optId );
      break;

    case TidyDuplicateAttrs:
      type = "enum";
      vals = (tmbstr) tidyOptGetCurrPick( tdoc, optId );
      break;

    case TidyDoctype:
      sval = (tmbstr) tidyOptGetCurrPick( tdoc, TidyDoctypeMode );
      type = "DocType";
      if ( !sval || *sval == '*' )
          sval = (tmbstr) tidyOptGetValue( tdoc, TidyDoctype );
      vals = (tmbstr) sval;
      break;

    case TidyCSSPrefix:
      type = "Name";
      vals = (tmbstr) tidyOptGetValue( tdoc, TidyCSSPrefix );
      break;

    case TidyInlineTags:
    case TidyBlockTags:
    case TidyEmptyTags:
    case TidyPreTags:
      {
        TidyIterator pos = tidyOptGetDeclTagList( tdoc );
        type = "Tag names";
        while ( pos )
        {
          vals = (tmbstr) tidyOptGetNextDeclTag(tdoc, optId, &pos);
          if ( pos )
          {
            TY_(tmbsnprintf)(line, 512, "%s %s\n", name, vals );
            strcat( optbuf, line );
            name = "";
            type = "";
          }
        }
      }
      break;

    case TidyCharEncoding:
    case TidyInCharEncoding:
    case TidyOutCharEncoding:
      type = "Encoding";
      sval = tidyOptGetEncName( tdoc, optId );
      vals = (tmbstr) sval;
      break;

    case TidyNewline:
      type = "enum";
      vals = (tmbstr) tidyOptGetCurrPick( tdoc, optId );
      break;

    /* General case will handle remaining */
    default:
      switch ( optTyp )
      {
      case TidyBoolean:
        type = "Boolean";   /* curr pick handles inverse */
        vals = (tmbstr) tidyOptGetCurrPick( tdoc, optId );
        break;

      case TidyInteger:
        type = "Integer";
        ival = tidyOptGetInt( tdoc, optId );
        sprintf( tempvals, "%d", ival );
        break;

      case TidyString:
        type = "String";
        vals = (tmbstr) tidyOptGetValue( tdoc, optId );
        break;
      }
    }

    /* fix for http://tidy.sf.net/bug/873921 */
    if ( *name || *type || (vals && *vals) )
    {
      if ( ! vals )
        vals = "";
      TY_(tmbsnprintf)(line, 512, "%s %s\n", name, vals );
      strcat( optbuf, line );
    }
  }

  tidyRelease( tdoc );

  *aListConfig = MozStrdup( optbuf );

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

  // example: "line 123 column 456 - Warning: 111 invalid character code 222" );
  // aLine = 123
  // aColumn = 456
  // aErrorId = id of the error 40
  // aArg1 = 111
  // aArg2 = 222
  // aArg3 =
  ctmbstr fmt, next_pos, sError;
  char s[256];
  int pos_arg[16];
  int beg_seg[16];
  int end_seg[16];
  int nbArg, len;
  const char * utf8_error;
  NS_CStringGetData(aError, &utf8_error);
  mDiagLog.log( "<ARG> aError: %s", utf8_error );

  /* This is done in Javascript
  *aLine = -1;
  *aColumn = -1;
  *aType = -1;
  *aErrorId = -1;
  *aText = MozStrdup( "" );
  *aArg1 = MozStrdup( "" );
  *aArg2 = MozStrdup( "" );
  *aArg3 = MozStrdup( "" );
  */

  // Avoid buffer overflow
  if( utf8_error==NULL || strlen(utf8_error)>=256 )
  {
    mDiagLog.log( "<END_5> nsTidyImpl::AnalyzeLine" );
    return NS_OK;
  }

  ////
  //// Step 1 : look for the line number, column number
  ////
  int res = sscanf( utf8_error, gLineColumnFormat, aLine, aColumn );
  if( res<2 )
  {
    if( (next_pos=strstr( utf8_error, msgPrefix[TidyInfo].prefix))!=NULL )
      {
        *aType = TidyInfo;
        sError = next_pos + strlen(msgPrefix[TidyInfo].prefix);
        *aText = MozStrdup( sError );
        return NS_OK;
    }
    mDiagLog.log( "<END_4> nsTidyImpl::AnalyzeLine" );
    return NS_OK;
  }

  ////
  //// Step 2 : look for the error message
  ////
  if( (next_pos=strstr( utf8_error, msgPrefix[TidyError].prefix))!=NULL )
  {
    *aType = TidyError;
    sError = next_pos + strlen(msgPrefix[TidyError].prefix);
  }
  else  if( (next_pos=strstr( utf8_error, msgPrefix[TidyWarning].prefix))!=NULL )
  {
    *aType = TidyWarning;
    sError = next_pos + strlen(msgPrefix[TidyWarning].prefix);
  }
  else  if( (next_pos=strstr( utf8_error, msgPrefix[TidyAccess].prefix))!=NULL )
  {
    *aType = TidyAccess;
    sError = next_pos + strlen(msgPrefix[TidyAccess].prefix);
  }
  else
  {
    mDiagLog.log( "<END_3> nsTidyImpl::AnalyzeLine" );
    return NS_OK;
  }
  *aText = MozStrdup( sError );

  ////
  //// Step 2 : find the error id
  ////

  // Loop in all the possible warning/error messages (see localize.c)
  // Cut the message at each %s, and build substring
  // See if all the substrings are in the error.
  // If yes, the error is found, then find the arguments for it.
  // It looks like there are 2 arguments  maximums. (I will begin with that)

  for( int i=0; msgFormat[i].fmt; ++i)
  {
    // nbArg : number of %s in the original string
    nbArg = 0;

    // fmt : original string
    fmt = (msgFormat[i].translation?msgFormat[i].translation:msgFormat[i].fmt);
    // printf( "i: %d, fmt : %s\n", i, fmt );

    // store the position of the %s in pos_arg
    next_pos = strstr( fmt, "%s" );
    while( next_pos )
    {
      pos_arg[nbArg++] = next_pos - fmt;
      next_pos += 2;
      next_pos = strstr( next_pos, "%s" );
    }

    // cut the original string in substring before and after each '%s'
    // then try to find the position of the substring in the original string
    // if all the substring are found, I guess the error is matching.
    bool isMatching = true;
    int begin=0;
    // printf( "nbArg: %d\n", nbArg );
    next_pos = sError;
    for( int arg=0; arg<nbArg+1; arg++ )
    {
      // begin, end are indexes in the original string 'fmt'
      // pos_arg is the position of '%s' in the original string

      // beg_seg, end_seg are indexes in the final string "sError"
      // they delimits the substrings.
      // next_pos is the current position in "sError"
      int end = arg<nbArg ? pos_arg[arg] : strlen(fmt);
      if( begin<end )
      { // not an empty string
        strncpy( s, fmt+begin, end-begin );
        s[end-begin] = '\0';
        // printf( "s: %s\n", s );
        next_pos = strstr( next_pos, s );
        if( next_pos==NULL )
        {
          isMatching = false;
          break; //exit loop
        }
        beg_seg[arg] = next_pos - sError;
      }
      else
      { // empty string
        if( arg<nbArg )
        {
          beg_seg[arg] = next_pos - sError;
        }
        else
        {  // Last segment at the end
          beg_seg[arg] = strlen( sError );
        }
      }
      end_seg[arg] = beg_seg[arg] + end-begin;
      next_pos = sError + end_seg[arg];
      // printf( "arg: %d begin: %d end: %d beg_seg: %d end_seg: %d\n", arg, begin, end, beg_seg[arg], end_seg[arg] );
      begin = end + 2;
    }

    // Check that the "last substring" found is really ending the string
    // ex: missing </%s>                   fmt
    //     missing </aaa> before </bbb>    sError
    //     1111111111   2
    //     (2) is not ending the string -> not matched
    if( isMatching )
    {
      // printf( "end_seg: %d , strlen %d\n", end_seg[nbArg], strlen(sError) );
      if( end_seg[nbArg]!=(int)strlen(sError) )
      {
        isMatching = false;
      }
    }

    if( isMatching )
    {
      // The string matches
      *aErrorId = msgFormat[i].code;

      if( nbArg>0 )
      {
        len = beg_seg[1]-end_seg[0];
        if( len<256 && len>0 )
        {
          strncpy( s, sError+end_seg[0], len );
          s[len]='\0';
          *aArg1 = MozStrdup( s );
        }
      }
      if( nbArg>1 )
      {
        len = beg_seg[2]-end_seg[1];
        if( len<256 && len>0 )
        {
          strncpy( s, sError+end_seg[1], len );
          s[len]='\0';
          *aArg2 = MozStrdup( s );
        }
      }
      if( nbArg>2 )
      {
        len = beg_seg[3]-end_seg[2];
        if( len<256 && len>0 )
        {
          strncpy( s, sError+end_seg[2], len );
          s[len]='\0';
          *aArg3 = MozStrdup( s );
        }
      }
      printf("error: %s errorId: %d, arg1: %s, arg2: %s arg3: %s\n", sError, *aErrorId, *aArg1, *aArg2, *aArg3);

      mDiagLog.log( "<END_2> nsTidyImpl::AnalyzeLine" );
      return NS_OK;
    }
  }

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

  char s[512];
  nsresult rv = NS_OK;

  int pos=-1;
  for( int i=0; msgFormat[i].fmt; ++i)
  {
    if( aErrorId == (int)msgFormat[i].code )
    {
      pos = i;
    }
  }
  if( pos<0 )
  {
    sprintf( s, "GetErrorDescription: error id does not exist" );
  }
  else
  {
    ctmbstr fmt = (msgFormat[pos].translation?msgFormat[pos].translation:msgFormat[pos].fmt);
    sprintf( s, fmt, "...", "...", "..." );
  }
  rv = NS_CStringSetData(aErrorDesc, s);

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

  char s[4096];
  char num[128];

  sprintf( s, "%d\0", (int)msgFormat[0].code );
  for( int i=1; msgFormat[i].fmt; ++i)
  {
    sprintf( num, ",%d\0", (int)msgFormat[i].code );
    strcat( s, num );
  }
  *aErrorList = MozStrdup( s );

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
  const char * utf8_msg = NULL;
  NS_CStringGetData(aMsg, &utf8_msg);
  mDiagLog.log( "%s", utf8_msg );
  mDiagLog.log( "<END> nsTidyImpl::Log" );
  return NS_OK;
}

/**
 * Add a translation
 */
NS_IMETHODIMP nsTidyImpl::InitTranslation(PRInt32 *_retval)
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::InitTranslation" );

  static int bInit = 0;
  if( !bInit )
  {
    bInit = 1;
    *_retval = 1;
    for( int i=0; msgFormat[i].fmt; ++i)
    {
       msgFormat[i].translation = NULL;
       msgFormat[i].disabled = 0;
    }
  }
  else
  {
    *_retval = 0;
  }
  mDiagLog.log( "<END> nsTidyImpl::InitTranslation" );
  return NS_OK;
}

/**
 * Add a translation
 */
NS_IMETHODIMP nsTidyImpl::AddTranslations( const nsACString & aTranslation )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::AddTranslation" );

  const char * utf8_trans;
  NS_CStringGetData(aTranslation, &utf8_trans);

  tmbstr beg = (char *)utf8_trans;
  tmbstr end = strstr( beg, "\n" );

  uint i = 0;
  while( msgFormat[i].fmt && end!=NULL )
  {
    *end= 0;
    msgFormat[i++].translation = TY_(tmbstrdup)( TALLOC, (char *)beg );
    beg = end+1;
    end = strstr( beg, "\n" );
  }
  if( msgFormat[i].fmt )
  {
    mDiagLog.warning( "ERROR nsTidyImpl:AddTranslation: too less translations" );
  }

  mDiagLog.log( "<END> nsTidyImpl::AddTranslation" );
  return NS_OK;
}

/**
 * FilterMsg
 */
NS_IMETHODIMP nsTidyImpl::FilterMsg(PRInt32 aCode )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::FilterMsg" );

  for( uint i=0; msgFormat[i].fmt; i++ )
  {
    if( msgFormat[i].code==(uint)aCode )
    {
      msgFormat[i].disabled = 1;
      break;
    }
  }
  mDiagLog.log( "<END> nsTidyImpl::FilterMsg" );
  return NS_OK;
}

/**
 * ResetFilter
 */
NS_IMETHODIMP nsTidyImpl::ResetFilter()
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::ResetFilter" );

  for( uint i=0; msgFormat[i].fmt; i++ )
  {
      msgFormat[i].disabled = 0;
  }
  mDiagLog.log( "<END> nsTidyImpl::ResetFilter" );
  return NS_OK;
}

/**
 * SetTranslationPrefix
 */
NS_IMETHODIMP nsTidyImpl::SetTranslationPrefix( const nsACString & aPrefix, const nsACString & aLineCol )
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::SetTranslationPrefix" );

  const char * utf8_prefix;
  NS_CStringGetData(aPrefix, &utf8_prefix);

  int i=0;
  tmbstr beg = (char *)utf8_prefix;
  tmbstr end = strstr( beg, "," );
  while( end )
  {
    *end= 0;
    msgPrefix[i++].prefix = TY_(tmbstrdup)( TALLOC, (char *)beg );
    beg = end+1;
    end = strstr( beg, "," );
  }
  msgPrefix[i++].prefix = TY_(tmbstrdup)( TALLOC, (char *)beg );

  if( i!=TidyFatal+1 )
  {
    mDiagLog.warning( "<ERROR> nsTidyImpl::SetTranslationPrefix: Incorrect number of Prefix %d", i );
  }

  const char * utf8_linecol;
  NS_CStringGetData(aLineCol, &utf8_linecol);
  gLineColumnFormat = TY_(tmbstrdup)( TALLOC, utf8_linecol );

  mDiagLog.log( "<END> nsTidyImpl::SetTranslationPrefix" );
  return NS_OK;
}

/**
 * Check translation
 */
NS_IMETHODIMP nsTidyImpl::CheckTranslation()
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::CheckTranslation" );

  for( uint i=0; msgFormat[i].fmt; i++ )
  {
    if( msgFormat[i].translation==NULL )
    {
      mDiagLog.warning( "<ERROR> CheckTranslation: missing translation (code=%d)",  msgFormat[i].code );
    }
    else
    {
      // Count if the number of %s is the same in the translation and original string
      int iNbFmt = 0, iNbTrans = 0;
      ctmbstr p = strstr( msgFormat[i].fmt, "%s" );
      while( p )
      {
        iNbFmt++;
        p = strstr( p+2, "%s" );
      }

      p = strstr( msgFormat[i].translation, "%s" );
      while( p )
      {
        iNbTrans++;
        p = strstr( p+2, "%s" );
      }
      if( iNbFmt!=iNbTrans )
      {
        mDiagLog.warning( "<ERROR> CheckTranslation: wrong number of arguments (code=%d)",  msgFormat[i].code );
      }
    }
  }

  mDiagLog.log( "<END> nsTidyImpl::CheckTranslation" );
  return NS_OK;
}

/**
 * PrintEnglishTranslation
 */
NS_IMETHODIMP nsTidyImpl::PrintEnglishTranslation()
{
  mDiagLog.log( "<BEGIN> nsTidyImpl::PrintEnglishTranslation" );
  for( int i=0; msgFormat[i].fmt; ++i)
  {
    printf("tidy_%d=%s\n", msgFormat[i].code, msgFormat[i].fmt);
  }
  mDiagLog.log( "<END> nsTidyImpl::PrintEnglishTranslation" );
  return NS_OK;
}
