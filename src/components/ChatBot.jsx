import { useEffect, useRef, useState } from "react";
import { IoArrowDown, IoImage, IoSend } from "react-icons/io5";
import UTILS from "./../utils/utilsModule.js";
import "./scrollbar-hide.css";

export default function ChatBot({ isOpen }) {
   const [input, setInput] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [lastQuestion, setLastQuestion] = useState("");
   const [selectedImage, setSelectedImage] = useState(null);
   const [answers, setAnswers] = useState([]);

   const scrollContainerRef = useRef(null);
   const fileInputRef = useRef(null);

   // Clear selected image
   const clearSelectedImage = () => {
      setSelectedImage(null);
      if (fileInputRef.current) {
         fileInputRef.current.value = "";
      }
   };

   // get answer from background script
   const getAnswerFromBackground = async (question, image) => {
      UTILS.pagePostMessage(
         "IF_B_GET_ANSWER",
         { question, image },
         window.parent
      );
   };

   const handleSendMessage = async () => {
      if (input.trim() === "") return;

      setLastQuestion(input);
      setInput("");

      if (selectedImage) {
         clearSelectedImage();
      }

      setIsLoading(true);
      setAnswers([]);

      getAnswerFromBackground(input, selectedImage);
   };

   useEffect(() => {
      UTILS.pageOnMessage("IF_B_GET_ANSWER", (data) => {
         console.log("Received answer from background:", data);
         setAnswers([{ content: data.answer, provider: "Google AI Search" }]);
         console.log(data.answer);
         console.log("work");
         setIsLoading(false);
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

   const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         handleSendMessage();
      }
   };

   if (!isOpen) return null;

   return (
      <div className="flex flex-col h-full animate-fadeIn">
         {/* Input area at the top */}
         <div
            className="p-4 border-b border-gray-200 animate-slideUp"
            style={{ animationDelay: "100ms" }}
         >
            <div className="relative w-full grid gap-2">
               {/* Text input and buttons */}
               <div className="relative grid w-full h-[97px]">
                  <div className="flex-1 relative path border-gray-300/50 dark:border-indigo-500/30 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/70 dark:bg-indigo-900/20 text-gray-800 dark:text-white">
                     <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question..."
                        className="w-[calc(100%-50px)] h-full resize-none text-[16px] rounded-lg border-0 outline-0 "
                        rows="3"
                        autoFocus
                     />
                  </div>

                  <button
                     onClick={handleImageClick}
                     className="absolute h-[30px] w-[30px] right-[5px] top-[5px] grid place-items-center rounded-lg bg-gray-900 dark:bg-gray-100/30 text-gray-100 dark:text-gray-900 hover:bg-gray-200 dark:hover:bg-gray-500/30 transition-colors cursor-pointer z-[9211]"
                     title="Upload image"
                  >
                     <IoImage size={18} />
                  </button>

                  <button
                     onClick={handleSendMessage}
                     disabled={input.trim() === "" || isLoading}
                     className={`absolute h-[45px] w-[40px] right-0 bottom-[5px] grid place-items-center rounded-lg transition-colors duration-200 ${
                        input.trim() === "" || isLoading
                           ? "bg-gray-300 text-gray-500 dark:bg-indigo-900/30"
                           : "bg-indigo-500 text-white hover:bg-indigo-600"
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
                  <div className="relative rounded-lg overflow-hidden border border-gray-300/50 dark:border-indigo-500/30">
                     <img
                        src={selectedImage}
                        alt="Selected"
                        className="w-full object-contain max-h-20"
                     />
                     <button
                        onClick={clearSelectedImage}
                        className="absolute top-1 right-1 bg-gray-800/70 text-white p-1 rounded-full hover:bg-gray-900/70"
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

         <div className="relative h-full flex-1 m-4 overflow-hidden">
            {/* Scroll to bottom button */}
            <button
               onClick={scrollToBottom}
               className="absolute bottom-4 right-4 z-10 p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 transition-opacity duration-200 opacity-80 hover:opacity-100"
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
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                     <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
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
                     {answers.length > 1 ? "Answers" : "Answer"}
                  </h3>

                  {/* Loading indicator */}
                  {isLoading && (
                     <div className="animate-pulse bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                           Thinking...
                        </div>
                        <div className="flex space-x-2 mt-2">
                           <div
                              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "0ms" }}
                           ></div>
                           <div
                              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "150ms" }}
                           ></div>
                           <div
                              className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                              style={{ animationDelay: "300ms" }}
                           ></div>
                        </div>
                     </div>
                  )}

                  {/* Display all answers */}
                  <div className="space-y-4">
                     {answers.map((answer, index) => (
                        <div
                           key={index}
                           className="animate-fadeIn bg-gray-50 dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                           style={{ animationDelay: `${index * 300}ms` }}
                        >
                           <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                              {answer.provider}
                           </div>

                           <div
                              className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap"
                              style={{ zoom: 0.7 }}
                              dangerouslySetInnerHTML={{
                                 __html: answer.content,
                              }}
                           />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
