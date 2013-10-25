#!/bin/sh

basename="$(basename "$0" || echo "$0")"
dirname="$(dirname "$0" || echo ".")"

run() {
   command=$@
   # Uncommand the next line for debugging this script.
   #echo "$basename: Executing \"${command}\""
   ${command}
   status=$?
   if test $status -ne 0; then
      echo "$basename: Execution of \"${command}\" failed (exit status ${status})"
      echo "$basename: aborted (exit status ${status})"
      exit ${status}
   fi
}

cd "${dirname}/opensp"
chmod -R +rw *
run libtoolize --copy --force
run chmod +x autoinit.sh
run ./autoinit.sh
# run ./configure --disable-doc-build --with-pic
run ./configure --disable-doc-build --with-pic --disable-nls CXXFLAGS=-fno-rtti
cp config.h cpp/config.h
run cd ..
cd ../../objdir-ff-release/extensions/tidy
run make

echo -------------- CHECKUP -------------
echo --- CHECK: SIZE ---
ls -al src/libnstidy.so
echo --- CHECK: LINKED LIBS ---
ldd src/libnstidy.so
echo --- CHECK: EXPORTED C FUNCTIONS ---
nm src/libnstidy.so | grep libTidy

# cd opensp
# ln -s `which libtool` libtool
# chmod -R +rw *
# aclocal
# autoheader
# automake --add-missing
# autoconf
# ./configure --disable-doc-build CXXFLAGS=-O3
# make
# cd ..
# 
# cp opensp/lib/.libs/libosp.a src
# make



