All the files contained in this directory comes from Tidy

See http://tidy.sourceforge.net/

tidy_src.tgz : 05-may-2007 (from CVS)

Fixed in the last CVS
---------------------
bug 1703277 -  [13.2.1.2]: Metadata missing (link element)
http://sourceforge.net/tracker/index.php?func=detail&aid=1703277&group_id=27659&atid=390963
Fixed in CVS

bug 1173386 - Too big attribute in can cause tidy to crash 
Fixed in CVS

bug 1282835 - AREA tags report missing HREF attribute
Fixed in CVS

bug 1263391 - ADDRESS tag is wrongly defined as BLOCK container
Fixed in CVS

bug 1286029 - Warning about empty action attribute in Form
Fixed in CVS

Changes from the original code.
-------------------------------
** FIX **
bug 1062661 - Columns number are wrong after <script></script>
              -> Not fixed in CVS
** CHANGE **

#include "translation.h"
/*
struct _msgfmt
{
    uint code;
    ctmbstr fmt;
}
*/

struct _msgfmt msgFormat[] =

commented some functions in localize.c

** Sent a mail to TidyDev mailing list **
-> to allow the alt again, I did this in tags.c

OLD:
if ( cfg(doc, TidyAccessibilityCheckLevel) == 0 )
{
    doc->badAccess |= MISSING_IMAGE_ALT;
    ReportMissingAttr( doc, node, "alt" );
}

NEW:

int access_level = cfg(doc, TidyAccessibilityCheckLevel);
if ( access_level <= 0  )
{
    doc->badAccess |= MISSING_IMAGE_ALT;
    ReportMissingAttr( doc, node, "alt" );
}
         
** Added in tidy-int.h

    uint                hidden;

              
