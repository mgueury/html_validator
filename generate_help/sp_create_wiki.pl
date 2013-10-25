#----------------------------------------------------------------------------
# Perl Script  : sp_create_doc.pl
#----------------------------------------------------------------------------

use util;

# Initialize the results hash to null.

unlink( 'doc/sp.wiki' );
unlink( 'doc/sp_list.wiki' );
            
# Open the input file.
if (open(SRC_FILE, "src/error_messages.cfg"))
{
  while (<SRC_FILE>)
  {
    if( /msg / )
    {
      my ($t1, $t2)    = split( '<msg ', $_ );
      my ($id, $t3) = split( '>', $t2) ;
      
      print( $id."\n" );
     
      # get the text
      $line = <SRC_FILE>; 
      my ($t3, $t4) = split( 'original =', $line) ;
      my ($t5, $title, $t6) = split( '"', $t4);
            
      $line = <SRC_FILE>;
      if( $line=~/verbose/ )
      {
        my $file = "sp_".$id;
        print( $file."\n" );

        # get the text
        my $text = "";
        $line = <SRC_FILE>;
        $line = <SRC_FILE>;
        $line = <SRC_FILE>;
        while( not $line=~/<\/p>/ )
        {
          $text = $text . util::ltrim($line);
          $line = <SRC_FILE>;                  
        }
        $line = <SRC_FILE>;  

        # Wiki to bulkupload
        util::ReplaceStringInFile( '##TITLE##', $title, 'src/sp_template.wiki', 'tmp/step1.wiki' );
        util::ReplaceStringInFile( '##TEXT##', $text, 'tmp/step1.wiki' , 'tmp/step2.wiki' );        
        util::ReplaceStringInFile( '##NAME##', $file, 'tmp/step2.wiki' , 'tmp/step3.wiki' );        
        util::AppendFile( 'tmp/step3.wiki' , 'doc/sp.wiki' );        
        
        # List of the errors
        util::ReplaceStringInFile( '##TITLE##', $title, 'src/list.wiki', 'tmp/step1.wiki' );
        util::ReplaceStringInFile( '##NAME##', $file, 'tmp/step1.wiki' , 'tmp/step2.wiki' );        
        util::AppendFile( 'tmp/step2.wiki' , 'doc/sp_list.wiki' );        
      }
    }
  }
  close(SRC_FILE);
}
else
{
  die "Error reading file error_messages.cfg";
}