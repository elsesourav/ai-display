import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoClose, IoSend } from "react-icons/io5";
import UTILS from "./../utils/utilsModule.js";
import "./scrollbar-hide.css";

export default function ChatBot({ isOpen }) {
   const [input, setInput] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [lastQuestion, setLastQuestion] = useState("");
   const [answers, setAnswers] = useState({});
   const [selectedProvider, setSelectedProvider] = useState("google");
   const [allProvidersCompleted, setAllProvidersCompleted] = useState(true);
   const currentRequestIdRef = useRef(null);

   const AI_PROVIDERS = useMemo(
      () => [
         { id: "google", name: "Google AI", zoom: 1 },
         { id: "perplexity", name: "Perplexity", zoom: 1 },
         { id: "bing", name: "Bing AI", zoom: 1 },
         { id: "gemini", name: "Gemini", zoom: 1 },
         { id: "grok", name: "Grok AI", zoom: 1 },
      ],
      []
   );

   // Maximum concurrent requests
   const MAX_CONCURRENT_REQUESTS = 2;

   const scrollContainerRef = useRef(null);
   const rootRef = useRef(null);
   const textareaRef = useRef(null);

   // Clear input function
   const clearInput = useCallback(() => {
      setInput("");
   }, []);

   // get answer from background script
   const getAnswerFromBackground = async (question, provider = "google") => {
      UTILS.pagePostMessage(
         "IF_B_GET_ANSWER",
         { question, provider },
         window.parent
      );
   };

   // Concurrent provider loading - maintains constant number of active requests
   const loadProvidersWithConcurrency = useCallback(
      async (question, requestId) => {
         const providersToProcess = [...AI_PROVIDERS];
         const activeRequests = new Map();
         let completedCount = 0;

         console.log(
            `Starting concurrent loading with max ${MAX_CONCURRENT_REQUESTS} simultaneous requests`
         );

         // Mark that providers are not all completed
         setAllProvidersCompleted(false);

         const startProviderRequest = (provider) => {
            console.log(`Starting request for ${provider.id}`);

            getAnswerFromBackground(question, provider.id);

            const promise = new Promise((resolve) => {
               const checkAnswer = () => {
                  if (currentRequestIdRef.current !== requestId) {
                     resolve({ cancelled: true });
                     return;
                  }

                  setAnswers((current) => {
                     if (current[provider.id]) {
                        console.log(`${provider.id} completed`);
                        resolve({ provider, completed: true });
                     } else {
                        setTimeout(checkAnswer, 500);
                     }
                     return current;
                  });
               };
               checkAnswer();
            });

            activeRequests.set(provider.id, promise);
            return promise;
         };

         const initialRequests = providersToProcess.splice(
            0,
            MAX_CONCURRENT_REQUESTS
         );
         initialRequests.forEach((provider) => startProviderRequest(provider));

         while (activeRequests.size > 0) {
            if (currentRequestIdRef.current !== requestId) {
               console.log("Request cancelled, stopping concurrent loading");
               setAllProvidersCompleted(true);
               return;
            }
            const completedRequest = await Promise.race(
               activeRequests.values()
            );

            if (completedRequest.cancelled) {
               setAllProvidersCompleted(true);
               return;
            }

            if (completedRequest.completed) {
               completedCount++;
               const providerId = completedRequest.provider.id;

               activeRequests.delete(providerId);

               console.log(
                  `${providerId} finished. Completed: ${completedCount}/${AI_PROVIDERS.length}`
               );

               if (providersToProcess.length > 0) {
                  const nextProvider = providersToProcess.shift();
                  startProviderRequest(nextProvider);
               }
            }
         }

         console.log(`All ${completedCount} providers completed`);
         // Mark that all providers have completed
         setAllProvidersCompleted(true);
      },
      [AI_PROVIDERS, MAX_CONCURRENT_REQUESTS]
   );

   const handleSendMessage = useCallback(
      async (messageInput = null) => {
         const actualInput = messageInput !== null ? messageInput : input;

         if (actualInput.trim() === "") return;

         // Prevent sending if not all providers have completed
         if (!allProvidersCompleted) {
            console.log(
               "Cannot send message: waiting for all providers to complete"
            );
            return;
         }

         // Generate unique request ID
         const requestId = Date.now().toString();
         currentRequestIdRef.current = requestId;

         setLastQuestion(actualInput);
         setInput("");

         setIsLoading(true);
         setAnswers({});

         // Start concurrent loading
         loadProvidersWithConcurrency(actualInput, requestId);
      },
      [input, allProvidersCompleted, loadProvidersWithConcurrency]
   );

   useEffect(() => {
      UTILS.pageOnMessage("IF_B_GET_ANSWER", (data) => {
         const provider = data.provider || "google";

         setAnswers((prev) => {
            const isFirstAnswer = Object.keys(prev).length === 0;

            if (isFirstAnswer) {
               setSelectedProvider(provider);
               setIsLoading(false);
            }

            return {
               ...prev,
               [provider]: {
                  content: data.answer,
                  provider: provider,
               },
            };
         });
      });

      UTILS.pageOnMessage("C_IF_SET_INPUTS", (data) => {
         setTimeout(() => {
            handleSendMessage(data.input);
         }, 500);
      });
   }, [handleSendMessage]);

   useEffect(() => {
      console.log(answers);
   }, [answers]);

   // When closing, if focus is inside the chat, blur it to avoid aria/inert conflicts.
   useEffect(() => {
      if (!isOpen && rootRef.current) {
         const active = document.activeElement;
         if (active && rootRef.current.contains(active)) {
            try {
               active.blur();
            } catch (err) {
               // ignore
               void err;
            }
         }
      }
   }, [isOpen]);

   // Focus textarea when chat opens
   useEffect(() => {
      if (isOpen && textareaRef.current) {
         setTimeout(() => {
            textareaRef.current?.focus();
         }, 100);
      }
   }, [isOpen]);

   const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSendMessage();
      }
   };

   return (
      <div
         ref={rootRef}
         className={`flex flex-col h-full ${isOpen ? "animate-fadeIn" : ""}`}
         inert={!isOpen}
      >
         {/* Input area at the top */}
         <div
            className="p-4 border-b border-white/30 dark:border-white/20 bg-white/10 dark:bg-black/10 animate-slideUp"
            style={{ animationDelay: "100ms" }}
         >
            <div className="relative w-full grid gap-2">
               {/* Text input and buttons */}
               <div className="relative grid w-full h-[97px]">
                  <div className="flex-1 relative path border-white/60 dark:border-black p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-black/20 text-gray-800 dark:text-white">
                     <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className="w-[calc(100%-50px)] h-full resize-none text-sm bg-transparent border-0 outline-0 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                        rows="3"
                        autoFocus
                     />
                  </div>

                  <button
                     onClick={clearInput}
                     className="absolute h-[30px] w-[30px] right-[5px] top-[5px] grid place-items-center rounded-lg text-gray-700 dark:text-gray-200 hover:text-red-500 dark:hover:text-red-600 transition-all duration-200 cursor-pointer z-[9211] focus:outline-none"
                     title="Clear input"
                  >
                     <IoClose size={24} />
                  </button>

                  <button
                     onClick={handleSendMessage}
                     disabled={
                        input.trim() === "" ||
                        isLoading ||
                        !allProvidersCompleted
                     }
                     className={`absolute h-[45px] w-[40px] right-0 bottom-[5px] grid place-items-center rounded-lg border transition-all duration-200 focus:outline-none ${
                        input.trim() === "" ||
                        isLoading ||
                        !allProvidersCompleted
                           ? "bg-gray-300/40 dark:bg-gray-600/20 border-gray-400/40 dark:border-gray-500/30 text-gray-400 dark:text-gray-500"
                           : "bg-blue-500/60 border-blue-400/50 text-white hover:bg-blue-600/70 hover:border-blue-500/60"
                     } cursor-pointer`}
                     title={
                        !allProvidersCompleted
                           ? "Waiting for all AI responses..."
                           : "Send message"
                     }
                  >
                     <IoSend size={26} />
                  </button>
               </div>
            </div>
         </div>

         {/* AI Provider Selection Buttons */}
         <div className="relative w-full px-4 py-2">
            <div className="flex flex-wrap gap-2">
               {AI_PROVIDERS.map((provider) => (
                  <button
                     key={provider.id}
                     onClick={() => setSelectedProvider(provider.id)}
                     className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 border relative focus:outline-none ${
                        !answers[provider.id]
                           ? // Not loaded - disabled state
                             "bg-gray-200/50 dark:bg-gray-700/30 text-gray-400 dark:text-gray-500 border-gray-300/40 dark:border-gray-600/40 cursor-not-allowed opacity-50"
                           : selectedProvider === provider.id
                           ? // Active - selected state (light blue)
                             "bg-blue-100/80 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-300/60 dark:border-blue-600/50 shadow-sm cursor-pointer"
                           : // Loaded but not active - available state
                             "bg-white/50 dark:bg-black/30 text-gray-700 dark:text-gray-200 border-white/50 dark:border-white/30 hover:bg-white/70 dark:hover:bg-black/40 hover:border-white/60 cursor-pointer"
                     }`}
                     disabled={!answers[provider.id]}
                  >
                     {provider.name}
                  </button>
               ))}
            </div>
         </div>

         <div className="relative h-full flex-1 m-4 overflow-hidden">
            <div
               ref={scrollContainerRef}
               className="absolute inset-0 space-y-4 overflow-y-auto"
               style={{
                  scrollbarWidth: "none" /* Firefox */,
                  msOverflowStyle: "none" /* IE and Edge */,
                  scrollBehavior: "smooth",
                  WebkitOverflowScrolling: "touch",
               }}
            >
               {/* Question display */}
               {lastQuestion && (
                  <div className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/25 p-3 rounded-xl">
                     <div className="text-gray-800 dark:text-gray-200 font-medium">
                        {lastQuestion}
                     </div>
                  </div>
               )}

               {/* Answers section */}
               <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                     Answer
                  </h3>

                  {/* Display selected answer */}
                  <div className="space-y-4">
                     {answers[selectedProvider] && (
                        <div className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/25 p-3 rounded-xl">
                           <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                              {AI_PROVIDERS.find(
                                 (p) => p.id === selectedProvider
                              )?.name || selectedProvider}
                           </div>

                           <div
                              className="botChat whitespace-pre-wrap overflow-x-auto overflow-y-hidden"
                              style={{
                                 zoom:
                                    AI_PROVIDERS.find(
                                       (p) => p.id === selectedProvider
                                    )?.zoom || 1,
                              }}
                              dangerouslySetInnerHTML={{
                                 __html: answers[selectedProvider].content,
                              }}
                           />
                        </div>
                     )}

                     {/* Show loading for selected provider if no answer yet */}
                     {isLoading && !answers[selectedProvider] && (
                        <div className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/25 p-3 rounded-xl">
                           <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                              {AI_PROVIDERS.find(
                                 (p) => p.id === selectedProvider
                              )?.name || selectedProvider}
                           </div>
                           <div className="flex space-x-2 mt-2">
                              <div
                                 className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
                                 style={{ animationDelay: "0ms" }}
                              ></div>
                              <div
                                 className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
                                 style={{ animationDelay: "150ms" }}
                              ></div>
                              <div
                                 className="w-2 h-2 rounded-full bg-blue-400/60 animate-bounce"
                                 style={{ animationDelay: "300ms" }}
                              ></div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
