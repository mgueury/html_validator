////
//// localize.c
////

#define TALLOC &TY_(g_default_allocator)

struct _msgfmt
{
  uint code;
  ctmbstr fmt;
  ctmbstr translation;
  uint disabled;
};
extern struct _msgfmt msgFormat[];

struct _msgPrefix
{
  TidyReportLevel level;
  ctmbstr prefix;
};
extern struct _msgPrefix msgPrefix[];

extern char * gLineColumnFormat;

ctmbstr GetFormatFromCode(uint code);
char* LevelPrefix( TidyReportLevel level, char* buf, size_t count );
Bool UpdateCount( TidyDocImpl* doc, TidyReportLevel level );
uint tidyHiddenCount( TidyDoc tdoc );
char* ReportPosition(TidyDocImpl* doc, int line, int col, char* buf, size_t count);
void messagePos( TidyDocImpl* doc, TidyReportLevel level, int line, int col, ctmbstr msg, va_list args );
char * ReportPosition(TidyDocImpl* doc, int line, int col, char* buf, size_t count);
void AccessibilityHelloMessage( TidyDocImpl* doc );
void TY_(ReportMarkupVersion)( TidyDocImpl* doc );

int tidyDocStatus( TidyDocImpl* impl );
