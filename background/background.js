importScripts("./utils.js", "./bgUtils.js", "./apiCall.js");

console.log("background script loaded");

function sendAnswer(tabId, answer) {
   tabSendMessage(tabId, "b_c_answer", { answer });
}

async function extractTextFromImage(imgData, options = {}) {}

runtimeOnMessage(
   "c_b",
   async ({ imgData, ocrOptions }, { tab }, sendResponse) => {
      const { id } = tab;

      try {
         // Convert imgData to text using OCR
         console.log("Starting OCR process with options:", ocrOptions);
         const text = await extractTextFromImage(imgData, ocrOptions);
         console.log("Extracted text:", text);

         // Send initial response to let the client know OCR is complete
         sendResponse({
            success: true,
            message: "OCR processing complete, running AI models",
            text: text,
         });

         // Process the recognized text with AI models
         const tracks = [];
         const allTasks = [
            microsoftPhi4ReasoningPlus(text),
            metaLlamaLlama4Maverick(text, imgData),
         ];

         allTasks.forEach(async (task, index) => {
            tracks.push(task);
            try {
               const result = await task;
               console.log(`Call ${index + 1} completed. Result:`, result);
               sendAnswer(id, result);
            } catch (error) {
               console.error(`Call ${index + 1} failed:`, error);
               // Send error to client
               sendAnswer(id, {
                  error: `AI model ${index + 1} failed: ${error.message}`,
               });
            }
         });

         // Wait for all tasks to complete
         await Promise.all(tracks);
         console.log("All AI model calls completed.");

         // No need to call sendResponse again as we already sent it above
         return true; // Keep the message channel open for async response
      } catch (error) {
         console.error("Overall error during OCR or API calls:", error);
         sendResponse({
            success: false,
            error: error.message,
            message: "Failed to process image",
         });
         return;
      }
   }
);

// if script inject and loaded then resolve
// runtimeOnMessage("C_B_IFRAME_LOAD_STATUS", ({ message }) => {
//    resolve(message);
// });

// Get OCR configuration options
runtimeOnMessage("P_B_TOGGLE", async (_, __, sendResponse) => {
   chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
      const { id, windowId } = await getActiveTab();
      console.log(settings);
      
      chrome.tabs.captureVisibleTab(windowId, { format: "png" }, (img) => {
         __OCR__(id, img, {
            top: 0,
            left: 0,
            width: 1000,
            height: 800,
            devicePixelRatio: 1,
         });
      });

      if (settings.enable) {
      } else {
      }
   });
   return sendResponse("ok");
});

runtimeOnMessage("C_B_SETUP_IFRAME", (_, { tab }, sendResponse) => {
   addIFrame(tab.id).then((res) => {
      sendResponse(res);
   });
});

runtimeOnMessage("C_B_REMOVE_IFRAME", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   removeIFrame(tab.id);
});

