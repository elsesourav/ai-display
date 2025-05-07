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

pageOnMessage("I_C_OCR_RESULT", async ({ text }) => {
   console.log(text);
});
