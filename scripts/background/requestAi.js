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
                           container
                              .querySelectorAll("* > button:has(svg)")
                              ?.forEach((el) => el.remove());
                           
                           container
                              .querySelector("[class='DBd2Wb']")
                              ?.remove();

                           document
                              .querySelectorAll(
                                 `div[data-container-id="main-col"] > div > div:has(img)`
                              )
                              ?.forEach((el) => el?.remove());

                           container.querySelector("[jsmodel]")?.remove();


                           return await ___getHTMLCodeWithCss(container);
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
                           container
                              .querySelectorAll("a")
                              .forEach((el) => el.parentElement.remove());
                           container
                              .querySelector(".gs_ans_head_group")
                              ?.remove();

                           return await ___getHTMLCodeWithCss(container);
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
                           if (!container1 && !container2) return "";

                           (container1 || container2)
                              ?.querySelectorAll("* > button:has(svg)")
                              ?.forEach((el) => el.remove());

                           return await ___getHTMLCodeWithCss(
                              container1 || container2
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

                           // remove first row images
                           container
                              .querySelector("div:first-child:has(img)")
                              ?.remove();

                           // remove inside images
                           container
                              .querySelectorAll(" button:has(img)")
                              ?.forEach((el) => el.remove());
                           
                           container
                              .querySelectorAll("* > button:has(svg)")
                              ?.forEach((el) => el.remove());

                           container
                              .querySelectorAll("* > [rel='noopener']")
                              ?.forEach((el) => el.remove());

                           return await ___getHTMLCodeWithCss(container);
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
