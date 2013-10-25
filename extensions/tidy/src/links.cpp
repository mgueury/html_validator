/**
 * LINKS.C - print all the links to the output of tidy
 *
 * @author    Marc Gueury
 * @version   1
 */

//--------------------------------------------------------------------------
//                           I N C L U D E
//--------------------------------------------------------------------------

extern "C"
{
  #include "tidy-int.h"
  #include "tmbstr.h"
  #include "pprint.h"
  #include "tags.h"
  #include "translation.h"
}
#include "links.h"

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

static void PrintURL( TidyDocImpl* doc, ctmbstr str )
{
  while ( *str != '\0' )
  {
    TY_(WriteChar)( *str++, doc->docOut );
  }
  TY_(WriteChar)( '\n', doc->docOut );
}

static void GetLinksRecusiv( TidyDocImpl* doc, Node * parent )
{
  for ( Node * content=parent->content; content; content=content->next )
  {
    if( content->element!=NULL
        && ( nodeIsA(content)
             || nodeIsLINK(content)
           )
      )
    {
      for ( AttVal* av=content->attributes; av; av=av->next )
      {
        if( av->value!=NULL && attrIsHREF(av) )
        {
          PrintURL( doc, av->value );
          break;
        }
      }
    }
    if( content->element!=NULL
        && ( nodeIsIMG(content)
             || nodeIsFRAME(content)
             || nodeIsIFRAME(content)
           )
      )
    {
      for ( AttVal* av = content->attributes; av; av = av->next )
      {
        if( av->value!=NULL && attrIsSRC(av) )
        {
          PrintURL( doc, av->value );
          break;
        }
      }
    }
    GetLinksRecusiv( doc, content );
  }
}

void tidyGetLinks( TidyDoc tdoc, TidyBuffer* outbuf )
{
  TidyDocImpl* doc = tidyDocToImpl( tdoc );
  // uint outenc = cfg( doc, TidyOutCharEncoding );
  uint outenc = doc->config.value[ TidyOutCharEncoding ].v;
  // uint nl = cfg( doc, TidyNewline );
  uint nl = doc->config.value[ TidyNewline ].v;
  StreamOut* out = TY_(BufferOutput)( doc, outbuf, outenc, nl );
  doc->docOut = out;

  Node * html = TY_(FindHTML)( doc );
  if( html )
  {
    GetLinksRecusiv( doc, html );
  }

  doc->docOut = NULL;
  TidyFree( TALLOC, out );
}