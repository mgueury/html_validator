//--------------------------------------------------------------------------
//                           I N C L U D E
//--------------------------------------------------------------------------

#ifdef SPVALID_MAIN
#include "../include/config.h"
#else

#ifdef WIN32
#include "../opensp/include/config.h"
#else
#include "../opensp/config.h"
#endif

#include "nsMemory.h"
#include "nsEmbedString.h"

#endif

#include <stdlib.h>

#ifdef SPVALID_MAIN
#define _UNICODE
#include <TCHAR.h>
#include "../include/MessageEventHandler.h"
#include "../include/sptchar.h"
#include "../include/InternalInputSource.h"
#include "../include/Parser.h"
#include "../include/CmdLineApp.h"

#else
#include "../opensp/include/MessageEventHandler.h"
#include "../opensp/include/sptchar.h"
#include "../opensp/include/InternalInputSource.h"
#include "../opensp/include/Parser.h"
#include "../opensp/include/CmdLineApp.h"

#endif

#include "NsgmlsMessages.h"
#include "SpValid.h"


#ifdef SP_NAMESPACE
using namespace SP_NAMESPACE;
#endif

// SP_DEFINE_APP(SpValidApp)

const SpValidApp::OptionFlags SpValidApp::outputOptions[] =
{
  { SP_T("all"), 0 },
};

//--------------------------------------------------------------------------
//                           F U N C T I O N S
//--------------------------------------------------------------------------

#ifdef SPVALID_MAIN

int main( int _argc, char ** _argv )
{
  const SP_TCHAR* argv[] =

  { SP_T("spvalid"),
    SP_T("-n"),
    SP_T("-c"),
    SP_T("C:\\www\\validator.080\\htdocs\\sgml-lib\\xml.soc"),
    // SP_T("C:\\Documents and Settings\\mgueury\\Application Data\\Mozilla\Firefox\\Profiles\\b6at4lbb.default\\extensions\\{3b56bcc7-54e5-44a2-9b44-66c3ef58c13e}\\sgml-lib\\xml.soc")
    SP_T("-wvalid"),
    SP_T("-wnon-sgml-char-ref"),
    SP_T("-wno-duplicate"),
    SP_T("-E0"),
    // SP_T("-m"), // custom options
	SP_T("--error-file=c:\\temp\\spvalid.err"),
    SP_T("c:\\temp\\a.html"),
    NULL
  };
  int argc = 10;

  putenv( "SP_CHARSET_FIXED=NO" );
  putenv( "SP_ENCODING=UTF-8" );
  putenv( "SP_BCTF=UTF-8" );

  SpResult res;
  SpValidApp app( &res );

  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
/*
  FILE * pFile = fopen( "c:\\temp\\valid.html", "rb" );
  if (pFile==NULL) exit (1);
  // obtain file size.
  fseek( pFile, 0, SEEK_END );
  long lSize = ftell( pFile );
  rewind( pFile );
  // allocate memory to contain the whole file.
  app.sBuffer = (char*) malloc( lSize+1 );
  if( app.sBuffer==NULL )
  {
    exit( 2 );
  }
  // copy the file into the buffer.
  fread( app.sBuffer, 1, lSize, pFile );
  app.sBuffer[lSize] = 0;
  // terminate
  fclose (pFile);
*/
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

#ifdef WIN32
  int result = app.run( argc, (wchar_t **)argv );
#else
  int result = app.run( argc, (char **)argv );
#endif

  String<char> str;
  app.str_.extractString( str );

  // The string is not null terminated. Terminate it.
  str.append( "\0", 1 );
  const char * data = str.data();
  size_t size = str.size();

  fprintf( stderr, "%s", data );

  return result;
}

#endif

//-------------------------------------------------------------------------

#ifdef WIN32
int spvalid( int argc, unsigned short **argv, SpResult * res )
#else
int spvalid( int argc, char **argv, SpResult * res )
#endif
{
  SpValidApp app( res );
  int result = app.run(argc, (wchar_t **)argv);

  return result;
}

//-------------------------------------------------------------------------

#ifndef SPVALID_MAIN

#ifdef WIN32
int spValidMem( int argc, unsigned short **argv, SpResult * res, nsACString& aError )
#else
int spValidMem( int argc, char **argv, SpResult * res, nsACString& aError )
#endif
{
  SpValidApp app( res );
  int result = app.run(argc, argv);

  /*
  String<char> str;
  app.str_.extractString( str );

  // The string is not null terminated. Terminate it.
  str.append( "\0", 1 );
  const char * data = str.data();
  size_t size = str.size();

  nsresult rv = NS_CStringSetData( aError, data );
  */

  return result;
}

#endif

//--------------------------------------------------------------------------
//                              CLASS SpResult
//--------------------------------------------------------------------------

SpResult::SpResult()
{
  infoCount_ = 0;
  warningCount_ = 0;
  errorCount_ = 0;
}

//--------------------------------------------------------------------------
//                     CLASS ValidMessageEventHandler
//--------------------------------------------------------------------------

class ValidMessageEventHandler : public MessageEventHandler
{
  public:
    ValidMessageEventHandler(class Messenger *messenger);
    ~ValidMessageEventHandler();
    void message(MessageEvent *);
    void noteMessage(const Message &message);
  private:
    Messenger * messenger_;
    unsigned infoCount_;
    unsigned warningCount_;
    unsigned errorCount_;
};

//--------------------------------------------------------------------------
//                         CLASS SpValidApp
//--------------------------------------------------------------------------

SpValidApp::SpValidApp( SpResult * res )
: suppressOutput_(0),
  batchMode_(0),
  prologOnly_(0),
  outputFlags_(0)
{
  res_ = res;
  sBuffer = NULL;
  sInput = NULL;

  // remove this  NsgmlsMessages::dHelp
  registerOption('m', SP_T("memory"), NsgmlsMessages::dHelp );

}

SpValidApp::~SpValidApp()
{
  // if( sBuffer ) free( sBuffer );
  // if( sInput ) delete sInput;
}

void SpValidApp::processOption(AppChar opt, const AppChar *arg)
{
  switch (opt) {
  case 'm':
    setMessageStream(new EncodeOutputCharStream(&str_, codingSystem()));
    break;
  case 'd':
    // warn about duplicate entity declarations
    options_.warnDuplicateEntity = 1;
    break;
  case 'o':
    {
      Boolean found = 0;
                       //was i < SIZEOF(outputOptions)
      for (size_t i = 0; outputOptions[i].flag != 0; i++)
      if (tcscmp(arg, outputOptions[i].name) == 0) {
        outputFlags_ |= outputOptions[i].flag;
        found = 1;
        break;
      }
      if (!found)
       message(NsgmlsMessages::unknownOutputOption,
            StringMessageArg(convertInput(arg)));
    }
    break;
  case 'p':
    prologOnly_ = 1;
    break;
  case 'r':
    // warn about defaulted entity reference
    options_.warnDefaultEntityReference = 1;
    break;
  case 's':
    suppressOutput_ = 1;
    break;
  case 'u':
    // warn about undefined elements
    options_.warnUndefinedElement = 1;
    break;
  default:
    ParserApp::processOption(opt, arg);
    break;
  }
}

int SpValidApp::processArguments(int argc, AppChar **argv)
{
  if (batchMode_)
  {
    int ret = 0;
    for (int i = 0; i < argc; i++) {
      int tem = ParserApp::processArguments(1, argv + i);
      if (tem > ret)
            ret = tem;
    }
    return ret;
  }
  else
    return ParserApp::processArguments(argc, argv);
}

void SpValidApp::allLinkTypesActivated()
{
//  if (!rastOption_)
//    ParserApp::allLinkTypesActivated();
}

ErrorCountEventHandler *SpValidApp::makeEventHandler()
{
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
/*
  Origin * origin = InputSourceOrigin::make();

//  StringC sysid;
//  EntityApp::makeSystemId(0, NULL, sysid);
//  ExternalInfoImpl info = new ExternalInfoImpl( sysid );
//  origin->setExternalInfo( info );
  Location loc( origin, 1 );
  sInput = new StringC( codingSystem()->convertIn(sBuffer) );
  InternalInputSource * src = new InternalInputSource( *sInput, InputSourceOrigin::make(loc) );

//  StringC sysid;
//  EntityApp::makeSystemId(0, NULL, sysid);
//  ParsedSystemId parsedSysid;
//  if (!parseSystemId(sysid, docCharset, (flags & ExtendEntityManager::isNdata) != 0,
//                   0, mgr, parsedSysid)
//      || !catalogManager_->mapCatalog(parsedSysid, this, mgr))
//    return NULL;
//  ParsedSystemId parsedSysid;
//  src->addNewExternalInfoImpl(parsedSysid);


  Parser * p = parser_.parser_;
  p->popInputStack();
  p->pushInput( src );
*/
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  handler_ = new ValidMessageEventHandler(this);
  return handler_;
}

ValidMessageEventHandler::ValidMessageEventHandler(class Messenger *messenger)
: MessageEventHandler(messenger),
  messenger_(messenger)
{
  infoCount_ = 0;
  warningCount_ = 0;
  errorCount_ = 0;
}

ValidMessageEventHandler::~ValidMessageEventHandler()
{
  fprintf( stderr, "info: %d, warning: %d, error: %d\n", infoCount_, warningCount_, errorCount_ );
  fprintf( stderr, "Done\n" );

  SpValidApp * app = (SpValidApp*)messenger_;
  app->res_->infoCount_ = infoCount_;
  app->res_->warningCount_ = warningCount_;
  app->res_->errorCount_ = errorCount_;
}

void ValidMessageEventHandler::message(MessageEvent *event)
{
  messenger_->dispatchMessage(event->message());
  noteMessage(event->message());
  delete event;
}

void ValidMessageEventHandler::noteMessage(const Message &message)
{
  MessageType::Severity sev = message.type->severity();

  if( sev==MessageType::info )
    infoCount_++;
  else if( sev==MessageType::warning )
    warningCount_++;
  else if( message.type->number()!=435 ) // skip prolog error
    errorCount_++;
}
