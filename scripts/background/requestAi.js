async function getGoogleAiAnswer(q) {
   return new Promise((resolve) => {
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
                              // "height",
                              "max-width",
                              "min-width",
                              // "max-height",
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
                                    let val = computed.getPropertyValue(prop);

                                    if (
                                       prop === "width" ||
                                       prop === "max-width"
                                    ) {
                                       styleStr += `${prop}:min(${val}, 450px)`;
                                    } else if (
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
                     return new Promise((resolve) => {
                        function waitForNetworkIdle(callback, timeout) {
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
                              // "height",
                              "max-width",
                              "min-width",
                              // "max-height",
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
                                    let val = computed.getPropertyValue(prop);

                                    if (
                                       prop === "width" ||
                                       prop === "max-width"
                                    ) {
                                       styleStr += `${prop}:min(${val}, 440px)`;
                                    } else if (
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
                        }, 8000);
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
                     return new Promise((resolve) => {
                        function waitForNetworkIdle(callback, timeout) {
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
                              "main #last-reply-container > div:nth-child(2) > div > [dir='auto']"
                           );
                           if (!container) return "";

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
                              // "height",
                              "max-width",
                              "min-width",
                              // "max-height",
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
                                    let val = computed.getPropertyValue(prop);

                                    if (
                                       prop === "width" ||
                                       prop === "max-width"
                                    ) {
                                       styleStr += `${prop}:min(${val}, 440px)`;
                                    } else if (
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
                        }, 4000);
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
