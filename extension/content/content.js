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

// runtimeOnMessage("B_C_CLOSE_MENU", async (_, __, sendResponse) => {
//    console.log("Close Menu");
//    sendResponse("ok");
//    closeMenu();
// });

runtimeSendMessage("C_B_ON_LOAD", async (r) => {
   console.log(`Menu loaded: ${JSON.stringify(r)}`);
});

pageOnMessage("I_C_OCR_RESULT", async ({ text, image }) => {
   document.querySelector("iframe.ai-display")?.remove();
   console.log(text, image);

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
   console.log(coordinates);
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
