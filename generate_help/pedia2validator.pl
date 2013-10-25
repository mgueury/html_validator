#----------------------------------------------------------------------------
# Perl Script  : pedia2validator.pl
#----------------------------------------------------------------------------
#
# Require 3 additional perl packages : URI / LWP / Parser
# > http://search.cpan.org/dist/URI/
# > http://search.cpan.org/~gaas/libwww-perl-5.805/lib/LWP.pm
# > http://search.cpan.org/~gaas/HTML-Parser-3.35/Parser.pm
#
# set HTTP_PROXY=http://emeacache.uk.oracle.com/
# perl pedia2validator.pl
#----------------------------------------------------------------------------

use util;
use LWP;

###############################################################################
#
#  Simplify the HTML of the page to something usable by HtmlValidator
#
#  @param 1 : name of the file
#
###############################################################################

sub SimplifyHtml($)
{
  my ($name) = @_;
  $lcname = lc( $name );
  $origname = "tmp/$name.html";
  $destname = "pedia2validator/$lcname.html";
  util::ReplaceStringInFile( '\/w\/skins\/', '', $origname, 'tmp/step1.html' );
  util::ReplaceStringInFile( '<div class=\"editsection\".*?div>', '', 'tmp/step1.html', 'tmp/step2.html' );
  util::ReplaceStringInFile( '<script type.*script>', '', 'tmp/step2.html', 'tmp/step3.html' );
  util::ReplaceStringInFile( '<!--.*?-->', '', 'tmp/step3.html', 'tmp/step4.html' );
  util::RemoveStringInFile( '<table id=\"toc\"', '<\/table>', 'tmp/step4.html', 'tmp/step5.html' );
  util::RemoveStringInFile( '<div class=\"printfooter\">', '<\/div>', 'tmp/step5.html', 'tmp/step6.html' );
  util::ReplaceStringInFile( ' rel=\"nofollow\"', '', 'tmp/step6.html', 'tmp/step7.html' );
  util::ReplaceStringInFile( ' class=\"external text\"', '', 'tmp/step7.html', 'tmp/step8.html' );
  util::ReplaceStringInFile( 'href=\"\/wiki', 'href="http://www.htmlpedia.org/wiki', 'tmp/step8.html', 'tmp/step9.html' );
  util::ReplaceStringInFile( '<a name=.*?></a>', '', 'tmp/step9.html', 'tmp/step10.html' );
  util::ReplaceStringInFile( '<h2> Tidy:', '<h2>', 'tmp/step10.html', 'tmp/step11.html' );
  util::ReplaceStringInFile( '<h2> OpenSP:', '<h2>', 'tmp/step11.html', 'tmp/step12.html' );
  util::ReplaceStringInFile( 'src=\'\/skin\/good.gif', 'src=\'../../../skin/good.png', 'tmp/step12.html', 'tmp/step13.html' );
  util::ReplaceStringInFile( 'src=\'\/skin\/error.gif', 'src=\'../../../skin/error.png', 'tmp/step13.html', 'tmp/step14.html' );
  util::ReplaceStringInFile( '\" title=\".*?\">', '">', 'tmp/step14.html', 'tmp/step15.html' );
  util::ReplaceStringInFile( ' class=\"external free\"', '', 'tmp/step15.html', 'tmp/step16.html' );
  util::ReplaceStringInFile( '<style.*?style>', '<link rel="stylesheet" type="text/css" href="tidy_help2.css" media="screen, projection"/>', 'tmp/step16.html', 'tmp/step17.html' );
  util::RemoveEmptyLines( 'tmp/step17.html', $destname );

  print "Created: $destname\n";
}

###############################################################################
#
#  Get a file from HtmlPedia with MySkin
#
#  @param 1 : the string
#
###############################################################################

sub GetFromHtmlPedia($$)
{
  my ($browser,$name) = @_;
  $request = HTTP::Request->new(GET => 'http://www.htmlpedia.org/w/index.php?title='.$name.'&useskin=myskin');
  $response = $browser->request($request);

  # Simplify the HTML by removing 
  # ${$response->content_ref} =~ s/\/w\/skins\///g;
  # ${$response->content_ref} =~ s/<div class=\"editsection\".*div>//g;
  # ${$response->content_ref} =~ s/<script type.*script>//g;
 
  $filename = "tmp/$name.html";
  open(DEST_FILE, "> $filename") || die("GetFromHtmlPedia: Couldn't open $filename: $!\n");
  print DEST_FILE $response->content;
  close(DEST_FILE);
  
  print "Download: $name\n";
  return $filename;
}


###############################################################################
#
#  Loop throught the table index in the Wiki to find all the files to download
#
#  @param 1 : the string
#
###############################################################################

sub LoopTable($$$)
{
  my ($browser,$name,$prefix) = @_;
  
  print "-------------------------- $name ---------------------------------\n";
  $filename = GetFromHtmlPedia( $browser, $name );
  open(SOURCE_FILE, $filename ) || die("AppendFile: Couldn't open $filename: $!\n");

  # Loop throught the HTML looking for wiki/$prefix
  while (<SOURCE_FILE>)
  {
    if( /wiki\/$prefix/ )
    {
      # Get the name of the Wiki item
      my ($t1, $t2)    = split( '<a href="/wiki/', $_ );
      my ($title, $t3) = split( '"', $t2) ;
      print "Found: $title\n";
      
      GetFromHtmlPedia( $browser, $title );
      SimplifyHtml($title);
      print "---- Done: $ title\n";
    }
  }
  close(DEST_FILE);
}

###############################################################################
#
# Main
#
###############################################################################

$browser = LWP::UserAgent->new;
$browser->env_proxy;

# $file = 'Sp_120';
# GetFromHtmlPedia( $browser, $file );
# SimplifyHtml($file);

LoopTable( $browser, 'HTML_Tidy', 'Tidy_' );
LoopTable( $browser, 'Opensp', 'Sp_' );
LoopTable( $browser, 'Access', 'Access_' );

