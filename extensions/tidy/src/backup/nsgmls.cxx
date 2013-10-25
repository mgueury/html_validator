// Copyright (c) 1994, 1995 James Clark
// See the file COPYING for copying permission.

#include "config.h"
#include "Event.h"
#include "MessageEventHandler.h"
#include "SgmlsEventHandler.h"
#include "RastEventHandler.h"
#include "OutputCharStream.h"
#include "Boolean.h"
#include "NsgmlsMessages.h"
#include "MessageArg.h"
#include "ErrnoMessageArg.h"
#include "sptchar.h"
#include "macros.h"
#include "nsgmls.h"

#include <stdlib.h>
#include <string.h>
#include <errno.h>
#include <limits.h>

#ifdef SP_NAMESPACE
using namespace SP_NAMESPACE;
#endif

#ifdef WIN32
unsigned short * FromUtf8( char * utf8 );
#endif

int main( int _argc, char ** _argv )
{
/*
  putenv( "SP_CHARSET_FIXED=NO" );
  putenv( "SP_ENCODING=UTF-8" );
  putenv( "SP_BCTF=UTF-8" );
*/
  putenv( "SP_CHARSET_FIXED=YES" );
  putenv( "SP_ENCODING=UTF-8" );
  putenv( "SP_BCTF=UTF-8" );

  NsgmlsApp * app = new NsgmlsApp();
#ifdef SP_WIDE_SYSTEM
  // XXXXXXXXXXXXXXXX TO COPY TO SPVALID.CPP !!!!!!!!! XXXXXXXXXXXXXXXXXXX
  // Windows only 
  // Let's convert the argument
  // The input is considered in UTF8, it has to be changed in UTF16 on Windows
#ifndef WIN32
  SP_WIDE_SYSTEM WORKS ONLY IN WINDOWS 
#endif
  int i;

  wchar_t** wargv = (wchar_t**)malloc(sizeof(unsigned short *)*_argc);
  for(i=0; i<_argc; i++)
  {
	wargv[i] = FromUtf8( _argv[i] );
  }

  int result = app->run( _argc, wargv ); 

  // free all of this
  for(i=0; i<_argc; i++)
  {
    free(wargv[i]);
  }
  free(wargv);

#else 
  int result = app->run( _argc, _argv );
#endif

}  
//  SP_DEFINE_APP(NsgmlsApp)

const NsgmlsApp::OptionFlags NsgmlsApp::outputOptions[] = {
    { SP_T("all"), SgmlsEventHandler::outputAll },
    { SP_T("line"), SgmlsEventHandler::outputLine },
    { SP_T("entity"), SgmlsEventHandler::outputEntity },
    { SP_T("id"), SgmlsEventHandler::outputId },
    { SP_T("included"), SgmlsEventHandler::outputIncluded },
    { SP_T("notation-sysid"), SgmlsEventHandler::outputNotationSysid },
    { SP_T("nonsgml"), SgmlsEventHandler::outputNonSgml },
    { SP_T("empty"), SgmlsEventHandler::outputEmpty },
    { SP_T("data-attribute"), SgmlsEventHandler::outputDataAtt },
    { SP_T("comment"), SgmlsEventHandler::outputComment },
    { SP_T("omitted"), (SgmlsEventHandler::outputTagOmission |
                        SgmlsEventHandler::outputAttributeOmission ) },
    { SP_T("tagomit"), SgmlsEventHandler::outputTagOmission },
    { SP_T("attromit"), SgmlsEventHandler::outputAttributeOmission },
    { SP_T("version"), SgmlsEventHandler::outputParserInformation },
    { SP_T("all"), 0 },
  };

class PrologMessageEventHandler : public MessageEventHandler {
public:
  PrologMessageEventHandler(class Messenger *messenger);
  void endProlog(EndPrologEvent *);
};

class XRastEventHandler : public RastEventHandler {
public:
  XRastEventHandler(SgmlParser *,
		    const NsgmlsApp::AppChar *filename,
		    const StringC &filenameStr,
		    const OutputCodingSystem *,
		    CmdLineApp *,
		    class Messenger *messenger);
  ~XRastEventHandler();
  void message(MessageEvent *);
  void truncateOutput();
  void allLinkTypesActivated();
private:
  class Messenger *messenger_;
  // file_ must come before os_ so it gets inited first
  FileOutputByteStream file_;
  EncodeOutputCharStream os_;
  const NsgmlsApp::AppChar *filename_;
  const StringC filenameStr_;
  CmdLineApp *app_;
};

NsgmlsApp::NsgmlsApp()
: suppressOutput_(0),
  batchMode_(0),
  prologOnly_(0),
  outputFlags_(0),
  rastOption_(0)
{
  registerOption('B', SP_T("batch-mode"), NsgmlsMessages::BHelp);
  registerOption('o', SP_T("option"), NsgmlsMessages::option,
                 NsgmlsMessages::oHelp);
  registerOption('p', SP_T("only-prolog"), NsgmlsMessages::pHelp);
  registerOption('s', SP_T("no-output"), NsgmlsMessages::sHelp);
  registerOption('t', SP_T("rast-file"), NsgmlsMessages::file,
                 NsgmlsMessages::tHelp);
  // FIXME treat these as aliases
  registerOption('d', 0, NsgmlsMessages::dHelp);
  registerOption('l', 0, NsgmlsMessages::lHelp);
  // registerOption('m', SP_T("catalog"), NsgmlsMessages::sysid, NsgmlsMessages::mHelp);
  registerOption('m', 0, NsgmlsMessages::sysid, NsgmlsMessages::mHelp);
  registerOption('r', 0, NsgmlsMessages::rHelp);
  registerOption('u', 0, NsgmlsMessages::uHelp);
  registerInfo(NsgmlsMessages::info1);
  registerInfo(NsgmlsMessages::info2);
  registerInfo(NsgmlsMessages::info3);
  registerInfo(NsgmlsMessages::info4);
  registerInfo(NsgmlsMessages::info5);
  registerInfo(NsgmlsMessages::info6);
  registerInfo(NsgmlsMessages::info7);
  registerInfo(NsgmlsMessages::info8);
}

void NsgmlsApp::processOption(AppChar opt, const AppChar *arg)
{


  switch (opt) {
  case 'B':
    batchMode_ = 1;
    break;
  case 'd':
    // warn about duplicate entity declarations
    options_.warnDuplicateEntity = 1;
    break;
  case 'l':
    // output L commands
    outputFlags_ |= SgmlsEventHandler::outputLine;
    break;
  case 'm':
    processOption(SP_T('c'), arg);
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
  case 't':
    rastOption_ = arg;
    break;
  case 'u':
    // warn about undefined elements
    options_.warnUndefinedElement = 1;
    break;
  default:
    ParserApp::processOption(opt, arg);
    break;
  }
  if (outputFlags_ & SgmlsEventHandler::outputComment) {
    options_.eventsWanted.addCommentDecls();
    options_.eventsWanted.addPrologMarkup();
  }
  if (outputFlags_ & SgmlsEventHandler::outputTagOmission)
    options_.eventsWanted.addInstanceMarkup();
}

int NsgmlsApp::processArguments(int argc, AppChar **argv)
{
  if (batchMode_) {
    int ret = 0;
    for (int i = 0; i < argc; i++) {
      if (rastOption_) {
	rastFile_.assign(rastOption_, tcslen(rastOption_));
	rastFile_.append(argv[i], tcslen(argv[i]));
	rastFile_ += SP_T('\0');
      }
      int tem = ParserApp::processArguments(1, argv + i);
      if (tem > ret)
	ret = tem;
    }
    return ret;
  }
  else
    return ParserApp::processArguments(argc, argv);
}

void NsgmlsApp::allLinkTypesActivated()
{
  if (!rastOption_)
    ParserApp::allLinkTypesActivated();
}

ErrorCountEventHandler *NsgmlsApp::makeEventHandler()
{
  if (prologOnly_)
    return new PrologMessageEventHandler(this);
  else if (rastOption_) {
    const AppChar *s = batchMode_ ? rastFile_.data() : rastOption_;
    return new XRastEventHandler(&parser_, s, convertInput(s),
				 outputCodingSystem_, this, this);
  }
  else if (suppressOutput_)
    return new MessageEventHandler(this, &parser_);
  else
    return new SgmlsEventHandler(&parser_,
				 makeStdOut(),
				 this,
				 outputFlags_);
}

PrologMessageEventHandler::PrologMessageEventHandler(class Messenger *messenger)
: MessageEventHandler(messenger)
{
}

void PrologMessageEventHandler::endProlog(EndPrologEvent *event)
{
  cancel();
  delete event;
}

XRastEventHandler::XRastEventHandler(SgmlParser *parser,
				     const NsgmlsApp::AppChar *filename,
				     const StringC &filenameStr,
				     const OutputCodingSystem *codingSystem,
				     CmdLineApp *app,
				     Messenger *messenger)
: RastEventHandler(parser, messenger),
  messenger_(messenger),
  filename_(filename),
  filenameStr_(filenameStr),
  app_(app)
{
  errno = 0;
  if (!file_.open(filename)) {
    messenger->message(CmdLineApp::openFileErrorMessage(),
		       StringMessageArg(filenameStr),
		       ErrnoMessageArg(errno));
    exit(1);
  }
  os_.open(&file_, codingSystem);
  setOutputStream(&os_);
}

XRastEventHandler::~XRastEventHandler()
{
  end();
}

void XRastEventHandler::truncateOutput()
{
  os_.flush();
  errno = 0;
  if (!file_.close())
    messenger_->message(CmdLineApp::closeFileErrorMessage(),
			StringMessageArg(filenameStr_),
			ErrnoMessageArg(errno));
  errno = 0;
  if (!file_.open(filename_)) {
    messenger_->message(CmdLineApp::openFileErrorMessage(),
			StringMessageArg(filenameStr_),
			ErrnoMessageArg(errno));
    exit(1);
  }
}

void XRastEventHandler::message(MessageEvent *event)
{
  messenger_->dispatchMessage(event->message());
  ErrorCountEventHandler::message(event);
}

