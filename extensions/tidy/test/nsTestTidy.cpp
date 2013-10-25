/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: NPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Netscape Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Suresh Duddi <dp@netscape.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the NPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the NPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#include <stdio.h>

#include "nsITidy.h"
#include "nsIServiceManager.h"
#include "nsIComponentRegistrar.h"
#include "nsEmbedString.h"

#ifdef XPCOM_GLUE
#include "nsXPCOMGlue.h"
#include "nsMemory.h"
#else
#include "nsXPIDLString.h"
#endif

#define NS_TIDY_CONTRACTID "@mozilla.org/tidy;1"

void AnalyzeLine( nsCOMPtr<nsITidy> mytidy, const char *aError )
{
    PRInt32 aLine = -1;
    PRInt32 aColumn = -1;
    PRInt32 aType = -1;
    char * aText = "";
    PRInt32 aErrorId = -1;
    char * aArg1 = "";
    char * aArg2 ="";
    char * aArg3 = "";
    nsACString aUTF8Error;
    nsresult rv = NS_OK;

    // Should be maybe initialized.

    printf("Error: %s\n", aError);
    rv = NS_CStringSetData( aUTF8Error, aError );
    printf("----------------------------------------------------------------\n");
    mytidy->AnalyzeLine( aUTF8Error, &aLine, &aColumn, &aType, &aText, &aErrorId, &aArg1, &aArg2, &aArg3 );
    printf("----------------------------------------------------------------\n");
    printf("line: %d column: %d ErrorId: %d, arg1: %s, arg2: %s\n", aLine, aColumn, aErrorId, aArg1, aArg2);
    printf("----------------------------------------------------------------\n");
}

void GetErrorDescription( nsCOMPtr<nsITidy> mytidy, int aErrorId )
{
    const char * aUTF8ErrorDesc;
    nsACString aErrorDesc;

    mytidy->GetErrorDescription( aErrorId, aErrorDesc );
    NS_CStringGetData(aErrorDesc, &aUTF8ErrorDesc);
    printf("<tr>\n");
    printf("  <td><a href=\"tidy_%d.html\">%d</a></td>\n", aErrorId, aErrorId);
    printf("  <td>%s</td>\n", aUTF8ErrorDesc);
    printf("  <td>.</td>\n");
    printf("</tr>\n");
}

int
main(void)
{
    nsresult rv;

#ifdef XPCOM_GLUE
    XPCOMGlueStartup(nsnull);
#endif

    // Initialize XPCOM
    nsCOMPtr<nsIServiceManager> servMan;
    rv = NS_InitXPCOM2(getter_AddRefs(servMan), nsnull, nsnull);
    if (NS_FAILED(rv))
    {
        printf("ERROR: XPCOM intialization error [%x].\n", rv);
        return -1;
    }
    // register all components in our default component directory
    nsCOMPtr<nsIComponentRegistrar> registrar = do_QueryInterface(servMan);
    NS_ASSERTION(registrar, "Null nsIComponentRegistrar");
    registrar->AutoRegister(nsnull);

    nsCOMPtr<nsIComponentManager> manager = do_QueryInterface(registrar);
    NS_ASSERTION(registrar, "Null nsIComponentManager");

    // Create an instance of our component
    nsCOMPtr<nsITidy> mytidy;
    rv = manager->CreateInstanceByContractID(NS_TIDY_CONTRACTID,
                                             nsnull,
                                             NS_GET_IID(nsITidy),
                                             getter_AddRefs(mytidy));
    if (NS_FAILED(rv))
    {
        printf("ERROR: Cannot create instance of component " NS_TIDY_CONTRACTID " [%x].\n"
               "Debugging hint:\n"
               "\tsetenv NSPR_LOG_MODULES nsComponentManager:5\n"
               "\tsetenv NSPR_LOG_FILE xpcom.log\n"
               "\t./nsTestTidy\n"
               "\t<check the contents for xpcom.log for possible cause of error>.\n",
               rv);
        return -2;
    }

    // Call methods on our tidy to test it out.
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: <form> lacks \"action\" attribute" );
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: missing </span> before </td>" );
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: unescaped & which should be written as &amp;" );
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: 111 invalid character code 222" );
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: 111 invalid UTF-8 bytes (char. code 222)" );
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: replacing obsolete element 111 by 222" );
    AnalyzeLine( mytidy, "line 123 column 456 - Error: <111> is probably intended as </222>" );
    AnalyzeLine( mytidy, "line 123 column 456 - Warning: this is not a real error message" );
    AnalyzeLine( mytidy, "line 123 column 456 - Access: [6.1.1.2]: style sheets require testing (style element)." );

    AnalyzeLine( mytidy, "this is not a real error message" );

    for( int i=1; i<=85; i++ )
    {
      GetErrorDescription( mytidy, i );
    }

    // Test the set translation
    // mytidy->SetTranslationPrefix( "Info: ,Warning: ,Config: ,Access: ,Error: ,Document: ,Panic: " );

    printf("#--------------------------------------------------------------\n");
    printf("To copy in local/en-US/tidy.propoerties\n" );
    mytidy->PrintEnglishTranslation();

    printf("Test passed.\n");

    // All nsCOMPtr's must be deleted prior to calling shutdown XPCOM
    // as we should not hold references passed XPCOM Shutdown.
    servMan = 0;
    registrar = 0;
    manager = 0;
    mytidy = 0;

    // Shutdown XPCOM
    NS_ShutdownXPCOM(nsnull);

#ifdef XPCOM_GLUE
    XPCOMGlueShutdown();
#endif
    return 0;
}
