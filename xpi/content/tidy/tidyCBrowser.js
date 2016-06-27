/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var { utils: Cu, interfaces: Ci, classes: Cc } = Components;
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "BrowserUtils",
  "resource://gre/modules/BrowserUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "DeferredTask",
  "resource://gre/modules/DeferredTask.jsm");

var global = this;

/**
 * tidyCBrowser should be loaded in the <xul:browser> of the
 * view source window, and initialized as soon as it has loaded.
 */
var tidyCBrowser = {

  /**
   * These are the messages that tidyCBrowser is prepared to listen
   * for. If you need tidyCBrowser to handle more messages, add them
   * here.
   */
  messages: [
    "TidyBrowser:validateFrame",
    "TidyBrowser:getHtmlFromCacheNew",
    "TidyBrowser:test",
  ],

  /**
   * This should be called as soon as this frame script has loaded.
   */
  init() {
    this.debug_log( 'init' );
    this.messages.forEach((msgName) => {
      addMessageListener(msgName, this);
    });

    addEventListener("pagehide", this, true);
    addEventListener("pageshow", this, true);
    addEventListener("load", this, true);
  },

  /**
   * This should be called when the frame script is being unloaded,
   * and the browser is tearing down.
   */
  uninit() {
    this.messages.forEach((msgName) => {
      removeMessageListener(msgName, this);
    });

    removeEventListener("pagehide", this, true);
    removeEventListener("pageshow", this, true);
  },

  /**
   * Anything added to the messages array will get handled here, and should
   * get dispatched to a specific function for the message name.
   */
  receiveMessage(msg) {
    let data = msg.data;
    let objects = msg.objects;
    this.debug_log( '<receiveMessage> : ' + msg.name );
    switch(msg.name) {
      case "TidyBrowser:test":
        this.debug_log(" test " + content.document.contentType + " / url: " + content.document.URL );
        break;
    }
  },

  /**
   * Any events should get handled here, and should get dispatched to
   * a specific function for the event type.
   */
  handleEvent(event) {
    switch(event.type) {
      case "pageshow":
        this.debug_log('onPageShow - event.target: ' + event.target.contentType + " / url: " + event.target.URL);
        break;
      case "load":
        this.debug_log('load - event.target: ' + event.target.contentType + " / url: " + event.target.URL);
        break;
    }
  },

  /** __ debug_log __________________________________________________________
   */
  debug_log(s) {
	// To see this: browser.dom.window.dump.enabled = true
	// + start with firefox -console
	dump( '<tidyCBrowser>' + s +'\n');
  },

};
tidyCBrowser.init();
