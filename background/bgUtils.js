/* ------------ all of the models ----------- */
function microsoftPhi4ReasoningPlus(text) {
   return new Promise(async (resolve) => {
      const model = "microsoft/phi-4-reasoning-plus:free";
      const key = await GET__("MP4RP");

      try {
         if (key) {
            const apiKey = await decryptData(key);
            const m = [{ role: "user", content: text }];
            const result = await fetchOpenRouter(apiKey, model, m);
            return resolve(result);
         }
      } catch (error) {
         return resolve(null);
      }
   });
}

function metaLlamaLlama4Maverick(text, imgData) {
   return new Promise(async (resolve) => {
      const model = "meta-llama/llama-4-maverick:free";
      const key = await GET__("MLL4M");

      try {
         const imageUrl = await uploadImageToCloudinary(imgData);
         if (key) {
            const apiKey = await decryptData(key);
            const m = [
               {
                  role: "user",
                  content: [
                     {
                        type: "text",
                        text,
                     },
                     {
                        type: "image_url",
                        image_url: {
                           url: imageUrl,
                        },
                     },
                  ],
               },
            ];
            const result = await fetchOpenRouter(apiKey, model, m);
            return resolve(result);
         }
      } catch (error) {
         return resolve(null);
      }
   });
}

/* ---------------- inject ---------------- */
function __OCR__(tabId, imageData, rectInfo) {
   executeScript(
      tabId,
      (imageData, rectInfo) => {
         const existingFrame = document.querySelector("iframe.ai-display");

         if (!existingFrame) {
            const frame = document.createElement("iframe");
            frame.classList.add("ai-display");
            frame.style = `
               position: fixed;
               height: 0;
               width: 0;
               top: 20px;
               right: 20px;
               border: none;
               z-index: 8250032643;
            `;

            frame.onload = () => {
               pagePostMessage(
                  "C_I_OCR",
                  { imageData, rectInfo },
                  frame.contentWindow
               );
            };

            frame.src = chrome.runtime.getURL("./../inject/inject.html");
            document.documentElement.append(frame);
         } else {
            pagePostMessage(
               "C_I_OCR",
               { imageData, rectInfo },
               existingFrame.contentWindow
            );
         }
      },
      imageData,
      rectInfo
   );
}

function __SELECT__(tabId) {
   executeScript(
      tabId,
      () => {
         const existingFrame = document.querySelector("iframe.aid-selection");

         if (!existingFrame) {
            const frame = document.createElement("iframe");
            frame.classList.add("aid-selection");
            frame.setAttribute("allowtransparency", "true");

            // Set inline styles for transparency
            frame.style = `
               position: fixed;
               width: 100svw;
               height: 100svh;
               inset: 0;
               border: none;
               background: transparent !important;
               z-index: 8250032643;
               pointer-events: auto;
               isolation: isolate;
            `;

            // Add additional style attributes to ensure transparency
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               currentStyle +
                  "; background: transparent !important;" +
                  "; color-scheme: only light !important;"
            );

            frame.src = chrome.runtime.getURL("./inject/selection.html");
            document.documentElement.append(frame);
         }
      },
      tabId
   );
}

function __PUSH_MENU__(tabId) {
   executeScript(
      tabId,
      () => {
         const existingFrame = document.querySelector("iframe.aid-menu");

         if (!existingFrame) {
            const frame = document.createElement("iframe");
            frame.classList.add("aid-menu");
            frame.setAttribute("allowtransparency", "true");

            // Set inline styles for transparency
            frame.style = `
               position: fixed;
               width: auto;
               height: auto;
               border: none;
               background: transparent !important;
               z-index: 8250032643;
               pointer-events: auto;
               isolation: isolate;
               top: 10px;
               left: 10px;
            `;

            // Add additional style attributes to ensure transparency
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               currentStyle +
                  "; background: transparent !important;" +
                  "; color-scheme: only light !important;"
            );

            frame.src = chrome.runtime.getURL("./inject/window.html");
            document.documentElement.append(frame);
         }
      },
      tabId
   );
}

function removeIFrame(tabId) {
   chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
         const existingFrame = document.querySelector("iframe.ai-display");
         if (existingFrame)
            document.querySelector("iframe.ai-display").remove();
      },
   });
}
