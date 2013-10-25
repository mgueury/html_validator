#----------------------------------------------------------------------------
# Perl Script  : access_create_doc.pl
#----------------------------------------------------------------------------

use util;

# Initialize the results hash to null.
my %accessMessages = ();
            
# Open the input file.
if (open(LOC_FILE, "src/localize_c.txt"))
{
  while (<LOC_FILE>)
  {
    if( /}/ )
    {
      my ($t1,$value,$t2) = split( '"', $_ );
      my ($t3,$t4) = split( '\[', $value);
      my ($key,$t5) = split( '\]', $t4) ;
      
      $value =~ s/</&lt;/g; 
      $value =~ s/>/&gt;/g; 

      # remove the . at the end of the value
      chop $value;

      $accessMessages{$key} = "Access: ".$value;
    }
  }
  close(LOC_FILE);
}
else
{
  die "Error reading file localize_c.txt";
}


# Open the input file.
if (open(SRC_FILE, "src/accessibilitychecks.html"))
{
  while (<SRC_FILE>)
  {
    if( /number / )
    {
      my ($t1, $t2)    = split( '<b>', $_ );
      my ($title, $t3) = split( '</b>', $t2) ;
      
      print( $title."\n" );

      my ($t1, $t2)    = split( 'number \[', $title );
      my ($id, $t3) = split( '\] -', $t2 );
      my $file = "doc/access_".$id.".html";
      print( $file."\n" );
     
      my ($t1, $priority) = split( 'Priority ', $title );

      # get the text
      my $text = "";
      $line = <SRC_FILE>;
      $line = <SRC_FILE>;
      while( not $line=~/<br>/ )
      {
        $text = $text . $line;
        $line = <SRC_FILE>;                  
      }
      my ($t1, $t2)    = split( '<br>', $line );
      $text = $text . $t1;

      # get the testfile name
      $line = <SRC_FILE>;         
      while( not $line=~/Testfile<\/a>/ )
      {
        $line = <SRC_FILE>;   
        
      }
      my ($t1, $t2) = split( 'www.aprompt.ca/Tidy/', $line );     
      my ($testfilename, $t3) = split( '">', $t2 );     
      
      print( $testfilename."\n" );
      
      my $testfile = util::GetFile( 'src/testfile/'.$testfilename );
      print( $testfile."\n" );

      util::ReplaceStringInFile( '##TITLE##', $accessMessages{$id}, 'src/tidy_template.html', 'tmp/step1.html' );
      util::ReplaceStringInFile( '##PRIORITY##', $priority, 'tmp/step1.html', 'tmp/step2.html' );
      util::ReplaceStringInFile( '##TEXT##', $text, 'tmp/step2.html' , 'tmp/step3.html' );        
      util::ReplaceStringInFile( '##TESTFILE##', $testfile, 'tmp/step3.html' , $file );        
    }
  }
  close(SRC_FILE);
}
else
{
  die "Error reading file accessibilitychecks.html";
}