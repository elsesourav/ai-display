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

runtimeOnMessage("B_C_CLOSE_MENU", async (_, __, sendResponse) => {
   console.log("Close Menu");
   sendResponse("ok");
   closeMenu();
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

pageOnMessage("I_C_OCR_RESULT", async ({ text, image }) => {
   console.log(text);
   removeIframe("iframe.ai-display");

   const windowFrame = document.querySelector("iframe.aid-window");
   if (windowFrame) {
      pagePostMessage(
         "C_I_SET_INPUTS",
         { input: text, image },
         windowFrame.contentWindow
      );
      pagePostMessage("C_I_OPEN_CHAT", {}, windowFrame.contentWindow);
   }
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

pageOnMessage("I_C_SELECT_TEXT", () => {
   runtimeSendMessage("C_B_SELECT_TEXT");
});

pageOnMessage("C_I_SET_QUESTION", ({ question, image }) => {
   runtimeSendMessage("C_B_GET_ANSWER", { question, image });
});

runtimeOnMessage("B_C_SET_ANS", async ({ answer }, _, sendResponse) => {
   console.log(answer);
   const windowFrame = document.querySelector("iframe.aid-window");
   if (windowFrame) {
      pagePostMessage("C_I_SET_ANSWER", { answer }, windowFrame.contentWindow);
   }

   sendResponse("ok");
});


function closeMenu() {
   const existingMenu = document.querySelector("iframe.aid-window");
   if (existingMenu) {
      existingMenu.style.display = "none";
      return;
   }
}
