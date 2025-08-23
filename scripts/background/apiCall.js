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






/* 
✅ Microsoft: Phi-4 Reasoning Plus (free) — Excellent small reasoning model; fast, sharp, lightweight.

✅ Meta: Llama 4 Maverick (free) — One of Meta’s top models; great general-purpose, strong on creativity and reasoning.



✅ Google: Gemini 2.5 Flash Preview (free) — Fast, cutting-edge, good balance of speed and intelligence.

✅ Qwen3 32B (free) or Qwen3 235B A22B (free) — Large Chinese-developed models, very strong performance, especially on multilingual tasks.

✅ NVIDIA: Llama 3.3 Nemotron Super 49B (free) — Big model, well-tuned, very capable across tasks.

✅ Moonshot AI: Kimi VL A3B Thinking (free) — Focused on thoughtful reasoning and vision tasks; excellent if you need more than just text.

✅ DeepSeek: DeepSeek Prover V2 (free) — Great for math, proofs, logic-heavy questions.
*/