rm spvalid/osp.lib

REM # Clean the OpenSP project
cd opensp
chmod -R +w *
msdev SP.dsw /make all /clean
del SP.ncb

REM # This is needed to avoid re-compilation issues
REM dos2unix */*
REM unix2dos */*.dsp
REM unix2dos *.mak
REM unix2dos *.dsw
REM unix2dos *.bat

REM This is done to avoid include file clash between Tidy and OpenSP
mv lib/*.h include
cd ..
