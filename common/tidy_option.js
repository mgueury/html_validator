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

function onLoadTidyOptions() {
  onLoadTidyUtil(onLoadTidyOptions2);
}

function onLoadTidyOptions2() {
  oTidyOptions = new TidyOptions();
  oTidyOptions.start();
}

function onUnloadTidyOptions() {
  onUnloadTidyUtil();
  delete oTidyOptions;
  oTidyOptions = null;
}

//-------------------------------------------------------------
// oTidyOptions
//-------------------------------------------------------------

function TidyOptions() {}

TidyOptions.prototype = {
  // Accessibility check combobox
  accessList: null,
  browserIconList: null,
  algorithmList: null,
  filterHideList: null,
  validateDomainTypeList: null,
  validateDomainList: null,
  htmlSourceList: null,

  // Initialisation and termination functions
  start: function() {
    this.accessList = document.getElementById("tidy.options.accessibility-check");
    this.algorithmList = document.getElementById("tidy.options.algorithm");
    this.filterHideList = document.getElementById("tidy.options.filter.list.hide");

    this.setAlgorithm();

    this.accessList.selectedIndex = oTidyUtil.getIntPref("accessibility-check") + 1;

    oTidyUtil.initCheckbox("highlight_line");
    oTidyUtil.initCheckbox("show-warnings");
    oTidyUtil.initCharTextbox("online_url");

    // Filter List
    for (var o in oTidyUtil.filterArrayTidy) {
      if (oTidyUtil.filterArrayTidy[o] == false) {
        // The inout arguments need to be JavaScript objects
        var desc;
        try {
          // The new Tidy HTML5 shift the error id of 200.
          desc = oTidyUtil.getString("tidy_" + (o-200));
        } catch (e) {
          desc = "Tidy " + o;
        }

        this.filterAppend(desc, "t" + o);
      }
    }
    for (var o in oTidyUtil.filterArrayOnline) {
      if (oTidyUtil.filterArrayOnline[o] == false) {
        this.filterAppend("Online " + o, "o" + o);
      }
    }
  },

  /**__ filterAppend  ______________________________
   */
  filterAppend: function(desc, value) {
    var opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = desc;
    this.filterHideList.appendChild(opt);
  },

  /**__ onFilterRemove _________________________________
   */
  onFilterRemove: function() {
    var index = this.filterHideList.selectedIndex;
    if (index >= 0) {
      this.filterHideList.remove(index);
    }
  },

  setAlgorithm: function() {
    var a = oTidyUtil.getCharPref("algorithm");
    this.algorithmList.selectedIndex = (a == "tidy" ? 0 :
      (a == "sp" ? 1 :
        (a == "cse" ? 4 :
          (a == "serial" ? 2 : 3))));
    this.enableDisable();
  },

  /**
   * Enable or disable all items
   */
  enableDisable: function() {
    // Enabled when Tidy
    this.accessList.disabled = (this.algorithmList.selectedIndex == 1);
  },

  /**
   * Enable or disable the domain list
   */
  domainList: function(enabled) {
    this.validateDomainList.disabled = !enabled;
  },

  onBrowserEnable: function() {},

  onOk: function() {
    oTidyUtil.saveCheckbox("highlight_line");
    oTidyUtil.saveCheckbox("show-warnings");

    // Algorithm
    var algo = new Array("tidy", "sp", "serial", "online");
    oTidyUtil.setCharPref("algorithm", algo[this.algorithmList.selectedIndex]);

    // Force output : convert the combobox to 2 settings of tidy
    oTidyUtil.setIntPref("accessibility-check", this.accessList.selectedIndex - 1);

    // Save the hide list in the filterArray
    oTidyUtil.resetFilterArray();
    for (i = 0; i < this.filterHideList.length; i++) {
      var item = this.filterHideList[i];
      oTidyUtil.addToFilterArray(item.value);
    }
    oTidyUtil.saveFilterArrayInPref();

    // Close the window
    if (parent) {
      if (parent.tidyOptionClose) {
        // reload the pref and then call the OptionClose
        parent.tidy_pref.load(parent.tidyOptionClose);
        return;
      }
    }
    window.close()
  },

  /**
   * Open a modal dialog
   */
  onOpenModal: function(name) {
    document.getElementById(name).style.display = "block";
  },

  /**
   * Close a modal dialog
   */
  onCloseModal: function(name) {
    document.getElementById(name).style.display = "none";
    this.setAlgorithm();
  },

  /**
   * Close a modal dialog
   */
  onOnlineDefaultUrl: function() {
    document.getElementById("tidy.options.online_url").value = tidy_pref.online_default_url;
    this.setAlgorithm();
  }
}

window.onload = function(e)
{
   onLoadTidyOptions();

   // Initialise the javascript link (else there is an error refuse to execute inline handler because it violates the security policies)
   tidyUtilSetOnclick( "tidy.options.ok", function(){ oTidyOptions.onOk() } );
   // XXX seems to be calling the function....
   // tidyUtilSetOnclick( "tidy.options.welcome", function(){ oTidyOptions.onOpenModal('tidy.welcome.modal') });
   tidyUtilSetOnclick( "tidy.options.filter.remove", function(){ oTidyOptions.onFilterRemove() });
   tidyUtilSetOnclick( "tidy.options.online_default_url", function(){ oTidyOptions.onOnlineDefaultUrl() });
}
