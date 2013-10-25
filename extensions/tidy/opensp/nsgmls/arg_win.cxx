#ifdef WIN32
#define UNICODE	
#include <windows.h>
#endif

wchar_t * FromUtf8( char * utf8 )
{
  int nLen = strlen( utf8 ) + 1;
  wchar_t* buf =(wchar_t*)malloc( nLen*sizeof(wchar_t));
	
  int iRes = MultiByteToWideChar(CP_UTF8,
              0,
              (LPCSTR)utf8,
              -1,
              buf,
              nLen);

  return buf;
}