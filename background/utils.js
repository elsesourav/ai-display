"use strict";

const KEYS = {
   SETTINGS: "Ai-Display-Settings",
};


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

function pagePostMessage(type, data, contentWindow = window) {
   contentWindow.postMessage({ type, data }, "*");
}

/* ######## send inject script to => content script ########
   pagePostMessage("i_c", { some: "data" });
*/

function pageOnMessage(type, callback) {
   window.addEventListener("message", (event) => {
      if (event.data.type === type) {
         callback(event.data.data, event);
      }
   });
}

/* ######## accept inject script to => content script ########
pageOnMessage("i_c", (data, event) => {
   console.log(data);
   console.log(event);
});
*/

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
         showToast(
            successful ? "Copied to clipboard!" : "Copy failed",
            successful ? "success" : "error"
         );
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

async function getSecretKey() {
   const secret = "af3f-34bj5-245hh-g341g";
   const encoder = new TextEncoder();
   const keyMaterial = await crypto.subtle.digest(
      "SHA-256",
      encoder.encode(secret)
   );
   return crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
   );
}

function injectScript(src) {
   const script = document.createElement("script");
   script.src = chrome.runtime.getURL(src);
   script.onload = () => script.remove();
   (document.head || document.documentElement).appendChild(script);
}

function injectJSCode(code) {
   const scriptElement = document.createElement("script");
   scriptElement.setAttribute("type", "text/javascript");
   scriptElement.textContent = code;
   document.documentElement.appendChild(scriptElement);
}

// Function to inject external JavaScript file
function injectJSLink(src) {
   const scriptElement = document.createElement("script");
   scriptElement.setAttribute("type", "text/javascript");
   scriptElement.setAttribute("src", src);
   document.documentElement.appendChild(scriptElement);
}

function executeScript(tabId, func, ...args) {
   chrome.scripting.executeScript({ target: { tabId }, func, args: [...args] });
}

/* ################# EXAMPLE ##################
   executeScript(tabId, (text, obj, etc) => {
      console.log("Hello from the injected script!");
   }, text, obj, etc);
*/

async function encryptData(data) {
   const key = await getSecretKey();
   const encoder = new TextEncoder();
   const iv = crypto.getRandomValues(new Uint8Array(12));
   const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encoder.encode(data)
   );

   return {
      iv: btoa(String.fromCharCode(...iv)),
      data: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
   };
}

async function decryptData(encrypted) {
   const key = await getSecretKey();
   const iv = new Uint8Array(
      atob(encrypted.iv)
         .split("")
         .map((c) => c.charCodeAt(0))
   );
   const data = new Uint8Array(
      atob(encrypted.data)
         .split("")
         .map((c) => c.charCodeAt(0))
   );

   const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      data
   );

   const decoder = new TextDecoder();
   return decoder.decode(decryptedData);
}

async function GET__(name) {
   try {
      const res = await fetch(chrome.runtime.getURL("config.json"));
      const config = await res.json();
      const key = config.keys[name];

      if (key) return key;
      return null;
   } catch (error) {
      console.log(error);
      return null;
   }
}

async function uploadImageToCloudinary(file) {
   const cloudName = "diysvbtwq";
   const uploadPreset = "AiDisplay";

   const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

   const formData = new FormData();
   formData.append("file", file);
   formData.append("upload_preset", uploadPreset);

   const response = await fetch(url, {
      method: "POST",
      body: formData,
   });

   const data = await response.json();

   if (response.ok) {
      return data.secure_url;
   } else {
      console.error("Upload error:", data);
      throw new Error(data.error.message);
   }
}

function isInternalPage(tab) {
   return /^(chrome|edge|about):\/\//.test(tab.url);
}