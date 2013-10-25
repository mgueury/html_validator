// Copyright (c) 1994 James Clark
// See the file COPYING for copying permission.

#ifndef Nsgmls_INCLUDED
#define Nsgmls_INCLUDED 1

#include "SpResult.h"
#include "ParserApp.h"
#include "Boolean.h"

#ifdef SP_NAMESPACE
using namespace SP_NAMESPACE;
#endif

class ValidMessageEventHandler;

class SpValidApp : public ParserApp {
public:
  SpValidApp( SpResult * res );
  ~SpValidApp();

  int processArguments(int argc, AppChar **argv);
  ErrorCountEventHandler *makeEventHandler();
  void processOption(AppChar opt, const AppChar *arg);
  void allLinkTypesActivated();
  void initCodingSystem(const char *requiredInternalCode);

  typedef struct OptionFlags
  {
    // Qualifier works around CodeWarrior bug
    CmdLineApp::AppChar *name;
    unsigned flag;
  } OptionFlags;
  static const OptionFlags outputOptions[];

  SpResult * res_;
  StrOutputByteStream str_;
  StringC * sInput;
  char * sBuffer;

private:
  Boolean suppressOutput_;
  Boolean prologOnly_;
  unsigned outputFlags_;
  Boolean batchMode_;
  ValidMessageEventHandler * handler_;
};

#endif
