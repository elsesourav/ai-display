/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
"use strict";

// Chrome Extension Utilities for Options Page Components
// This file provides a clean interface to Chrome extension APIs for React components

// Detect Chrome extension environment once
const hasChrome =
   typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined";

/**
 * Local Storage utilities (standard browser localStorage)
 */
function setDataFromLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

const KEYS = {
   SETTINGS: "Ai-Display-Settings",
};

function getDataFromLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function setDataToLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataToLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

/**
 * JSON utilities
 */
function OBJECTtoJSON(data) {
   return JSON.stringify(data);
}

function JSONtoOBJECT(data) {
   return JSON.parse(data);
}

/**
 * Utility functions
 */
function reloadLocation() {
   window.location.reload();
}

function map(os, oe, ns, ne, t, isRound = true) {
   const r = (ne - ns) / (oe - os);
   let v = r * (t - os) + ns;
   v = Math.min(ne, Math.max(ns, v));
   return isRound ? Math.round(v) : v;
}

function getFormatTime(t) {
   const date = new Date(0);
   date.setSeconds(t);
   return date.toISOString().substr(11, 8);
}

function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

const debounce = (func, delayFn) => {
   let debounceTimer;
   return function (...args) {
      const context = this;
      const delay = delayFn();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
   };
};

/**
 * Chrome Extension API utilities
 */

// Get active tab
function getActiveTab() {
   return new Promise((resolve) => {
      if (!hasChrome || !chrome.tabs?.query) {
         console.warn("Chrome tabs API not available: getActiveTab() noop");
         resolve(null);
         return;
      }
      chrome.tabs.query(
         {
            currentWindow: true,
            active: true,
         },
         (tabs) => {
            resolve(tabs?.[0] ?? null);
         }
      );
   });
}

// Chrome Storage Sync utilities
function chromeStorageSet(key, value, callback) {
   return new Promise((resolve) => {
      if (!hasChrome || !chrome.storage?.sync?.set) {
         console.warn("Chrome storage.sync API not available: set() noop");
         callback && callback();
         resolve();
         return;
      }
      let items = {};
      items[key] = value;
      chrome.storage.sync.set(items, function () {
         if (chrome.runtime.lastError) {
            console.error("Error setting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback();
         }
         resolve();
      });
   });
}

function chromeStorageGet(key, callback = () => {}) {
   return new Promise((resolve) => {
      if (!hasChrome || !chrome.storage?.sync?.get) {
         console.warn("Chrome storage.sync API not available: get() noop");
         callback(undefined);
         resolve(null);
         return;
      }
      chrome.storage.sync.get([key], function (result) {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
            resolve(null);
         } else {
            callback(result[key]);
            resolve(result[key]);
         }
      });
   });
}

// Chrome Storage Local utilities
function chromeStorageSetLocal(key, value, callback) {
   return new Promise((resolve) => {
      if (!hasChrome || !chrome.storage?.local?.set) {
         console.warn(
            "Chrome storage.local API not available: setLocal() noop"
         );
         callback && callback(false);
         resolve();
         return;
      }
      const obj = JSON.stringify(value);
      chrome.storage.local.set({ [key]: obj }, () => {
         if (chrome.runtime.lastError) {
            console.error("Error setting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback(true);
         }
         resolve();
      });
   });
}

function chromeStorageGetLocal(key, callback) {
   return new Promise((resolve) => {
      if (!hasChrome || !chrome.storage?.local?.get) {
         console.warn(
            "Chrome storage.local API not available: getLocal() noop"
         );
         callback && callback(null);
         resolve(null);
         return;
      }
      chrome.storage.local.get([key], (result) => {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
            resolve(null);
         } else {
            const OBJ =
               typeof result[key] === "string" ? JSON.parse(result[key]) : null;
            callback && callback(OBJ);
            resolve(OBJ);
         }
      });
   });
}

function chromeStorageRemoveLocal(key) {
   return new Promise((resolve) => {
      if (!hasChrome || !chrome.storage?.local?.remove) {
         console.warn(
            "Chrome storage.local API not available: removeLocal() noop"
         );
         resolve();
         return;
      }
      chrome.storage.local.remove(key, () => {
         if (chrome.runtime.lastError) {
            console.log("Error removing item:", chrome.runtime.lastError);
         }
         resolve();
      });
   });
}

// Runtime messaging utilities
function runtimeSendMessage(type, message, callback) {
   if (!hasChrome || !chrome.runtime?.sendMessage) {
      console.warn("Chrome runtime API not available: sendMessage() noop");
      if (typeof message === "function") message(undefined);
      else callback && callback(undefined);
      return;
   }
   if (typeof message === "function") {
      chrome.runtime.sendMessage({ type }, (response) => {
         message && message(response);
      });
   } else {
      chrome.runtime.sendMessage({ ...message, type }, (response) => {
         callback && callback(response);
      });
   }
}

function runtimeOnMessage(type, callback) {
   if (!hasChrome || !chrome.runtime?.onMessage?.addListener) {
      console.warn("Chrome runtime API not available: onMessage() noop");
      return;
   }
   chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (type === message.type) {
         callback(message, sender, response);
      }
      return true;
   });
}

// Tab messaging utilities
function tabSendMessage(tabId, type, message, callback) {
   if (!hasChrome || !chrome.tabs?.sendMessage) {
      console.warn("Chrome tabs API not available: sendMessage() noop");
      if (typeof message === "function") message(undefined);
      else callback && callback(undefined);
      return;
   }
   if (typeof message === "function") {
      chrome.tabs.sendMessage(tabId, { type }, (response) => {
         message && message(response);
      });
   } else {
      chrome.tabs.sendMessage(tabId, { ...message, type }, (response) => {
         callback && callback(response);
      });
   }
}

// Page messaging utilities (for injected scripts)
function pagePostMessage(type, data, contentWindow = window) {
   contentWindow.postMessage({ type, data }, "*");
}

function pageOnMessage(type, callback) {
   window.addEventListener("message", (event) => {
      if (event.data.type === type) {
         callback(event.data.data, event);
      }
   });
}

// Script and CSS injection utilities
function injectScript(src, type, doc = document || document.documentElement) {
   const script = document.createElement("script");
   script.src =
      hasChrome && chrome.runtime?.getURL ? chrome.runtime.getURL(src) : src;
   if (type) script.type = type;
   script.onload = () => script.remove();
   doc.appendChild(script);
}

function injectJSCode(code) {
   const scriptElement = document.createElement("script");
   scriptElement.setAttribute("type", "text/javascript");
   scriptElement.textContent = code;
   document.documentElement.appendChild(scriptElement);
}

function injectJSLink(src) {
   const scriptElement = document.createElement("script");
   scriptElement.setAttribute("type", "text/javascript");
   scriptElement.setAttribute("src", src);
   document.documentElement.appendChild(scriptElement);
}

function injectCSSFile(
   src,
   ref = "stylesheet",
   type = "text/css",
   crossorigin,
   doc = document || document.documentElement
) {
   const link = document.createElement("link");
   if (ref) link.rel = ref;
   if (type) link.type = "text/css";
   if (crossorigin) link.setAttribute("crossorigin", "anonymous");
   link.href =
      hasChrome && chrome.runtime?.getURL ? chrome.runtime.getURL(src) : src;
   doc.appendChild(link);
}

function injectCSSCode(cssCode) {
   const style = document.createElement("style");
   style.type = "text/css";
   style.textContent = cssCode;
   (document.head || document.documentElement).appendChild(style);
}

function injectCSSLink(href) {
   const link = document.createElement("link");
   link.rel = "stylesheet";
   link.type = "text/css";
   link.href = href;
   (document.head || document.documentElement).appendChild(link);
}

// DOM utilities
function setInputLikeHuman(element) {
   const event = new Event("change", { bubbles: true });
   element.dispatchEvent(event);
}

// Scripting API utilities
function executeScript(tabId, func, ...args) {
   if (!hasChrome || !chrome.scripting?.executeScript) {
      console.warn("Chrome scripting API not available: executeScript() noop");
      return;
   }
   chrome.scripting.executeScript({ target: { tabId }, func, args: [...args] });
}

/**
 * Convenient React-friendly wrapper object
 * This provides a cleaner interface for React components
 */
const extensionUtils = {
   // Storage utilities
   storage: {
      // Sync storage
      set: chromeStorageSet,
      get: chromeStorageGet,
      // Local storage
      setLocal: chromeStorageSetLocal,
      getLocal: chromeStorageGetLocal,
      removeLocal: chromeStorageRemoveLocal,
      // Browser localStorage
      setLocalStorage: setDataToLocalStorage,
      getLocalStorage: getDataToLocalStorage,
   },

   // Messaging utilities
   messaging: {
      sendToBackground: runtimeSendMessage,
      onMessage: runtimeOnMessage,
      sendToTab: tabSendMessage,
      postMessage: pagePostMessage,
      onPageMessage: pageOnMessage,
   },

   // Tab utilities
   tabs: {
      getActive: getActiveTab,
      sendMessage: tabSendMessage,
      executeScript: executeScript,
   },

   // Injection utilities
   inject: {
      script: injectScript,
      jsCode: injectJSCode,
      jsLink: injectJSLink,
      cssFile: injectCSSFile,
      cssCode: injectCSSCode,
      cssLink: injectCSSLink,
   },

   // Utility functions
   utils: {
      wait: wait,
      debounce: debounce,
      map: map,
      formatTime: getFormatTime,
      reload: reloadLocation,
      setInputLikeHuman: setInputLikeHuman,
      toJSON: OBJECTtoJSON,
      fromJSON: JSONtoOBJECT,
   },

   // Direct function access for backward compatibility
   chromeStorageSet,
   chromeStorageGet,
   chromeStorageSetLocal,
   chromeStorageGetLocal,
   chromeStorageRemoveLocal,
   getActiveTab,
   runtimeSendMessage,
   tabSendMessage,
   wait,
   debounce,
   map,
   getFormatTime,
   reloadLocation,
   setInputLikeHuman,
   OBJECTtoJSON,
   JSONtoOBJECT,
   KEYS,
};

// Make available globally for script tags
if (typeof window !== "undefined") {
   window.extensionUtils = extensionUtils;
}

// Export the main object
export default extensionUtils;
