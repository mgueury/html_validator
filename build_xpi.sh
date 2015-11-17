#!/bin/sh

# Build a XPI file
#
# History :
#   - 15/08/2004 creation
#   - 24/10/2004 unix version
#

# set the var VERSION and change the RDF and JS file
. ./version.sh


if [ "$1" = "WINDOWS" ]; then
  LIB_NAME=nstidy.dll
  POSTFIX=win_$VERSION
  cp install.js xpi/.
else
  OS="$(uname)"
  if [ $OS = "Darwin" ]; then
    echo OS X version
    LIB_NAME=libnstidy.dylib
    POSTFIX=macos_$VERSION
  elif [ $OS = "FreeBSD" ]; then
    echo FreeBSD version
    LIB_NAME=libnstidy.so
    POSTFIX=freebsd_$VERSION
  elif [ $OS = "Linux" ]; then
    LIB_NAME=libnstidy.so
    ARCHITECTURE="$(uname -m)"
    if [ $ARCHITECTURE = "i386" -o $ARCHITECTURE = "i486" -o $ARCHITECTURE = "i686" ]; then
      POSTFIX="linux_$VERSION"
    elif [ $ARCHITECTURE = "x86_64" ]; then
      POSTFIX="linux64_$VERSION"
    else
      POSTFIX="linux_$ARCHITECTURE_$VERSION"
    fi
  fi
  cat install.js | sed -e "s/nstidy.dll/$LIB_NAME/" > xpi/install.js 
  cat chrome.manifest | sed -e "s/nstidy.dll/$LIB_NAME/" > xpi/chrome.manifest
fi

# ---------------------------------------------------------------
# Common

rm ../build/tidy.jar
rm ../build/tidy_mozilla_$POSTFIX.xpi
rm ../build/tidy_firefox_$POSTFIX.xpi

# ---------------------------------------------------------------
# Firefox

# cp ../../firefox/mozilla-central/mozilla-central/objdir-ff-release/dist/bin/$LIB_NAME xpi/components
# cp ../../firefox/mozilla-central/mozilla-central/objdir-ff-release/extensions/tidy/src/$LIB_NAME.manifest xpi/components
# cp ../firefox/mozilla-central/mozilla-central/objdir-ff-release/dist/bin/components/nstidy.xpt ../xpi/components
cd xpi
touch components/.autoreg
zip -r ../../build/tidy_firefox_$POSTFIX.xpi *
cd ..

# For easing the installation and testing of the file
cp ../build/tidy_firefox_$POSTFIX.xpi ../build/tidy_firefox.xpi 

# Remove the file in XPI, the good on is ./intall.js
rm xpi/install.js

# ---------------------------------------------------------------

