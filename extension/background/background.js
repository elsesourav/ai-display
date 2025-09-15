importScripts("./../utils.js", "./bgUtils.js", "./requestAi.js");
console.log("background script loaded");

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
   __SELECT__(tab.id);
   sendResponse("ok");
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

runtimeOnMessage("IF_B_GET_ANSWER", async ({ data }, { tab }, sendResponse) => {
   // console.log("Received request for answer:", data);
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
      case "gemini":
         answer = await getGeminiAnswer(data.question);
         break;
      default:
         answer = await getGoogleAiAnswer(data.question);
   }
   sendResponse({ status: "success", answer, provider });
});


// google https://www.google.com/search?q=what+is+java&sa=X&udm=50
// bing: https://www.bing.com/copilotsearch?q=what+is+java&FORM=CSSCOP
// chatgpt: https://chat.openai.com/  ?????!!!!!
// grok: https://grok.com/?q=what+is+java?
// gemini: https://gemini.google.com/app ?????!!!!!
// Perplexity: https://www.perplexity.ai/search?q=what+is+java
