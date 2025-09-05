import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuTextSelect } from "react-icons/lu";
import { RiChatVoiceAiLine } from "react-icons/ri";
import { TiArrowMoveOutline } from "react-icons/ti";
import ChatBot from "../components/ChatBot";
import ES from "./../utils/utilsModule.js";

export default function Menu() {
   const SIZES = useMemo(
      () => ({
         min: { w: "160px", h: "50px" },
         max: { w: "540px", h: "640px" },
      }),
      []
   );

   // State
   const [isChatOpen, setIsChatOpen] = useState(false);
   const [size, setSize] = useState(SIZES.min);
   const [menuOpacity, setMenuOpacity] = useState("1");
   const [isDragging, setIsDragging] = useState(false);
   const menuRef = useRef(null);
   const dragRef = useRef(null);

   useEffect(() => {
      ES.pageOnMessage("C_IF_OPEN_CHAT", () => {
         setIsChatOpen(true);
      });
      ES.pageOnMessage("C_IF_CLOSE_CHAT", () => {
         setIsChatOpen(false);
      });

      ES.pageOnMessage("C_IF_HIDDEN", () => {
         setMenuOpacity("0");
      });
      ES.pageOnMessage("C_IF_VISIBLE", () => {
         setMenuOpacity("1");
      });

      ES.pageOnMessage("IF_IF_MENU_WINDOW_DRAG_START", () => {
         setIsDragging(true);
      });
      ES.pageOnMessage("IF_IF_MENU_WINDOW_DRAG_END", () => {
         setIsDragging(false);
      });
   }, []);

   useEffect(() => {
      setSize(isChatOpen ? SIZES.max : SIZES.min);
   }, [isChatOpen, SIZES]);

   useEffect(() => {
      const isOpen = parseInt(size.h) > 60;
      const fun = () => {
         ES.pagePostMessage(
            "IF_C_MENU_WINDOW_RESIZE",
            {
               width: size.w,
               height: size.h,
            },
            window.parent
         );
      };
      setTimeout(fun, isOpen ? 0 : 300);
   }, [size]);

   const toggleChat = useCallback(() => {
      if (!isChatOpen) {
         setIsChatOpen(true);
      } else {
         setIsChatOpen(false);
      }
   }, [isChatOpen]);

   const handleSelectText = useCallback(() => {
      ES.pagePostMessage("IF_C_SELECT_TEXT", {}, window.parent);
   }, []);

   // Render UI
   return (
      <div
         className="absolute transition-all duration-300 ease-in-out"
         ref={menuRef}
         style={{ zIndex: 1, opacity: menuOpacity }}
      >
         <main
            className="relative left-[1px] top-[1px] backdrop-blur-xl bg-blue-500/15 dark:bg-blue-600/10 border border-white/80 dark:border-white/40 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out"
            style={{
               width: `calc(${size.w} - 2px)`,
               height: `calc(${size.h} - 2px)`,
            }}
         >
            {/* Fixed header */}
            <section
               className="relative h-[inherit] flex w-full gap-[12px] items-center justify-start pl-[4px] bg-white/10 dark:bg-black/10 border-b border-white/30 dark:border-white/20"
               style={{ height: `${parseInt(SIZES.min.h) - 2}px` }}
            >
               <div
                  ref={dragRef}
                  className={`relative grid place-items-center rounded-lg text-xl cursor-move border border-white/50 dark:border-white/30 transition-all duration-200 ${
                     isDragging
                        ? "bg-white/40 text-gray-800"
                        : "bg-white/15 dark:bg-black/15 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-black/25"
                  }`}
                  style={{
                     width: `calc(${SIZES.min.h} - 8px)`,
                     aspectRatio: "1 / 1",
                  }}
               >
                  <TiArrowMoveOutline />
               </div>

               <div
                  onClick={toggleChat}
                  className={`relative grid place-items-center rounded-lg text-xl cursor-pointer border border-white/50 dark:border-white/30 transition-all duration-200 ${
                     isChatOpen
                        ? "bg-blue-500/60 text-white hover:bg-blue-600/70"
                        : "bg-white/15 dark:bg-black/15 text-gray-700 dark:text-gray-200 hover:bg-white/25 dark:hover:bg-black/25"
                  }`}
                  style={{
                     width: `calc(${SIZES.min.h} - 8px)`,
                     aspectRatio: "1 / 1",
                  }}
               >
                  <RiChatVoiceAiLine />
               </div>

               <div
                  className="relative grid place-items-center bg-white/15 dark:bg-black/15 border border-white/50 dark:border-white/30 rounded-lg text-xl cursor-pointer hover:bg-white/25 dark:hover:bg-black/25 text-gray-700 dark:text-gray-200 transition-all duration-200"
                  onClick={handleSelectText}
                  style={{
                     width: `calc(${SIZES.min.h} - 8px)`,
                     aspectRatio: "1 / 1",
                  }}
               >
                  <LuTextSelect />
               </div>

               {isChatOpen && (
                  <div className="absolute right-[4px] top-1/2 -translate-y-1/2">
                     <div
                        onClick={toggleChat}
                        className="relative grid place-items-center bg-white/15 dark:bg-black/15 border border-white/50 dark:border-white/30 rounded-lg text-xl cursor-pointer hover:bg-red-500/50 text-red-500 hover:text-white transition-all duration-200"
                        title="Close chat"
                        style={{
                           width: `calc(${SIZES.min.h} - 8px)`,
                           aspectRatio: "1 / 1",
                        }}
                     >
                        <IoClose />
                     </div>
                  </div>
               )}
            </section>

            {/* Chat content area */}
            <div
               className="absolute left-0 right-0 overflow-hidden transition-opacity duration-300 ease-in-out"
               style={{
                  top: SIZES.min.h,
                  bottom: 0,
                  opacity: isChatOpen ? 1 : 0,
                  pointerEvents: isChatOpen ? "auto" : "none",
                  willChange: "opacity, transform",
                  transform: isChatOpen ? "translateZ(0)" : "translateZ(0)",
               }}
            >
               <div
                  className="h-full"
                  style={{
                     willChange: "opacity, transform",
                     transform: "translateZ(0)",
                  }}
               >
                  <ChatBot isOpen={isChatOpen} />
               </div>
            </div>
         </main>
      </div>
   );
}
{
   /* Chat area fills the remaining space below header */
}
