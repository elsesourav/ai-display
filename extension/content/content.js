console.log("content script loaded");

const CONTENT_STABLE_WAIT_TIME = 500; // ms - wait time for content to be stable

function ___getHTMLCodeWithCss(container) {
   return new Promise((resolve) => {
      const isMinTextComplete = container?.textContent?.trim()?.length < 10;

      if (isMinTextComplete) {
         resolve(null);
         return;
      }

      let lastContent = container.innerHTML;
      let lastUpdateTime = Date.now();
      let intervalId;

      function getUserAppliedStyles(el) {
         const computed = getComputedStyle(el);

         // Create a fresh element of the same type
         const fresh = document.createElement(el.tagName);
         document.body.appendChild(fresh);
         const defaultStyles = getComputedStyle(fresh);

         let applied = {};
         for (let prop of computed) {
            if (computed[prop] !== defaultStyles[prop]) {
               applied[prop] = computed[prop];
            }
         }

         fresh.remove();
         return applied;
      }

      function applyStyles(src, dst) {
         if (!src || !dst) return;
         const maxWidth = "400px";

         if (src.nodeType === Node.COMMENT_NODE) {
            dst.remove();
            return;
         }

         if (
            src.nodeType === Node.ELEMENT_NODE &&
            dst.nodeType === Node.ELEMENT_NODE
         ) {
            const appliedStyles = getUserAppliedStyles(src);
            let styleStr = "";

            const allowedStyles = [
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
               "border-radius",
               "font-weight",
               "font-size",
            ];

            Object.entries(appliedStyles).forEach(([prop, val]) => {
               if (prop === "width" || prop === "max-width") {
                  styleStr += `${prop}:min(${val}, ${maxWidth});`;
               } else if (
                  prop === "height" ||
                  prop === "max-height" ||
                  prop === "min-height"
               ) {
                  styleStr += `${prop}:auto;`;
               } else if (
                  allowedStyles.includes(prop) &&
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

      function generateHTMLCode() {
         const clone = container.cloneNode(true);
         applyStyles(container, clone);
         return clone.outerHTML;
      }

      function checkForUpdates() {
         const currentContent = container.innerHTML;
         const currentTime = Date.now();

         if (currentContent !== lastContent) {
            lastContent = currentContent;
            lastUpdateTime = currentTime;
         } else if (currentTime - lastUpdateTime >= CONTENT_STABLE_WAIT_TIME) {
            // No updates for specified time, return the HTML code
            clearInterval(intervalId);
            const htmlCode = generateHTMLCode();
            resolve(htmlCode);
         }
      }

      // Start checking for updates every 500ms
      intervalId = setInterval(checkForUpdates, 500);

      // Also check immediately
      checkForUpdates();
   });
}

function ___pollForContent(cleanFunction) {
   const maxLimit = 40;
   const checkDelay = 500; // ms
   return new Promise(async (resolve) => {
      for (let i = 0; i < maxLimit; i++) {
         let html = await cleanFunction();
         if (html) {
            resolve(html);
            return;
         } else await new Promise((r) => setTimeout(r, checkDelay));
      }
      resolve("<mark>Slow Network or Limit Exceeded, Try Again</mark>");
   });
}

async function ___askGPT(prompt) {
   const editor = document.querySelector("div.ProseMirror");

   if (editor) {
      editor.textContent = prompt;
      editor.dispatchEvent(
         new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: prompt,
         })
      );

      await new Promise((r) => setTimeout(r, 100));

      editor.dispatchEvent(
         new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            key: "Enter",
            code: "Enter",
            which: 13,
            keyCode: 13,
         })
      );
   } else {
      console.error("ChatGPT input box not found.");
   }
}

// ___askGPT("Hello gpt?");

// pageOnMessage("i_c_selected_image", async (data) => {
//    if (!data.imgData) return;
//    const { imgData } = data;

//    runtimeSendMessage("c_b", { imgData }, (r) => {
//       console.log(r);
//    });
// });

// runtimeSendMessage("c_b", { imgData }, (r) => {
//    console.log(r);
// });

// pageOnMessage("I_C_IFRAME_LOAD_STATUS", async ({ message }) => {
//    runtimeSendMessage("C_B_IFRAME_LOAD_STATUS", { message });
// });

// runtimeOnMessage("B_C_CLOSE_MENU", async (_, __, sendResponse) => {
//    console.log("Close Menu");
//    sendResponse("ok");
//    closeMenu();
// });

runtimeSendMessage("C_B_ON_LOAD", async (r) => {
   console.log(`Menu loaded: ${JSON.stringify(r)}`);
});

runtimeOnMessage("B_C_OCR_RESULT", async (data, _, sendResponse) => {
   const { text, image } = data;
   sendResponse({ success: true });

   const menuFrame = document.getElementById("menuWindowIframe");
   if (menuFrame) {
      pagePostMessage(
         "C_IF_SET_INPUTS",
         { input: text, image },
         menuFrame.contentWindow
      );
      pagePostMessage("C_IF_OPEN_CHAT", {}, menuFrame.contentWindow);
   }
});

pageOnMessage("IF_C_SELECT_COORDS", async ({ coordinates }) => {
   document.getElementById("screenSelectorIframe")?.remove();
   runtimeSendMessage("C_B_CAPTURE_DOM", {
      coordinates,
      devicePixelRatio: window.devicePixelRatio,
   });
});

pageOnMessage("IF_C_SELECT_CANCEL", async () => {
   console.log("Selection cancelled");
   document.getElementById("screenSelectorIframe")?.remove();
});

// chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
//    if (settings.enable) {
//       // setupMenu();
//    }
// });

// pageOnMessage("I_C_CHAT_TOGGLE", (data) => {
//    const iFrame = document.querySelector("iframe.aid-window");
//    if (iFrame) {
//       setTimeout(() => {
//          iFrame.style.width = data.width;
//          iFrame.style.height = data.height;
//       }, 400);
//    }
// });

pageOnMessage("IF_C_SELECT_TEXT", () => {
   runtimeSendMessage("C_B_SELECT_TEXT");
});

// pageOnMessage("C_I_SET_QUESTION", ({ question, image }) => {
//    runtimeSendMessage("C_B_GET_ANSWER", { question, image });
// });

// runtimeOnMessage("B_C_SET_ANS", async ({ answer }, _, sendResponse) => {
//    console.log(answer);
//    const windowFrame = document.querySelector("iframe.aid-window");
//    if (windowFrame) {
//       pagePostMessage("C_I_SET_ANSWER", { answer }, windowFrame.contentWindow);
//    }

//    sendResponse("ok");
// });

// function closeMenu() {
//    const existingMenu = document.querySelector("iframe.aid-window");
//    if (existingMenu) {
//       existingMenu.style.display = "none";
//       return;
//    }
// }
