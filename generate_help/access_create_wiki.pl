#----------------------------------------------------------------------------
# Perl Script  : create_wiki.pl
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

unlink("doc/access.wiki");
unlink("doc/access_list.wiki");

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
      my $file = "access_".$id;
      print( $file."\n" );
     
      my ($t1, $priority) = split( 'Priority ', $title );

      # get the text
      my $text = "";
      $line = <SRC_FILE>;
      $line = <SRC_FILE>;
      while( not $line=~/<br>/ )
      {
        $text = $text . util::ltrim($line);
        $line = <SRC_FILE>;                  
      }
      my ($t1, $t2)    = split( '<br>', $line );
      $text = $text . util::ltrim($t1);

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

      # Wiki to bulkupload
      util::ReplaceStringInFile( '##TITLE##', $accessMessages{$id}, 'src/tidy_template.wiki', 'tmp/step1.wiki' );
      util::ReplaceStringInFile( '##PRIORITY##', $priority, 'tmp/step1.wiki', 'tmp/step2.wiki' );
      util::ReplaceStringInFile( '##TEXT##', $text, 'tmp/step2.wiki' , 'tmp/step3.wiki' );        
      util::ReplaceStringInFile( '##TESTFILE##', $testfile, 'tmp/step3.wiki' , 'tmp/step4.wiki' );        
      util::ReplaceStringInFile( '##NAME##', $file, 'tmp/step4.wiki' , 'tmp/step5.wiki' );        
      util::AppendFile( 'tmp/step5.wiki' , 'doc/access.wiki' );        

      # List of the errors
      util::ReplaceStringInFile( '##TITLE##', $accessMessages{$id}, 'src/list.wiki', 'tmp/step1.wiki' );
      util::ReplaceStringInFile( '##NAME##', $file, 'tmp/step1.wiki' , 'tmp/step2.wiki' );        
      util::AppendFile( 'tmp/step2.wiki' , 'doc/access_list.wiki' );          
    }
  }
  close(SRC_FILE);
}
else
{
  die "Error reading file accessibilitychecks.html";
}

