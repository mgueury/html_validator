//*************************************************************************
// HTML Validator
//
//  File: tidyOptions.js
//  Description: javascript for the dialog box of the options window
//  Author : Marc Gueury
//  Licence : see licence.txt
//*************************************************************************

//-------------------------------------------------------------

var oTidyOptions;

function onLoadTidyOptions()
{
  onLoadTidyUtil();
  oTidyOptions = new TidyOptions();
  oTidyOptions.start();  
}

function onUnloadTidyOptions()
{
  onUnloadTidyUtil();
  delete oTidyOptions;
  oTidyOptions = null;
}

//-------------------------------------------------------------
// oTidyOptions
//-------------------------------------------------------------

function TidyOptions()
{
}

TidyOptions.prototype =
{
  // Accessibility check combobox
  accessList: null, 
  browserIconList: null,
  algorithmList: null,
  filterHideList: null,
  validateDomainTypeList: null,
  validateDomainList: null,
  htmlSourceList: null,

  // Initialisation and termination functions
  start : function()
  {
    this.accessList = document.getElementById("tidy.options.accessibility-check");
    this.browserIconList = document.getElementById("tidy.options.browser_icon");
    this.algorithmList = document.getElementById("tidy.options.algorithm");
    this.filterHideList = document.getElementById("tidy.options.filter.list.hide");
    this.dbclickActionList = document.getElementById("tidy.options.dbclick_action");
          
    var browser_icon = oTidyUtil.getCharPref("browser_icon"); 
    this.browserIconList.selectedIndex = (browser_icon=="icon_text"?0:1);

    this.setAlgorithm();
    
    this.accessList.selectedIndex = oTidyUtil.getIntPref( "accessibility-check" ) + 1;

    this.dbclickActionList.selectedIndex = (oTidyUtil.getCharPref("dbclick_action")=="viewsource"?0:1);
    
    if( !oTidyUtil.permManager )
    {
      document.getElementById("tidy.options.perm_list").hidden = true;
    }
    
    oTidyUtil.initCheckbox( "browser_enable" );
    oTidyUtil.initCheckbox( "viewsource_enable" );
    oTidyUtil.initCheckbox( "highlight_line" );
    oTidyUtil.initCheckbox( "show_line_number" );
    oTidyUtil.initCheckbox( "show-warnings" );   

    // Filter List
    for( var o in oTidyUtil.filterArrayTidy )
    {
      if( oTidyUtil.filterArrayTidy[o]==false )
      {
        // The inout arguments need to be JavaScript objects
        var aErrorDesc = {value:""};
        oTidyUtil.tidy.getErrorDescription( o, aErrorDesc );

        this.filterHideList.appendItem( aErrorDesc.value, "t"+o );
      }
    }    
    for( var o in oTidyUtil.filterArraySP )
    {
      if( oTidyUtil.filterArraySP[o]==false )
      {
        // The inout arguments need to be JavaScript objects
        var aErrorDesc = {value:""};
        try {
          aErrorDesc.value=oTidyUtil.getString("sp_"+o); 
        }
        catch (e)
        {
          aErrorDesc.value="SGML Parser "+o;
        }
        this.filterHideList.appendItem( aErrorDesc.value, "s"+o );
      }
    }    
    for( var o in oTidyUtil.filterArrayOnline )
    {
      if( oTidyUtil.filterArrayOnline[o]==false )
      {
        this.filterHideList.appendItem( "Online "+o, "o"+o );
      }
    }    
    
    // Remove CSE is not there.
    if( oTidyUtil.getCSEInstallDir() == null )
    {
      this.algorithmList.removeItemAt( 4 );
      document.getElementById("tidy.options.cse_validator").hidden = true;
    }
  },
  
  /**__ onFilterRemove _________________________________
    */
  onFilterRemove : function()
  {
    var index = this.filterHideList.selectedIndex;
    if( index>=0 )
    {
      this.filterHideList.removeItemAt ( index );
    }  
  },

  setAlgorithm : function()
  {
    var a = oTidyUtil.getCharPref("algorithm");
    this.algorithmList.selectedIndex = (a=="tidy"?0:
                                        (a=="sp"?1:
                                         (a=="cse"?4:
                                          (a=="serial"?2:3))));
    this.enableDisable();
  },
  
  /**
   * Enable or disable all items
   */
  enableDisable : function()
  {
    // Enabled when Tidy
    this.accessList.disabled = (this.algorithmList.selectedIndex==1 );  
  },  

  /**
   * Enable or disable the domain list
   */
  domainList : function( enabled )
  {
    this.validateDomainList.disabled = !enabled;
  },

  onBrowserEnable : function()
  {
  },
  
  /**
   * call the Welcome.xul
   */
  onWelcome : function()
  {
    openDialog("chrome://tidy/content/tidyWelcome.xul",
               "",
               "centerscreen,dialog,chrome,dependent,modal"); 
    this.setAlgorithm();
  },

  onOk : function()
  {
    oTidyUtil.saveCheckbox( "browser_enable" );
    oTidyUtil.saveCheckbox( "viewsource_enable" );
    oTidyUtil.saveCheckbox( "highlight_line" );
    oTidyUtil.saveCheckbox( "show_line_number" );
    oTidyUtil.saveCheckbox( "show-warnings" );

    // Icon: Convert the combobox to value
    var icon = new Array("icon_text", "icon_only");
    oTidyUtil.setCharPref( "browser_icon", icon[this.browserIconList.selectedIndex] );

    // Set icon_only if the validation is enabled in the browser
    if( oTidyUtil.getCharPref("browser_icon")=="icon_hide" && oTidyUtil.getBoolPref("browser_enable") )
    { 
      oTidyUtil.setCharPref( "browser_icon", "icon_only" );
    }

    // Algorithm
    var algo = new Array("tidy", "sp", "serial", "online", "cse" );
    oTidyUtil.setCharPref( "algorithm", algo[this.algorithmList.selectedIndex] );

    // Double-click action
    oTidyUtil.setCharPref( "dbclick_action", (this.dbclickActionList.selectedIndex==0?"viewsource":"cleanup") );

    // Force output : convert the combobox to 2 settings of tidy
    oTidyUtil.setIntPref( "accessibility-check", this.accessList.selectedIndex-1 );
        
    // Save the hide list in the filterArray
    oTidyUtil.resetFilterArray();
     
    if( this.filterHideList.getRowCount()>0 )
    {
      var item = this.filterHideList.getItemAtIndex( 0 );
      while( item )
      {
        oTidyUtil.addToFilterArray( item.value );
        item = this.filterHideList.getNextItem ( item, 1 )
      }   
    }
    oTidyUtil.saveFilterArrayInPref();

    // Close the window
    window.close();
  }
}