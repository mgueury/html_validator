/**
 * DIAGLOG.H - diagnostic logging to help to find crashes
 *
 * @author    Marc Gueury
 * @version   1
 */

//--------------------------------------------------------------------------
//                           I N C L U D E
//--------------------------------------------------------------------------

#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <time.h>
#include "diaglog.h"

/*
// FIXME
// Note if I remove the include from nsMemory from here "utf8ToUtf16", will crash.
// I think that it is due to declaration
// - If not included, a malloc in C is done
// - If included, a malloc in mozlibc is done
// -> it is very unlogical. But consistent ???
*/

#ifdef WIN32
#define UNICODE
  #include "windows.h"
#endif

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

#ifdef WIN32
wchar_t * utf8ToUtf16( const char * utf8 )
{
  int nLen = strlen( utf8 ) + 10;
  wchar_t* buf =(wchar_t*)malloc( nLen*sizeof(wchar_t));

  int iRes = MultiByteToWideChar(CP_UTF8,
              0,
              (LPCSTR)utf8,
              -1,
              buf,
              nLen);

  return buf;
}
#endif

FILE * openUtf8Filename( const char * utf8, char * mode )
{
  FILE * f;
  #ifdef WIN32
    wchar_t * utf16 = utf8ToUtf16( utf8 );
    wchar_t * mode16 = utf8ToUtf16( mode );
    f = _wfopen(utf16, mode16);
    free( mode16 );
    free( utf16 );
    // For Windows 98/ME, let's try to open the file with fopen
    if( f==0 )
    {
      f = fopen(utf8, mode);
    }
  #else
    f = fopen(utf8, mode);
  #endif
  return f;
}

//--------------------------------------------------------------------------
//                            CLASS   DiagLog
//--------------------------------------------------------------------------

/*
 * Constructor
 */
DiagLog::DiagLog()
{
  m_sDiagFileName = NULL;
  m_sDiagHtml = NULL;
  m_sSpValidErr = NULL;
  m_sSpValidErr2 = NULL;
  m_bDebug = 0;
}

/*
 * Destructor
 */
DiagLog::~DiagLog()
{
  if( m_sDiagFileName )
  {
    free( m_sDiagFileName );
  }
  if( m_sDiagHtml )
  {
    free( m_sDiagHtml );
  }
  if( m_sSpValidErr )
  {
    free( m_sSpValidErr );
  }
  if( m_sSpValidErr2 )
  {
    free( m_sSpValidErr2 );
  }
}

/**
 * Initialisation
 */
void DiagLog::init( const char * aDir, int bDebug )
{
  m_bDebug = bDebug;
  m_sDiagFileName = (char *) malloc(1024);
  m_sDiagHtml     = (char *) malloc(1024);
  m_sSpValidErr   = (char *) malloc(1024);
  m_sSpValidErr2   = (char *) malloc(1024);
  #ifdef WIN32
    snprintf( m_sDiagFileName, 1024-1, "%s\\tidy_firefox_diag.log", aDir);
    snprintf( m_sDiagHtml, 1024-1, "%s\\tidy_last_validated.html", aDir);
    snprintf( m_sSpValidErr, 1024-1, "%s\\spvalid.err", aDir);
  #else
    snprintf( m_sDiagFileName, 1024-1, "%s/tidy_firefox_diag.log", aDir);
    snprintf( m_sDiagHtml, 1024-1, "%s/tidy_last_validated.html", aDir);
    snprintf( m_sSpValidErr, 1024-1, "%s/spvalid.err", aDir);
  #endif
  snprintf( m_sSpValidErr2, 1024-1, "--error-file=%s/spvalid.err", aDir);
}

/**
 * Generalized warning function. It can be called the same way that printf() can.
 *
 * @format format with the same meaning as in printf
 */
void DiagLog::warning(const char *format, ...)
{
  char s[1024];

  va_list argList;

  va_start(argList, format);
  vsnprintf( s, 1024-1, format, argList);
  va_end(argList);

  #ifdef WIN32
    wchar_t * utf16 = utf8ToUtf16( s );
    MessageBox( NULL, utf16, L"Warning", MB_OK );
    free( utf16 );
  #else
    printf("WARNING: ");
    printf( s );
    printf( "\n" );
  #endif
}

/**
 * Write the text to the log file and flush it. (max size: DL_BUFFER_SIZE)
 */
void DiagLog::log( const char * format, ... )
{
  if( m_bDebug )
  {
    FILE * f;

    if( (f=openUtf8Filename(m_sDiagFileName,"a"))==0 )
    {
      warning("Can not create DiagLog file: %s", m_sDiagFileName );
    }
    else
    {
      char d[128];
      va_list argList;
      time_t rawtime;
      struct tm * timeinfo;

      time ( &rawtime );
      timeinfo = localtime ( &rawtime );
      sprintf( d, "%s", asctime (timeinfo) );
      int len = strlen(d);
      if( len>1 )
      {
        d[len-1] = 0;
      }
      fprintf( f, "%s: ", d );
      fflush( f );

      va_start(argList, format);
      vfprintf( f, format, argList );
      va_end(argList);
      fprintf( f, "\n");
      fflush( f );

      fclose( f );
    }
  }
}

/**
 * Make an access violation and crash the program
 */
void DiagLog::writeHtml( const char * sHtml )
{
  FILE * f;

  if( (f = openUtf8Filename(m_sDiagHtml, "w"))==0 )
  {
    warning("writeHtml: Can not create DiagLog file: %s", m_sDiagHtml );
  }
  else
  {
    fprintf( f, "%s", sHtml);
    fflush( f );
    fclose( f );
  }
}

/**
 * Make an access violation and crash the program
 */
void DiagLog::crash()
{
    int * p = 0;
    p[0]=255;
}

