# Set the var VERSION and change the RDF and JS file 
#
# History : 
#   - 11/11/2004 creation
#

# export OLD_VERSION=0.9.7.3.beta
export OLD_VERSION=0.9.7.3.beta
export NEW_VERSION=0.9.7.3

export OLD_HTMLPEDIA="Htmlpedia 2007-06-16"
export NEW_HTMLPEDIA="Htmlpedia 2010-01-23"

export OLD_LIBRARY="aVersion = 20090409"
export NEW_LIBRARY="aVersion = 20100903"

mkdir old
cp install.js old/install.js.old
cp xpi/install.rdf old/install.rdf.old
cp xpi/content/tidy/tidyHelp.xul old/tidyHelp.xul.old
cp ../firefox/mozilla-central/mozilla-central/extensions/tidy/src/nsTidy.cpp old/nsTidy.cpp.old
cat old/install.js.old | sed -e "s/$OLD_VERSION/$NEW_VERSION/" > install.js
cat old/install.rdf.old | sed -e "s/$OLD_VERSION/$NEW_VERSION/" > xpi/install.rdf
cat old/tidyHelp.xul.old | sed -e "s/$OLD_VERSION/$NEW_VERSION/" > old/tidyHelp.xul.old2
cat old/tidyHelp.xul.old2 | sed -e "s/$OLD_HTMLPEDIA/$NEW_HTMLPEDIA/" > xpi/content/tidy/tidyHelp.xul
cat old/nsTidy.cpp.old | sed -e "s/$OLD_LIBRARY/$NEW_LIBRARY/" > ../firefox/mozilla-central/mozilla-central/extensions/tidy/src/nsTidy.cpp


export VERSION=`echo $NEW_VERSION | sed -e "s/\.//g"`
export OVERSION=`echo $OLD_VERSION | sed -e "s/\.//g"`
echo "VERSION = $VERSION"

cp copy_to_sourceforge.bat old/copy_to_sourceforge.bat.old
cat old/copy_to_sourceforge.bat.old | sed -e "s/$OVERSION/$VERSION/" > copy_to_sourceforge.bat

cp update_gueury_com+backup.bat old/update_gueury_com+backup.bat.old
cat old/update_gueury_com+backup.bat.old | sed -e "s/$OVERSION/$VERSION/" > update_gueury_com+backup.bat

cp ../cvs_update.bat old/cvs_update.bat.old
cat old/cvs_update.bat.old | sed -e "s/$OVERSION/$VERSION/" > ../cvs_update.bat

cp ../linux/make_linux.bat old/make_linux.bat.old
cat old/make_linux.bat.old | sed -e "s/$OVERSION/$VERSION/" > ../linux/make_linux.bat
