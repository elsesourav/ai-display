async function getGoogleAiAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://www.google.com/search?q=${encodeURIComponent(
         q
      )}&sa=X&udm=50`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;
         chromeTabMediaAccess(tabId, true);

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        async function cleanMainCol() {
                           const container = document.querySelector(
                              'div[data-container-id="main-col"]'
                           );
                           if (!container) return null;
                           return await ___getHTMLCodeWithCss(container, "google");
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
                     });
                  },
                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     chromeTabMediaAccess(tabId, false);
                     chrome.tabs.remove(tabId);
                  }
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}

async function getBingAiAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://www.bing.com/copilotsearch?q=${encodeURIComponent(
         q
      )}&FORM=CSSCOP`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;
         chromeTabMediaAccess(tabId, true);

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        async function cleanMainCol() {
                           const container = document
                              .querySelector(".frame_cont iframe")
                              ?.contentDocument?.querySelector(
                                 "#ca_main .gs_multianshead_main"
                              );
                           if (!container) return "";
                           return await ___getHTMLCodeWithCss(container);
                        }

                        const result = await ___pollForContent(cleanMainCol, "bing");
                        resolve(result);
                     });
                  },

                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     chromeTabMediaAccess(tabId, false);
                     chrome.tabs.remove(tabId);
                  }
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}

async function getGrokAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://grok.com/?q=${encodeURIComponent(q)}`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;
         chromeTabMediaAccess(tabId, true);

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        async function cleanMainCol() {
                           const container1 = document.querySelector(
                              "main #last-reply-container > div:nth-child(2) > div > [dir='auto']"
                           );
                           const container2 = document.querySelector(
                              "main #last-reply-container .thinking-container ~ div"
                           );

                           const isLimitOver = [
                              ...document.querySelectorAll("div"),
                           ].find((el) =>
                              el
                                 .querySelector("h2")
                                 ?.textContent.includes(
                                    "Sign up to continue with Grok"
                                 )
                           );

                           if (isLimitOver) return false;
                           if (!container1 && !container2) return "";

                           return await ___getHTMLCodeWithCss(
                              container1 || container2, "grok"
                           );
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
                     });
                  },

                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     chromeTabMediaAccess(tabId, false);
                     chrome.tabs.remove(tabId);
                  }
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}

async function getPerplexityAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;
         chromeTabMediaAccess(tabId, true);

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        async function cleanMainCol() {
                           const container = document.querySelector(
                              "#markdown-content-0"
                           );
                           if (!container) return "";
                           return await ___getHTMLCodeWithCss(container, "perplexity");
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
                     });
                  },

                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     chromeTabMediaAccess(tabId, false);
                     chrome.tabs.remove(tabId);
                  }
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}

async function getGeminiAnswer(q) {
   return new Promise((resolve) => {
      const url = "https://gemini.google.com/app";

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;
         chromeTabMediaAccess(tabId, true);

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  (prompt) => {
                     return new Promise(async (resolve) => {
                        const getSearchArea = () => {
                           return document.querySelector(
                              "div.ql-editor.textarea.new-input-ui"
                           );
                        };

                        const isFindSearchArea = await ___pollForContent(
                           getSearchArea
                        );

                        if (!isFindSearchArea) {
                           resolve("");
                           return;
                        }

                        await ___askGemini(prompt);

                        async function cleanMainCol() {
                           const container = document.querySelector(
                              ".markdown-main-panel"
                           );
                           if (!container) return "";
                           return await ___getHTMLCodeWithCss(container, "gemini");
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
                     });
                  },
                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     chromeTabMediaAccess(tabId, false);
                     chrome.tabs.remove(tabId);
                  },
                  [q]
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}
