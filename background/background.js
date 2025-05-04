importScripts("./../utils.js", "./bgUtils.js", "./apiCall.js");

console.log("background script loaded");

runtimeOnMessage("c_b", async (_, __, sendResponse) => {
   async function askOpenRouter(question) {
      const apiKey =
         "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";
      const model = "microsoft/phi-4-reasoning-plus:free";
      const apiUrl = "https://openrouter.ai/api/v1/chat/completions";

      try {
         const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
               Authorization: `Bearer ${apiKey}`,
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               model: model,
               messages: [
                  {
                     role: "user",
                     content: question,
                  },
               ],
            }),
         });

         if (!response.ok) {
            throw new Error(
               `API error: ${response.status} ${response.statusText}`
            );
         }

         const data = await response.json();

         // Safely access the result
         const reply =
            data.choices?.[0]?.message?.content || "No reply received.";
         console.log("AI reply:", reply);

         return reply;
      } catch (error) {
         console.error("Fetch error:", error);
         return "An error occurred.";
      }
   }

   askOpenRouter("What is the meaning of life?").then((answer) => {
      console.log("Final Answer:", answer);
   });

   sendResponse("done");
});

runtimeOnMessage("p_b", async (_, __, sendResponse) => {});
