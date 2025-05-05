importScripts("./../utils.js", "./bgUtils.js", "./apiCall.js");
console.log("background script loaded");

function sendAnswer(tabId, answer) {
   tabSendMessage(tabId, "b_c_answer", { answer });
}

runtimeOnMessage("c_b", async ({ imgData, text }, { tab }, sendResponse) => {
   const { id } = tab;

   try {
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
         }
      });

      await Promise.all(tracks);
      console.log("All calls completed.");
   } catch (error) {
      console.error("Overall error during API calls:", error);
   }

   sendResponse("Get It");
});


// runtimeOnMessage("p_b", async (_, __, sendResponse) => {});
