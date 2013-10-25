cd ..

rm -rf gueury.com/mozilla_tidy_source
rm gueury.com/mozilla_tidy_source.zip
mkdir gueury.com\mozilla_tidy_source
mkdir gueury.com\mozilla_tidy_source\mozilla
mkdir gueury.com\mozilla_tidy_source\mozilla\extensions

cp -r firefox/mozilla-central/mozilla-central/extensions/tidy gueury.com/mozilla_tidy_source/mozilla/extensions
      
Rem remove last help from Htmlpedia
rm tidy_jsc/generate_help/pedia2validator/*

Rem Normal
cp -r tidy_jsc gueury.com/mozilla_tidy_source

Rem Stable
Rem cp -r tidy_stable gueury.com/mozilla_tidy_source
Rem mv gueury.com/mozilla_tidy_source/tidy_stable gueury.com/mozilla_tidy_source/tidy_jsc
Rem rm gueury.com/mozilla_tidy_source/tidy_jsc/build_stable.*
Rem cp tidy_jsc/build_xpi.* gueury.com/mozilla_tidy_source/tidy_jsc/.

rm gueury.com/mozilla_tidy_source/mozilla/extensions/tidy/Makefile
rm gueury.com/mozilla_tidy_source/mozilla/extensions/tidy/test/Makefile
rm gueury.com/mozilla_tidy_source/mozilla/extensions/tidy/src/Makefile
rm gueury.com/mozilla_tidy_source/mozilla/extensions/tidy/spvalid/Makefile

rm -f gueury.com/mozilla_tidy_source/tidy_jsc/*.jar
rm -f gueury.com/mozilla_tidy_source/tidy_jsc/*.xpi
rm -Rf gueury.com/mozilla_tidy_source/tidy_jsc/platform
rm -Rf gueury.com/mozilla_tidy_source/tidy_jsc/linux
rm -Rf gueury.com/mozilla_tidy_source/tidy_jsc/old

cd gueury.com
zip -r mozilla_tidy_source.zip mozilla_tidy_source

cp mozilla_tidy_source.zip html/mozilla/tidy_09x_source.zip

cp mozilla_tidy_source.zip ../backup/source_0959.zip

pause