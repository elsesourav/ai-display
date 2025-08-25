import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoClose } from "react-icons/io5";
import { LuTextSelect } from "react-icons/lu";
import { RiChatVoiceAiLine } from "react-icons/ri";
import { TiArrowMoveOutline } from "react-icons/ti";
import ChatBot from "../components/ChatBot";
import extensionUtils from "./../utils/utilsModule.js";

export default function Menu() {
   // Constants
   const MARGIN = 0;
   const INACTIVITY_TIMEOUT = 30000;
   const ANIMATION_DURATION = 400;

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
   const [isTransparent, setIsTransparent] = useState(false);
   const [position, setPosition] = useState({ x: MARGIN, y: MARGIN });
   const [originalPosition, setOriginalPosition] = useState(null);
   const [isRepositioning, setIsRepositioning] = useState(false);
   const [isHidden, setIsHidden] = useState(false);
   const [isDragging, setIsDragging] = useState(false);

   // Refs
   const mainRef = useRef(null);
   const moveElementRef = useRef(null);
   const isDraggingRef = useRef(false);
   const dragOffsetRef = useRef({ x: 0, y: 0 });
   const inactivityTimerRef = useRef(null);

   useEffect(() => {
      extensionUtils.pageOnMessage("C_I_OPEN_CHAT", () => {
         setIsChatOpen(true);
      });
      extensionUtils.pageOnMessage("C_I_CLOSE_CHAT", () => {
         setIsChatOpen(false);
      });

      extensionUtils.pageOnMessage("C_I_HIDDEN", () => {
         setIsHidden(true);
      });
      extensionUtils.pageOnMessage("C_I_VISIBLE", () => {
         setIsHidden(false);
      });

      extensionUtils.pageOnMessage("C_I_POSITION_RESTORE", (pos) => {
         setPosition(pos);
      });
   }, []);


   useEffect(() => {
      extensionUtils.pagePostMessage("I_C_CHAT_TOGGLE", isChatOpen, window.parent);
   }, [isChatOpen]);

   // Position Management
   const calculateOnScreenPosition = useCallback(
      (rect, currentPosition, width, height) => {
         let newX = currentPosition.x;
         let newY = currentPosition.y;

         if (rect.left + width > window.innerWidth - MARGIN) {
            newX = window.innerWidth - width - MARGIN;
         }
         if (rect.left < MARGIN) {
            newX = MARGIN;
         }
         if (rect.top + height > window.innerHeight - MARGIN) {
            newY = window.innerHeight - height - MARGIN;
         }
         if (rect.top < MARGIN) {
            newY = MARGIN;
         }

         return { x: newX, y: newY };
      },
      []
   );

   const animateRepositioning = useCallback(
      (newPosition) => {
         setIsRepositioning(true);
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               setPosition(newPosition);
               setTimeout(() => {
                  setIsRepositioning(false);
               }, ANIMATION_DURATION);
            });
         });
      },
      [ANIMATION_DURATION]
   );

   const ensureVisibleOnScreen = useCallback(() => {
      if (!mainRef.current) return;

      const rect = mainRef.current.getBoundingClientRect();
      const maxWidth = parseInt(SIZES.max.w);
      const maxHeight = parseInt(SIZES.max.h);

      const newPosition = calculateOnScreenPosition(
         rect,
         position,
         maxWidth,
         maxHeight
      );
      const needsRepositioning =
         newPosition.x !== position.x || newPosition.y !== position.y;

      if (needsRepositioning) {
         if (!originalPosition) {
            setOriginalPosition({ x: position.x, y: position.y });
         }
         animateRepositioning(newPosition);
      }
   }, [
      SIZES.max.w,
      SIZES.max.h,
      position,
      originalPosition,
      calculateOnScreenPosition,
      animateRepositioning,
   ]);

   useEffect(() => {
      setSize(isChatOpen ? SIZES.max : SIZES.min);

      if (isChatOpen) {
         ensureVisibleOnScreen();
      }
   }, [isChatOpen, SIZES, ensureVisibleOnScreen]);

   // Inactivity Management
   const resetInactivityTimer = useCallback(() => {
      if (inactivityTimerRef.current) {
         clearTimeout(inactivityTimerRef.current);
      }
      setIsTransparent(false);
      inactivityTimerRef.current = setTimeout(() => {
         setIsTransparent(true);
         setIsChatOpen(false);
      }, INACTIVITY_TIMEOUT);
   }, [INACTIVITY_TIMEOUT]);

   // Drag Handling
   const calculateDragPosition = useCallback(
      (e) => {
         let newLeft = e.clientX - dragOffsetRef.current.x;
         let newTop = e.clientY - dragOffsetRef.current.y;

         const currentWidth = parseInt(isChatOpen ? SIZES.max.w : SIZES.min.w);
         const currentHeight = parseInt(isChatOpen ? SIZES.max.h : SIZES.min.h);

         const maxLeft = window.innerWidth - currentWidth - MARGIN;
         const maxTop = window.innerHeight - currentHeight - MARGIN;

         newLeft = Math.max(MARGIN, Math.min(newLeft, maxLeft));
         newTop = Math.max(MARGIN, Math.min(newTop, maxTop));

         return { x: newLeft, y: newTop };
      },
      [isChatOpen, SIZES]
   );

   useEffect(() => {
      const moveElement = moveElementRef.current;
      if (!moveElement) return;

      const handleMouseDown = (e) => {
         extensionUtils.pagePostMessage("I_C_POSITION_SET", {}, window.parent);

         isDraggingRef.current = true;
         setIsDragging(true);
         const rect = moveElement.getBoundingClientRect();
         dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
         };
         e.preventDefault();
      };

      const handleMouseMove = (e) => {
         if (!isDraggingRef.current) return;
         resetInactivityTimer();
         const newPosition = calculateDragPosition(e);
         extensionUtils.pagePostMessage("I_C_POSITION_LIVE", newPosition, window.parent);
         setPosition(newPosition);
      };

      const handleMouseUp = () => {
         extensionUtils.pagePostMessage("I_C_POSITION_RESTORE", {}, window.parent);
         setTimeout(() => {
            setPosition({ x: 0, y: 0 });
         }, 30);

         isDraggingRef.current = false;
         setIsDragging(false);
         resetInactivityTimer();
      };

      moveElement.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
         moveElement.removeEventListener("mousedown", handleMouseDown);
         document.removeEventListener("mousemove", handleMouseMove);
         document.removeEventListener("mouseup", handleMouseUp);

         if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
         }
      };
   }, [isChatOpen, SIZES, resetInactivityTimer, calculateDragPosition]);

   // Activity Monitoring
   useEffect(() => {
      resetInactivityTimer();

      const handleUserActivity = () => {
         resetInactivityTimer();
      };

      document.addEventListener("mousemove", handleUserActivity);
      document.addEventListener("mousedown", handleUserActivity);
      document.addEventListener("keydown", handleUserActivity);
      document.addEventListener("touchstart", handleUserActivity);
      return () => {
         if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
         }

         document.removeEventListener("mousemove", handleUserActivity);
         document.removeEventListener("mousedown", handleUserActivity);
         document.removeEventListener("keydown", handleUserActivity);
         document.removeEventListener("touchstart", handleUserActivity);
      };
   }, [resetInactivityTimer]);

   // Chat Management
   const handleCloseChat = useCallback(() => {
      setIsChatOpen(false);

      if (originalPosition) {
         setIsRepositioning(true);
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               setPosition(originalPosition);
               setTimeout(() => {
                  setIsRepositioning(false);
                  setOriginalPosition(null);
               }, ANIMATION_DURATION);
            });
         });
      }
   }, [originalPosition, ANIMATION_DURATION]);

   const toggleChat = useCallback(() => {
      if (!isChatOpen) {
         setIsChatOpen(true);
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               ensureVisibleOnScreen();
            });
         });
      } else {
         handleCloseChat();
      }

   }, [isChatOpen, ensureVisibleOnScreen, handleCloseChat]);

   const handleSelectText = useCallback(() => {
      extensionUtils.pagePostMessage("I_C_SELECT_TEXT", {}, window.parent);
   }, []);

   // Render UI
   return (
      <div
         className="fixed p-[2px]"
         id="main"
         style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            zIndex: 9999,
            opacity: isTransparent || isDragging ? 0.4 : isHidden ? 0 : 1,
            transition:
               isRepositioning &&
               "opacity 0.3s ease-in-out, top 0.7s cubic-bezier(0.25, 0.1, 0.25, 1), left 0.7s cubic-bezier(0.25, 0.1, 0.25, 1)",
            // : isDragging
            // ? "opacity 0.3s ease-in-out"
            // : "opacity 0.3s ease-in-out, top 0.3s ease-out, left 0.3s ease-out",
         }}
         onMouseEnter={() => setIsTransparent(false)}
         onMouseLeave={() => !isDragging && resetInactivityTimer()}
      >
         <main
            ref={mainRef}
            className={`relative grid bg-gradient-to-bl from-[#ffe4e6] to-[#ccfbf1] dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600 rounded-md shadow-md outline-1 outline-white dark:outline-blue-500 overflow-hidden transition-all duration-300 ease-in-out`}
            style={{
               width: `calc(${size.w} - 4px)`,
               height: `calc(${size.h} - 4px)`,
               gridTemplateRows: "auto 1fr",
            }}
         >
            <section
               className="relative flex justify-between items-center"
               style={{
                  height: `calc(${SIZES.min.h} - 4px)`,
                  width: isChatOpen
                     ? `calc(${SIZES.max.w} - 4px)`
                     : `calc(${SIZES.min.w} - 4px)`,
               }}
            >
               <div
                  className="relative h-full flex justify-between items-center p-1"
                  id="header"
                  style={{ width: `calc(${SIZES.min.w} - 4px)` }}
               >
                  <div
                     ref={moveElementRef}
                     className="relative w-[30%] h-full grid place-items-center bg-gray-950/20 rounded-lg text-2xl cursor-move hover:bg-gray-50/90 text-gray-50 hover:text-gray-950 transition-all duration-200"
                  >
                     <TiArrowMoveOutline />
                  </div>

                  <div
                     onClick={toggleChat}
                     className={`relative w-[30%] h-full grid place-items-center rounded-lg text-2xl cursor-pointer transition-all duration-200 ${
                        isChatOpen
                           ? "bg-blue-500 text-white hover:bg-blue-600"
                           : "bg-gray-950/20 text-gray-50 hover:bg-gray-950/40 hover:text-gray-300"
                     }`}
                  >
                     <RiChatVoiceAiLine />
                  </div>

                  <div className="relative w-[30%] h-full grid place-items-center bg-gray-950/20 rounded-lg text-2xl cursor-pointer hover:bg-gray-950/40 text-gray-50 hover:text-gray-300 transition-all duration-200" onClick={handleSelectText}>
                     <LuTextSelect />
                  </div>
               </div>

               {isChatOpen && (
                  <div className="relative h-full p-1">
                     <div
                        onClick={handleCloseChat}
                        className="relative h-full aspect-[7/6] grid place-items-center bg-red-500 rounded-lg text-3xl cursor-pointer hover:bg-red-700 text-white transition-all duration-200"
                        title="Close chat"
                     >
                        <IoClose />
                     </div>
                  </div>
               )}
            </section>

            <div
               className={`relative overflow-hidden transition-all duration-300 ease-in-out ${
                  isChatOpen ? "opacity-100" : "opacity-0 max-h-0"
               }`}
               style={{
                  maxHeight: isChatOpen
                     ? `calc(${SIZES.max.h} - ${SIZES.min.h} - 4px)`
                     : "0",
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
