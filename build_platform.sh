#!/bin/bash

# Build all platforms in once
#
# History :
#   - 22/01/2008 creation
#   - 24/10/2004 unix version
#

function build_platform {
  echo Platform $1 

  POSTFIX=$1_$VERSION
  if [ "$1" = "win" ]; then
    LIB_NAME=nstidy.dll
  elif [ "$1" = "macos" ]; then
    LIB_NAME=libnstidy.dylib
  elif [ "$1" = "macos32" ]; then
    LIB_NAME=libnstidy.dylib
  elif [ "$1" = "macos64" ]; then
    LIB_NAME=libnstidy.dylib
  elif [ "$1" = "macintel" ]; then
    LIB_NAME=libnstidy.dylib
  elif [ "$1" = "openbsd" ]; then
    LIB_NAME=libnstidy.so.19.0
  elif [ "$1" = "openbsd64" ]; then
    LIB_NAME=libnstidy.so.19.0
  else
    LIB_NAME=libnstidy.so
  fi
  
  cat install.js | sed -e "s/nstidy.dll/$LIB_NAME/" > xpi/install.js

  rm ../build_platform/tidy_firefox_$POSTFIX.xpi

  rm xpi/components/nstidy.dll
  rm xpi/components/libnstidy.so
  rm xpi/components/libnstidy.so.19.0
  rm xpi/components/libnstidy.dylib
  rm xpi/components/nstidy.xpt

  cp ../build_platform/$1/components/$LIB_NAME xpi/components
  cp ../build_platform/$1/components/nstidy.xpt xpi/components

  cat chrome.manifest | sed -e "s/nstidy.dll/$LIB_NAME/" > xpi/chrome.manifest
  

  cd xpi
  touch components/.autoreg
  zip -r ../../../build_platform/tidy_firefox_$POSTFIX.xpi *
  cd ..
  
  rm xpi/install.js
}  

. ./version.sh
build_platform linux
build_platform linux64
build_platform macos
