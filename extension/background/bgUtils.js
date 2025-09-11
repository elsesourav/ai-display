/* ---------------- offscreen utils ---------------- */
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
         const existingMWF = document.getElementById("__menuWindowIframe");
         const existingMWbF = document.getElementById("menuWindowBackIframe");

         if (!existingMWF) {
            /* ---------------- theme detection ---------------- */
            function detectPageTheme() {
               // Check if page has dark mode indicators
               const body = document.body;
               const html = document.documentElement;

               // Get computed styles
               const bodyStyles = getComputedStyle(body);
               const htmlStyles = getComputedStyle(html);

               // Check background colors
               const bodyBg = bodyStyles.backgroundColor;
               const htmlBg = htmlStyles.backgroundColor;

               // Convert rgb to brightness
               function getBrightness(rgb) {
                  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                  if (match) {
                     const r = parseInt(match[1]);
                     const g = parseInt(match[2]);
                     const b = parseInt(match[3]);
                     return (r * 299 + g * 587 + b * 114) / 1000;
                  }
                  return 255; // default to light if can't parse
               }

               // Focus on page content brightness only
               const hasDataTheme =
                  html.getAttribute("data-theme") === "dark" ||
                  body.getAttribute("data-theme") === "dark";
               const hasThemeClass =
                  html.classList.contains("dark") ||
                  body.classList.contains("dark") ||
                  html.classList.contains("dark-mode") ||
                  body.classList.contains("dark-mode");

               // Check background brightness - primary indicator
               const bodyBrightness = getBrightness(bodyBg);
               const htmlBrightness = getBrightness(htmlBg);
               const isDarkBackground =
                  bodyBrightness < 128 || htmlBrightness < 128;

               // Return theme based on content page indicators only (no system theme)
               if (hasDataTheme || hasThemeClass || isDarkBackground) {
                  return "dark";
               }

               return "light";
            }

            function setupThemeObserver(callback) {
               // Watch for theme changes
               const observer = new MutationObserver(() => {
                  callback(detectPageTheme());
               });

               // Observe changes to class and data attributes
               observer.observe(document.documentElement, {
                  attributes: true,
                  attributeFilter: ["class", "data-theme", "data-color-scheme"],
               });

               observer.observe(document.body, {
                  attributes: true,
                  attributeFilter: ["class", "data-theme", "data-color-scheme"],
               });

               // Watch for media query changes - removed system theme dependency
               // const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
               // mediaQuery.addListener(() => {
               //    callback(detectPageTheme());
               // });

               return observer;
            }

            const currentTheme = detectPageTheme();

            const frame = document.createElement("iframe");
            frame.setAttribute("id", "__menuWindowIframe");
            frame.setAttribute("frameborder", "0");
            frame.setAttribute("allowtransparency", "true");

            // Add additional style attributes with dynamic theme
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               `${currentStyle}; color-scheme: ${currentTheme} !important; border-radius: 12px;`
            );

            const style = document.createElement("style");
            style.textContent = `
               #__menuWindowIframe {
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

            // Setup theme observer for menu iframe
            setupThemeObserver((newTheme) => {
               const existingFrame =
                  document.getElementById("__menuWindowIframe");
               if (existingFrame) {
                  const currentStyle =
                     existingFrame.getAttribute("style") || "";
                  const updatedStyle = currentStyle.replace(
                     /color-scheme:\s*\w+\s*!important;?/,
                     `color-scheme: ${newTheme} !important;`
                  );
                  existingFrame.setAttribute("style", updatedStyle);
               }
            });
         } else {
            existingMWF.style.display = "block";
         }

         if (!existingMWbF) {
            const currentTheme = detectPageTheme();

            const frame = document.createElement("iframe");
            frame.setAttribute("id", "menuWindowBackIframe");
            frame.setAttribute("frameborder", "0");
            frame.setAttribute("allowtransparency", "true");

            // Add additional style attributes with dynamic theme
            const currentStyle = frame.getAttribute("style") || "";
            frame.setAttribute(
               "style",
               `${currentStyle}; color-scheme: ${currentTheme} !important;`
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

            // Setup theme observer for back iframe
            setupThemeObserver((newTheme) => {
               const existingFrame = document.getElementById(
                  "menuWindowBackIframe"
               );
               if (existingFrame) {
                  const currentStyle =
                     existingFrame.getAttribute("style") || "";
                  const updatedStyle = currentStyle.replace(
                     /color-scheme:\s*\w+\s*!important;?/,
                     `color-scheme: ${newTheme} !important;`
                  );
                  existingFrame.setAttribute("style", updatedStyle);
               }
            });
         } else {
            existingMWbF.style.display = "block";
         }
      },
      tabId
   );
}

function chromeTabMediaAccess(tabId, isBlocked = false) {
   if (!isBlocked) {
      chrome.declarativeNetRequest.updateSessionRules({
         removeRuleIds: [tabId],
      });
      return;
   }
   chrome.declarativeNetRequest.updateSessionRules({
      addRules: [
         {
            id: tabId,
            priority: 1,
            action: { type: "block" },
            condition: {
               resourceTypes: ["image", "media", "font"],
               tabIds: [tabId],
            },
         },
      ],
   });
}
