importScripts("./../utils.js", "./bgUtils.js", "./apiCall.js", "./requestAi.js");


console.log("background script loaded");

function sendAnswer(tabId, answer) {
   tabSendMessage(tabId, "B_C_SET_ANS", { answer });
}

runtimeOnMessage(
   "C_B_GET_ANSWER",
   async ({ question, image }, { tab }, sendResponse) => {
      const { id } = tab;

      try {
         const tracks = [];
         const allTasks = [
            microsoftPhi4ReasoningPlus(question),
            metaLlamaLlama4Maverick(question, image),
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

// Get OCR configuration options
runtimeOnMessage("P_B_TOGGLE", async (_, __, sendResponse) => {
   chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
      const tab = await getActiveTab();
      if (isInternalPage(tab)) return;
      if (settings.enable) {
         __PUSH_MENU__(tab.id);
      } else {
         tabSendMessage(tab.id, "B_C_CLOSE_MENU");
      }
   });
   return sendResponse("ok");
});

runtimeOnMessage("C_B_ON_LOAD", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   if (isInternalPage(tab)) return;

   chromeStorageGetLocal(KEYS.SETTINGS, async (settings) => {
      if (settings.enable) {
         __PUSH_MENU__(tab.id);
      }
   });
});

runtimeOnMessage("C_B_SELECT_TEXT", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   __SELECT__(tab.id);
});

runtimeOnMessage(
   "C_B_CAPTURE_DOM",
   ({ coordinates, devicePixelRatio }, { tab }, sendResponse) => {
      const { id, windowId } = tab;
      const rect = {
         top: coordinates.y,
         left: coordinates.x,
         width: coordinates.width,
         height: coordinates.height,
         devicePixelRatio,
      };

      chrome.tabs.captureVisibleTab(
         windowId,
         { format: "png" },
         async (img) => {
            const data = await __OCR__(img, rect);
            if (data.success && data?.result) {
               tabSendMessage(id, "B_C_OCR_RESULT", data.result);
            }
         }
      );
      sendResponse("ok");
   }
);

runtimeOnMessage("C_B_SETUP_IFRAME", (_, { tab }, sendResponse) => {
   addIFrame(tab.id).then((res) => {
      sendResponse(res);
   });
});

runtimeOnMessage("C_B_REMOVE_IFRAME", (_, { tab }, sendResponse) => {
   sendResponse("ok");
   removeIFrame(tab.id);
});

(async () => {
   const total = 30;
   // for (let i = 0; i < total; i++) {
   //    await wait(3000);
   //    console.clear();
   // console.log(`Fetch attempt ${i + 1} completed.`);
   // fetch("https://www.google.com/search?q=what+is+java")
   //    .then((res) => res.text())
   //    .then((html) => console.log(html))
   //    .catch((err) => console.error(err));

   // }
   // www.google.com/search?q=what+is+java&sa=X&udm=50
})();


runtimeOnMessage("IF_B_GET_ANSWER", async ({ data }, { tab }, sendResponse) => {
   console.log("Received request for answer:", data);

   const provider = data.provider || "google";

   let answer;
   switch (provider) {
      case "google":
         answer = await getGoogleAiAnswer(data.question);
         break;
      case "bing":
         answer = await getBingAiAnswer(data.question);
         break;
      case "perplexity":
         answer = await getPerplexityAnswer(data.question);
         break;
      case "grok":
         answer = await getGrokAnswer(data.question);
         break;
      // case "gemini":
      //    answer = await getGeminiAnswer(data.question);
      //    break;
      // default:
      //    answer = await getGoogleAiAnswer(data.question);
   }

   console.log(answer);
   sendResponse({ status: "success", answer, provider });
});

// google https://www.google.com/search?q=what+is+java&sa=X&udm=50
// bing: https://www.bing.com/copilotsearch?q=what+is+java&FORM=CSSCOP
// chatgpt: https://chat.openai.com/  ?????!!!!!
// grok: https://grok.com/?q=what+is+java?
// gemini: https://gemini.google.com/app ?????!!!!!
// Perplexity: https://www.perplexity.ai/search?q=what+is+java
