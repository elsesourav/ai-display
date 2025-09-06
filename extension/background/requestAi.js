async function getGoogleAiAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://www.google.com/search?q=${encodeURI(q)}&sa=X&udm=50`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        function cleanMainCol() {
                           const container = document.querySelector(
                              'div[data-container-id="main-col"]'
                           );
                           if (!container) return null;

                           container.querySelector("[jsmodel]")?.remove();

                           document
                              .querySelectorAll(
                                 `div[data-container-id="main-col"] > div > div:has(img)`
                              )
                              ?.forEach((el) => el?.remove());

                           return ___getHTMLCodeWithCss(container);
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
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

async function getBingAiAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://www.bing.com/copilotsearch?q=${encodeURI(
         q
      )}&FORM=CSSCOP`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        function cleanMainCol() {
                           const container = document
                              .querySelector(".frame_cont iframe")
                              ?.contentDocument?.querySelector(
                                 "#ca_main .gs_multianshead_main"
                              );
                           if (!container) return "";
                           container
                              .querySelectorAll("a")
                              .forEach((el) => el.parentElement.remove());
                           container
                              .querySelector(".gs_ans_head_group")
                              ?.remove();

                           return ___getHTMLCodeWithCss(container);
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
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

async function getGrokAnswer(q) {
   return new Promise((resolve) => {
      const url = `https://grok.com/?q=${encodeURI(q)}`;

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  () => {
                     return new Promise(async (resolve) => {
                        function cleanMainCol() {
                           const container = document.querySelector(
                              "main #last-reply-container > div:nth-child(2) > div > [dir='auto']"
                           );
                           if (!container) return "";

                           return ___getHTMLCodeWithCss(container);
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
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
