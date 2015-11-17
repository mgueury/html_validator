//*************************************************************************
// HTML Validator
//
//  File: tidyChooseSource.js
//  Description: javascript for the dialog to choose to see the source of the page
//               or of a frame
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

//-------------------------------------------------------------

var oTidyChooseSource;

function onLoadTidyChooseSource()
{
  onLoadTidyUtil();
  oTidyChooseSource = new TidyChooseSource();
  oTidyChooseSource.start();
}

function onUnloadTidyChooseSource()
{
  onUnloadTidyUtil();
  delete oTidyChooseSource;
  oTidyChooseSource = null;
}

function onTidyChooseSourceNewTitle()
{
  document.title = oTidyUtil.getString(window.arguments[2]=="cleanup"?"tidy_cleanup":"tidy_view_source");
}

//-------------------------------------------------------------
// oTidyChooseSource
//-------------------------------------------------------------

function TidyChooseSource()
{
}

TidyChooseSource.prototype =
{
  windowContent : null,
  result : null, // array of document
  xulParent : null,
  xulList : null,
  iNbRow : 0,

  // Initialisation and termination functions
  start : function()
  {
    this.windowContent = window.arguments[0];
    this.result = window.arguments[1];

    this.xulParent = document.getElementById("tidy.choose_source.vbox");
    this.xulList = document.getElementById("tidy.choose_source.list");

    this.addFrameToList( this.windowContent );

    window.setTimeout(function () {onTidyChooseSourceNewTitle()}, 100);

    // this.xulList.rows = this.iNbRow; // resize the listbox
    this.xulList.selectedIndex = 0;
    this.xulList.focus()
  },

  /** __ addFrameToList ______________________________________________________
   */
  addFrameToList : function( frame )
  {
    this.iNbRow++;

    var doc = frame.document;

    var icon = "chrome://tidy/skin/question";
    var str = "";
    var name = "";
    var res = doc.tidyResult;
    if( res!=null )
    {
      icon = res.getErrorIcon();
      str = res.getErrorString();
    }
    if( frame.name )
    {
      name = " "+frame.name;
    }
    str = oTidyUtil.getString((frame==this.windowContent?"tidy_page":"tidy_frame"))+name+": "+str;


    var item = this.xulList.appendItem( str+ " - " + doc.URL, doc.URL );
    item.image = icon+".png";
    item.className= "listitem-iconic";

    // Loop through the frames
    const framesList = frame.frames;
    for(var i = 0; i < framesList.length; i++)
    {
      this.addFrameToList( framesList[i] );
    }
  },

  onOk : function()
  {
    var items = this.xulList.selectedItems;
    if( items!=null && items.length>0 )
    {
      for( var i=0; i<items.length; i++ )
      {
        this.result[i] = items[i].value;
      }
      window.close();
    }
  },

  onCancel : function()
  {
    window.close();
  }
}