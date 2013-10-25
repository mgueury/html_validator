REM ** Clean the mozilla project 
make clean
rm src/osp.lib

REM ** Clean the OpenSP project
cd opensp
chmod -R +w *
msdev SP.dsw /make all /clean
del SP.ncb
Rem ** Remove the config.h of Windows
rm include/config.h 
del /S /Q lib\Release
del /S /Q lib\Debug

cd ..
