cd C:\my_prog\html_validator\src\browser_extension\fake\html
echo off
echo To test the tidy.js library, chrome needs a HTTP Server (Else there is a CORS error)
echo Use this URL:
echo  http://127.0.0.1:8081/tidy_view_source.html
echo
http-server


