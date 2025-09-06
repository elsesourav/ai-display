import { useEffect, useRef, useState } from "react";
import { IoArrowDown, IoImage, IoSend } from "react-icons/io5";
import UTILS from "./../utils/utilsModule.js";
import "./scrollbar-hide.css";

export default function ChatBot({ isOpen }) {
   const [input, setInput] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [lastQuestion, setLastQuestion] = useState("");
   const [selectedImage, setSelectedImage] = useState(null);
   const [answers, setAnswers] = useState({});
   const [selectedProvider, setSelectedProvider] = useState("google");
   const currentRequestIdRef = useRef(null);

   const AI_PROVIDERS = [
      { id: "google", name: "Google AI", zoom: 0.8 },
      { id: "bing", name: "Bing AI", zoom: 0.7 },
      { id: "grok", name: "Grok AI", zoom: 0.8 },
      // { id: "gemini", name: "Gemini" },
   ];

   const scrollContainerRef = useRef(null);
   const fileInputRef = useRef(null);
   const rootRef = useRef(null);

   // Clear selected image
   const clearSelectedImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   // get answer from background script
   const getAnswerFromBackground = async (
      question,
      image,
      provider = "google"
   ) => {
      UTILS.pagePostMessage(
         "IF_B_GET_ANSWER",
         { question, image, provider },
         window.parent
      );
   };

   // Sequential provider loading
   const loadProvidersSequentially = async (question, image, requestId) => {
      for (let i = 0; i < AI_PROVIDERS.length; i++) {
         // Check if request was cancelled (new message sent)
         if (currentRequestIdRef.current !== requestId) {
            console.log("Request cancelled, stopping sequential loading");
            return;
         }

         const provider = AI_PROVIDERS[i];
         console.log(`Loading provider ${provider.id} (${i + 1}/${AI_PROVIDERS.length})`);
         
         // Send request to current provider
         getAnswerFromBackground(question, image, provider.id);
         
         // Wait for this provider to respond before moving to next
         if (i < AI_PROVIDERS.length - 1) {
            await new Promise((resolve) => {
               const checkAnswer = () => {
                  // If request was cancelled, resolve immediately
                  if (currentRequestIdRef.current !== requestId) {
                     resolve();
                     return;
                  }
                  
                  // Check if current provider has answered
                  setAnswers((current) => {
                     if (current[provider.id]) {
                        resolve();
                     } else {
                        // Check again in 500ms
                        setTimeout(checkAnswer, 500);
                     }
                     return current;
                  });
               };
               checkAnswer();
            });
         }
      }
   };

   const handleSendMessage = async () => {
      if (input.trim() === "") return;

      // Generate unique request ID
      const requestId = Date.now().toString();
      currentRequestIdRef.current = requestId;

      setLastQuestion(input);
      setInput("");

      if (selectedImage) {
         clearSelectedImage();
      }

      setIsLoading(true);
      setAnswers({});

      // Start sequential loading
      loadProvidersSequentially(input, selectedImage, requestId);
   };

   useEffect(() => {
      UTILS.pageOnMessage("IF_B_GET_ANSWER", (data) => {
         console.log("Received answer from background:", data);

         const provider = data.provider || "google";

         setAnswers((prev) => {
            const isFirstAnswer = Object.keys(prev).length === 0;

            // If this is the first answer, also set it as selected provider and stop loading
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

         console.log("work");
      });

      // UTILS.pageOnMessage("C_IF_SET_INPUTS", (data) => {
      //    setInput(data.input);
      //    setSelectedImage(data.image);
      //    // handleSendMessage();
      // });

      // UTILS.pageOnMessage("C_I_CLEAR_CHAT", () => {
      //    setAnswers([]);
      //    setInput("");
      //    setLastQuestion("");
      //    setIsLoading(false);
      //    clearSelectedImage();
      // });

      // UTILS.pageOnMessage("C_IF_SET_QUESTION", (data) => {
      //    setIsLoading(true);
      //    setLastQuestion(data.question);
      // });

      // UTILS.pageOnMessage("C_I_SET_ANSWER", (data) => {
      //    const { answer, provider } = data;

      //    setIsLoading(false);
      //    setAnswers([
      //       ...answers,
      //       {
      //          content: answer,
      //          provider: provider || "AI Display",
      //       },
      //    ]);
      // });
   }, []);

   useEffect(() => {
      console.log(answers);
   }, [answers]);

   // Function to scroll to bottom
   const scrollToBottom = () => {
      const container = scrollContainerRef.current;
      if (container) {
         container.scrollTop = container.scrollHeight;
      }
   };

   // Handle image selection
   const handleImageClick = () => {
      fileInputRef.current?.click();
   };

   // Handle image change
   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith("image/")) {
         const reader = new FileReader();
         reader.onload = () => {
            setSelectedImage(reader.result);
         };
         reader.readAsDataURL(file);
      }
   };

   useEffect(() => {
      scrollToBottom();

      const timeoutId = setTimeout(scrollToBottom, 100);

      return () => clearTimeout(timeoutId);
   }, [answers, isLoading]);

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
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className="w-[calc(100%-50px)] h-full resize-none text-[16px] bg-transparent border-0 outline-0 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                        rows="3"
                        autoFocus
                     />
                  </div>

                  <button
                     onClick={handleImageClick}
                     className="absolute h-[30px] w-[30px] right-[5px] top-[5px] grid place-items-center rounded-lg bg-white/30 dark:bg-black/30 border border-white/50 dark:border-white/30 text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-black/50 transition-all duration-200 cursor-pointer z-[9211]"
                     title="Upload image"
                  >
                     <IoImage size={18} />
                  </button>

                  <button
                     onClick={handleSendMessage}
                     disabled={input.trim() === "" || isLoading}
                     className={`absolute h-[45px] w-[40px] right-0 bottom-[5px] grid place-items-center rounded-lg border transition-all duration-200 ${
                        input.trim() === "" || isLoading
                           ? "bg-gray-300/40 dark:bg-gray-600/20 border-gray-400/40 dark:border-gray-500/30 text-gray-400 dark:text-gray-500"
                           : "bg-blue-500/60 border-blue-400/50 text-white hover:bg-blue-600/70 hover:border-blue-500/60"
                     } cursor-pointer`}
                     title="Send message"
                  >
                     <IoSend size={26} />
                  </button>

                  {/* Hidden file input */}
                  <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleImageChange}
                     accept="image/*"
                     className="col-span-2 hidden"
                  />
               </div>

               {/* Image preview area */}
               {selectedImage && (
                  <div className="relative rounded-xl overflow-hidden border border-white/50 dark:border-white/30 bg-white/15 dark:bg-black/15">
                     <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full object-contain max-h-20"
                     />
                     <button
                        onClick={clearSelectedImage}
                        className="absolute top-1 right-1 bg-gray-800/60 dark:bg-gray-900/60 text-white p-1 rounded-full hover:bg-gray-900/70 dark:hover:bg-black/70 border border-white/30 transition-all duration-200"
                        title="Remove image"
                     >
                        <svg
                           xmlns="http://www.w3.org/2000/svg"
                           width="16"
                           height="16"
                           viewBox="0 0 24 24"
                           fill="none"
                           stroke="currentColor"
                           strokeWidth="2"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                        >
                           <line x1="18" y1="6" x2="6" y2="18"></line>
                           <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                     </button>
                  </div>
               )}
            </div>
         </div>

         {/* AI Provider Selection Buttons */}
         <div className="relative w-full px-4 py-2">
            <div className="flex flex-wrap gap-2">
               {AI_PROVIDERS.map((provider) => (
                  <button
                     key={provider.id}
                     onClick={() => setSelectedProvider(provider.id)}
                     className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 border relative ${
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
                     {/* Show checkmark for loaded providers */}
                     {answers[provider.id] && (
                        <span
                           className={`ml-1 text-xs ${
                              selectedProvider === provider.id
                                 ? "text-blue-600 dark:text-blue-300"
                                 : "text-green-600 dark:text-green-400"
                           }`}
                        >
                           ✓
                        </span>
                     )}
                  </button>
               ))}
            </div>
         </div>

         <div className="relative h-full flex-1 m-4 overflow-hidden">
            {/* Scroll to bottom button */}
            <button
               onClick={scrollToBottom}
               className="absolute bottom-4 right-4 z-10 p-2 bg-blue-500/60 border border-blue-400/50 text-white rounded-full hover:bg-blue-600/70 hover:border-blue-500/60 transition-all duration-200 opacity-80 hover:opacity-100"
               style={{ display: "none" }}
            >
               <IoArrowDown size={16} />
            </button>

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
                     <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">
                        Your question:
                     </div>
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
                              className="botChat whitespace-pre-wrap"
                              style={{
                                 zoom:
                                    AI_PROVIDERS.find(
                                       (p) => p.id === selectedProvider
                                    )?.zoom || 0.7,
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
