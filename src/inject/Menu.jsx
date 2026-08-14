import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiMinimize } from "react-icons/fi";
import { LuTextSelect } from "react-icons/lu";
import { RiChatVoiceAiLine } from "react-icons/ri";
import { TiArrowMoveOutline } from "react-icons/ti";
import ChatBot from "../components/ChatBot";
import ES from "./../utils/utilsModule.js";

export default function Menu() {
   const SIZES = useMemo(
      () => ({
         min: { w: "160px", h: "50px" },
         max: { w: "480px", h: "640px" },
      }),
      []
   );

   // State
   const [isChatOpen, setIsChatOpen] = useState(false);
   const [size, setSize] = useState(SIZES.min);
   const [menuOpacity, setMenuOpacity] = useState("1");
   const [isDragging, setIsDragging] = useState(false);
   const [uiContrast, setUiContrast] = useState("medium");
   const [autoHideDelay, setAutoHideDelay] = useState(0);
   const menuRef = useRef(null);
   const dragRef = useRef(null);

   useEffect(() => {
      ES.pageOnMessage("C_IF_OPEN_CHAT", () => {
         setIsChatOpen(true);
         setMenuOpacity("1");
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

      ES.pageOnMessage("C_IF_MENU_WINDOW_DRAG_START", () => {
         setIsDragging(true);
      });

      ES.pageOnMessage("C_IF_MENU_WINDOW_DRAG_END", () => {
         setIsDragging(false);
      });

      ES.pageOnMessage("IF_C_GET_CURRENT_CONTROLS", (data) => {
         const { uiContrast: contrast, autoHideDelay: delay } = data?.controls || {};
         if (contrast) setUiContrast(contrast);
         if (delay !== undefined) setAutoHideDelay(Number(delay) || 0);
      });

      ES.chromeStorageGetLocal(ES.KEYS.CONTROLS, (data) => {
         if (data?.uiContrast) setUiContrast(data.uiContrast);
         if (data?.autoHideDelay !== undefined) setAutoHideDelay(Number(data.autoHideDelay) || 0);
      });
   }, []);

   // Auto-hide inactivity timer when minimized
   useEffect(() => {
      if (isChatOpen || autoHideDelay <= 0) {
         setMenuOpacity("1");
         return;
      }

      let timer = setTimeout(() => {
         setMenuOpacity("0.2");
      }, autoHideDelay * 1000);

      const handleUserActivity = () => {
         setMenuOpacity("1");
         clearTimeout(timer);
         timer = setTimeout(() => {
            setMenuOpacity("0.2");
         }, autoHideDelay * 1000);
      };

      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("pointerdown", handleUserActivity);

      return () => {
         clearTimeout(timer);
         window.removeEventListener("mousemove", handleUserActivity);
         window.removeEventListener("pointerdown", handleUserActivity);
      };
   }, [isChatOpen, autoHideDelay]);

   useEffect(() => {
      setSize(isChatOpen ? SIZES.max : SIZES.min);
   }, [isChatOpen, SIZES]);

   useEffect(() => {
      const isOpen = parseInt(size.w) > 160;
      ES.pagePostMessage(
         "IF_C_MENU_WINDOW_RESIZE",
         {
            width: size.w,
            height: size.h,
            isOpen,
         },
         window.parent
      );

      if (isOpen) {
         ES.pagePostMessage("IF_C_GET_CURRENT_CONTROLS", {}, window.parent);
      }
   }, [size]);

   // Prevent scroll propagation to parent document
   useEffect(() => {
      const stopPropagation = (e) => {
         e.stopPropagation();
      };

      window.addEventListener("wheel", stopPropagation, { passive: false });
      window.addEventListener("scroll", stopPropagation, { passive: false });
      window.addEventListener("touchmove", stopPropagation, { passive: false });

      return () => {
         window.removeEventListener("wheel", stopPropagation, {
            passive: false,
         });
         window.removeEventListener("scroll", stopPropagation, {
            passive: false,
         });
         window.removeEventListener("touchmove", stopPropagation, {
            passive: false,
         });
      };
   }, []);

   const toggleChat = useCallback(() => {
      if (!isChatOpen) {
         setIsChatOpen(true);
      } else {
         setIsChatOpen(false);
      }
   }, [isChatOpen]);

   const handleSelectText = useCallback(() => {
      ES.pagePostMessage("IF_C_SELECT_TEXT", {}, window.parent);
      setMenuOpacity("0");
   }, []);

   // Render UI
   return (
      <div
         className="absolute transition-all duration-300 ease-in-out"
         ref={menuRef}
         style={{ zIndex: 1, opacity: menuOpacity }}
      >
         <main
            data-contrast={uiContrast}
            className={`relative left-[1px] top-[1px] rounded-xl shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${
               uiContrast === "low"
                  ? "backdrop-blur-md bg-blue-500/10 dark:bg-slate-950/35 border border-white/40 dark:border-white/15"
                  : uiContrast === "high"
                  ? "backdrop-blur-2xl bg-white/95 dark:bg-[#18181b]/95 border border-gray-300 dark:border-zinc-700 shadow-2xl text-gray-900 dark:text-white"
                  : "backdrop-blur-xl bg-blue-500/15 dark:bg-blue-600/10 border border-white/80 dark:border-white/40"
            }`}
            style={{
               width: `calc(${size.w} - 2px)`,
               height: `calc(${size.h} - 2px)`,
            }}
         >
            {/* Fixed header */}
            <section
               className={`relative h-[inherit] flex w-full items-center justify-between pl-[4px] pr-[4px] border-b transition-colors duration-300 ${
                  uiContrast === "high"
                     ? "bg-gray-100/90 dark:bg-zinc-800/90 border-gray-200 dark:border-zinc-700"
                     : "bg-white/10 dark:bg-black/10 border-white/30 dark:border-white/20"
               }`}
               style={{ height: `${parseInt(SIZES.min.h) - 2}px` }}
            >
               {/* Left side buttons */}
               <div className="flex items-center gap-[12px]">
                  <div
                     onClick={toggleChat}
                     className={`mainBtn ${
                        isChatOpen
                           ? "bg-blue-500/60 dark:bg-blue-500/60 text-white dark:text-white"
                           : "bg-white/15 dark:bg-black/15 text-gray-700 dark:text-gray-200"
                     }`}
                     style={{
                        width: `calc(${SIZES.min.h} - 8px)`,
                        aspectRatio: "1 / 1",
                     }}
                  >
                     <RiChatVoiceAiLine />
                  </div>

                  <div
                     className="mainBtn bg-white/15 dark:bg-black/15 text-gray-700 dark:text-gray-200"
                     onClick={handleSelectText}
                     style={{
                        width: `calc(${SIZES.min.h} - 8px)`,
                        aspectRatio: "1 / 1",
                     }}
                  >
                     <LuTextSelect />
                  </div>
               </div>

               {/* Center - Move button (flex-grow when chat is open) */}
               <div
                  className={`flex items-center ${
                     isChatOpen ? "flex-1 justify-center mx-[12px]" : ""
                  }`}
               >
                  <div
                     ref={dragRef}
                     className={`mainBtn ${
                        isDragging
                           ? "bg-blue-500/60 dark:bg-blue-500/60 text-white dark:text-white"
                           : "bg-white/15 dark:bg-black/15 text-gray-700 dark:text-gray-200"
                     }`}
                     style={{
                        width: isChatOpen
                           ? "100%"
                           : `calc(${SIZES.min.h} - 8px)`,
                        minWidth: `calc(${SIZES.min.h} - 8px)`,
                        aspectRatio: isChatOpen ? "auto" : "1 / 1",
                        height: `calc(${SIZES.min.h} - 8px)`,
                     }}
                  >
                     <TiArrowMoveOutline />
                  </div>
               </div>

               {/* Right side - Minimize button (only when chat is open) */}
               {isChatOpen && (
                  <div
                     onClick={toggleChat}
                     className="mainBtn bg-white/15 dark:bg-black/15 text-gray-700 dark:text-gray-200"
                     title="Minimize chat"
                     style={{
                        width: `calc(${SIZES.min.h} - 8px)`,
                        aspectRatio: "1 / 1",
                     }}
                  >
                     <FiMinimize />
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
                  <ChatBot isOpen={isChatOpen} uiContrast={uiContrast} />
               </div>
            </div>
         </main>
      </div>
   );
}
