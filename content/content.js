console.log("content script loaded");
injectJSLink(chrome.runtime.getURL("./../inject/html2canvas.js"));
injectJSLink(chrome.runtime.getURL("./../inject/dom2image.js"));
injectJSLink(chrome.runtime.getURL("./../inject/tailwind.js"));
injectJSLink(chrome.runtime.getURL("./../inject/select.js"));
injectJSLink(chrome.runtime.getURL("./../utils.js"));

pageOnMessage("i_c_selected_image", async (data) => {
   if (!data.imgData) return;
   const { imgData } = data;

   try {
      const data = await Tesseract.recognize(imgData, "eng", {
         // logger: (m) => console.log(m),
      });

      if (data?.data?.text) {
         const { text } = data?.data;
         console.log(text);
         
         runtimeSendMessage("c_b", { imgData, text }, (r) => {
            console.log(r);
         });
      }
   } catch (error) {
      console.log("Error during OCR processing:", error);
   }
});

runtimeOnMessage("b_c_answer", async ({ answer }, _, sendResponse) => {
   console.log(answer);
   sendResponse("Get It");
});
