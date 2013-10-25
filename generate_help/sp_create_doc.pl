#----------------------------------------------------------------------------
# Perl Script  : sp_create_doc.pl
#----------------------------------------------------------------------------

use util;

# Initialize the results hash to null.
            
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
        my $file = "doc/sp_".$id.".html";
        print( $file."\n" );

        # get the text
        my $text = "";
        $line = <SRC_FILE>;
        $line = <SRC_FILE>;
        $line = <SRC_FILE>;
        while( not $line=~/<\/p>/ )
        {
          $text = $text . $line;
          $line = <SRC_FILE>;                  
        }
        $line = <SRC_FILE>;  

        util::ReplaceStringInFile( '##TITLE##', $title, 'src/sp_template.html', 'tmp/step1.html' );
        util::ReplaceStringInFile( '##TEXT##', $text, 'tmp/step1.html' , $file );        
      }
    }
  }
  close(SRC_FILE);
}
else
{
  die "Error reading file error_messages.cfg";
}