/**
 * TRANSLATION.H - translation bridge between Mozilla and Tidy
 *
 * @author    Marc Gueury
 * @version   1
 */

//--------------------------------------------------------------------------
//                           I N C L U D E
//--------------------------------------------------------------------------

#include "tidy-int.h"
#include "tmbstr.h"
#include "message.h"
#include "translation.h"

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

struct _msgPrefix msgPrefix[] =
{
  { TidyInfo,       "Info: " },
  { TidyWarning,    "Warning: " },
  { TidyConfig,     "Config: " },
  { TidyAccess,     "Access: " },
  { TidyError,      "Error: " },
  { TidyBadDocument,"Document: " },
  { TidyFatal,      "Panic: " },
  { 0, NULL }
};

// VERY DIRTY !!!!!!!
// XXXXXXXXXXXXXXX This need to be removed !!
static uint gLastMsgDisabled=0;
static uint gLastMsgCode=0;
char * gLineColumnFormat = "line %d column %d - ";

ctmbstr GetFormatFromCode(uint code)
{
  uint i;
  for( i=0; msgFormat[i].fmt; i++ )
  {
    if( msgFormat[i].code==code )
    {
      gLastMsgDisabled = msgFormat[i].disabled;
      gLastMsgCode     = msgFormat[i].code;
      return (msgFormat[i].translation?msgFormat[i].translation:msgFormat[i].fmt);
    }
  }
  return NULL;
}

char* LevelPrefix( TidyReportLevel level, char* buf, size_t count )
{
  *buf = 0;

  assert( msgPrefix[level].level==level );
  TY_(tmbstrncpy)( buf, msgPrefix[level].prefix, count );

  return buf + TY_(tmbstrlen)( buf );
}

// Updates document message counts and
// compares counts to options to see if message
// display should go forward.
Bool UpdateCount( TidyDocImpl* doc, TidyReportLevel level )
{
  // keep quiet after <ShowErrors> errors
  Bool go = ( doc->errors < cfg(doc, TidyShowErrors) );

  if( gLastMsgDisabled )
  {
    go = 0;
    gLastMsgDisabled = 0;
    doc->hidden++;
  }
  else
  {
    switch ( level )
    {
    case TidyInfo:
      doc->infoMessages++;
      break;
    case TidyWarning:
      doc->warnings++;
      go = go && cfgBool( doc, TidyShowWarnings );
      break;
    case TidyConfig:
      doc->optionErrors++;
      break;
    case TidyAccess:
      doc->accessErrors++;
      break;
    case TidyError:
      doc->errors++;
      break;
    case TidyBadDocument:
      doc->docErrors++;
      break;
    case TidyFatal:
      // Ack!
      break;
    }
  }

  return go;
}

uint tidyHiddenCount( TidyDoc tdoc )
{
    TidyDocImpl* impl = tidyDocToImpl( tdoc );
    uint count = 0xFFFFFFFF;
    if ( impl )
        count = impl->hidden;
    return count;
}

void messagePos( TidyDocImpl* doc, TidyReportLevel level,
                        int line, int col, ctmbstr msg, va_list args )
{
    char messageBuf[ 2048 ];
    Bool go = UpdateCount( doc, level );

    if ( go )
    {
        TY_(tmbvsnprintf)(messageBuf, sizeof(messageBuf), msg, args);
        if ( doc->mssgFilt )
        {
            TidyDoc tdoc = tidyImplToDoc( doc );
            go = doc->mssgFilt( tdoc, level, line, col, messageBuf );
        }
    }

    if ( go )
    {
        unsigned char buf[ 128 ], *cp;
        if( 1 )  /// XXXXXXXXXX need to be switchable
        {
          // New format that does not require parsing
          // line:column:error_id:error_type:error
          TY_(tmbsnprintf)(buf, sizeof(buf), "%d\t%d\t%d\t%d\t", line, col, gLastMsgCode, level);
          gLastMsgCode = 0;
        }
        else
        {
            if ( line > 0 && col > 0 )
            {
                ReportPosition(doc, line, col, buf, sizeof(buf));
                for ( cp = buf; *cp; ++cp )
                    tidyPutByte( &(doc->errout)->sink, *cp );
            }
            LevelPrefix( level, buf, sizeof(buf) );

        }
        for ( cp = buf; *cp; ++cp )
            tidyPutByte( &(doc->errout)->sink, *cp );
        for ( cp = messageBuf; *cp; ++cp )
        {
            if( *cp=='\t' ) *cp = ' ';
            tidyPutByte( &(doc->errout)->sink, *cp );
        }
        TY_(WriteChar)( '\n', doc->errout );
    }
}

char * ReportPosition(TidyDocImpl* doc, int line, int col, char* buf, size_t count)
{
    *buf = 0;

    /* Change formatting to be parsable by GNU Emacs */
    if ( cfgBool(doc, TidyEmacs) && cfgStr(doc, TidyEmacsFile) )
        TY_(tmbsnprintf)(buf, count, "%s:%d:%d: ",
                 cfgStr(doc, TidyEmacsFile), line, col);
    else /* traditional format */
        TY_(tmbsnprintf)(buf, count, gLineColumnFormat, line, col);
    return buf + TY_(tmbstrlen)( buf );
}

void TY_(AccessibilityHelloMessage)( TidyDocImpl* doc )
{
}
