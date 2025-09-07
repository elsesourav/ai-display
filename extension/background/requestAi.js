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

                           // remove if <img> has no <mark>
                           document
                              .querySelector(
                                 `div[data-container-id="main-col"] > div > div:has(img):has(img)`
                              )
                              ?.querySelector("img")
                              ?.parentElement.remove();

                           // remove all img tag parent divs
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

async function getChatGptAnswer(prompt) {
   return new Promise((resolve) => {
      const url = "https://chat.openai.com";

      chrome.tabs.create({ url, active: false }, (tab) => {
         const tabId = tab.id;

         function listener(updatedTabId, info) {
            if (updatedTabId === tabId && info.status === "complete") {
               chrome.tabs.onUpdated.removeListener(listener);

               // Small delay so Google loads
               executeScriptReturn(
                  tabId,
                  (prompt) => {
                     return new Promise(async (resolve) => {
                        await new Promise((r) => setTimeout(r, 1000));
                        document
                           .querySelector("[data-testid='dismiss-welcome']")
                           ?.click();

                        await new Promise((r) => setTimeout(r, 100));

                        const getSearchArea = () => {
                           return document.querySelector("div.ProseMirror");
                        };

                        const isFindSearchArea = await ___pollForContent(
                           getSearchArea
                        );

                        if (!isFindSearchArea) {
                           resolve("");
                           return;
                        }



                        try {
                           const define = (proto, prop, val) => {
                              try {
                                 Object.defineProperty(proto, prop, {
                                    configurable: true,
                                    get: () => val,
                                 });
                              } catch {}
                           };
                           const apply = () => {
                              define(Document.prototype, "hidden", false);
                              define(
                                 Document.prototype,
                                 "visibilityState",
                                 "visible"
                              );
                              document.hasFocus = () => true;
                           };
                           apply();

                           // Re-apply if site redefines
                           [
                              "visibilitychange",
                              "readystatechange",
                              "blur",
                              "focus",
                           ].forEach((ev) =>
                              document.addEventListener(ev, apply, true)
                           );

                           // Periodic nudge so internal checks think page is active
                           setInterval(() => {
                              document.dispatchEvent(
                                 new Event("visibilitychange")
                              );
                              window.dispatchEvent(new Event("focus"));
                           }, 4000);
                        } catch {}


                        await ___askGPT(prompt);

                        function cleanMainCol() {
                           
                           const container = document.querySelector(
                              "[data-message-author-role='assistant']"
                           );

                           console.log(container);

                           if (!container) return "";

                           console.log(container.innerHTML);

                           console.log(___getHTMLCodeWithCss(container));
                           

                           return ___getHTMLCodeWithCss(container);
                        }

                        const result = await ___pollForContent(cleanMainCol);
                        resolve(result);
                     });
                  },
                  (injectResult) => {
                     const cleanedHtml = injectResult?.[0]?.result || "";
                     resolve(cleanedHtml);
                     // chrome.tabs.remove(tabId);
                  },
                  [prompt]
               );
            }
         }

         chrome.tabs.onUpdated.addListener(listener);
      });
   });
}
