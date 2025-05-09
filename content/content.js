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

pageOnMessage("I_C_MENU_INFO_UPDATE", ({ menuInfo }) => {
   updateIframePosition(menuInfo);
});

function updateIframePosition(menuInfo) {
   const iframe = document.querySelector("iframe.aid-menu");
   if (!iframe) return;

   iframe.style.left = `${menuInfo.x}px`;
   iframe.style.top = `${menuInfo.y}px`;

   const width =
      typeof menuInfo.width === "string"
         ? menuInfo.width
         : `${menuInfo.width}px`;
   const height =
      typeof menuInfo.height === "string"
         ? menuInfo.height
         : `${menuInfo.height}px`;

   iframe.style.width = width;
   iframe.style.height = height;
}
