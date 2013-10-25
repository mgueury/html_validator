#/bin/bash

# Looping in all directory

for f in *-*
do
  if [ "$f" = "en-US" ]; then
    echo "Skip - $f"
  else 
    echo "Modify - $f"
    cat to_add.txt >> $f/tidy/tidy.dtd
  fi
done