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
  #ifndef SPVALID_MAIN
    extern int spValidMem( int argc, unsigned short **argv, SpResult * res, nsACString& aError ); 
  #endif
#else
  extern int spvalid( int argc, char **argv, SpResult * res );
  extern int spValidMem( int argc, char **argv, SpResult * res, nsACString& aError );
#endif
