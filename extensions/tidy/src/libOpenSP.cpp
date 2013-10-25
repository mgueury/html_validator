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

#pragma GCC visibility push(default)

extern "C"
{
#include "tidy.h"
}

#include "libTidy.h"
#include "SpResult.h"

#include <stdlib.h>

#ifdef WIN32
#define UNICODE
  #include "windows.h"
#endif

//--------------------------------------------------------------------------
//                           G L O B A L S
//--------------------------------------------------------------------------

char gSgmlLibPath[1024];
char gXmlLibPath[1024];

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

NS_IMETHODIMP libTidySpInit(const char * aSgmlLibPath, const char * aXmlLibPath )
{
  const char * utf8 = NULL;

  mDiagLog.log( "<BEGIN> libTidySpInit" );

  snprintf( gSgmlLibPath, 1024-1, "%s", aSgmlLibPath);
  snprintf( gXmlLibPath, 1024-1, "%s", aXmlLibPath);

  // Character sets
  // The sgml-lib and the file name come from a nsTidy.idl as string and are in System Charset
  // The file content is in UTF8
  putenv( "SP_CHARSET_FIXED=NO" );
  putenv( "SP_ENCODING=UTF-8" );
  putenv( "SP_BCTF=UTF-8" );

  mDiagLog.log( "<END> libTidySpInit %s", gSgmlLibPath );
  return NS_OK;
}

NS_IMETHODIMP libTidySpGetErrorsInHTML(const char * aHtml, const char *aListConfig, PRInt32 aAccessLevel, char ** aError, PRInt32 *aNbError, PRInt32 *aNbWarning, PRInt32 *aNbAccessWarning, PRInt32 *aNbHidden )
{
  mDiagLog.log( "<BEGIN> libTidySpGetErrorsInHTML" );
  bool rv = NS_OK;

  const char * utf8_html = aHtml;
  mDiagLog.writeHtml( utf8_html );

  int bXml = libTidySpIsXhtml( utf8_html );
  char * sLibPath = (bXml)?gXmlLibPath:gSgmlLibPath;
  mDiagLog.log( "sLibPath: %s", sLibPath );

  char* argv[] =
  { "spvalid",
    "-n",
    "-c",
    sLibPath,
    "-wvalid",
    "-wnon-sgml-char-ref",
    "-wno-duplicate",
    "-E0",
    mDiagLog.m_sSpValidErr2,
    mDiagLog.m_sDiagHtml,
    NULL
  };
  mDiagLog.log( "todel 1a ---" );

  int argc = 10;
  SpResult res;

  #ifdef WIN32
    // OpenSP on windows works with
    // - SP_WIDE_SYSTEM : this means that the arguments given are in UTF16 and that
    //                    the files are opened with _wfopen and handle unicode too.
    int i;

    wchar_t ** wargv = (wchar_t **)malloc(sizeof(wchar_t *)*argc);
    mDiagLog.log( "todel 1b ---" );
    for( i=0; i<argc; i++ )
    {
/*
        // FIXME
        // Note if I move the code from "utf8ToUtf16", here, it works.
        // If it is called in dialog.cpp, it crashes. I think that it is due to declaration
        // of malloc and free in the header of mozilla.
        // - That a malloc in C is done in dialog.cpp
        // - That a malloc in mozlibc is done here.
        // -> it is very unlogical. But consistent ???
        int nLen = strlen( argv[i] ) + 10;
        wchar_t* buf =(wchar_t*)malloc( nLen*sizeof(wchar_t));
        mDiagLog.log( "todel 1b2 -- %s -- %d", argv[i], nLen  );

        int iRes = MultiByteToWideChar(CP_UTF8,
              0,
              (LPCSTR)argv[i],
              -1,
              buf,
              nLen);
        wargv[i] = buf;
*/
        wargv[i] = utf8ToUtf16( argv[i] );
    }
    mDiagLog.log( "todel 1c ---" );

    int result = spvalid(argc, wargv, &res);
    mDiagLog.log( "todel 1d ---" );


    // free all of this
//    free(wargv[0]);
//    free(wargv[1]);
    // free all of this
    for(i=0; i<argc; i++)
    {
      free(wargv[i]);
    }
    free(wargv);

  #else
    int result = spvalid(argc, argv, &res);
  #endif
  mDiagLog.log( "todel 2 ---" );

  *aNbError = res.errorCount_;
  *aNbWarning = res.warningCount_;
  *aNbAccessWarning  = 0;
  *aNbHidden = 0;

  char * buffer;

  if( mDiagLog.m_sSpValidErr )
  {
    FILE * f;

    if( (f = openUtf8Filename(mDiagLog.m_sSpValidErr, "r"))==0 )
    {
      mDiagLog.log( "ERROR: SpGetErrorsInHTML: Can not read file: %s", mDiagLog.m_sSpValidErr );
    }
    else
    {
      // obtain file size.
      fseek( f, 0, SEEK_END );
      long lSize = ftell( f );
      rewind( f );

      // allocate memory to contain the whole file.
      buffer = (char*) malloc( lSize+1 );
      if( buffer==NULL)
      {
        mDiagLog.log( "ERROR: SpGetErrorsInHTML: Unable to allocate a buffer" );
      }
      else
      {
        // copy the file into the buffer.
        int read = fread (buffer,1,lSize,f);
        buffer[read] = 0;

        libTidyCopyString( aError, buffer );

        // terminate
        fclose (f);
        free (buffer);
      }
    }
  }

  mDiagLog.log( "<END> libTidySpGetErrorsInHTML" );
  return rv;
}


int libTidySpIsXhtml( const char * utf8_html )
{
  // This is a snippet from check of validator.w3.org
    //
    // Overall parsing algorithm for documents returned as text/html:
    //
    // For documents that come to us as text/html,
    //
    //  1. check if there's a doctype
    //  2. if there is a doctype, parse/validate against that DTD
    //  3. if no doctype, check for an xmlns= attribute on the first element
    //  4. if there is an xmlns= attribute, check for XML well-formedness
    //  5. if there is no xmlns= attribute, and no DOCTYPE, punt.
    //
  //
  mDiagLog.log( "<BEGIN>SpIsXHTML" );

  const char * p = utf8_html;
  const char * pStart = NULL;
  const char * pEnd = NULL;
  int i;

  while( p[0]==' ' || p[0]==10 || p[0]==13 || p[0]==9 )
  {
    p++;
  }

  // Find the DOCTYPE tag
  for( i=0; i<512; i++ )
  {
    if( p[0]==0 ) break;
    if( p[0]=='<'
     && p[1]=='!'
     && ( p[2]=='d' || p[2]=='D' )
     && ( p[3]=='o' || p[3]=='O' )
     && ( p[4]=='c' || p[4]=='C' )
     && ( p[5]=='t' || p[5]=='T' )
     && ( p[6]=='y' || p[6]=='Y' )
     && ( p[7]=='p' || p[7]=='P' )
     && ( p[8]=='e' || p[8]=='E' ) )
    {
      pStart = p;
      break;
    }
    p++;
    // Skip the space
    if( p[0]==32 || p[0]==13 || p[0]==10 || p[0]==9 ) i--;
  }
  // No Doctype -> SGML
  if( !pStart ) return 0;
  mDiagLog.log( "pStart: %d", pStart-utf8_html );

  for( i=0; i<512; i++ )
  {
    if( p[0]==0 ) break;
    if( p[0]=='>' )
    {
      pEnd = p;
      break;
    }
    p++;
  }
  if( !pEnd ) return 0;
  mDiagLog.log( "pEnd: %d", pEnd-utf8_html );

  // Try to guess if it is HTML or XHTML
  // If it based on the fact that all decl of XHTML contains XHTML inside them

  for( p=pStart; p<pEnd; p++ )
  {
    if( ( p[0]=='x' || p[0]=='X' )
     && ( p[1]=='h' || p[1]=='H' )
     && ( p[2]=='t' || p[2]=='T' )
     && ( p[3]=='m' || p[3]=='M' )
     && ( p[4]=='l' || p[4]=='L' ) )
    {
      return 1;
    }
  }
  mDiagLog.log( "<END>SpIsXHTML" );

  // No XHTML -> SGML
  return 0;
}
