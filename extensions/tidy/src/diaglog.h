/**
 * DIAGLOG.H - diagnostic logging to help to find crashes
 *
 * @author    Marc Gueury
 * @version   1
 */

#ifndef __DIAG_LOG_H
#define __DIAG_LOG_H

//--------------------------------------------------------------------------
//                            D E F I N E
//--------------------------------------------------------------------------

#if defined(_WIN32) && !defined(__MSL__) && !defined(__BORLANDC__)
#define vsnprintf _vsnprintf
#define snprintf _snprintf
#endif /* _WIN32 */

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

#ifdef WIN32
wchar_t * utf8ToUtf16( const char * utf8 );
#endif
FILE * openUtf8Filename( const char * utf8, char * mode );

//--------------------------------------------------------------------------
//                             T Y P E S
//--------------------------------------------------------------------------

class DiagLog
{
public:
  DiagLog();
  ~DiagLog();

  void init( const char * aDir, int bDebug );
  void warning(const char *format, ...);
  void log( const char * format, ... );
  void writeHtml( const char * sHtml );
  void crash();

  int    m_bDebug;
  char * m_sDiagFileName;
  char * m_sDiagHtml;
  char * m_sSpValidErr;
  char * m_sSpValidErr2;
};

extern "C"
{
  extern DiagLog mDiagLog;
}


#endif // __DIAG_LOG_H
