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
         max: { w: "380px", h: "560px" },
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
      ES.pageOnMessage("C_I_OPEN_CHAT", () => {
         setIsChatOpen(true);
      });
      ES.pageOnMessage("C_I_CLOSE_CHAT", () => {
         setIsChatOpen(false);
      });

      ES.pageOnMessage("C_I_HIDDEN", () => {
         setMenuOpacity("0");
      });
      ES.pageOnMessage("C_I_VISIBLE", () => {
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

   // const handleSelectText = useCallback(() => {
   //    ES.pagePostMessage("I_C_SELECT_TEXT", {}, window.parent);
   // }, []);

   // Render UI
   return (
      <div
         className="absolute transition-all duration-300 ease-in-out"
         ref={menuRef}
         style={{
            zIndex: 1,
            opacity: menuOpacity,
         }}
      >
         <main
            className={`relative left-[1px] top-[1px] grid bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600 rounded-md shadow-md outline-1 outline-white dark:outline-blue-500 overflow-hidden transition-all duration-300 ease-in-out`}
            style={{
               width: `calc(${size.w} - 2px)`,
               height: `calc(${size.h} - 2px)`,
               gridTemplateRows: `${SIZES.min.h} auto`,
            }}
         >
            <section
               className="relative flex w-[inherit] gap-[12px] items-center justify-start pl-[4px]"
               style={{
                  height: `calc(${SIZES.min.h} - 2px)`,
               }}
            >
               <div
                  ref={dragRef}
                  className={`relative grid place-items-center rounded-lg text-xl cursor-move ${
                     isDragging
                        ? "bg-gray-50/90 text-gray-950"
                        : "bg-gray-950/20 text-gray-50 hover:bg-gray-50/90  hover:text-gray-950"
                  } transition-all duration-200`}
                  style={{
                     width: `calc(${SIZES.min.h} - 8px)`,
                     aspectRatio: "1 / 1",
                  }}
               >
                  <TiArrowMoveOutline />
               </div>

               <div
                  onClick={toggleChat}
                  className={`relative grid place-items-center rounded-lg text-xl cursor-pointer transition-all duration-200 ${
                     isChatOpen
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-950/20 text-gray-50 hover:bg-gray-950/40 hover:text-gray-300"
                  }`}
                  style={{
                     width: `calc(${SIZES.min.h} - 8px)`,
                     aspectRatio: "1 / 1",
                  }}
               >
                  <RiChatVoiceAiLine />
               </div>

               <div
                  className="relative grid place-items-center bg-gray-950/20 rounded-lg text-xl cursor-pointer hover:bg-gray-950/40 text-gray-50 hover:text-gray-300 transition-all duration-200"
                  // onClick={handleSelectText}
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
                        className="relative grid place-items-center bg-gray-950/20 rounded-lg text-xl cursor-pointer hover:bg-red-700 text-red-500 hover:text-white transition-all duration-200"
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

            <div
               className={`relative overflow-hidden transition-all duration-300 ease-in-out`}
               style={{
                  opacity: isChatOpen ? 1 : 0,
                  height: isChatOpen ? `100%` : "0px",
               }}
            >
               <div className="h-full">
                  <ChatBot isOpen={isChatOpen} />
               </div>
            </div>
         </main>
      </div>
   );
}
