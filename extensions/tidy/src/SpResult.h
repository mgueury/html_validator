class SpResult
{
public:
  unsigned infoCount_;
  unsigned warningCount_;
  unsigned errorCount_;

  SpResult();
};

#ifdef WIN32
  extern int spvalid( int argc, unsigned short **argv, SpResult * res );
  extern int spValidMem( int argc, unsigned short **argv, SpResult * res, char ** aError );
#else
  extern int spvalid( int argc, char **argv, SpResult * res );
  extern int spValidMem( int argc, char **argv, SpResult * res, char ** aError );
#endif
