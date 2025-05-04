"use strict";

function setDataFromLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataFromLocalStorage(key) {
   console.log(localStorage);

   return JSON.parse(localStorage.getItem(key));
}

function reloadLocation() {
   window.location.reload();
}

function map(os, oe, ns, ne, t, isRound = true) {
   const r = (ne - ns) / (oe - os);
   let v = r * (t - os) + ns;
   v = Math.min(ne, Math.max(ns, v));
   return isRound ? Math.round(v) : v;
}

function setDataToLocalStorage(key, object) {
   let data = JSON.stringify(object);
   localStorage.setItem(key, data);
}

function getDataToLocalStorage(key) {
   return JSON.parse(localStorage.getItem(key));
}

function OBJECTtoJSON(data) {
   return JSON.stringify(data);
}

function JSONtoOBJECT(data) {
   return JSON.parse(data);
}

/* ----------- extension utils ----------- */
function getActiveTab() {
   return new Promise((resolve) => {
      chrome.tabs.query(
         {
            currentWindow: true,
            active: true,
         },
         (tabs) => {
            console.log(tabs);
            resolve(tabs[0]);
         }
      );
   });
}

function getFormatTime(t) {
   const date = new Date(0);
   date.setSeconds(t);
   return date.toISOString().substr(11, 8);
}

function runtimeSendMessage(type, message, callback) {
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

function tabSendMessage(tabId, type, message, callback) {
   // if third parameter is not pass. in message parameter pass callback function
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

function runtimeOnMessage(type, callback) {
   chrome.runtime.onMessage.addListener((message, sender, response) => {
      if (type === message.type) {
         callback(message, sender, response);
      }
      return true;
   });
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
 * @param {number} ms
 **/
function wait(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

function chromeStorageSet(key, value, callback) {
   return new Promise((resolve) => {
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
// Example usage:
// chromeStorageSet("myKey", "myValue", function () {
//    console.log("Item set");
// });

function chromeStorageGet(key, callback = () => {}) {
   return new Promise((resolve) => {
      chrome.storage.sync.get([key], function (result) {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
         } else if (callback) {
            callback(result[key]);
            resolve(result[key]);
         }
      });
   });
}

function setInputLikeHuman(element) {
   const event = new Event("change", { bubbles: true });
   element.dispatchEvent(event);
}

function chromeStorageSetLocal(key, value, callback) {
   const obj = JSON.stringify(value);

   chrome.storage.local.set({ [key]: obj }).then(() => {
      if (chrome.runtime.lastError) {
         console.error("Error setting item:", chrome.runtime.lastError);
      } else if (callback) {
         callback(true);
      } else {
         return true;
      }
   });
}

function chromeStorageGetLocal(key, callback) {
   return new Promise((resolve) => {
      chrome.storage.local.get([key]).then((result) => {
         if (chrome.runtime.lastError) {
            console.error("Error getting item:", chrome.runtime.lastError);
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
   chrome.storage.local.remove(key).then(() => {
      if (chrome.runtime.lastError) {
         console.log("Error removing item:", chrome.runtime.lastError);
      }
   });
}

function copyTextToClipboard(text) {
   const textarea = document.createElement("textarea");
   textarea.value = text;
   textarea.style.position = "fixed"; // Prevent scrolling to bottom
   document.body.appendChild(textarea);
   textarea.select();

   try {
      const successful = document.execCommand("copy");
      const msg = successful ? "successful" : "unsuccessful";
      console.log("Copying text " + msg);
      
      // Show toast notification if document.body exists
      if (document.body) {
         showToast(successful ? "Copied to clipboard!" : "Copy failed", successful ? "success" : "error");
      }
   } catch (err) {
      console.error("Unable to copy", err);
      // Show error toast if document.body exists
      if (document.body) {
         showToast("Unable to copy: " + err.message, "error");
      }
   }

   document.body.removeChild(textarea);
}