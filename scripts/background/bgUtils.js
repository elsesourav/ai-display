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

function ensureOffscreen() {
   return new Promise(async (resolve) => {
      if (!(await chrome.offscreen.hasDocument())) {
         await chrome.offscreen.createDocument({
            url: "./../offscreen/offscreen.html",
            reasons: ["BLOBS"],
            justification: "Need hidden DOM/canvas",
         });
      }
      resolve();
   });
}

/* ---------------- offscreen ---------------- */
function __OCR__(imageData, rectInfo) {
   return new Promise(async (resolve) => {
      await ensureOffscreen();
      await wait(100);

      runtimeSendMessage("C_OF_START_QRC", { imageData, rectInfo }, (res) => {
         console.log(res);

         if (res.success) {
            resolve(res);
         } else {
            console.log("Failed to get rubrics PDF:", res.message);
            resolve(res.message);
         }
      });
   });
}

/* ---------------- injects content script ---------------- */
function __SELECT__(tabId) {
   executeScript(
      tabId,
      () => {
         const existingFrame = document.getElementById("screenSelectorIframe");

         if (!existingFrame) {
            const frame = document.createElement("iframe");
            frame.setAttribute("id", "screenSelectorIframe");
            frame.setAttribute("allowtransparency", "true");
            frame.setAttribute("frameborder", "0");

            // Set inline styles for transparency
            frame.style = `
               position: fixed;
               width: 100svw;
               height: 100svh;
               inset: 0;
               border: none;
               background: transparent !important;
               z-index: 825003265;
               pointer-events: auto;
               isolation: isolate;
            `;

            // Add additional style attributes to ensure transparency
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               `${currentStyle}; color-scheme: only light !important;`
            );

            frame.src = chrome.runtime.getURL("./inject/selection.html");
            document.body.append(frame);
         }
      },
      tabId
   );
}

function __PUSH_MENU__(tabId) {
   executeScript(
      tabId,
      () => {
         const existingMWF = document.getElementById("menuWindowIframe");
         const existingMWbF = document.getElementById("menuWindowBackIframe");

         if (!existingMWF) {
            const frame = document.createElement("iframe");
            frame.setAttribute("id", "menuWindowIframe");
            frame.setAttribute("frameborder", "0");
            frame.setAttribute("allowtransparency", "true");

            // Add additional style attributes to ensure transparency
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               `${currentStyle}; color-scheme: light dark !important;`
            );

            const style = document.createElement("style");
            style.textContent = `
               #menuWindowIframe {
                  position: fixed;
                  top: 0px;
                  left: 0px;
                  width: 160px;
                  height: 50px;
                  background: transparent !important;
                  /* background-color: #0f04; */
                  z-index: 825003263;
               }
            `;

            document.head.appendChild(style);
            frame.src = chrome.runtime.getURL("./inject/menuWindow.html");
            document.body.append(frame);
         } else {
            existingMWF.style.display = "block";
         }

         if (!existingMWbF) {
            const frame = document.createElement("iframe");
            frame.setAttribute("id", "menuWindowBackIframe");
            frame.setAttribute("frameborder", "0");
            frame.setAttribute("allowtransparency", "true");

            // Add additional style attributes to ensure transparency
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               `${currentStyle}; color-scheme: light dark !important;`
            );

            const style = document.createElement("style");
            style.textContent = `
               #menuWindowBackIframe {
                  position: fixed;
                  top: 0px;
                  left: 0px;
                  width: 50px;
                  height: 50px;
                  background: transparent !important;
                  z-index: 825003264;
               }
            `;

            document.head.appendChild(style);
            frame.src = chrome.runtime.getURL("./inject/menuWindowBack.html");
            document.body.append(frame);
         } else {
            existingMWbF.style.display = "block";
         }
      },
      tabId
   );
}