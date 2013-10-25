mkdir ..\..\objdir-ff-release\
mkdir ..\..\objdir-ff-release\extensions
mkdir ..\..\objdir-ff-release\extensions\tidy
mkdir ..\..\objdir-ff-release\extensions\tidy\src
mkdir ..\..\objdir-ff-release\extensions\tidy\tidy
mkdir ..\..\objdir-ff-release\extensions\tidy\tidy\src
mkdir ..\..\objdir-ff-release\extensions\tidy\opensp
mkdir ..\..\objdir-ff-release\extensions\tidy\opensp\cpp


echo *** Please set the ENV of Mozilla before to run this !
echo *** Build OpenSP
cd opensp
rem Rem call build-win32.bat
rem nmake -f sp-generate.mak
rem vcexpress.exe SP.dsw /make "osp_static - win32 release"
cd ..

echo *** Copy the lib in SpValid
cp opensp\lib\Release\osp_static.lib ..\..\objdir-ff-release\extensions\tidy\src\osp_static.lib

echo *** Make tidy
make
