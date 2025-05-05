function fetchOpenRouter(apiKey, model, messages) {
   return new Promise(async (resolve) => {
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
               messages,
               max_tokens: 100,
               temperature: 0.2,
            }),
         });

         if (!response.ok) {
            return resolve(
               `API error: ${response.status} ${response.statusText}`
            );
         }

         const data = await response.json();
         const reply =
            data.choices?.[0]?.message?.content || "No reply received.";

         return resolve(reply);
      } catch (error) {
         console.log(error);
         return resolve(`Fetch error`);
      }
   });
}

/* ------------ all of the models ----------- */
function microsoftPhi4ReasoningPlus(text) {
   return new Promise(async (resolve) => {
      const model = "microsoft/phi-4-reasoning-plus:free";
      const key = await GET__("MP4RP");

      try {
         if (key) {
            const apiKey = await decryptData(key);
            const m = [{ role: "user", content: text }];
            const result = await fetchOpenRouter(apiKey, model, m);
            return resolve(result);
         }
      } catch (error) {
         return resolve(null);
      }
   });
}


function metaLlamaLlama4Maverick(text, imgData) {
   return new Promise(async (resolve) => {
      const model = "meta-llama/llama-4-maverick:free";
      const key = await GET__("MLL4M");
      
      try {
         const imageUrl = await uploadImageToCloudinary(imgData);
         if (key) {
            const apiKey = await decryptData(key);
            const m = [
               {
                  role: "user",
                  content: [
                     {
                        type: "text",
                        text,
                     },
                     {
                        type: "image_url",
                        image_url: {
                           url: imageUrl,
                        },
                     },
                  ],
               },
            ];
            const result = await fetchOpenRouter(apiKey, model, m);
            return resolve(result);
         }
      } catch (error) {
         return resolve(null);
      }
   });
}
