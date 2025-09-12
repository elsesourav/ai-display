console.log("content script loaded");

function removeElementBySelector(container, selector) {
   container.querySelector(selector)?.remove();
}
function removeElementsBySelector(container, selector) {
   container.querySelectorAll(selector)?.forEach((el) => el.remove());
}

function removeAllAttributes(container) {
   // Remove all attributes from the container itself
   if (container.attributes) {
      Array.from(container.attributes).forEach((attr) => {
         container.removeAttribute(attr.name);
      });
   }

   // Remove all attributes from all child elements recursively
   container.querySelectorAll("*").forEach((element) => {
      if (element.attributes) {
         Array.from(element.attributes).forEach((attr) => {
            element.removeAttribute(attr.name);
         });
      }
   });
}

const CONTENT_STABLE_WAIT_TIME = 1500; // ms - wait time for content to be stable

function ___getHTMLCodeWithCss(container, provider) {
   return new Promise((resolve) => {
      // Validation
      const isMinTextComplete = container?.textContent?.trim()?.length < 10;
      if (isMinTextComplete) {
         resolve(null);
         return;
      }

      // Content monitoring variables
      let lastContent = container.innerHTML;
      let intervalId;

      // Helper function to get user-applied styles
      function getUserAppliedStyles(el) {
         const computed = getComputedStyle(el);
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

      // Apply filtered styles to cloned elements
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

         // Recursively apply styles to children
         const srcChildren = src.childNodes;
         const dstChildren = dst.childNodes;
         for (let i = 0; i < srcChildren.length; i++) {
            applyStyles(srcChildren[i], dstChildren[i]);
         }
      }

      // Clean provider-specific elements
      function cleanProviderSpecificElements(container, provider) {
         removeElementsBySelector(container, "* > button:has(svg)");
         removeElementsBySelector(container, "* > a:has(svg)");

         switch (provider) {
            case "google":
               removeElementBySelector(document, ".DBd2Wb");
               removeElementsBySelector(container, "img");
               removeElementsBySelector(container, "svg");
               removeElementsBySelector(
                  document,
                  `div[data-container-id="main-col"] > div > div:has(img)`
               );
               removeElementBySelector(container, "[jsmodel]");
               break;

            case "bing":
               removeElementsBySelector(container, "* > a");
               removeElementBySelector(container, ".gs_ans_head_group");
               break;

            case "perplexity":
               removeElementBySelector(container, "div:first-child:has(img)");
               removeElementsBySelector(container, " button:has(img)");
               removeElementsBySelector(container, "* > [rel='noopener']");
               break;

            case "grok":
               break;

            case "gemini":
               removeElementsBySelector(container, "* > button:has(mat-icon)");
               removeElementsBySelector(container, "response-element");
               break;
         }
      }

      // Generate final HTML with all processing
      function generateHTMLCode() {
         cleanProviderSpecificElements(container, provider);
         const clone = container.cloneNode(true);
         applyStyles(container, clone);
         removeAllAttributes(clone);
         return clone.outerHTML;
      }

      // Monitor content changes
      function checkForUpdates() {
         const currentContent = container.textContent.length;

         if (currentContent !== lastContent) {
            lastContent = currentContent;
         } else {
            clearInterval(intervalId);
            const htmlCode = generateHTMLCode();
            resolve(htmlCode);
         }
      }

      // Start monitoring
      checkForUpdates();
      intervalId = setInterval(checkForUpdates, CONTENT_STABLE_WAIT_TIME);
   });
}

function ___pollForContent(cleanFunction) {
   const maxLimit = 40;
   const checkDelay = 500; // ms
   return new Promise(async (resolve) => {
      for (let i = 0; i < maxLimit; i++) {
         let html = await cleanFunction();

         if (html === false) {
            resolve(
               "<mark>Limit Exceeded or Slow Network, Try Again after some time.</mark>"
            );
         } else if (html) {
            resolve(html);
            return;
         } else await new Promise((r) => setTimeout(r, checkDelay));
      }
      resolve(
         "<mark>Limit Exceeded or Slow Network, Try Again after some time.</mark>"
      );
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

async function ___askGemini(prompt) {
   // Find Gemini’s rich-text editor
   const editor = document.querySelector("div.ql-editor.textarea.new-input-ui");
   console.log(editor);

   if (editor) {
      // Clear any existing text
      editor.textContent = "";
      editor.textContent = prompt;

      editor.dispatchEvent(
         new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: prompt,
         })
      );

      await new Promise((r) => setTimeout(r, 200));

      const sendBtn = document.querySelector("button.send-button");
      if (sendBtn) {
         sendBtn.click();
      } else {
         console.error("Send button not found.");
      }
   } else {
      console.error("Gemini input box not found.");
   }
}

onload = () => {
   const style = document.createElement("style");
   style.innerHTML = `
      iframe {
         overflow: hidden !important;
         overscroll-behavior: contain;
      }
   `;
   document.head.appendChild(style);
};

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



// pageOnMessage("C_I_SET_QUESTION", ({ question, image }) => {
//    runtimeSendMessage("C_B_GET_ANSWER", { question, image });
// });


// function closeMenu() {
//    const existingMenu = document.querySelector("iframe.aid-window");
//    if (existingMenu) {
//       existingMenu.style.display = "none";
//       return;
//    }
// }
