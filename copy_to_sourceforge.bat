rem http://sourceforge.net/apps/trac/sourceforge/wiki/SSH%20keys

scp tidy_firefox_*0973.xpi mgueury@web.sourceforge.net:/home/groups/h/ht/htmlvalidator/htdocs/mozilla/. 
scp platform/tidy_firefox_*0973.xpi mgueury@web.sourceforge.net:/home/groups/h/ht/htmlvalidator/htdocs/mozilla/. 
scp ../gueury.com/html/mozilla/tidy_09x_source.zip mgueury@web.sourceforge.net:/home/groups/h/ht/htmlvalidator/htdocs/mozilla/tidy_09x_source.zip

rem scp linux/tidy_firefox.xpi mgueury@shell.sourceforge.net:/home/groups/h/ht/htmlvalidator/htdocs/mozilla/tidy_firefox_linux.xpi

@echo cd  /home/project-web/htmlvalidator/htdocs/mozilla/
@echo chmod 664 *

ssh -t mgueury,htmlvalidator@shell.sourceforge.net create
ssh mgueury,htmlvalidator@shell.sourceforge.net 
