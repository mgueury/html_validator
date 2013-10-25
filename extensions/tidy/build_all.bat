echo *** Please set the ENV of Mozilla before to run this !
echo *** Build OpenSP
cd opensp
Rem call build-win32.bat
nmake -f sp-generate.mak
msdev SP.dsw /make "osp_static - win32 release"
cd ..

echo *** Copy the lib in SpValid
cp opensp/lib/Release/osp_static.lib src/osp.lib

echo *** Make tidy
make