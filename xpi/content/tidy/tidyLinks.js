//*************************************************************************
// HTML Validator
//
//  File: tidyLinks.js
//  Description: javascript for the dialog box of the links window
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

//-------------------------------------------------------------

var oTidyLinks;

function onLoadTidyLinks()
{
  onLoadTidyUtil();
  oTidyLinks = new TidyLinks();
  oTidyLinks.start();  
}

function onUnloadTidyLinks()
{
  onUnloadTidyUtil();
  delete oTidyLinks;
  oTidyLinks = null;
}

//-------------------------------------------------------------
// TidyLinksRow
//-------------------------------------------------------------

function TidyLinksRow( _url, _status, _level, _referer )
{
  this.url = _url;
  this.status = _status;
  this.level = _level;
  this.referer = _referer;
}

TidyLinksRow.prototype =
{
  icon : "new",
  url  : null,
  type : null,
  size : null,
  status : null,
  result : null,
  linkIn : 1,
  linkOut : 0,
  level : 0,
  referer : null
}

//-------------------------------------------------------------
// oTidyLinks
//-------------------------------------------------------------

function TidyLinks()
{
  this.aRow = new Array(); // Data for each row
}

TidyLinks.prototype =
{
  xulTree: null,
  xulUrl: null,

  // Tree interface
  rows: 0,          // number of rows of the tree
  tree: null,       // tree interface
  
  // Horizontal scrolling
  hScrollPos: 0,
  hScrollMax: 0,
  datapresent: "datapresent",

  /** __ treeView ________________________________________________________________
   * 
   * Implementation of all needed function for the tree interface
   */    
  set rowCount(c) { throw "rowCount is a readonly property"; },
  get rowCount() { return this.rows; },
  getCellText: function(row, col) 
  {
    var id = (col.id?col.id:col); // Compatibility Firefox 1.0.x  
    if( id=="col_id" ) 
    {
      return row;
    } 
    else if( id=="col_url" ) 
    {
      return this.aRow[row].url
    }
    else if( id=="col_status" ) 
    {
      return this.aRow[row].status
    }
    else if( id=="col_result" ) 
    {
      return this.aRow[row].result
    } 
    else if( id=="col_type" ) 
    {
      return this.aRow[row].type
    } 
    else if( id=="col_size" ) 
    {
      return this.aRow[row].size
    } 
    else if( id=="col_link_in" ) 
    {
      return this.aRow[row].linkIn
    } 
    else if( id=="col_link_out" ) 
    {
      return this.aRow[row].linkOut
    } 
    else if( id=="col_level" ) 
    {
      return this.aRow[row].level
    } 
    else 
    {
      return null;
    }
  },
  setCellText: function(row, column, text) {},
  setTree: function(tree) { this.tree = tree; },
  isContainer: function(index) { return false; },
  isSeparator: function(index) { return false; }, 
  isSorted: function() {},
  getLevel: function(index) { return 0; },
  getImageSrc: function(row, col) 
  {
    if( col=="col_icon" ) 
    {
      return "chrome://tidy/skin/"+this.aRow[row].icon+".png";
    } 
    else 
    {
      return null;
    }
  },
  getCellProperties: function(row, col) {},
  getColumnProperties: function(column, elem) {}, 
  getRowProperties: function(row) { },

  isContainerOpen: function(index) { },
  isContainerEmpty: function(index) { return false; },
  canDropOn: function(index) { return false; },
  canDropBeforeAfter: function(index, before) { return false; },
  drop: function(row, orientation) { return false; },
  getParentIndex: function(index) { return 0; },
  hasNextSibling: function(index, after) { return false; },
  getProgressMode: function(row, column) { },
  getCellValue: function(row, column) { },
  toggleOpenState: function(index) { },
  cycleHeader: function(col, elem) { },
  selectionChanged: function() { },
  cycleCell: function(row, column) { },
  isEditable: function(row, column) { return false; },
  performAction: function(action) { },
  performActionOnRow: function(action, row) { },
  performActionOnCell: function(action, row, column) { },
  
  /** __ addRow ________________________________________________________________
   * 
   * Tree utility function : add a row
   */    
  addNewUrl: function(base_url, rel_url, level, referer) 
  { 
    var status = 'New';

    /// XXXXXXXXXXXXXXX
    // I should use this:
    // nsIURI AUTF8String resolve ( AUTF8String relativePath )
    var uri = Components.classes["@mozilla.org/network/standard-url;1"].createInstance(Components.interfaces.nsIURI);
    uri.spec = base_url;
    var url = uri.resolve( rel_url );
    
    // Build the full URL based on the base_url and relative url
    // Step 1: Remove all after a #sign
    var pos = url.search("#")
    if( pos>=0 )
    {
      url= url.substring(0, pos);
    } 

    // Step 2: check that the URL is not in the list
    for( var i in this.aRow ) 
    {
      if( url==this.aRow[i].url )
      {
         // A. If found in the list add one ref to it.
         this.aRow[i].linkIn++;
         this.aRow[i].referer += ','+referer; 
         return;
      }
    }
    // B. If not add the new row in the table
    this.rows = this.aRow.push( new TidyLinksRow( url, status, level, referer ) );
    this.rowCountChanged(this.rows-1,1);
  }, 
  
  /** __ rowCountChanged ______________________________________________________
   * 
   * Tree utility function : notice the tree that the row count is changed
   */    
  rowCountChanged: function(index, count)
  {
    if( this.tree )
    {
      var lvr = this.tree.getLastVisibleRow();
      this.tree.rowCountChanged(index, count);
    }
  },  

  /** __ start ________________________________________________________________
   * 
   * Initialisation and termination functions
   */    
  start : function()
  {
    this.xulTree = document.getElementById("tidy-links-tree");
    this.xulTree.treeBoxObject.view = this;
    
    this.xulUrl = document.getElementById("tidy-links-url");
        
    // Start URL
    var url = window.arguments[0];
    this.addNewUrl( url, "", 0, "" );
    
    // Start the validation in a separate thread
    /*
    this.validateURL(0);
    var l = this.aRow.length;
    var i;
    for( i=1; i<=l; i++ )
    {
      this.validateURL(i);
    }
    */
  },

  /** __ onSelect ____________________________________________________
   * 
   * Select function
   */   
  onSelect: function()
  {
    var selection = this.xulTree.view.selection;

    // A warning/error line is something like : 'line 10 column 20 ...'
    var d = selection.currentIndex;
    
    // No line is selected ?
    if( !d ) return;
  },
  
  
  /** __ goToNextLine ____________________________________________________
   */   
  goToNextLine: function( row )
  {
    // loop
    if( row<40 && this.aRow.length>row )
    {
      // this should possibly be called by a timer
      this.onBackground( row+1 );
    }
  },
  
  /** __ onBackground ____________________________________________________
   */   
  onBackground: function( arg )
  {
    var row = arg;
    var url = this.aRow[row].url;
    var pos = url.search("://");
    var protocol = url.substring(0, pos);
    if( protocol=='http' || protocol=='https' || protocol=='file' )
    {
      var req = new XMLHttpRequest();
      req.open('GET', this.aRow[row].url, true);
      req.onreadystatechange = function (aEvt)
      {
        if( req.readyState==4 ) 
        {
          oTidyLinks.validateURL2( req, row );
          oTidyLinks.goToNextLine( row );
        }
      };
      req.send(null);
    }
    else
    {
      this.aRow[row].status = "Skip";
      this.aRow[row].icon = "disabled";
      this.goToNextLine( row );
    }
  },
  
  /** __ validateURL2 _______________________________________________________
   *
   */
  validateURL2: function( req, row )
  {
    try
    {
      oTidyUtil.tidy.log( 'validateURL2 step 2' );
      
      if(req.status==200 || req.status==0)
      {
        if( req.channel.contentType == "text/html"
         || req.channel.contentType == "application/xhtml+xml" )
        { 
          // The inout arguments need to be JavaScript objects
          var nbError = {value:0};
          var nbWarning = {value:0};
          var nbAccessWarning = {value:0};
          var nbHidden = {value:0};
          var links ={value:"---"};
          var accessLevel = oTidyUtil.getIntPref( "accessibility-check" );

          oTidyUtil.tidy.getLinks( req.responseText, oTidyUtil.getPrefConfig(), accessLevel, links, nbError, nbWarning, nbAccessWarning, nbHidden );

          var multi = links.value.split('\n');
          for( var i=0; i<multi.length-1; i++ ) 
          {
            var s = multi[i];
            if( s.search( "\r" ) >= 0 )
            {
              s = s.substring(0, s.search( "\r" ) );
            }
            this.addNewUrl( this.aRow[row].url, s, this.aRow[row].level+1, row );
          }

          var res = new TidyResult();
          res.iNbError = nbError.value;
          res.iNbWarning = nbWarning.value;
          res.iNbAccessWarning = nbAccessWarning.value;
          res.iNbHidden = nbHidden.value; 

          this.aRow[row].result = res.getErrorString();
          this.aRow[row].icon = res.getIcon();
          this.aRow[row].linkOut = multi.length;

          oTidyUtil.tidy.log( 'validateURL2 step 2' );

        }
        else
        {
          this.aRow[row].icon = "disabled";        
        }        
        this.aRow[row].type = req.channel.contentType;
        this.aRow[row].size = req.channel.contentLength;
        this.aRow[row].status = "Done";
      }
      /// XXXXXXXX redirect (301,302)
      else
      {
        this.aRow[row].result = "HTTP Response: "+req.status;
        this.aRow[row].status = "HTTP";
        this.aRow[row].icon = "disabled";
      }
    }
    catch(ex)
    {
      this.aRow[row].status = "Broken";      
      this.aRow[row].icon = "empty";
    } 
  },  
  
  /** __ SortArray ____________________________________________________________
   *
   */  
  SortArray : function( array, field, bDesc )
  {
    array.sort
    (
      function( a, b ) 
      {
        var res;
        if(field in a) 
        {
          if(field in b) 
          {
            a=a[field]; 
            b=b[field];
            res=a<b?-1:a>b?1:0;
          } else {
            res=1;
          }
        } else {
          res=(field in b)?-1:0;
        }
        return bDesc?-res:res;
      }
    );
    return array;
   },
   
  /** __ onOk ____________________________________________________________
   *
   */  
  onOk : function()
  {
    // Close the window
    window.close();
  },
  
  /** __ onCopy ____________________________________________________________
   *
   */  
  onCopy : function()
  {
    var selection = this.xulTree.view.selectedIndex;
    var data = "", rStart = {}, rEnd = {};
    var ranges = selection.getRangeCount();
    for (var range=0; range<ranges; range++) 
    {
      selection.getRangeAt(range, rStart, rEnd);
      if (rStart.value >=0 && rEnd.value >=0) 
      {
        for (var row=rStart.value; row<=rEnd.value; row++) 
        {
          data += this.aRow[row].url;
        }
      }
    }

    if (data) 
    {
      // clipboard helper
      try
      {
        const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
        clipboardHelper.copyString(data);
      } 
      catch(e) 
      {
        // do nothing, later code will handle the error
        dump("Unable to get the clipboard helper\n");
      }
    }     
  },

  /** __ onGoToURL ____________________________________________________________
   *
   */  
  onGoToURL : function()
  {
    var selection = this.xulTree.view.selection;
    // XXXXXXXXXXXXXXXXXX
    // var row = selection.currentIndex;

    var data = "", rStart = {}, rEnd = {};
    var ranges = selection.getRangeCount();
    for (var range=0; range<ranges; range++) 
    {
      selection.getRangeAt(range, rStart, rEnd);
      if (rStart.value >=0 && rEnd.value >=0) 
      {
        for (var row=rStart.value; row<=rEnd.value; row++) 
        {
          data += this.aRow[row].referer + '\n';
          var multi = this.aRow[row].referer.split(',');
          for( var i=0; i<multi.length; i++ ) 
          {
            var s = multi[i];
            data += this.aRow[s].url+'\n';
          }
        }
      }
    }

    if (data) 
    {
      // clipboard helper
      try
      {
        const clipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
        clipboardHelper.copyString(data);
      } 
      catch(e) 
      {
        // do nothing, later code will handle the error
        dump("Unable to get the clipboard helper\n");
      }
    }     
  }
}