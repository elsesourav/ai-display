// injectJSLink(chrome.runtime.getURL("./../inject/select.js"));
// injectJSLink(chrome.runtime.getURL("./../utils.js"));

console.log("content script loaded");

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

runtimeOnMessage("B_C_SETUP_MENU", async (_, __, sendResponse) => {
   console.log("Setup Menu");
   sendResponse("ok");
   // setupMenu();
});

runtimeOnMessage("B_C_CLOSE_MENU", async (_, __, sendResponse) => {
   console.log("Close Menu");
   sendResponse("ok");
   closeMenu();
});

runtimeOnMessage("b_c_answer", async ({ answer }, _, sendResponse) => {
   console.log(answer);
   sendResponse("Get It");
});

runtimeSendMessage("C_B_ON_LOAD", async (r) => {
   console.log(r);
});

const removeIframe = (selector) => {
   const iFrame = document.querySelector(selector);
   if (iFrame) {
      iFrame.remove();
   }
};

pageOnMessage("I_C_OCR_RESULT", async ({ text }) => {
   console.log(text);
   removeIframe("iframe.ai-display");
});

pageOnMessage("I_C_SELECT_COORDS", async ({ coordinates }) => {
   console.log(coordinates);
   removeIframe("iframe.aid-selection");
   runtimeSendMessage("C_B_CAPTURE_DOM", {
      coordinates,
      devicePixelRatio: window.devicePixelRatio,
   });
});

pageOnMessage("I_C_SELECT_CANCEL", async () => {
   console.log("Selection cancelled");
   removeIframe("iframe.aid-selection");
});

chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
   if (settings.enable) {
      // setupMenu();
   }
});

let position = { x: 0, y: 0 };
const SIZES = [
   { w: "160px", h: "50px" },
   { w: "380px", h: "560px" },
];
let size = SIZES[+false]; // 0

pageOnMessage("I_C_POSITION_SET", () => {
   const iFrame = document.querySelector("iframe.aid-window");
   if (iFrame) {
      pagePostMessage("C_I_POSITION_RESTORE", position, iFrame.contentWindow);

      iFrame.style.left = `0px`;
      iFrame.style.top = `0px`;
      iFrame.style.width = "100svw";
      iFrame.style.height = "100svh";
   }
});

pageOnMessage("I_C_POSITION_LIVE", ({ x, y }) => {
   position = { x, y };
});

pageOnMessage("I_C_POSITION_RESTORE", () => {
   const { x, y } = position;
   const iFrame = document.querySelector("iframe.aid-window");
   if (iFrame) {
      iFrame.style.left = `${x}px`;
      iFrame.style.top = `${y}px`;
      iFrame.style.width = size.w;
      iFrame.style.height = size.h;
   }
});

pageOnMessage("I_C_CHAT_TOGGLE", (isOpen) => {
   size = SIZES[+isOpen]; // +true = 1, +false = 0
   const iFrame = document.querySelector("iframe.aid-window");
   if (iFrame) {
      setTimeout(() => {
         iFrame.style.width = size.w;
         iFrame.style.height = size.h;
      }, 400 * +!isOpen); // if isOpen = true, then +!isOpen = 0, so 400 * 0 = 0
   }
});

// let isDragging = false;

// pageOnMessage("I_C_IS_DRAGGING", async (_isDragging) => {
//    isDragging = _isDragging;
//    if (isDragging) {
//       const iFrame = document.querySelector("iframe.aid-window");
//       iFrame.style.pointerEvents = "none";
//       iFrame.style.opacity = "0";
//    };

//    console.log(isDragging);
// });

// window.addEventListener("mousemove", (e) => {
//    console.log(e.clientX, e.clientY);

//    if (isDragging) {
//       console.log(e.clientX, e.clientY);
//    }
// });

// window.addEventListener("mouseup", () => {
//    isDragging = false;
//    const iFrame = document.querySelector("iframe.aid-window");
//    if (!iFrame) return;
//    iFrame.style.pointerEvents = "auto";
// });

function setupMenu() {
   // const existingFrame = document.querySelector("iframe.aid-window");

   // if (!existingFrame) {
   //    const frame = document.createElement("iframe");
   //    frame.classList.add("aid-window");
   //    frame.setAttribute("allowtransparency", "true");

   //    // Add additional style attributes to ensure transparency
   //    const currentStyle = frame.getAttribute("style") || "";
   //    // set light and dark theme
   //    frame.setAttribute(
   //       "style",
   //       `${currentStyle}; color-scheme: light dark !important;`
   //    );

   //    frame.src = chrome.runtime.getURL("./inject/window.html");
   //    document.documentElement.append(frame);

   //    frame.onload = () => {
   //       injectScript("inject/menuMove.js", "text/javascript", false);
   //    };
   // }

   const existingMenu = document.querySelector("div#__AID_MENU__");
   if (existingMenu) {
      existingMenu.style.display = "block";
      return;
   }

   const __AID_MENU__ = document.createElement("div");
   const shadow = __AID_MENU__.attachShadow({ mode: "open" });
   __AID_MENU__.style = `
      position: fixed;
      width: 200px;
      height: 50px;
      inset: 0;
      border: none;
      background: transparent !important;
      z-index: 8250032643;
      pointer-events: auto;
   `;
   __AID_MENU__.id = "__AID_MENU__";

   /*

   <script type="module" crossorigin src="/assets/window-C8xS_yiZ.js"></script>
   <link rel="modulepreload" crossorigin href="/assets/client-Dsk2-liH.js">
   <link rel="modulepreload" crossorigin href="/assets/iconBase-rRARMq-L.js">
   <link rel="stylesheet" crossorigin href="/assets/window-D9yFeG7s.css">
   <link rel="stylesheet" crossorigin href="/assets/icon-RtkLhjiT.css">

   */

   const div = document.createElement("div");
   div.id = "root";
   shadow.append(div);

   setTimeout(() => {
      function inject(tag) {
         shadow.appendChild(tag);
      }

      // 3. Inject <script type="text/javascript" src="./../utils.js">
      const utilsScript = document.createElement("script");
      utilsScript.type = "text/javascript";
      utilsScript.src = chrome.runtime.getURL("utils.js"); // adjust path if outside extension
      inject(utilsScript);

      // 4. Inject <script type="module" crossorigin src="/assets/window-C8xS_yiZ.js">
      const moduleScript = document.createElement("script");
      moduleScript.type = "module";
      moduleScript.crossOrigin = "";
      moduleScript.src = chrome.runtime.getURL("assets/window-C8xS_yiZ.js");
      inject(moduleScript);

      // 5. Inject <link rel="modulepreload" ...>
      ["assets/client-Dsk2-liH.js", "assets/iconBase-rRARMq-L.js"].forEach(
         (file) => {
            const preload = document.createElement("link");
            preload.rel = "modulepreload";
            preload.crossOrigin = "";
            preload.href = chrome.runtime.getURL(file);
            inject(preload);
         }
      );

      // 6. Inject <link rel="stylesheet" ...>
      ["assets/window-D9yFeG7s.css", "assets/icon-RtkLhjiT.css"].forEach(
         (file) => {
            const stylesheet = document.createElement("link");
            stylesheet.rel = "stylesheet";
            stylesheet.crossOrigin = "";
            stylesheet.href = chrome.runtime.getURL(file);
            inject(stylesheet);
         }
      );
   }, 1000);

   document.body.append(__AID_MENU__);
}

function closeMenu() {
   const existingMenu = document.querySelector("div#__AID_MENU__");
   if (existingMenu) {
      existingMenu.style.display = "none";
      return;
   }
}
