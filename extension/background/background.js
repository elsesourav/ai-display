importScripts("./../utils.js", "./bgUtils.js", "./apiCall.js");

const tabID = {
   google: null,
   chatgpt: null,
   grok: null,
   bing: null,
};

console.log("background script loaded");

function sendAnswer(tabId, answer) {
   tabSendMessage(tabId, "B_C_SET_ANS", { answer });
}

runtimeOnMessage(
   "C_B_GET_ANSWER",
   async ({ question, image }, { tab }, sendResponse) => {
      const { id } = tab;

      try {
         const tracks = [];
         const allTasks = [
            microsoftPhi4ReasoningPlus(question),
            metaLlamaLlama4Maverick(question, image),
         ];

         allTasks.forEach(async (task, index) => {
            tracks.push(task);
            try {
               const result = await task;
               console.log(`Call ${index + 1} completed. Result:`, result);
               sendAnswer(id, result);
            } catch (error) {
               console.error(`Call ${index + 1} failed:`, error);
               // Send error to client
               sendAnswer(id, {
                  error: `AI model ${index + 1} failed: ${error.message}`,
               });
            }
         });

         // Wait for all tasks to complete
         await Promise.all(tracks);
         console.log("All AI model calls completed.");

         // No need to call sendResponse again as we already sent it above
         return true; // Keep the message channel open for async response
      } catch (error) {
         console.error("Overall error during OCR or API calls:", error);
         sendResponse({
            success: false,
            error: error.message,
            message: "Failed to process image",
         });
         return;
      }
   }
);

// Get OCR configuration options
runtimeOnMessage("P_B_TOGGLE", async (_, __, sendResponse) => {
   chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
      const tab = await getActiveTab();
      if (isInternalPage(tab)) return;
      if (settings.enable) {
         __PUSH_MENU__(tab.id);
      } else {
         tabSendMessage(tab.id, "B_C_CLOSE_MENU");
      }
   });
   return sendResponse("ok");
});

runtimeOnMessage("C_B_ON_LOAD", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   if (isInternalPage(tab)) return;

   chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
      if (settings.enable) {
         __PUSH_MENU__(tab.id);
      }
   });
});

runtimeOnMessage("C_B_SELECT_TEXT", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   __SELECT__(tab.id);
});

runtimeOnMessage(
   "C_B_CAPTURE_DOM",
   ({ coordinates, devicePixelRatio }, { tab }, sendResponse) => {
      const { id, windowId } = tab;
      const rect = {
         top: coordinates.y,
         left: coordinates.x,
         width: coordinates.width,
         height: coordinates.height,
         devicePixelRatio,
      };

      chrome.tabs.captureVisibleTab(
         windowId,
         { format: "png" },
         async (img) => {
            const data = await __OCR__(img, rect);
            if (data.success && data?.result) {
               tabSendMessage(id, "B_C_OCR_RESULT", data.result);
            }
         }
      );
      sendResponse("ok");
   }
);

runtimeOnMessage("C_B_SETUP_IFRAME", (_, { tab }, sendResponse) => {
   addIFrame(tab.id).then((res) => {
      sendResponse(res);
   });
});

runtimeOnMessage("C_B_REMOVE_IFRAME", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   removeIFrame(tab.id);
});

(async () => {
   const total = 30;
   // for (let i = 0; i < total; i++) {
   //    await wait(3000);
   //    console.clear();
   // console.log(`Fetch attempt ${i + 1} completed.`);
   // fetch("https://www.google.com/search?q=what+is+java")
   //    .then((res) => res.text())
   //    .then((html) => console.log(html))
   //    .catch((err) => console.error(err));

   // }
   // www.google.com/search?q=what+is+java&sa=X&udm=50
})();

async function getGoogleAiAnswer(q) {
   return new Promise((resolve, reject) => {
      const url = `https://www.google.com/search?q=${encodeURI(q)}&sa=X&udm=50`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise((resolve) => {
                        function waitForNetworkIdle(callback, timeout = 2000) {
                           let timer;
                           function resetTimer() {
                              clearTimeout(timer);
                              timer = setTimeout(callback, timeout);
                           }

                           ["load", "readystatechange"].forEach((evt) =>
                              document.addEventListener(evt, resetTimer, true)
                           );

                           const origOpen = XMLHttpRequest.prototype.open;
                           XMLHttpRequest.prototype.open = function (...args) {
                              this.addEventListener("loadend", resetTimer);
                              origOpen.apply(this, args);
                           };

                           const origFetch = window.fetch;
                           window.fetch = async (...args) => {
                              resetTimer();
                              let res = await origFetch(...args);
                              resetTimer();
                              return res;
                           };

                           resetTimer();
                        }

                        function cleanMainCol() {
                           const container = document.querySelector(
                              'div[data-container-id="main-col"]'
                           );
                           if (!container) return "";

                           container.querySelector("[jsmodel]")?.remove();

                           document
                              .querySelectorAll(
                                 `div[data-container-id="main-col"] > div > div:has(img)`
                              )
                              ?.forEach((el) => el?.remove());

                           const clone = container.cloneNode(true);

                           // CSS properties we actually care about
                           const importantProps = [
                              "color",
                              "background-color",
                              "background-image",
                              "background-size",
                              "background-position",
                              "background-repeat",
                              "font-family",
                              "font-size",
                              "font-weight",
                              "font-style",
                              "line-height",
                              "text-align",
                              "text-decoration",
                              "letter-spacing",
                              "word-spacing",
                              "white-space",
                              "display",
                              "position",
                              "top",
                              "right",
                              "bottom",
                              "left",
                              "margin",
                              "margin-top",
                              "margin-right",
                              "margin-bottom",
                              "margin-left",
                              "padding",
                              "padding-top",
                              "padding-right",
                              "padding-bottom",
                              "padding-left",
                              "border",
                              "border-width",
                              "border-style",
                              "border-color",
                              "border-radius",
                              "box-shadow",
                              "width",
                              "height",
                              "max-width",
                              "min-width",
                              "max-height",
                              "min-height",
                              "overflow",
                              "z-index",
                              // "opacity",
                              "visibility",
                              "vertical-align",
                           ];

                           function applyStyles(src, dst) {
                              if (!src || !dst) return;

                              if (src.nodeType === Node.COMMENT_NODE) {
                                 dst.remove();
                                 return;
                              }

                              if (
                                 src.nodeType === Node.ELEMENT_NODE &&
                                 dst.nodeType === Node.ELEMENT_NODE
                              ) {
                                 const computed = window.getComputedStyle(src);
                                 let styleStr = "";

                                 importantProps.forEach((prop) => {
                                    const val = computed.getPropertyValue(prop);
                                    if (
                                       val &&
                                       val !== "auto" &&
                                       val !== "normal" &&
                                       val !== "none" &&
                                       val !== "rgba(0, 0, 0, 0)"
                                    ) {
                                       styleStr += `${prop}:${val};`;
                                    }
                                 });

                                 if (styleStr) {
                                    dst.setAttribute("style", styleStr);
                                 }
                              }

                              const srcChildren = src.childNodes;
                              const dstChildren = dst.childNodes;
                              for (let i = 0; i < srcChildren.length; i++) {
                                 applyStyles(srcChildren[i], dstChildren[i]);
                              }
                           }

                           applyStyles(container, clone);

                           return clone.outerHTML;
                        }

                        waitForNetworkIdle(() => {
                           resolve(cleanMainCol());
                        }, 2000);
                     });
                  },

                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     chrome.tabs.remove(tabId);
                  }
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}

runtimeOnMessage("IF_B_GET_ANSWER", async ({ data }, { tab }, sendResponse) => {
   const answer = await getGoogleAiAnswer(data.question);
   sendResponse({ status: "success", answer });
});

// google https://www.google.com/search?q=what+is+java&sa=X&udm=50
// bing: https://www.bing.com/copilotsearch?q=what+is+java&FORM=CSSCOP
// chatgpt: https://chat.openai.com/  ?????!!!!!
// grok: https://grok.com/?q=what+is+java?
// gemini: https://gemini.google.com/app ?????!!!!!
