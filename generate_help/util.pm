package util;

###############################################################################
#
#  ReplaceStringInFile : Replace all occurences of a string in a file.
#
#  @param 1 : old string
#  @param 2 : new string
#  @param 3 : original file with the old string
#  @param 4 : new created file with the new string
#
###############################################################################

sub ReplaceStringInFile($$$$)
{
  my ($before,$after,$source,$dest) = @_;

  open(SOURCE_FILE, $source) || die("ReplaceStringInFile source: Couldn't open $source: $!\n");
  open(DEST_FILE, "> $dest") || die("ReplaceStringInFile dest:   Couldn't open $dest: $!\n");

  while( <SOURCE_FILE> )
  {
    eval s/$before/$after/g;
    print DEST_FILE;
  }
  close(SOURCE_FILE);
  close(DEST_FILE);
}

sub AppendFile($$)
{
  my ($source,$dest) = @_;

  open(SOURCE_FILE, $source) || die("AppendFile: Couldn't open $source: $!\n");
  open(DEST_FILE, ">> $dest") || die("AppendFile: Couldn't open $dest: $!\n");

  my $INPUT_SEP=$/;
  undef $/;

  $_ = <SOURCE_FILE>;
  close(SOURCE_FILE);
  print DEST_FILE;
  close(DEST_FILE);

  $/=$INPUT_SEP ;
}

sub GetFile($)
{
  my ($filename) = @_;

  open(SOURCE_FILE, $filename) || die("GetFile: Couldn't open $source: $!\n");

  my $INPUT_SEP=$/;
  undef $/;

  $_ = <SOURCE_FILE>;
  close(SOURCE_FILE);
  eval s/</&lt;/g;
  eval s/>/&gt;/g;
  my $result = $_;
   
  $/=$INPUT_SEP ;
  
  return $result;
}

# Left trim function to remove leading whitespace
sub ltrim($)
{
  my $string = shift;
  $string =~ s/^\s+//;
  return $string;
}


sub RemoveStringInFile($$$$)
{
  my ($begin,$end,$source,$dest) = @_;

  open(SOURCE_FILE, $source) || die("RemoveStringInFile: Couldn't open $source: $!\n");
  open(DEST_FILE, "> $dest") || die("RemoveStringInFile dest:   Couldn't open $dest: $!\n");

  while (<SOURCE_FILE>)
  {
    if( /$begin/ )
    {
      $_ = <SOURCE_FILE>;
      while( not /$end/ )
      {
        $_  = <SOURCE_FILE>;                  
      }
    }
    else
    {
      print DEST_FILE;
    }
  }
  close(SOURCE_FILE);
  close(DEST_FILE);
}

sub RemoveEmptyLines($$)
{
  my ($source,$dest) = @_;

  open(SOURCE_FILE, $source) || die("RemoveEmptyLines: Couldn't open $source: $!\n");
  open(DEST_FILE, "> $dest") || die("RemoveEmptyLines dest:   Couldn't open $dest: $!\n");
  my $line;
  while(defined($line = <SOURCE_FILE>)) {
          next unless($line =~ /\S+/);
          print DEST_FILE $line;
  }
  close(SOURCE_FILE);
  close(DEST_FILE);
}

1;